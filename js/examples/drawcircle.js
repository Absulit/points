import RGBAColor from '../color.js';
class DrawCircle {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._rowCounter = 0;


        this._printCircle = false;
        this._printCircleDistance = 0;
        this._printCirclePoint;
        this._canvas = document.getElementById('gl-canvas');

        this._canvas.addEventListener('mousedown', e => {
            //getCursorPosition(canvas, e);
            this.loadCircle(this._canvas, e);
        })


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

    click() {
        if (this._printCircle) {
            this._screen.drawCircle(this._printCirclePoint.coordinates.x, this._printCirclePoint.coordinates.y,
                this._printCircleDistance,
                1, 0, 0, 1,
                1);

            if (++this._printCircleDistance >= 100) {
                this._printCircle = false;
                this._printCircleDistance = 0;
            }
        }
    }

    loadCircle(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        this._printCirclePoint = this._screen.getPointAtCoordinate(x, y);
        this._printCircle = true;
        this._printCircleDistance = 0;
    }

    getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        console.log("x: " + x + " y: " + y);
        let point = this._screen.getPointAtCoordinate(x, y);
        if (point) {
            point.setColor(1, 0, 0);
        }
    }



}

export default DrawCircle;