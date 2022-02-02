import { Engine, Loader, DisplayMode, Physics, Vector } from 'excalibur';
import { LevelOne } from './scenes/level-one/level-one';
import { Player } from './actors/player/player';
import { Resources } from './resources';
import { Bot } from './actors/bot/bot';

/**
 * Managed game class
 */
class Game extends Engine {
    private player: Player;
    private bot: Bot;
    private levelOne: LevelOne;

    constructor() {
        super({ displayMode: DisplayMode.FillScreen });
    }

    public start() {
        // Create new scene with a player
        this.levelOne = new LevelOne();
        this.player = new Player();
        this.bot = new Bot();
        this.levelOne.add(this.player);
        this.levelOne.add(this.bot);

        game.add('levelOne', this.levelOne);

        // Automatically load all default resources
        const loader = new Loader(Object.values(Resources));

        loader.playButtonText = 'Aloita peli';

        return super.start(loader);
    }

    onPreUpdate(engine: Engine, delta: number) {
        console.log(this.player.getScore());
    }
}

const game = new Game();
game.setAntialiasing(false);

game.start().then(() => {
    game.goToScene('levelOne');
});
