import { Actor, CollisionGroupManager, CollisionType, Color, Input, Physics, vec, Vector } from 'excalibur';
import { normalizeAndScale } from '../../helpers/normalize-and-scale';
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

        let newX: number = 0;
        let newY: number = 0;

        // Reset velocity
        if (this.state !== 'lost') {
            newX = 0;
            newY = 0;
        }

        // Player input
        if (engine.input.keyboard.isHeld(Input.Keys.Left)) {
            newX = -1;
        }

        if (engine.input.keyboard.isHeld(Input.Keys.Right)) {
            newX = 1;
        }

        if (engine.input.keyboard.isHeld(Input.Keys.Up)) {
            newY = -1;
        }

        if (engine.input.keyboard.isHeld(Input.Keys.Down)) {
            newY = 1;
        }

        const normalizedVector = normalizeAndScale(newX, newY, 350);
        this.vel.x = normalizedVector.x;
        this.vel.y = normalizedVector.y;
    }
}
