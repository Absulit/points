/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/voronoi
 */
/**
 * Voronoi noise
 * @type {String}
 * @param {vec2f} p origin point
 * @param {u32} numPoints number of cells
 * @return `vec2f`
 */
export const voronoi: string;
