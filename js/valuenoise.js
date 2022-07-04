import MathUtil from "./mathutil.js";

export default class ValueNoise {
    constructor(width, height) {
        this._width = width;
        this._height = height;

        this._cellSize = 64;

        this._data = Array(width * height).fill(0).map(() => ({}));

        this._rows = {};
        this._corners = [];
        this._firstPointOfRows = [];

        this._randomData = [];
    }

    get data() {
        return this._data;
    }

    get cellSize() {
        return this._cellSize;
    }

    set cellSize(value) {
        this._cellSize = value;
    }

    /**
     * Creates the random data for the array based on `_width` and `_height`.
     * It creates `point.x` and `point.y` based on the same dimensions.
     * Also fills other lists with data that will be used to calculate the value noise.
     */
    _fillWithRandomData() {
        this._rows = {};
        this._corners = [];
        let randomDataIndex = 0;
        this._data.forEach((point, index) => {
            const x = index % this._width
            const y = Math.floor(index / this._width)

            point.index = index;
            point.x = x;
            point.y = y;
            point.value = 0;

            if (x % this._cellSize == 0 && y % this._cellSize == 0) {

                this._rows[y] = this._rows[y] || [];
                this._rows[y].push(point);

                const rx = x / this._cellSize;
                const ry = y / this._cellSize;

                randomDataIndex = rx + (ry * this._width);
                let randomDatum = this._randomData[randomDataIndex];
                if (!randomDatum) {
                    randomDatum = this._randomData[randomDataIndex] = Math.random();
                }
                point.value = randomDatum;
                this._corners.push(point);

                ++randomDataIndex;
            }
        });
    }

    /**
     * Firts creates points based on `_cellSize` and
     * then interpolates color between them.
     */
    _createdSpacedPointsAndHorizontalInterpolation() {
        this._firstPointOfRows = [];
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
    }

    /**
     * Interpolates vertically between the horizontal interpolated lines previously created.
     *
     */
    _verticalInterpolation() {
        for (let index in this._firstPointOfRows) {
            if (Object.hasOwnProperty.call(this._firstPointOfRows, index)) {
                index = Number(index);
                let point = this._firstPointOfRows[index];

                let nextRowPoint = this._firstPointOfRows[index + 1];
                let k = 0;
                while (point && nextRowPoint) {
                    // get points in the middle
                    const middlePoints = [];
                    let rightPoint = this._getBottomPoint(point);
                    while (rightPoint && rightPoint != nextRowPoint) {
                        middlePoints.push(rightPoint);
                        rightPoint = this._getBottomPoint(rightPoint);
                    }

                    const a = point.value;
                    const b = nextRowPoint.value;

                    middlePoints.forEach((middlePoint, index) => {
                        const n = MathUtil.smoothstep(0, 1, (index + 1) / this._cellSize);
                        const lerpBrightness = MathUtil.lerp(a, b, n);
                        middlePoint.value = lerpBrightness;
                    });

                    point = this._getRightPoint(point);
                    nextRowPoint = this._getRightPoint(nextRowPoint);

                    if (k++ == this._width - 1) {
                        break;
                    }
                }

            }
        }
    }

    generate() {
        this._fillWithRandomData();
        this._createdSpacedPointsAndHorizontalInterpolation();
        this._verticalInterpolation();
    }

    _getRightPoint(point) {
        return this._data[point.index + 1] || null;
    }
    _getBottomPoint(point) {
        return this._data[point.index + this._width] || null;
    }
}