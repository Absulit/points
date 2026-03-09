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
     * @param {{name:String, value:Number|Boolean|Array<Number>, type:string, size:Number}} param0
     */
    constructor({ name, value, type = null, size = null }) {
        this.#name = name;
        this.#value = value;
        this.#type = type;
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
        this.#value = value;
    }

    get type() {
        return this.#type
    }

    set type(value) {
        this.#type = value;
    }

    get size() {
        return this.#size;
    }

    set size(value) {
        this.#size = value;
    }

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
        this.#value = value;
        return this;
    }

    /**
     * Sets or updates the type (or struct) of the Uniform.
     * @param {Number|Boolean|Array<Number>} value
     */
    setType(value) {
        this.#type = value;
        return this;
    }

}
