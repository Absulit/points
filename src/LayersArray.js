/**
 * @class LayersArray
 * @ignore
 */
class LayersArray extends Array {
    #buffer = null;
    #shaderType = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    set buffer(v) {
        this.#buffer = v;
    }

    get shaderType() {
        return this.#shaderType;
    }

    /**
     * @param {ShaderType} v
     */
    set shaderType(v) {
        this.#shaderType = v;
    }
}

export default LayersArray;
