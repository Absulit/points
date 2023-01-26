import RGBAColor from '../color.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class ColorCoordinates {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen;
        const pointsLength = screen.currentLayer.points.length;
        screen.currentLayer.points.forEach((point, index) => {
            const { x, y, z } = point.coordinates;
            const { r, g, b } = point.color;
            const indexPercent = index / pointsLength;

            //const a = rotate( 360 * usin, [x,y,z] );
            //const c = dot( [a[0][0], a[1][1], a[1][2]], [x,y,z] );
            //console.log(a);
            point.setColor(x / side, y / side, z);
            //point.setColor(x/side * indexPercent * ucos, y/side * indexPercent * usin, z);
            //point.setColor((x / side) - .5 * usin, (1 - y / side) - .5 * ucos, z);
            //point.setColor(x / side * (index % 2) * ucos + indexPercent, y / side * (index % 3) * usin, z);
            //point.setColor(a[0][0], a[1][1], a[1][2]);
            //point.setColor(c,c,c);

            /*if(index % 2 == 0){
                point.size = a[2][1] * screen.pointSizeFull * indexPercent;
            }else{
                point.size = a[1][1] * screen.pointSizeFull * indexPercent;
            }*/
            //point.size = usin * screen.pointSizeFull * (x/side);
        });

    }
}
