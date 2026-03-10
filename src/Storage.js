export default class Storage {
    #name
    #mapped
    #structName
    #shaderType
    #read
    #buffer = null
    #internal = false
    // TODO document the stream feature
    /**
     * `updated` is set to true in data updates, but this is not true in
     * something like audio, where the data streams and needs to be updated
     * constantly, so if the storage map needs to be updated constantly then
     * `stream` needs to be set to true.
     */
    #stream = false
    #updated = false
    #array
    #size = null // TODO: document this: to force allocate more space in case an update is greater than the default array size
    constructor({ name, value, structName, read, shaderType,
        stream = false, updated = false, size = null }) {
        this.#name = name;
        this.#mapped = !!value;
        this.#structName = structName;
        this.#read = read;
        this.#shaderType = shaderType;
        this.#array = value;

        this.#stream = stream;
        this.#updated = updated;
        this.#size = size;

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

    get stream() {
        return this.#stream;
    }

    set stream(value) {
        this.#stream = value;
    }

    get updated() {
        return this.#updated;
    }

    set updated(value) {
        this.#updated = value;
    }

    get array() {
        return this.#array;
    }

    set array(value) {
        this.#array = value;
    }

}
