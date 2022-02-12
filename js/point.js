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

        // minimum value the color is so dim
        // it's no longer visible
        this._minimunVisibleValue = 0.01;
    }

    get color() {
        return this._color;
    }

    set color(value) {
        this._color = value;
        this._modified = true;
        this._checkColors();
    }

    setColor(r, g, b, a = 1) {
        this._color.set(r, g, b, a);
        this._modified = true;
        this._checkColors();
    }

    setBrightness(value) {
        this._color.brightness = value;
        this._modified = true;
        this._checkColors();
    }

    getBrightness() {
        return this._color.brightness;
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

    /**
     * Verifies if a color is so dimmed it's no longer visible
     * so it contains a small fraction, and no longer necessary to store,
     * and also no longer considered `modified` `true`. This to avoid
     * taking the point into account in future processes.
     */
    _checkColors() {
        if (this._color.value[3] < this._minimunVisibleValue) {
            this._color.set(0, 0, 0, 1);
            this._modified = false;
        } else {
            const [r, g, b] = this._color.value;
            const rBelow = r < this._minimunVisibleValue;
            const gBelow = g < this._minimunVisibleValue;
            const bBelow = b < this._minimunVisibleValue;
            if (rBelow && gBelow && bBelow) {
                this._color.set(0, 0, 0, 1);
                this._modified = false;
            }
        }
    }
}

export default Point;
