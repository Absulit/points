export default class Storage {
    #name
    #mapped
    #type
    #shaderStage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE
    #read
    #buffer = null
    #internal = false
    // TODO document the stream feature
    /**
     * `updated` is set to true in data updates, but this is not true in
     * something like audio, where the data streams and needs to be updated
     * constantly, so if the storage map needs to be updated constantly then
     * `stream` needs to be set to true.
     */
    #stream = false
    #updated = false
    #value
    #size = null // TODO: document this: to force allocate more space in case an update is greater than the default array size
    /**
     * @param {{name:String, value:Array<Number>, type:String, read:bool, shaderStage:GPUShaderStage, stream:bool, updated:bool, size:Number}} config
     */
    constructor({ name, value, type, read, shaderStage,
        stream = false, updated = false, size = null }) {

        if (value && !Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }

        this.#name = name;
        this.#mapped = !!value;
        this.#type = type || 'f32';
        this.#read = read;
        this.#shaderStage = shaderStage || this.#shaderStage;
        this.#value = value;

        this.#stream = stream;
        this.#updated = updated;
        this.#size = size;

        Object.seal(this);
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    get mapped() {
        return this.#mapped;
    }

    set mapped(value) {
        this.#mapped = value;
    }

    get type() {
        return this.#type;
    }

    set type(value) {
        this.#type = value || 'f32';
    }

    get shaderStage() {
        return this.#shaderStage;
    }

    /**
     * this tells to what shader the storage is bound
     * @param {GPUShaderStage} value
     */
    set shaderStage(value) {
        this.#shaderStage = value;
    }

    get read() {
        return this.#read;
    }

    /**
     * if this is going to be used to read data back
     * @param {bool} value
     */
    set read(value) {
        this.#read = value;
    }

    get buffer() {
        return this.#buffer;
    }

    set buffer(value) {
        this.#buffer = value;
    }

    get internal() {
        return this.#internal;
    }

    set internal(value) {
        this.#internal = value;
    }

    get size() {
        return this.#size;
    }

    set size(value) {
        this.#size = value;
    }

    get stream() {
        return this.#stream;
    }

    set stream(value) {
        this.#stream = value;
    }

    get updated() {
        return this.#updated;
    }

    set updated(value) {
        this.#updated = value;
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        if (!Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }

        this.#mapped = !!value;
        this.#value = value;
    }

    /**
     *
     * @param {Array<Number>} value
     * @returns {Storage}
     */
    setValue(value) {
        if (!Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }
        this.#mapped = true;
        this.#updated = true;
        this.#value = value;
        return this;
    }

    /**
     * if this is going to be used to read data back
     * @param {bool} value
     * @returns {Storage}
     */
    setRead(value) {
        this.#read = value;
        return this;
    }

    /**
     * this tells to what shader the storage is bound
     * @param {GPUShaderStage} value
     * @returns {Storage}
     */
    setShaderStage(value) {
        this.#shaderStage = value;
        return this;
    }

    /**
     *
     * @param {String} value
     * @returns {Storage}
     */
    setType(value) {
        this.#type = value || 'f32';
        return this;
    }

}
