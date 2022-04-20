import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen28 {
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


        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.ONE_TO_ONE;
        this._imageLoader.load('../../assets_ignore/absulit_800x800.jpg');

        this._spriteLoader = new SpriteLoader(screen, 32, 32);
        this._spriteLoader.load('../../assets_ignore/white_point_32.png', 32, 32);

        //screen.layerIndex = 0;//--------------------------- LAYER 0

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._imageLoader.loadToLayer(305,400, .5,.5);

        screen.points.forEach(point => {

            //this._xCurve = this._centerRows + Math.round(Math.sin((this._xIndex  / 40) - u_time) * 5);

            const a = (Math.sin(utime) + 1)/2;
 
            point.setSize(point.getBrightness() * (.3 + (a * .7))  );
            //point.setBrightness(1);
            point.atlasId = 0;
        });


        //screen.layerIndex = 1;//--------------------------- LAYER 1

        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
