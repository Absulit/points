import RGBAColor from './color.js';
import Point from './point.js';
import MathUtil from './mathutil.js';
import Coordinate from './coordinate.js';

class Screen {
    constructor(canvas, numColumns = 10, numRows = 10, numMargin = 2) {
        this._canvas = canvas;
        this._numColumns = numColumns;
        this._numRows = numRows;
        this._numMargin = numMargin;
        this._pointSizeFull = 0;

        this._center = new Coordinate(Math.round(numColumns / 2), Math.round(numRows / 2));

        this._columns = [];
        this._rows = [];
        this._points = [];
        this._pointSize = 1;
        this._init();
    }

    _init() {
        let pixelSize = 1;
        if (this._numColumns > this._numRows) {
            pixelSize = this._canvas.width / this._numColumns;
        } else {
            pixelSize = this._canvas.height / this._numRows;
        }

        let halfSize = pixelSize / 2;
        let row;
        let point;
        for (let yCoordinate = 0; yCoordinate < this._numRows; yCoordinate++) {
            row = [];
            for (let xCoordinate = 0; xCoordinate < this._numColumns; xCoordinate++) {
                point = new Point();
                point.position.set((xCoordinate * pixelSize) + halfSize, (yCoordinate * pixelSize) + halfSize, 0);
                point.setColor(Math.random(), 1, Math.random(), 1);

                this._points.push(point);
                row.push(point);
            }
            this._rows.push(row);
        }

        // pre fill with the amount of columns
        for (let index = 0; index < this._numColumns; index++) {
            this._columns.push([]);
        }

        this._rows.forEach(row => {
            row.forEach((point, index) => {
                this._columns[index].push(point);
            });
        });

        this._pointSizeFull = pixelSize;
        this._pointSize = pixelSize - this._numMargin;
    }

    get numColumns() {
        return this._numColumns;
    }
    get numRows() {
        return this._numRows;
    }

    get rows() {
        return this._rows;
    }

    get points() {
        return this._points;
    }

    set points(value) {
        this._points = value;
    }

    get pointSize() {
        return this._pointSize;
    }

    get center() {
        return this._center;
    }

    getPointAt(columnIndex, rowIndex) {
        let row = this._rows[rowIndex];
        let point = null;
        if (row) {
            point = row[columnIndex];
        }
        if (point) {
            point.setCoordinates(columnIndex, rowIndex, 0);
        }
        return point;
    }

    getPointAtCoordinate(x, y) {
        let pointWidth = this._pointSizeFull;
        let columnIndex = Math.floor(x / pointWidth);
        let rowIndex = Math.floor(y / pointWidth);
        return this.getPointAt(columnIndex, rowIndex);
    }

    getRandomPoint() {
        let columnIndex = Math.floor(Math.random() * this._numColumns);
        let rowIndex = Math.floor(Math.random() * this._numRows);
        let row = this._rows[rowIndex];
        let point = row[columnIndex];
        point.setCoordinates(columnIndex, rowIndex, 0);
        return point;
    }

    clear(color = null) {
        this._rows.forEach(row => {
            row.forEach(point => {
                if (color) {
                    // TODO: check why point.color = color does not work
                    point.setColor(color.r, color.g, color.b, color.a);
                } else {
                    point.setColor(0, 0, 0);
                }
            });
        });
    }

    clearMix(color, level = 2, layer = 0) {
        let pointColor = null;
        this._rows.forEach(row => {
            row.forEach(point => {
                if(point.layer === layer){
                    pointColor = point.color;
                    point.setColor(
                        (pointColor.r + color.r) / level,
                        (pointColor.g + color.g) / level,
                        (pointColor.b + color.b) / level,
                        (pointColor.a + color.a));
                }
            });
        });
    }

    /*fade(level = 2, layer = 0) {
        let pointColor = null;
        this._rows.forEach(row => {
            row.forEach(point => {
                if(point.layer === layer){
                    pointColor = point.color;
                    point.setColor(
                        (pointColor.r + color.r) / level,
                        (pointColor.g + color.g) / level,
                        (pointColor.b + color.b) / level,
                        (pointColor.a + color.a));
                }
            });
        });
    }*/

    clearMixPoints(points, color, level = 2) {
        let pointColor = null;
        points.forEach(point => {
            pointColor = point.color;
            point.setColor(
                (pointColor.r + color.r) / level,
                (pointColor.g + color.g) / level,
                (pointColor.b + color.b) / level,
                (pointColor.a + color.a));
        });

    }

    /**
     * Move a `Point` to another coordinate in the `Screen`.
     * @param {Point} point
     * @param {Number} columnIndex
     * @param {Number} rowIndex
     */
    movePointTo(point, columnIndex, rowIndex, layer = 0) {
        let pointToReplace = this.getPointAt(columnIndex, rowIndex);
        let { r, g, b } = point.color;
        if (pointToReplace) {
            pointToReplace.layer = layer;
            pointToReplace.setColor(r, g, b);
            //pointToReplace.color = new RGBAColor(1,0,0);
        }
        return pointToReplace;
    }

