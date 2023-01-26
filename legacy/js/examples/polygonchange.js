import RGBAColor from '../color.js';
class PolygonChange {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._centerColumns = screen.numColumns / 2;
        this._centerRows = screen.numRows / 2;
    }

    update(u_time, usin) {
        this._screen.clearMix(this._clearMixColor, 1.1)
        this._screen.drawPolygon(this._centerRows, this._centerColumns,
            this._screen.numColumns * .4,
            Math.abs(Math.sin(u_time / 2)) * 13,
            new RGBAColor(1, .5, 0));
    }
}

export default PolygonChange;