import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';

export default class Gen6 {
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
        if (screen.layers.length != 7) {
            throw new Error(`This demo needs 7 layers to work`);
        }
        this._constant = screen.numColumns / 100;



        let center = screen.center;

        this._imageLoader0 = new ImageLoader(screen);
        this._imageLoader0.type = this._imageLoader0.FIT;
        this._imageLoader0.load('../../js/genuary2022/06/layer0.jpg');

        this._imageLoader0_1 = new ImageLoader(screen);
        this._imageLoader0_1.type = this._imageLoader0_1.FIT;
        this._imageLoader0_1.load('../../js/genuary2022/06/layer0.1.jpg');

        this._imageLoader1 = new ImageLoader(screen);
        this._imageLoader1.type = this._imageLoader1.FIT;
        this._imageLoader1.load('../../js/genuary2022/06/layer1.jpg');

        this._imageLoader1_1 = new ImageLoader(screen);
        this._imageLoader1_1.type = this._imageLoader1_1.FIT;
        this._imageLoader1_1.load('../../js/genuary2022/06/layer1.1.jpg');

        this._imageLoader2 = new ImageLoader(screen);
        this._imageLoader2.type = this._imageLoader2.FIT;
        this._imageLoader2.load('../../js/genuary2022/06/layer2.jpg');

        this._imageLoader3 = new ImageLoader(screen);
        this._imageLoader3.type = this._imageLoader3.FIT;
        this._imageLoader3.load('../../js/genuary2022/06/layer3.jpg');
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- bg
        screen.points.forEach(point => {
            const gradientValue = (point.coordinates.y / screen.numRows);
            point.setColor(1, 1 - gradientValue, gradientValue, 1);
        });


        screen.layerIndex = 1;//--------------------------- clouds
        this._imageLoader0.loadToLayer();

        screen.points.forEach(point => {
            if (point.getBrightness() < .5) {
                point.setColor(0, 0, 0, 0)
            } else {
                point.setColor(1, 1, 1, 1)
            }
        });
        //this._effects.antialias();
        this._effects.soften2(3);
        this._effects.soften2(3);
        this._effects.soften2(3);
        this._effects.soften2(3);

        screen.layerIndex = 2;//--------------------------- smoke
        this._imageLoader0_1.loadToLayer();

        screen.points.forEach(point => {
            if (point.getBrightness() < .5) {
                point.setColor(0, 0, 0, 0);
            } else {
                point.setColor(1, 1, 1, 1);
            }
        });
        this._effects.fire(2);
        this._effects.soften2(3);

        screen.layerIndex = 3;//--------------------------- volcano
        this._imageLoader1.loadToLayer();

        screen.points.forEach(point => {
            if (point.getBrightness() < .5) {
                point.setColor(0, 0, 0, 0)
            } else {
                point.setColor(0, 0, 0, 1)
            }
        });
        this._effects.soften2(3);


        screen.layerIndex = 4;//--------------------------- lava
        this._imageLoader1_1.loadToLayer();

        screen.points.forEach(point => {
            if (point.getBrightness() < .5) {
                point.setColor(0, 0, 0, 0)
            } else {
                point.setColor(1, 0, 0, 1)
            }
        });
        this._effects.fire(1);
        this._effects.soften2(3);

        /*this._effects.fire(2);
        this._effects.soften2(3);
        this._screen.clearMix(this._clearMixColor , 1.1);*/


        screen.layerIndex = 5;//--------------------------- mountains
        this._imageLoader2.loadToLayer();
        screen.points.forEach(point => {
            if (point.getBrightness() < .5) {
                point.setColor(0, 0, 0, 0)
            } else {
                point.setColor(1, 0, 0, 1)
            }
        });
        this._effects.fire(1);
        this._effects.soften2(3);

        screen.layerIndex = 6;//--------------------------- palms
        this._imageLoader3.loadToLayer();
        screen.points.forEach(point => {
            const gradientValue = 1-(point.coordinates.y / screen.numRows);
            if (point.getBrightness() < .5) {
                point.setColor(0, 0, 0, 0)
            } else {
                point.setColor(
                    (33 / 255 * gradientValue),
                    (107 / 255 * gradientValue),
                    (22 / 255 * gradientValue)
                )
            }
        });
        this._effects.antialias();

    }
}
