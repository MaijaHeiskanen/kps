import {
    Actor,
    CollisionGroupManager,
    CollisionType,
    Color,
    GamepadAxisEvent,
    Input,
    Physics,
    vec,
    Vector,
} from 'excalibur';
import { Gamepad } from 'excalibur/build/dist/Input/Gamepad';
import { normalizeAndScale } from '../../helpers/normalize-and-scale';
import { Resources } from '../../resources';
import { BasePlayer } from '../base-player/base-player';
import { Bot } from '../bot/bot';

export class Player extends BasePlayer {
    private gamepad: Gamepad;
    private controlStyle: ControlType = 'gamepad'; // Change to 'keyboard' to control with keyboard

    constructor(gamepad: Gamepad) {
        super({
            name: 'Player',
            pos: vec(500, 500),
        });

        this.gamepad = gamepad;

        this.onAxis = this.onAxis.bind(this);
    }

    onInitialize() {
        // this.graphics.use(Resources.Sword.toSprite());
        this.setWeapon('rock');
        this.on('postcollision', (evt) => this.onPostCollision(evt));

        this.gamepad.on('axis', this.onAxis);

        super.onInitialize();
    }

    onAxis(ev: GamepadAxisEvent) {
        const value = ev.value;

        if (Math.abs(value) > -1) {
            console.log(ev.target.getAxes(Input.Axes.LeftStickX), ev.target.getAxes(Input.Axes.LeftStickY));
        }
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

        const controlStyle = this.controlStyle;

        if (controlStyle === 'keyboard') {
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
        } else if (controlStyle === 'gamepad') {
            const gamepad = this.gamepad;
            newX = gamepad.getAxes(Input.Axes.LeftStickX);
            newY = gamepad.getAxes(Input.Axes.LeftStickY);
        }

        const normalizedVector = normalizeAndScale(newX, newY, 350);
        this.vel.x = normalizedVector.x;
        this.vel.y = normalizedVector.y;
    }
}
