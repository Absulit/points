import { Storage } from 'points';

export default class Storages {
    #list = [];

    constructor() {
        return new Proxy(this, {
            get(target, prop, receiver) {

                const value = Reflect.get(target, prop, target);

                if (prop === 'list') {
                    return value;
                }

                if (typeof value === 'function') {
                    if (prop === 'find') {
                        return value.bind(target);
                    }
                    if (prop === 'add') {
                        return value.bind(target);
                    }
                }

                if (prop in target) {
                    return value;
                }
                // If Storage does not exist we create it.
                const storage = new Storage({ name: prop, value: 0 });
                target.list.push(storage);
                Reflect.set(target, prop, storage, target);
                return storage;
            },

            set(target, prop, value, receiver) {
                if (prop === 'list') {
                    return Reflect.set(target, prop, value, target);
                }

                const type = typeof value;
                if (type === 'string') {
                    throw `Storage named '${prop}': No strings allowed or maybe you are adding an array.`;
                }
                if (!type && type === 'object' && !Array.isArray(value)) {
                    throw `Storage named '${prop}': No objects allowed.`;
                }

                if (prop in target) {
                    const storage = Reflect.get(target, prop, target);
                    storage.value = value;
                    return storage;
                }

                // If Storage does not exist we create it.

                const storage = new Storage({ name: prop, value });
                target.list.push(storage);
                return Reflect.set(target, prop, storage, target);
            }
        });
    }

    get list() {
        return this.#list;
    }

    /**
     * List of all {@link Storage}
     * @param {Array} value
     */
    set list(value) {
        this.#list = value;
    }

    /**
     * Retrieves a {@link Storage} by its name.
     * @param {String} name
     * @returns {Storage}
     */
    find(name) {
        return this[name];
    }

    /**
     * Add a new {@link Storage}
     * @param {Storage} storage
     */
    add(storage) {
        const { name } = storage;
        if (this[name]) {
            throw `Storage named ${name} already exists.`
        }
        this[name] = storage;
        this.#list.push(storage);
    }
}