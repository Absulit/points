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
export const euclideanDistance = /*wgsl*/`
fn euclideanDistance(color:vec4f, distanceColor:vec4f) -> f32{
    return sqrt(
        pow(color.r - distanceColor.r, 2.) +
        pow(color.g - distanceColor.g, 2.) +
        pow(color.b - distanceColor.b, 2.)
    );
}
`;

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
export const getClosestColorInPalette = /*wgsl*/`
${euclideanDistance}

fn getClosestColorInPalette(color:vec4f, numPaletteItems:u32, distance:f32) -> vec4f {
    // numPaletteItems = 5
    // getClosestColorInPalette_palette = array< vec4f, 5 /* numPaletteItems */>(
    //     vec4(0),
    //     vec4(0,1,0,1),
    //     vec4(1,0,0,1),
    //     vec4(0,0,1,1),
    //     vec4(1,1,1,1),
    // );
    //var distance = .5;
    var local_distance = distance;
    var selectedColor = vec4(0.);
    for(var i = 0u; i < numPaletteItems; i++){
        let paletteColor = getClosestColorInPalette_palette[i];
        let currentDistance = euclideanDistance(color, paletteColor);
        if(currentDistance < local_distance){
            selectedColor = paletteColor;
            local_distance = currentDistance;
        }
    }

    return selectedColor;
}
`;

/**
 * To be used with `orderedDithering`.<br>
 * You can use this or create yours.
 */
export const orderedDithering_threshold_map = /*wgsl*/`
const orderedDithering_threshold_map = array<f32,16>(
    1, 9, 3, 11,
    13, 5, 15, 7,
    4, 12, 2, 10,
    16, 8, 14, 6
);
`;

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
export const orderedDithering = /*wgsl*/`
fn orderedDithering(color:vec4f, depth:f32, dims:vec2<u32>, uv:vec2f) -> vec4f {
    // const orderedDithering_threshold_map = array<f32,16>(
    //     1, 9, 3, 11,
    //     13, 5, 15, 7,
    //     4, 12, 2, 10,
    //     16, 8, 14, 6
    // );

    let t = orderedDithering_threshold_map[ i32(  (uv.x % 4.) + (uv.y % 4. * f32(dims.x))) ];

    var r = (color.r + t / depth);
    if(r < 1){r = 0;}
    var g =  (color.g + t / depth);
    if(g < 1){g = 0;}
    var b =  (color.b + t / depth);
    if(b < 1){b = 0;}
    let ditheredImage = vec4(
        r * depth,
        g * depth,
        b * depth,
        1,
    );
    return ditheredImage;
}
`;
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
export const clearMix = /*wgsl*/`
//const clearMixlevel = 1.81;//1.01
fn clearMix(color:vec4f, level:f32) -> vec4f {
    let rr = color.r / level;
    let gr = color.g / level;
    let br = color.b / level;
    var ar = color.a / level;
    if(ar <= .09){
        ar = 0.;
    }
    return vec4f(rr, gr, br, ar);
}
`;

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
export const clearAlpha = /*wgsl*/`
// level 2.
fn clearAlpha(currentColor:vec4f, level:f32) -> vec4f{
    var ar = currentColor.a / level;
    if(ar <= .09){
        ar = 0.;
    }
    return vec4f(currentColor.rgb, ar);
}
`;

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
export const getColorsAroundTexture = /*wgsl*/`
fn getColorsAroundTexture(texture:texture_2d<f32>, position: vec2<i32>, distance: i32) -> array<  vec4f, 8  > {
    return array< vec4f,8 >(
        textureLoad(texture, vec2<i32>( position.x-distance, position.y-distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x, position.y-distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x+distance, position.y-distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x-distance, position.y  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x+distance, position.y  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x-distance, position.y+distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x, position.y+distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x+distance, position.y+distance  ),  0).rgba,
    );
}
`;

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
export const getColorsAround4Texture = /*wgsl*/`
fn getColorsAround4Texture(texture:texture_2d<f32>, position: vec2<i32>, distance: i32) -> array<  vec4f, 4  > {
    return array< vec4f, 4 >(
        //textureLoad(texture, vec2<i32>( position.x-distance, position.y-distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x, position.y-distance  ),  0).rgba,
        //textureLoad(texture, vec2<i32>( position.x+distance, position.y-distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x-distance, position.y  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x+distance, position.y  ),  0).rgba,
        //textureLoad(texture, vec2<i32>( position.x-distance, position.y+distance  ),  0).rgba,
        //textureLoad(texture, vec2<i32>( position.x, position.y+distance  ),  0).rgba,
        textureLoad(texture, vec2<i32>( position.x+distance, position.y+distance  ),  0).rgba,
    );
}
`;

// export const getColorsAroundBuffer = /*wgsl*/`

// fn getColorsAroundBuffer(bufferPointer: ptr<function, array<vec4f> >, position: vec2<i32>, distance: i32) -> array<  vec4f, 8  >{

// }
// `;

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
export const soften4 = /*wgsl*/`
fn soften4(color:vec4f, colorsAround:array<vec4f, 4>, colorPower:f32) -> vec4f {
    var newColor:vec4f = color;
    for (var indexColors = 0u; indexColors < 4u; indexColors++) {
        var colorAround = colorsAround[indexColors];
        colorAround = (color + colorAround * colorPower) / (colorPower + 1.);
        newColor += colorAround;
    }
    return newColor * .2;
}
`;

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
export const soften8 = /*wgsl*/`
fn soften8(color:vec4f, colorsAround:array<vec4f, 8>, colorPower:f32) -> vec4f {
    var newColor:vec4f = color;
    for (var indexColors = 0u; indexColors < 8u; indexColors++) {
        var colorAround = colorsAround[indexColors];
        // colorAround.r = (color.r + colorAround.r * colorPower) / (colorPower + 1.);
        // colorAround.g = (color.g + colorAround.g * colorPower) / (colorPower + 1.);
        // colorAround.b = (color.b + colorAround.b * colorPower) / (colorPower + 1.);
        // colorAround.a = (color.a + colorAround.a * colorPower) / (colorPower + 1.);

        colorAround = (color + colorAround * colorPower) / (colorPower + 1.);



        newColor += colorAround;
    }
    return newColor * .2;
}
`;

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
export const blur9 = /*wgsl*/`
fn blur9(image: texture_2d<f32>, imageSampler:sampler, position:vec2f, uv:vec2f, resolution: vec2f, direction: vec2f) -> vec4f {
    var color = vec4(0.0);
    let off1 = vec2(1.3846153846) * direction;
    let off2 = vec2(3.2307692308) * direction;
    color += texturePosition(image, imageSampler, position, uv, true) * 0.2270270270;
    color += texturePosition(image, imageSampler, position, uv + (off1 / resolution), true) * 0.3162162162;
    color += texturePosition(image, imageSampler, position, uv - (off1 / resolution), true) * 0.3162162162;
    color += texturePosition(image, imageSampler, position, uv + (off2 / resolution), true) * 0.0702702703;
    color += texturePosition(image, imageSampler, position, uv - (off2 / resolution), true) * 0.0702702703;
    return color;
}
`;

/**
 * WIP
 */
// export const blur8 = /*wgsl*/`
// fn blur8(color:vec4f, colorsAround:array<vec4f, 8>, amount:f32) -> {

// }
// `;
