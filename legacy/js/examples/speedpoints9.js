import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class SpeedPoints9 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        const side = screen.numColumns;

    }

    update({ fnucos, fnusin, fusin, side, fnsin }) {

        const screen = this._screen;
        //screen.clear();

        screen.layerIndex = 0;//--------------------------- LAYER 0
        const centerPoint = screen.getPointAt(
            Math.floor(screen.center.x + 48 * this._constant * fusin(10) * fusin(.5)),
            Math.floor(screen.center.y + 50 * this._constant * fusin(1.5))
        );

        centerPoint && centerPoint.modifyColor(color => color.brightness = 1);

        const centerPoint2 = screen.getPointAt(
            Math.floor(screen.center.x + 48 * this._constant * fusin(9.911)),
            Math.floor(screen.center.y + 30 * this._constant * fusin(9.13)  * fusin(.36) )
        );

        centerPoint2 && centerPoint2.modifyColor(color => color.brightness = 1);

        //screen.drawLineWithPoints(centerPoint, centerPoint2);


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        this._effects.soften2(100);
        //this._effects.antialias();
        this._screen.clearMix(this._clearMixColor, 1.01);
        //this._screen.clearAlpha(1.1);
        //this._effects.orderedDithering();

        screen.layerIndex = 1;//--------------------------- LAYER 0
        screen.points.forEach((point, index) => {
            const { x: nx, y: ny } = point.normalPosition;

            const point0 = screen.getPointFromLayer(point, 0);
            const b = point0.color.brightness;

            const a = Math.sin(nx * 50 + 15 * fnusin(2.545));
            //const b = Math.sin(ny * 50 + 17 * fnusin(.568));

            const d = Math.sin(MathUtil.distance(point.coordinates, screen.center) / side * 50 + 10 * fnusin(.57));

            const z = d * b;
            const zi = 1 - z;

            //point.setColor(z, ny * b, b * z);
            //point.setColor(nx * b, (ny * -b), z * b);
            point.modifyColor(color => color.set(ny * b, nx* b, (1-ny) * b));
        });
        //this._effects.chromaticAberration(.05, 2);

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
