import { getWGSLType } from './data-size.js';

export default class Constant {
    #name
    #value
    #type
    #override
    /**
     * @param {{name:String, value:Number|Array<Number>, type:String, override:Boolean}} config
     */
    constructor({ name, value, type, override = false }) {

        this.#validateName(name);
        this.#validateType(type);
        this.#validateValue(value);

        this.#name = name;
        this.#type = type || getWGSLType(value);
        if (this.#type.indexOf('vec') !== -1) {
            value = `vec${value.length}f(${value})`
        }
        this.#value = value;
        this.#override = override;
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
        const type = getWGSLType(value);
        if (type.indexOf('vec') !== -1) {
            value = `vec${value.length}f(${value})`
        }
        this.#value = value;
        this.#type = type;
    }

    get type() {
        return this.#type;
    }

    set type(value) {
        this.#type = value;
    }

    get override() {
        return this.#override;
    }

    set override(value) {
        this.#override = value;
    }

    #validateValue(value) {
        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Uint8Array)) {
            throw `Constant '${this.#name}' value:'${value}' can't be an Object.`
        }

        if (typeof value === 'string') {
            throw `Constant '${this.#name}' value: '${value}' can't be an String.`
        }

        const isArray = Array.isArray(value);
        if (isArray) {
            const { length } = value;
            if (Array.isArray(this.#value)) {
                if (length != this.#value.length) {
                    throw `Constant named '${this.#name}': Size of the array value has changed from ${this.#value.length} to ${length}.`
                }
            }

        }
    }

    #validateName(value) {
        if (typeof value === 'number') {
            throw `Constant name '${this.#name}' can't be an Number.`
        }

        if (typeof value === 'string') {
            const valNumber = +value;

            if (!Number.isNaN(valNumber) && typeof valNumber === 'number') {
                throw `Constant name '${this.#name}' can't be an Number.`
            }
        }
    }

    #validateType(value) {

    }

}
