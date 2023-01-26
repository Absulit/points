import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';
import VideoLoader from '../../videoloader.js';
import ImageLoader from './../../imageloader.js';


export default class Gen18 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.FIT;
        this._imageLoader.load('../../img/house_512x512.jpg');

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

        screen.points.forEach(point => {
            point.setBrightness(Math.random())
        });


    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._imageLoader.loadToLayer();

        //const centerPoint = screen.getPointAt(screen.center.x, screen.center.y);

        const { x, y } = screen.center;
        const distance = (x * x) / 2;
        const numPoints = 400;
        let pointFromCenter, radians, angle, pointAround;
        let result = [];
        for (angle = 0; angle < 360; angle += (360 / numPoints)) {
            radians = MathUtil.radians(angle);

            for (let indexDistance = 0; indexDistance < distance; indexDistance++) {

                pointFromCenter = MathUtil.vector(indexDistance, radians);
                screen.layerIndex = 0;//--------------------------- LAYER 0
                pointAround = screen.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));


                screen.layerIndex = 2;//--------------------------- LAYER 0
                pointFromCenter = MathUtil.vector(indexDistance + indexDistance, radians);
                screen.movePointTo(pointAround, Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
                pointFromCenter = MathUtil.vector(indexDistance + indexDistance + 1, radians);
                screen.movePointTo(pointAround, Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));

            }
            // if (pointAround) {
            //     result.push(pointAround);
            // }
        }



        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.points.forEach(point => point.setColor(0, 0, 0))


        screen.layerIndex = 2;//--------------------------- LAYER 0



        this._effects.chromaticAberration(.05, 3);
        this._effects.fire(1);
        this._effects.soften2(3);
        this._effects.scanLine(4);
        //this._effects.antialias(3);
        //this._effects.blackAndWhite();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
    }
}
