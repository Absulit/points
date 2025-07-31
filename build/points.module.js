/* @ts-self-types="./points.module.d.ts" */
class ShaderType {
    static VERTEX = 1;
    static COMPUTE = 2;
    static FRAGMENT = 3;
}

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

class UniformKeys {
    static TIME = 'time';
    static DELTA = 'delta';
    static EPOCH = 'epoch';
    static SCREEN = 'screen';
    static MOUSE = 'mouse';
    static MOUSE_CLICK = 'mouseClick';
    static MOUSE_DOWN = 'mouseDown';
    static MOUSE_WHEEL = 'mouseWheel';
    static MOUSE_DELTA = 'mouseDelta';
}

class VertexBufferInfo {
    #vertexSize
    #vertexOffset;
    #colorOffset;
    #uvOffset;
    #vertexCount;
    /**
     * Along with the vertexArray it calculates some info like offsets required for the pipeline.
     * @param {Float32Array} vertexArray array with vertex, color and uv data
     * @param {Number} triangleDataLength how many items does a triangle row has in vertexArray
     * @param {Number} vertexOffset index where the vertex data starts in a row of `triangleDataLength` items
     * @param {Number} colorOffset index where the color data starts in a row of `triangleDataLength` items
     * @param {Number} uvOffset index where the uv data starts in a row of `triangleDataLength` items
     */
    constructor(vertexArray, triangleDataLength = 10, vertexOffset = 0, colorOffset = 4, uvOffset = 8) {
        this.#vertexSize = vertexArray.BYTES_PER_ELEMENT * triangleDataLength; // Byte size of ONE triangle data (vertex, color, uv). (one row)
        this.#vertexOffset = vertexArray.BYTES_PER_ELEMENT * vertexOffset;
        this.#colorOffset = vertexArray.BYTES_PER_ELEMENT * colorOffset; // Byte offset of triangle vertex color attribute.
        this.#uvOffset = vertexArray.BYTES_PER_ELEMENT * uvOffset;
        this.#vertexCount = vertexArray.byteLength / this.#vertexSize;
    }

    get vertexSize() {
        return this.#vertexSize;
    }

    get vertexOffset() {
        return this.#vertexOffset;
    }

    get colorOffset() {
        return this.#colorOffset;
    }

    get uvOffset() {
        return this.#uvOffset;
    }

    get vertexCount() {
        return this.#vertexCount;
    }
}

class Coordinate {
    #x;
    #y;
    #z;
    #value;
    constructor(x = 0, y = 0, z = 0) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#value = [x, y, z];
    }

    set x(value) {
        this.#x = value;
        this.#value[0] = value;
    }

    set y(value) {
        this.#y = value;
        this.#value[1] = value;
    }

    set z(value) {
        this.#z = value;
        this.#value[2] = value;
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get z() {
        return this.#z;
    }

    get value() {
        return this.#value;
    }

    set(x, y, z) {
        this.#x = x;
        this.#y = y;
        this.#z = z;
        this.#value[0] = x;
        this.#value[1] = y;
        this.#value[2] = z;
    }
}

class RGBAColor {
    #value;
    constructor(r = 0, g = 0, b = 0, a = 1) {
        if (r > 1 && g > 1 && b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
            if (a > 1) {
                a /= 255;
            }
        }
        this.#value = [r, g, b, a];
    }

    set r(value) {
        this.#value[0] = value;
    }

    set g(value) {
        this.#value[1] = value;
    }

    set b(value) {
        this.#value[2] = value;
    }

    set a(value) {
        this.#value[3] = value;
    }

    get r() {
        return this.#value[0];
    }

    get g() {
        return this.#value[1];
    }

    get b() {
        return this.#value[2];
    }

    get a() {
        return this.#value[3];
    }

    get value() {
        return this.#value;
    }

    get brightness() {
        // #Standard
        // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
        // #Percieved A
        // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
        // #Perceived B, slower to calculate
        // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))


        let [r, g, b, a] = this.#value;
        return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    }

    set brightness(value) {
        this.#value = [value, value, value, 1];
    }

    set(r, g, b, a) {
        this.#value = [r, g, b, a];
    }

    setColor(color) {
        this.#value = [color.r, color.g, color.b, color.a];
    }

    add(color) {
        let [r, g, b, a] = this.#value;
        //this.#value = [(r + color.r)/2, (g + color.g)/2, (b + color.b)/2, (a + color.a)/2];
        //this.#value = [(r*a + color.r*color.a), (g*a + color.g*color.a), (b*a + color.b*color.a), 1];
        this.#value = [(r + color.r), (g + color.g), (b + color.b), (a + color.a)];


    }

    blend(color) {
        let [r0, g0, b0, a0] = this.#value;
        let [r1, b1, g1, a1] = color.value;

        let a01 = (1 - a0) * a1 + a0;

        let r01 = ((1 - a0) * a1 * r1 + a0 * r0) / a01;

        let g01 = ((1 - a0) * a1 * g1 + a0 * g0) / a01;

        let b01 = ((1 - a0) * a1 * b1 + a0 * b0) / a01;

        this.#value = [r01, g01, b01, a01];
    }


    additive(color) {
        // https://gist.github.com/JordanDelcros/518396da1c13f75ee057
        let base = this.#value;
        let added = color.value;

        let mix = [];
        mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
        mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3])); // red
        mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3])); // green
        mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3])); // blue

        this.#value = mix;
    }

    equal(color) {
        return (this.#value[0] == color.r) && (this.#value[1] == color.g) && (this.#value[2] == color.b) && (this.#value[3] == color.a);
    }


    static average(colors) {
        // https://sighack.com/post/averaging-rgb-colors-the-right-way
        let r = 0, g = 0, b = 0;
        for (let index = 0; index < colors.length; index++) {
            const color = colors[index];
            //if (!color.isNull()) {
                r += color.r * color.r;
                g += color.g * color.g;
                b += color.b * color.b;
                //a += color.a * color.a;
            //}
        }
        return new RGBAColor(
            Math.sqrt(r / colors.length),
            Math.sqrt(g / colors.length),
            Math.sqrt(b / colors.length)
            //Math.sqrt(a),
        );
    }

    static difference(c1, c2) {
        let r = 0;
        let g = 0;
        let b = 0;
        if(c1 && !c1.isNull() && c2 && !c2.isNull()){
            const { r: r1, g: g1, b: b1 } = c1;
            const { r: r2, g: g2, b: b2 } = c2;
            r = r1 - r2;
            g = g1 - g2;
            b = b1 - b2;
        }

        return new RGBAColor(r, g, b);
    }

    isNull() {
        const [r, g, b, a] = this.#value;
        return !(isNaN(r) && isNaN(g) && isNaN(b) && isNaN(a))
    }

    static colorRGBEuclideanDistance(c1, c2) {
        return Math.sqrt(Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2));
    }

    /**
     * Checks how close two colors are. Closest is `0`.
     * @param {RGBAColor} color : Color to check distance;
     * @returns Number distace up to `1.42` I think...
     */
    euclideanDistance(color) {
        const [r, g, b] = this.#value;
        return Math.sqrt(Math.pow(r - color.r, 2) +
            Math.pow(g - color.g, 2) +
            Math.pow(b - color.b, 2));
    }

    static getClosestColorInPalette(color, palette) {
        if(!palette){
            throw('Palette should be an array of `RGBA`s')
        }
        let distance = 100;
        let selectedColor = null;
        palette.forEach(paletteColor => {
            let currentDistance = color.euclideanDistance(paletteColor);
            if (currentDistance < distance) {
                selectedColor = paletteColor;
                distance = currentDistance;
            }
        });
        return selectedColor;
    }
}

/**
 * To manage time and delta time,
 * based on https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 */
class Clock {
    #time = 0;
    #oldTime = 0;
    #delta = 0;
    constructor() {

    }

    /**
     * Gets the current time, it does not calculate the time, it's calcualted
     *  when `getDelta()` is called.
     */
    get time() {
        return this.#time;
    }

    /**
     * Gets the last delta value, it does not calculate the delta, use `getDelta()`
     */
    get delta() {
        return this.#delta;
    }

    #now() {
        return (typeof performance === 'undefined' ? Date : performance).now();
    }

    /**
     * Calculate time since last frame
     * It also calculates `time`
     */
    getDelta() {
        this.#delta = 0;
        const newTime = this.#now();
        this.#delta = (newTime - this.#oldTime) / 1000;
        this.#oldTime = newTime;
        this.#time += this.#delta;
        return this.#delta;
    }
}

const defaultStructs = /*wgsl*/`

struct Fragment {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: vec2<f32>,
    @location(3) uvr: vec2<f32>,
    @location(4) mouse: vec2<f32>
}

struct Sound {
    data: array<f32, 2048>,
    //play
    //dataLength
    //duration
    //currentPosition
}

struct Event {
    updated: u32,
    data: array<f32>
}
`;

/**
 * @type {string}
 * Default function for the Vertex shader that takes charge of automating the
 * creation of a few variables that are commonly used.
 * @param {vec4f} position
 * @param {vec4f} color
 * @param {vec2f} uv
 * @return {Fragment}
 */
const defaultVertexBody = /*wgsl*/`
fn defaultVertexBody(position: vec4<f32>, color: vec4<f32>, uv: vec2<f32>) -> Fragment {
    var result: Fragment;

    let ratioX = params.screen.x / params.screen.y;
    let ratioY = 1. / ratioX / (params.screen.y / params.screen.x);
    result.ratio = vec2(ratioX, ratioY);
    result.position = vec4<f32>(position);
    result.color = vec4<f32>(color);
    result.uv = uv;
    result.uvr = vec2(uv.x * result.ratio.x, uv.y);
    result.mouse = vec2(params.mouse.x / params.screen.x, params.mouse.y / params.screen.y);
    result.mouse = result.mouse * vec2(1.,-1.) - vec2(0., -1.); // flip and move up

    return result;
}
`;

const size_4_align_4 = { size: 4, align: 4 };
const size_8_align_8 = { size: 8, align: 8 };
const size_12_align_16 = { size: 12, align: 16 };
const size_16_align_16 = { size: 16, align: 16 };
const size_16_align_8 = { size: 16, align: 8 };
const size_32_align_8 = { size: 32, align: 8 };
const size_24_align_16 = { size: 24, align: 16 };
const size_48_align_16 = { size: 48, align: 16 };
const size_32_align_16 = { size: 32, align: 16 };
const size_64_align_16 = { size: 64, align: 16 };

