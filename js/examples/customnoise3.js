import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';
import { print } from '../utils.js';

export default class CustomNoise3 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;


        //https://www.youtube.com/watch?v=zXsWftRdsvU

        screen.points.forEach(point => {
            const { x: cx, y: cy } = point.coordinates
            const c = this.noise21(cx * .002, cy *.002);

            point.setBrightness(c);
        });
    }


    noise21(cx, cy) {
        return MathUtil.fract(Math.sin(cx * 100.0 * cy * 657400) * 564700);
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
