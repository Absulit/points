/* @ts-self-types="./points.core.module.d.ts" */
/**
 * Utilities for animation
 */

/**
 * @type {String}
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @param {f32} speed
 */
const fusin = /*wgsl*/`
fn fusin(speed: f32) -> f32{
    return sin(params.time * speed);
}
`;

/**
 * @type {String}
 * Animates `cos()` over `params.time` and a provided `speed`.
 * The value is not normalized, so in the range -1..1
 * @param {f32} speed
 */
const fucos = /*wgsl*/`
fn fucos(speed: f32) -> f32{
    return cos(params.time * speed);
}
`;

/**
 * @type {String}
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @param {f32} speed
 */
const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1.) * .5;
}
`;

const audioAverage = /*wgsl*/`
fn audioAverage(sound:Sound) -> f32 {
    var audioAverage = 0.;
    for (var index = 0; index < i32(params.audioLength); index++) {
        let audioValue = sound.data[index] / 256;
        audioAverage += audioValue;
    }
    return audioAverage / params.audioLength;
}
`;

const audioAverageSegments = /*wgsl*/`
fn audioAverageSegments(segmentNum:i32) -> f32{
    // arrayLength(&array)
    return .0;
}
`;

// original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)
// https://github.com/ashima/webgl-noise/blob/master/src/cellular2D.glsl

/**
 * @type {String}
 * Cellular noise
 * @param {vec2f} P position
 * @return `vec2f`
 */

const cellular = /*wgsl*/`
// Modulo 289 without a division (only multiplications)
fn mod289_v3(x:vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289(x: vec2<f32>) -> vec2<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

// Modulo 7 without a division
fn mod7(x:vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 7.0)) * 7.0;
}

// Permutation polynomial: (34x^2 + 6x) mod 289
fn permute(x: vec3<f32>) -> vec3<f32> {
    return mod289_v3((34.0 * x + 10.0) * x);
}

// Cellular noise, returning F1 and F2 in a vec2.
// Standard 3x3 search window for good F1 and F2 values
const K = 0.142857142857; // 1/7
const Ko = 0.428571428571; // 3/7
const jitter = 1.0; // Less gives more regular pattern

fn cellular(P:vec2<f32>) -> vec2<f32> {
    let Pi:vec2<f32> = mod289(floor(P));
    let Pf:vec2<f32> = fract(P);
    let oi:vec3<f32> = vec3(-1.0, 0.0, 1.0);
    let of_:vec3<f32> = vec3(-0.5, 0.5, 1.5);
    let px:vec3<f32> = permute(Pi.x + oi);
    var p:vec3<f32> = permute(px.x + Pi.y + oi); // p11, p12, p13
    var ox:vec3<f32> = fract(p*K) - Ko;
    var oy:vec3<f32> = mod7(floor(p*K))*K - Ko;
    var dx:vec3<f32> = Pf.x + 0.5 + jitter*ox;
    var dy:vec3<f32> = Pf.y - of_ + jitter*oy;
    var d1:vec3<f32> = dx * dx + dy * dy; // d11, d12 and d13, squared
    p = permute(px.y + Pi.y + oi); // p21, p22, p23
    ox = fract(p*K) - Ko;
    oy = mod7(floor(p*K))*K - Ko;
    dx = Pf.x - 0.5 + jitter*ox;
    dy = Pf.y - of_ + jitter*oy;
    var d2 = dx * dx + dy * dy; // d21, d22 and d23, squared
    p = permute(px.z + Pi.y + oi); // p31, p32, p33
    ox = fract(p*K) - Ko;
    oy = mod7(floor(p*K))*K - Ko;
    dx = Pf.x - 1.5 + jitter*ox;
    dy = Pf.y - of_ + jitter*oy;
    let d3 = dx * dx + dy * dy; // d31, d32 and d33, squared
    // Sort out the two smallest distances (F1, F2)
    let d1a = min(d1, d2);
    d2 = max(d1, d2); // Swap to keep candidates for F2
    d2 = min(d2, d3); // neither F1 nor F2 are now in d3
    d1 = min(d1a, d2); // F1 is now in d1
    d2 = max(d1a, d2); // Swap to keep candidates for F2

    //d1.xy = (d1.x < d1.y) ? d1.xy : d1.yx; // Swap if smaller
    if(d1.x < d1.y){
        //d1.xy = d1.xy;
    }else{
        //d1.xy = d1.yx;
        d1 = vec3(d1.yx, d1.z);
    }

    //d1.xz = (d1.x < d1.z) ? d1.xz : d1.zx; // F1 is in d1.x
    if(d1.x < d1.z){

    }else{
        //d1.xz = d1.zx;
        d1 = vec3(d1.z, d1.y, d1.x);
    }


    //d1.yz = min(d1.yz, d2.yz); // F2 is now not in d2.yz
    d1 = vec3(d1.x, min(d1.yz, d2.yz));

    d1.y = min(d1.y, d1.z); // nor in  d1.z
    d1.y = min(d1.y, d2.x); // F2 is in d1.y, we're done.
    return sqrt(d1.xy);
}
`;

// original: Author :  Stefan Gustavson (stefan.gustavson@liu.se)
// https://github.com/ashima/webgl-noise/blob/master/src/classicnoise2D.glsl

const auxiliars = /*wgsl*/`
fn mod289(x:vec4<f32>) -> vec4<f32> {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x:vec4<f32>) -> vec4<f32> {
  return mod289(((x*34.0)+10.0)*x);
}

