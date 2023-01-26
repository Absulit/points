import RGBAColor from '../color.js';

class CostaRicanFlag {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._point = null;
        this._xCurve = 1;
        this._centerRows = screen.numRows / 2;
        this._xIndex = 0;

        this._red = new RGBAColor(1, 0, 0);
        this._white = new RGBAColor(1, 1, 1);
        this._blue = new RGBAColor(0, 0, 1);

        this._selectedColor = new RGBAColor(1, 0, 1);
    }

    update({utime}) {
        this._screen.clearMix(this._clearMixColor, 1.1);
        for (this._xIndex = 0; this._xIndex < this._screen.numColumns; this._xIndex++) {
            this._xCurve = this._centerRows + Math.round(Math.sin((this._xIndex / 40) - utime) * 5);
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve)) {
                this._selectedColor = this._blue;
                this._point.modifyColor(color => color.setColor(this._selectedColor));
            }
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve + 1)) {
                this._selectedColor = this._white;
                this._point.modifyColor(color => color.setColor(this._selectedColor));
            }
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve + 2)) {
                this._selectedColor = this._red;
                this._point.modifyColor(color => color.setColor(this._selectedColor));
            }
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve + 3)) {
                this._selectedColor = this._red;
                this._point.modifyColor(color => color.setColor(this._selectedColor));
            }
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve + 4)) {
                this._selectedColor = this._white;
                this._point.modifyColor(color => color.setColor(this._selectedColor));
            }
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve + 5)) {
                this._selectedColor = this._blue;
                this._point.modifyColor(color => color.setColor(this._selectedColor));
            }
            //this._point && this._point.modifyColor(color => color.setColor(this._selectedColor));

        }
    }
}

export default CostaRicanFlag;