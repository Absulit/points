import Utils from './utils.js';

class Layer {
    constructor(numRows, numColumns) {
        this._numRows = numRows;
        this._numColumns = numColumns;

        this._columns = [];
        this._rows = [];
        this._points = [];

        this._shuffledPoints = null;

        const numItems = numRows * numColumns;
        //this._vertices = Array(numItems * 3).fill(0);
        this._vertices = new Float32Array(numItems * 3);
        //this._colors = Array(numItems * 4).fill(0);
        this._colors = new Float32Array(numItems * 4);
        //this._pointsizes = Array(numItems).fill(0);
        this._pointsizes = new Float32Array(numItems);
        //this._atlasIds = Array(numItems).fill(-1);
        this._atlasIds = new Int32Array(Array(numItems).fill(-1));
    }

    get columns() {
        return this._columns;
    }

    get rows() {
        return this._rows;
    }

    get points() {
        return this._points
    }

    get shuffledPoints() {
        return this._shuffledPoints;
    }

    get vertices() {
        return this._vertices;
    }

    set vertices(value) {
        this._vertices = value;
    }

    setVertex(pointCoordinate, positionCoordinate) {
        const startPosition = (pointCoordinate.x + (pointCoordinate.y * this._numColumns)) * 3;
        this._vertices[startPosition] = positionCoordinate.value[0];
        this._vertices[startPosition + 1] = positionCoordinate.value[1];
        this._vertices[startPosition + 2] = positionCoordinate.value[2];
    }

    get colors() {
        return this._colors;
    }

    set colors(value) {
        this._colors = value;
    }

    setColor(pointCoordinate, value) {
        const startPosition = (pointCoordinate.x + (pointCoordinate.y * this._numColumns)) * 4;
        this._colors[startPosition] = value.r;
        this._colors[startPosition + 1] = value.g
        this._colors[startPosition + 2] = value.b;
        this._colors[startPosition + 3] = value.a;
    }

    get pointsizes() {
        return this._pointsizes;
    }

    set pointsizes(value) {
        this._pointsizes = value;
    }

    setPointSize(pointCoordinate, value) {
        const startPosition = (pointCoordinate.x + (pointCoordinate.y * this._numColumns));
        this._pointsizes[startPosition] = value;
    }

    get atlasIds() {
        return this._atlasIds;
    }

    set atlasIds(value) {
        this._atlasIds = value;
    }

    setAtlasId(pointCoordinate, value) {
        const startPosition = (pointCoordinate.x + (pointCoordinate.y * this._numColumns));
        this._atlasIds[startPosition] = value;
    }

    get modifieds() {
        let modifieds = [];
        for (let index = 0; index < this._points.length; index++) {
            const point = this._points[index];
            //if (point.modified) {
            modifieds.push(point.modified);
            //}
        }
        return modifieds;
    }

    fillColumns() {
        // pre fill with the amount of columns
        /*for (let index = 0; index < this._numColumns; index++) {
            layer.columns.push([]);
        }*/

        this._columns = Array(this._rows[0].length).fill([]);

        this._rows.forEach(row => {
            row.forEach((point, index) => {
                this._columns[index].push(point);
            });
        });
    }

    shufflePoints() {
        return this._shuffledPoints = Utils.shuffle(this._points);
    }
}

export default Layer;
