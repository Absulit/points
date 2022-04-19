import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen27 {
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
        this._imageLoader.type = ImageLoader.FIT;
        this._imageLoader.load('../../assets_ignore/lirio_800x800.jpg');

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
        this._palette1 = [
            new RGBAColor(46, 41, 78),
            new RGBAColor(84, 19, 136),
            new RGBAColor(255, 212, 0), // yellow
            new RGBAColor(241, 233, 218),
            new RGBAColor(217, 3, 104),

        ]

        this._palette = this._palette1;
        //screen.layerIndex = 0;//--------------------------- LAYER 0

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._imageLoader.loadToLayer();



        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);

        //this._effects.orderedDithering();
        screen.points.forEach(point => {
            // point.setBrightness(point.getBrightness());
            point.setRGBAColor(RGBAColor.getClosestColorInPalette(point.color, this._palette))
        });

        //screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.points.forEach(point => {
            const pointsAround = screen.getPointsAround(point, 1);

            if (pointsAround[1] && (pointsAround[1].color.r == 241 / 255) && pointsAround[6] && (pointsAround[6].color.r == 241 / 255)) {
                const c = this._palette[2];
                //c.a = .1;
                const pointAbove = screen.getPointFromLayer(point, 1);
                point.setRGBAColor(c);
            }

        });
        //this._effects.orderedDithering();
    }


}
