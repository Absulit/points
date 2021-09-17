class Coordinate {
    constructor(x = 0, y = 0, z = 0) {
        this._x = x;
        this._y = y;
        this._z = z;
        this._value = [x, y, z];
    }

    getWebGLCoordinate(value, side, invert = false){
        let direction = invert? -1:1;
        let p = value / side;
        return ((p * 2) - 1) * direction;
    };

    set x(value) {
        this._x = value;
        this._value[0] = this.getWebGLCoordinate(value, canvas.width);
    }

    set y(value) {
        this._y = value;
        this._value[1] = this.getWebGLCoordinate(value, canvas.height, true);
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
        this._value[0] = this.getWebGLCoordinate(x, canvas.width);
        this._value[1] = this.getWebGLCoordinate(y, canvas.height, true);
        this._value[2] = z;
    }
}

export default Coordinate;