import { Uniform } from 'points';
import UniformsArray from './UniformsArray.js';

export default class Uniforms {
    #list = new UniformsArray();
    constructor() {
        return new Proxy(this, {
            get(target, prop, receiver) {

                // If Uniform exists we return it
                if (prop in target) {
                    const uniform = Reflect.get(target, prop, receiver);
                    return uniform;
                }
                // If Uniform does not exist we create it.
                const uniform = new Uniform({ name: prop });

                Reflect.set(target, prop, uniform, receiver);
                return uniform;
            },

            set(target, prop, value, receiver) {
                const type = typeof value;

                if (type === 'string') {
                    throw `Uniform named '${prop}': No strings allowed.`;
                }

                if (type === 'object' && !Array.isArray(value)) {
                    throw `Uniform named '${prop}': No objects allowed`;
                }

                const uniform = new Uniform({ name: prop, value });
                Reflect.set(target, prop, uniform, receiver);
                return uniform;
            }
        });
    }

    get list() {
        return this.#list;
    }

    set list(value) {
        this.#list = value;
    }

}