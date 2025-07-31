/**
 * @class UniformsArray
 */
class UniformsArray extends Array {
    #buffer = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    /**
     * set buffer
     * @param {*} v
     */
    set buffer(v) {
        this.#buffer = v;
    }
}

export default UniformsArray;