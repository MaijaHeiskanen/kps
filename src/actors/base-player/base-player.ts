import { Actor, ActorArgs, CollisionGroupManager, CollisionType, Color } from 'excalibur';
import { Player } from '../player/player';

export class BasePlayer extends Actor {
    private state: 'won' | 'lost' | null = null;
    private stateTime: number = 0;

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

    setCollision(value: boolean) {
        const collisionType = value ? CollisionType.Active : CollisionType.PreventCollision;

        this.body.collisionType = collisionType;
    }

    setWonState() {
        this.color = Color.Green;
        this.state = 'won';
        this.stateTime = 2000;
        // Change sprite?
        // Sound effect?
    }

    setLostState() {
        this.setCollision(false);
        this.state = 'lost';
        this.stateTime = 2000;
        this.color = Color.Red;
        // Change sprite?
        // Sound effect?
    }

    setDefaultState() {
        this.setCollision(true);
        this.state = null;
        this.stateTime = 0;
        this.color = Color.Yellow;
        // Change sprite?
        // Sound effect?
    }

    onInitialize() {
        this.on('postcollision', (evt) => this.onPostCollision(evt));
    }

    onPostCollision(evt: ex.PostCollisionEvent) {
        const other = evt.other;

        if (other instanceof BasePlayer) {
            if (this instanceof Player) {
                this.setWonState();
            } else {
                this.setLostState();
            }
        }
    }

    onPreUpdate(engine: ex.Engine, delta: number) {
        if (this.stateTime >= 0 && this.state) {
            this.stateTime -= delta;

            if (this.stateTime <= 0) {
                this.setDefaultState();
            }
        }
    }
}
