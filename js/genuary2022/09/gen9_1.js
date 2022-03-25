import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';

export default class Gen9_1 {
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
        }
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }*/

        /*if (screen.numColumns != 800) {
            throw new Error(`This demo needs 800x800 side`);
        }*/

        this._constant = screen.numColumns / 100;


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
        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = this._imageLoader.FIT;
        this._imageLoader.load('../../js/genuary2022/09/brayden-law-1829191_800x800.jpg');


        screen.layerIndex = 2;//--------------------------- LAYER 2
        screen.points.forEach((point, index) => {
            //point.angle = (point.position.x / screen.numColumns) * Math.PI;
            point.angle = screen.layers[0].points[index].getBrightness() * Math.PI * 2;
        });

    }



    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 2;//--------------------------- LAYER 2
        this._imageLoader.loadToLayer();

        screen.points.forEach((point, index) => {
            const value = (point.color.b > .5) * 1;
            const fraction = (point.color.b * screen.pointSizeFull / 2) * Math.sin(index / 8000 * Math.abs(ucos*3));
            point.size = fraction + (Math.abs(usin) * fraction);
            point.setBrightness(1)
        });



        /*let amountNoise = 6000;
        for (let index = 0; index < amountNoise; index++) {
            let point = this._screen.getRandomPoint(); {
                if (point.modified) {
                    const stepLength = 10;
                    const mathPoint = MathUtil.polar(stepLength, point.angle);
                    const x = Math.floor(mathPoint.x);
                    const y = Math.floor(mathPoint.y);

                    this._screen.movePointTo(point, point.coordinates.x + x, point.coordinates.y + y);

                }
            }
        }*/

        // this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(2);
        //this._effects.soften2(3);
        //this._screen.clearMix(this._clearMixColor, 1.5);

    }
}
