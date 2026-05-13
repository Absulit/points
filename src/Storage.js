import { getWGSLType, isArray } from './data-size.js'

/**
 * Storage is a container for storage buffer related data and actions.
 * @class Storage
 */

class Storage {
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
     * @param {{name:String, value:(Number|Array<Number>), type:String, readable:Boolean, shaderStage:GPUShaderStage, stream:bool, updated:bool, size:Number}} config
     */
    constructor({ name, value, type, readable, shaderStage,
        stream = false, updated = false, size = null }) {

        this.#validateName(name);
        this.#validateType(type);
        this.#validateValue(value);

        this.#name = name;
        this.#mapped = !!value;
        this.#type = type || getWGSLType(value);
        this.#readable = readable || this.#readable;
        this.#shaderStage = shaderStage || this.#shaderStage;
        this.#value = value;

        this.#stream = stream;
        this.#updated = updated;
        this.#size = size;

        Object.seal(this);
    }

    #ifTypeVecGetVecValue(type, value) {
        let newValue = value;
        if (type.startsWith('vec')) {
            newValue = `vec${value.length}f(${value})`
        }
        return newValue;
    }

    get name() {
        return this.#name;
    }

    /**
     * The name that the Storage will have on the WGSL side.
     * @param {String} value name of the Storage. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myStorage.name = 'myStorageName';
     *
     * // wgsl
     * myStorageName = 13.1;
     * @memberof Storage
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
     * @memberof Storage
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
     * @memberof Storage
     */
    set type(value) {
        this.#validateType(value);
        this.#type = value || getArrayType(this.#value) || 'f32';
    }

    get shaderStage() {
        return this.#shaderStage;
    }

    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @memberof Storage
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
     * @memberof Storage
     */
    set readable(value) {
        this.#readable = value;
    }

    get buffer() {
        return this.#buffer;
    }

    /**
     * For internal use mostly. The actual {@link GPUBuffer} with the data.
     * @memberof Storage
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
     * @memberof Storage
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
     * @memberof Storage
     */
    set stream(value) {
        this.#stream = value;
    }

    get updated() {
        return this.#updated;
    }

    /**
     * Mostly internal. Set to `true` if a value has been updated.
     * @memberof Storage
     */
    set updated(value) {
        this.#updated = value;
    }

    get value() {
        let value = this.#value;
        // Internally, what Points use to create the buffer is a Uint8Array
        // TODO: maybe move to POINTS?
        if (value && !Array.isArray(value) && value.constructor !== Uint8Array) {
            value = new Uint8Array([value]);
        }

        return value;
    }

    /**
     * @param {Number|Array<Number>} value data to send to the shader
     * @memberof Storage
     */
    set value(value) {
        this.#validateValue(value);
        this.#mapped = !!value;
        const type = this.#type || getWGSLType(value);
        this.#value = value;
        this.#type = type;
        this.#updated = true;
    }

    /**
     *
     * @param {Number|Array<Number>} value data to send to the shader
     * @returns {Storage}
     * @memberof Storage
     */
    setValue(value) {
        this.#validateValue(value);

        this.#mapped = true;
        this.#updated = true;
        const type = this.#type || getWGSLType(value);
        this.#value = value;
        this.#type = type;

        return this;
    }

    /**
     * if this is going to be used to read data back set to `true`
     * @param {bool} value
     * @returns {Storage}
     * @memberof Storage
     */
    setReadable(value) {
        this.#readable = value;
        return this;
    }

    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @returns {Storage}
     * @memberof Storage
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
     * @memberof Storage
     */
    setType(value) {
        this.#validateType(value);
        this.#type = value || getArrayType(value) || 'f32';
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
            if (length < 2) {
                throw `Constant named '${this.#name}': Size of the array is lower than 2. There's no vec1`;
            }

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
        if (!value) {
            return;
        }
        if (typeof value !== 'string') {
            throw `Storage type '${value}' must be a String.`;
        }
        const isValueArray = isArray(value);
        if (isValueArray) {
            if (!value.includes(',')) {
                throw `The type '${value}' requires a size, e.g.: array<T, N>`
            }
            const regex = /,\s*(\d+)\s*>/
            const match = value.match(regex);
            if (!match) {
                throw `Storage type '${value}' size must be an Number.`
            }
        }
    }

    // allows for things like:
    // storage.myStorage += 10
    // works on set, not on get
    // on get you obtain the Storage
    valueOf() {
        return this.#value;
    }
}

export default Storage;

