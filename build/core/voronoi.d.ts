/**
 * Voronoi functions.
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 *
 * @author Sebastián Sanabria Díaz sebastian@absulit.com
 * @module points/voronoi
 */
/**
 * Voronoi noise. Generated randomly.
 * @type {String}
 * @param {vec2f} p origin point
 * @param {u32} numPoints number of cells
 * @return {vec2f}
 *
 * @example
 * // js
 * import { voronoi } from 'points/voronoi';
 *
 * // wgsl string
 * ${voronoi}
 * let value = voronoi(uvr, numPoints);
 */
export const voronoi: string;
