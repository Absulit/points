import RGBAColor from './color.js';
import Point from './point.js';
import MathUtil from './mathutil.js';
import Coordinate from './coordinate.js';
import Layer from './layer.js';

class Screen {
    constructor(canvas, numColumns = 10, numRows = 10, numMargin = 2, numLayers = 1) {
        this._canvas = canvas;
        this._numColumns = numColumns;
        this._numRows = numRows;
        this._numMargin = numMargin;
        this._numLayers = numLayers;
        this._pointSizeFull = 1;

        this._center = new Coordinate(Math.round(numColumns / 2), Math.round(numRows / 2));

        //this._columns = [];
        //this._rows = [];
        //this._points = [];

        this._layers = [];
        this._mainLayer = null;
        this._layerIndex = 0;

        this._pointSize = 1;
        this._init();
    }

    _init() {
        if (this._numColumns > this._numRows) {
            this._pointSizeFull = this._canvas.width / this._numColumns;
        } else {
            this._pointSizeFull = this._canvas.height / this._numRows;
        }

        this._pointSize = this._pointSizeFull - this._numMargin;
        this._mainLayer = this._createLayer();
        this._createLayers();

    }

    _createLayer() {
        let layer = new Layer();

        let halfSize = this._pointSizeFull / 2; // TODO: make private property
        let row;
        let point;
        for (let yCoordinate = 0; yCoordinate < this._numRows; yCoordinate++) {
            row = [];
            for (let xCoordinate = 0; xCoordinate < this._numColumns; xCoordinate++) {
                point = new Point();
                point.position.set((xCoordinate * this._pointSizeFull) + halfSize, (yCoordinate * this._pointSizeFull) + halfSize, 0);
                //point.setColor(Math.random(), 1, Math.random(), 1);
                point.setCoordinates(xCoordinate, yCoordinate, 0);
                point.color.a = 0;
                point.size = this._pointSize;

                layer.points.push(point);
                row.push(point);
            }
            layer.rows.push(row);
        }

        layer.fillColumns();
        layer.shufflePoints();

        return layer;
    }

    _createLayers() {
        for (let layerIndex = 0; layerIndex < this._numLayers; layerIndex++) {
            this._layers.push(this._createLayer());
        }
        this._currentLayer = this._layers[this._layerIndex];
    }

    mergeLayers() {
        let finalPoints = this._mainLayer.points;
        //let r = Array(finalPoints.length);
        let tempColor, tempSize, tempAtlas;

        finalPoints.forEach((finalPoint, finalPointIndex) => {
            tempColor = { counter: 0, value: new RGBAColor(0, 0, 0, 0) };
            tempSize = { counter: 0, value: 0 };
            tempAtlas = { counter: 0, value: -1 };

            this._layers.forEach(layer => {
                let point = layer.points[finalPointIndex];
                // if top color is alpha 1 just replace it because
                // it will block the ones below
                if (point.modified) {

                    ++tempColor.counter;
                    tempColor.value.add(point.color);
                    if (point.color.a === 1) {
                        tempColor.counter = 0;
                        tempColor.value = point.color;
                    }

                    ++tempSize.counter;
                    tempSize.value += point.size;
                    if (point.size >= this.pointSize) {
                        tempSize.counter = 0;
                        tempSize.value = point.size;
                    }

                    ++tempAtlas.counter;
                    if (tempAtlas.counter === 0) {
                        tempAtlas.counter = 0;
                    }
                    tempAtlas.value = point.atlasId;
                }
            });
            /*if (tempColor.counter) {
                tempColor.value.r /= tempColor.counter;
                tempColor.value.g /= tempColor.counter;
                tempColor.value.b /= tempColor.counter;
                //tempColor.value.a /= tempColor.counter;
            }*/
            if (tempSize.counter) {
                tempSize.value /= tempSize.counter;
            }
            finalPoint.color = tempColor.value;
            finalPoint.size = tempSize.value;
            finalPoint.atlasId = tempAtlas.value;
        });
    }

    get numColumns() {
        return this._numColumns;
    }
    get numRows() {
        return this._numRows;
    }

    get rows() {
        return this._currentLayer.rows;
    }

    get points() {
        return this._currentLayer.points;
    }

    get pointSize() {
        return this._pointSize;
    }

    get pointSizeFull() {
        return this._pointSizeFull;
    }

    get center() {
        return this._center;
    }

    get mainLayer() {
        return this._mainLayer;
    }

    get layers() {
        return this._layers;
    }

