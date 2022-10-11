import RGBAColor, { RGBFromHSV } from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import Screen from '../screen.js';
import { print } from '../utils.js';
import ValueNoise from '../valuenoise.js';

export default class ContinuosCircles2 {
    /**
     * 
     * @param {Screen} screen 
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;


        this._noiseMin = 0.157
        this._noiseMax = 1.0;
        this._noiseDiff = this._noiseMax = this._noiseMin;

        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._v = new ValueNoise(200, 200);
        this._v.cellSize = Math.floor(this._noiseMax * 128);
        this._v.generate();
        this._v.data.forEach(d => {
            const point = screen.getPointAt(d.x, d.y);
            point && point.modifyColor(color => color.brightness = d.value);
        });
    }



    update({ fnusin, sliders, side, utime }) {

        const screen = this._screen;

        //screen.layerIndex = 0;//--------------------------- LAYER 0
        //this._v.cellSize = Math.floor(this._noiseMax * 128)
        //this._v.cellSize = Math.floor((this._noiseMin + fnusin(6) * this._noiseDiff) * 128) //Math.floor(9 * fnusin(1))
        // this._v.generate();
        // this._v.data.forEach((d, index) => {
        //     const d2 = this._v.data[index];
        //     const point = screen.getPointAt(d.x, d.y);
        //     if (point) {
        //         point.setBrightness(d.value * d2.value);
        //     }
        // });

        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.points.forEach(point => {
            const { x: nx, y: ny } = point.normalPosition;
            const coordinatesClone = point.coordinates.clone();
            // coordinatesClone.x *= 2;
            // coordinatesClone.y *= 2;
            const point0 = screen.getPointFromLayer(point, 0);
            const noise = point0.color.brightness;

            const distance = Math.sin(MathUtil.distance(coordinatesClone, screen.center) / side * noise * 30 + 100 * utime * -.1);

            //const d1 = Math.sin(MathUtil.distance(c1, point.coordinates) / side * 70 + 100 * fnusin(.5));
            point.modifyColor(color => {
                //color.brightness = nx * ny * fnusin(1)
                //color.brightness =  point0.getBrightness() * distance;
                //color.brightness = distance

                color.set(noise + distance * distance * nx * (1 - ny), noise * noise - distance * distance * ny * ny, 0);
            });
        });


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering(32);
    }
}
