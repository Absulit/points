/* @ts-self-types="./RenderPasses.module.d.ts" */
const vert$8 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
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

const frag$8 = /*wgsl*/`

${texturePosition}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);
    let colorParam = vec4(params.color_r, params.color_g, params.color_b, params.color_a);
    let finalColor:vec4<f32> = (imageColor + colorParam) * params.color_blendAmount;

    return finalColor;
}
`;

const color = {
    vertexShader: vert$8,
    fragmentShader: frag$8,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('color_blendAmount', params?.blendAmount || .5);
        points.addUniform('color_r', params?.color[0] || 1);
        points.addUniform('color_g', params?.color[1] || 1);
        points.addUniform('color_b', params?.color[2] || 0);
        points.addUniform('color_a', params?.color[3] || 1);
        points._setInternal(false);
    },
    update: points => {

    }
};

const vert$7 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

/**
 * Utilities for animation
 * @module
 */


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

const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

/**
 * @type {String}
 * Compute the FFT (Fast Fourier Transform)
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 */
const bloom$1 = /*wgsl*/`
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

const frag$7 = /*wgsl*/`

${fnusin}
${texturePosition}
${brightness}
${WHITE}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);
    let finalColor:vec4<f32> = brightness(imageColor) * WHITE;

    return finalColor;
}
`;

const grayscale = {
    vertexShader: vert$7,
    fragmentShader: frag$7,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points._setInternal(false);
    },
    update: points => {

    }
};

const vert$6 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

const frag$6 = /*wgsl*/`

${texturePosition}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);


    // --------- chromatic displacement vector
    let cdv = vec2(params.chromaticAberration_distance, 0.);
    let d = distance(vec2(.5,.5), uvr);
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr + cdv * d, true).r;
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr, true).g;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, uvr - cdv * d, true).b;

    let finalColor:vec4<f32> = vec4(imageColorR, imageColorG, imageColorB, 1);

    return finalColor;
}
`;

const chromaticAberration = {
    vertexShader: vert$6,
    fragmentShader: frag$6,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('chromaticAberration_distance', params.distance);
        points._setInternal(false);
    },
    update: points => {

    }
};

const vert$5 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

const frag$5 = /*wgsl*/`

${texturePosition}
${pixelateTexturePosition}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {


    let pixelatedColor = pixelateTexturePosition(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.),
        params.pixelate_pixelsWidth,
        params.pixelate_pixelsHeight,
        uvr
    );

    let finalColor:vec4<f32> = pixelatedColor;

    return finalColor;
}
`;

const pixelate = {
    vertexShader: vert$5,
    fragmentShader: frag$5,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('pixelate_pixelsWidth', params.pixelsWidth);
        points.addUniform('pixelate_pixelsHeight', params.pixelsHeight);
        points._setInternal(false);
    },
    update: points => {

    }
};

const vert$4 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

/**
 * Math utils
 */

const PI = /*wgsl*/`const PI = 3.14159265;`;

/**
 * @type {String}
 * Using polar coordinates, calculates the final point as `vec2<f32>`
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 */
const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2<f32> {
    return vec2<f32>(distance * cos(radians), distance * sin(radians));
}
`;

/**
 * @type {String}
 * Rotates a vector an amount of radians
 * @param {vec2f} p vector to rotate
 * @param {f32} rads angle in radians
 */
const rotateVector = /*wgsl*/`
fn rotateVector(p:vec2<f32>, rads:f32 ) -> vec2<f32> {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;

// original: Author : Ian McEwan, Ashima Arts.
// https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl

/**
 * @type {String}
 * Noise
 * @param {vec2f} v usually the uv
 * @return `f32`
 */

const snoise = /*wgsl*/`

fn mod289_v3(x: vec3<f32>) -> vec3<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_v2(x: vec2<f32>) -> vec2<f32> {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec3<f32>) -> vec3<f32> {
    return mod289_v3(((x*34.0)+10.0)*x);
}

