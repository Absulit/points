import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';


export default class Gen17 {
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

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.FIT;
        //this._imageLoader.load('../../img/old_king_600x600.jpg');
        this._imageLoader.load('../../img/gratia_800x800.jpg');

        this._palette1 = [
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
            new RGBAColor(1, 1, 1),
        ];

        this._palette = this._palette1;
    }


    update({usin, ucos, side, utime}) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0

        this._imageLoader.loadToLayer();

        screen.points.forEach(point => {
            if (point.color.r) {
                const closestColor = this.getClosestColorInPalette(point.color);
                point.setRGBAColor(closestColor);
            }

        });


        //screen.layerIndex = 1;//--------------------------- LAYER 1


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.1);
    }

    getClosestColorInPalette(c1) {
        let distance = 2;
        let selectedColor = null;
        this._palette.forEach(color => {
            let currentDistance = this.colorRGBEuclideanDistance(c1, color);
            if (currentDistance < distance) {
                selectedColor = color;
                distance = currentDistance;
            }
        })
        return selectedColor;
    }

    colorRGBEuclideanDistance(c1, c2) {
        return Math.sqrt(Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2));
    }

}