    get layerIndex() {
        return this._layerIndex;
    }
    set layerIndex(value) {
        if (value > this._layers.length - 1) {
            throw new Error(`The Screen.layerIndex is greater than the number of layers available (${this._layers.length}).`);
        }
        this._layerIndex = value;
        this._currentLayer = this._layers[value];
    }

    get currentLayer() {
        return this._currentLayer;
    }

    getPointAt(columnIndex, rowIndex) {
        let row = this._currentLayer.rows[rowIndex];
        let point = row && row[columnIndex] || null;
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
        let row = this._currentLayer.rows[rowIndex];
        let point = row[columnIndex];
        point.setCoordinates(columnIndex, rowIndex, 0);
        return point;
    }

    getLeftPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex - distance, rowIndex);
    }
    getRightPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex + distance, rowIndex);
    }

    getTopPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex, rowIndex - distance);
    }

    getBottomPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex, rowIndex + distance);
    }

    getTopLeftPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex - distance, rowIndex - distance);
    }

    getBottomLeftPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex - distance, rowIndex + distance);
    }

    getTopRightPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex + distance, rowIndex - distance);
    }

    getBottomRightPoint(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;

        return this.getPointAt(columnIndex + distance, rowIndex + distance);
    }

    /**
     * Retrieves a list of `Point` around a point.
     * Directly around, in a square, so just 8 Points.
     * @param {*} point 
     * @param {*} distance 
     * @returns 
     */
    getPointsAround(point, distance = 1) {
        let columnIndex = point.coordinates.x;
        let rowIndex = point.coordinates.y;
        return [
            this.getPointAt(columnIndex - distance, rowIndex - distance),   // top left     NW  0
            this.getPointAt(columnIndex, rowIndex - distance),              // top          N   1
            this.getPointAt(columnIndex + distance, rowIndex - distance),   // top right    NE  2
            this.getPointAt(columnIndex - distance, rowIndex),              // left         W   3
            this.getPointAt(columnIndex + distance, rowIndex),              // right        E   4
            this.getPointAt(columnIndex - distance, rowIndex + distance),   // bottom left  SW  5
            this.getPointAt(columnIndex, rowIndex + distance),              // bottom       S   6
            this.getPointAt(columnIndex + distance, rowIndex + distance),   // bottom right SE  7
        ]
    }

    /**
     * Retrieves a list of `Point` around a point.
     * Just NSEW, so just 4 Points.
     * @param {*} point 
     * @param {*} distance 
     * @returns array with [N,S,E,W] `Point`s
     */
    getNSEWPointsAround(point, distance = 1) {
        const columnIndex = point.coordinates.x;
        const rowIndex = point.coordinates.y;
        return [
            this.getPointAt(columnIndex, rowIndex - distance),              // N
            this.getPointAt(columnIndex, rowIndex + distance),              // S
            this.getPointAt(columnIndex + distance, rowIndex),              // E
            this.getPointAt(columnIndex - distance, rowIndex),              // W
        ]
    }

    /**
     * Retrives a list of `Point` around a center point
     * @param {Point} point Center point to retrieve points around.
     * @param {Number} distance How far from the point should we get the points.
     * @param {Number} numPoints How many points. Too many Points and the app slows down.
     * @returns {Point[]} Point[]
     */
    getPointsInCircle(point, distance = 1, numPoints = 8) {
        let { x, y } = point.coordinates;
        let pointFromCenter, radians, angle, pointAround;
        let result = [];
        for (angle = 0; angle < 360; angle += (360 / numPoints)) {
            radians = MathUtil.radians(angle);
            pointFromCenter = MathUtil.vector(distance, radians);
            pointAround = this.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            if (pointAround) {
                result.push(pointAround);
            }
        }
        return result;
    }

    clear(color = null) {
        this._currentLayer.rows.forEach(row => {
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

    clearMix(color, level = 2) {
        let pointColor = null;
        this._currentLayer.rows.forEach(row => {
            row.forEach(point => {
                if (point.modified) {
                    pointColor = point.color;
                    point.setColor(
                        (pointColor.r + color.r) / level,
                        (pointColor.g + color.g) / level,
                        (pointColor.b + color.b) / level,
                        (pointColor.a + color.a)
                    );

                }
                if (point.size < this._pointSize) {
                    point.size = this._pointSize;
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
                //(pointColor.b + color.b) / level,
                (pointColor.a + color.a));
        });

    }

    /**
     * Move a `Point` to another coordinate in the `Screen`.
     * @param {Point} point
     * @param {Number} columnIndex
     * @param {Number} rowIndex
     */
    movePointTo(point, columnIndex, rowIndex) {
        let pointToReplace = this.getPointAt(columnIndex, rowIndex);
        let { r, g, b, a } = point.color;
        if (pointToReplace) {
            pointToReplace.setColor(r, g, b, a);
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
    drawLineWithPoints(pointA, pointB) {
        let x0 = pointA.coordinates.x;
        let y0 = pointA.coordinates.y;

        let x1 = pointB.coordinates.x;
        let y1 = pointB.coordinates.y;
        let color = pointA.color;

        if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
            if (x0 > x1) {
                this._plotLineLow(x1, y1, x0, y0, color);
            } else {
                this._plotLineLow(x0, y0, x1, y1, color);
            }
        } else {
            if (y0 > y1) {
                this._plotLineHigh(x1, y1, x0, y0, color);
            } else {
                this._plotLineHigh(x0, y0, x1, y1, color);
            }
        }
    }

    drawLine(x0, y0, x1, y1, color) {
        if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
            if (x0 > x1) {
                this._plotLineLow(x1, y1, x0, y0, color);
            } else {
                this._plotLineLow(x0, y0, x1, y1, color);
            }
        } else {
            if (y0 > y1) {
                this._plotLineHigh(x1, y1, x0, y0, color);
            } else {
                this._plotLineHigh(x0, y0, x1, y1, color);
            }
        }
    }

    drawLineRotation(x0, y0, distance, radians, color) {
        let pointFromCenter = MathUtil.vector(distance, radians);
        let finalPoint = { x: Math.round(x0 + pointFromCenter.x), y: Math.round(y0 + pointFromCenter.y) };
        this.drawLine(x0, y0, finalPoint.x, finalPoint.y, color);
        return finalPoint;
    }

    _plotLineLow(x0, y0, x1, y1, color) {
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

    _plotLineHigh(x0, y0, x1, y1, color) {
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

    drawCircle(x, y, radius, r, g, b, a = 1) {
        let pointFromCenter, point, radians, angle, lastModifiedPoint;
        for (angle = 0; angle < 360; angle += .1) {
            radians = MathUtil.radians(angle);
            pointFromCenter = MathUtil.vector(radius, radians);
            point = this.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            if (point && (point != lastModifiedPoint)) {
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
    drawCircleOnAngle(x, y, radius, callback) {
        let pointFromCenter, point, radians, angle, lastModifiedPoint;
        for (angle = 0; angle < 360; angle += .1) {
            radians = MathUtil.radians(angle);
            pointFromCenter = MathUtil.vector(radius, radians);
            point = this.getPointAt(Math.round(pointFromCenter.x + x), Math.round(pointFromCenter.y + y));
            if (point && (point != lastModifiedPoint)) {
                callback(point);
                lastModifiedPoint = point;
            }
        }
    }

    drawCircleWithPoints(pointA, pointB) {
        console.log({ pointA, pointB })
        let radius = MathUtil.distance(pointA.coordinates, pointB.coordinates);
        let pointFromCenter, point;
        for (let radians = 0; radians < (Math.PI * 2); radians += .001) {
            pointFromCenter = MathUtil.vector(radius, radians);
            point = this.getPointAt(Math.round(pointFromCenter.x + pointA.coordinates.x), Math.round(pointFromCenter.y + pointA.coordinates.y));
            if (point) {
                point.color = pointA.color;
            }
        }
    }

    /**
     * 
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} radius 
     * @param {Number} sides 
     * @param {Color} color 
     * @param {Number} startAngle 
     */
    drawPolygon(x, y, radius, sides, color, startAngle = 0) {
        let pointFromCenter, radians, angle;

        let firstVertexX, firstVertexY;
        let lastVertexX, lastVertexY;
        let anglePerSide = 360 / sides;
        for (angle = 0; angle <= 360; angle += anglePerSide) {
            radians = MathUtil.radians(startAngle + angle);
            pointFromCenter = MathUtil.vector(radius, radians);
            let vertexX = Math.ceil(pointFromCenter.x + x);
            let vertexY = Math.ceil(pointFromCenter.y + y);

            if (lastVertexX) {
                this.drawLine(lastVertexX, lastVertexY, vertexX, vertexY, color);
            }
            if (angle === 0) {
                firstVertexX = vertexX;
                firstVertexY = vertexY;
            }
            lastVertexX = vertexX;
            lastVertexY = vertexY;
        }
        this.drawLine(lastVertexX, lastVertexY, firstVertexX, firstVertexY, color);
    }



}

export default Screen;