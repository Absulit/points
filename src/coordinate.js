class Coordinate {
    #x;
    #y;
    #z;
    #value;
    constructor(x = 0, y = 0, z = 0) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#value = [x, y, z];
    }

    set x(value) {
        this.#x = value;
        this.#value[0] = value;
    }

    set y(value) {
        this.#y = value;
        this.#value[1] = value;
    }

    set z(value) {
        this.#z = value;
        this.#value[2] = value;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get z() {
        return this.#z;
    }

    get value() {
        return this.#value;
    }

    set(x, y, z) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#value[0] = x;
        this.#value[1] = y;
        this.#value[2] = z;
    }
}

export default Coordinate;