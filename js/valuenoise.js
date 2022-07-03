import MathUtil from "./mathutil.js";
import { print } from "./utils.js";

export default class ValueNoise {
    constructor(width, height) {
        this._width = width;
        this._height = height;

        this._cellSize = 9;

        this._data = Array(width * height).fill(0).map(() => ({}));

        this._rows = {};
        this._corners = [];
        this._firstPointOfRows = [];
    }

    generate() {

        this._data.forEach((point, index) => {
            const x = index % this._width
            const y = Math.floor(index / this._width)

            //print(x,y)
            point.index = index;
            point.x = x;
            point.y = y;
            point.value = 0;
            if (x % this._cellSize == 0 && y % this._cellSize == 0) {

                this._rows[y] = this._rows[y] || [];
                this._rows[y].push(point);

                point.value = Math.random();
                //print(point)
                this._corners.push(point);
            }
        });
        //print(this._data);
        //debugger;

        for (const rowIndex in this._rows) {
            const row = this._rows[rowIndex];

            row.forEach((point, index) => {
                const nextRowPoint = row[index + 1];
                if (nextRowPoint) {
                    // get points in the middle
                    let rightPoint;
                    const middlePoints = [];
                    rightPoint = this._getRightPoint(point);
                    while (rightPoint && rightPoint != nextRowPoint) {
                        middlePoints.push(rightPoint);
                        rightPoint = this._getRightPoint(rightPoint);
                    }

                    const a = point.value;
                    const b = nextRowPoint.value;
                    middlePoints.forEach((middlePoint, index) => {
                        const n = MathUtil.smoothstep(0, 1, (index + 1) / this._cellSize);
                        const lerpBrightness = MathUtil.lerp(a, b, n);
                        middlePoint.value = lerpBrightness;
                    });
                }
            });
            // get first of each row
            this._firstPointOfRows.push(row[0]);
        }

        print(this._firstPointOfRows);
        //debugger;

        //this._firstPointOfRows.forEach((point, index) => {
        for (let index in this._firstPointOfRows) {
            if (Object.hasOwnProperty.call(this._firstPointOfRows, index)) {
                print(index)
                index = Number(index);
                let point = this._firstPointOfRows[index];

                let nextRowPoint = this._firstPointOfRows[index + 1];
                print(1 + index)
                while (point && nextRowPoint) {

                    if (nextRowPoint) {
                        // get points in the middle
                        const middlePoints = [];
                        //let rightPoint = screen.getBottomPoint(point);
                        let rightPoint = this._getBottomPoint(point);
                        //print((rightPoint != nextRowPoint))
                        while (rightPoint && rightPoint != nextRowPoint) {
                            middlePoints.push(rightPoint);
                            //rightPoint = screen.getBottomPoint(rightPoint);
                            rightPoint = this._getBottomPoint(rightPoint);
                            //console.log(0);
                        }
                        //console.log(middlePoints);


                        const a = point.value;
                        const b = nextRowPoint.value;

                        middlePoints.forEach((middlePoint, index) => {
                            const n = MathUtil.smoothstep(0, 1, (index + 1) / this._cellSize);
                            const lerpBrightness = MathUtil.lerp(a, b, n);
                            middlePoint.value = lerpBrightness;
                            //print(middlePoint.value, a, b, n);
                        });

                    }

                    point = this._getRightPoint(point);
                    nextRowPoint = this._getRightPoint(nextRowPoint);
                }

                // if (index == 1) {
                //     break;
                // }
            }
        }
        //});
    }

    _getRightPoint(point) {
        return this._data[point.index + 1] || null;
    }
    _getBottomPoint(point) {
        return this._data[point.index + this._width] || null;
    }
}