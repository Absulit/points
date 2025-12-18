/**
 * Applies a blur to an image
 * <br>
 * based on https://github.com/Jam3/glsl-fast-gaussian-blur/blob/master/9.glsl
 *
 * @param {texture_2d} image
 * @param {sampler} imageSampler
 * @param {vec2f} position
 * @param {vec2f} uv
 * @param {vec2f} resolution
 * @param {vec2f} direction
 *
 * @example
 * // js
 * import { blur9 } from 'points/effects';
 *
 * // wgsl string
 * ${blur9}
 * let value = blur9(image, imageSampler, position, uv, resolution, direction);
 */
export const blur9: "\nfn blur9(image: texture_2d<f32>, imageSampler:sampler, position:vec2f, uv:vec2f, resolution: vec2f, direction: vec2f) -> vec4f {\n    var color = vec4(0.0);\n    let off1 = vec2(1.3846153846) * direction;\n    let off2 = vec2(3.2307692308) * direction;\n    color += texturePosition(image, imageSampler, position, uv, true) * 0.2270270270;\n    color += texturePosition(image, imageSampler, position, uv + (off1 / resolution), true) * 0.3162162162;\n    color += texturePosition(image, imageSampler, position, uv - (off1 / resolution), true) * 0.3162162162;\n    color += texturePosition(image, imageSampler, position, uv + (off2 / resolution), true) * 0.0702702703;\n    color += texturePosition(image, imageSampler, position, uv - (off2 / resolution), true) * 0.0702702703;\n    return color;\n}\n";
/**
 * Takes a color and reduces its value but applied to the alpha channel.
 * @param {vec4f} currentColor
 * @param {f32} level
 *
 * @example
 * // js
 * import { clearAlpha } from 'points/effects';
 *
 * // wgsl string
 * ${clearAlpha}
 * let value = clearAlpha(color, 1.01);
 */
export const clearAlpha: "\n// level 2.\nfn clearAlpha(currentColor:vec4f, level:f32) -> vec4f{\n    var ar = currentColor.a / level;\n    if(ar <= .09){\n        ar = 0.;\n    }\n    return vec4f(currentColor.rgb, ar);\n}\n";
/**
 * Takes a color and reduces its values by a `level`
 * @param {vec4f} color
 * @param {f32} level
 *
 * @example
 * // js
 * import { clearMix } from 'points/effects';
 *
 * // wgsl string
 * ${clearMix}
 * let value = clearMix(color, 1.01);
 */
export const clearMix: "\n//const clearMixlevel = 1.81;//1.01\nfn clearMix(color:vec4f, level:f32) -> vec4f {\n    let rr = color.r / level;\n    let gr = color.g / level;\n    let br = color.b / level;\n    var ar = color.a / level;\n    if(ar <= .09){\n        ar = 0.;\n    }\n    return vec4f(rr, gr, br, ar);\n}\n";
/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/effects
 */
/**
 * Calculates the [Euclidean Distance](https://en.wikipedia.org/wiki/Euclidean_distance)
 * between colors.
 * @type {String}
 * @param {vec4f} color
 * @param {vec4f} distanceColor
 * @returns {f32}
 *
 * @example
 * // js
 * import { euclideanDistance } from 'points/effects';
 *
 * // wgsl string
 * ${euclideanDistance}
 * let currentDistance = euclideanDistance(color, paletteColor);
 */
export const euclideanDistance: string;
/**
 * This assumes you have declared a palette in a variable or constant called
 * `getClosestColorInPalette_palette`
 * <br>
 * Gets the closest color based on the `distance` parameter.
 * @type {String}
 * @param {vec4f} color `vec4f` color to replace with
 * @param {u32} numPaletteItems `u32` length of getClosestColorInPalette_palette
 * @param {f32} distance `f32` from 0..1 that indicates how close it should be from the color
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { getClosestColorInPalette } from 'points/effects';
 *
 * // wgsl string
 * ${getClosestColorInPalette}
 *
 * const numPaletteItems = 2;
 * const getClosestColorInPalette_palette = array<vec4f, numPaletteItems>(
 *  vec4(255./255., 69./255., 0., 1.),
 *  vec4(255./255., 168./255., 0, 1.),
 * );
 *
 * let value = getClosestColorInPalette(rgba, numPaletteItems, distance);
 */
export const getClosestColorInPalette: string;
/**
 * From a given texture and its position, get top, botto, left and right color values
 * @param {texture_2d} texture
 * @param {vec2i} position
 * @param {i32} distance
 *
 * @example
 * // js
 * import { getColorsAround4Texture } from 'points/effects';
 *
 * // wgsl string
 * ${getColorsAround4Texture}
 * let value = getColorsAround4Texture(texture, position, distance);
 */
export const getColorsAround4Texture: "\nfn getColorsAround4Texture(texture:texture_2d<f32>, position: vec2<i32>, distance: i32) -> array<  vec4f, 4  > {\n    return array< vec4f, 4 >(\n        //textureLoad(texture, vec2<i32>( position.x-distance, position.y-distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x, position.y-distance  ),  0).rgba,\n        //textureLoad(texture, vec2<i32>( position.x+distance, position.y-distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x-distance, position.y  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x+distance, position.y  ),  0).rgba,\n        //textureLoad(texture, vec2<i32>( position.x-distance, position.y+distance  ),  0).rgba,\n        //textureLoad(texture, vec2<i32>( position.x, position.y+distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x+distance, position.y+distance  ),  0).rgba,\n    );\n}\n";
/**
 * From a given texture and its position, get the 9 color values around.
 * @param {texture_2d} texture
 * @param {vec2i} position
 * @param {i32} distance
 *
 * @example
 * // js
 * import { getColorsAroundTexture } from 'points/effects';
 *
 * // wgsl string
 * ${getColorsAroundTexture}
 * let value = getColorsAroundTexture(texture, position, distance);
 */