fn snoise(v:vec2<f32>) -> f32 {
    let C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                       -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    // First corner
    var i  = floor(v + dot(v, C.yy) );
    var x0 = v -   i + dot(i, C.xx);

    // Other corners
    var i1 = vec2(0.);
    //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
    //i1.y = 1.0 - i1.x;
    //i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    if(x0.x > x0.y){ i1 = vec2(1.0, 0.0); }else{ i1 = vec2(0.0, 1.0); }
    //x0 = x0 - 0.0 + 0.0 * C.xx ;
    // x1 = x0 - i1 + 1.0 * C.xx ;
    // x2 = x0 - 1.0 + 2.0 * C.xx ;
    var x12 = x0.xyxy + C.xxzz;
    //x12.xy -= i1;
    x12 = vec4(x12.xy - i1, x12.zw); // ?? fix

    // Permutations
    i = mod289_v2(i); // Avoid truncation effects in permutation
    let p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));

    var m = max(vec3(0.5) - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), vec3(0.0));
    m = m*m ;
    m = m*m ;

    // Gradients: 41 points uniformly over a line, mapped onto a diamond.
    // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

    let x = 2.0 * fract(p * C.www) - 1.0;
    let h = abs(x) - 0.5;
    let ox = floor(x + 0.5);
    let a0 = x - ox;

    // Normalise gradients implicitly by scaling m
    // Approximation of: m *= inversesqrt( a0*a0 + h*h );
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

    // Compute final noise value at P
    var g = vec3(0.);
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    //g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    g = vec3(g.x,a0.yz * x12.xz + h.yz * x12.yw);
    return 130.0 * dot(m, g);
  }
`;

// https://www.geeks3d.com/20140213/glsl-shader-library-fish-eye-and-dome-and-barrel-distortion-post-processing-filters/

const frag$4 = /*wgsl*/`

${fnusin}
${texturePosition}
${textureExternalPosition}
${rotateVector}
${snoise}
${PI}
${WHITE}
${polar}

fn angle(p1:vec2<f32>, p2:vec2<f32>) -> f32 {
    let d = p1 - p2;
    return abs(atan2(d.y, d.x)) / PI;
}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let imagePosition = vec2(0.0,0.0) * ratio;
    let center = vec2(.5,.5) * ratio;
    let d = distance(center, uvr); // sqrt(dot(d, d));

    //vector from center to current fragment
    let vectorToCenter = uvr - center;
    let sqrtDotCenter = sqrt(dot(center, center));

    //amount of effect
    let power =  2.0 * PI / (2.0 * sqrtDotCenter )  * (params.lensDistortion_amount - 0.5);
    //radius of 1:1 effect
    var bind = .0;
    if (power > 0.0){
        //stick to corners
        bind = sqrtDotCenter;
    } else {
        //stick to borders
        if (ratio.x < 1.0) {
            bind = center.x;
        } else {
            bind = center.y;
        };
    }

    //Weird formulas
    var nuv = uvr;
    if (power > 0.0){//fisheye
        nuv = center + normalize(vectorToCenter) * tan(d * power) * bind / tan( bind * power);
    } else if (power < 0.0){//antifisheye
        nuv = center + normalize(vectorToCenter) * atan(d * -power * 10.0) * bind / atan(-power * bind * 10.0);
    } else {
        nuv = uvr;
    }

    // let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, imagePosition, nuv, false);


    // Chromatic Aberration --
    // --------- chromatic displacement vector
    let cdv = vec2(params.lensDistortion_distance, 0.);
    // let dis = distance(vec2(.5,.5), uvr);
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, nuv + cdv * params.lensDistortion_amount , true).r;
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, nuv, true).g;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * ratio, nuv - cdv * params.lensDistortion_amount , true).b;

    let chromaticAberration:vec4<f32> = vec4(imageColorR, imageColorG, imageColorB, 1);
    // -- Chromatic Aberration






    let finalColor = chromaticAberration;
    // let finalColor = vec4(nuv,0,1) * WHITE;

    return finalColor;
}
`;

const lensDistortion = {
    vertexShader: vert$4,
    fragmentShader: frag$4,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('lensDistortion_amount', params?.amount || .4);
        points.addUniform('lensDistortion_distance', params?.distance || .01);
        points._setInternal(false);
    },
    update: async points => {

    }
};

const vert$3 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

/**
 * @type {String}
 * Single random number.
 * Use `seed` to change seed.
 * @return `f32`
 */

/**
 * @type {String}
 * Random number that returns a `vec2f`.
 * Use `rand_seed:vec2f` to change seed.
 * @return `f32` equivalent to `rand_seed.y` and `rand_seed` is the result.
 */
const rand = /*wgsl*/`
var<private> rand_seed : vec2<f32>;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}
`;

const frag$3 = /*wgsl*/`

