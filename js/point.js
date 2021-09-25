import RGBColor from './color.js';
import Coordinate from './coordinate.js';

class Point {
    constructor() {
        this._color = new RGBColor(0, 0, 0);
        this._position = new Coordinate(0, 0, 0);
        this._coordinates = new Coordinate(0, 0, 0);
        this._modified = false;
        this._layer = 0;
        this._size = 1.0;

        this._atlastId = -1;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
        this._modified = true;
    }

    setColor(r, g, b, a = 1) {
        this._color.set(r, g, b, a);
        this._modified = true;
    }

    addColor(color) {
        this._color.add(color);
        this._modified = true;
    }

    get position() {
        return this._position;
    }

    /**
     * Sets the position with a `Coordinate` in pixels.
     * This is different from the `coordinates` property.
     */
    set position(value) {
        this._position = value;
        //this._modified = true;
    }

    /**
     * Sets the position in pixels.
     * This is different from the `coordinates`.
     * @param {Number} x
     * @param {Number} y
     * @param {Number} z
     */
    setPosition(x, y, z) {
        this._position.set(x, y, z);
        this._modified = true;
    }

    /**
     * Indicates if the point should be updated in `Screen`.
     */
    get modified() {
        return this._modified;
    }

    /**
     * Indicates if the point should be updated in `Screen`.
     */
    set modified(value) {
        this._modified = value;
    }

    /**
     * Gets the coordinates in the `Screen`.
     * This is different from the `position`
     */
    get coordinates() {
        return this._coordinates;
    }

    /**
     * Sets the coordinates in `Screen`.
     */
    set coordinates(value) {
        this._coordinates = value;
    }

    setCoordinates(x, y, z) {
        this._coordinates.set(x, y, z);
    }

    get layer() {
        return this._layer;
    }

    set layer(value) {
        this._layer = value;
    }

    get size() {
        return this._size;
    }

    set size(value) {
        this._size = value;
    }

    get atlasId() {
        return this._atlastId;
    }

    set atlasId(value) {
        this._atlastId = value;
    }
}

export default Point;
