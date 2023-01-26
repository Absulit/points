import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

export default class Gen7 {
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
        }
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }*/
        this._constant = screen.numColumns / 100;

        this._points = [];
        for (let index = 0; index < 40; index++) {
            const point = screen.getRandomPoint()
            point.setColor(1,1,1);
            this._points.push(point);
        }


        /*for (let index = 0; index < this._points.length; index++) {
            const point1 = this._points[index];

            for (let index2 = 0; index2 < this._points.length; index2++) {
                const point2 = this._points[index2];
                screen.drawLineWithPoints(point1, point2);

            }
        }*/

        //this._effects.antialias();

        this._index1 = 1;
        this._index2 = 0;
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;
        for (let index = 0; index < this._points.length; index++) {
            const point1 = this._points[index];

            if (this._index2++ < this._points.length) {
                const point2 = this._points[this._index2];
                if(point2){
                    point1.setColor(1,1,1)
                    screen.drawLineWithPoints(point1, point2);
                }

            }else{
                this._index2 = 0
            }
        }


        /*if (this._index1++ < this._points.length) {
            const point1 = this._points[this._index1];

            if (this._index2++ < this._points.length) {
                const point2 = this._points[this._index2];
                if(point2){
                    point1.setColor(1,1,1)
                    screen.drawLineWithPoints(point1, point2);
                }

            }else{
                this._index2 = 0
            }
        }else{
            this._index1 = 1
        }*/


        this._effects.chromaticAberration(.05, 2);
        this._effects.soften2(3);
        this._screen.clearMix(this._clearMixColor , 1.2);
    }
}
