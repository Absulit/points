import Utils from './utils.js';

class Layer {
    constructor() {
        this._columns = [];
        this._rows = [];
        this._points = [];

        this._shuffledPoints = null;
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
        let vertices = [];
        for (let index = 0; index < this._points.length; index++) {
            const point = this._points[index];
            if (point.modified) {
                point.position.value.forEach(p => vertices.push(p));
            }
        }
        return vertices;
    }

    get colors() {
        let colors = [];
        for (let index = 0; index < this._points.length; index++) {
            const point = this._points[index];
            if (point.modified) {
                point.color.value.forEach(c => colors.push(c));
            }
        }
        return colors;
    }

    get pointsizes() {
        let pointsizes = [];
        for (let index = 0; index < this._points.length; index++) {
            const point = this._points[index];
            if (point.modified) {
                pointsizes.push(point.size);
            }
        }
        return pointsizes;
    }

    get atlasIds() {
        let atlasIds = [];
        for (let index = 0; index < this._points.length; index++) {
            const point = this._points[index];
            if (point.modified) {
                atlasIds.push(point.atlasId);
            }
        }
        return atlasIds;
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
