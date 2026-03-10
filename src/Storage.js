export default class Storage {
    #name
    #mapped
    #type
    #shaderType
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
     * @param {{name:String, value:Array<Number>, structName:String, read:bool, shaderType:GPUShaderStage, stream:bool, updated:bool, size:Number}} config
     */
    constructor({ name, value, structName, read, shaderType,
        stream = false, updated = false, size = null }) {
        this.#name = name;
        this.#mapped = !!value;
        this.#type = structName;
        this.#read = read;
        this.#shaderType = shaderType;
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
        this.#type = value;
    }

    get shaderType() {
        return this.#shaderType;
    }

    set shaderType(value) {
        this.#shaderType = value;
    }
    get read() {
        return this.#read;
    }

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

    setRead(value) {
        this.#read = value;
        return this;
    }

    // TODO: rename to setStage? setShaderStage?
    /**
     *
     * @param {GPUShaderStage} value
     * @returns {Storage}
     */
    setShaderType(value) {
        this.#shaderType = value;
        return this;
    }

}
