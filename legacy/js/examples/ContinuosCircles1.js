import RGBAColor, { RGBFromHSV } from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import Screen from '../screen.js';
import { print } from '../utils.js';

export default class ContinuosCircles1 {
    /**
     * 
     * @param {Screen} screen 
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
    }



    update({ fnusin, sliders, side, utime }) {

        const screen = this._screen;

        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.points.forEach(point => {
            const {x:nx, y:ny} = point.normalPosition;
            const coordinatesClone = point.coordinates.clone();
            // coordinatesClone.x *= 2;
            // coordinatesClone.y *= 2;
            const distance = Math.sin(MathUtil.distance(coordinatesClone, screen.center) / side * 30 + 100 * utime * -.1);

            //const d1 = Math.sin(MathUtil.distance(c1, point.coordinates) / side * 70 + 100 * fnusin(.5));
            point.modifyColor(color => {
                //color.brightness = nx * ny * fnusin(1)
                //color.brightness =  point0.getBrightness() * distance;
                //color.brightness = distance

                color.set(distance * distance * nx * (1-ny), distance * distance * ny * ny, nx * distance);
            });
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