${texturePosition}
${rand}
${snoise}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {


    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr, true);

    rand_seed = uvr + params.time;

    var noise = rand();
    noise = noise * .5 + .5;
    let finalColor = (imageColor + imageColor * noise)  * .5;

    return finalColor;
}
`;

class RenderPass {
    #vertexShader;
    #computeShader;
    #fragmentShader;
    #compiledShaders
    #computePipeline = null;
    #renderPipeline = null;
    #computeBindGroup = null;
    #uniformBindGroup = null;
    #internal = false;
    #hasComputeShader;
    #hasVertexShader;
    #hasFragmentShader;
    #hasVertexAndFragmentShader;
    #workgroupCountX;
    #workgroupCountY;
    #workgroupCountZ;

    /**
     * A collection of Vertex, Compute and Fragment shaders that represent a RenderPass.
     * This is useful for PostProcessing.
     * @param {String} vertexShader  WGSL Vertex Shader in a String.
     * @param {String} fragmentShader  WGSL Fragment Shader in a String.
     * @param {String} computeShader  WGSL Compute Shader in a String.
     */
    constructor(vertexShader, fragmentShader, computeShader, workgroupCountX, workgroupCountY, workgroupCountZ) {
        this.#vertexShader = vertexShader;
        this.#computeShader = computeShader;
        this.#fragmentShader = fragmentShader;

        this.#compiledShaders = {
            vertex: '',
            compute: '',
            fragment: '',
        };

        this.#hasComputeShader = !!this.#computeShader;
        this.#hasVertexShader = !!this.#vertexShader;
        this.#hasFragmentShader = !!this.#fragmentShader;

        this.#hasVertexAndFragmentShader = this.#hasVertexShader && this.#hasFragmentShader;

        this.#workgroupCountX = workgroupCountX || 8;
        this.#workgroupCountY = workgroupCountY || 8;
        this.#workgroupCountZ = workgroupCountZ || 1;
    }

    get internal() {
        return this.#internal;
    }

    set internal(value) {
        this.#internal = value;
    }

    get vertexShader() {
        return this.#vertexShader;
    }

    get computeShader() {
        return this.#computeShader;
    }

    get fragmentShader() {
        return this.#fragmentShader;
    }

    set computePipeline(value) {
        this.#computePipeline = value;
    }

    get computePipeline() {
        return this.#computePipeline;
    }

    set renderPipeline(value) {
        this.#renderPipeline = value;
    }

    get renderPipeline() {
        return this.#renderPipeline;
    }

    set computeBindGroup(value) {
        this.#computeBindGroup = value;
    }

    get computeBindGroup() {
        return this.#computeBindGroup;
    }

    set uniformBindGroup(value) {
        this.#uniformBindGroup = value;
    }

    get uniformBindGroup() {
        return this.#uniformBindGroup;
    }

    get compiledShaders() {
        return this.#compiledShaders;
    }

    get hasComputeShader() {
        return this.#hasComputeShader;
    }

    get hasVertexShader() {
        return this.#hasVertexShader;
    }

    get hasFragmentShader() {
        return this.#hasFragmentShader;
    }

    get hasVertexAndFragmentShader() {
        return this.#hasVertexAndFragmentShader;
    }

    get workgroupCountX() {
        return this.#workgroupCountX;
    }

    get workgroupCountY() {
        return this.#workgroupCountY;
    }

    get workgroupCountZ() {
        return this.#workgroupCountZ;
    }
}

const filmgrain = {
    vertexShader: vert$3,
    fragmentShader: frag$3,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points._setInternal(false);

    },
    update: points => {

    }
};

const vert$2 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

const frag$2 = /*wgsl*/`

