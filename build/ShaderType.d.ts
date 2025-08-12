export { ShaderType as default };
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
 */
declare class ShaderType {
    /**
     * Vertex Shader
     */
    static VERTEX: number;
    /**
     * Compute Shader
     */
    static COMPUTE: number;
    /**
     * Fragment Shader
     */
    static FRAGMENT: number;
}
