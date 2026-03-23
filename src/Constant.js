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
        this.#value = this.#ifTypeVecGetVecValue(this.#type, value);
        this.#override = override;
    }

    #ifTypeVecGetVecValue(type, value) {
        let newValue = value;
        if (type.indexOf('vec') !== -1) {
            newValue = `vec${value.length}f(${value})`
        }
        return newValue;
    }

    get name() {
        return this.#name;
    }

    set name(value) {
        this.#validateName(value);
        this.#name = value;
    }

    get value() {
        return this.#value;
    }

    set value(value) {
        this.#validateValue(value);
        const type = getWGSLType(value);
        this.#value = this.#ifTypeVecGetVecValue(type, value);
        this.#type = type;
    }

    get type() {
        return this.#type;
    }

    set type(value) {
        this.#validateType(value);
        this.#type = value;
    }

    get override() {
        return this.#override;
    }

    set override(value) {
        this.#override = value;
    }

    setValue(value) {
        this.#validateValue(value);
        const type = getWGSLType(value);
        this.#value = this.#ifTypeVecGetVecValue(type, value);
        this.#type = type;
    }

    setType(value) {
        this.#validateType(value);
        this.#type = value;
    }

    setOverride(value) {
        this.#override = value;
    }

    #validateValue(value) {
        if(this.#value){
            throw `Constant '${this.#name}': can't update a const after it has been set.`;
        }

        if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Uint8Array)) {
            throw `Constant '${this.#name}' value:'${value}' can't be an Object.`
        }

        if (typeof value === 'string') {
            throw `Constant '${this.#name}' value: '${value}' can't be an String.`
        }

        const isArray = Array.isArray(value);
        if (isArray) {
            const { length } = value;
            if (length < 2) {
                throw `Constant named '${this.#name}': Size of the array is lower than 2. There's no vec1`;
            }
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
