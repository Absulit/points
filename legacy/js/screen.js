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
        this._pointSizeHalf = this._pointSizeFull / 2;

        this._center = new Coordinate(Math.round(numColumns / 2), Math.round(numRows / 2));

        //this._columns = [];
        //this._rows = [];
        //this._points = [];

        this._layers = [];
        this._mainLayer = null;
        this._layerIndex = 0;

        this._pointSize = 1;

        this._dimension = 3;
        //this._vertices = [];
        this._vertices = new Float32Array();
        //this._colors = [];
        this._colors = new Float32Array();
        //this._pointsizes = [];
        this._pointsizes = new Float32Array();
        //this._atlasids = [];
        this._atlasids = new Int32Array();

        this._init();

    }

    _init() {
        if (this._numColumns > this._numRows) {
            this._pointSizeFull = this._canvas.width / this._numColumns;
        } else {
            this._pointSizeFull = this._canvas.height / this._numRows;
        }
        this._pointSizeHalf = this._pointSizeFull / 2;

        this._pointSize = this._pointSizeFull - this._numMargin;
        //this._mainLayer = this._createLayer(-1);
        Point.pointSizeFull = this._pointSize;
        this._createLayers();

    }

    _createLayer(zDepth) {
        let layer = new Layer(this._numRows, this._numColumns);

        let row;
        let point;
        for (let yCoordinate = 0; yCoordinate < this._numRows; yCoordinate++) {
            row = [];
            for (let xCoordinate = 0; xCoordinate < this._numColumns; xCoordinate++) {
                point = new Point(this);
                point.layer = layer;
                point.position.set((xCoordinate * this._pointSizeFull) + this._pointSizeHalf, (yCoordinate * this._pointSizeFull) + this._pointSizeHalf, zDepth);
                //point.setColor(Math.random(), 1, Math.random(), 1);

                if (!point.position.value.calculated) {
                    const value = point.position.value;

                    value[0] = this._getWebGLCoordinate(value[0], this._canvas.width);
                    value[1] = this._getWebGLCoordinate(value[1], this._canvas.height, true);
                    point.position.value.calculated = true;
                }

                point.setCoordinates(xCoordinate, yCoordinate, 0);
                point.setNormalPosition(xCoordinate / this._numColumns, yCoordinate / this._numRows, 0)
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
            const layer = this._createLayer(((layerIndex) / this._numLayers) * -1);
            //this._vertices = this._vertices.concat(layer.vertices);
            this._vertices = new Float32Array([...this._vertices, ...layer.vertices]);
            //this._colors =  this._colors.concat(layer.colors);
            this._colors = new Float32Array([...this._colors, ...layer.colors]);// this._colors.concat(layer.colors);
            //this._pointsizes = this._pointsizes.concat(layer.pointsizes);
            this._pointsizes = new Float32Array([...this._pointsizes, ...layer.pointsizes]);
            //this._atlasids = this._atlasids.concat(layer.atlasIds);
            this._atlasids = new Int32Array([...this._atlasids, ...layer.atlasIds]);
            this._layers.push(layer);
        }
        this._currentLayer = this._layers[this._layerIndex];
    }

    _mergeLayers() {
        let tempColor, tempSize, tempAtlas;

        let pointsLength = this._mainLayer.points.length
        let finalPoint;
        for (let finalPointIndex = 0; finalPointIndex < pointsLength; finalPointIndex++) {
            finalPoint = this._mainLayer.points[finalPointIndex];

            tempColor = { counter: 0, value: new RGBAColor(0, 0, 0, 0) };
            tempSize = { counter: 0, value: 0 };
            tempAtlas = { counter: 0, value: -1 };

            let point;
            this._layers.forEach(layer => {
                point = layer.points[finalPointIndex];
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
            if (tempColor.counter) {
                tempColor.value.r /= tempColor.counter;
                tempColor.value.g /= tempColor.counter;
                tempColor.value.b /= tempColor.counter;
                //tempColor.value.a /= tempColor.counter;
            }
            if (tempSize.counter) {
                tempSize.value /= tempSize.counter;
            }
            finalPoint.color = tempColor.value;
            finalPoint.size = tempSize.value;
            finalPoint.atlasId = tempAtlas.value;
        }
    }

    // _groupLayers() {
    //     for (let layerIndex = 0; layerIndex < this._layers.length; layerIndex++) {
    //         const layer = this._layers[layerIndex];
    //         this._vertices = this._vertices.concat(layer.vertices);
    //         this._colors = this._colors.concat(layer.colors);
    //         this._pointsizes = this._pointsizes.concat(layer.pointsizes);
    //         this._atlasids = this._atlasids.concat(layer.atlasIds);

    //         // layer.vertices.forEach(i => this._vertices.push(i));
    //         // layer.colors.forEach(i => this._colors.push(i));
    //         // layer.pointsizes.forEach(i => this._pointsizes.push(i));
    //         // layer.atlasIds.forEach(i => this._atlasids.push(i));
    //     }
    // }

    get numColumns() {
        return this._numColumns;
    }
    get numRows() {
        return this._numRows;
    }

    get rows() {
        return this._currentLayer.rows;
    }

    /**
     * @return {Array<Point>}
     */
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

    getPointFromLayerAt(columnIndex, rowIndex, layerIndex) {
        const layer = this._layers[layerIndex];
        let row = layer.rows[rowIndex];
        let point = row && row[columnIndex] || null;
        return point;
    }

    /**
     * Same coordinates of the Point provided but in another layer
     * @param {Point} point
     * @param {Number} layerIndex
     * @returns Point in `layerIndex` layer
     */
    getPointFromLayer(point, layerIndex) {
        const layer = this._layers[layerIndex];
        let row = layer.rows[point.coordinates.y];
        let pointInLayer = row && row[point.coordinates.x] || null;
        return pointInLayer;
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


    getRandomPointX(y) {
        let columnIndex = Math.floor(Math.random() * this._numColumns);
        let rowIndex = y;
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
     * @param {Point} point
     * @param {Int} distance int
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

    getPointsArea(x1, y1, x2, y2) {
        let points = [];
        for (let cIndex = x1; cIndex < x2; cIndex++) {
            for (let rowIndex = y1; rowIndex < y2; rowIndex++) {
                const point = this.getPointAt(cIndex, rowIndex);
                if (point) {
                    points.push(point);
                }
            }
        }
        return points;
    }


    clear(color = null, alphaAmount = .1) {
        const rowsLength = this._currentLayer.rows.length;
        let rowLength;
        for (let index = 0; index < rowsLength; index++) {
            const row = this._currentLayer.rows[index];
            rowLength = row.length
            for (let i = 0; i < rowLength; i++) {
                const point = row[i];

                point.modified && point.color.a > alphaAmount && (
                    color && point.modifyColor(c => {
                        c.setColor(color);
                    }) || color && point.modifyColor(c => {
                        c.set(0, 0, 0, 0);
                    }));
            }
        }
    }

    clearMix(color, level = 2) {

        const rowsLength = this._currentLayer.rows.length;
        let rowLength;
        for (let index = 0; index < rowsLength; index++) {
            const row = this._currentLayer.rows[index];
            rowLength = row.length
            for (let i = 0; i < rowLength; i++) {
                const point = row[i];

                point.modified && point.modifyColor(pointColor => {
                    pointColor.set(
                        (pointColor.r + color.r) / level,
                        (pointColor.g + color.g) / level,
                        (pointColor.b + color.b) / level,
                        (pointColor.a + color.a)
                    );
                });
                if (point.size < this._pointSize) {
                    point.size = this._pointSize;
                }

            }

        }
    }

    clearAlpha(level = 2) {
        let pointColor = null;
        //this._currentLayer.rows.forEach(row => {
        const rowsLength = this._currentLayer.rows.length;
        let rowLength;
        for (let index = 0; index < rowsLength; index++) {
            const row = this._currentLayer.rows[index];
            rowLength = row.length
            for (let i = 0; i < rowLength; i++) {
                //row.forEach(point => {
                const point = row[i];
                if (point.modified) {

                    point.modifyColor(color => {
                        color.set(color.r, color.g, color.b, (color.a) / level);
                    });

                }
                if (point.size < this._pointSize) {
                    point.size = this._pointSize;
                }
                //});
            }
            //});
        }
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
        pointToReplace && pointToReplace.modifyColor(color => color.setColor(point.color));
        return pointToReplace;
    }

    /**
     * Creates a line between two `Point`s,
     * and uses the first point color to color the line.
     * @param {Point} pointA
     * @param {Point} pointB
     * @param {Function} modifyColorFunction works as Point.modifyColor
     */
    drawLineWithPoints(pointA, pointB, modifyColorFunction = null) {
        let x0 = pointA.coordinates.x;
        let y0 = pointA.coordinates.y;

        let x1 = pointB.coordinates.x;
        let y1 = pointB.coordinates.y;
        let color = pointA.color;

        if (Math.abs(y1 - y0) < Math.abs(x1 - x0)) {
            if (x0 > x1) {
                this._plotLineLow(x1, y1, x0, y0, color, modifyColorFunction);
            } else {
                this._plotLineLow(x0, y0, x1, y1, color, modifyColorFunction);
            }
        } else {
            if (y0 > y1) {
                this._plotLineHigh(x1, y1, x0, y0, color, modifyColorFunction);
            } else {
                this._plotLineHigh(x0, y0, x1, y1, color, modifyColorFunction);
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

    getFinalPointFromPolar(x0, y0, distance, radians) {
        const pointFromCenter = MathUtil.vector(distance, radians);
        const finalPoint = { x: Math.round(x0 + pointFromCenter.x), y: Math.round(y0 + pointFromCenter.y) };
        return this.getPointAt(finalPoint.x, finalPoint.y);
    }

    drawLineRotation(x0, y0, distance, radians, color) {
        const pointFromCenter = MathUtil.vector(distance, radians);
        const finalPoint = { x: Math.round(x0 + pointFromCenter.x), y: Math.round(y0 + pointFromCenter.y) };
        this.drawLine(x0, y0, finalPoint.x, finalPoint.y, color);
        return finalPoint;
    }

    _plotLineLow(x0, y0, x1, y1, color, modifyColorFunction = null) {
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

            point && modifyColorFunction && point.modifyColor(modifyColorFunction);
            point && !modifyColorFunction && point.modifyColor(c => c.setColor(color));

            if (D > 0) {
                y = y + yi
                D = D + (2 * (dy - dx))
            } else {
                D = D + 2 * dy
            }
        }
    }

    _plotLineHigh(x0, y0, x1, y1, color, modifyColorFunction = null) {
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

            point && modifyColorFunction && point.modifyColor(modifyColorFunction);
            point && !modifyColorFunction && point.modifyColor(c => c.setColor(color));

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
            if (point && (point !== lastModifiedPoint)) {
                point.modifyColor(color => color.set(r, g, b, a));
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
            if (point && (point !== lastModifiedPoint)) {
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

    drawRect(x, y, w, h, color) {
        color = color || new RGBAColor(1, 1, 1);
        this.drawLine(x, y, x + w, y, color);
        this.drawLine(x, y + h, x + w, y + h, color);


        this.drawLine(x, y, x, y + h, color);
        this.drawLine(x + w, y, x + w, y + h, color);


    }


    drawFilledSquare(x, y, sideLength, r, g, b) {
        x -= sideLength * .5;
        y -= sideLength * .5;
        const finalX = x + sideLength;
        const finalY = y + sideLength;
        let point = null;
        for (let currentX = x; currentX < finalX; currentX++) {

            for (let currentY = y; currentY < finalY; currentY++) {
                point = this.getPointAt(currentX, currentY);
                point && point.modifyColor(color => color.set(r, g, b));
            }

        }

    }

    _getWebGLCoordinate(value, side, invert = false) {
        const direction = invert ? -1 : 1;
        const p = value / side;
        return ((p * 2) - 1) * direction;
    };

    /**
     * @deprecated removed in favor of layer methods
     * @param {*} point
     */
    _addToPrint(point) {
        //this._vertices.push(point.position.value);
        point.position.value.forEach(p => this._vertices.push(p));
        //this._colors.push(point.color.value);
        point.color.value.forEach(c => this._colors.push(c));
        this._pointsizes.push(point.size);
        this._atlasids.push(point.atlasId);
    }

    _addPointsToPrint() {
        this._vertices = this._mainLayer.vertices;
        this._colors = this._mainLayer.colors;
        this._pointsizes = this._mainLayer.pointsizes;
        this._atlasids = this._mainLayer.atlasIds;
    };

    moveColorToLayer(layerIndex) {
        this._currentLayer.points.forEach((point, index) => {
            if (point.color.a > 0) {
                const pointInLayer = this._layers[layerIndex].points[index];
                pointInLayer.setRGBAColor(point.color);
            }
        });
    }
}

export default Screen;
