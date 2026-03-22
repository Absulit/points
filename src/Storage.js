import { isArray } from "./data-size.js"

export default class Storage {
    #name
    #mapped
    #type
    #shaderStage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE
    #readable = false
    #buffer = null
    #bufferRead = null
    #internal = false

    #stream = false
    #updated = false
    #value
    #size = null // TODO: document this: to force allocate more space in case an update is greater than the default array size
    /**
     * @param {{name:String, value:Number|Array<Number>, type:String, readable:Boolean, shaderStage:GPUShaderStage, stream:bool, updated:bool, size:Number}} config
     */
    constructor({ name, value, type, readable, shaderStage,
        stream = false, updated = false, size = null }) {

        this.#validateName(name);
        this.#validateType(type);
        this.#validateValue(value);

        if (value && !Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }


        this.#name = name;
        this.#mapped = !!value;
        this.#type = type || this.#getArrayType(value) || 'f32';
        this.#readable = readable || this.#readable;
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

    /**
     * @param {String} value name of the Storage. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myStorage.name = 'myStorageName';
     *
     * // wgsl
     * myStorageName = 13.1;
     */
    set name(value) {
        this.#validateName(value);
        this.#name = value;
    }

    get mapped() {
        return this.#mapped;
    }

    /**
     * @param {Boolean} value tells WebGPU if the Storage is mapped or not. This
     * allows for the initialization of the Storage with data, which is a
     * different route.
     */
    set mapped(value) {
        this.#mapped = value;
    }

    get type() {
        return this.#type;
    }

    /**
     * @param {String} value WGSL data type of the Storage.
     * @example
     * myStorage.type = 'u32'
     */
    set type(value) {
        this.#validateType(value);
        this.#type = value || this.#getArrayType(this.#value) || 'f32';
    }

    get shaderStage() {
        return this.#shaderStage;
    }

    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     */
    set shaderStage(value) {
        this.#shaderStage = value;
    }

    get readable() {
        return this.#readable;
    }

    /**
     * If data is read back in JS from WGSL, then set to `true`.
     * @param {Boolean} value
     */
    set readable(value) {
        this.#readable = value;
    }

    get buffer() {
        return this.#buffer;
    }

    /**
     * For internal use mostly. The actual GPUBuffer with the data.
     */
    set buffer(value) {
        this.#buffer = value;
    }

    get bufferRead() {
        return this.#bufferRead;
    }

    /**
     * Buffer for reading back
     * For internal use mostly. The actual GPUBufferRead with the data.
     */
    set bufferRead(value) {
        this.#bufferRead = value;
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
    /**
     * `updated` is set to true in data updates, but this is not true in
     * something like audio, where the data streams and needs to be updated
     * constantly, so if the storage map needs to be updated constantly then
     * `stream` needs to be set to true.
     * @param {boolean} value
     */
    set stream(value) {
        this.#stream = value;
    }

    get updated() {
        return this.#updated;
    }

    /**
     * Mostly internal. Set to `true` if a value has been updated.
     */
    set updated(value) {
        this.#updated = value;
    }

    get value() {
        return this.#value;
    }

    /**
     * @param {Number|Array<Number>} value data to send to the shader
     */
    set value(value) {
        this.#validateValue(value);
        if (value && !Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }

        this.#mapped = !!value;
        this.#value = value;
    }

    /**
     *
     * @param {Number|Array<Number>} value data to send to the shader
     * @returns {Storage}
     */
    setValue(value) {
        this.#validateValue(value);
        if (!Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }
        this.#mapped = true;
        this.#updated = true;
        this.#value = value;

        return this;
    }

    /**
     * if this is going to be used to read data back set to `true`
     * @param {bool} value
     * @returns {Storage}
     */
    setReadable(value) {
        this.#readable = value;
        return this;
    }

    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @returns {Storage}
     */
    setShaderStage(value) {
        this.#shaderStage = value;
        return this;
    }

    /**
     * @param {String} value WGSL data type of the Storage.
     * @returns {Storage}
     * @example
     * myStorage.setType('u32');
     */
    setType(value) {
        this.#validateType(value);
        this.#type = value || this.#getArrayType(value) || 'f32';
        return this;
    }

    async read() {
        let arrayBufferCopy = null;
        if (this.#readable) {
            try {
                await this.#bufferRead.mapAsync(GPUMapMode.READ);
                const arrayBuffer = this.#bufferRead.getMappedRange();
                arrayBufferCopy = new Float32Array(arrayBuffer.slice(0));
                this.#bufferRead.unmap();
                this.#value = arrayBufferCopy;
            } catch (error) {
                // if we switch projects mapasync fails
                // we ignore it
            }
        }
        return arrayBufferCopy;
    }

    #validateValue(value) {
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Uint8Array)) {
            throw `Storage '${this.#name}' value:'${value}' can't be an Object.`
        }

        if (typeof value === 'string') {
            throw `Storage '${this.#name}' value: '${value}' can't be an String.`
        }

        const isArray = Array.isArray(value);
        if (isArray) {
            const { length } = value;
            if (Array.isArray(this.#value)) {
                if (length != this.#value.length) {
                    throw `Storage named '${this.#name}': Size of the array value has changed from ${this.#value.length} to ${length}.`
                }
            }

        }
    }

    #validateName(value) {
        if (typeof value === 'number') {
            throw `Storage name '${this.#name}' can't be an Number.`
        }

        if (typeof value === 'string') {
            const valNumber = +value;

            if (!Number.isNaN(valNumber) && typeof valNumber === 'number') {
                throw `Storage name '${this.#name}' can't be an Number.`
            }
        }
    }

    #validateType(value) {

    }

    /**
     * returns something like vec2f, vec3f
     * @param {Array|Object} value
     * @returns {String}
     */
    #getArrayType(value) {
        const isArray = Array.isArray(value);
        let type = null;
        if (isArray) {
            const { length } = value;
            if (length <= 4) {
                type = `vec${length}f`;
            }
            if (length > 4) {
                type = `array<f32, ${length}>`;
            }
        }
        return type;
    }

    // allows for things like:
    // storage.myStorage += 10
    // works on set, not on get
    // on get you obtain the Storage
    valueOf() {
        return this.#value;
    }
}
