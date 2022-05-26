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

    update({ fnucos, fnusin, fusin, side }) {

        const screen = this._screen;
        //screen.clear();

        screen.points.forEach((point, index) => {
            const { x: nx, y: ny } = point.normalPosition;

            //const normalIndex = index / screen.points.length;

            const centerClone = screen.center.clone();
            centerClone.x = side * fnusin(1.1556);
            const d = Math.sin(MathUtil.distance(centerClone, point.coordinates) / side * 40 * this._constant* fnucos(.764) * ny + 10 * this._constant * fnusin(.1));

            const c = Math.cos(nx * ny * (1890*this._constant + 10*this._constant * fusin(.1)) + fnusin(.5) * 10*this._constant) * d;

            point.setColor(
                (1 - d) * ((1-c)*.4) * nx,
                (c) * .4 * ny,
                d * ny * nx * (1-c));
            //point.setBrightness(c);
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
