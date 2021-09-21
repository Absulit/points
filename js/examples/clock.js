import RGBAColor from '../color.js';
import MathUtil from '../mathutil.js';

class Clock {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);

        this._secondsAngle = 0;
        this._minutesAngle = 0;
        this._hoursAngle = 0;
        this._deg90Rads = Math.PI / 2;
        this._centerColumns = screen.numColumns / 2;
        this._centerRows = screen.numRows / 2;
        this._secondsColor = new RGBAColor(1, 0, 0);
        this._minutesColor = new RGBAColor(0, 0, .8);
        this._hoursColor = new RGBAColor(.1, .5, .1);

        this._date = null;
        this._hours = null;
        this._minutes = null;
        this._seconds = null;

        this._secondTick = false;
        this._secondCounter = 0;
    }

    update() {
        this._secondTick = false;
        if (++this._secondCounter === 60) {
            this._secondCounter = 0;
            this._secondTick = true;
        }
        // clock
        this._screen.clearMix(this._clearMixColor, 1.1);
        
        //this._screen.clearMixPoints(this._screen.lastModifiedPoints, this._clearMixColor, 2);
        if (this._secondTick) {
            this._date = new Date();
            this._hours = this._date.getHours(); // 24h format
            this._hours = this._hours > 12 ? this._hours - 12 : this._hours;
            this._minutes = this._date.getMinutes();
            this._seconds = this._date.getSeconds();
            // substract deg90Rads because the rotation is 90 degs to the right
            this._secondsAngle = ((this._seconds / 60) * Math.PI * 2) - this._deg90Rads;
            this._minutesAngle = ((this._minutes / 60) * Math.PI * 2) - this._deg90Rads;
            this._hoursAngle = ((this._hours / 12) * Math.PI * 2) - this._deg90Rads;

        }
        this._screen.drawLineRotation(this._centerColumns, this._centerRows, this._centerRows * 1, this._hoursAngle, this._hoursColor);
        this._screen.drawLineRotation(this._centerColumns, this._centerRows, this._centerRows * .8, this._minutesAngle, this._minutesColor);
        this._screen.drawLineRotation(this._centerColumns, this._centerRows, this._centerRows * .9, this._secondsAngle, this._secondsColor);
    }
}

export default Clock;