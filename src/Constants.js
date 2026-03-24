import { Constant } from 'points';

export default class Constants {
    #list = [];

    constructor() {
        return new Proxy(this, {
            get(target, prop, receiver) {

                const value = Reflect.get(target, prop, target);

                if (prop === 'list') {
                    return value;
                }

                if (typeof value === 'function') {
                    switch (prop) {
                        case 'find':
                        case 'add':
                        case 'listOfOverrides':
                        case 'stringOfNonOverrides':
                            return value.bind(target);
                    }
                }

                if (prop in target) {
                    return value;
                }
                // If Constant does not exist we create it.
                const constant = new Constant({ name: prop });
                target.list.push(constant);
                Reflect.set(target, prop, constant, target);
                return constant;
            },

            set(target, prop, value, receiver) {
                if (prop === 'list') {
                    return Reflect.set(target, prop, value, target);
                }

                const type = typeof value;
                if (type === 'string') {
                    throw `Constant named '${prop}': No strings allowed or maybe you are adding an array.`;
                }
                if (!type && type === 'object' && !Array.isArray(value)) {
                    throw `Constant named '${prop}': No objects allowed.`;
                }

                if (prop in target) {
                    const constant = Reflect.get(target, prop, target);
                    constant.value = value;
                    return constant;
                }

                // If Constant does not exist we create it.

                const constant = new Constant({ name: prop, value });
                target.list.push(constant);
                return Reflect.set(target, prop, constant, target);
            }
        });
    }

    get list() {
        return this.#list;
    }

    set list(value) {
        this.#list = value;
    }

    find(name) {
        return this[name];
    }

    /**
     * Add a new storage
     * @param {Constant} constant
     */
    add(constant) {
        this[constant.name] = constant;
        this.#list.push(constant);
    }

    /**
     * Object list with the constants that are overridable.
     * This object will be passed into the pipeline.
     * @param {GPUShaderStage|Number} filter
     * @returns {Object}
     */
    listOfOverrides(filter) {
        return Object.fromEntries(
            this.#list
                .filter(c => ((filter & c.shaderStage) !== 0))
                .filter(c => c.override)
                .map(c => [c.name, c.value])
        );
    }

    /**
     * List of constants formatted as WGSL string to be interpolated in the
     * shaders.
     * @param {GPUShaderStage|Number} filter
     * @returns {String}
     */
    stringOfNonOverrides(filter) {
        let consStrings = '';
        this.#list.forEach(c => {
            const hasOneStage = (filter & c.shaderStage) !== 0;
            if (!c.override && hasOneStage) {
                consStrings += /*wgsl*/`const ${c.name}:${c.type} = ${c.value};\n`;
            }
        })
        return consStrings;
    }
}
