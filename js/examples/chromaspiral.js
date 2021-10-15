import RGBAColor from '../color.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

class ChromaSpiral {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);

        this._constant = screen.numColumns / 200;
    }

    update(usin, ucos, side, utime) {
        let x = this._screen.center.x, y = this._screen.center.y, radius = 10;
        let pointFromCenter, point, radians, angle, lastModifiedPoint;

        //this._screen.clear();


        for (angle = 0; angle < 360; angle += 1) {
            radians = MathUtil.radians(angle);
            ///pointFromCenter = MathUtil.vector(radius * usin * angle/40 * ucos, radians * usin);
            //pointFromCenter = MathUtil.vector(radius, radians * usin / 10);
            pointFromCenter = MathUtil.vector(radius * usin * ucos * angle / (100 / side * 40), radians / usin);

            // TODO: make a new update method for each of these examples
            //pointFromCenter = MathUtil.vector(Math.sin((radius / radians) + utime) * (this._constant * 40), radians);
            //pointFromCenter = MathUtil.vector(  Math.sin( (radius * radians) *usin) * 40, radians);
            //pointFromCenter = MathUtil.vector(  Math.sin( (radius * radians) *usin * radians) * 40, radians * usin);
            //pointFromCenter = MathUtil.vector(  Math.sin( (radius * radians) / radians) * 40, radians * usin);
            //pointFromCenter = MathUtil.vector(  radius /radians * usin * 40, radians);
            //pointFromCenter = MathUtil.vector(  Math.sin(radius * radians / usin) + (this._constant * 50), radians); // wavey circle finally!
            ////pointFromCenter = MathUtil.vector(  Math.sin(radius * radians / usin) * 10 + (this._constant * 50)   , radians); // wavey circle finally!
            //pointFromCenter = MathUtil.vector(  Math.sin(radius * radians * 40) * (this._constant * 50), radians); // concentric circles?
            //pointFromCenter = MathUtil.vector(  Math.sin(radius * radians / usin) * (this._constant * 50), radians);

            ///////

            point = this._screen.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            //point = this._screen.getPointAt(Math.round( Math.sin( (pointFromCenter.x + x) / 40 * utime) * 80), Math.round(pointFromCenter.y + y));
            //point = this._screen.getPointAt(Math.round( Math.sin( (pointFromCenter.x + x) / 40 * usin) + 80), Math.round(  Math.cos(pointFromCenter.y + y) + 80 ));
            if (point && (point != lastModifiedPoint)) {
                point.setBrightness(1);
                lastModifiedPoint = point;
            }
        }
        //this._effects.fire(2);
        this._effects.chromaticAberration(.05, 2);
        //this._effects.chromaticAberration(.2, 5);
        this._effects.soften2(3);
        //this._effects.antialias();
        this._screen.clearMix(new RGBAColor(0,0,0), 1.1);


    }
}

export default ChromaSpiral;
