import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen19 {
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
        this._imageLoader.type = ImageLoader.FIT;
        this._imageLoader.load('../../img/carmen_lyra_2_800x800.jpg');

        this._spriteLoader = new SpriteLoader(screen, 32, 32);
        this._spriteLoader.load('../../assets_ignore/pixelspritefont 32_green.png', 32, 32);

        this._idsOfChars = [-1, 31, 51, 37, 40, 47, 61, 30, 62, 63];
        this._idsOfChars2 = [-1, 60, 36, 51, 48, 57, 38, 61, 45, 64, 63];
        screen.layerIndex = 0;//--------------------------- LAYER 0


        const side = screen.numColumns;

    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0
        //screen.clear();

        //screen.drawCircle(screen.center.x + (  this._constant * 10 * usin), screen.center.y, this._constant * 40, 1, 1, 1);
        this._imageLoader.loadToLayer()

        //screen.layerIndex = 1;//--------------------------- LAYER 1


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.7);


        this._screen.currentLayer.points.forEach(p => {

            let brightness = Math.abs(p.getBrightness() * (   .7 +  (usin * .3)  ));

            if (Math.random() > .5) {
                p.atlasId = this._idsOfChars[Math.round(this._idsOfChars.length * brightness) - 1];
            } else {
                p.atlasId = this._idsOfChars2[Math.round(this._idsOfChars2.length * brightness) - 1];
            }
            p.setBrightness(0)
        });


        // screen.layerIndex = 1;//--------------------------- LAYER 1
        // screen.clear();
        // screen.drawPolygon(screen.center.x, screen.center.y, usin * this._constant * 30, 3, new RGBAColor(1,0,0), usin * 15)
        // this._effects.soften2(3);
    }
}
