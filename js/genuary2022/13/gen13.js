import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

// applied from https://generativeartistry.com/tutorials/circle-packing/

export default class Gen13 {
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
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        /*if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;
        this._constantY = screen.numRows / 100;
        console.log('---- CONSTANT: ' + this._constant);

        this._xIndex = 0
        this._centerRows = screen.numRows / 2;

        //screen.layerIndex = 0;//--------------------------- LAYER 0
    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._screen.points.forEach(point => {
            point.setColor(
                Math.sin((point.coordinates.x / 11 / this._constant) + utime * this._constant),
                Math.sin((point.coordinates.x / 13 / this._constant) + utime * this._constant),
                Math.sin((point.coordinates.x / 17 / this._constant) + utime * this._constant),
                //point.coordinates.x / this._screen.numColumns
            )

        });

        screen.layerIndex = 1;//--------------------------- LAYER 0
        for (this._xIndex = 0; this._xIndex < this._screen.numColumns; this._xIndex++) {
            this._xCurve = this._centerRows + Math.round(Math.sin((this._xIndex * .01 * this._constant) - utime) * 40 * this._constantY);
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve)) {
                //const {x,y} = this._point.coordinates;
                const { numColumns, numRows } = this._screen;
                this._point.setColor(this._xIndex / numColumns, this._xCurve / numRows, 1);
            }
        }

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
    }
}
