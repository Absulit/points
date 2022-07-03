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

        const v = new ValueNoise(400, 400);
        v.generate();
        v._data.forEach(d => {
            screen.getPointAt(d.x, d.y).setBrightness(d.value);
        });
    }



    update({ fnucos, sliders }) {

        const screen = this._screen;
        //screen.clear();



        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
