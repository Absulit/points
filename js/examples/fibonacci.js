import RGBAColor from '../color.js';
import Effects from '../effects.js';
export default class Fibonacci {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);


        this._effects = new Effects(screen);

        this._lastPoint = null;

        this.UP = { x: 0, y: -1 };
        this.DOWN = { x: 0, y: 1 };
        this.LEFT = { x: -1, y: 0 };
        this.RIGHT = { x: 1, y: 0 };

        this.UP_RIGHT = { x: 1, y: -1 };
        this.RIGHT_DOWN = { x: 1, y: 1 };
        this.DOWN_LEFT = { x: -1, y: 1 };
        this.LEFT_UP = { x: -1, y: -1 };

        //this._directions = [this.UP, this.RIGHT, this.DOWN, this.LEFT];
        this._directions = [this.UP, this.UP_RIGHT, this.RIGHT, this.RIGHT_DOWN, this.DOWN, this.DOWN_LEFT, this.LEFT, this.LEFT_UP];
        this._directonIndex = 0;

        this._currentDirection = this._directions[this._directonIndex];
        this._previousDirection = null;

        this._counter = 0;
    };

    _directionFW() {
        if ((++this._directonIndex) >= (this._directions.length - 1)) {
            this._directonIndex = 0;
        }
        this._currentDirection = this._directions[this._directonIndex];
    }

    _directionBW() {
        --this._directonIndex;
        if (this._directonIndex < 0) {
            this._directonIndex = this._directions.length - 1;
        }
        this._currentDirection = this._directions[this._directonIndex];
    }

    _drawPoint() {

    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;
        let lastPoint = this._lastPoint;
        screen.layerIndex = 0;

        let point = screen.getPointAt(0, 0);
        point.setColor(1, 0, 0);

        //screen.points.forEach((element, index) => {
            if (lastPoint) {
                let cd = this._currentDirection;
                point = screen.getPointAt(lastPoint.coordinates.x + cd.x, Math.floor(lastPoint.coordinates.y + cd.y));
                //point = screen.getPointAt(lastPoint.coordinates.x + cd.x , Math.floor(lastPoint.coordinates.y + cd.y / usin * 64 ));
                if (point) {
                    //console.log(point.color.equal(new RGBAColor(0,0,0,0)));
                    if (!point.used) {
                        ++this._counter;
                        //point.setColor(this._counter / screen.points.length, 1 - (this._counter / screen.points.length), 0);
                        point.setColor(this._counter / screen.points.length / usin, 1 - (this._counter / screen.points.length) * usin, usin);
                        if(this._counter % 3 == 0){
                            point.used = true;
                            this._directionBW();
                        }else{
                            point.used = false;
                            this._directionFW();
                        }
                        lastPoint = point;
                    } else {
                        //point.used = false
                        this._directionBW();
                    }
                }
            } else {
                const center = screen.center;
                point = screen.getPointAt(center.x, center.y);
                point.setColor(0, 1, 0);
                point.used = true;
                lastPoint = point;
            }

            //
            this._lastPoint = lastPoint;
        //});

        //this._counter = 0;

        //this._screen.clearMix(new RGBAColor(0, 0, 0), 1.001);
        //this._effects.fire(2);
        //this._effects.chromaticAberration(.05, 2);
        //this._effects.soften3();
        //this._effects.antialias();
    }
}
