/* @ts-self-types="./RenderPasses.d.ts" */
import { RenderPass } from 'points';

const vert$9 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/image
 */

/**
 * Places a texture. The texture being an image loaded from the JS side.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2f} uv `vec2f`
 * @param {bool} crop `bool`
 * @returns {vec4f}
 *
 * @example
 *
 * // js
 * import { texture } from 'points/image';
 *
 * await points.setTextureImage('image', 'myimage.jpg');
 *
 * // wgsl string
 * ${texture}
 * let value = texture(image, imageSampler, uvr, true);
 */
const texture = /*wgsl*/`
fn texture(texture:texture_2d<f32>, aSampler:sampler, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims:vec2u = textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition =  vec2(0., 1.);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;

    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < vec2(0.0)) || any(uv > imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * Places texture in a position
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} aSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {vec2f} uv `vec2f`
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
const texturePosition = /*wgsl*/`
fn texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, crop:bool) -> vec4f {
    let flipTexture = vec2(1.,-1.);
    let flipTextureCoordinates = vec2(-1.,1.);
    let dims: vec2<u32> = textureDimensions(texture, 0);
    let dimsF32 = vec2f(dims);

    let minScreenSize = params.screen.y;
    let imageRatio = dimsF32 / minScreenSize;

    let displaceImagePosition = position * flipTextureCoordinates / imageRatio + vec2(0., 1.);
    let top = position + vec2(0, imageRatio.y);

    let imageUV = uv / imageRatio * flipTexture + displaceImagePosition;
    var rgbaImage = textureSample(texture, aSampler, imageUV);

    // e.g. if uv.x < 0. OR uv.y < 0. || uv.x > imageRatio.x OR uv.y > imageRatio.y
    if (crop && (any(uv < position) || any(uv > position + imageRatio))) {
        rgbaImage = vec4(0.);
    }

    return rgbaImage;
}
`;

/**
 * Increase the aparent pixel size of the texture image using `texturePosition`.
 * This reduces the quality of the image.
 * @type {String}
 * @param {texture_2d<f32>} texture `texture_2d<f32>`
 * @param {sampler} textureSampler `sampler`
 * @param {vec2f} position `vec2f`
 * @param {f32} pixelsWidth `f32`
 * @param {f32} pixelsHeight `f32`
 * @param {vec2f} uv `vec2f`
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
const pixelateTexturePosition = /*wgsl*/`
fn pixelateTexturePosition(texture:texture_2d<f32>, textureSampler:sampler, position:vec2f, pixelsWidth:f32, pixelsHeight:f32, uv:vec2f) -> vec4f {
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    let coord = vec2(dx*floor( uv.x / dx), dy * floor( uv.y / dy));

    //texturePosition(texture:texture_2d<f32>, aSampler:sampler, position:vec2f, uv:vec2f, crop:bool) -> vec4f {
    return texturePosition(texture, textureSampler, position, coord, true);
}
`;

const frag$9 = /*wgsl*/`

