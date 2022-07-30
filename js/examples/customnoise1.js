import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';
import { print } from '../utils.js';
import ValueNoise from '../valuenoise.js';

export default class CustomNoise1 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;

        this._v = new ValueNoise(400, 400);
        this._v.generate();
        this._v.data.forEach(d => {
            const point = screen.getPointAt(d.x, d.y);
            if (point) {
                point.setBrightness(d.value);
            }
        });

        this._v2 = new ValueNoise(400, 400);
        this._v2.generate();
        this._v2.data.forEach(d => {
            const point = screen.getPointAt(d.x, d.y);
            if (point) {
                point.setBrightness(d.value);
            }
        });
    }



    update({ fnucos, sliders, fnusin }) {

        const screen = this._screen;
        //screen.clear();

        this._v.cellSize = 9 + Math.floor(sliders.a * 128) //Math.floor(9 * fnusin(1))
        this._v2.cellSize = 9 + Math.floor( .2 * 128) //Math.floor(9 * fnusin(1))
        //this._v.cellSize = 9 + Math.floor(128 * fnusin(1))

        this._v.generate();
        this._v.data.forEach( (d, index) => {
            const d2 = this._v.data[index];
            const point = screen.getPointAt(d.x, d.y);
            if (point) {
                point.setBrightness(d.value * d2.value);
            }
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
