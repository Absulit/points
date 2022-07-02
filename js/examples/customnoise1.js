import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import MathUtil from '../mathutil.js';

export default class CustomNoise1 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;


        const cellSize = 9 * 2;

        const rows = {};
        const corners = [];
        let lastPoint = null;
        const firstPointOfRows = [];
        screen.points.forEach((point, index) => {
            if (point.coordinates.x % cellSize == 0 && point.coordinates.y % cellSize == 0) {

                rows[point.coordinates.y] = rows[point.coordinates.y] || [];
                rows[point.coordinates.y].push(point);

                point.setBrightness(Math.random());
                lastPoint = point;

                corners.push(point);
            } else {
                point.setColor(1, 0, 0);
            }
        });


        for (const rowIndex in rows) {
            const row = rows[rowIndex];
            //console.log(row);
            row.forEach((point, index) => {
                const nextRowPoint = row[index + 1];
                if (nextRowPoint) {
                    // get points in the middle
                    let rightPoint;
                    const middlePoints = [];
                    rightPoint = screen.getRightPoint(point);
                    while (rightPoint != nextRowPoint) {
                        middlePoints.push(rightPoint);
                        rightPoint = screen.getRightPoint(rightPoint);
                    }
                    //console.log(middlePoints);

                    const a = point.getBrightness();
                    const b = nextRowPoint.getBrightness();
                    middlePoints.forEach((middlePoint, index) => {
                        const n = MathUtil.smoothstep(0,1,(index + 1) / cellSize);
                        const lerpBrightness = MathUtil.lerp(a, b, n);
                        middlePoint.setBrightness(lerpBrightness);
                        //middlePoint.setBrightness(index / middlePoints.length);
                    });
                }
            });
            // get first of each row
            firstPointOfRows.push(row[0]);
        }

        firstPointOfRows.forEach((point, index) => {

            let nextRowPoint = firstPointOfRows[index + 1];

            while(point && nextRowPoint){

                if (nextRowPoint) {
                    // get points in the middle
                    let rightPoint;
                    const middlePoints = [];
                    rightPoint = screen.getBottomPoint(point);
                    while (rightPoint != nextRowPoint) {
                        middlePoints.push(rightPoint);
                        rightPoint = screen.getBottomPoint(rightPoint);
                    }
                    //console.log(middlePoints);

                    const a = point.getBrightness();
                    const b = nextRowPoint.getBrightness();
                    middlePoints.forEach((middlePoint, index) => {
                        const n = MathUtil.smoothstep(0,1,(index + 1) / cellSize);
                        const lerpBrightness = MathUtil.lerp(a, b, n);
                        middlePoint.setBrightness(lerpBrightness);
                    });
                }

                point = screen.getRightPoint(point);
                nextRowPoint = screen.getRightPoint(nextRowPoint);
            }
        });

        // this._effects.soften2(1);
        // this._effects.soften2(1);
        // this._effects.soften2(1);


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