${texture}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, in.uvr, true);
    let finalColor = (imageColor + params.color_color) * params.color_blendAmount;

    return finalColor;
}
`;

const color$1 = new RenderPass(vert$9, frag$9, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('color_blendAmount', params.blendAmount || .5);
    points.setUniform('color_color', params.color || [1, .75, .79, 1], 'vec4f');
});
color$1.required = ['color', 'blendAmount'];
color$1.name = 'Color';

const vert$8 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

/**
 * Utilities for animation.
 * <br>
 * Functions that use sine and `params.time` to increase and decrease a value over time.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/animation
 */


/**
 * Animates `sin()` over `params.time` and a provided `speed`.
 * The value is normalized, so in the range 0..1
 * @type {String}
 * @param {f32} speed
 * @example
 * // js
 * import { fnusin } from 'points/animation';
 *
 * // wgsl string
 * ${fnusin}
 * let value = fnusin(2.);
 */
const fnusin = /*wgsl*/`
fn fnusin(speed: f32) -> f32{
    return (sin(params.time * speed) + 1.) * .5;
}
`;

/**
 * A few color constants and wgsl methods to work with colors.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/color
 */

/**
 * RED color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { RED } from 'points/color';
 *
 * // wgsl string
 * ${RED}
 * let value = RED * vec4f(.5);
 */
const RED = /*wgsl*/`
const RED = vec4(1.,0.,0.,1.);
`;

/**
 * GREEN color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { GREEN } from 'points/color';
 *
 * // wgsl string
 * ${GREEN}
 * let value = GREEN * vec4f(.5);
 */
const GREEN = /*wgsl*/`
const GREEN = vec4(0.,1.,0.,1.);
`;

/**
 * BLUE color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { BLUE } from 'points/color';
 *
 * // wgsl string
 * ${BLUE}
 * let value = BLUE * vec4f(.5);
 */
const BLUE = /*wgsl*/`
const BLUE = vec4(0.,0.,1.,1.);
`;

/**
 * WHITE color;
 * @type {vec4f}
 *
 * @example
 * // js
 * import { WHITE } from 'points/color';
 *
 * // wgsl string
 * ${WHITE}
 * let value = WHITE * vec4f(.5);
 */
const WHITE = /*wgsl*/`
const WHITE = vec4(1.,1.,1.,1.);
`;

/**
 * Compute the FFT (Fast Fourier Transform)
 * @type {String}
 * @param {f32} input `f32`
 * @param {i32} iterations `i32` 2, two is good
 * @param {f32} intensity `f32` 0..1 a percentage
 * @returns {f32}
 *
 * @example
 * // js
 * import { bloom } from 'points/color';
 *
 * // wgsl string
 * ${bloom}
 * let value = bloom(input, iterations, intensity);
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
 * Returns the perceived brightness of a color by the eye.<br>
 * // Standard<br>
 * `LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)`
 * @type {String}
 * @param {vec4f} color
 * @returns {f32}
 * @example
 * // js
 * import { brightness } from 'points/color';
 *
 * // wgsl string
 * ${brightness}
 * let value = brightness(rgba);
 */
const brightness = /*wgsl*/`
fn brightness(color:vec4f) -> f32 {
    // // Standard
    // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
    // // Percieved A
    // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
    // // Perceived B, slower to calculate
    // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
}
`;

const frag$8 = /*wgsl*/`

${fnusin}
${texturePosition}
${brightness}
${WHITE}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), in.uvr, true);
    let finalColor:vec4f = brightness(imageColor) * WHITE;

    return finalColor;
}
`;

const grayscale = new RenderPass(vert$8, frag$8, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
});
grayscale.name = 'Grayscale';

const vert$7 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

const frag$7 = /*wgsl*/`

${texturePosition}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), in.uvr, true);


    // --------- chromatic displacement vector
    let cdv = vec2(params.chromaticAberration_distance, 0.);
    let d = distance(vec2(.5,.5), in.uvr);
    let imageColorR = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * in.ratio, in.uvr + cdv * d, true).r;
    let imageColorG = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * in.ratio, in.uvr, true).g;
    let imageColorB = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0.) * in.ratio, in.uvr - cdv * d, true).b;

    let finalColor:vec4f = vec4(imageColorR, imageColorG, imageColorB, 1);

    return finalColor;
}
`;

const chromaticAberration = new RenderPass(vert$7, frag$7, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('chromaticAberration_distance', params.distance || .02);
});
chromaticAberration.required = ['distance'];
chromaticAberration.name = 'Chromatic Aberration';

const vert$6 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

const frag$6 = /*wgsl*/`

${texturePosition}
${pixelateTexturePosition}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {


    let pixelatedColor = pixelateTexturePosition(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(0.),
        params.pixelate_pixelDims.x,
        params.pixelate_pixelDims.y,
        in.uvr
    );

    let finalColor:vec4f = pixelatedColor;

    return finalColor;
}
`;

const pixelate = new RenderPass(vert$6, frag$6, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('pixelate_pixelDims', params.pixelDimensions || [10, 10], 'vec2f');
});
pixelate.required = ['pixelDimensions'];
pixelate.name = 'Pixelate';

const vert$5 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

/**
 * Math utils
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/math
 */

/**
 * PI is the ratio of a circle's circumference to its diameter.
 *
 * @see https://en.wikipedia.org/wiki/Pi
 *
 * @example
 * // js
 * import { PI } from 'points/math';
 *
 * // wgsl string
 * ${PI}
 * let value = PI * 3;
 */
const PI = /*wgsl*/`const PI = 3.14159265;`;

/**
 * Using polar coordinates, calculates the final point as `vec2f`
 * @type {String}
 * @param {f32} distance distance from origin
 * @param {f32} radians Angle in radians
 *
 * @example
 * // js
 * import { polar } from 'points/math';
 *
 * // wgsl string
 * ${polar}
 * let value = polar(distance, radians);
 */
const polar = /*wgsl*/`
fn polar(distance: f32, radians: f32) -> vec2f {
    return vec2f(distance * cos(radians), distance * sin(radians));
}
`;

/**
 * Rotates a vector an amount of radians
 * @type {String}
 * @param {vec2f} p vector to rotate
 * @param {f32} rads angle in radians
 *
 * @example
 * // js
 * import { rotateVector } from 'points/math';
 *
 * // wgsl string
 * ${rotateVector}
 * let value = rotateVector(position, radians);
 */
const rotateVector = /*wgsl*/`
fn rotateVector(p:vec2f, rads:f32 ) -> vec2f {
    let s = sin(rads);
    let c = cos(rads);
    let xnew = p.x * c - p.y * s;
    let ynew = p.x * s + p.y * c;
    return vec2(xnew, ynew);
}
`;

/**
 * original: Author : Ian McEwan, Ashima Arts.
 * https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/noise2d
 */

/**
 * Sinplex Noise function
 * @type {String}
 * @param {vec2f} v usually the uv
 * @returns {f32}
 *
 * @example
 * // js
 * import { snoise } from 'points/noise2d';
 *
 * // wgsl string
 * ${snoise}
 * let value = snoise(uv);
 */

const snoise = /*wgsl*/`