fn taylorInvSqrt(r:vec4<f32>) -> vec4<f32> {
  return 1.79284291400159 - 0.85373472095314 * r;
}

fn fade(t:vec2<f32>) -> vec2<f32> {
  return t*t*t*(t*(t*6.0-15.0)+10.0);
}
`;

/**
 * @type {String}
 * Classic Perlin Noise
 * @param {vec2f} P point
 * @return `f32`
 */
const cnoise = /*wgsl*/`
${auxiliars}

// Classic Perlin noise
fn cnoise(P:vec2<f32>) ->f32 {
    var Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    let Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = mod289(Pi); // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;

    let i = permute(permute(ix) + iy);

    var gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    let gy = abs(gx) - 0.5 ;
    let tx = floor(gx + 0.5);
    gx = gx - tx;

    var g00 = vec2(gx.x,gy.x);
    var g10 = vec2(gx.y,gy.y);
    var g01 = vec2(gx.z,gy.z);
    var g11 = vec2(gx.w,gy.w);

    var norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    let n00 = dot(g00, vec2(fx.x, fy.x));
    let n10 = dot(g10, vec2(fx.y, fy.y));
    let n01 = dot(g01, vec2(fx.z, fy.z));
    let n11 = dot(g11, vec2(fx.w, fy.w));

    let fade_xy = fade(Pf.xy);
    let n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}
`;
/**
 * @type {String}
 * Classic Perlin Noise, periodic variant
 * @param {vec2f} P point
 * @param {vec2f} rep point
 * @return `f32`
 */
const pnoise = /*wgsl*/`
${auxiliars}

// Classic Perlin noise, periodic variant
fn pnoise(P:vec2<f32>, rep:vec2<f32>) -> f32 {
    var Pi = floor(P.xyxy) + vec4(0.0, 0.0, 1.0, 1.0);
    let Pf = fract(P.xyxy) - vec4(0.0, 0.0, 1.0, 1.0);
    Pi = Pi % rep.xyxy; // To create noise with explicit period
    Pi = mod289(Pi);        // To avoid truncation effects in permutation
    let ix = Pi.xzxz;
    let iy = Pi.yyww;
    let fx = Pf.xzxz;
    let fy = Pf.yyww;

    let i = permute(permute(ix) + iy);

    var gx = fract(i * (1.0 / 41.0)) * 2.0 - 1.0 ;
    let gy = abs(gx) - 0.5 ;
    let tx = floor(gx + 0.5);
    gx = gx - tx;

    var g00 = vec2(gx.x,gy.x);
    var g10 = vec2(gx.y,gy.y);
    var g01 = vec2(gx.z,gy.z);
    var g11 = vec2(gx.w,gy.w);

    let norm = taylorInvSqrt(vec4(dot(g00, g00), dot(g01, g01), dot(g10, g10), dot(g11, g11)));
    g00 *= norm.x;
    g01 *= norm.y;
    g10 *= norm.z;
    g11 *= norm.w;

    let n00 = dot(g00, vec2(fx.x, fy.x));
    let n10 = dot(g10, vec2(fx.y, fy.y));
    let n01 = dot(g01, vec2(fx.z, fy.z));
    let n11 = dot(g11, vec2(fx.w, fy.w));

    let fade_xy = fade(Pf.xy);
    let n_x = mix(vec2(n00, n01), vec2(n10, n11), fade_xy.x);
    let n_xy = mix(n_x.x, n_x.y, fade_xy.y);
    return 2.3 * n_xy;
}
`;

/**
 * @type {String}
 * places texture in a position
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f`
 */
