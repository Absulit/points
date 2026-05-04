import { Uniform } from 'points';
import UniformsArray from './UniformsArray.js';

/**
 * Class that handles the creation of new {@link Uniform}s in Points.
 * @example
 * // js side
 * points.uniforms.myUniform = 10
 *
 * // wgsl side
 * let val = params.myUniform; // value is 10.0 f32
 * @class Uniforms
 */
export default class Uniforms {
    #list = new UniformsArray();

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
                // If Uniform does not exist we create it.
                const uniform = new Uniform({ name: prop });
                target.list.push(uniform);
                Reflect.set(target, prop, uniform, target);
                return uniform;
            },

            set(target, prop, value, receiver) {
                if (prop === 'list') {
                    return Reflect.set(target, prop, value, target);
                }

                const type = typeof value;
                if (type === 'string') {
                    throw `Uniform named '${prop}': No strings allowed or maybe you are adding an array.`;
                }
                if (type === 'object' && !Array.isArray(value)) {
                    throw `Uniform named '${prop}': No objects allowed.`;
                }

                if (prop in target) {
                    const uniform = Reflect.get(target, prop, target);
                    uniform.value = value;
                    return uniform;
                }

                // If Uniform does not exist we create it.

                const uniform = new Uniform({ name: prop, value });
                target.list.push(uniform);
                return Reflect.set(target, prop, uniform, target);
            }
        });
    }

    get list() {
        return this.#list;
    }

    /**
     * List of all {@link Uniform}s
     * @param {Array} value
     * @memberof Uniforms
     */
    set list(value) {
        this.#list = value;
    }

    /**
     * Retrieves a {@link Uniform} by its name.
     * @param {String} name
     * @returns {Uniform}
     * @memberof Uniforms
     */
    find(name) {
        return this[name];
    }

    /**
     * Add a new {@link Uniform}
     * @param {Uniform} uniform
     * @memberof Uniforms
     */
    add(uniform) {
        const { name } = uniform;
        if (this[name]) {
            throw `Uniform named ${name} already exists.`
        }
        this[name] = uniform;
        this.#list.push(uniform);
    }
}
