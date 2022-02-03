import { ImageSource } from 'excalibur';
import sword from './images/sword.png';
import scissors from './images/scissors.png';
import runImageSrc from './images/player-run.png';
import circle from './images/circle.png';
import rock from './images/rock.png';
import paper from './images/paper.png';

/**
 * Default global resource dictionary. This gets loaded immediately
 * and holds available assets for the game.
 */
const Resources = {
    Sword: new ImageSource(sword),
    Rock: new ImageSource(rock),
    Scissors: new ImageSource(scissors),
    Paper: new ImageSource(paper),
    PlayerRunTest: new ImageSource(runImageSrc),
    Circle: new ImageSource(circle),
};

export { Resources };
