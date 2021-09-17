class RGBAColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        this._value = [r, g, b, a];
    }

    set r(value) {
        this._value[0] = value;
    }

    set g(value) {
        this._value[1] = value;
    }

    set b(value) {
        this._value[2] = value;
    }

    set a(value) {
        this._value[3] = value;
    }

    get r() {
        return this._value[0];
    }

    get g() {
        return this._value[1];
    }

    get b() {
        return this._value[2];
    }

    get a() {
        return this._value[3];
    }

    get value() {
        return this._value;
    }

    set(r, g, b, a) {
        this._value = [r, g, b, a]
    }
}

export default RGBAColor;