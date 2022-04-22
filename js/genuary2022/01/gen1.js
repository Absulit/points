import RGBAColor from '../../color.js';

export default class Gen1 {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);

        const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen

        screen.points.forEach(point => {
            //point.setBrightness(Math.random())
            const { x, y, z } = point.coordinates;
            //console.log(point.coordinates, point.position);debugger
            //console.log(point.position, point.coordinates);
            point.setColor(x/side, y/side, ucos)
        });
    }
}
