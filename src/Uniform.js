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
     * @param {{name:String, value:Number|Boolean|Array<Number>, type:string, size:Number}} config
     */
    constructor({ name, value, type = null, size = null }) {

        this.#validateType(value);
        this.#validateValue(value);

        this.#name = name;
        this.#value = value;
        this.#type = type || 'f32';
        this.#size = size;

        Object.seal(this);
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#name = value;
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#validateValue(value);
        this.#value = value;
    }

    get type() {
        return this.#type
    }

    set type(value) {
        this.#validateType(value);

        this.#type = value || 'f32';
    }

    get size() {
        return this.#size;
    }

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
     * Sets or updates the type (or struct) of the Uniform.
     * @param {Number|Boolean|Array<Number>} value
     *
     * @example
     * myUniform.setType('u32')
     */
    setType(value) {
        this.#validateType(value);

        this.#type = value || 'f32';
        return this;
    }

    #validateValue(value) {
        if (typeof value === 'object' && !Array.isArray(value)) {
            throw `Uniform '${this.#name}' value:'${value}' can't be an Object.`
        }

        if (typeof value === 'string') {
            throw `Uniform '${this.#name}' value: '${value}' can't be an String.`
        }
    }

    #validateName(value){

    }

    #validateType(value){
        if (value && isArray(value)) {
            throw `Uniform '${this.#name}' type: '${value}' is an array, which is currently not supported for Uniforms.`;
        }
    }
}
