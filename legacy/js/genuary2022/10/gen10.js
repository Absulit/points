import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

export default class Gen10 {
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

        /*if (screen.numColumns != 400) {
            throw new Error(`This demo needs 400 side`);
        }*/

        this._constant = screen.numColumns / 100;


        screen.layerIndex = 0;//--------------------------- LAYER 0

        screen.points.forEach(point => {
            //const { x, y } = point.coordinates;
            //point.setColor(x / screen.numColumns, y / screen.numRows, 1);
            point.setColor(0,0,0);
        });


    }

    getRandomPoints(numPoints, y) {
        const points = [];
        for (let index = 0; index < numPoints; index++) {
            const point = this._screen.getRandomPointX(y);
            point.setColor(1, 1, 1);
            points.push(point);
        }
        return points;
    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 1;//--------------------------- LAYER 0

        this._points = [
            this.getRandomPoints(2, 10 * this._constant),
            this.getRandomPoints(8, 30 * this._constant),
            this.getRandomPoints(12, 50 * this._constant),
            this.getRandomPoints(16, 70 * this._constant),
            this.getRandomPoints(32, 90 * this._constant),
        ];



        for (let index = 0; index < this._points.length - 1; index++) {
            const index2 = index + 1;
            if (index2 > this._points.length) {
                break;
            }
            const points1 = this._points[index];
            const points2 = this._points[index2];

            points1.forEach(point1 => {
                points2.forEach(point2 => {
                    screen.drawLineWithPoints(point1, point2);
                });
            });
        }

        this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        this._effects.soften2(3);
        this._screen.clearMix(this._clearMixColor, 1.5);
    }
}
