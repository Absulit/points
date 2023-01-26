class Coordinate {
    constructor(x = 0, y = 0, z = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._value = [x, y, z];
    }

    set x(value) {
        this._x = value;
        this._value[0] = value;
    }

    set y(value) {
        this._y = value;
        this._value[1] = value;
    }

    set z(value) {
        this._z = value;
        this._value[2] = value;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    get z() {
        return this._z;
    }

    get value() {
        return this._value;
    }

    set(x, y, z) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._value[0] = x;
        this._value[1] = y;
        this._value[2] = z;
    }

    clone() {
        return new Coordinate(this._x, this._y, this._z);
    }
}

export default Coordinate;