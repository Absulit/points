import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class Julio1 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);
     
    }

    update({ fnucos, fnusin, fusin, side, fnsin, usin, ucos }) {
        //console.log(usin)
        const screen = this._screen;
        screen.clear();

        //this._screen.clear();

        
        screen.points.forEach(point => {
            const { x: nx, y: ny } = point.normalPosition;

            const centerClone = screen.center.clone();
            centerClone.x *= fnusin(1);

            const d = MathUtil.distance(point.coordinates, centerClone) / side ;

            const checkers = fnsin(nx * 20) * fnsin(ny * 20);
            const lines = Math.sin(Math.sin(nx * 50) );
            const z = d * lines;

            //point.setColor(z, 0, ny * dcheckers);
            point.setBrightness(lines);
        });
        //screen.drawCircle(screen.center.x, screen.center.y, 10 * this._constant, 1,0,0)


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(60);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }


}
