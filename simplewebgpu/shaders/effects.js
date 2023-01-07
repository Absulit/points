export const euclideanDistance = /*wgsl*/`
fn euclideanDistance(color:vec4<f32>, distanceColor:vec4<f32>) -> f32{
    return sqrt(
        pow(color.r - distanceColor.r, 2) +
        pow(color.g - distanceColor.g, 2) +
        pow(color.b - distanceColor.b, 2)
    );
}
`;

export const getClosestColorInPalette = /*wgsl*/`
${euclideanDistance}

fn getClosestColorInPalette(color:vec4<f32>, numPaletteItems:u32) -> vec4<f32> {
    // palette should be a Storage passed from Javascript
    var distance = 1.;
    var selectedColor = vec4(0.);
    for(var i = 0u; i < numPaletteItems; i++){
        let paletteColor = getClosestColorInPalette_palette[i];
        let currentDistance = euclideanDistance(color, paletteColor);
        if(currentDistance < distance){
            selectedColor = paletteColor;
            distance = currentDistance;
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

    let t = orderedDithering_threshold_map[ i32(uv.x + (uv.y * f32(dims.x)) % depth * 32.) ];

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