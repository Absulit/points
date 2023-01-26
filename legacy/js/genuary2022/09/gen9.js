import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

export default class Gen9 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }*/

        if (screen.numColumns != 400) {
            throw new Error(`This demo needs 400 side`);
        }

        this._constant = screen.numColumns / 100;



        //this.drawColumn(10, 10, 50, 80);
    }

    drawColumn(x, y, w, h, color) {
        color = color || new RGBAColor(1, 1, 1);

        const topH = 10;
        this._screen.drawRect(x, y, w, topH, color);

        const halfW = Math.round(w / 2);
        const columnW = w - (topH*2);
        const columnH = h - (topH * 2);
        this._screen.drawRect(
            x + halfW - (columnW / 2),
            y + topH,
            columnW,
            columnH,
            color
        );
        this._screen.drawRect(x, y + h - topH, w, topH, color);

        // ------------ stripes
        const stripeSpace = Math.round(columnW * .33);

        this._screen.drawRect(
            x + halfW - (columnW / 2),
            y + topH,
            Math.round(columnW/5),
            columnH * .9,
            color
        );
        this._screen.drawRect(
            x + halfW - (columnW / 2) + stripeSpace,
            y + topH,
            Math.round(columnW/5),
            columnH * .9,
            color
        );
        this._screen.drawRect(
            x + halfW - (columnW / 2) + (stripeSpace * 2),
            y + topH,
            Math.round(columnW/5),
            columnH * .9,
            color
        );



    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        const startX = 0;
        const startY = 50;
        for (let i = 0; i < 10; i++) {

            const xCurve = (Math.sin((i / .01) - utime) * 50)

            const space = 10;
            const w = 50;
            const h = 100 + Math.round(  Math.abs(50*usin) );
            const x = startX + (i * w) + (i * space);
            const y = Math.round(startY + xCurve);

            this.drawColumn(x, y, w, h);

        }


        this._effects.chromaticAberration(.05, 2);
        this._effects.fire(2);
        this._effects.soften2(3);
        this._screen.clearMix(this._clearMixColor, 1.5);
    }
}
