import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

// applied from https://generativeartistry.com/tutorials/circle-packing/

export default class Gen12 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }*/

        /*if (screen.numColumns != 400) {
            throw new Error(`This demo needs 400 side`);
        }*/

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        //screen.layerIndex = 0;//--------------------------- LAYER 0

        this._circles = [];
        this._minRadius = .5 * this._constant;
        this._maxRadius = 25 * this._constant;
        this._totalCircles = 125 * this._constant;
        this._createCircleAttempts = 125 * this._constant;

        this._circleCounter = 0;

        /*for (let i = 0; i < this._totalCircles; i++) {
            this.createAndDrawCircle();
        }*/

        //this._effects.antialias(3);

    }


    createAndDrawCircle() {

        let circle;
        let circleSafeToDraw = false;
        for (let tries = 0; tries < this._createCircleAttempts; tries++) {
            circle = {
                x: Math.floor(Math.random() * this._screen.numColumns),
                y: Math.floor(Math.random() * this._screen.numRows),
                radius: this._minRadius,
                currentRadius: 0
            };

            if (this.doesCircleHaveACollision(circle)) {
                continue;
            } else {
                circleSafeToDraw = true;
                break;
            }
        }

        if (!circleSafeToDraw) {
            return;
        }



        for (let radiusSize = this._minRadius; radiusSize < this._maxRadius; radiusSize++) {
            circle.radius = radiusSize;
            //this._screen.drawCircle(circle.x, circle.y, circle.radius, 1, 1, 1);
            if (this.doesCircleHaveACollision(circle)) {
                circle.radius--;
                break;
            }
        }

        this._circles.push(circle);
        //this._screen.drawCircle(circle.x, circle.y, circle.radius, 1, 1, 1);
    }

    doesCircleHaveACollision(circle) {
        for (let i = 0; i < this._circles.length; i++) {
            let otherCircle = this._circles[i];
            let a = circle.radius + otherCircle.radius;
            let x = circle.x - otherCircle.x;
            let y = circle.y - otherCircle.y;

            if (a >= Math.sqrt((x * x) + (y * y))) {
                return true;
            }
        }

        if (circle.x + circle.radius >= this._screen.numColumns ||
            circle.x - circle.radius <= 0) {
            return true;
        }

        if (circle.y + circle.radius >= this._screen.numRows ||
            circle.y - circle.radius <= 0) {
            return true;
        }


        return false;
    }



    update(usin, ucos, side, utime) {
        const screen = this._screen;

        //screen.layerIndex = 1;//--------------------------- LAYER 0

        //console.log('_circleCounter: ', this._circleCounter, ' _totalCircles: ',this._totalCircles)
        if (this._circleCounter++ < this._totalCircles) {
            this.createAndDrawCircle();
            this._circles.forEach(circle => {
                if(circle.currentRadius < circle.radius){
                    this._screen.drawCircle(circle.x, circle.y, circle.currentRadius++, 1, 1, 1);
                }else{
                    this._screen.drawCircle(circle.x, circle.y, circle.radius, 1, 1, 1);
                }
            });
        }else{
            this._circleCounter = 0;
            this._circles = [];
            this._effects.soften2(3);
        }

        this._effects.chromaticAberration(.05, 2);
        // this._effects.fire(1);
        //this._effects.soften2(3);
        this._effects.antialias(3);
        this._screen.clearMix(this._clearMixColor, 1.1);
    }
}
