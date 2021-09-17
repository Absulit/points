import RGBAColor from '../color.js';
class DrawCircle {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._rowCounter = 0;
    }
    update(u_time) {
        if (++this._rowCounter >= this._screen.numRows) {
            this._rowCounter = 0;
        }

        this._screen.clearMix(this._clearMixColor, 1.1);
        let xMovement = Math.sin(u_time) * 20;

        this._screen.drawCircle(this._screen.numColumns / 2 + xMovement, this._screen.numRows / 2,
            (this._screen.numColumns * .6) * Math.cos(u_time),
            1, 0, 0);
    }

    update2(u_time) {
        if (++this._rowCounter >= this._screen.numRows) {
            this._rowCounter = 0;
        }

        this._screen.clearMix(this._clearMixColor, 1.1);
        let xMovement = Math.sin(u_time) * 20;

        let rColor = Math.sin(this._rowCounter) * Math.cos(u_time);


        this._screen.drawCircleOnAngle(this._screen.center.x + xMovement, this._screen.center.y,
            (this._screen.numColumns * .6) * Math.cos(u_time),
            point => {
                rColor = Math.random();
                point.setColor(rColor, rColor, rColor);
            });
    }
}

export default DrawCircle;