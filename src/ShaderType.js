'use strict';

/**
 * In different calls to the main {@link Points} class, it is used to
 * tell the library in what stage of the shaders the data to be sent.
 * @class ShaderType
 *
 * @example
 * // Send storage data to the Fragment Shaders only
 * points.setStorage('variables', 'Variables', false, ShaderType.FRAGMENT);
 * points.setStorage('objects', `array<Object, ${numObjects}>`, false, ShaderType.FRAGMENT);
 *
 * @example
 * // Send storage data to the Compute Shaders only
 * points.setStorage('variables', 'Variable', false, ShaderType.COMPUTE);
 *
 *
 */
class ShaderType {
    static VERTEX = 1;
    static COMPUTE = 2;
    static FRAGMENT = 3;
}

export default ShaderType;
