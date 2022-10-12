import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import FlowFields from '../flowfields.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import SpriteLoader from '../spriteloader.js';
import { print } from '../utils.js';
import Particle from './Particle.js';


export default class EffectsTester {
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

        this._red = new RGBAColor(1,0,0);
        this._orange = new RGBAColor(1,.5,0);

    }

    // sdfCircle(position, currentPosition, percent){
    //     let d = distance( currentPosition, position) / screenSize.numColumns;
    //     return d < percent;
    // }

    update({ usin, ucos, side, utime, nusin, fnusin }) {
        const screen = this._screen;

        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.clear(this._clearMixColor);

        screen.points.forEach(point => {
            let d = MathUtil.distance(point.coordinates, { x: 35 * this._constant, y: screen.center.y }) / side;

            if (d < .1 + .1 * fnusin(2)) {
                point.modifyColor(color => {
                    color.set(1, 0, 0);
                });
            }
        });

        const point = screen.getPointAt(50,50);
        point.modifyColor(color => color.set(1,1,0));

        const point2 = screen.getPointAt(40,60);
        point2.modifyColor(color => color.set(1,1,0));



        this._screen.drawLineWithPoints(point2, point);

        // screen.drawLine(0,0, 50,50, this._red);
        // screen.drawCircle(50,50, 1 + 10 * fnusin(2), 1,0,0);
        // screen.drawPolygon(50, 50, 30, 3, this._orange, 180 * fnusin(2.144));


        // const point = screen.getPointAt(screen.center.x, Math.floor( side * fnusin(3.14)));
        // point && point.modifyColor(color => {
        //     color.set(1, 1, 1);
        // });


        screen.layerIndex = 0;//--------------------------- LAYER 1
        screen.clear(this._clearMixColor);
        screen.points.forEach(point => {
            let d = MathUtil.distance(point.coordinates, { x: 55 * this._constant, y: screen.center.y }) / side;

            if (d < .1 + .1 * fnusin(2.1)) {
                point.modifyColor(color => {
                    color.set(1, 1, 1, 1);
                });
            }
        });



        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(30);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
