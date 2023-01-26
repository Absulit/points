import RGBAColor from '../color.js';

class Matrix {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._xIndex = 0;
        this._yIndex = 0;
        this._speeds = {}
        this._point = null;
        this._ySpeed = null;
    }

    update() {
        this._screen.clearMix(this._clearMixColor, 1.1);
        if (this._yIndex >= this._screen.numRows) {
            this._yIndex = 0;
        }
        //let ysin = Math.round(Math.abs(Math.sin(u_time / 1)) * numRows);
        //this._speeds = {};
        for (this._xIndex = 0; this._xIndex < this._screen.numColumns; this._xIndex++) {
            this._ySpeed = this._speeds[this._xIndex];
            if (!this._ySpeed) {
                this._ySpeed = {
                    increment: Math.round(Math.random() * 10) + 1,
                    value: Math.round(Math.random() * 5),
                    green: Math.random()
                };
                this._speeds[this._xIndex] = this._ySpeed;
            }
            this._ySpeed.value += this._ySpeed.increment;
            if (this._ySpeed.value >= this._screen.numRows) {
                this._speeds[this._xIndex] = null;
            }
            this._point = this._screen.getPointAt(this._xIndex, this._ySpeed.value);
            if (this._point) {
                this._point.setColor(0, this._ySpeed.green, 0);
            }
        }
        ++this._yIndex;
    }
}

export default Matrix;