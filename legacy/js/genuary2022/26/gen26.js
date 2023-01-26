import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen26 {
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

        this._palette2 = [
            new RGBAColor(255, 69, 0),
            new RGBAColor(255, 168, 0),
            new RGBAColor(255, 214, 53),
            new RGBAColor(0, 204, 120),
            new RGBAColor(126, 237, 86),
            new RGBAColor(0, 117, 111),
            new RGBAColor(0, 158, 170),
            new RGBAColor(36, 80, 164),
            new RGBAColor(54, 144, 234),
            new RGBAColor(81, 233, 244),
            new RGBAColor(73, 58, 193),
            new RGBAColor(106, 92, 255),
            new RGBAColor(129, 30, 159),
            new RGBAColor(180, 74, 192),
            new RGBAColor(255, 56, 129),
            new RGBAColor(255, 153, 170),
            new RGBAColor(109, 72, 48),
            new RGBAColor(156, 105, 38),
            new RGBAColor(0, 0, 0),
            new RGBAColor(137, 141, 144),
            new RGBAColor(212, 215, 217),
            //new RGBAColor(1, 1, 1),
        ];
        this._palette = this._palette2;


        //screen.layerIndex = 0;//--------------------------- LAYER 0

        this._amountItems = 8;
        this._amountPerItem = screen.numColumns / this._amountItems;
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;



        //screen.layerIndex = 0;//--------------------------- LAYER 0

        for (let xIndexAmountItems = 0; xIndexAmountItems < this._amountItems; xIndexAmountItems++) {
            for (let yIndexAmountItems = 0; yIndexAmountItems < this._amountItems; yIndexAmountItems++) {
                const startPosition = {
                    x: Math.floor(this._amountPerItem * xIndexAmountItems + Math.sin(xIndexAmountItems)+ (usin*5)),
                    y: Math.floor(this._amountPerItem * yIndexAmountItems+ Math.sin(xIndexAmountItems)+ (usin*5))
                }
                screen.drawLine(startPosition.x, startPosition.y, startPosition.x, startPosition.y + 9, this._palette[0]);

                const point1 = screen.getPointAt(startPosition.x + 2, startPosition.y + 2);
                if(point1){
                    point1.setRGBAColor(this._palette[3]);
                }

                screen.drawLine(startPosition.x + 2, startPosition.y + 5, startPosition.x + 8, startPosition.y + 5, this._palette[4]);


                screen.drawLine(startPosition.x + 2, startPosition.y + 4, startPosition.x + 8, startPosition.y , this._palette[12]);
            }

        }



        //screen.layerIndex = 1;//--------------------------- LAYER 1

        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
        //this._effects.orderedDithering();
    }


}
