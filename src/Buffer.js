export default class Buffer {
    #name
    #value
    #type
    #size
    constructor({ name, value, structName = null, size = null }) {
        this.#name = name;
        this.#value = value;
        this.#type = structName;
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
        return {
            name: this.#name,
            value: this.#value,
            structName: this.#type,
            size: this.#size
        };
    }




}