export const getColorsAroundTexture: "\nfn getColorsAroundTexture(texture:texture_2d<f32>, position: vec2<i32>, distance: i32) -> array<  vec4f, 8  > {\n    return array< vec4f,8 >(\n        textureLoad(texture, vec2<i32>( position.x-distance, position.y-distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x, position.y-distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x+distance, position.y-distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x-distance, position.y  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x+distance, position.y  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x-distance, position.y+distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x, position.y+distance  ),  0).rgba,\n        textureLoad(texture, vec2<i32>( position.x+distance, position.y+distance  ),  0).rgba,\n    );\n}\n";
/**
 * Applies [Ordered Dithering](https://en.wikipedia.org/wiki/Ordered_dithering) to a color.
 * Best with the colors of an image texture.
 * <br>
 * This requires `orderedDithering_threshold_map` to be imported or
 * create your own version of it.
 * @param {vec4f} color
 * @param {f32} depth
 * @param {vec2f} dims dimensions
 * @param {vec2f} uv
 * @returns {vec4f}
 *
 * @example
 * // js
 * import { orderedDithering, orderedDithering_threshold_map } from 'points/effects';
 *
 * // wgsl string
 * ${orderedDithering}
 * ${orderedDithering_threshold_map}
 * let color = texturePosition(image, imageSampler, vec2(0.), uvr, false);
 * let value = orderedDithering(color, depth, dims, uvr);
 */
export const orderedDithering: "\nfn orderedDithering(color:vec4f, depth:f32, dims:vec2<u32>, uv:vec2f) -> vec4f {\n    // const orderedDithering_threshold_map = array<f32,16>(\n    //     1, 9, 3, 11,\n    //     13, 5, 15, 7,\n    //     4, 12, 2, 10,\n    //     16, 8, 14, 6\n    // );\n\n    let t = orderedDithering_threshold_map[ i32(  (uv.x % 4.) + (uv.y % 4. * f32(dims.x))) ];\n\n    var r = (color.r + t / depth);\n    if(r < 1){r = 0;}\n    var g =  (color.g + t / depth);\n    if(g < 1){g = 0;}\n    var b =  (color.b + t / depth);\n    if(b < 1){b = 0;}\n    let ditheredImage = vec4(\n        r * depth,\n        g * depth,\n        b * depth,\n        1,\n    );\n    return ditheredImage;\n}\n";
/**
 * To be used with `orderedDithering`.<br>
 * You can use this or create yours.
 */
export const orderedDithering_threshold_map: "\nconst orderedDithering_threshold_map = array<f32,16>(\n    1, 9, 3, 11,\n    13, 5, 15, 7,\n    4, 12, 2, 10,\n    16, 8, 14, 6\n);\n";
/**
 * Softens a color based on list of colors around it or any list of 4 colors.
 * @param {vec4f} color
 * @param {Array<vec4f, 4>} colorsAround
 * @param {f32} colorPower intensity
 *
 * @example
 * // js
 * import { soften4 } from 'points/effects';
 *
 * // wgsl string
 * ${soften4}
 * let value = soften4(color, colorsAround,  colorPower);
 */
export const soften4: "\nfn soften4(color:vec4f, colorsAround:array<vec4f, 4>, colorPower:f32) -> vec4f {\n    var newColor:vec4f = color;\n    for (var indexColors = 0u; indexColors < 4u; indexColors++) {\n        var colorAround = colorsAround[indexColors];\n        colorAround = (color + colorAround * colorPower) / (colorPower + 1.);\n        newColor += colorAround;\n    }\n    return newColor * .2;\n}\n";
/**
 * Softens a color based on list of colors around it or any list of 8 colors.
 *
 * @param {vec4f} color
 * @param {Array<vec4f, 8>} colorsAround
 * @param {f32} colorPower intensity
 *
 * @example
 * // js
 * import { soften8 } from 'points/effects';
 *
 * // wgsl string
 * ${soften8}
 * let value = soften8(color, colorsA);
 */
export const soften8: "\nfn soften8(color:vec4f, colorsAround:array<vec4f, 8>, colorPower:f32) -> vec4f {\n    var newColor:vec4f = color;\n    for (var indexColors = 0u; indexColors < 8u; indexColors++) {\n        var colorAround = colorsAround[indexColors];\n        // colorAround.r = (color.r + colorAround.r * colorPower) / (colorPower + 1.);\n        // colorAround.g = (color.g + colorAround.g * colorPower) / (colorPower + 1.);\n        // colorAround.b = (color.b + colorAround.b * colorPower) / (colorPower + 1.);\n        // colorAround.a = (color.a + colorAround.a * colorPower) / (colorPower + 1.);\n\n        colorAround = (color + colorAround * colorPower) / (colorPower + 1.);\n\n\n\n        newColor += colorAround;\n    }\n    return newColor * .2;\n}\n";
/**
 * WIP
 */
/**
 * This function displays the wireframe of a mesh.
 * You need the barycentrics data provided by the vertex shader, this is already
 * provided in the `FragmentIn` struct in the fragment shader (`in` variable).
 * @type {String}
 * @param {vec4f} color color of the wireframe line
 * @param {vec4f} fillColor color of the rest of the triangle
 * @param {f32} thickness increase or decrease thickness of the wireframe line
 * @param {vec3f} barycentrics barycentric coordiantes. Interpolated per triangle.
 *
 * @example
 * // wgsl string
 * // fragment shader
 * return wireframe(wireframeColor, fillColor, params.thickness, in.barycentrics);
 */
export const wireframe: string;