const typeSizes = {
    'bool': size_4_align_4,
    'f32': size_4_align_4,
    'i32': size_4_align_4,
    'u32': size_4_align_4,

    'vec2<bool>': size_8_align_8,
    'vec2<f32>': size_8_align_8,
    'vec2<i32>': size_8_align_8,
    'vec2<u32>': size_8_align_8,

    // 'vec2<bool>': size_8_align_8,
    'vec2f': size_8_align_8,
    'vec2i': size_8_align_8,
    'vec2u': size_8_align_8,

    'vec3<bool>': size_12_align_16,
    'vec3<f32>': size_12_align_16,
    'vec3<i32>': size_12_align_16,
    'vec3<u32>': size_12_align_16,

    // 'vec3<bool>': size_12_align_16,
    'vec3f': size_12_align_16,
    'vec3i': size_12_align_16,
    'vec3u': size_12_align_16,

    'vec4<bool>': size_16_align_16,
    'vec4<f32>': size_16_align_16,
    'vec4<i32>': size_16_align_16,
    'vec4<u32>': size_16_align_16,
    'mat2x2<f32>': size_16_align_8,
    'mat2x3<f32>': size_32_align_8,
    'mat2x4<f32>': size_32_align_8,
    'mat3x2<f32>': size_24_align_16,
    'mat3x3<f32>': size_48_align_16,
    'mat3x4<f32>': size_48_align_16,
    'mat4x2<f32>': size_32_align_16,
    'mat4x3<f32>': size_64_align_16,
    'mat4x4<f32>': size_64_align_16,

    // 'vec4<bool>': size_16_align_16,
    'vec4f': size_16_align_16,
    'vec4i': size_16_align_16,
    'vec4u': size_16_align_16,
    'mat2x2f': size_16_align_8,
    'mat2x3f': size_32_align_8,
    'mat2x4f': size_32_align_8,
    'mat3x2f': size_24_align_16,
    'mat3x3f': size_48_align_16,
    'mat3x4f': size_48_align_16,
    'mat4x2f': size_32_align_16,
    'mat4x3f': size_64_align_16,
    'mat4x4f': size_64_align_16,
};


// ignore comments
const removeCommentsRE = /^(?:(?!\/\/|\/*.*\/).|\n)+/gim;

// struct name:
const getStructNameRE = /struct\s+?(\w+)\s*{[^}]+}\n?/g;

// what's inside a struct:
const insideStructRE = /struct\s+?\w+\s*{([^}]+)}\n?/g;

const arrayTypeAndAmountRE = /\s*<\s*([^,]+)\s*,?\s*(\d+)?\s*>/g;

const arrayIntegrityRE = /\s*(array\s*<\s*\w+\s*(?:,\s*\d+)?\s*>)\s*,?/g;

// you have to separete the result by splitting new lines

function removeComments(value) {
    const matches = value.matchAll(removeCommentsRE);
    let result = '';
    for (const match of matches) {
        const captured = match[0];
        result += captured;
    }
    return result;
}

function getInsideStruct(value) {
    const matches = value.matchAll(insideStructRE);
    let lines = null;
    for (const match of matches) {
        lines = match[1].split('\n');
        lines = lines.map(element => element.trim())
            .filter(e => e !== '');
    }
    return lines;
}

function getStructDataByName(value) {
    const matches = value.matchAll(getStructNameRE);
    let result = new Map();
    for (const match of matches) {
        const captured = match[0];
        const name = match[1];
        const lines = getInsideStruct(captured);
        const types = lines.map(l => {
            const right = l.split(':')[1];
            let type = '';
            if (isArray(right)) {
                const arrayMatch = right.matchAll(arrayIntegrityRE);
                type = arrayMatch.next().value[1];
            } else {
                type = right.split(',')[0].trim();
            }
            return type;
        });

        const names = lines.map(l => {
            const left = l.split(':')[0];
            let name = '';
            name = left.split(',')[0].trim();
            return name;
        });

        result.set(name, {
            captured,
            lines,
            types,
            unique_types: [...new Set(types)],
            names,
        });
    }
    return result;
}

function getArrayTypeAndAmount(value) {
    const matches = value.matchAll(arrayTypeAndAmountRE);
    let result = [];
    for (const match of matches) {
        const type = match[1];
        const amount = match[2];
        result.push({ type, amount: Number(amount) });
    }
    return result;
}

function getPadding(bytes, aligment, nextTypeDataSize) {
    const nextMultiple = (bytes + aligment - 1) & ~(aligment - 1);
    const needsPadding = (bytes + nextTypeDataSize) > nextMultiple;
    let padAmount = 0;
    if (needsPadding) {
        padAmount = nextMultiple - bytes;
    }
    return padAmount;
}

/**
 * Check if string has 'array' in it
 * @param {String} value
 * @returns {boolean}
 */
function isArray(value) {
    return value.indexOf('array') != -1;
}

function getArrayAlign(structName, structData) {
    const [d] = getArrayTypeAndAmount(structName);
    const t = typeSizes[d.type] || structData.get(d.type);
    if (!t) {
        throw new Error(`${d.type} type has not been declared previously`)
    }

    // if it's not in typeSizes is a struct,
    //therefore probably stored in structData
    return t.align || t.maxAlign;
}

function getArrayTypeData(currentType, structData) {
    const [d] = getArrayTypeAndAmount(currentType);
    if(!d){
        throw `${currentType} seems to have an error, maybe a wrong amount?`;
    }
    if (d.amount == 0) {
        throw new Error(`${currentType} has an amount of 0`);
    }
    // if is an array with no amount then use these default values
    let currentTypeData = { size: 16, align: 16 };
    if (!!d.amount) {
        const t = typeSizes[d.type];
        if (t) {
            // if array, the size is equal to the align
            currentTypeData = { size: t.align * d.amount, align: t.align };
            // currentTypeData = { size: t.size * d.amount, align: t.align };
            // currentTypeData = { size: 0, align: 0 };
        } else {
            const sd = structData.get(d.type);
            if (sd) {
                currentTypeData = { size: sd.bytes * d.amount, align: sd.maxAlign };
            }
        }
    } else {
        const t = typeSizes[d.type] || structData.get(d.type);
        currentTypeData = { size: t.size || t.bytes, align: t.maxAlign };
    }
    return currentTypeData;
}

const dataSize = value => {
    const noCommentsValue = removeComments(value);
    const structData = getStructDataByName(noCommentsValue);

    for (const [structDatumKey, structDatum] of structData) {
        // to obtain the higher max alignment, but this can be also calculated
        // in the next step
        structDatum.unique_types.forEach(ut => {
            let maxAlign = structDatum.maxAlign || 0;
            let align = 0;
            // if it doesn't exists in typeSizes is an Array or a new Struct
            if (!typeSizes[ut]) {
                if (isArray(ut)) {
                    align = getArrayAlign(ut, structData);
                } else {
                    const sd = structData.get(ut);
                    align = sd.maxAlign;
                }
            } else {
                align = typeSizes[ut].align;
            }
            maxAlign = align > maxAlign ? align : maxAlign;
            structDatum.maxAlign = maxAlign;
        });

        let byteCounter = 0;
        structDatum.types.forEach((t, i) => {
            const name = structDatum.names[i];
            const currentType = t;
            const nextType = structDatum.types[i + 1];
            let currentTypeData = typeSizes[currentType];
            let nextTypeData = typeSizes[nextType];

            structDatum.paddings = structDatum.paddings || {};

            // if currentTypeData or nextTypeData have no data it means
            // it's a struct or an array
            // if it's a struct the data is already saved in structData
            // because it was calculated previously
            // assuming the struct was declared previously
            if (!currentTypeData) {
                if (currentType) {
                    if (isArray(currentType)) {
                        currentTypeData = getArrayTypeData(currentType, structData);
                    } else {
                        const sd = structData.get(currentType);
                        if (sd) {
                            currentTypeData = { size: sd.bytes, align: sd.maxAlign };
                        }
                    }
                }
            }
            // read above
            if (!nextTypeData) {
                if (nextType) {
                    if (isArray(nextType)) {
                        nextTypeData = getArrayTypeData(nextType, structData);
                    } else {
                        const sd = structData.get(nextType);
                        if (sd) {
                            nextTypeData = { size: sd.bytes, align: sd.maxAlign };
                        }
                    }
                }
            }

            if (!!currentTypeData) {
                byteCounter += currentTypeData.size;
                if ((currentTypeData.size === structDatum.maxAlign) || !nextType) {
                    return;
                }
            }

            if (!!nextTypeData) {
                const padAmount = getPadding(byteCounter, structDatum.maxAlign, nextTypeData.size);
                if (padAmount) {
                    structDatum.paddings[name] = padAmount / 4;
                    byteCounter += padAmount;
                }
            }
        });

        const padAmount = getPadding(byteCounter, structDatum.maxAlign, 16);
        if (padAmount) {
            structDatum.paddings[''] = padAmount / 4;
            byteCounter += padAmount;
        }

        structDatum.bytes = byteCounter;
    }
    return structData;
};

async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
    });
}

/**
 * Returns UTF-16 array of each char
 * @param {String} s
 * @returns {Array<Number>}
 */
function strToCodes(s) {
    return Array.from(s).map(c => c.charCodeAt(0))
}

/**
 *
 * @param {HTMLImageElement} atlas Image atlas to parse
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {Number} index index in the atlas, so 0 is the first char
 * @param {{x: number, y: number}} size cell dimensions
 * @param {Number} finalIndex final positional index in the canvas
 */
function sprite(atlas, ctx, index, size, finalIndex) {
    const { width } = atlas;
    const numColumns = width / size.x;

    const x = index % numColumns;
    const y = Math.floor(index / numColumns);

    ctx.drawImage(
        atlas,
        x * size.x,
        y * size.y,
        size.x,
        size.y,

        size.x * finalIndex,
        0,

        size.x,
        size.y);
}

/**
 * @typedef {number} SignedNumber
 * A numeric value that may be negative or positive.
 */

/**
 * Expects an atlas/spritesheed with chars in UTF-16 order.
 * This means `A` is expected at index `65`; if not there,
 * use offset to move backwards (negative) or forward (positive)
 * @param {String} str String used to extract letters from the image
 * @param {HTMLImageElement} atlasImg image with the Atlas to extract letters from
 * @param {{x: number, y: number}} size width and height in pixels of each letter
 * @param {SignedNumber} offset how many chars is the atlas offset from the UTF-16
 * @returns {string} Base64 image
 */
function strToImage(str, atlasImg, size, offset = 0) {
    const chars = strToCodes(str);
    const canvas = document.createElement('canvas');
    canvas.width = chars.length * size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext('2d');

    chars.forEach((c, i) => sprite(atlasImg, ctx, c + offset, size, i));
    return canvas.toDataURL('image/png');
}

// TODO move classes to imports
class UniformsArray extends Array {
    #buffer = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    set buffer(v) {
        this.#buffer = v;
    }
}
class LayersArray extends Array {
    #buffer = null;
    #shaderType = null;
    constructor(...elements) {
        super(...elements);
    }

    get buffer() {
        return this.#buffer;
    }

    set buffer(v) {
        this.#buffer = v;
    }

    get shaderType() {
        return this.#shaderType;
    }

