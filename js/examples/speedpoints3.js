import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class SpeedPoints3 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
    }

    update({ fnucos, fnusin, fusin, fucos }) {

        const screen = this._screen;
        //screen.clear();

        screen.points.forEach((point, index) => {
            const { x: nx, y: ny } = point.normalPosition;
            //const b = Math.cos(nx * nx * nx * ny * ny * 3000 + 50* fucos(.23)) ;
            const c = Math.cos(nx * ny * (2048 + 1000 * fusin(2.1)) + fnusin(.5) * 10);

            point.setColor((1 - c) * (1 - ny), c * nx, nx * c);
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
