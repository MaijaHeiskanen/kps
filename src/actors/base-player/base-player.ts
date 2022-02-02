import { Actor, ActorArgs, CollisionGroupManager, CollisionType, Color, Vector } from 'excalibur';
import { shallowEqual } from '../../helpers/shallow-equal';
import { Player } from '../player/player';
import { getWeaponList } from './weapon';

export class BasePlayer extends Actor {
    protected state: 'won' | 'lost' | 'immunity' | null = null;
    protected stateTime: number = 0;
    protected weapon: Weapon;
    protected score: number = 0;
    protected inFight: boolean = false;
    protected immutableSpriteChangedDatetime: Date = null;

    constructor(config: ActorArgs) {
        super({
            name: 'BasePlayer',
            width: 100,
            height: 100,
            color: Color.Yellow,
            collisionType: CollisionType.Active,
            collisionGroup: CollisionGroupManager.groupByName('player'),
            ...config,
        });
    }

    addScore() {
        this.score = this.score + 1;
    }

    public getScore() {
        return this.score;
    }

    setCollision(value: boolean) {
        const collisionType = value ? CollisionType.Active : CollisionType.PreventCollision;

        this.body.collisionType = collisionType;
    }

    setWonState(other: BasePlayer) {
        this.setCollision(false);
        this.color = Color.Green;
        this.state = 'won';
        this.stateTime = 2000;
        this.immutableSpriteChangedDatetime = null;
        // Change sprite?
        // Sound effect?
    }

    setImmunity() {
        this.setDefaultState();
        this.setCollision(false);
        this.state = 'immunity';
        this.stateTime = 2000;
        this.color = Color.White;
        this.immutableSpriteChangedDatetime = new Date();
        // Change sprite?
    }

    setLostState(other: BasePlayer) {
        this.actions.clearActions();
        this.setCollision(false);
        this.state = 'lost';
        this.stateTime = 1000;
        this.color = Color.Red;
        this.immutableSpriteChangedDatetime = null;
        // Change sprite?
        // Sound effect?

        const targetVectorLength = 30;
        const opponentPosition = other.body.pos;
        const ownPosition = this.body.pos;
        const x = ownPosition.x - opponentPosition.x;
        const y = ownPosition.y - opponentPosition.y;
        const force = new Vector(x, y).normalize();

        this.vel.x = force.x * targetVectorLength;
        this.vel.y = force.y * targetVectorLength;
    }

    setDefaultState() {
        this.setCollision(true);
        this.state = null;
        this.stateTime = 0;
        this.color = Color.Yellow;
        this.vel = new Vector(0, 0);
        this.immutableSpriteChangedDatetime = null;
        // Change sprite?
    }

    setWeapon(weapon: Weapon) {
        this.weapon = weapon;
    }

    onFight(other: BasePlayer) {
        const ownWeapon = this.weapon;
        const opponentWeapon = other.weapon;
        const weaponList = getWeaponList();
        const weaponListLength = weaponList.length;

        const ownScore = weaponList.indexOf(ownWeapon) + 1;
        const opponentScore = weaponList.indexOf(opponentWeapon) + 1;

        if (ownScore === 1 && opponentScore === weaponListLength) {
            return 1;
        }

        if (opponentScore === 1 && ownScore === weaponListLength) {
            return -1;
        }

        if (ownScore < opponentScore) {
            return -1;
        }

        if (ownScore > opponentScore) {
            return 1;
        }
    }

    onInitialize() {
        this.on('postcollision', (evt) => this.onPostCollision(evt));
        this.on('collisionend', (evt) => this.onCollisionEnd(evt));
    }

    onPostCollision(evt: ex.PostCollisionEvent) {
        const other = evt.other;

        if (!this.inFight && other instanceof BasePlayer) {
            this.inFight = true;
            const fightResult = this.onFight(other);

            if (fightResult === 1) {
                this.setWonState(other);
                this.addScore();
            } else if (fightResult === -1) {
                this.setLostState(other);
            }
        }
    }

    onCollisionEnd(evt: ex.CollisionEndEvent) {
        this.inFight = false;
    }

    onPreUpdate(engine: ex.Engine, delta: number) {
        if (this.stateTime >= 0 && this.state) {
            this.stateTime -= delta;

            if (this.stateTime <= 0) {
                if (this.state === 'lost') {
                    this.setImmunity();
                    return;
                } else {
                    this.setDefaultState();
                    return;
                }
            }
        }

        if (
            this.state === 'immunity' &&
            this.immutableSpriteChangedDatetime &&
            new Date().getTime() - this.immutableSpriteChangedDatetime.getTime() > 300
        ) {
            this.immutableSpriteChangedDatetime = new Date();
            this.color = shallowEqual(this.color, Color.White) ? Color.LightGray : Color.White;
        }
    }
}
