import RGBAColor from '../color.js';
class WaveNoise {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._totalPoints = screen.points.length;
        this._point = null;
        this._pointA = null;
        this._rowCounter = 0;
    }

    update(u_time) {
        for (let index = 0; index < this._totalPoints; index++) {
            this._point = this._screen.getRandomPoint();
            let { x, y } = this._point.coordinates;
            //this._point.setColor(Math.cos(index + u_time + x*x) , Math.sin(u_time + -x + y*y), 0, 1);
            this._point.setColor(Math.sin(u_time + -x + y * y), Math.sin(u_time + -x + y * y), Math.sin(u_time + -x + y * y), 1);
            //this._point.setColor(Math.sin(u_time*x*x) , Math.sin(u_time*x*x), Math.sin(u_time*x*x), 1);
        }
    }

    update2(u_time, usin) {
        for (let index = 0; index < this._totalPoints / 1; index++) {
            this._point = this._screen.getRandomPoint();
            let { x, y } = this._point.coordinates;
            //this._point.setColor( Math.sin(u_time) , Math.sin(y) , Math.sin(x) , 1);
            //this._point.setColor(Math.sin(u_time / 4), Math.sin(y * x), Math.sin(x * y), 1);
            this._point.setColor(Math.sin(u_time / 4), Math.sin(y * x) * usin, Math.sin(x * y), 1);
        }
    }

    scanLine() {
        for (let columIndex = 0; columIndex < this._screen.numColumns; columIndex++) {
            for (let rowIndex = 0; rowIndex < this._screen.numRows; rowIndex++) {
                this._pointA = this._screen.getPointAt(columIndex, rowIndex + 1);
                if (this._pointA) {
                    this._screen.movePointTo(this._pointA, columIndex, this._rowCounter - 1);
                }
            }
        }
        if (++this._rowCounter >= this._screen.numRows) {
            this._rowCounter = 0;
        }
    }

    scanLine2() {
        for (let columIndex = 0; columIndex < this._screen.numColumns; columIndex++) {
            this._pointA = this._screen.getPointAt(columIndex, this._rowCounter);
            if (this._pointA) {
                this._screen.movePointTo(this._pointA, columIndex, this._rowCounter - 1);
                this._screen.movePointTo(this._pointA, columIndex, this._rowCounter - 2);
                this._screen.movePointTo(this._pointA, columIndex, this._rowCounter - 3);
            }
        }

        if (++this._rowCounter >= this._screen.numRows) {
            this._rowCounter = 0;
        }
    }
}

export default WaveNoise;