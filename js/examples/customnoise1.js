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


        const cellSize = 9;

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

        // screen.points.forEach(point => {
        //     if (!corners.includes(point)) {
        //         const topLeftX = Math.floor(point.coordinates.x / cellSize) * cellSize;
        //         const topLeftY = Math.floor(point.coordinates.y / cellSize) * cellSize;
        //         const topLeft = screen.getPointAt(topLeftX, topLeftY);
        //         const topRight = screen.getPointAt(topLeftX + cellSize, topLeftY);
        //         const bottomLeft = screen.getPointAt(topLeftX, topLeftY + cellSize);
        //         const bottomRight = screen.getPointAt(topLeftX + cellSize, topLeftY + cellSize);

        //         if (topLeft && topRight && bottomLeft && bottomRight) {

        //             const dTopLeft = MathUtil.distance(point.coordinates, topLeft.coordinates) / cellSize;
        //             const dTopRight = MathUtil.distance(point.coordinates, topRight.coordinates) / cellSize;
        //             const dBottomLeft = MathUtil.distance(point.coordinates, bottomLeft.coordinates) / cellSize;
        //             const dBottomRight = MathUtil.distance(point.coordinates, bottomRight.coordinates) / cellSize;


        //             const ddTopLeft = (1 - dTopLeft) * topLeft.getBrightness();
        //             const ddTopRight = (1 - dTopRight) * topRight.getBrightness();
        //             const ddBottomLeft = (1 - dBottomLeft) * bottomLeft.getBrightness();
        //             const ddBottomRight = (1 - dBottomRight) * bottomRight.getBrightness();

        //             //const larpTopLeft = MathUtil.lerp()

        //             const d = ddTopLeft + ddTopRight + ddBottomLeft + ddBottomRight;
        //             //console.log(ddTopLeft, ddTopRight, ddBottomLeft, ddBottomRight);
        //             point.setBrightness(d);
        //         }
        //     }
        // });



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
                        const lerpBrightness = MathUtil.lerp(a, b, (index + 1) / cellSize)
                        middlePoint.setBrightness(lerpBrightness);
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
                        const lerpBrightness = MathUtil.lerp(a, b, (index + 1) / cellSize)
                        middlePoint.setBrightness(lerpBrightness);
                    });
                }

                point = screen.getRightPoint(point);
                nextRowPoint = screen.getRightPoint(nextRowPoint);
            }
        });

        this._effects.soften2(1);
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
