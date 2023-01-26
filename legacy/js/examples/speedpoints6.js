import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class SpeedPoints6 {
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

            const normalIndex = index / screen.points.length;

            const a = Math.sin(nx * 50 + 15 * fnusin(2.545)) ;
            const b = Math.sin(ny * 50 + 17 * fnusin(.568));

            const d = Math.sin(MathUtil.distance(point.coordinates, screen.center) / side * 100 + 73 * fnusin(.57));

            const z = a * b * (d);
            const zi = 1-z;

            //const u = this.normalize([z * ny * (z) * (b), z * nx * (z * ny), 0]);

            //point.setColor(a, b * z, z * normalIndex);
            //point.setColor(z + (1 - z) * (ny) * (1-a), nx* (1 - z) * .5, b * z * ny);
            //point.setColor(a * z, b * z, z * d);
            //point.setColor(d, nx * b, 1 - d * a * z);
            point.modifyColor(color => color.set(nx * zi + ny*z, (1-ny) * zi + z * (1-nx), (1-nx) * zi + z * (ny)));
            //point.setBrightness(1-z);
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(60);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }

    normalize(u, excludeLastComponent) {
        if (excludeLastComponent) {
            var last = u.pop();
        }

        var len = this.length(u);

        if (!isFinite(len)) {
            throw "normalize: vector " + u + " has zero length";
        }

        for (var i = 0; i < u.length; ++i) {
            u[i] /= len;
        }

        if (excludeLastComponent) {
            u.push(last);
        }

        return u;
    }

    length(u) {
        return Math.sqrt(this.dot(u, u));
    }

    dot(u, v) {
        if (u.length != v.length) {
            throw "dot(): vectors are not the same dimension";
        }

        var sum = 0.0;
        for (var i = 0; i < u.length; ++i) {
            sum += u[i] * v[i];
        }

        return sum;
    }


}
