import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class SineWave2 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
    }

    update({ side, fusin }) {

        const screen = this._screen;
        //screen.clear();

        for (let columnIndex = 0; columnIndex < side; columnIndex++) {
            const horizontalSpeed = fusin(20);
            const frequence = .1 * fusin(0.36);
            const amplitude = 53 * fusin(2.76);
            const xCurve = Math.floor(Math.sin((columnIndex * frequence) + horizontalSpeed) * amplitude);
            const point = screen.getPointAt(columnIndex, this._constant * side * .5 + xCurve);

            if (point) {
                const { x: nx, y: ny } = point.normalPosition;
                point.setColor(1 - nx, 1 - nx * -ny, ny);
            }
        }

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        this._effects.soften2(60);
        //this._effects.antialias();
        this._screen.clearMix(this._clearMixColor, 1.01);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
