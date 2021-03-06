import {
    Actor,
    ActorArgs,
    Animation,
    CollisionGroupManager,
    CollisionType,
    Color,
    Frame,
    GraphicsGroup,
    range,
    Sprite,
    SpriteSheet,
    vec,
    Vector,
} from 'excalibur';
import { normalizeAndScale } from '../../helpers/normalize-and-scale';
import { shallowEqual } from '../../helpers/shallow-equal';
import { Resources } from '../../resources';
import { getWeaponList } from './weapon';

export class BasePlayer extends Actor {
    protected state: PlayerState = null;
    protected stateTime: number = 0;
    protected weapon: Weapon;
    protected weaponChangeCooldown: number = 0;
    protected score: number = 0;
    protected inFight: boolean = false;
    protected immutableSpriteChangedDatetime: Date = null;
    protected animation: PlayerAnimation;
    protected circle: string;
    protected weaponChanged: boolean = false;

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
        this.weaponChanged = true;
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

    changeAnimation() {
        const graphichsGroup = new GraphicsGroup({
            members: [
                {
                    graphic: this.graphics.use(this.animation),
                    pos: vec(10, 10),
                },
                {
                    graphic: this.graphics.use(this.circle),
                    pos: vec(0, 0),
                },
                {
                    graphic: this.graphics.use(this.weapon),
                    pos: vec(40, -50),
                },
            ],
        });

        this.graphics.use(graphichsGroup);
    }

    getPlayerSprites() {
        const playerSpriteSheetImage = Resources.Player;
        const playerSheets = [];
        const xGap = 18;
        const yGap = 18;
        const width = 64 - 2 * xGap;
        const height = 64 - 2 * yGap;
        const rows = 12;
        const columns = 8;

        for (let i = 0; i < rows; i++) {
            for (let ii = 0; ii < columns; ii++) {
                const sprite = new Sprite({
                    image: playerSpriteSheetImage,
                    sourceView: {
                        x: xGap + ii * 64,
                        y: yGap + i * 64,
                        height: height,
                        width: width,
                    },
                    destSize: {
                        width: 100,
                        height: 100,
                    },
                });

                playerSheets.push(sprite);
            }
        }

        return playerSheets;
    }

    getAnimation(sprites: Sprite[], duration: number = 80) {
        const frames: Frame[] = [];

        for (let i = 0, len = sprites.length; i < len; i++) {
            frames.push({
                graphic: sprites[i],
                duration: duration,
            });
        }

        return new Animation({ frames });
    }

    initGraphichs() {
        const playerSheets = this.getPlayerSprites();

        const idle = playerSheets.slice(0, 4);
        const rundown = playerSheets.slice(32, 40);
        const runUp = playerSheets.slice(40, 48);
        const runRight = playerSheets.slice(48, 56);
        const runLeft = playerSheets.slice(56, 64);

        const idleAnimation = this.getAnimation(idle);
        const rundownAnimation = this.getAnimation(rundown);
        const runUpAnimation = this.getAnimation(runUp);
        const runRightAnimation = this.getAnimation(runRight);
        const runLeftAnimation = this.getAnimation(runLeft);

        this.graphics.add('idle', idleAnimation);
        this.graphics.add('runDown', rundownAnimation);
        this.graphics.add('runUp', runUpAnimation);
        this.graphics.add('runRight', runRightAnimation);
        this.graphics.add('runLeft', runLeftAnimation);

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

        this.animation = 'idle';
        this.weapon = 'paper';
        this.circle = 'circle';

        this.changeAnimation();
    }

    normalizeAndSetVelocity(velocity: Vector, length: number = 350) {
        const normalizedVector = normalizeAndScale(velocity.x, velocity.y, length);
        this.vel.x = normalizedVector.x;
        this.vel.y = normalizedVector.y;
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
            } else if (fightResult === -1 || fightResult === 0) {
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

        const oldAnimation = this.animation;
        const angle = this.vel.toAngle();
        const pi = 3.14;

        if (this.vel.x === 0 && this.vel.y === 0) {
            this.animation = 'idle';
        } else if (angle > -pi / 4 && angle < pi / 4) {
            this.animation = 'runRight';
        } else if (angle > (-3 * pi) / 4 && angle < -pi / 4) {
            this.animation = 'runUp';
        } else if (angle < (-3 * pi) / 4 || angle > (3 * pi) / 4) {
            this.animation = 'runLeft';
        } else if (angle > pi / 4 && angle < (3 * pi) / 4) {
            this.animation = 'runDown';
        }

        if (oldAnimation !== this.animation || this.weaponChanged) {
            this.changeAnimation();
            this.weaponChanged = false;
        }
    }
}
