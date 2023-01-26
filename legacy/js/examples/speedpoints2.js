import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class SpeedPoints2 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
    }

    update({ fusin, fnusin, fnucos, side }) {

        const screen = this._screen;
        //screen.clear();

        screen.points.forEach((point, index) => {
            const { x: nx, y: ny } = point.normalPosition;
            // const b = fnucos(nx * nx * nx * ny * ny * 100);
            // const c = fnucos(nx*ny * 1000);
            // point.setColor((1 - c) * (1-ny), c * b * nx, nx*b );

            const centerClone = screen.center.clone();
            centerClone.x *= fusin(1.1556) * 2;

            const d = MathUtil.distance(centerClone, point.coordinates) / side;
            const b = Math.sin(200 * nx * ny * d * (1 - nx) + fnusin(5) * 10);
            point.modifyColor(color => color.set(1 - nx * b, (ny * -b), 0) );
            //point.setBrightness(Math.cos(d * fnucos(5)));
            //point.setBrightness(b);
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(60);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
