import RGBAColor from '../color.js';

class CostaRicanFlag {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._point = null;
        this._xCurve = 1;
        this._centerRows = screen.numRows/2;
        this._xIndex = 0;
    }

    update(u_time) {
        this._screen.clearMix(this._clearMixColor, 1.1);
        for (this._xIndex = 0; this._xIndex  < this._screen.numColumns; this._xIndex ++) {
            this._xCurve = this._centerRows + Math.round(Math.sin((this._xIndex  / 40) - u_time) * 5);
            if (this._point = this._screen.getPointAt(this._xIndex , this._xCurve)) {
                this._point.setColor(0, 0, 1);
            }
            if (this._point = this._screen.getPointAt(this._xIndex , this._xCurve + 1)) {
                this._point.setColor(1, 1, 1);
            }
            if (this._point = this._screen.getPointAt(this._xIndex , this._xCurve + 2)) {
                this._point.setColor(1, 0, 0);
            }
            if (this._point = this._screen.getPointAt(this._xIndex , this._xCurve + 3)) {
                this._point.setColor(1, 0, 0);
            }
            if (this._point = this._screen.getPointAt(this._xIndex , this._xCurve + 4)) {
                this._point.setColor(1, 1, 1);
            }
            if (this._point = this._screen.getPointAt(this._xIndex , this._xCurve + 5)) {
                this._point.setColor(0, 0, 1);
            }

        }
    }
}

export default CostaRicanFlag;