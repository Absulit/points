import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import FlowFields from '../flowfields.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import SpriteLoader from '../spriteloader.js';


export default class Mandelbrot {
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

        // this._canvas = document.getElementById('gl-canvas');

        // this._mouseX = 0;
        // this._mouseY = 0;
        // this._canvas.addEventListener('mousemove', e => {
        //     this._mouseX = screen.numColumns - (e.x / this._canvas.width) * screen.numColumns * 2 * this._zoom;
        //     this._mouseY = screen.numRows - (e.y / this._canvas.height) * screen.numRows * 2 * this._zoom;
        // });

        // this._lastKnownScrollPosition = 0;
        // console.log(document);
        // document.addEventListener('wheel', e => {
        //     console.log('--- wheel', e.deltaY);
        //     this._zoom += .25 * e.deltaY * -0.01;
        //     this._zoomFactor = 1 / this._zoom;
        // });


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
        this._palette = this._palette2;

        this._numIterations = 40;
        this._zoom = .25;
        this._zoomFactor = 1 / this._zoom;

        // f(y) = y2 + k



        //screen.layerIndex = 0;//--------------------------- LAYER 0

    }

    update({usin, ucos, side, utime}) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 0

        this._zoom = .25 + (usin * ucos * .25);
        this._zoomFactor = 1 / this._zoom;

        screen.points.forEach(point => {
            const { x: row, y: col } = point.coordinates;

            let c_re = (col - screen.center.x)  / screen.numColumns * this._zoomFactor;
            //let c_re = (col - this._mouseX) / screen.numColumns * this._zoomFactor;
            let c_im = (row - screen.center.y) / screen.numColumns * this._zoomFactor;
            //let c_im = (row - this._mouseY) / screen.numColumns * this._zoomFactor;
            let x = 0, y = 0;
            let iteration = 0;
            while (x * x + y * y <= 4 && iteration < this._numIterations) {
                let x_new = x * x - y * y + c_re;
                y = 2 * x * y + c_im;
                x = x_new;
                iteration++;
            }
            point = screen.getPointAt(col, row);
            const percentageIteration = iteration / this._numIterations;
            if (iteration < this._numIterations) {
                // in the set
                //point.setBrightness(1);
                //point.setRGBAColor(this._palette[iteration]);
                //point.setColor(percentageIteration, percentageIteration * row / screen.numRows * usin, percentageIteration * col / screen.numColumns)

                point.modifyColor(color => {
                    color.set(percentageIteration, percentageIteration * row / screen.numRows * usin, percentageIteration * col / screen.numColumns, 1);
                });

            } else {
                // not in the set
                //point.setBrightness(0);
                //point.setColor(percentageIteration, percentageIteration * row / screen.numRows, 1 - percentageIteration * col / screen.numColumns)
                point.modifyColor(color => {
                    color.set(percentageIteration, percentageIteration * row / screen.numRows, 1 - percentageIteration * col / screen.numColumns, 1);
                });
            }

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