${texturePosition}
${bloom$1}
${brightness}
${PI}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let startPosition = vec2(0.,0.);
    let rgbaImage = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, startPosition, uvr, false); //* .998046;

    let input = brightness(rgbaImage);
    let bloomVal = bloom(input, i32(params.bloom_iterations), params.bloom_amount);
    let rgbaBloom = vec4(bloomVal);

    let finalColor:vec4<f32> = rgbaImage + rgbaBloom;

    return finalColor;
}
`;

const bloom = {
    vertexShader: vert$2,
    fragmentShader: frag$2,
    /**
     * 
     * @param {Points} points 
     * @param {*} params 
     */
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('bloom_amount', params?.amount || .5);
        points.addUniform('bloom_iterations', params?.iterations || 2);
        points._setInternal(false);

    },
    update: points => {

    }
};

const vert$1 = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

const blur9 = /*wgsl*/`
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

const frag$1 = /*wgsl*/`

${texturePosition}
${PI}
${rotateVector}
${blur9}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {



    let feedbackColor = blur9(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.,0),
        uvr,
        vec2(params.blur_resolution_x, params.blur_resolution_y), // resolution
        rotateVector(vec2(params.blur_direction_x, params.blur_direction_y), params.blur_radians) // direction
    );

    let finalColor = feedbackColor;

    return finalColor;
}
`;

const blur = {
    vertexShader: vert$1,
    fragmentShader: frag$1,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('blur_resolution_x', params?.resolution[0] || 50);
        points.addUniform('blur_resolution_y', params?.resolution[1] || 50);
        points.addUniform('blur_direction_x', params?.direction[0] || .4);
        points.addUniform('blur_direction_y', params?.direction[1] || .4);
        points.addUniform('blur_radians', params?.radians || 0);
        points._setInternal(false);
    },
    update: points => {

    }
};

const vert = /*wgsl*/`

@vertex
fn main(
    @location(0) position: vec4<f32>,
    @location(1) color: vec4<f32>,
    @location(2) uv: vec2<f32>,
    @builtin(vertex_index) vertexIndex: u32
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
`;

const frag = /*wgsl*/`

${texturePosition}
${snoise}

@fragment
fn main(
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,  // relation between params.screen.x and params.screen.y
    @location(3) uvr: vec2<f32>,    // uv with aspect ratio corrected
    @location(4) mouse: vec2<f32>,
    @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    let scale = params.waves_scale;
    let intensity = params.waves_intensity;
    let n1 = (snoise(uv / scale + vec2(.03, .4) * params.time) * .5 + .5) * intensity;
    let n2 = (snoise(uv / scale + vec2(.3, .02) * params.time) * .5 + .5) * intensity;
    let n = n1 + n2;

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), uvr + n2, true);
    let finalColor:vec4<f32> = imageColor;

    return finalColor;
}
`;

const waves = {
    vertexShader: vert,
    fragmentShader: frag,
    init: async (points, params) => {
        points._setInternal(true);
        points.addSampler('renderpass_feedbackSampler', null);
        points.addTexture2d('renderpass_feedbackTexture', true);
        points.addUniform('waves_scale', params?.scale || .45);
        points.addUniform('waves_intensity', params?.intensity || .03);
        points._setInternal(false);
    },
    update: points => {

    }
};

/**
 * List of predefined Render Passes for Post Processing.
 */
class RenderPasses {
    static COLOR = 1;
    static GRAYSCALE = 2;
    static CHROMATIC_ABERRATION = 3;
    static PIXELATE = 4;
    static LENS_DISTORTION = 5;
    static FILM_GRAIN = 6;
    static BLOOM = 7;
    static BLUR = 8;
    static WAVES = 9;

