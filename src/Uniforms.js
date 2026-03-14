import { Uniform } from "points";

export default class Uniforms {
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
                console.log(type);

                if (type === 'string') {
                    throw `Uniform named "${prop}": No strings allowed.`;
                }

                if (type === 'object') {
                    throw `Uniform named "${prop}": No objects allowed`;
                }

                const uniform = new Uniform({ name: prop, value });
                Reflect.set(target, prop, uniform, receiver);
                return uniform;

                // throw `Uniform named "${prop}": No direct assignment of Uniforms allowed. Check Uniforms documentation.`;


                // Logic: Prevent modification of "private" keys
                // if (prop.startsWith('_')) {
                //     console.error(`Access Denied: Cannot modify private property ${prop}`);
                //     return false;
                // }

                // console.log(typeof value);
                // console.log(`Setting ${prop} to ${value}`);
                // return Reflect.set(target, prop, value, receiver);
            }
        });
    }

}