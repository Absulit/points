import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';

export default class RandomNoise1 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        const side = screen.numColumns;


    }

    update({ fnucos, fnusin, fusin, side, fnsin, sliders }) {

        const screen = this._screen;
        //screen.clear();
        screen.points.forEach(point => {

            if (point) {
                //newPoint.setRGBAColor(point1.color);
                point.modifyColor(color => {
                    color.set(Math.random(), Math.random(), Math.random());
                    //color.set(1,0,0);
                });
            }
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(100);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.01);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();



    }
}
