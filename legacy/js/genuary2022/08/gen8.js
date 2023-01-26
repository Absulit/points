import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

export default class Gen8 {
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
        let x = this._screen.center.x, y = this._screen.center.y, radius = 10;
        let pointFromCenter, point, radians, angle, lastModifiedPoint;

        this._screen.clear();


        for (angle = 0; angle < 360; angle += 1) {
            radians = MathUtil.radians(angle);

            pointFromCenter = MathUtil.vector(  Math.sin( (radius * radians) *usin) * 40 * this._constant, radians);//*
            //pointFromCenter = MathUtil.vector(  Math.sin(radius * radians / usin) *this._constant * 10 + (this._constant * 40)   , radians); // wavey circle finally!//*

            ///////

            point = this._screen.getPointAt(Math.round( (pointFromCenter.x + x)), Math.round(pointFromCenter.y + y));
            //point = this._screen.getPointAt(Math.round( Math.sin( (pointFromCenter.x + x) / 40 * ( (usin+1)/2)) * 80* this._constant), Math.round(pointFromCenter.y + y));
            //point = this._screen.getPointAt(Math.round( Math.sin( (pointFromCenter.x + x) / 40 * usin) + 80), Math.round(  Math.cos(pointFromCenter.y + y) + 80 ));
            if (point && (point != lastModifiedPoint)) {
                if(lastModifiedPoint){
                    this._screen.drawLineWithPoints(lastModifiedPoint, point);
                }
                point.setBrightness(1);
                lastModifiedPoint = point;
            }
        }

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.soften2(3);
        //this._screen.clearMix(this._clearMixColor , 1.5);
    }
}
