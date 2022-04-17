import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen23 {
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



        this._levels = 10;
        this._branchAmount = 2;
        this._initialRotation = MathUtil.radians(90);
        this._point = screen.getPointAt(screen.center.x, screen.numRows/4*3);

        //screen.layerIndex = 0;//--------------------------- LAYER 0

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 0
        screen.points.forEach(point => {
            const { x, y } = point.coordinates;

            point.setColor(x / side, 1-y / side, 1-x / side);
            //point.setSize(x/side *  usin);
            //point.setBrightness(1);
        });

        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.clear();


        let lastPoints = [this._point.coordinates];
        for (let index = 0; index < this._levels; index++) {

            let newLastPoints = [];
            lastPoints.forEach((lastPoint, indexLastPoint) => {

                if (!lastPoint) {
                    lastPoint = this._point.coordinates;
                }
                if (lastPoint) {
                    const { x, y } = lastPoint;
                    for (let branchIndex = 0; branchIndex < this._branchAmount; branchIndex++) {
                        lastPoint = screen.drawLineRotation(
                            x, y,
                            13 * this._constant * (1 - index / this._levels),
                            (indexLastPoint * MathUtil.radians(15 * Math.sin(utime / 3)) - MathUtil.radians(15 * index * Math.cos(utime / 3))) - this._initialRotation,
                            new RGBAColor(x / side * usin, 1 - y / side, x / side)
                        );
                        newLastPoints.push(lastPoint);
                        //console.log('---- branch');
                    }
                }
            })
            lastPoints = newLastPoints;

        }


        
        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.7);
        //this._effects.orderedDithering();
    }
}