fn mod289_v3(x: vec3f) -> vec3f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn mod289_v2(x: vec2f) -> vec2f {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

fn permute(x: vec3f) -> vec3f {
    return mod289_v3(((x*34.0)+10.0)*x);
}

fn snoise(v:vec2f) -> f32 {
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

const frag$5 = /*wgsl*/`

${texture}
${rotateVector}
${snoise}
${PI}
${WHITE}
${polar}

fn angle(p1:vec2f, p2:vec2f) -> f32 {
    let d = p1 - p2;
    return abs(atan2(d.y, d.x)) / PI;
}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imagePosition = vec2(0.0,0.0) * in.ratio;
    let center = vec2(.5,.5) * in.ratio;
    let d = distance(center, in.uvr); // sqrt(dot(d, d));

    //vector from center to current fragment
    let vectorToCenter = in.uvr - center;
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
        if (in.ratio.x < 1.0) {
            bind = center.x;
        } else {
            bind = center.y;
        };
    }

    //Weird formulas
    var nuv = in.uvr;
    if (power > 0.0){//fisheye
        nuv = center + normalize(vectorToCenter) * tan(d * power) * bind / tan( bind * power);
    } else if (power < 0.0){//antifisheye
        nuv = center + normalize(vectorToCenter) * atan(d * -power * 10.0) * bind / atan(-power * bind * 10.0);
    } else {
        nuv = in.uvr;
    }

    // let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, imagePosition, nuv, false);


    // Chromatic Aberration --
    // --------- chromatic displacement vector
    let cdv = vec2(params.lensDistortion_distance, 0.);
    // let dis = distance(vec2(.5,.5), in.uvr);
    let imageColorR = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv + cdv * params.lensDistortion_amount , true).r;
    let imageColorG = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv, true).g;
    let imageColorB = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, nuv - cdv * params.lensDistortion_amount , true).b;

    let chromaticAberration:vec4f = vec4(imageColorR, imageColorG, imageColorB, 1);
    // -- Chromatic Aberration


    let finalColor = chromaticAberration;
    // let finalColor = vec4(nuv,0,1) * WHITE;

    return finalColor;
}
`;

const lensDistortion = new RenderPass(vert$5, frag$5, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('lensDistortion_amount', params.amount || .4);
    points.setUniform('lensDistortion_distance', params.distance || .01);
});
lensDistortion.required = ['amount', 'distance'];
lensDistortion.name = 'Lens Distortion';

const vert$4 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

/**
 * Various random functions.
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/random
 */


/**
 * Random number that returns a `vec2f`.<br>
 * You have to set the `rand_seed` before calling `rand()`.
 * @type {String}
 * @return {f32} equivalent to `rand_seed.y` and `rand_seed` is the result.
 *
 * @example
 * // js
 * import { rand } from 'points/random';
 * rand_seed.x = .01835255;
 *
 * // wgsl string
 * ${rand}
 * let value = rand();
 */
const rand = /*wgsl*/`
var<private> rand_seed : vec2f;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2f(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2f(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}
`;

const frag$4 = /*wgsl*/`

${texture}
${rand}
${snoise}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let imageColor = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, in.uvr, true);

    rand_seed = in.uvr + params.time;

    let noise = rand() * .5 + .5;
    return (imageColor + imageColor * noise)  * .5;
}
`;

const filmgrain = new RenderPass(vert$4, frag$4, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
});
filmgrain.name = 'Filmgrain';

