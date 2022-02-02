import { Actor, CollisionGroupManager, CollisionType, Color, Input, Physics, vec, Vector } from 'excalibur';
import { Resources } from '../../resources';
import { BasePlayer } from '../base-player/base-player';
import { Bot } from '../bot/bot';

export class Player extends BasePlayer {
    constructor() {
        super({
            name: 'Player',
            pos: vec(500, 500),
        });
    }

    onInitialize() {
        // this.graphics.use(Resources.Sword.toSprite());
        this.setWeapon('rock');
        this.on('postcollision', (evt) => this.onPostCollision(evt));

        super.onInitialize();
    }

    onPreUpdate(engine: ex.Engine, delta: number) {
        super.onPreUpdate(engine, delta);

        // Reset velocity
        if (this.state !== 'lost') {
            this.vel.x = 0;
            this.vel.y = 0;
        }

        // Player input
        if (engine.input.keyboard.isHeld(Input.Keys.Left)) {
            this.vel.x = -250;
        }

        if (engine.input.keyboard.isHeld(Input.Keys.Right)) {
            this.vel.x = 250;
        }

        if (engine.input.keyboard.isHeld(Input.Keys.Up)) {
            this.vel.y = -250;
        }

        if (engine.input.keyboard.isHeld(Input.Keys.Down)) {
            this.vel.y = 250;
        }
    }
}
