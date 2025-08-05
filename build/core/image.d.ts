/**
 * From a provided number, get the sprite in an atlas that matches the value.
 * @type {String}
 * @param {f32} value number to decode
 * @param {u32} index0Char starting index of the 0 char, this is an offset
 * @param {texture_2d<f32>} image sprite or atlas to get the chars from
 * @param {sampler} imageSampler
 * @param {vec2f} position
 * @param {vec2f} uv
 * @param {vec2f} ratio screen ratio, this is the default ratio parameter from the main function
 * @param {vec2u} size size in pixels
 *
 * @example
 * // js
 * import { decodeNumberSprite } from 'points/image';
 *
 * // wgsl string
 * ${decodeNumberSprite}
 * let value = decodeNumberSprite(numberToDecode, start0char, image, position, startPosition, uvr, ratio, size);
 */
export const decodeNumberSprite: string;
/**
 * Flips texture in Y. This because it comes flipped, so this corrects it.
 * @type {String}
 * @param {vec2f} uv uv coordinates
 * @returns {vec2f}
 *
 * @example
 * // js
 * import { flipTextureUV } from 'points/image';
 *
 * // wgsl string
 * ${flipTextureUV}
 * let value = flipTextureUV(uvr);
 */
export const flipTextureUV: string;
/**
 * Increase the aparent pixel size of the texture image using `textureSample`.
 * This reduces the quality of the image.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2f} uv `vec2<f32>`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { pixelateTexture } from 'points/image';
 *
 * // wgsl string
 * ${pixelateTexture}
 * let value = pixelateTexture(image, imageSampler, 10,10, uvr);
 */
export const pixelateTexture: string;
/**
 * Increase the aparent pixel size of the texture image using `texturePosition`.
 * This reduces the quality of the image.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { pixelateTexturePosition } from 'points/image';
 *
 * // wgsl string
 * ${pixelateTexturePosition}
 * let value = pixelateTexturePosition(image, imageSampler, vec2f(), 10,10, uvr);
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
 * @return {vec4f}
 *
 * @example
 * // js
 * import { sprite } from 'points/image';
 *
 * // wgsl string
 * ${sprite}
 * let value = sprite(texture, imageSampler, vec2f(), uvr, 0, vec2(8u,22u) );
 */
export const sprite: string;
/**
 * Places texture_external in a position. Texture external being in this case
 * a video loaded as texture in the JS side.
 * @type {String}
 * @param {texture_external} texture `texture_external`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { textureExternalPosition } from 'points/image';
 * await points.setTextureVideo('video', 'myvideo.mp4');
 *
 * // wgsl string
 * ${textureExternalPosition}
 * let value = textureExternalPosition(video, imageSampler, vec2f(), uvr, true);
 */
export const textureExternalPosition: string;
/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/image
 */
/**
 * Places texture in a position. The texture being an image loaded from the JS side.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { texturePosition } from 'points/image';
 *
 * await points.setTextureImage('image', 'myimage.jpg');
 *
 * // wgsl string
 * ${texturePosition}
 * let value = texturePosition(image, imageSampler, vec2f(), uvr, true);
 */
export const texturePosition: string;
