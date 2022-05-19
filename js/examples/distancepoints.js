import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class DistancePoints {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);

        this._constant = screen.numColumns / 100;

        this._colorPoints = [
            { coordinate: new Coordinate(10 * this._constant, 30 * this._constant), color: new RGBAColor(1, 0, 0) },
            { coordinate: new Coordinate(60 * this._constant, 10 * this._constant), color: new RGBAColor(0, 1, 0) },
            { coordinate: new Coordinate(80 * this._constant, 70 * this._constant), color: new RGBAColor(0, 0, 1) },

            { coordinate: new Coordinate(10 * this._constant, 90 * this._constant), color: new RGBAColor(1, 1, 0) },
        ]
    }

    update(usin, ucos, side, utime, nusin, nucos) {

        const screen = this._screen;
        screen.clear();

        screen.points.forEach(point => {
            this._colorPoints.forEach(cp => {

                const cpCoordianteClone = cp.coordinate.clone();
                cpCoordianteClone.x += (usin * 10 * this._constant);
                cpCoordianteClone.y += (nucos * 10 * this._constant);

                const distance = MathUtil.distance(point.coordinates, cpCoordianteClone);
                const normalDistance = 1 - (distance / side);

                cp.color.a = normalDistance;

                point.modifyColor(color => color.blend(cp.color));
            })
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.1);
        //this._effects.orderedDithering();


    }

}
