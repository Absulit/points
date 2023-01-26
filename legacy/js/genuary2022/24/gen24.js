import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen24 {
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

        this._spriteLoader = new SpriteLoader(screen, 32, 32);
        this._spriteLoader.load('../../assets_ignore/pixelspritefont 32_green.png', 32, 32);
        this._letters = {
            'a': 0,
            'b': 1,
            'c': 2,
            'd': 3,
            'e': 4,
            'f': 5,
            'g': 6,
            'h': 7,
            'i': 8,
            'j': 9,
            'k': 10,
            'l': 11,
            'm': 12,
            'n': 13,
            'o': 14,
            'p': 15,
            'q': 16,
            'r': 17,
            's': 18,
            't': 19,
            'u': 20,
            'v': 21,
            'w': 22,
            'x': 23,
            'y': 24,
            'z': 25,

            '1': 26,
            '2': 27,
            '3': 28,
            '4': 29,
            '5': 30,
            '6': 31,
            '7': 32,
            '8': 33,
            '9': 34,
            '0': 35,
            '.': 36,

            ':': 49,
        }


        //screen.layerIndex = 0;//--------------------------- LAYER 0
        this._x = 0;
        this._y = 0;
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 0
        let random = this.random();
        // screen.points.forEach(point => {
        //     const { x, y } = point.coordinates;

        //     point.setColor(x / side * random, 1 - y / side * random, 1 - x / side * random);
        //     //point.setSize(x/side *  usin);
        //     //point.setBrightness(1);
        // });

        const currentX = this.getX();
        for (let indexY = 0; indexY < screen.numRows * random; indexY++) {
            const point = screen.getPointAt(currentX, indexY);
            const { x, y } = point.coordinates;
            point.setColor(x / side * random, 1 - y / side * random, 1 - x / side * random);

        }

        this._screen.clearAlpha(1.01);


        screen.layerIndex = 1;//--------------------------- LAYER 1
        // random = this.random();

        const currentY = this.getY();
        // for (let indexX = 0; indexX < screen.numColumns * random; indexX++) {
        //     const point = screen.getPointAt(indexX, currentY);
        //     const { x, y } = point.coordinates;
        //     point.setColor(x / side * random, y / side * random, 1 - x / side * random);

        // }

        // this._screen.clearAlpha(1.01);

        screen.layerIndex = 2;//--------------------------- LAYER 2
        this.clearLine(0,currentY, screen.numColumns);
        this.printToScreen(random.toString(), 0,currentY);
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }

    getX() {
        if (++this._x >= this._screen.numColumns) {
            this._x = 0;
        }
        return this._x;
    }

    getY() {
        if (++this._y >= this._screen.numRows) {
            this._y = 0;
        }
        return this._y;
    }

    random() {
        const date = new Date();
        let result = date.getMilliseconds() / Math.PI;
        result = result.toString();
        result = result.split('.')[1];
        result = [0, result].join('.');
        return Number(result);
    }

    printToScreen(value, x, y) {
        Array.from(value).forEach((c, index) => {
            const point = this._screen.getPointAt(x + index, y);
            point.atlasId = this._letters[c];
        });
    }

    clearLine(x, y, length) {
        for (let index = 0; index < length; index++) {
            const point = this._screen.getPointAt(x + index, y);
            point.atlasId = -1;
        }
    }

}
