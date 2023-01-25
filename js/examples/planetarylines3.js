import RGBAColor from '../color.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class PlanetaryLines3 {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }*/

        this._center = screen.center;
        this._effects = new Effects(screen);

        this._constant = screen.numRows / 100

        // https://strangesounds.org/2020/02/sacred-geometry-the-planets-dance-to-the-music-of-the-cosmos.html
        // Replace speed with two numbers from the Fibonacci sequence. Also known as Sacred Geometry
        // https://www.wikiwand.com/en/Fibonacci_number
        this._planets = [
            { radius: 40 * this._constant, speed: 13, angle: 360 },
            { radius: 30 * this._constant, speed: 8 , angle: 360 },
        ]
    }

    update(usin, ucos, side, utime, nusin) {
        const screen = this._screen

        let cx = this._center.x, cy = this._center.y;

        const pointList = [];
        this._planets.forEach(planet => {
            let pointFromCenter, radians;
            radians = MathUtil.radians(planet.angle);
            pointFromCenter = MathUtil.vector(planet.radius, radians);
            const point = screen.getPointAt(Math.floor(pointFromCenter.x + cx), Math.floor(pointFromCenter.y + cy));
            pointList.push(point);
            const { x, y } = point.normalPosition;
            if (point) {
                //point.setColor(1-x, 1-y, x);
                point.setBrightness(1);
            }

            // if greater than 360 set back to zero, also increment
            planet.angle = (planet.angle * (planet.angle < 360) || 0) + (planet.speed * .3);

        });

        screen.drawLineWithPoints(pointList[1], pointList[0]);

        screen.moveColorToLayer(1);

        screen.layerIndex = 1;//--------------------------- LAYER 0

        this._effects.chromaticAberration(.05, 2);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
        this._effects.soften2(3);
        //this._effects.antialias(3);

    }
}
