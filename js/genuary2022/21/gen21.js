import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen21 {
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
        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.FIT;
        this._imageLoader.load('../../img/noiseTexture2.png');
        //this._imageLoader.load('../../img/carmen_lyra_800x800.jpg');
        //this._imageLoader.load('../../img/carmen_lyra_2_800x800.jpg');
        //this._imageLoader.load('../../img/carmen_lyra_2_blur_800x800.jpg');
        //this._imageLoader.load('../../img/angel_600x600.jpg');


        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._randomPoints = [];
        for (let index = 0; index < (40 * this._constant); index++) {
            this._randomPoints.push(screen.getRandomPoint());
        }
        //console.log('---- this._randomPoints: ', this._randomPoints);
        this._randomPoints.forEach(randomPoint => {
            //randomPoint.setBrightness(1);
            const { x, y } = randomPoint.coordinates;
            screen.drawFilledSquare(x, y, 10 * this._constant, 1, 1, 1);
        });

        for (let index = 0; index < 6; index++) {
            this._effects.soften2(4, 2.5 * this._constant);
            //this._effects.soften2(16/this._constant, 2.5 * this._constant);
        }

        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.points.forEach((point, index) => {
            point.setBrightness(0);
        });


        screen.layerIndex = 2;//--------------------------- LAYER 2

        this._flowFields = new FlowFields(screen);
        this._flowFields.init(screen.layers[0]);
        screen.clear();


        this._loadImage = true;
    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0
        if (this._loadImage) {
            this._imageLoader.loadToLayer();
        }

        screen.layerIndex = 2;//--------------------------- LAYER 2

        if (this._imageLoader.isLoaded && this._loadImage) {
            this._flowFields.init(screen.layers[0]);
            //screen.clear();
            this._loadImage = false;
        }


        if(!this._loadImage){
            this._flowFields.update( point => {
                if(point){
                    const {x,y} = point.coordinates;
                    point.setRGBAColor(new RGBAColor(1- x/side * usin, 1-y/side, x/side));
                }
            });
        }
        screen.moveColorToLayer(3);


        screen.layerIndex = 3;
        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.7);
        this._effects.orderedDithering();

    }


}
