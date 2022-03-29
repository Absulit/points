import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

// applied from https://generativeartistry.com/tutorials/circle-packing/

export default class Gen14 {
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
        }*/
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        /*if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;

        console.log('---- CONSTANT: ' + this._constant);

        this._xIndex = 0
        this._centerRows = screen.numRows / 2;

        this._DA = 1;
        this._DB = .5;
        this._feed = .055;
        this._k = .062;

        screen.layerIndex = 0;//--------------------------- LAYER 0

        screen.points.forEach(point => {
            point.chemicals = { a: 1, b: 0 }
            point.setColor(0, 0, 0, 0);
        });
        for (let i = 0; i < 10 * this._constant; i++) {
            for (let j = 0; j < 10 * this._constant; j++) {
                const point = screen.getPointAt(i + this._screen.center.x, j + this._screen.center.y);
                point.chemicals.b = 1;
            }
        }

        screen.layerIndex = 1;//--------------------------- LAYER 1

        screen.points.forEach(point => point.chemicals = { a: 1, b: 0 });

    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0
        screen.currentLayer.points.forEach((point, index) => {
            const pointAbove = screen.layers[1].points[index];

            const chemicals = pointAbove.chemicals;
            const { a, b } = chemicals;

            pointAbove.chemicals.a = point.chemicals.a;
            pointAbove.chemicals.b = point.chemicals.b;

            point.chemicals.a = a;
            point.chemicals.b = b;

        });


        screen.layerIndex = 1;
        //screen.clear();

        //screen.currentLayer.points.forEach((point, index) => {
        for (let ix = 1; ix < screen.numColumns - 1; ix++) {
            for (let iy = 1; iy < screen.numRows - 1; iy++) {


                const index = ix + iy * screen.numColumns;
                const point = screen.currentLayer.points[index];

                const pointBelow = screen.layers[0].points[index];
                //const pointBelow = screen.layers[0].points[ix + iy * screen.numColumns];
                //console.log(ix + iy * screen.numColumns)
                //console.log(pointBelow)

                const chemicals = point.chemicals;
                const { a, b } = chemicals;


                //point.chemicals.a = chemicals.a * .9;
                //point.chemicals.b = chemicals.b * .9;

                pointBelow.chemicals.a = a +
                    (this._DA * this.laplace(pointBelow, 'a')) -
                    (a * b * b) +
                    (this._feed * (1 - a));

                pointBelow.chemicals.b = b +
                    (this._DB * this.laplace(pointBelow, 'b')) +
                    (a * b * b) -
                    ((this._k + this._feed) * b);

                pointBelow.chemicals.a = this.clamp(pointBelow.chemicals.a, 0, 1);
                pointBelow.chemicals.b = this.clamp(pointBelow.chemicals.b, 0, 1);

                const c = this.clamp(pointBelow.chemicals.a - pointBelow.chemicals.b, 0, 1);
                point.setBrightness(c);
                //point.setColor(point.chemicals.a, 0, point.chemicals.b);
            }
        }
        //});


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.1);
    }

    clamp(val, min, max) {
        return val > max ? max : val < min ? min : val;
    }

    laplace(point, prop) {
        const pointsAround = this._screen.getPointsAround(point);
        let sum = 0;
        sum += point.chemicals[prop] * -1;

        sum += pointsAround[1] ? pointsAround[1].chemicals[prop] * .2 : 1;
        sum += pointsAround[3] ? pointsAround[3].chemicals[prop] * .2 : 1;
        sum += pointsAround[4] ? pointsAround[4].chemicals[prop] * .2 : 1;
        sum += pointsAround[6] ? pointsAround[6].chemicals[prop] * .2 : 1;

        sum += pointsAround[0] ? pointsAround[0].chemicals[prop] * .05 : 1;
        sum += pointsAround[2] ? pointsAround[2].chemicals[prop] * .05 : 1;
        sum += pointsAround[5] ? pointsAround[5].chemicals[prop] * .05 : 1;
        sum += pointsAround[7] ? pointsAround[7].chemicals[prop] * .05 : 1;
        //console.log(sum)
        return sum;
    }
}
