import RGBAColor from '../color.js';
class SineWave {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._xIndex = 0;
        this._xCurve = 1;
        this._point = null;
        this._centerRows = screen.numRows / 2;
    };

    update(u_time) {
        this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clear();
        for (this._xIndex = 0; this._xIndex < this._screen.numColumns; this._xIndex++) {
            //this._xCurve  = this._centerRows  + Math.round(Math.sin(this._xIndex)*u_time);
            //this._xCurve  = this._centerRows  + Math.round(Math.sin((this._xIndex/u_time)+u_time));
            //this._xCurve  = this._centerRows  + Math.round(  Math.sin((this._xIndex/u_time)+u_time)   *u_time);
            this._xCurve = this._centerRows + Math.round(Math.sin((this._xIndex / 20) + u_time) * 20);
            //this._xCurve  = this._centerRows  + Math.round(  Math.sin((this._xIndex/80)+u_time)   *this._xCurve);// fractal?
            //this._xCurve  = this._centerRows  + Math.round(  Math.sin((this._xIndex/20+this._xCurve )+u_time)   *Math.sin(xCurve)*xIndex);
            if (this._point = this._screen.getPointAt(this._xIndex, this._xCurve)) {
                this._point.setColor(0, 1, 0);
            }

        }
        // draws the point only (first comment for)
        /*if(++this._xIndex >= this._screen.numColumns){
            this._xIndex = 0;
        }*/
    }
}

export default SineWave;