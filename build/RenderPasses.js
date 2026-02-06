/* @ts-self-types="./RenderPasses.d.ts" */
import color$1 from './core/RenderPasses/color/index.js';
import grayscale from './core/RenderPasses/grayscale/index.js';
import chromaticAberration from './core/RenderPasses/chromaticAberration/index.js';
import pixelate from './core/RenderPasses/pixelate/index.js';
import lensDistortion from './core/RenderPasses/lensDistortion/index.js';
import filmgrain from './core/RenderPasses/filmgrain/index.js';
import bloom from './core/RenderPasses/bloom/index.js';
import blur from './core/RenderPasses/blur/index.js';
import waves from './core/RenderPasses/waves/index.js';
import { RenderPass } from 'points';
import './RenderPass.js';

const vert = /*wgsl*/`

@vertex
fn main(in: VertexIn) -> FragmentIn {

    return defaultVertexBody(in.position, in.color, in.uv, in.normal);
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

/**
 * Math utils
 *
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module points/math
 */


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
 * import Points, { RenderPass, RenderPasses } from 'points';
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
     */
    static COLOR = color$1;
    /**
     * Apply a grayscale {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.GRAYSCALE);
     */
    static GRAYSCALE = grayscale;
    /**
     * Apply a chromatic aberration {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
     */
    static CHROMATIC_ABERRATION = chromaticAberration;
    /**
     * Apply a pixelation {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.PIXELATE);
     */
    static PIXELATE = pixelate;
    /**
     * Apply a lens distortion {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.LENS_DISTORTION);
     */
    static LENS_DISTORTION = lensDistortion;
    /**
     * Apply a film grain {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.FILM_GRAIN);
     */
    static FILM_GRAIN = filmgrain;
    /**
     * Apply a bloom {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLOOM);
     */
    static BLOOM = bloom;
    /**
     * Apply a blur {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
     */
    static BLUR = blur;
    /**
     * Apply a waives noise {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
     */
    static WAVES = waves;
    /**
     * Apply a CRT tv pixels effect {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CRT, { scale: .05 });
     */
    static CRT = color;
}

export { RenderPasses as default };
