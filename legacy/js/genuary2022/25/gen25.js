import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen25 {
    /**
     * 
     * @param {Screen} screen 
     */
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


        this._lineColor = new RGBAColor(1,1,1);


        //screen.layerIndex = 0;//--------------------------- LAYER 0

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        //screen.clear();


        //screen.layerIndex = 0;//--------------------------- LAYER 0
        const amount = Math.floor(usin*10);

        screen.drawLine(screen.center.x, 0, screen.center.x, screen.numRows, this._lineColor);
        screen.drawLine(screen.numColumns * .25 + amount, 0, screen.numColumns * .25 - amount, screen.numRows, this._lineColor);
        screen.drawLine(screen.numColumns * .75 - amount, 0, screen.numColumns * .75 + amount, screen.numRows,this._lineColor);



        const pointLeft = screen.getPointAt(0, screen.center.y);
        pointLeft.setRGBAColor(this._lineColor);
        const pointTop = screen.getPointAt(screen.center.x, 10 + amount);
        const pointRight = screen.getPointAt(screen.numColumns - 1, screen.center.y);
        pointRight.setRGBAColor(this._lineColor);
        const pointBottom = screen.getPointAt(screen.center.x, screen.numRows - 1 - 10 - amount);

        screen.drawLineWithPoints(pointLeft, pointTop);
        screen.drawLineWithPoints(pointLeft, pointBottom);
        screen.drawLineWithPoints(pointRight, pointTop);
        screen.drawLineWithPoints(pointRight, pointBottom);


        //screen.layerIndex = 1;//--------------------------- LAYER 1
        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
