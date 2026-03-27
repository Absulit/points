import { getWGSLType } from './data-size.js';

export default class Constant {
    #name
    #value
    #type
    #override
    #shaderStage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE
    /**
     * @param {{name:String, value:(Number|Array<Number>), type:String, override:Boolean}} config
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

    /**
     * The name that the Constant will have on the WGSL side.
     * @param {String} value name of the Constant. The name is used in the WGSL
     * shader.
     * @example
     * // js
     * myConstant.name = 'MYCONST';
     *
     * // wgsl
     * let newVal = MYCONST + 3;
     */
    set name(value) {
        this.#validateName(value);
        this.#name = value;
    }

    get value() {
        return this.#value;
    }

    /**
     * Get or set the value that the constant will have on the WGSL side.
     * @warning It can only be assigned once.
     * @param {Number|Array<Number>} value
     */
    set value(value) {
        this.#validateValue(value);
        const type = getWGSLType(value);
        this.#value = this.#ifTypeVecGetVecValue(type, value);
        this.#type = type;
    }

    get type() {
        return this.#type;
    }

    /**
     * Get or set the type of the constant.
     * It can be inferred automatically by just passing the value, but if
     * something more specific is required, then you should use `type`.
     * @param {String} value WGSL data type of the constant
     * @example
     * myConstant.type = 'u32';
     */
    set type(value) {
        this.#validateType(value);
        this.#type = value;
    }

    get override() {
        return this.#override;
    }

    /**
     * A constant override is a constant you can change per shader.
     * By default, POINTS interpolates constant declarations inside the WGSL
     * string shader like this:
     * ```wgsl
     * const MYCONST:u32 = 10;
     * ```
     * These declarations are added by default to all shaders in the pipeline
     * and in all render passes. These can not be changed.
     *
     * With overrides you can have the same constant in different shaders with
     * different values. The default value is passed to each pipeline and then
     * it can be overwritten in a specific shader by hand.
     * @example
     * ```js
     * // js side
     * constants.PI.setOverride(true).setValue(3.14);
     * ```
     * ```wgsl
     * // wgsl side
     * override MYCONST:u32 = 3.1415;
     * ```
     */
    set override(value) {
        this.#override = value;
    }

    get shaderStage() {
        return this.#shaderStage;
    }

    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     */
    set shaderStage(value) {
        this.#shaderStage = value;
    }

    /**
     * Sets the value of a Constant
     * @param {Number|Array<Number>} value
     * @returns {Constant}
     */
    setValue(value) {
        this.#validateValue(value);
        const type = getWGSLType(value);
        this.#value = this.#ifTypeVecGetVecValue(type, value);
        this.#type = type;
        return this;
    }

    /**
     * Set the data type of the Constant.
     * @param {String} value WGSL data type of the constant
     * @example
     * myUniform.setType('u32')
     */
    setType(value) {
        this.#validateType(value);
        this.#type = value;
        return this;
    }

    /**
     * A constant override is a constant you can change per shader.
     * By default, POINTS interpolates constant declarations inside the WGSL
     * string shader like this:
     * ```wgsl
     * const MYCONST:u32 = 10;
     * ```
     * These declarations are added by default to all shaders in the pipeline
     * and in all render passes. These can not be changed.
     *
     * With overrides you can have the same constant in different shaders with
     * different values. The default value is passed to each pipeline and then
     * it can be overwritten in a specific shader by hand.
     * @example
     * ```js
     * // js side
     * constants.PI.setOverride(true).setValue(3.14);
     * ```
     * ```wgsl
     * // wgsl side
     * override MYCONST:u32 = 3.1415;
     * ```
     */
    setOverride(value) {
        this.#override = value;
        return this;
    }

    /**
     * Tells WebGPU to which shader it can only be used.
     * @param {GPUShaderStage} value
     * @returns {Constant}
     */
    setShaderStage(value) {
        this.#shaderStage = value;
        return this;
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
