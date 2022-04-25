export default class Particle {
    constructor(x, y, constant = 1) {
        this._x = x;
        this._y = y;
        this._vx = ((Math.random() *2) - 1) * constant;
        this._vy = ((Math.random() * 4) - 5) * constant;
        this._a = 1;
        this._time = 0;
    }

    get x() {
        return this._x;
    }

    set x(value) {
        this._x = value;
    }

    get y() {
        return this._y;
    }

    set y(value) {
        this._y = value;
    }

    get vx() {
        return this._vx;
    }

    set vx(value) {
        this._vx = value;
    }

    get vy() {
        return this._vy;
    }

    set vy(value) {
        this._vy = value;
    }

    get a() {
        return this._a;
    }

    set a(value) {
        this._a = value;
    }

    update(gravity = 9.8) {
        this._time += 1/60;
        this._x += this._vx;
        this._y += this._vy + this._time * gravity;
        this._a -= .01;
    }
}