import { Actor, CollisionGroupManager, CollisionType, Color, Input, vec, Vector } from 'excalibur';
import { Resources } from '../../resources';
import { BasePlayer } from '../base-player/base-player';

export class Bot extends BasePlayer {
    private movementSpeed = 200;
    constructor(startPosition: Vector) {
        super({
            pos: startPosition,
        });
    }

    setDefaultState() {
        this.setCollision(true);
        this.state = null;
        this.stateTime = 0;
        this.color = Color.Yellow;
        this.vel = new Vector(0, 0);
        // Change sprite?

        this.patrol();
    }

    onInitialize() {
        super.onInitialize();
        this.setWeapon('scissors');
        this.patrol();
    }

    public patrol() {
        this.actions.clearActions();
        this.actions.repeatForever((ctx) => {
            ctx.moveTo(100, 650, this.movementSpeed)
                .delay(1)
                .moveTo(500, 500, this.movementSpeed)
                .delay(1)
                .moveTo(800, 500, this.movementSpeed)
                .delay(1)
                .moveTo(1300, 200, this.movementSpeed)
                .delay(1)
                .moveTo(1200, 700, this.movementSpeed)
                .delay(1)
                .moveTo(1400, 800, this.movementSpeed)
                .delay(1)
                .moveTo(900, 900, this.movementSpeed)
                .delay(1)
                .moveTo(600, 800, this.movementSpeed);
        });
    }
}
