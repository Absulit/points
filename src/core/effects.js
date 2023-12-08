export const euclideanDistance = /*wgsl*/`
fn euclideanDistance(color:vec4<f32>, distanceColor:vec4<f32>) -> f32{
    return sqrt(
        pow(color.r - distanceColor.r, 2.) +
        pow(color.g - distanceColor.g, 2.) +
        pow(color.b - distanceColor.b, 2.)
    );
}
`;

/**
 * From a palette declared in `getClosestColorInPalette_palette`
 * gets the closest color based on `distance`
 * @param {vec4<f32>} color `vec4<f32>` color to replace with
 * @param {u32} numPaletteItems `u32` length of getClosestColorInPalette_palette
 * @param {f32} distance `f32` from 0..1 that indicates how close it should be from the color
 * @returns `vec4<f32>`
 */
export const getClosestColorInPalette = /*wgsl*/`
${euclideanDistance}

fn getClosestColorInPalette(color:vec4<f32>, numPaletteItems:u32, distance:f32) -> vec4<f32> {
    // numPaletteItems = 5
    // getClosestColorInPalette_palette = array< vec4<f32>, 5 /* numPaletteItems */>(
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

export const orderedDithering_threshold_map = /*wgsl*/`
const orderedDithering_threshold_map = array<f32,16>(
    1, 9, 3, 11,
    13, 5, 15, 7,
    4, 12, 2, 10,
    16, 8, 14, 6
);
`;

export const orderedDithering = /*wgsl*/`
fn orderedDithering(color:vec4<f32>, depth:f32, dims:vec2<u32>, uv:vec2<f32>) -> vec4<f32> {
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

export const clearMix = /*wgsl*/`
//const clearMixlevel = 1.81;//1.01
fn clearMix(color:vec4<f32>, level:f32) -> vec4<f32> {
    let rr = color.r / level;
    let gr = color.g / level;
    let br = color.b / level;
    var ar = color.a / level;
    if(ar <= .09){
        ar = 0.;
    }
    return vec4<f32>(rr, gr, br, ar);
}
`;

export const clearAlpha = /*wgsl*/`
// level 2.
fn clearAlpha(currentColor:vec4<f32>, level:f32) -> vec4<f32>{
    var ar = currentColor.a / level;
    if(ar <= .09){
        ar = 0.;
    }
    return vec4<f32>(currentColor.rgb, ar);
}
`;


export const getColorsAroundTexture = /*wgsl*/`
fn getColorsAroundTexture(texture:texture_2d<f32>, position: vec2<i32>, distance: i32) -> array<  vec4<f32>, 8  > {
    return array< vec4<f32>,8 >(
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

export const getColorsAround4Texture = /*wgsl*/`
fn getColorsAround4Texture(texture:texture_2d<f32>, position: vec2<i32>, distance: i32) -> array<  vec4<f32>, 4  > {
    return array< vec4<f32>, 4 >(
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

// fn getColorsAroundBuffer(bufferPointer: ptr<function, array<vec4<f32>> >, position: vec2<i32>, distance: i32) -> array<  vec4<f32>, 8  >{

// }
// `;

export const soften4 = /*wgsl*/`
fn soften4(color:vec4<f32>, colorsAround:array<vec4<f32>, 4>, colorPower:f32) -> vec4<f32> {
    var newColor:vec4<f32> = color;
    for (var indexColors = 0u; indexColors < 4u; indexColors++) {
        var colorAround = colorsAround[indexColors];
        colorAround = (color + colorAround * colorPower) / (colorPower + 1.);
        newColor += colorAround;
    }
    return newColor * .2;
}
`;

export const soften8 = /*wgsl*/`
fn soften8(color:vec4<f32>, colorsAround:array<vec4<f32>, 8>, colorPower:f32) -> vec4<f32> {
    var newColor:vec4<f32> = color;
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



export const blur9 = /*wgsl*/`
// based on https://github.com/Jam3/glsl-fast-gaussian-blur/blob/master/9.glsl
fn blur9(image: texture_2d<f32>, imageSampler:sampler, position:vec2<f32>, uv:vec2<f32>, resolution: vec2<f32>, direction: vec2<f32>) -> vec4<f32> {
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


export const blur8 = /*wgsl*/`
fn blur8(color:vec4<f32>, colorsAround:array<vec4<f32>, 8>, amount:f32) -> {

}
`;
