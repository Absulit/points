import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen29 {
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




        //screen.layerIndex = 0;//--------------------------- LAYER 0
        this._amountItems = 8;
        this._amountPerItem = screen.numColumns / this._amountItems;
        this._lineColor = new RGBAColor(1, 1, 1);
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.clear();

        screen.layerIndex = 0;//--------------------------- LAYER 0

        const a = (Math.sin(utime) + 1)/2;

        const length =  5 + Math.floor(5 * a);




        
        
        for (let xIndexAmountItems = 0; xIndexAmountItems < this._amountItems; xIndexAmountItems++) {
            for (let yIndexAmountItems = 0; yIndexAmountItems < this._amountItems; yIndexAmountItems++) {
                const startPosition = {
                    x: Math.floor(this._amountPerItem * xIndexAmountItems + Math.sin(xIndexAmountItems)+ (a*5)),
                    y: Math.floor(this._amountPerItem * yIndexAmountItems+ Math.sin(xIndexAmountItems)+ (a*5))
                }

                const moveToRight = yIndexAmountItems % 2?10:0;

                this.drawIso(startPosition.x + moveToRight,startPosition.y, length);

            }

        }


        //screen.layerIndex = 1;//--------------------------- LAYER 1

        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.1);
        //this._effects.orderedDithering();
    }


    drawIso(x,y,length){
        const screen = this._screen;
        //     1
        // 2		3
        //     4
        // 5		6
        //     7


        const point1 = new Coordinate(x + length, y);
        const point2 = new Coordinate(x, y + length);
        const point3 = new Coordinate(x + length * 2, y + length);
        const point4 = new Coordinate(x + length, y + length * 2);
        const point5 = new Coordinate(x, y + length * 2);
        const point6 = new Coordinate(x + length * 2, y + length * 2);
        const point7 = new Coordinate(x + length, y + length * 3);

        screen.drawLine(point1.x, point1.y, point2.x, point2.y, this._lineColor);
        screen.drawLine(point1.x, point1.y, point3.x, point3.y, this._lineColor);

        screen.drawLine(point2.x, point2.y, point4.x, point4.y, this._lineColor);
        screen.drawLine(point3.x, point3.y, point4.x, point4.y, this._lineColor);

        screen.drawLine(point4.x, point4.y, point7.x, point7.y, this._lineColor);


        screen.drawLine(point2.x, point2.y, point5.x, point5.y, this._lineColor);
        screen.drawLine(point3.x, point3.y, point6.x, point6.y, this._lineColor);

        screen.drawLine(point7.x, point7.y, point5.x, point5.y, this._lineColor);
        screen.drawLine(point7.x, point7.y, point6.x, point6.y, this._lineColor);



    }
}
