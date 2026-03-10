/**
 * @class LayersArray
 * @ignore
 */
class LayersArray extends Array {
    #buffer = null;
    #shaderStage = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    set buffer(v) {
        this.#buffer = v;
    }

    get shaderStage() {
        return this.#shaderStage;
    }

    /**
     * @param {GPUShaderStage} v
     */
    set shaderStage(v) {
        this.#shaderStage = v;
    }
}

export default LayersArray;
