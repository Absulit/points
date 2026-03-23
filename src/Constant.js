import { typeFromNumber } from "./data-size.js";

export default class Constant {
    #name
    #value
    #type
    #override
    /**
     * @param {{name:String, value:Number|Array<Number>, type:String, override:Boolean}} config
     */
    constructor({ name, value, type, override = false }) {
        this.#name = name;
        this.#value = value;
        this.#type = type || typeFromNumber(value);
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
        const type = typeFromNumber(value);
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
}
