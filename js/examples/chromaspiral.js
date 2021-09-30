import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

class ChromaSpiral {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
    }

    update(usin, ucos, side) {
        let x = this._screen.center.x, y = this._screen.center.y, radius = 10;
        let pointFromCenter, point, radians, angle, lastModifiedPoint;
        for (angle = 0; angle < 360; angle += .1) {
            radians = MathUtil.radians(angle);
            ///pointFromCenter = MathUtil.vector(radius * usin * angle/40 * ucos, radians * usin);
            //pointFromCenter = MathUtil.vector(radius, radians * usin / 10);
            pointFromCenter = MathUtil.vector(radius * usin * ucos * angle / (100 / side * 40), radians / usin);
            point = this._screen.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            if (point && (point != lastModifiedPoint)) {
                point.setBrightness(1);
                lastModifiedPoint = point;
            }
        }

        this._effects.chromaticAberration(.2, 5);
        this._effects.soften1();
    }
}

export default ChromaSpiral;
