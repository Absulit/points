import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

export default class Gen5 {
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
        this._constant = screen.numColumns / 100;

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        const center = screen.center;
        screen.drawPolygon(center.x,center.y, (20 + (5*ucos)) * this._constant, 4, new RGBAColor(1,0,0), 45 + (10*usin) )


        this._effects.fire(2);
        //this._effects.soften2(3);
        this._screen.clearMix(this._clearMixColor , 1.1);
    }
}