    static #LIST = {
        1: color,
        2: grayscale,
        3: chromaticAberration,
        4: pixelate,
        5: lensDistortion,
        6: filmgrain,
        7: bloom,
        8: blur,
        9: waves,
    };

    /**
     * Add a `RenderPass` from the `RenderPasses` list
     * @param {Points} points References a `Points` instance
     * @param {RenderPasses} renderPassId Select a static property from `RenderPasses`
     * @param {Object} params An object with the params needed by the `RenderPass`
     */
    static async add(points, renderPassId, params) {
        if (points.renderPasses?.length) {
            throw '`addPostRenderPass` should be called prior `Points.init()`';
        }
        let shaders = this.#LIST[renderPassId];
        let renderPass = new RenderPass(shaders.vertexShader, shaders.fragmentShader, shaders.computeShader);
        renderPass.internal = true;
        points.addRenderPass(renderPass);
        await shaders.init(points, params);
    }

    /**
     * Color postprocessing
     * @param {Points} points a `Points` reference
     * @param {Number} r red
     * @param {Number} g green
     * @param {Number} b blue
     * @param {Number} a alpha
     * @param {Number} blendAmount how much you want to blend it from 0..1
     * @returns
     */
    static async color(points, r, g, b, a, blendAmount) {
        return await RenderPasses.add(points, RenderPasses.COLOR, { color: [r, g, b, a], blendAmount });
    }

    /**
     * Grayscale postprocessing. Takes the brightness of an image and returns it; that makes the grayscale result.
     * @param {Points} points a `Points` reference
     * @returns
     */
    static async grayscale(points) {
        return await RenderPasses.add(points, RenderPasses.GRAYSCALE);
    }

    /**
     * Chromatic Aberration postprocessing. Color bleeds simulating a lens effect without distortion.
     * @param {Points} points a `Points` reference
     * @param {Number} distance from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns
     */
    static async chromaticAberration(points, distance) {
        return await RenderPasses.add(points, RenderPasses.CHROMATIC_ABERRATION, { distance });
    }

    /**
     * Pixelate postprocessing. It reduces the amount of pixels in the output preserving the scale.
     * @param {Points} points a `Points` reference
     * @param {Number} width width of the pixel in pixels
     * @param {Number} height width of the pixel in pixels
     * @returns
     */
    static async pixelate(points, width, height) {
        return await RenderPasses.add(points, RenderPasses.PIXELATE, { pixelsWidth: width, pixelsHeight: height });
    }

    /**
     * Lens Distortion postprocessing. A fisheye distortion with chromatic aberration.
     * @param {Points} points a `Points` reference
     * @param {Number} amount positive or negative value on how distorted the image will be
     * @param {Number} distance of chromatic aberration: from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns
     */
    static async lensDistortion(points, amount, distance) {
        return await RenderPasses.add(points, RenderPasses.LENS_DISTORTION, { amount, distance });
    }

    /**
     * Film grain postprocessing. White noise added to the output to simulate film irregularities.
     * @param {Points} points a `Points` reference
     * @returns
     */
    static async filmgrain(points) {
        return await RenderPasses.add(points, RenderPasses.FILM_GRAIN);
    }

    /**
     * Bloom postprocessing. Increases brightness of already bright areas to create a haze effect.
     * @param {Points} points a `Points` reference
     * @param {Number} amount how bright the effect will be
     * @returns
     */
    static async bloom(points, amount) {
        return await RenderPasses.add(points, RenderPasses.BLOOM, { amount });
    }

    /**
     * Blur postprocessing. Softens an image by creating multiple samples.
     * @param {Points} points a `Points` reference
     * @param {Number} resolutionX Samples in X
     * @param {Number} resolutionY Samples in Y
     * @param {Number} directionX direction in X
     * @param {Number} directionY directon in Y
     * @param {Number} radians rotation in radians
     * @returns
     */
    static async blur(points, resolutionX, resolutionY, directionX, directionY, radians) {
        return await RenderPasses.add(points, RenderPasses.BLUR, { resolution: [resolutionX, resolutionY], direction: [directionX, directionY], radians });
    }

    /**
     * Waves postprocessing. Distorts the image with noise to create a water like effect.
     * @param {Points} points a `Points` reference
     * @param {Number} scale how big the wave noise is
     * @param {Number} intensity a soft or hard effect
     * @returns
     */
    static async waves(points, scale, intensity) {
        return await RenderPasses.add(points, RenderPasses.WAVES, { scale, intensity });
    }
}

export { RenderPasses as default };
