import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class SpeedPoints4 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;

        const side = screen.numColumns;

        this._c1 = screen.center.clone();
        this._c1.x = side * .25;

        this._c2 = screen.center.clone();
        this._c2.x = side * .75;

        this._c3 = screen.center.clone();
        //this._c3.y = side * .75;
    }

    update({ fnucos, fnusin, fusin, side }) {

        const screen = this._screen;
        //screen.clear();

        screen.points.forEach((point, index) => {
            const { x: nx, y: ny } = point.normalPosition;

            //const normalIndex = index / screen.points.length;

            const c1 = this._c1.clone();
            c1.x = side * fnusin(1.1556);

            const c2 = this._c2.clone();
            c2.x = side * fnusin(.954);

            const c3 = this._c3.clone();
            c3.y = side * fusin(.768);

            const d1 = Math.sin(MathUtil.distance(c1, point.coordinates) / side * 70 + 100 * fnusin(.5));
            const d2 = Math.sin(MathUtil.distance(c2, point.coordinates) / side * 100 + 73 * fnusin(.7));
            //const d3 = Math.sin(MathUtil.distance(c3, point.coordinates) / side * 50 + 3 * fnusin(.1));

            const c = d1 * d2;

            point.setColor(c + (1 - c) * (ny) * (1-d1), nx* (1 - c) * .5, d2 * c * ny);
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