    /**
     * @param {ShaderType} v
     */
    set shaderType(v) {
        this.#shaderType = v;
    }
}

class Points {
    #canvasId = null;
    #canvas = null;
    #device = null;
    #context = null;
    #presentationFormat = null;
    #renderPasses = null;
    #postRenderPasses = [];
    #vertexBufferInfo = null;
    #buffer = null;
    #internal = false;
    #presentationSize = null;
    #depthTexture = null;
    #vertexArray = [];
    #numColumns = 1;
    #numRows = 1;
    #commandsFinished = [];
    #renderPassDescriptor = null;
    #uniforms = new UniformsArray();
    #storage = [];
    #readStorage = [];
    #samplers = [];
    #textures2d = [];
    #texturesToCopy = [];
    #textures2dArray = [];
    #texturesExternal = [];
    #texturesStorage2d = [];
    #bindingTextures = [];
    #layers = new LayersArray();
    #originalCanvasWidth = null;
    #originalCanvasHeigth = null;
    #clock = new Clock();
    #time = 0;
    #delta = 0;
    #epoch = 0;
    #mouseX = 0;
    #mouseY = 0;
    #mouseDown = false;
    #mouseClick = false;
    #mouseWheel = false;
    #mouseDelta = [0, 0];
    #fullscreen = false;
    #fitWindow = false;
    #lastFitWindow = false;
    #sounds = []; // audio
    #events = new Map();
    #events_ids = 0;
    #dataSize = null;

