import { Color, randomInRange, randomIntInRange, vec, Vector } from 'excalibur';
import { BasePlayer } from '../base-player/base-player';
import { getWeaponList } from '../base-player/weapon';

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

    getRandomWeapon() {
        const weaponList = getWeaponList();
        const weaponListLength = weaponList.length;
        const newWeaponIdx = randomIntInRange(0, weaponListLength - 1);

        this.setWeapon(weaponList[newWeaponIdx]);
    }

    getRandomPosition() {
        const screen = window.screen;
        const width = screen.width - 100;
        const height = screen.height - 100;

        return {
            x: randomIntInRange(100, width),
            y: randomIntInRange(100, height),
        };
    }

    onInitialize() {
        super.onInitialize();
        this.setWeapon('scissors');

        this.patrol();
    }

    public patrol() {
        this.actions.clearActions();
        const padding = 200;

        this.actions.repeatForever((ctx) => {
            const position = this.getRandomPosition();
            const { x, y } = this.pos;
            let newX = randomInRange(-1, 1);
            let newY = randomInRange(-1, 1);

            if (x < padding) {
                newX = 1;
            } else if (x > screen.width - padding) {
                newX = -1;
            }
            if (y < padding) {
                newY = 1;
            } else if (y > screen.height - padding - 200) {
                newY = -1;
            }

            this.normalizeAndSetVelocity(vec(newX, newY));

            // ctx.moveTo(position.x, position.y, this.movementSpeed);

            this.getRandomWeapon();

            ctx.delay(randomIntInRange(500, 1000));
        });
    }
}
