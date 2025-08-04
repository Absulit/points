'use strict';
import color from './core/RenderPasses/color/index.js';
import grayscale from './core/RenderPasses/grayscale/index.js';
import chromaticAberration from './core/RenderPasses/chromaticAberration/index.js';
import pixelate from './core/RenderPasses/pixelate/index.js';
import lensDistortion from './core/RenderPasses/lensDistortion/index.js';
import filmgrain from './core/RenderPasses/filmgrain/index.js';
import bloom from './core/RenderPasses/bloom/index.js';
import blur from './core/RenderPasses/blur/index.js';
import waves from './core/RenderPasses/waves/index.js';
import RenderPass from './RenderPass.js';

/**
 * List of predefined Render Passes for Post Processing.
 * @class
 *
 * @example
 * import Points from 'points';
 * const points = new Points('canvas');
 *
 * let renderPasses = [
 *     new RenderPass(vert1, frag1, compute1),
 *     new RenderPass(vert2, frag2, compute2)
 * ];
 *
 * RenderPasses.grayscale(points);
 * RenderPasses.chromaticAberration(points, .02);
 * RenderPasses.color(points, .5, 1, 0, 1, .5);
 * RenderPasses.pixelate(points, 10, 10);
 * RenderPasses.lensDistortion(points, .4, .01);
 * RenderPasses.filmgrain(points);
 * RenderPasses.bloom(points, .5);
 * RenderPasses.blur(points, 100, 100, .4, 0, 0.0);
 * RenderPasses.waves(points, .05, .03);
 *
 * await points.init(renderPasses);
 *
 * update();
 *
 * function update() {
 *     points.update();
 *     requestAnimationFrame(update);
 * }
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
        await shaders.init(points, params)
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

export default RenderPasses;
