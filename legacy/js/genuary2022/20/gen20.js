import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen20 {
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


        this._amountPerColumn0 = [];
        for (let index = 0; index < screen.numRows; index++) {
            const range = .9 + (Math.random() * .1);
            this._amountPerColumn0.push(range);
        }

        this._amountPerColumn1 = [];
        for (let index = 0; index < screen.numRows; index++) {
            const range = .5 + (Math.random() * .5);
            this._amountPerColumn1.push(range);
        }

    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0

        // screen.points.forEach(point => {
        //     point.setBrightness( Math.sin(point.coordinates.x * point.coordinates.y + (usin*10))   );
        // });

        screen.points.forEach(point => {
            const range = .2 + (Math.abs(usin / 3) * .2);

            const amountPerColumn = this._amountPerColumn0[point.coordinates.x] * (point.coordinates.y / screen.numRows);

            const brightness = Math.abs(point.coordinates.y / screen.numRows + range) * amountPerColumn;
            //point.setBrightness(brightness);

            point.size = brightness * this._screen.pointSizeFull;
            //point.setBrightness(1);
            point.setColor(.4, 1, 1);
        });


        screen.layerIndex = 1;//--------------------------- LAYER 1

        screen.points.forEach(point => {
            const range = .3 + (Math.abs(ucos/5) * .3);

            const amountPerColumn = this._amountPerColumn1[point.coordinates.x] * (point.coordinates.y / screen.numRows);

            const brightness = Math.abs(point.coordinates.y / screen.numRows + range) * amountPerColumn;
            //point.setBrightness(brightness);

            point.size = brightness * this._screen.pointSizeFull;
            //point.setBrightness(1);
            point.setColor(1, .5, 0);
        });


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.7);

    }


}
