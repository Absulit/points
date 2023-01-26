import RGBAColor from '../color.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class PlanetaryLines2 {
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

        this._planets = [
            // { radius: 5 * this._constant, speed: 10, angle: Math.random() * 360 },
            // { radius: 10 * this._constant, speed: 7, angle: Math.random() * 360 },
            // { radius: 13 * this._constant, speed: 6, angle: Math.random() * 360 },
            // { radius: 16 * this._constant, speed: 5, angle: Math.random() * 360 },
            // { radius: 20 * this._constant, speed: 5, angle: Math.random() * 360 },
            {
                radius: 23 * this._constant, speed: 11, angle: Math.random() * 360,
                moon: { radius: 11 * this._constant, speed: 53, angle: Math.random() * 360 }
            },
            // { radius: 27 * this._constant, speed: -1, angle: Math.random() * 360 },
            //{ radius: 32 * this._constant, speed: .1, angle: Math.random() * 360 },
        ];

        this._pointList = [];
    }

    spinPlanetoid = (planet, startPoint) => {
        startPoint = startPoint || {x:0,y:0}

        const screen = this._screen;
        let pointFromCenter, point, radians;
        let cx = startPoint.x || this._center.x, cy = startPoint.y || this._center.y;
        radians = MathUtil.radians(planet.angle);
        pointFromCenter = MathUtil.vector(planet.radius, radians);
        point = screen.getPointAt(Math.floor(pointFromCenter.x + cx), Math.floor(pointFromCenter.y + cy));
        this._pointList.push(point);
        if (point) {
            const { x, y } = point.normalPosition;
            point.setColor(1 - x, 1 - y, x);
        }

        // if greater than 360 set back to zero, also increment
        planet.angle = (planet.angle * (planet.angle < 360) || 0) + (planet.speed * .3);

        if (planet.moon) {
            this.spinPlanetoid(planet.moon, point.coordinates);
        }
    }

    update(usin, ucos, side, utime, nusin) {
        const screen = this._screen

        let cx = this._center.x, cy = this._center.y;

        let point = screen.getPointAt(cx, cy);
        point.setColor(1, 1, 0);
        // screen.getPointsAround(point).forEach(pointAround => {
        //     pointAround.setColor(1,1,0);
        // })

        this._pointList = [];
        this._planets.forEach(this.spinPlanetoid);
        
        const pointList = this._pointList;
        screen.drawLineWithPoints(pointList[0], pointList[1]);
        // screen.drawLineWithPoints(pointList[2], pointList[1]);
        // screen.drawLineWithPoints(pointList[2], pointList[3]);
        // screen.drawLineWithPoints(pointList[4], pointList[3]);
        // screen.drawLineWithPoints(pointList[4], pointList[5]);
        // screen.drawLineWithPoints(pointList[6], pointList[5]);
        // screen.drawLineWithPoints(pointList[6], pointList[7]);


        //this._effects.chromaticAberration(.05, 2);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.01);
        //this._effects.soften1(3);
        //this._effects.antialias(3);

    }
}
