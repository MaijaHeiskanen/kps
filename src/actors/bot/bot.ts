import { Actor, CollisionGroupManager, CollisionType, Color, Input, vec, Vector } from 'excalibur';
import { Resources } from '../../resources';
import { BasePlayer } from '../base-player/base-player';

export class Bot extends BasePlayer {
    constructor() {
        super({
            pos: vec(700, 700),
        });
    }

    onInitialize() {
        this.patrol();

        super.onInitialize();
    }

    public patrol() {
        // clear existing queue
        this.actions.clearActions();
        // guard a choke point
        // move to 100, 100 and take 1.2s
        // wait for 3s
        // move back to 0, 100 and take 1.2s
        // wait for 3s
        // repeat
        this.actions.repeatForever((ctx) => {
            ctx.moveTo(800, 800, 120).delay(1).moveTo(700, 700, 120).delay(1);
        });
    }
}
