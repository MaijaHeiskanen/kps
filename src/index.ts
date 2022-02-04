import { Engine, Loader, DisplayMode, Physics, Vector, vec, Input, GamepadConnectEvent } from 'excalibur';
import { LevelOne } from './scenes/level-one/level-one';
import { Player } from './actors/player/player';
import { Resources } from './resources';
import { Bot } from './actors/bot/bot';
import { DevTool } from '@excaliburjs/dev-tools';

/**
 * Managed game class
 */
class Game extends Engine {
    private players: Player[] = [];
    private bots: Bot[] = [];
    private levelOne: LevelOne;

    constructor() {
        super({ displayMode: DisplayMode.FillScreen });

        this.connectGamepad = this.connectGamepad.bind(this);
    }

    connectGamepad(connectEvent: GamepadConnectEvent) {
        console.log('Gamepad connected', connectEvent, { players: this.players });
        const newPlayer = new Player(connectEvent.gamepad);
        this.players.push(newPlayer);
        this.levelOne.add(newPlayer);
    }

    public start() {
        this.players = [];
        this.input.gamepads.on('connect', this.connectGamepad);

        this.levelOne = new LevelOne();
        this.bots = [new Bot(vec(100, 300)), new Bot(vec(-200, 0)), new Bot(vec(-500, -300))];

        for (let i = 0, len = this.players.length; i < len; i++) {
            this.levelOne.add(this.players[i]);
        }
        for (let i = 0, len = this.bots.length; i < len; i++) {
            this.levelOne.add(this.bots[i]);
        }

        game.add('levelOne', this.levelOne);

        // Automatically load all default resources
        const loader = new Loader(Object.values(Resources));

        loader.playButtonText = 'Aloita peli';

        return super.start(loader);
    }

    onPreUpdate(engine: Engine, delta: number) {
        // for (let i = 0, len = this.players.length; i < len; i++) {
        //     console.log(this.players[i].getScore());
        // }
    }
}

const game = new Game();
game.setAntialiasing(true);

game.start().then(() => {
    game.goToScene('levelOne');
});

// const devtool = new DevTool(game);
