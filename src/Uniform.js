import { isArray } from './data-size.js';

/**
 * Uniform class is a container for uniform related data and actions.
 */
export default class Uniform {
    #name
    #value
    #type
    #size

    /**
     *
     * @param {{name:String, value:(Number|Boolean|Array<Number>), type:string, size?:Number}} config
     */
    constructor({ name, value, type = null, size = null }) {

        this.#validateName(name);
        this.#validateType(type);
        this.#validateValue(value);

        this.#name = name;

        this.#value = value;
        this.#type = type || this.#getArrayType(value) || 'f32';
        this.#size = size;

        Object.seal(this);
    }

    get name() {
        return this.#name;
    }

    /**
     * The name that the Uniform will have on the WGSL side.
     * @param {String} value name of the Uniform. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myUniform.name = 'myUniformName';
     *
     * // wgsl
     * myUniformName = 13.0;
     */
    set name(value) {
        this.#validateName(value);
        this.#name = value;
    }

    get value() {
        return this.#value;
    }

    /**
     * To get or set the value of the uniform from the JS side to the WGSL side.
     * @param {Number|Boolean|Array<Number>} value The uniform value
     */
    set value(value) {
        this.#validateValue(value);
        this.#value = value;
    }

    get type() {
        return this.#type
    }

    /**
     * Get or set the type of the uniform.
     * It can be inferred automatically by just passing the value, but if
     * something more specific is required, then you should use `type`.
     * @param {String} value WGSL data type of the uniform
     * @example
     * myUniform.type = 'u32';
     */
    set type(value) {
        this.#validateType(value);
        this.#type = value || this.#getArrayType(this.#value) || 'f32';
    }

    get size() {
        return this.#size;
    }

    /**
     * For internal use mostly. Size in bytes.
     */
    set size(value) {
        this.#size = value;
    }

    /**
     * Clone of the Uniform data as a plain object to avoid modifications on
     * the original data.
     * @returns {Object}
     */
    serialize() {
        // we check if array and spread
        // because structuredClone is slower
        const isArray = Array.isArray(this.#value);
        const value = isArray ? [...this.#value] : this.#value;
        return {
            name: this.#name,
            value,
            type: this.#type,
            size: this.#size
        };
    }

    /**
     * Sets or updates the value of the Uniform.
     * @param {Number|Boolean|Array<Number>} value
     */
    setValue(value) {
        this.#validateValue(value);
        this.#value = value;
        return this;
    }

    /**
     * Set the data type of the uniform.
     * @param {String} value WGSL data type of the uniform
     * @example
     * myUniform.setType('u32')
     */
    setType(value) {
        this.#validateType(value);
        this.#type = value || this.#getArrayType(this.#value) || 'f32';
        return this;
    }

    #validateValue(value) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            throw `Uniform '${this.#name}' value:'${value}' can't be an Object.`
        }

        if (typeof value === 'string') {
            throw `Uniform '${this.#name}' value: '${value}' can't be an String.`
        }

        const isArray = Array.isArray(value);
        if (isArray) {
            const { length } = value;
            // TODO include mat values, e.g.: mat4x2
            // if (length > 4) {
            //     console.trace(this.#name, this.#value);
            //     throw `Uniform named '${this.#name}': Can't assign an Array greater than a vec4f.`
            // }
            if (Array.isArray(this.#value)) {
                if (length != this.#value.length) {
                    throw `Uniform named '${this.#name}': Size of the array value has changed from ${this.#value.length} to ${length}.`
                }
            }

            if (length < 2) {
                throw `Uniform named '${this.#name}': Can't assign an Array smaller than a vec2f. Assign the Number directly.`
            }
        }
    }

    #validateName(value) {
        if (typeof value === 'number') {
            throw `Uniform name '${this.#name}' can't be an Number.`
        }

        if (typeof value === 'string') {
            const valNumber = +value;

            if (!Number.isNaN(valNumber) && typeof valNumber === 'number') {
                throw `Uniform name '${this.#name}' can't be an Number.`
            }
        }
    }

    #validateType(value) {
        if (value && isArray(value)) {
            throw `Uniform '${this.#name}' type: '${value}' is an array, which is currently not supported for Uniforms.`;
        }
    }

    /**
     * There's already a `getArrayType` in data-size.js
     * but since uniforms can't accept array in wgsl,
     * this method excludes that part
     * returns something like vec2f, vec3f
     * @param {Array|Object} value
     * @returns {String}
     */
    #getArrayType(value) {
        const isArray = Array.isArray(value);
        let type = null;
        if (isArray) {
            const { length } = value
            if (length <= 4) {
                type = `vec${length}f`;
            }
        }
        return type;
    }

    // allows for things like:
    // uniforms.myUniform += 10
    // works on set, not on get
    // on get you obtain the Uniform
    valueOf() {
        return this.#value;
    }
}
