import RGBAColor, { RGBFromHSV } from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import Screen from '../screen.js';
import { print } from '../utils.js';
import ValueNoise from '../valuenoise.js';

export default class Snail1 {
    /**
     * 
     * @param {Screen} screen 
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;

        this._x = 0;
        this._y = 0;

        this._xDirection = 1;
        this._yDirection = 0;

        this._numPoints = screen.numColumns * screen.numRows;
        this._numPointsIndex = 0;
        print(this._numPoints)
    }

    _rotate(){
        if(this._xDirection == 1){
            this._xDirection = 0 ;
            this._yDirection = 1;
        }

        else if(this._yDirection == 1){
            this._xDirection = -1;
            this._yDirection = 0;
        }

        else if (this._xDirection == -1){
            this._xDirection = 0;
            this._yDirection = -1;
        }

        else if (this._yDirection == -1){
            this._yDirection = 0;
            this._xDirection = 1;
        }
    }

    update({ fnusin, sliders, side, utime }) {

        const screen = this._screen;

        if(this._numPointsIndex !== this._numPoints){
            let point = screen.getPointAt(this._x, this._y);
            if(point && !point.visited){
                point.modifyColor(color => {
                    color.set(1,0,0);
                });
                ++this._numPointsIndex;
                point.visited = true;
            }else{
                print(this._numPointsIndex )
                // move to the right
                this._x -= this._xDirection;
                this._y -= this._yDirection;
                this._rotate();
                //print('--- rotate')
            }
    
            this._x += this._xDirection;
            this._y += this._yDirection;
        }



        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering(32);
    }
}
