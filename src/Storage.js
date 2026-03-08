export default class Storage {
    #name
    #mapped
    #structName
    #shaderType
    #read
    #buffer = null
    #internal = false

    #stream = false
    #updated = true
    #array
    #size = null // TODO: document this: to force allocate more space in case an update is greater than the default array size
    constructor({ name, arrayData, structName, read, shaderType }) {
        this.#name = name;
        this.#mapped = !!arrayData;
        this.#structName = structName;
        this.#read = read;
        this.#shaderType = shaderType;
        this.#array = arrayData;

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

    get structName() {
        return this.#structName;
    }

    set structName(value) {
        this.#structName = value;
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

}