const vert$3 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

const frag$3 = /*wgsl*/`

${texturePosition}
${bloom$1}
${brightness}
${PI}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let startPosition = vec2(0.,0.);
    let rgbaImage = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, startPosition, in.uvr, false); //* .998046;

    let input = brightness(rgbaImage);
    let bloomVal = bloom(input, i32(params.bloom_iterations), params.bloom_amount);
    let rgbaBloom = vec4(bloomVal);

    let finalColor:vec4f = rgbaImage + rgbaBloom;

    return finalColor;
}
`;

const bloom = new RenderPass(vert$3, frag$3, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('bloom_amount', params.amount || .5);
    points.setUniform('bloom_iterations', params.iterations || 2);
});
bloom.required = ['amount', 'iterations'];
bloom.name = 'Bloom';

const vert$2 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

/**
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/effects
 */


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
const blur9 = /*wgsl*/`
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

const frag$2 = /*wgsl*/`

${texturePosition}
${PI}
${rotateVector}
${blur9}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    return blur9(
        renderpass_feedbackTexture,
        renderpass_feedbackSampler,
        vec2(),
        in.uvr,
        params.blur_resolution, // resolution
        rotateVector(params.blur_direction, params.blur_radians) // direction
    );

}
`;

const blur = new RenderPass(vert$2, frag$2, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('blur_resolution', params.resolution || [50, 50], 'vec2f');
    points.setUniform('blur_direction', params.direction || [.4, .4], 'vec2f');
    points.setUniform('blur_radians', params.radians || 0);
});
blur.required = ['resolution', 'direction', 'radians'];
blur.name = 'Blur';

const vert$1 = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

const frag$1 = /*wgsl*/`

${texturePosition}
${snoise}

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let scale = params.waves_scale;
    let intensity = params.waves_intensity;
    let n1 = (snoise(in.uv / scale + vec2(.03, .4) * params.time) * .5 + .5) * intensity;
    let n2 = (snoise(in.uv / scale + vec2(.3, .02) * params.time) * .5 + .5) * intensity;
    let n = n1 + n2;

    let imageColor = texturePosition(renderpass_feedbackTexture, renderpass_feedbackSampler, vec2(0., 0), in.uvr + n2, true);
    let finalColor:vec4f = imageColor;

    return finalColor;
}
`;

const waves = new RenderPass(vert$1, frag$1, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('waves_scale', params.scale || .45);
    points.setUniform('waves_intensity', params.intensity || .03);
});
waves.required = ['scale', 'intensity'];
waves.name = 'Waves';

const vert = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
}
`;

/**
 * A few signed distance functions.
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/sdf
 */


/**
 * Create a rectangle with two coordinates.
 * @type {String}
 * @param {vec2f} startPoint first coordinate, one corner of the rectangle
 * @param {vec2f} endPoint second coordinate, opposite corner of the rectangle
 * @param {vec2f} uv
 * @return {f32}
 *
 * @example
 * // wgsl string
 * sdfRect(vec2f(), vec2f(1), in.uvr);
 *
 */
const sdfRect = /*wgsl*/`

fn sdfRect(startPoint:vec2f, endPoint:vec2f, uv:vec2f) -> f32 {
    let value = select(
        0.,
        1.,
        (startPoint.x < uv.x) &&
        (startPoint.y < uv.y) &&
        (uv.x < endPoint.x) &&
        (uv.y < endPoint.y)
    );
    return smoothstep(0, .5,  value);
}

`;

