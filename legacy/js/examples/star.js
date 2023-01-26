import RGBAColor from '../color.js';
import MathUtil from '../mathutil.js';

class Star{
    constructor(screen){
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);

        this._starAngle = 0;
        this._lastPoint = { x: screen.numColumns * .7, y: screen.numRows * .5 };
        this._starColor = new RGBAColor(0, 1, 0);
        this._starDistance = screen.numColumns * .6;

    }

    update(u_time, usin){
        // star
        this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clear();
        //starAngle += 90+45+15;
        //starAngle += 90+45+15 * usin;
        this._starAngle += 90 + 45 + 45 * usin;
        if (this._starAngle >= 360) {
            this._starAngle -= 360;
            //this._screen.clear();
        }
        let starRadians = MathUtil.radians(this._starAngle);
        //let starRadians = this._starAngle;
        //this._starColor.r = 1-usin;
        //this._starColor.g = usin;
        this._lastPoint = this._screen.drawLineRotation(this._lastPoint.x, this._lastPoint.y, this._starDistance, starRadians, this._starColor);
    }
}

export default Star;