    /**
     * Creates a line between two `Point`s,
     * and uses the first point color to color the line.
     * @param {Point} pointA
     * @param {Point} pointB
     */
    drawLineWithPoints(pointA, pointB, layer = 0) {
        let x0 = pointA.coordinates.x;
        let y0 = pointA.coordinates.y;

        let x1 = pointB.coordinates.x;
        let y1 = pointB.coordinates.y;
        let color = pointA.color;

        if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
            if (x0 > x1) {
                this._plotLineLow(x1, y1, x0, y0, color, layer);
            } else {
                this._plotLineLow(x0, y0, x1, y1, color, layer);
            }
        } else {
            if (y0 > y1) {
                this._plotLineHigh(x1, y1, x0, y0, color, layer);
            } else {
                this._plotLineHigh(x0, y0, x1, y1, color, layer);
            }
        }
    }

    drawLine(x0, y0, x1, y1, color, layer = 0) {
        if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
            if (x0 > x1) {
                this._plotLineLow(x1, y1, x0, y0, color, layer);
            } else {
                this._plotLineLow(x0, y0, x1, y1, color, layer);
            }
        } else {
            if (y0 > y1) {
                this._plotLineHigh(x1, y1, x0, y0, color, layer);
            } else {
                this._plotLineHigh(x0, y0, x1, y1, color, layer);
            }
        }
    }

    drawLineRotation(x0, y0, distance, radians, color, layer = 0) {
        let pointFromCenter = MathUtil.vector(distance, radians);
        let finalPoint = { x: Math.round(x0 + pointFromCenter.x), y: Math.round(y0 + pointFromCenter.y) };
        this.drawLine(x0, y0, finalPoint.x, finalPoint.y, color, layer);
        return finalPoint;
    }

    _plotLineLow(x0, y0, x1, y1, color, layer) {
        let dx = x1 - x0
        let dy = y1 - y0
        let yi = 1
        if (dy < 0) {
            yi = -1
            dy = -dy
        }
        let D = (2 * dy) - dx;
        let y = y0;

        for (let x = x0; x < x1; x++) {
            let point = this.getPointAt(x, y);
            if (point) {
                point.layer = layer;
                point.setColor(color.r, color.g, color.b, color.a);
            }
            if (D > 0) {
                y = y + yi
                D = D + (2 * (dy - dx))
            } else {
                D = D + 2 * dy
            }
        }
    }

    _plotLineHigh(x0, y0, x1, y1, color, layer) {
        let dx = x1 - x0;
        let dy = y1 - y0;
        let xi = 1;
        if (dx < 0) {
            xi = -1;
            dx = -dx;
        }
        let D = (2 * dx) - dy;
        let x = x0;

        for (let y = y0; y < y1; y++) {
            let point = this.getPointAt(x, y);
            if (point) {
                point.layer = layer;
                point.setColor(color.r, color.g, color.b, color.a);
            }
            if (D > 0) {
                x = x + xi;
                D = D + (2 * (dx - dy));
            } else {
                D = D + 2 * dx;
            }
        }
    }

    drawCircle(x, y, radius, r, g, b, a = 1, layer = 0) {
        let pointFromCenter, point, radians, angle, lastModifiedPoint;
        for (angle = 0; angle < 360; angle += .1) {
            radians = MathUtil.radians(angle);
            pointFromCenter = MathUtil.vector(radius, radians);
            point = this.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            if (point && (point != lastModifiedPoint)) {
                point.layer = layer;
                point.setColor(r, g, b, a);
                lastModifiedPoint = point;
            }
        }
    }

    /**
     * Same as drawCircle but has a callback to do extra things to the point
     * @param {Number} x
     * @param {Number} y
     * @param {Number} radius
     * @param {Function} callback
     * @param {Number} layer
     */
    drawCircleOnAngle(x, y, radius, callback, layer = 0) {
        let pointFromCenter, point, radians, angle, lastModifiedPoint;
        for (angle = 0; angle < 360; angle += .1) {
            radians = MathUtil.radians(angle);
            pointFromCenter = MathUtil.vector(radius, radians);
            point = this.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            if (point && (point != lastModifiedPoint)) {
                point.layer = layer;
                callback(point);
                lastModifiedPoint = point;
            }
        }
    }

    drawCircleWithPoints(pointA, pointB, layer = 0) {
        console.log({ pointA, pointB })
        let radius = MathUtil.distance(pointA.coordinates, pointB.coordinates);
        let pointFromCenter, point;
        for (let radians = 0; radians < (Math.PI * 2); radians += .001) {
            pointFromCenter = MathUtil.vector(radius, radians);
            point = this.getPointAt(Math.round(pointFromCenter.x + pointA.coordinates.x), Math.round(pointFromCenter.y + pointA.coordinates.y));
            if (point) {
                point.layer = layer;
                point.color = pointA.color;
            }
        }
    }

    drawPolygon(x, y, radius, sides, color, layer = 0) {
        let pointFromCenter, radians, angle;

        let firstVertexX, firstVertexY;
        let lastVertexX, lastVertexY;
        let anglePerSide = 360 / sides;
        for (angle = 0; angle <= 360; angle += anglePerSide) {
            radians = MathUtil.radians(angle);
            pointFromCenter = MathUtil.vector(radius, radians);
            let vertexX = Math.ceil(pointFromCenter.x + x);
            let vertexY = Math.ceil(pointFromCenter.y + y);

            if (lastVertexX) {
                this.drawLine(lastVertexX, lastVertexY, vertexX, vertexY, color, layer);
            }
            if (angle === 0) {
                firstVertexX = vertexX;
                firstVertexY = vertexY;
            }
            lastVertexX = vertexX;
            lastVertexY = vertexY;
        }
        this.drawLine(lastVertexX, lastVertexY, firstVertexX, firstVertexY, color, layer);
    }



}

export default Screen;