const frag = /*wgsl*/`

${fnusin}
${sdfRect}
${rotateVector}
${texture}
${RED + GREEN + BLUE}

const NUMCOLUMNS = 200.;

@fragment
fn main(in: FragmentIn) -> @location(0) vec4f {

    let numColumns = NUMCOLUMNS *  params.crt_scale;
    let numRows = NUMCOLUMNS * params.crt_scale;

    let pixelsWidth = params.screen.x / numColumns;
    let pixelsHeight = params.screen.y / numRows;
    let dx = pixelsWidth * (1. / params.screen.x);
    let dy = pixelsHeight * (1. / params.screen.y);

    // if column is pair then displace by this amount
    let x = select(0., .5, floor(in.uvr.x / dx) % 2 == 0.);

    let pixeleduv = vec2(dx*floor( in.uvr.x / dx), dy * floor(in.uvr.y / dy + x));
    let pixeleduvColor = vec4(pixeleduv, 0, 1);

    let subuv = fract(in.uvr * vec2(numColumns, numRows) + vec2(0,x));
    let subuvColor = vec4(subuv, 0, 1);

    // --------- chromatic displacement vector
    let cdv = vec2(params.crt_displacement, 0.);
    let imageColorG = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, pixeleduv, true).g;
    let imageColorR = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, pixeleduv + cdv, true).r;
    let imageColorB = texture(renderpass_feedbackTexture, renderpass_feedbackSampler, pixeleduv - cdv, true).b;

    let bottom_left = vec2(.0, .0);
    let top_right = bottom_left + vec2(.33, 1.);

    let margin = vec2(.01,0.) * 4;
    let margin_v = vec2(.0, .01) * 8;
    let offset = vec2(.33,0);
    let redSlot = RED * imageColorR * sdfRect(margin+margin_v+bottom_left + offset * 0, top_right - margin - margin_v + offset * 0, subuv); // subuv
    let greenSlot = GREEN * imageColorG * sdfRect(margin+margin_v+bottom_left + offset * 1, top_right - margin - margin_v + offset * 1, subuv);
    let blueSlot = BLUE * imageColorB * sdfRect(margin+margin_v+bottom_left + offset * 2, top_right - margin - margin_v + offset * 2, subuv);

    let finalColor = redSlot + greenSlot + blueSlot;

    return finalColor;
}
`;

const color = new RenderPass(vert, frag, null, 8, 8, 1, (points, params) => {
    points.setSampler('renderpass_feedbackSampler', null).internal = true;
    points.setTexture2d('renderpass_feedbackTexture', true).internal = true;
    points.setUniform('crt_scale', params.scale || .390);
    points.setUniform('crt_displacement', params.displacement || .013);
});
color.required = ['scale', 'displacement'];
color.name = 'CRT';

/**
 * List of predefined Render Passes for Post Processing.
 * Parameters required are shown as a warning in the JS console.
 * @class
 *
 * @example
 * import Points, { RenderPass } from 'points';
 * import RenderPasses from 'points/renderpasses';
 * const points = new Points('canvas');
 *
 * // option 1: along with the RenderPasses pased into `Points.init()`
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];
 *
 * // option 2: calling `points.addRenderPass()` method
 * points.addRenderPass(RenderPasses.GRAYSCALE);
 * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
 * points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
 * points.addRenderPass(RenderPasses.PIXELATE);
 * points.addRenderPass(RenderPasses.LENS_DISTORTION);
 * points.addRenderPass(RenderPasses.FILM_GRAIN);
 * points.addRenderPass(RenderPasses.BLOOM);
 * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
 * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
 *
 * await points.init(renderPasses);
 *
 * points.update(update);
 *
 * function update() {
 * // update uniforms and other animation variables
 * }
 */
class RenderPasses {
    /**
     * Apply a color {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
     * @type {RenderPass}
     */
    static COLOR = color$1;
    /**
     * Apply a grayscale {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.GRAYSCALE);
     * @type {RenderPass}
     */
    static GRAYSCALE = grayscale;
    /**
     * Apply a chromatic aberration {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
     * @type {RenderPass}
     */
    static CHROMATIC_ABERRATION = chromaticAberration;
    /**
     * Apply a pixelation {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.PIXELATE);
     * @type {RenderPass}
     */
    static PIXELATE = pixelate;
    /**
     * Apply a lens distortion {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.LENS_DISTORTION);
     * @type {RenderPass}
     */
    static LENS_DISTORTION = lensDistortion;
    /**
     * Apply a film grain {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.FILM_GRAIN);
     * @type {RenderPass}
     */
    static FILM_GRAIN = filmgrain;
    /**
     * Apply a bloom {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLOOM);
     * @type {RenderPass}
     */
    static BLOOM = bloom;
    /**
     * Apply a blur {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
     * @type {RenderPass}
     */
    static BLUR = blur;
    /**
     * Apply a waives noise {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
     * @type {RenderPass}
     */
    static WAVES = waves;
    /**
     * Apply a CRT tv pixels effect {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CRT, { scale: .05 });
     * @type {RenderPass}
     */
    static CRT = color;
}

export { RenderPasses as default };
