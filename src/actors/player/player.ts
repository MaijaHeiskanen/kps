import { Actor, CollisionGroupManager, CollisionType, Color, Input, Physics, vec, Vector } from 'excalibur';
import { Resources } from '../../resources';
import { BasePlayer } from '../base-player/base-player';
import { Bot } from '../bot/bot';

export class Player extends BasePlayer {
    private launched = false;
    private launchPosition: number = null;

    constructor() {
        super({
            name: 'Player',
            pos: vec(500, 500),
        });
    }

    onInitialize() {
        // this.graphics.use(Resources.Sword.toSprite());
        this.on('postcollision', (evt) => this.onPostCollision(evt));

        super.onInitialize();
    }

    onPostCollision(evt: ex.PostCollisionEvent) {
        super.onPostCollision(evt);
        if (evt.other instanceof Bot) {
            // this.launched = true;
            // // Clear patrolling
            // this.actions.clearActions();
            // // Remove ability to collide
            // this.body.collisionType = CollisionType.PreventCollision;
            // // Launch into air with rotation
            // this.vel = new Vector(0, -300);
            // this.acc = new Vector(0, 100);
            // this.angularVelocity = 2;
            // this.launchPosition = this.pos.y + 1;
        }
    }

    onPreUpdate(engine: ex.Engine, delta: number) {
        super.onPreUpdate(engine, delta);

        const stopFlying = this.launched && Math.abs(this.pos.y - this.launchPosition) < 1;

        // Reset x velocity
        if (!this.launched || stopFlying) {
            this.vel.x = 0;
            this.vel.y = 0;
        }

        if (stopFlying) {
            this.launched = false;
            this.body.collisionType = CollisionType.Active;
            this.acc = new Vector(0, 0);
            this.angularVelocity = 0;
            this.rotation = 0;
        }

        if (this.launched) {
            super.onPreUpdate(engine, delta);
            return;
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
