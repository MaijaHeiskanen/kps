import { Input, vec } from 'excalibur';
import { Gamepad } from 'excalibur/build/dist/Input/Gamepad';
import { normalizeAndScale } from '../../helpers/normalize-and-scale';
import { BasePlayer } from '../base-player/base-player';

export class Player extends BasePlayer {
    private gamepad: Gamepad;
    private controlStyle: ControlType = 'gamepad'; // Change to 'keyboard' to control with keyboard
    private dashTime: number = 0;
    private dashCooldown: number = 0;

    constructor(gamepad: Gamepad) {
        super({
            name: 'Player',
            pos: vec(500, 500),
        });

        this.gamepad = gamepad;
    }

    changeSprite;

    onInitialize() {
        super.onInitialize();
        this.setWeapon('paper');
    }

    onPreUpdate(engine: ex.Engine, delta: number) {
        super.onPreUpdate(engine, delta);

        if (this.dashCooldown > 0) {
            this.dashCooldown -= delta;
        }

        if (this.dashTime > 0) {
            this.dashTime -= delta;
        }

        const isLost = this.state === 'lost';

        if (isLost) {
            return;
        }

        let newX: number = 0;
        let newY: number = 0;

        newX = 0;
        newY = 0;

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
            const changeWeapon = gamepad.getButton(Input.Buttons.Face2);
            const dashButtonActive = Boolean(gamepad.getButton(Input.Buttons.Face1));

            if (this.dashCooldown <= 0 && dashButtonActive) {
                this.dashTime = 1000;
                this.dashCooldown = 3000;
            }

            if (changeWeapon) {
                this.setWeaponNext();
            }
        }

        this.normalizeAndSetVelocity(vec(newX, newY), this.dashTime > 0 ? 500 : undefined);
    }
}
