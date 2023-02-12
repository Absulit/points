export const defaultVertexBody = /*wgsl*/`
fn defaultVertexBody(position: vec4<f32>, color: vec4<f32>, uv: vec2<f32>) -> Fragment {
    var result: Fragment;

    let ratioX = params.screenWidth / params.screenHeight;
    let ratioY = 1 / ratioX / (params.screenHeight / params.screenWidth);
    result.ratio = vec2(ratioX, ratioY);
    result.position = vec4<f32>(position);
    result.color = vec4<f32>(color);
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouseX / params.screenWidth, params.mouseY / params.screenHeight);
    result.mouse = result.mouse * vec2(1,-1) - vec2(0, -1); // flip and move up

    return result;
}
`;

export const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1) * .5;
}
`;

export const fusin = /*wgsl*/`
fn fusin(speed: f32) -> f32{
    return sin(params.time * speed);
}
`;

export const fucos = /*wgsl*/`
fn fucos(speed: f32) -> f32{
    return cos(params.time * speed);
}
`;

export const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
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

export const blur8 = /*wgsl*/`
fn blur8(color:vec4<f32>, colorsAround:array<vec4<f32>, 8>, amount:f32) -> {

}
`;

export const sdfSegment = /*wgsl*/`
fn sdfSegment(p:vec2<f32>, a:vec2<f32>, b:vec2<f32> ) -> f32{
    let pa = p-a;
    let ba = b-a;
    let h:f32 = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length( pa - ba*h );
}
`;

export const sdfLine = /*wgsl*/`
fn sdfLine(p1:vec2<f32>, p2:vec2<f32>, pixelStroke:f32, uv:vec2<f32>)->f32{
    let d = sdfSegment(uv, p1, p2);
    var value = 1.0;
    if(d > pixelStroke/800.){
        value = 0.;
    }
    return value;
}
`;

/**
 * Creates a circle
 * @param {vec2<f32>} position
 * @param {f32} radius
 * @param {f32} feather
 * @param {vec2<f32>} uv
 */
export const sdfCircle = /*wgsl*/`
fn sdfCircle(position:vec2<f32>, radius: f32, feather: f32, uv:vec2<f32>) -> vec4<f32> {
    let d = distance(uv, position);
    let st = 1 - smoothstep(radius, radius + feather, d);
    return vec4(st);
}
`;

export const rotateVector = /*wgsl*/`
fn rotateVector(p:vec2<f32>, rads:f32 ) -> vec2<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;

export const sdfSquare = /*wgsl*/`
fn sdfSquare(position:vec2<f32>, radius:f32, feather:f32, rotationRads: f32, uv:vec2<f32>) -> vec4<f32> {
    let positionRotated = rotateVector(position, rotationRads);
    let uvRotated = rotateVector(uv, rotationRads);

    var d = distance(uvRotated.x,  positionRotated.x );
    var s = smoothstep(radius, radius + feather,  d);

    d = distance(uvRotated.y,  positionRotated.y);
    s += smoothstep(radius, radius + feather,  d);
    s = clamp(0,1, s);
    return vec4(1-s);
}
`;

export const sdfLine2 = /*wgsl*/`
fn sdfLine2(p1:vec2<f32>, p2:vec2<f32>, feather:f32, uv:vec2<f32>)->f32{
    let d = sdfSegment(uv, p1, p2);
    var s = smoothstep(0, feather,  d);
    return 1-s;
}
`;

/**
 * Increase the aparent pixel size of the texture image
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 */
export const pixelateTexture = /*wgsl*/`
fn pixelateTexture(texture:texture_2d<f32>, textureSampler:sampler, pixelsWidth:f32, pixelsHeight:f32, uv:vec2<f32>) -> vec4<f32> {
    let dx = pixelsWidth * (1. / params.screenWidth);
    let dy = pixelsHeight * (1. / params.screenHeight);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    return textureSample(texture, textureSampler, coord);
}
`;

export const brightness = /*wgsl*/`
fn brightness(color:vec4<f32>) -> f32 {
    // #Standard
    // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
    // #Percieved A
    // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
    // #Perceived B, slower to calculate
    // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
}
`;

export const brightnessB = /*wgsl*/`
fn brightnessB(color:vec4<f32>) -> f32 {
    return (0.299 * color.r) + (0.587 * color.g) + (0.114 * color.b);
}
`;

export const brightnessC = /*wgsl*/`
fn brightnessC(color:vec4<f32>) -> f32 {
    return (0.2126 * pow(color.r, 2.)) + (0.7152 * pow(color.g, 2.)) + (0.0722 * pow(color.b, 2.));
}
`;
