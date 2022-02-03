import { Actor, ActorArgs, CollisionGroupManager, CollisionType, Color, GraphicsGroup, vec, Vector } from 'excalibur';
import { shallowEqual } from '../../helpers/shallow-equal';
import { Resources } from '../../resources';
import { getWeaponList } from './weapon';

export class BasePlayer extends Actor {
    protected state: 'won' | 'lost' | 'immunity' | null = null;
    protected stateTime: number = 0;
    protected weapon: Weapon;
    protected weaponChangeCooldown: number = 0;
    protected score: number = 0;
    protected inFight: boolean = false;
    protected immutableSpriteChangedDatetime: Date = null;

    constructor(config: ActorArgs) {
        super({
            name: 'BasePlayer',
            radius: 60,
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

    setWeaponNext() {
        const ownWeapon = this.weapon;
        const weaponList = getWeaponList();
        const weaponListLength = weaponList.length;
        const idx = weaponList.indexOf(ownWeapon);
        const isLastWeaponInTheList = idx === weaponListLength - 1;

        if (isLastWeaponInTheList) {
            this.setWeapon(weaponList[0]);
        } else {
            this.setWeapon(weaponList[idx + 1]);
        }
    }

    setWeapon(weapon: Weapon) {
        if (this.weaponChangeCooldown > 0) {
            return;
        }

        this.weaponChangeCooldown = 2000;
        this.weapon = weapon;

        const group = new GraphicsGroup({
            members: [
                {
                    graphic: this.graphics.getGraphic('circle'),
                    pos: vec(0, 0),
                },
                {
                    graphic: this.graphics.getGraphic(weapon),
                    pos: vec(40, 40),
                },
            ],
        });

        this.graphics.use(group);
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

    initGraphichs() {
        const circleSprite = Resources.Circle.toSprite();
        circleSprite.width = 120;
        circleSprite.height = 120;
        this.graphics.add('circle', circleSprite);

        const scissorsSprite = Resources.Scissors.toSprite();
        scissorsSprite.width = 40;
        scissorsSprite.height = 40;
        this.graphics.add('scissors', scissorsSprite);

        const rockSprite = Resources.Rock.toSprite();
        rockSprite.width = 40;
        rockSprite.height = 40;
        this.graphics.add('rock', rockSprite);

        const paperSprite = Resources.Paper.toSprite();
        paperSprite.width = 40;
        paperSprite.height = 40;
        this.graphics.add('paper', paperSprite);

        // const runSpriteSheet = SpriteSheet.fromImageSource({
        //     image: Resources.PlayerRunTest,
        //     grid: {
        //         rows: 1,
        //         columns: 21,
        //         spriteWidth: 96,
        //         spriteHeight: 96,
        //     },
        // });

        // const runAnimation = Animation.fromSpriteSheet(runSpriteSheet, range(1, 10), 80);

        // this.graphics.add('test', runAnimation);

        // const group = new GraphicsGroup({
        //     members: [
        //         {
        //             graphic: runAnimation,
        //             pos: vec(12, 12),
        //         },
        //         {
        //             graphic: circleSprite,

        //             pos: vec(0, 0),
        //         },
        //         {
        //             graphic: scissorsSprite,
        //             pos: vec(40, -50),
        //         },
        //     ],
        // });

        // this.graphics.add('group', group);
        // this.graphics.use(group);
    }

    onInitialize() {
        this.on('postcollision', (evt) => this.onPostCollision(evt));
        this.on('collisionend', (evt) => this.onCollisionEnd(evt));

        this.initGraphichs();
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
        if (this.stateTime > 0 && this.state) {
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

        if (this.weaponChangeCooldown > 0) {
            this.weaponChangeCooldown -= delta;
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