    constructor(canvasId) {
        this.#canvasId = canvasId;
        this.#canvas = document.getElementById(this.#canvasId);
        if (this.#canvasId) {
            this.#canvas.addEventListener('click', e => {
                this.#mouseClick = true;
            });
            this.#canvas.addEventListener('mousemove', this.#onMouseMove, { passive: true });
            this.#canvas.addEventListener('mousedown', e => {
                this.#mouseDown = true;
            });
            this.#canvas.addEventListener('mouseup', e => {
                this.#mouseDown = false;
            });
            this.#canvas.addEventListener('wheel', e => {
                this.#mouseWheel = true;
                this.#mouseDelta = [e.deltaX, e.deltaY];
            }, { passive: true });
            this.#originalCanvasWidth = this.#canvas.clientWidth;
            this.#originalCanvasHeigth = this.#canvas.clientHeight;
            window.addEventListener('resize', this.#resizeCanvasToFitWindow, false);
            document.addEventListener("fullscreenchange", e => {
                this.#fullscreen = !!document.fullscreenElement;
                if (!this.#fullscreen && !this.#fitWindow) {
                    this.#resizeCanvasToDefault();
                }
                if (!this.#fullscreen) {
                    this.fitWindow = this.#lastFitWindow;
                }
            });
        }
    }

    #resizeCanvasToFitWindow = () => {
        if (this.#fitWindow) {
            const { offsetWidth, offsetHeight } = this.#canvas.parentNode;
            this.#canvas.width = offsetWidth;
            this.#canvas.height = offsetHeight;
            this.#setScreenSize();
        }
    }

    #resizeCanvasToDefault = () => {
        this.#canvas.width = this.#originalCanvasWidth;
        this.#canvas.height = this.#originalCanvasHeigth;
        this.#setScreenSize();
    }

    #setScreenSize = () => {
        this.#presentationSize = [
            this.#canvas.clientWidth,
            this.#canvas.clientHeight,
        ];
        this.#context.configure({
            device: this.#device,
            format: this.#presentationFormat,
            //size: this.#presentationSize,
            width: this.#canvas.clientWidth,
            height: this.#canvas.clientHeight,
            alphaMode: 'premultiplied',
            // Specify we want both RENDER_ATTACHMENT and COPY_SRC since we
            // will copy out of the swapchain texture.
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
        });
        this.#depthTexture = this.#device.createTexture({
            size: this.#presentationSize,
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
        // this is to solve an issue that requires the texture to be resized
        // if the screen dimensions change, this for a `addTexture2d` with
        // `copyCurrentTexture` parameter set to `true`.
        this.#textures2d.forEach(texture2d => {
            if (!texture2d.imageTexture && texture2d.texture) {
                this.#createTextureBindingToCopy(texture2d);
            }
        });
    }

    #onMouseMove = e => {
        // get position relative to canvas
        const rect = this.#canvas.getBoundingClientRect();
        this.#mouseX = e.clientX - rect.left;
        this.#mouseY = e.clientY - rect.top;
    }
    /**
     * @deprecated use setUniform
     */
    addUniform(name, value, structName) {
        if (structName && isArray(structName)) {
            throw `${structName} is an array, which is currently not supported for Uniforms.`;
        }
        if (this.#nameExists(this.#uniforms, name)) {
            return;
        }
        this.#uniforms.push({
            name: name,
            value: value,
            type: structName,
            size: null,
            internal: this.#internal
        });
    }
    /**
     * @deprecated use setUniform
     */
    updateUniform(name, value) {
        const variable = this.#uniforms.find(v => v.name === name);
        if (!variable) {
            throw '`updateUniform()` can\'t be called without first `addUniform()`.';
        }
        variable.value = value;
    }
    /**
     * Set a param as uniform to send to all shaders.
     * A Uniform is a value that can only be changed
     * from the outside, and unless changed it remains
     * consistent.
     * @param {string} name name of the Param, you can invoke it later in shaders as `Params.[name]`
     * @param {Number|Boolean|Array<Number>} value Single number or a list of numbers. Boolean is converted to Number.
     * @param {string} structName type as `f32` or a custom struct. Default `few`
     */
    setUniform(name, value, structName = null) {
        let uniformToUpdate = this.#nameExists(this.#uniforms, name);
        if (uniformToUpdate && structName) {
            //if name exists is an update
            throw '`setUniform()` can\'t set the structName of an already defined uniform.';
        }
        if (uniformToUpdate) {
            uniformToUpdate.value = value;
            return;
        }
        if (structName && isArray(structName)) {
            throw `${structName} is an array, which is currently not supported for Uniforms.`;
        }
        const uniform = {
            name: name,
            value: value,
            type: structName,
            size: null,
            internal: this.#internal
        };
        this.#uniforms.push(uniform);
        return uniform;
    }
    /**
     * Update a list of uniforms
     * @param {Array<Object>} arr object array of the type: `{name, value}`
     */
    updateUniforms(arr) {
        arr.forEach(uniform => {
            const variable = this.#uniforms.find(v => v.name === uniform.name);
            if (!variable) {
                throw '`updateUniform()` can\'t be called without first `addUniform()`.';
            }
            variable.value = uniform.value;
        });
    }
    /**
     * @deprecated use setStorage()
     */
    addStorage(name, structName, read, shaderType, arrayData) {
        if (this.#nameExists(this.#storage, name)) {
            return;
        }
        this.#storage.push({
            mapped: !!arrayData,
            name: name,
            structName: structName,
            // structSize: null,
            shaderType: shaderType,
            read: read,
            buffer: null,
            internal: this.#internal
        });
    }
    /**
     * Creates a persistent memory buffer across every frame call.
     * @param {string} name Name that the Storage will have in the shader
     * @param {string} structName Name of the struct already existing on the
     * shader that will be the array<structName> of the Storage
     * @param {boolean} read if this is going to be used to read data back
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
     */
    setStorage(name, structName, read, shaderType, arrayData) {
        if (this.#nameExists(this.#storage, name)) {
            throw `\`setStorage()\` You have already defined \`${name}\``;
        }
        const storage = {
            mapped: !!arrayData,
            name: name,
            structName: structName,
            // structSize: null,
            shaderType: shaderType,
            read: read,
            buffer: null,
            internal: this.#internal
        };
        this.#storage.push(storage);
        return storage;
    }
    /**
     * @deprecated
     */
    addStorageMap(name, arrayData, structName, read, shaderType) {
        if (this.#nameExists(this.#storage, name)) {
            return;
        }
        this.#storage.push({
            mapped: true,
            name: name,
            structName: structName,
            shaderType: shaderType,
            array: arrayData,
            buffer: null,
            read: read,
            internal: this.#internal
        });
    }
    /**
     * @deprecated use setStorageMap
     */
    updateStorageMap(name, arrayData) {
        const variable = this.#storage.find(v => v.name === name);
        if (!variable) {
            throw '`updateStorageMap()` can\'t be called without first `addStorageMap()`.';
        }
        variable.array = arrayData;
    }
    /**
     * Creates a persistent memory buffer across every frame call that can be updated.
     * @param {string} name Name that the Storage will have in the shader.
     * @param {Uint8Array<ArrayBuffer>} arrayData array with the data that must match the struct.
     * @param {string} structName Name of the struct already existing on the
     * shader that will be the array<structName> of the Storage.
     * @param {boolean} read if this is going to be used to read data back.
     * @param {ShaderType} shaderType this tells to what shader the storage is bound
     */
    setStorageMap(name, arrayData, structName, read = false, shaderType = null) {
        const storageToUpdate = this.#nameExists(this.#storage, name);
        if (storageToUpdate) {
            storageToUpdate.array = arrayData;
            return storageToUpdate;
        }
        const storage = {
            mapped: true,
            name: name,
            structName: structName,
            shaderType: shaderType,
            array: arrayData,
            buffer: null,
            read: read,
            internal: this.#internal
        };
        this.#storage.push(storage);
        return storage;
    }
    async readStorage(name) {
        let storageItem = this.#readStorage.find(storageItem => storageItem.name === name);
        let arrayBuffer = null;
        let arrayBufferCopy = null;
        if (storageItem) {
            await storageItem.buffer.mapAsync(GPUMapMode.READ);
            arrayBuffer = storageItem.buffer.getMappedRange();
            arrayBufferCopy = new Float32Array(arrayBuffer.slice(0));
            storageItem.buffer.unmap();
        }
        return arrayBufferCopy;
    }
    /**
     * @deprecated use {@link setLayers}
     */
    addLayers(numLayers, shaderType) {
        for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
            this.#layers.shaderType = shaderType;
            this.#layers.push({
                name: `layer${layerIndex}`,
                size: this.#canvas.width * this.#canvas.height,
                structName: 'vec4<f32>',
                structSize: 16,
                array: null,
                buffer: null,
                internal: this.#internal
            });
        }
    }
    /**
     * Layers of data made of `vec4f`
     * @param {Number} numLayers
     * @param {ShaderType} shaderType
     */
    setLayers(numLayers, shaderType) {
        // TODO: check what data to return
        for (let layerIndex = 0; layerIndex < numLayers; layerIndex++) {
            this.#layers.shaderType = shaderType;
            this.#layers.push({
                name: `layer${layerIndex}`,
                size: this.#canvas.width * this.#canvas.height,
                structName: 'vec4<f32>',
                structSize: 16,
                array: null,
                buffer: null,
                internal: this.#internal
            });
        }
    }

    #nameExists(arrayOfObjects, name) {
        return arrayOfObjects.find(obj => obj.name == name);
    }

    /**
     * @deprecated use setSampler
     */

    addSampler(name, descriptor, shaderType) {
        if ('sampler' == name) {
            throw '`name` can not be sampler since is a WebGPU keyword';
        }
        if (this.#nameExists(this.#samplers, name)) {
            return;
        }
        // Create a sampler with linear filtering for smooth interpolation.
        descriptor = descriptor || {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            //maxAnisotropy: 10,
        };
        this.#samplers.push({
            name: name,
            descriptor: descriptor,
            shaderType: shaderType,
            resource: null,
            internal: this.#internal
        });
    }

    /**
     * Creates a `sampler` to be sent to the shaders.
     * @param {string} name Name of the `sampler` to be called in the shaders.
     * @param {GPUSamplerDescriptor} descriptor
     */

    setSampler(name, descriptor, shaderType) {
        if ('sampler' == name) {
            throw 'setSampler: `name` can not be sampler since is a WebGPU keyword.';
        }
        if (this.#nameExists(this.#samplers, name)) {
            throw `setSampler: \`${name}\` already exists.`;
        }
        // Create a sampler with linear filtering for smooth interpolation.
        descriptor = descriptor || {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'linear',
            minFilter: 'linear',
            mipmapFilter: 'linear',
            //maxAnisotropy: 10,
        };
        const sampler = {
            name: name,
            descriptor: descriptor,
            shaderType: shaderType,
            resource: null,
            internal: this.#internal
        };
        this.#samplers.push(sampler);
        return sampler;
    }


    /**
     * @deprecated use setTexture2d
     */

    addTexture2d(name, copyCurrentTexture, shaderType, renderPassIndex) {
        if (this.#nameExists(this.#textures2d, name)) {
            return;
        }
        this.#textures2d.push({
            name: name,
            copyCurrentTexture: copyCurrentTexture,
            shaderType: shaderType,
            texture: null,
            renderPassIndex: renderPassIndex,
            internal: this.#internal
        });
    }

    /**
     * Create a `texture_2d` in the shaders.
     * @param {string} name Name to call the texture in the shaders.
     * @param {boolean} copyCurrentTexture If you want the fragment output to be copied here.
     */
    setTexture2d(name, copyCurrentTexture, shaderType, renderPassIndex) {
        if (this.#nameExists(this.#textures2d, name)) {
            throw `setTexture2d: \`${name}\` already exists.`;
        }
        const texture2d = {
            name: name,
            copyCurrentTexture: copyCurrentTexture,
            shaderType: shaderType,
            texture: null,
            renderPassIndex: renderPassIndex,
            internal: this.#internal
        };
        this.#textures2d.push(texture2d);
        return texture2d;
    }


    copyTexture(nameTextureA, nameTextureB) {
        const texture2d_A = this.#nameExists(this.#textures2d, nameTextureA);
        const texture2d_B = this.#nameExists(this.#textures2d, nameTextureB);
        if (!(texture2d_A && texture2d_B)) {
            console.error('One of the textures does not exist.');
        }
        const a = texture2d_A.texture;
        const cubeTexture = this.#device.createTexture({
            size: [a.width, a.height, 1],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        texture2d_B.texture = cubeTexture;
        this.#texturesToCopy.push({ a, b: texture2d_B.texture });
    }
    /**
     * @deprecated use setTextureImage
     */
    async addTextureImage(name, path, shaderType) {
        if (this.#nameExists(this.#textures2d, name)) {
            return;
        }
        const response = await fetch(path);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        this.#textures2d.push({
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTexture: {
                bitmap: imageBitmap
            },
            internal: this.#internal
        });
    }
    /**
     * @deprecated use setTextureImage
     */
    async updateTextureImage(name, path, shaderType) {
        if (!this.#nameExists(this.#textures2d, name)) {
            console.warn('image can not be updated');
            return;
        }
        const response = await fetch(path);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        const texture2d = this.#textures2d.filter(obj => obj.name == name)[0];
        texture2d.imageTexture.bitmap = imageBitmap;
        const cubeTexture = this.#device.createTexture({
            size: [imageBitmap.width, imageBitmap.height, 1],
            format: 'rgba8unorm',
            usage:
                GPUTextureUsage.TEXTURE_BINDING |
                GPUTextureUsage.COPY_SRC |
                GPUTextureUsage.COPY_DST |
                GPUTextureUsage.RENDER_ATTACHMENT,
        });
        this.#device.queue.copyExternalImageToTexture(
            { source: imageBitmap },
            { texture: cubeTexture },
            [imageBitmap.width, imageBitmap.height]
        );
        texture2d.texture = cubeTexture;
    }
    /**
     * Load an image as texture_2d
     * @param {string} name
     * @param {string} path
     * @param {ShaderType} shaderType
     * @returns {Object}
     */
    async setTextureImage(name, path, shaderType = null) {
        const texture2dToUpdate = this.#nameExists(this.#textures2d, name);
        const response = await fetch(path);
        const blob = await response.blob();
        const imageBitmap = await createImageBitmap(blob);
        if (texture2dToUpdate) {
            if (shaderType) {
                throw '`setTextureImage()` the param `shaderType` should not be updated after its creation.';
            }
            texture2dToUpdate.imageTexture.bitmap = imageBitmap;
            const cubeTexture = this.#device.createTexture({
                size: [imageBitmap.width, imageBitmap.height, 1],
                format: 'rgba8unorm',
                usage:
                    GPUTextureUsage.TEXTURE_BINDING |
                    GPUTextureUsage.COPY_SRC |
                    GPUTextureUsage.COPY_DST |
                    GPUTextureUsage.RENDER_ATTACHMENT,
            });
            this.#device.queue.copyExternalImageToTexture(
                { source: imageBitmap },
                { texture: cubeTexture },
                [imageBitmap.width, imageBitmap.height]
            );
            texture2dToUpdate.texture = cubeTexture;
            return texture2dToUpdate;
        }
        const texture2d = {
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTexture: {
                bitmap: imageBitmap
            },
            internal: this.#internal
        };
        this.#textures2d.push(texture2d);
        return texture2d;
    }

    /**
     * Loads a text string as a texture.
     * Using an Atlas or a Spritesheet with UTF-16 chars (`path`) it will create a new texture
     * that contains only the `text` characters.
     * Characters in the atlas `path` must be in order of the UTF-16 chars.
     * It can have missing characters at the end or at the start, so the `offset` is added to take account for those chars.
     * For example, `A` is 65, but if one character is removed before the letter `A`, then offset is -1
     * @param {String} name id of the wgsl variable in the shader
     * @param {String} text text you want to load as texture
     * @param {String} path atlas to grab characters from
     * @param {{x: number, y: number}} size size of a individual character e.g.: `{x:10, y:20}`
     * @param {Number} offset how many characters back or forward it must move to start
     * @param {String} shaderType
     * @returns {Object}
     */
    async setTextureString(name, text, path, size, offset = 0, shaderType = null) {
        const atlas = await loadImage(path);
        const textImg = strToImage(text, atlas, size, offset);
        return this.setTextureImage(name, textImg, shaderType);
    }

    /**
     * Load images as texture_2d_array
     * @param {string} name
     * @param {Array} paths
     * @param {ShaderType} shaderType
     */
    // TODO: verify if this can be updated after creation
    // TODO: return texture2dArray object
    async setTextureImageArray(name, paths, shaderType) {
        if (this.#nameExists(this.#textures2dArray, name)) {
            // TODO: throw exception here
            return;
        }
        const imageBitmaps = [];
        for await (const path of paths) {
            console.log(path);
            const response = await fetch(path);
            const blob = await response.blob();
            imageBitmaps.push(await createImageBitmap(blob));
        }
        this.#textures2dArray.push({
            name: name,
            copyCurrentTexture: false,
            shaderType: shaderType,
            texture: null,
            imageTextures: {
                bitmaps: imageBitmaps
            },
            internal: this.#internal,
        });
    }
    /**
     * @deprecated use setTextureVideo
     */

    async addTextureVideo(name, path, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            return;
        }
        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.src = new URL(path, import.meta.url).toString();
        await video.play();
        this.#texturesExternal.push({
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this.#internal
        });
    }

    /**
     * Load an video as texture2d
     * @param {string} name
     * @param {string} path
     * @param {ShaderType} shaderType
     */
    async setTextureVideo(name, path, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            throw `setTextureVideo: ${name} already exists.`;
        }
        const video = document.createElement('video');
        video.loop = true;
        video.autoplay = true;
        video.muted = true;
        video.src = new URL(path, import.meta.url).toString();
        await video.play();
        const textureExternal = {
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this.#internal
        };
        this.#texturesExternal.push(textureExternal);
        return textureExternal;
    }

    /**
     * @deprecated use setTextureWebcam
     */
    async addTextureWebcam(name, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            return;
        }
        const video = document.createElement('video');
        //video.loop = true;
        //video.autoplay = true;
        video.muted = true;
        //document.body.appendChild(video);
        if (navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: true })
                .then(async function (stream) {
                    video.srcObject = stream;
                    await video.play();
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        this.#texturesExternal.push({
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this.#internal
        });
    }

    /**
     * Load webcam as texture2d
     * @param {string} name
     * @param {ShaderType} shaderType
     */
    async setTextureWebcam(name, shaderType) {
        if (this.#nameExists(this.#texturesExternal, name)) {
            throw `setTextureWebcam: ${name} already exists.`;
        }
        const video = document.createElement('video');
        //video.loop = true;
        //video.autoplay = true;
        video.muted = true;
        //document.body.appendChild(video);
        if (navigator.mediaDevices.getUserMedia) {
            await navigator.mediaDevices.getUserMedia({ video: true })
                .then(async function (stream) {
                    video.srcObject = stream;
                    await video.play();
                })
                .catch(function (err) {
                    console.log(err);
                });
        }
        const textureExternal = {
            name: name,
            shaderType: shaderType,
            video: video,
            internal: this.#internal
        };
        this.#texturesExternal.push(textureExternal);
        return textureExternal;
    }

    /**
     * @deprecated use setAudio
     */
    addAudio(name, path, volume, loop, autoplay) {
        const audio = new Audio(path);
        audio.volume = volume;
        audio.autoplay = autoplay;
        audio.loop = loop;
        const sound = {
            name: name,
            path: path,
            audio: audio,
            analyser: null,
            data: null
        };
        // this.#audio.play();
        // audio
        const audioContext = new AudioContext();
        let resume = _ => { audioContext.resume(); };
        if (audioContext.state === 'suspended') {
            document.body.addEventListener('touchend', resume, false);
            document.body.addEventListener('click', resume, false);
        }
        const source = audioContext.createMediaElementSource(audio);
        // // audioContext.createMediaStreamSource()
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        const bufferLength = analyser.fftSize;//analyser.frequencyBinCount;
        // const bufferLength = analyser.frequencyBinCount;
        const data = new Uint8Array(bufferLength);
        // analyser.getByteTimeDomainData(data);
        analyser.getByteFrequencyData(data);
        // storage that will have the data on WGSL
        this.setStorageMap(name, data,
            // `array<f32, ${bufferLength}>`
            'Sound' // custom struct in defaultStructs.js
        );
        // uniform that will have the data length as a quick reference
        this.setUniform(`${name}Length`, analyser.frequencyBinCount);
        sound.analyser = analyser;
        sound.data = data;
        this.#sounds.push(sound);
        return audio;
    }

    /**
     * Assigns an audio FrequencyData to a StorageMap
     * @param {string} name name of the Storage and prefix of the length variable e.g. `[name]Length`.
     * @param {string} path
     * @param {Number} volume
     * @param {boolean} loop
     * @param {boolean} autoplay
     * @returns {HTMLAudioElement}
     */
    setAudio(name, path, volume, loop, autoplay) {
        const audio = new Audio(path);
        audio.volume = volume;
        audio.autoplay = autoplay;
        audio.loop = loop;
        const sound = {
            name: name,
            path: path,
            audio: audio,
            analyser: null,
            data: null
        };
        // this.#audio.play();
        // audio
        const audioContext = new AudioContext();
        let resume = _ => { audioContext.resume(); };
        if (audioContext.state === 'suspended') {
            document.body.addEventListener('touchend', resume, false);
            document.body.addEventListener('click', resume, false);
        }
        const source = audioContext.createMediaElementSource(audio);
        // // audioContext.createMediaStreamSource()
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        const bufferLength = analyser.fftSize;//analyser.frequencyBinCount;
        // const bufferLength = analyser.frequencyBinCount;
        const data = new Uint8Array(bufferLength);
        // analyser.getByteTimeDomainData(data);
        analyser.getByteFrequencyData(data);
        // storage that will have the data on WGSL
        this.setStorageMap(name, data,
            // `array<f32, ${bufferLength}>`
            'Sound' // custom struct in defaultStructs.js
        );
        // uniform that will have the data length as a quick reference
        this.setUniform(`${name}Length`, analyser.frequencyBinCount);
        sound.analyser = analyser;
        sound.data = data;
        this.#sounds.push(sound);
        return audio;
    }


    // TODO: verify this method
    setTextureStorage2d(name, shaderType) {
        if (this.#nameExists(this.#texturesStorage2d, name)) {
            throw `setTextureStorage2d: ${name} already exists.`
        }
        const texturesStorage2d = {
            name: name,
            shaderType: shaderType,
            texture: null,
            internal: this.#internal
        };
        this.#texturesStorage2d.push(texturesStorage2d);
        return texturesStorage2d;
    }
    /**
     * @deprecated use setBindingTexture
     */
    addBindingTexture(computeName, fragmentName, size) {
        this.#bindingTextures.push({
            compute: {
                name: computeName,
                shaderType: ShaderType.COMPUTE
            },
            fragment: {
                name: fragmentName,
                shaderType: ShaderType.FRAGMENT
            },
            texture: null,
            size: size,
            internal: this.#internal
        });
    }

    /**
     * Sets a texture to the compute and fragment shader, in the compute you can
     * write to the texture, and in the fragment you can read the texture, so is
     * a one way communication method.
     * @param {string} computeName name of the variable in the compute shader
     * @param {string} fragmentName name of the variable in the fragment shader
     * @param {Array<number, 2>} size dimensions of the texture, by default screen
     * size
     * @returns {Object}
     */
    setBindingTexture(computeName, fragmentName, size) {
        // TODO: validate that names don't exist already
        const bindingTexture = {
            compute: {
                name: computeName,
                shaderType: ShaderType.COMPUTE
            },
            fragment: {
                name: fragmentName,
                shaderType: ShaderType.FRAGMENT
            },
            texture: null,
            size: size,
            internal: this.#internal
        };
        this.#bindingTextures.push(bindingTexture);
        return bindingTexture;
    }

    /**
     * Listen for an event dispatched from WGSL code
     * @param {String} name Number that represents an event Id
     * @param {Function} callback function to be called when the event occurs
     */
    addEventListener(name, callback, structSize) {
        // TODO: remove structSize
        // this extra 4 is for the boolean flag in the Event struct
        let data = new Uint8Array(Array(structSize + 4).fill(0));
        this.setStorageMap(name, data, 'Event', true);
        this.#events.set(this.#events_ids,
            {
                id: this.#events_ids,
                name: name,
                callback: callback,
            }
        );
        ++this.#events_ids;
    }
    /**
     * for internal use:
     * to flag add* methods and variables as part of the RenderPasses
     * @private
     */
    _setInternal(value) {
        this.#internal = value;
    }
    /**
     * @param {ShaderType} shaderType
     * @param {boolean} internal
     * @returns {String} string with bindings
     */
    #createDynamicGroupBindings(shaderType, internal) {
        // `internal` here is a flag for a custom pass
        internal = internal || false;
        if (!shaderType) {
            throw '`ShaderType` is required';
        }
        const groupId = 0;
        let dynamicGroupBindings = '';
        let bindingIndex = 0;
        if (this.#uniforms.length) {
            dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <uniform> params: Params;\n`;
            bindingIndex += 1;
        }
        this.#storage.forEach(storageItem => {
            let internalCheck = internal == storageItem.internal;
            if (!storageItem.shaderType && internalCheck || storageItem.shaderType == shaderType && internalCheck) {
                let T = storageItem.structName;
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> ${storageItem.name}: ${T};\n`;
                bindingIndex += 1;
            }
        });
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType == shaderType) {
                let totalSize = 0;
                this.#layers.forEach(layerItem => totalSize += layerItem.size);
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var <storage, read_write> layers: array<array<vec4<f32>, ${totalSize}>>;\n`;
                bindingIndex += 1;
            }
        }
        this.#samplers.forEach((sampler, index) => {
            let internalCheck = internal == sampler.internal;
            if (!sampler.shaderType && internalCheck || sampler.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${sampler.name}: sampler;\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesStorage2d.forEach((texture, index) => {
            let internalCheck = internal && texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
        });
        this.#textures2d.forEach((texture, index) => {
            let internalCheck = internal == texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d<f32>;\n`;
                bindingIndex += 1;
            }
        });
        this.#textures2dArray.forEach((texture, index) => {
            let internalCheck = internal == texture.internal;
            if (!texture.shaderType && internalCheck || texture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${texture.name}: texture_2d_array<f32>;\n`;
                bindingIndex += 1;
            }
        });
        this.#texturesExternal.forEach(externalTexture => {
            let internalCheck = internal == externalTexture.internal;
            if (!externalTexture.shaderType && internalCheck || externalTexture.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${externalTexture.name}: texture_external;\n`;
                bindingIndex += 1;
            }
        });
        this.#bindingTextures.forEach(bindingTexture => {
            let internalCheck = internal == bindingTexture.internal;
            if (bindingTexture.compute.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.compute.name}: texture_storage_2d<rgba8unorm, write>;\n`;
                bindingIndex += 1;
            }
            if (bindingTexture.fragment.shaderType == shaderType && internalCheck) {
                dynamicGroupBindings += /*wgsl*/`@group(${groupId}) @binding(${bindingIndex}) var ${bindingTexture.fragment.name}: texture_2d<f32>;\n`;
                bindingIndex += 1;
            }
        });
        return dynamicGroupBindings;
    }
    /**
     * Establishes the density of the base mesh, by default 1x1, meaning two triangles.
     * The final number of triangles is `numColumns` * `numRows` * `2` ( 2 being the triangles )
     * @param {Number} numColumns quads horizontally
     * @param {Number} numRows quads vertically
     */
    setMeshDensity(numColumns, numRows) {
        if (numColumns == 0 || numRows == 0) {
            throw 'Parameters should be greater than 0';
        }
        this.#numColumns = numColumns;
        this.#numRows = numRows;
    }

    #compileRenderPass = (renderPass, index) => {
        let vertexShader = renderPass.vertexShader;
        let computeShader = renderPass.computeShader;
        let fragmentShader = renderPass.fragmentShader;
        let colorsVertWGSL = vertexShader;
        let colorsComputeWGSL = computeShader;
        let colorsFragWGSL = fragmentShader;
        let dynamicGroupBindingsVertex = '';
        let dynamicGroupBindingsCompute = '';
        let dynamicGroupBindingsFragment = '';
        let dynamicStructParams = '';
        this.#uniforms.forEach(u => {
            u.type = u.type || 'f32';
            dynamicStructParams += /*wgsl*/`${u.name}:${u.type}, \n\t`;
        });
        if (this.#uniforms.length) {
            dynamicStructParams = /*wgsl*/`struct Params {\n\t${dynamicStructParams}\n}\n`;
        }
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += dynamicStructParams);
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += dynamicStructParams);
        renderPass.hasFragmentShader && (dynamicGroupBindingsFragment += dynamicStructParams);
        renderPass.hasVertexShader && (dynamicGroupBindingsVertex += this.#createDynamicGroupBindings(ShaderType.VERTEX, renderPass.internal));
        renderPass.hasComputeShader && (dynamicGroupBindingsCompute += this.#createDynamicGroupBindings(ShaderType.COMPUTE, renderPass.internal));
        dynamicGroupBindingsFragment += this.#createDynamicGroupBindings(ShaderType.FRAGMENT, renderPass.internal);
        renderPass.hasVertexShader && (colorsVertWGSL = dynamicGroupBindingsVertex + defaultStructs + defaultVertexBody + colorsVertWGSL);
        renderPass.hasComputeShader && (colorsComputeWGSL = dynamicGroupBindingsCompute + defaultStructs + colorsComputeWGSL);
        renderPass.hasFragmentShader && (colorsFragWGSL = dynamicGroupBindingsFragment + defaultStructs + colorsFragWGSL);
        console.groupCollapsed(`Render Pass ${index}`);
        console.groupCollapsed('VERTEX');
        console.log(colorsVertWGSL);
        console.groupEnd();
        if (renderPass.hasComputeShader) {
            console.groupCollapsed('COMPUTE');
            console.log(colorsComputeWGSL);
            console.groupEnd();
        }
        console.groupCollapsed('FRAGMENT');
        console.log(colorsFragWGSL);
        console.groupEnd();
        console.groupEnd();
        renderPass.hasVertexShader && (renderPass.compiledShaders.vertex = colorsVertWGSL);
        renderPass.hasComputeShader && (renderPass.compiledShaders.compute = colorsComputeWGSL);
        renderPass.hasFragmentShader && (renderPass.compiledShaders.fragment = colorsFragWGSL);
    }
    #generateDataSize = () => {
        const allShaders = this.#renderPasses.map(renderPass => {
            const { vertex, compute, fragment } = renderPass.compiledShaders;
            return vertex + compute + fragment;        }).join('\n');
        this.#dataSize = dataSize(allShaders);
        // since uniforms are in a sigle struct
        // this is only required for storage
        this.#storage.forEach(s => {
            if (!s.mapped) {
                if (isArray(s.structName)) {
                    const typeData = getArrayTypeData(s.structName, this.#dataSize);
                    s.structSize = typeData.size;
                } else {
                    const d = this.#dataSize.get(s.structName) || typeSizes[s.structName];
                    if (!d) {
                        throw `${s.structName} has not been defined.`
                    }
                    s.structSize = d.bytes || d.size;
                }
            }
        });
    }
    /**
     * One time function to call to initialize the shaders.
     * @param {Array<RenderPass>} renderPasses Collection of RenderPass, which contain Vertex, Compute and Fragment shaders.
     * @returns {Boolean} false | undefined
     */
    async init(renderPasses) {
        this.#renderPasses = renderPasses.concat(this.#postRenderPasses);
        // initializing internal uniforms
        this.setUniform(UniformKeys.TIME, this.#time);
        this.setUniform(UniformKeys.DELTA, this.#delta);
        this.setUniform(UniformKeys.EPOCH, this.#epoch);
        this.setUniform(UniformKeys.SCREEN, [0, 0], 'vec2f');
        this.setUniform(UniformKeys.MOUSE, [0, 0], 'vec2f');
        this.setUniform(UniformKeys.MOUSE_CLICK, this.#mouseClick);
        this.setUniform(UniformKeys.MOUSE_DOWN, this.#mouseDown);
        this.setUniform(UniformKeys.MOUSE_WHEEL, this.#mouseWheel);
        this.setUniform(UniformKeys.MOUSE_DELTA, this.#mouseDelta, 'vec2f');
        let hasComputeShaders = this.#renderPasses.some(renderPass => renderPass.hasComputeShader);
        if (!hasComputeShaders && this.#bindingTextures.length) {
            throw ' `addBindingTexture` requires at least one Compute Shader in a `RenderPass`'
        }
        this.#renderPasses.forEach(this.#compileRenderPass);
        this.#generateDataSize();
        //
        let adapter = null;
        try {
            adapter = await navigator.gpu.requestAdapter();
        } catch (err) {
            console.log(err);
        }
        if (!adapter) { return false; }
        this.#device = await adapter.requestDevice();
        this.#device.lost.then(info => {
            console.log(info);
        });
        if (this.#canvas !== null) this.#context = this.#canvas.getContext('webgpu');
        this.#presentationFormat = navigator.gpu.getPreferredCanvasFormat();
        if (this.#canvasId) {
            if (this.#fitWindow) {
                this.#resizeCanvasToFitWindow();
            } else {
                this.#resizeCanvasToDefault();
            }
        }
        this.#renderPassDescriptor = {
            colorAttachments: [
                {
                    //view: textureView,
                    clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
                    loadOp: 'clear',
                    storeOp: 'store',
                }
            ],
            depthStencilAttachment: {
                //view: this.#depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store'
            }
        };
        await this.createScreen();
        return true;
    }

    /**
     * Mainly to be used with RenderPasses.js
     * @param {RenderPass} renderPass
     */
    addRenderPass(renderPass) {
        this.#postRenderPasses.push(renderPass);
    }

    get renderPasses() {
        return this.#renderPasses;
    }

    /**
     * Adds two triangles called points per number of columns and rows
     */
    async createScreen() {
        let hasVertexAndFragmentShader = this.#renderPasses.some(renderPass => renderPass.hasVertexAndFragmentShader);
        if (hasVertexAndFragmentShader) {
            let colors = [
                new RGBAColor(1, 0, 0),
                new RGBAColor(0, 1, 0),
                new RGBAColor(0, 0, 1),
                new RGBAColor(1, 1, 0),
            ];
            for (let xIndex = 0; xIndex < this.#numRows; xIndex++) {
                for (let yIndex = 0; yIndex < this.#numColumns; yIndex++) {
                    const coordinate = new Coordinate(xIndex * this.#canvas.clientWidth / this.#numColumns, yIndex * this.#canvas.clientHeight / this.#numRows, .3);
                    this.addPoint(coordinate, this.#canvas.clientWidth / this.#numColumns, this.#canvas.clientHeight / this.#numRows, colors);
                }
            }
            this.#createVertexBuffer(new Float32Array(this.#vertexArray));
        }
        this.#createComputeBuffers();
        await this.#createPipeline();
    }
    /**
     * @param {Float32Array} vertexArray
     * @returns buffer
     */
    #createVertexBuffer(vertexArray) {
        this.#vertexBufferInfo = new VertexBufferInfo(vertexArray);
        this.#buffer = this.#createAndMapBuffer(vertexArray, GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST);
    }
    /**
     * @param {Float32Array} data
     * @param {GPUBufferUsageFlags} usage
     * @param {Boolean} mappedAtCreation
     * @param {Number} size
     * @returns {GPUBuffer} mapped buffer
     */
    #createAndMapBuffer(data, usage, mappedAtCreation = true, size = null) {
        const buffer = this.#device.createBuffer({
            mappedAtCreation: mappedAtCreation,
            size: size || data.byteLength,
            usage: usage,
        });
        new Float32Array(buffer.getMappedRange()).set(data);
        buffer.unmap();
        return buffer;
    }

    /**
     * It creates with size, no with data, so it's empty
     * @param {Number} size numItems * instanceByteSize ;
     * @param {GPUBufferUsageFlags} usage
     * @returns {GPUBuffer} buffer
     */
    #createBuffer(size, usage) {
        const buffer = this.#device.createBuffer({
            size: size,
            usage: usage,
        });
        return buffer
    }

    #createParametersUniforms() {
        const paramsDataSize = this.#dataSize.get('Params');
        const paddings = paramsDataSize.paddings;
        // we check the paddings list and add 0's to just the ones that need it
        const uniformsClone = JSON.parse(JSON.stringify(this.#uniforms));
        let arrayValues = uniformsClone.map(v => {
            const padding = paddings[v.name];
            if (padding) {
                if (v.value.constructor !== Array) {
                    v.value = [v.value];
                }
                for (let i = 0; i < padding; i++) {
                    v.value.push(0);
                }
            }
            return v.value;
        }).flat(1);
        const finalPadding = paddings[''];
        if (finalPadding) {
            for (let i = 0; i < finalPadding; i++) {
                arrayValues.push(0);
            }
        }
        const values = new Float32Array(arrayValues);
        this.#uniforms.buffer = this.#createAndMapBuffer(values, GPUBufferUsage.UNIFORM, true, paramsDataSize.bytes);
    }

    #createComputeBuffers() {
        //--------------------------------------------
        this.#createParametersUniforms();
        //--------------------------------------------
        this.#storage.forEach(storageItem => {
            let usage = GPUBufferUsage.STORAGE;
            if (storageItem.read) {
                let readStorageItem = {
                    name: storageItem.name,
                    size: storageItem.structSize
                };
                if (storageItem.mapped) {
                    readStorageItem = {
                        name: storageItem.name,
                        size: storageItem.array.length,
                    };
                }
                this.#readStorage.push(readStorageItem);
                usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC;
            }
            storageItem.usage = usage;
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this.#createAndMapBuffer(values, usage);
            } else {
                storageItem.buffer = this.#createBuffer(storageItem.structSize, usage);
            }
        });
        //--------------------------------------------
        this.#readStorage.forEach(readStorageItem => {
            readStorageItem.buffer = this.#device.createBuffer({
                size: readStorageItem.size,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });
        });
        //--------------------------------------------
        if (this.#layers.length) {
            //let layerValues = [];
            let layersSize = 0;
            this.#layers.forEach(layerItem => {
                layersSize += layerItem.size * layerItem.structSize;
            });
            this.#layers.buffer = this.#createBuffer(layersSize, GPUBufferUsage.STORAGE);
        }
        //--------------------------------------------
        this.#samplers.forEach(sampler => sampler.resource = this.#device.createSampler(sampler.descriptor));
        //--------------------------------------------
        this.#texturesStorage2d.forEach(textureStorage2d => {
            textureStorage2d.texture = this.#device.createTexture({
                size: this.#presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
        //--------------------------------------------
        this.#textures2d.forEach(texture2d => {
            if (texture2d.imageTexture) {
                let cubeTexture;
                const imageBitmap = texture2d.imageTexture.bitmap;
                cubeTexture = this.#device.createTexture({
                    label: texture2d.name,
                    size: [imageBitmap.width, imageBitmap.height, 1],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_SRC |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                this.#device.queue.copyExternalImageToTexture(
                    { source: imageBitmap },
                    { texture: cubeTexture },
                    [imageBitmap.width, imageBitmap.height]
                );
                texture2d.texture = cubeTexture;
                // } else if (texture2d.copyCurrentTexture) {
            } else {
                this.#createTextureBindingToCopy(texture2d);
            }
        });
        //--------------------------------------------
        this.#textures2dArray.forEach(texture2dArray => {
            if (texture2dArray.imageTextures) {
                let cubeTexture;
                const imageBitmaps = texture2dArray.imageTextures.bitmaps;
                cubeTexture = this.#device.createTexture({
                    size: [imageBitmaps[0].width, imageBitmaps[0].height, imageBitmaps.length],
                    format: 'rgba8unorm',
                    usage:
                        GPUTextureUsage.TEXTURE_BINDING |
                        GPUTextureUsage.COPY_DST |
                        GPUTextureUsage.RENDER_ATTACHMENT,
                });
                imageBitmaps.forEach((imageBitmap, i) => {
                    this.#device.queue.copyExternalImageToTexture(
                        { source: imageBitmap },
                        { texture: cubeTexture, origin: { x: 0, y: 0, z: i } },
                        [imageBitmap.width, imageBitmap.height, 1]
                    );
                });

                texture2dArray.texture = cubeTexture;
            } else {
                this.#createTextureBindingToCopy(texture2dArray);
            }
        });
        //--------------------------------------------
        this.#texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this.#device.importExternalTexture({
                source: externalTexture.video
            });
        });
        //--------------------------------------------
        this.#bindingTextures.forEach(bindingTexture => {
            bindingTexture.texture = this.#device.createTexture({
                size: bindingTexture.size || this.#presentationSize,
                format: 'rgba8unorm',
                usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
            });
        });
    }

    #createTextureBindingToCopy(texture2d) {
        texture2d.texture = this.#device.createTexture({
            label: texture2d.name,
            size: this.#presentationSize,
            format: this.#presentationFormat, // if 'depth24plus' throws error
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }

    #createTextureToSize(texture2d, width, height) {
        texture2d.texture = this.#device.createTexture({
            label: texture2d.name,
            size: [width, height],
            format: this.#presentationFormat, // if 'depth24plus' throws error
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
        });
    }

    #createComputeBindGroup() {
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                const entries = this.#createEntries(ShaderType.COMPUTE);
                if (entries.length) {
                    let bglEntries = [];
                    entries.forEach((entry, index) => {
                        let bglEntry = {
                            binding: index,
                            visibility: GPUShaderStage.COMPUTE
                        };
                        bglEntry[entry.type.name] = { 'type': entry.type.type };
                        if (entry.type.format) {
                            bglEntry[entry.type.name].format = entry.type.format;
                        }
                        if (entry.type.viewDimension) {
                            bglEntry[entry.type.name].viewDimension = entry.type.viewDimension;
                        }
                        bglEntries.push(bglEntry);
                    });
                    renderPass.bindGroupLayout = this.#device.createBindGroupLayout({ entries: bglEntries });
                    /**
                     * @type {GPUBindGroup}
                     */
                    renderPass.computeBindGroup = this.#device.createBindGroup({
                        label: `_createComputeBindGroup 0 - ${index}`,
                        layout: renderPass.bindGroupLayout,
                        entries: entries
                    });
                }
            }
        });
    }

    async #createPipeline() {
        this.#createComputeBindGroup();
        this.#renderPasses.forEach((renderPass, index) => {
            if (renderPass.hasComputeShader) {
                renderPass.computePipeline = this.#device.createComputePipeline({
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayout]
                    }),
                    label: `_createPipeline() - ${index}`,
                    compute: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.compute
                        }),
                        entryPoint: "main"
                    }
                });
            }
        });

        //--------------------------------------

        this.#createParams();
        //this.createVertexBuffer(new Float32Array(this.#vertexArray));
        // enum GPUPrimitiveTopology {
        //     'point-list',
        //     'line-list',
        //     'line-strip',
        //     'triangle-list',
        //     'triangle-strip',
        // };
        this.#renderPasses.forEach(renderPass => {
            if (renderPass.hasVertexAndFragmentShader) {
                renderPass.renderPipeline = this.#device.createRenderPipeline({
                    // layout: 'auto',
                    layout: this.#device.createPipelineLayout({
                        bindGroupLayouts: [renderPass.bindGroupLayout]
                    }),
                    //primitive: { topology: 'triangle-strip' },
                    primitive: { topology: 'triangle-list' },
                    depthStencil: {
                        depthWriteEnabled: true,
                        depthCompare: 'less',
                        format: 'depth24plus',
                    },
                    vertex: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.vertex,
                        }),
                        entryPoint: 'main', // shader function name
                        buffers: [
                            {
                                arrayStride: this.#vertexBufferInfo.vertexSize,
                                attributes: [
                                    {
                                        // position
                                        shaderLocation: 0,
                                        offset: this.#vertexBufferInfo.vertexOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // colors
                                        shaderLocation: 1,
                                        offset: this.#vertexBufferInfo.colorOffset,
                                        format: 'float32x4',
                                    },
                                    {
                                        // uv
                                        shaderLocation: 2,
                                        offset: this.#vertexBufferInfo.uvOffset,
                                        format: 'float32x2',
                                    },
                                ],
                            },
                        ],
                    },
                    fragment: {
                        module: this.#device.createShaderModule({
                            code: renderPass.compiledShaders.fragment,
                        }),
                        entryPoint: 'main', // shader function name
                        targets: [
                            {
                                format: this.#presentationFormat,
                                blend: {
                                    alpha: {
                                        srcFactor: 'src-alpha',
                                        dstFactor: 'one-minus-src-alpha',
                                        operation: 'add'
                                    },
                                    color: {
                                        srcFactor: 'src-alpha',
                                        dstFactor: 'one-minus-src-alpha',
                                        operation: 'add'
                                    },
                                },
                                writeMask: GPUColorWrite.ALL,
                            },
                        ],
                    },
                });
            }
        });
    }
    /**
     * Creates the entries for the pipeline
     * @returns an array with the entries
     */
    #createEntries(shaderType, internal) {
        internal = internal || false;
        let entries = [];
        let bindingIndex = 0;
        if (this.#uniforms.length) {
            entries.push(
                {
                    binding: bindingIndex++,
                    resource: {
                        label: 'uniform',
                        buffer: this.#uniforms.buffer
                    },
                    type: {
                        name: 'buffer',
                        type: 'uniform'
                    }
                }
            );
        }
        if (this.#storage.length) {
            this.#storage.forEach(storageItem => {
                let internalCheck = internal == storageItem.internal;
                if (!storageItem.shaderType && internalCheck || storageItem.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            binding: bindingIndex++,
                            resource: {
                                label: 'storage',
                                buffer: storageItem.buffer
                            },
                            type: {
                                name: 'buffer',
                                type: 'storage'
                            }
                        }
                    );
                }
            });
        }
        if (this.#layers.length) {
            if (!this.#layers.shaderType || this.#layers.shaderType == shaderType) {
                entries.push(
                    {
                        binding: bindingIndex++,
                        resource: {
                            label: 'layer',
                            buffer: this.#layers.buffer
                        },
                        type: {
                            name: 'buffer',
                            type: 'storage'
                        }
                    }
                );
            }
        }
        if (this.#samplers.length) {
            this.#samplers.forEach((sampler, index) => {
                let internalCheck = internal == sampler.internal;
                if (!sampler.shaderType && internalCheck || sampler.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            binding: bindingIndex++,
                            resource: sampler.resource,
                            type: {
                                name: 'sampler',
                                type: 'filtering'
                            }
                        }
                    );
                }
            });
        }
        if (this.#texturesStorage2d.length) {
            this.#texturesStorage2d.forEach((textureStorage2d, index) => {
                let internalCheck = internal == textureStorage2d.internal;
                if (!textureStorage2d.shaderType && internalCheck || textureStorage2d.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'texture storage 2d',
                            binding: bindingIndex++,
                            resource: textureStorage2d.texture.createView(),
                            type: {
                                name: 'storageTexture',
                                type: 'write-only'
                            }
                        }
                    );
                }
            });
        }
        if (this.#textures2d.length) {
            this.#textures2d.forEach((texture2d, index) => {
                let internalCheck = internal == texture2d.internal;
                if (!texture2d.shaderType && internalCheck || texture2d.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'texture 2d',
                            binding: bindingIndex++,
                            resource: texture2d.texture.createView(),
                            type: {
                                name: 'texture',
                                type: 'float'
                            }
                        }
                    );
                }
            });
        }
        if (this.#textures2dArray.length) {
            this.#textures2dArray.forEach((texture2dArray, index) => {
                let internalCheck = internal == texture2dArray.internal;
                if (!texture2dArray.shaderType && internalCheck || texture2dArray.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'texture 2d array',
                            binding: bindingIndex++,
                            resource: texture2dArray.texture.createView({
                                dimension: '2d-array',
                                baseArrayLayer: 0,
                                arrayLayerCount: texture2dArray.imageTextures.bitmaps.length
                            }),
                            type: {
                                name: 'texture',
                                type: 'float',
                                viewDimension: '2d-array'
                            }
                        }
                    );
                }
            });
        }
        if (this.#texturesExternal.length) {
            this.#texturesExternal.forEach(externalTexture => {
                let internalCheck = internal == externalTexture.internal;
                if (!externalTexture.shaderType && internalCheck || externalTexture.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'external texture',
                            binding: bindingIndex++,
                            resource: externalTexture.texture,
                            type: {
                                name: 'externalTexture',
                                // type: 'write-only'
                            }
                        }
                    );
                }
            });
        }
        if (this.#bindingTextures.length) {
            this.#bindingTextures.forEach(bindingTexture => {
                let internalCheck = internal == bindingTexture.internal;
                if (bindingTexture.compute.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'binding texture',
                            binding: bindingIndex++,
                            resource: bindingTexture.texture.createView(),
                            type: {
                                name: 'storageTexture',
                                type: 'write-only',
                                format: 'rgba8unorm'
                            }
                        }
                    );
                }
            });
            this.#bindingTextures.forEach(bindingTexture => {
                let internalCheck = internal == bindingTexture.internal;
                if (bindingTexture.fragment.shaderType == shaderType && internalCheck) {
                    entries.push(
                        {
                            label: 'binding texture 2',
                            binding: bindingIndex++,
                            resource: bindingTexture.texture.createView(),
                            type: {
                                name: 'texture',
                                type: 'float'
                            }
                        }
                    );
                }
            });
        }
        return entries;
    }

    #createParams() {
        this.#renderPasses.forEach(renderPass => {
            const entries = this.#createEntries(ShaderType.FRAGMENT, renderPass.internal);
            if (entries.length) {
                let bglEntries = [];
                entries.forEach((entry, index) => {
                    let bglEntry = {
                        binding: index,
                        visibility: GPUShaderStage.FRAGMENT
                    };
                    bglEntry[entry.type.name] = { 'type': entry.type.type };
                    if (entry.type.viewDimension) {
                        bglEntry[entry.type.name].viewDimension = entry.type.viewDimension;
                    }
                    // TODO: 1262
                    // if you remove this there's an error that I think is not explained right
                    // it talks about a storage in index 1 but it was actually the 0
                    // and so is to this uniform you have to change the visibility
                    // not remove the type and leaving it empty as it seems you have to do here:
                    // https://gpuweb.github.io/gpuweb/#bindgroup-examples
                    if (entry.type.type == 'uniform') {
                        bglEntry.visibility = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
                    }
                    bglEntries.push(bglEntry);
                });
                renderPass.bindGroupLayout = this.#device.createBindGroupLayout({ entries: bglEntries });
                renderPass.uniformBindGroup = this.#device.createBindGroup({
                    label: '_createParams() 0',
                    layout: renderPass.bindGroupLayout,
                    entries: entries
                });
            }
        });
    }
    async update() {
        if (!this.#canvas || !this.#device) return;
        //--------------------------------------------
        this.#delta = this.#clock.getDelta();
        this.#time = this.#clock.time;
        this.#epoch = +new Date() / 1000;
        this.setUniform(UniformKeys.TIME, this.#time);
        this.setUniform(UniformKeys.DELTA, this.#delta);
        this.setUniform(UniformKeys.EPOCH, this.#epoch);
        this.setUniform(UniformKeys.SCREEN, [this.#canvas.width, this.#canvas.height]);
        this.setUniform(UniformKeys.MOUSE, [this.#mouseX, this.#mouseY]);
        this.setUniform(UniformKeys.MOUSE_CLICK, this.#mouseClick);
        this.setUniform(UniformKeys.MOUSE_DOWN, this.#mouseDown);
        this.setUniform(UniformKeys.MOUSE_WHEEL, this.#mouseWheel);
        this.setUniform(UniformKeys.MOUSE_DELTA, this.#mouseDelta);
        //--------------------------------------------
        this.#createParametersUniforms();
        // TODO: create method for this
        this.#storage.forEach(storageItem => {
            if (storageItem.mapped) {
                const values = new Float32Array(storageItem.array);
                storageItem.buffer = this.#createAndMapBuffer(values, storageItem.usage);
            }
        });
        // AUDIO
        // this.#analyser.getByteTimeDomainData(this.#dataArray);
        this.#sounds.forEach(sound => {
            sound.analyser?.getByteFrequencyData(sound.data);
        });
        // END AUDIO
        this.#texturesExternal.forEach(externalTexture => {
            externalTexture.texture = this.#device.importExternalTexture({
                source: externalTexture.video
            });
            if ('requestVideoFrameCallback' in externalTexture.video) {
                externalTexture.video.requestVideoFrameCallback(() => { });
            }
        });

        this.#createComputeBindGroup();

        let commandEncoder = this.#device.createCommandEncoder();

        this.#renderPasses.forEach(renderPass => {
            if (renderPass.hasComputeShader) {
                const passEncoder = commandEncoder.beginComputePass();
                passEncoder.setPipeline(renderPass.computePipeline);
                if (this.#uniforms.length) {
                    passEncoder.setBindGroup(0, renderPass.computeBindGroup);
                }
                passEncoder.dispatchWorkgroups(
                    renderPass.workgroupCountX,
                    renderPass.workgroupCountY,
                    renderPass.workgroupCountZ
                );
                passEncoder.end();
            }
        });

        // ---------------------

        this.#renderPassDescriptor.colorAttachments[0].view = this.#context.getCurrentTexture().createView();
        this.#renderPassDescriptor.depthStencilAttachment.view = this.#depthTexture.createView();

        const swapChainTexture = this.#context.getCurrentTexture();

        //commandEncoder = this.#device.createCommandEncoder();
        this.#renderPasses.forEach((renderPass, renderPassIndex) => {
            if (renderPass.hasVertexAndFragmentShader) {
                const passEncoder = commandEncoder.beginRenderPass(this.#renderPassDescriptor);
                passEncoder.setPipeline(renderPass.renderPipeline);
                this.#createParams();
                if (this.#uniforms.length) {
                    passEncoder.setBindGroup(0, renderPass.uniformBindGroup);
                }
                passEncoder.setVertexBuffer(0, this.#buffer);
                /**
                 * vertexCount: number The number of vertices to draw
                 * instanceCount?: number | undefined The number of instances to draw
                 * firstVertex?: number | undefined Offset into the vertex buffers, in vertices, to begin drawing from
                 * firstInstance?: number | undefined First instance to draw
                 */
                //passEncoder.draw(3, 1, 0, 0);
                passEncoder.draw(this.#vertexBufferInfo.vertexCount);
                passEncoder.end();
                // Copy the rendering results from the swapchain into |texture2d.texture|.
                this.#textures2d.forEach(texture2d => {
                    if (texture2d.renderPassIndex == renderPassIndex || texture2d.renderPassIndex == null) {
                        if (texture2d.copyCurrentTexture) {
                            commandEncoder.copyTextureToTexture(
                                {
                                    texture: swapChainTexture,
                                },
                                {
                                    texture: texture2d.texture,
                                },
                                this.#presentationSize
                            );
                        }
                    }
                });
                this.#texturesToCopy.forEach(texturePair => {
                    // console.log(texturePair.a);
                    // this.#createTextureToSize(texturePair.b, texturePair.a.width, texturePair.a.height);
                    commandEncoder.copyTextureToTexture(
                        {
                            texture: texturePair.a,
                        },
                        {
                            texture: texturePair.b,
                        },
                        [texturePair.a.width, texturePair.a.height]
                    );
                });
                this.#texturesToCopy = [];
            }
        });



        if (this.#readStorage.length) {
            this.#readStorage.forEach(readStorageItem => {
                let storageItem = this.#storage.find(storageItem => storageItem.name === readStorageItem.name);
                commandEncoder.copyBufferToBuffer(
                    storageItem.buffer /* source buffer */,
                    0 /* source offset */,
                    readStorageItem.buffer /* destination buffer */,
                    0 /* destination offset */,
                    readStorageItem.buffer.size /* size */
                );
            });
        }
        // ---------------------
        this.#commandsFinished.push(commandEncoder.finish());
        this.#device.queue.submit(this.#commandsFinished);
        this.#commandsFinished = [];
        //
        //this.#vertexArray = [];
        // reset mouse values because it doesn't happen by itself
        this.#mouseClick = false;
        this.#mouseWheel = false;
        this.#mouseDelta = [0, 0];
        await this.read();
    }
    async read() {
        for (const [key, event] of this.#events) {
            let eventRead = await this.readStorage(event.name);
            if (eventRead) {
                let id = eventRead[0];
                if (id != 0) {
                    event.callback && event.callback(eventRead.slice(1, -1));
                }
            }
        }
    }

    #getWGSLCoordinate(value, side, invert = false) {
        const direction = invert ? -1 : 1;
        const p = value / side;
        return (p * 2 - 1) * direction;
    };
    /**
     * Adds two triangles as a quad called Point
     * @param {Coordinate} coordinate `x` from 0 to canvas.width, `y` from 0 to canvas.height, `z` it goes from 0.0 to 1.0 and forward
     * @param {Number} width point width
     * @param {Number} height point height
     * @param {Array<RGBAColor>} colors one color per corner
     * @param {Boolean} useTexture
     */
    addPoint(coordinate, width, height, colors, useTexture = false) {
        const { x, y, z } = coordinate;
        const nx = this.#getWGSLCoordinate(x, this.#canvas.width);
        const ny = this.#getWGSLCoordinate(y, this.#canvas.height, true);
        const nz = z;
        const nw = this.#getWGSLCoordinate(x + width, this.#canvas.width);
        const nh = this.#getWGSLCoordinate(y + height, this.#canvas.height);
        const { r: r0, g: g0, b: b0, a: a0 } = colors[0];
        const { r: r1, g: g1, b: b1, a: a1 } = colors[1];
        const { r: r2, g: g2, b: b2, a: a2 } = colors[2];
        const { r: r3, g: g3, b: b3, a: a3 } = colors[3];
        this.#vertexArray.push(
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5,// 0 top left
            +nw, +ny, nz, 1, r1, g1, b1, a1, (+nw + 1) * .5, (+ny + 1) * .5,// 1 top right
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5,// 2 bottom right
            +nx, +ny, nz, 1, r0, g0, b0, a0, (+nx + 1) * .5, (+ny + 1) * .5,// 3 top left
            +nx, -nh, nz, 1, r2, g2, b2, a2, (+nx + 1) * .5, (-nh + 1) * .5,// 4 bottom left
            +nw, -nh, nz, 1, r3, g3, b3, a3, (+nw + 1) * .5, (-nh + 1) * .5,// 5 bottom right
        );
    }
    get canvas() {
        return this.#canvas;
    }
    get device() {
        return this.#device;
    }
    get context() {
        return this.#context;
    }
    get presentationFormat() {
        return this.#presentationFormat;
    }
    get buffer() {
        return this.#buffer;
    }
    get fullscreen() {
        return this.#fullscreen;
    }
    set fullscreen(value) {
        if (value) {
            this.#lastFitWindow = this.#fitWindow;
            this.fitWindow = value;
            this.#canvas.requestFullscreen().catch(err => {
                throw `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`;
            });
            this.#fullscreen = true;
        } else {
            document.exitFullscreen();
            this.#fullscreen = false;
            this.#resizeCanvasToDefault();
        }
    }
    get fitWindow() {
        return this.#fitWindow;
    }
    set fitWindow(value) {
        if (!this.#context) {
            throw 'fitWindow must be assigned after Points.init() call or you don\'t have a Canvas assigned in the constructor';
        }
        this.#fitWindow = value;
        if (this.#fitWindow) {
            this.#resizeCanvasToFitWindow();
        } else {
            this.#resizeCanvasToDefault();
        }
    }
}

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
 * @class
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
     * @returns {Promise<void>}
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
     * @returns {Promise<void>}
     */
    static async color(points, r, g, b, a, blendAmount) {
        return await RenderPasses.add(points, RenderPasses.COLOR, { color: [r, g, b, a], blendAmount });
    }

    /**
     * Grayscale postprocessing. Takes the brightness of an image and returns it; that makes the grayscale result.
     * @param {Points} points a `Points` reference
     * @returns {Promise<void>}
     */
    static async grayscale(points) {
        return await RenderPasses.add(points, RenderPasses.GRAYSCALE);
    }

    /**
     * Chromatic Aberration postprocessing. Color bleeds simulating a lens effect without distortion.
     * @param {Points} points a `Points` reference
     * @param {Number} distance from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns {Promise<void>}
     */
    static async chromaticAberration(points, distance) {
        return await RenderPasses.add(points, RenderPasses.CHROMATIC_ABERRATION, { distance });
    }

    /**
     * Pixelate postprocessing. It reduces the amount of pixels in the output preserving the scale.
     * @param {Points} points a `Points` reference
     * @param {Number} width width of the pixel in pixels
     * @param {Number} height width of the pixel in pixels
     * @returns {Promise<void>}
     */
    static async pixelate(points, width, height) {
        return await RenderPasses.add(points, RenderPasses.PIXELATE, { pixelsWidth: width, pixelsHeight: height });
    }

    /**
     * Lens Distortion postprocessing. A fisheye distortion with chromatic aberration.
     * @param {Points} points a `Points` reference
     * @param {Number} amount positive or negative value on how distorted the image will be
     * @param {Number} distance of chromatic aberration: from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns {Promise<void>}
     */
    static async lensDistortion(points, amount, distance) {
        return await RenderPasses.add(points, RenderPasses.LENS_DISTORTION, { amount, distance });
    }

    /**
     * Film grain postprocessing. White noise added to the output to simulate film irregularities.
     * @param {Points} points a `Points` reference
     * @returns {Promise<void>}
     */
    static async filmgrain(points) {
        return await RenderPasses.add(points, RenderPasses.FILM_GRAIN);
    }

    /**
     * Bloom postprocessing. Increases brightness of already bright areas to create a haze effect.
     * @param {Points} points a `Points` reference
     * @param {Number} amount how bright the effect will be
     * @returns {Promise<void>}
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
     * @returns {Promise<void>}
     */
    static async blur(points, resolutionX, resolutionY, directionX, directionY, radians) {
        return await RenderPasses.add(points, RenderPasses.BLUR, { resolution: [resolutionX, resolutionY], direction: [directionX, directionY], radians });
    }

    /**
     * Waves postprocessing. Distorts the image with noise to create a water like effect.
     * @param {Points} points a `Points` reference
     * @param {Number} scale how big the wave noise is
     * @param {Number} intensity a soft or hard effect
     * @returns {Promise<void>}
     */
    static async waves(points, scale, intensity) {
        return await RenderPasses.add(points, RenderPasses.WAVES, { scale, intensity });
    }
}

export { RenderPass, RenderPasses, ShaderType, Points as default };
