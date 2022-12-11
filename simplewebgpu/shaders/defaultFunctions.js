export const fnusin = /*wgsl*/`

fn fnusin(speed: f32) -> f32{
    return sin(params.utime * speed) * .5;
}

`;

export const fusin = /*wgsl*/`

fn fusin(speed: f32) -> f32{
    return sin(params.utime * speed);
}

`;

export const polar = /*wgsl*/`

fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
}

`;

export const clearMix = /*wgsl*/`;
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

export const clearAlpha = /*wgsl*/`;
// level 2.
fn clearAlpha(currentColor:vec4<f32>, level:f32) -> vec4<f32>{
    let ar = currentColor.a / level;
    return vec4<f32>(currentColor.rgb, ar);
}
`;

export const getColorsAroundTexture = /*wgsl*/`;
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

export const getColorsAround4Texture = /*wgsl*/`;
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

// export const getColorsAroundBuffer = /*wgsl*/`;

// fn getColorsAroundBuffer(bufferPointer: ptr<function, array<vec4<f32>> >, position: vec2<i32>, distance: i32) -> array<  vec4<f32>, 8  >{

// }
// `;

export const soften8 = /*wgsl*/`;
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

export const soften4 = /*wgsl*/`;
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

export const rand = /*wgsl*/`;
var<private> rand_seed : vec2<f32>;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}
`;

export const rand2 = /*wgsl*/`;
fn rand2(co: vec2<f32>) -> f32 {
    return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}
`;

export const sdfSegment = /*wgsl*/`;
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


export const RGBAFromHSV = /*wgsl*/`;
fn hsvAux(h:f32, s:f32, v:f32, n:f32) -> f32 {
    let k:f32 = (n + h * 6.) % 6.;
    return v - v * s * max(      min(min(k, 4. - k), 1.), 0.);
};

fn RGBAFromHSV(h:f32, s:f32, v:f32) ->  vec4<f32>{
    return vec4<f32>(hsvAux(h, s, v, 5), hsvAux(h, s, v, 3), hsvAux(h, s, v, 1), 1);
}
`;

export const sdfCircle = /*wgsl*/`;
fn sdfCircle(position:vec2<f32>, radius: f32, feather: f32, uv:vec2<f32>) -> vec4<f32> {
    let d = distance(uv, position);
    let st = 1 - smoothstep(radius, radius + feather, d);
    return vec4(st);
}
`;

export const rotateVector = /*wgsl*/`;
fn rotateVector(p:vec2<f32>, rads:f32 ) -> vec2<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;

export const sdfSquare = /*wgsl*/`;
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

export const sdfLine2 = /*wgsl*/`;
fn sdfLine2(p1:vec2<f32>, p2:vec2<f32>, feather:f32, uv:vec2<f32>)->f32{
    let d = sdfSegment(uv, p1, p2);
    var s = smoothstep(0, feather,  d);
    return 1-s;
}
`;
