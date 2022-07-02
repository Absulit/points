import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';
import { print } from '../utils.js';

export default class CustomNoise2 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;


        const side = screen.numColumns;


        this._seed = [];
        for (let index = 0; index < side; index++) {
            this._seed.push(Math.random());
        }

        let scale = 1;
        let pitch = this._seed.length;
        let result = Array(side).fill(0);

        let scaleSum = 0;

        print(this._seed);

        while (pitch >= 1) {

            print(scale, pitch);

            for (let pitchIndex = 0; pitchIndex <= this._seed.length; pitchIndex += pitch) {
                let modIndex = pitchIndex % this._seed.length;
                const seedNumber = this._seed[modIndex];
                //print(seedNumber)

                result[modIndex] += seedNumber //* scale;
                scaleSum += scale;
            }
            scale *= .5;
            pitch *= .5;
        }
        print(result);

        screen.points.forEach((point, index) => {
            const b = result[index % result.length];
            point.setBrightness(b / scaleSum);
        });

        // result.forEach((r, index) => {
        //     const b = result[index % result.length];
        //     const point = screen.getPointAt(index, Math.floor(b / scaleSum * screen.numRows));
        //     if (point) {
        //         point.setBrightness(1);
        //     }
        // })

        // https://www.youtube.com/watch?v=6-0UaeJBumA
    }



    update({ fnucos, sliders }) {

        const screen = this._screen;
        //screen.clear();



        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
