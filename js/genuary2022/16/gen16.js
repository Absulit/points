import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';


export default class Gen16 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }*/
        /*if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        screen.layerIndex = 0;//--------------------------- LAYER 0


        const side = screen.numColumns;

    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0

        screen.points.forEach(point => {
            const { x, y } = point.coordinates;

            point.setColor(x/side * usin, y/side * ucos * Math.sin(utime) * 2, 1-(.5+ ((y/side * usin) * .4)));
        });

        this._effects.fire(30);
        //screen.layerIndex = 1;//--------------------------- LAYER 1


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
    }
}
