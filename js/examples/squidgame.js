import RGBAColor from '../color.js';
import Effects from '../effects.js';

class SquidGame {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);

        const numColumns = screen.numColumns;

        this._distance = numColumns / 4; // num of symbols

        this._constant = (numColumns / 100);
        this._radius = this._constant * 30;

        this._timeCounter = 0;

        this._black = new RGBAColor(0, 0, 0);
        this._pink = new RGBAColor(1, 0.360, 0.505);
        this._white = new RGBAColor(1, 1, 1);
    }

    update(utime, usin, ucos) {
        this._screen.layerIndex = 0;

        this.drawSymbols(this._pink);
        this._effects.antialias();

        this._effects.fire(2);
        this._effects.scanLine(this._constant * 3);
        this._screen.clearMix(this._black, 1.1);


        /*this._screen.layerIndex = 1;
        this.drawSymbols(this._white);
        this._effects.fire(2);
        this._effects.antialias();
        this._effects.chromaticAberration();
        //this._effects.soften1();
        this._screen.clearMix(this._black, 1.1);*/


        ++this._timeCounter;
    }

    drawSymbols(color) {
        if (this._timeCounter < (60 * 3)) {
            this._screen.drawPolygon(this._screen.center.x, this._screen.center.y, this._radius * .8, 30, color, 30);
        } else if (this._timeCounter < (60 * 6)) {
            this._screen.drawPolygon(this._screen.center.x, this._screen.center.y + (this._constant * 3), this._radius, 3, color, 30);
        } else if (this._timeCounter < (60 * 9)) {
            this._screen.drawPolygon(this._screen.center.x, this._screen.center.y, this._radius, 4, color, 45);
        } else {
            this._timeCounter = 0;
            this._screen.clear();
        }
    }
}

export default SquidGame;
