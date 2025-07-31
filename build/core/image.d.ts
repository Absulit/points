/**
 * @type {String}
 * @param {f32} value
 * @param {u32} index0Char
 * @param {texture_2d<f32>} image
 * @param {sampler} imageSampler
 * @param {vec2f} position
 * @param {vec2f} uv
 * @param {vec2f} ratio
 * @param {vec2u} size
 */
export const decodeNumberSprite: string;
/**
 * Flips texture in Y. This because it comes flipped, so this corrects it.
 * @type {String}
 * @param {vec2f} uv uv coordinates
 * @return `vec2f`
 */
export const flipTextureUV: string;
/**
 * Increase the aparent pixel size of the texture image using `textureSample`
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 */
export const pixelateTexture: string;
/**
 * Increase the aparent pixel size of the texture image using `texturePosition`
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 */
export const pixelateTexturePosition: string;
/**
 * Sprite or Atlas. Extract a piece of the sprite with an index.
 * @type {String}
 * @param {texture_2d<f32>} texture texture to sample
 * @param {sampler} aSampler a sampler
 * @param {vec2f} position coordiantes where the image will be printed
 * @param {vec2f} uv uv coordinates
 * @param {vec2f} index position in the atlas: e.g. `0` is the first
 * @param {vec2f} size dimensions of the cell: e.g. `32x32px`
 * @return `vecff`
 */
export const sprite: string;
/**
 * places texture_external in a position
 * @type {String}
 * @param {texture_external} texture `texture_external`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f
 */
export const textureExternalPosition: string;
/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/image
 */
/**
 * places texture in a position
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f`
 */
export const texturePosition: string;