const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0., 1.);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > position.x + imageRatio.x;
    let isBeyondImageLeft = uv.x < position.x;
    let isBeyondTop =  uv.y > top.y ;
    let isBeyondBottom = uv.y < position.y;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * @type {String}
 * places texture_external in a position
 * @param {texture_external} texture `texture_external`
 * @param {sampler} aSampler `sampler`
 * @param {vec2<f32>} position `vec2<f32>`
 * @param {vec2<f32>} uv `vec2<f32>`
 * @param {bool} crop `bool`
 * @return `vec4f
 */
const textureExternalPosition = /*wgsl*/`
fn textureExternalPosition(texture:texture_external, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture);
    let dimsF32 = vec2<f32>(f32(dims.x), f32(dims.y));

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0, 1);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSampleBaseClampToEdge(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > position.x + imageRatio.x;
    let isBeyondImageLeft = uv.x < position.x;
    let isBeyondTop =  uv.y > top.y ;
    let isBeyondBottom = uv.y < position.y;
    if(crop && (isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight)){
        rgbaImage = vec4(0);
    }

    return rgbaImage;
}
`;

/**
 * @type {String}
 * Flips texture in Y. This because it comes flipped, so this corrects it.
 * @param {vec2f} uv uv coordinates
 * @return `vec2f`
 */
const flipTextureUV = /*wgsl*/`
fn flipTextureUV(uv:vec2<f32>) -> vec2<f32>{
    return uv * vec2(1,-1) + vec2(0,1);
}
`;

/**
 * @type {String}
 * Sprite or Atlas. Extract a piece of the sprite with an index.
 * @param {texture_2d<f32>} texture texture to sample
 * @param {sampler} aSampler a sampler
 * @param {vec2f} position coordiantes where the image will be printed
 * @param {vec2f} uv uv coordinates
 * @param {vec2f} index position in the atlas: e.g. `0` is the first
 * @param {vec2f} size dimensions of the cell: e.g. `32x32px`
 * @return `vecff`
 */
const sprite = /*wgsl*/`
fn sprite(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, index:u32, size:vec2<u32>) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2<f32>(dims);
    let sizeF32 = vec2<f32>(size);

    let minScreenSize = min(params.screen.y, params.screen.x);
    let imageRatio = dimsF32 / minScreenSize;

    let numColumns = (dims.x) / (size.x);

    let x = f32(index % numColumns);
    let y = f32(index / numColumns);
    let cell = vec2(x, y);

    let cellIndex = cell + vec2(0,1.);

    let cellSize = sizeF32 / minScreenSize;
    let cellSizeInImage = cellSize / imageRatio;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + cellIndex * cellSizeInImage;
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    let isBeyondImageRight = uv.x > position.x + cellSize.x;
    let isBeyondImageLeft = uv.x < position.x;
    let isBeyondTop =  uv.y > position.y + cellSize.y;
    let isBeyondBottom = uv.y < position.y;
    if(isBeyondTop || isBeyondBottom || isBeyondImageLeft || isBeyondImageRight){
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

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
const decodeNumberSprite = /*wgsl*/`
fn decodeNumberSprite(
    value:f32,
    index0Char:u32,
    image:texture_2d<f32>,
    imageSampler:sampler,
    position:vec2<f32>,
    uv:vec2<f32>,
    ratio:vec2<f32>,
    size:vec2<u32>
) -> vec4<f32> {

    let sizeF32 = vec2(f32(size.x),f32(size.y));
    let cellRatio = vec2(sizeF32.x/params.screen.x,sizeF32.y/params.screen.y)*ratio;

    let displaceInX = vec2(cellRatio.x, 0);

    var digits = vec4(0.);
    var numberToDecode = value;
    for (var index = 0; numberToDecode >= 1.; index++) {
        let number = u32(numberToDecode % 10.);
        numberToDecode = numberToDecode / 10.;
        let finalNumber = index0Char + number;
        digits += sprite(image, imageSampler, position + displaceInX * f32(-index), uv, finalNumber, size);
    }
    return digits;
}
`;

/**
 * @type {String}
 * Increase the aparent pixel size of the texture image using `textureSample`
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 */
const pixelateTexture = /*wgsl*/`
fn pixelateTexture(texture:texture_2d<f32>, textureSampler:sampler, pixelsWidth:f32, pixelsHeight:f32, uv:vec2<f32>) -> vec4<f32> {
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    return textureSample(texture, textureSampler, coord);
}
`;

/**
 * @type {String}
 * Increase the aparent pixel size of the texture image using `texturePosition`
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2<f32>} uv `vec2<f32>`
 */
const pixelateTexturePosition = /*wgsl*/`
fn pixelateTexturePosition(texture:texture_2d<f32>, textureSampler:sampler, position:vec2<f32>, pixelsWidth:f32, pixelsHeight:f32, uv:vec2<f32>) -> vec4<f32> {
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    //texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2<f32>, uv:vec2<f32>, crop:bool) -> vec4<f32> {
    return texturePosition(texture, textureSampler, position, coord, true);
}
`;

const RED = /*wgsl*/`
const RED = vec4(1.,0.,0.,1.);
`;

const GREEN = /*wgsl*/`
const GREEN = vec4(0.,1.,0.,1.);
`;

const BLUE = /*wgsl*/`
const BLUE = vec4(0.,0.,1.,1.);
`;

const YELLOW = /*wgsl*/`
const YELLOW = vec4(1.,1.,0.,1.);
`;

const CYAN = /*wgsl*/`
const CYAN = vec4(0.,1.,1.,1.);
`;

const MAGENTA = /*wgsl*/`
const MAGENTA = vec4(1.,0.,1.,1.);
`;

const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

const BLACK = /*wgsl*/`
const BLACK = vec4(0.,0.,0.,1.);
`;

/**
 * Layers two colors by cropping the color in the back
 * @param {vec4<f32>} back `vec4<f32>`
 * @param {vec4<f32>} front `vec4<f32>`
 * @return `vec4<f32>`
 */
const layer = /*wgsl*/`
// https://stackoverflow.com/a/24501192/507186
fn layer(back:vec4<f32>, front: vec4<f32>) -> vec4<f32> {
    return front * front.a + back * (1. - front.a);
}
`;

/**
 * @type {string}
 * Creates a rgba `vec4f` from an hsv color value
 * @param {f32} h hue
 * @param {f32} s saturation
 * @param {f32} v value
 * @return `vec4f`
 */
const RGBAFromHSV = /*wgsl*/`
fn hsvAux(h:f32, s:f32, v:f32, n:f32) -> f32 {
    let k:f32 = (n + h * 6.) % 6.;
    return v - v * s * max(min(min(k, 4. - k), 1.), 0.);
};

fn RGBAFromHSV(h:f32, s:f32, v:f32) ->  vec4<f32>{
    return vec4<f32>(hsvAux(h, s, v, 5.), hsvAux(h, s, v, 3.), hsvAux(h, s, v, 1.), 1.);
}
`;

/**
 * @type {String}
 * Compute the FFT (Fast Fourier Transform)
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 */
const bloom = /*wgsl*/`
fn bloom(input:f32, iterations:i32, intensity:f32) -> f32 {
    var output = 0.;
    let iterationsF32 = f32(iterations);
    for (var k = 0; k < iterations; k++) {
        let kf32 = f32(k);
        for (var n = 0; n < iterations; n++) {
            let coef = cos(2. * PI * kf32 * f32(n) / iterationsF32 );
            output += input * coef * intensity;
        }
    }
    return output;
}
`;


/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Standard
 * LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
 * @param {vec4f} color
 * @return `f32`
 */
const brightness = /*wgsl*/`
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

/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Percieved A
 * LuminanceB = (0.299*R + 0.587*G + 0.114*B)
 * @param {vec4f} color
 * @return `f32`
 */
const brightnessB = /*wgsl*/`
fn brightnessB(color:vec4<f32>) -> f32 {
    return (0.299 * color.r) + (0.587 * color.g) + (0.114 * color.b);
}
`;

/**
 * @type {String}
 * Returns the perceived brightness of a color by the eye
 * # Percieved B
 * slower to calculate
 *
 * LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
 * @param {vec4f} color
 * @return `f32`
 */
const brightnessC = /*wgsl*/`
fn brightnessC(color:vec4<f32>) -> f32 {
    return (0.2126 * pow(color.r, 2.)) + (0.7152 * pow(color.g, 2.)) + (0.0722 * pow(color.b, 2.));
}
`;

export { BLACK, BLUE, CYAN, GREEN, MAGENTA, RED, RGBAFromHSV, WHITE, YELLOW, audioAverage, audioAverageSegments, bloom, brightness, brightnessB, brightnessC, cellular, cnoise, decodeNumberSprite, flipTextureUV, fnusin, fucos, fusin, layer, pixelateTexture, pixelateTexturePosition, pnoise, sprite, textureExternalPosition, texturePosition };
