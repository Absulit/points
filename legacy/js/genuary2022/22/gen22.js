import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen22 {
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


        this._date = null;
        this._year = null;
        this._month = null;
        this._hours = null;
        this._minutes = null;
        this._seconds = null;
        this._milliseconds = null;

        this._secondTick = false;
        this._secondCounter = 0;

        this._spriteLoader = new SpriteLoader(screen, 32, 32);
        this._spriteLoader.load('../../assets_ignore/pixelspritefont 32_green.png', 32, 32);

        this._idsOfChars = [-1, 31, 51, 37, 40, 47, 61, 30, 62, 63];
        this._idsOfChars2 = [-1, 60, 36, 51, 48, 57, 38, 61, 45, 64, 63];

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

            ':': 49,
        }

        screen.layerIndex = 0;//--------------------------- LAYER 0

    }

    _getColor(value) {
        const r = Math.sin(value);
        const g = Math.cos(value);
        const b = Math.tan(value);
        return { r, g, b }
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        this._secondTick = false;
        if (++this._secondCounter === 60) {
            this._secondCounter = 0;
            this._secondTick = true;
        }


        //this._screen.clearMixPoints(this._screen.lastModifiedPoints, this._clearMixColor, 2);
        this._date = new Date();
        if (this._secondTick) {
            this._year = this._date.getFullYear();
            this._month = this._date.getMonth();
            this._day = this._date.getDate();
            this._hours = this._date.getHours(); // 24h format
            //this._hours = this._hours > 12 ? this._hours - 12 : this._hours;
            this._minutes = this._date.getMinutes();
            this._seconds = this._date.getSeconds();
        }
        this._milliseconds = this._date.getMilliseconds();

        screen.layerIndex = 0;//--------------------------- LAYER 0
        screen.points.forEach(point => {
            let r = 0;
            let g = 0;
            let b = 0;
            const { x, y } = point.coordinates;
            switch (point.coordinates.x) {
                case 0:
                case 1:
                    r = Math.sin(this._milliseconds);
                    g = Math.cos(this._milliseconds);
                    b = Math.tan(this._milliseconds);
                    break;
                case 2:
                case 3:
                    r = Math.sin(this._seconds);
                    g = Math.cos(this._seconds);
                    b = Math.tan(this._seconds);
                    break;
                case 4:
                case 5:
                    r = Math.sin(this._minutes);
                    g = Math.cos(this._minutes);
                    b = Math.tan(this._minutes);
                    break;
                case 6:
                case 7:
                    r = Math.sin(this._hours);
                    g = Math.cos(this._hours);
                    b = Math.tan(this._hours);
                    break;
                case 8:
                case 9:
                    r = Math.sin(this._day);
                    g = Math.cos(this._day);
                    b = Math.tan(this._day);
                    break;
                case 10:
                case 11:
                    r = Math.sin(this._month);
                    g = Math.cos(this._month);
                    b = Math.tan(this._month);
                    break;
                case 12:
                case 13:
                    r = Math.sin(this._year);
                    g = Math.cos(this._year);
                    b = Math.tan(this._year);
                    break;

                default:
                    break;
            }
            point.setColor(r * (y / side), g * (y / side), b * (y / side));
            //point.setBrightness(1);
        });

        //console.log(this._milliseconds);




        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.7);
        //this._effects.orderedDithering();

        screen.layerIndex = 1;//--------------------------- LAYER 1
        this.clearLine(0, 10);
        this.printToScreen(this._date.toDateString().toLocaleLowerCase(), 0, 10);
        this.clearLine(0, 11, 20);
        this.printToScreen('' + this._hours + ':' + this._minutes + ':' + this._seconds + ':' + this._milliseconds, 0, 11);
        //screen.layerIndex = 2;//--------------------------- LAYER 2


        //screen.layerIndex = 3;//--------------------------- LAYER 3
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
