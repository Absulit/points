import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen31 {
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

        this._lineColor = new RGBAColor(1, 1, 1);

        this._signed = false;

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;



        screen.layerIndex = 1;//--------------------------- LAYER 0

        screen.drawLine(0, 0, 0, screen.numRows - 1, this._lineColor);
        screen.drawLine(0, 0, screen.numColumns-1, 0, this._lineColor);



        //this._effects.chromaticAberration(.05, 2);
        this._effects.soften2(3);
        this._screen.clearAlpha(1.01);


        screen.layerIndex = 0;//--------------------------- LAYER 1

        const a = (Math.sin(utime * 2) + 1)/2;

        screen.clear();
        screen.drawPolygon(screen.center.x + (screen.center.x *.25 * usin), screen.center.y, 40 * this._constant, 2+ Math.ceil(a * 5), this._clearMixColor, 2*Math.PI * a);
        this._effects.antialias();
        screen.moveColorToLayer(1);





        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
