import { Actor, CollisionGroupManager, CollisionType, Color, Input, vec, Vector } from 'excalibur';
import { Resources } from '../../resources';
import { BasePlayer } from '../base-player/base-player';

export class Bot extends BasePlayer {
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
        this.setWeapon('scissors');
        this.patrol();

        super.onInitialize();
    }

    public patrol() {
        this.actions.clearActions();
        this.actions.repeatForever((ctx) => {
            ctx.moveTo(100, 300, 120)
                .delay(1)
                .moveTo(500, 500, 120)
                .delay(1)
                .moveTo(800, 500, 120)
                .delay(1)
                .moveTo(1300, 200, 120)
                .delay(1)
                .moveTo(1200, 700, 120)
                .delay(1)
                .moveTo(900, 900, 120)
                .delay(1)
                .moveTo(600, 800, 120);
        });
    }
}
