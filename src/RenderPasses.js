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
import { RenderPass } from './absulit.points.module.js';

/**
 * List of predefined Render Passes for Post Processing.
 */
export class RenderPasses {
    static COLOR = 1;
    static GRAYSCALE = 2;
    static CHROMATIC_ABERRATION = 3;
    static PIXELATE = 4;
    static LENS_DISTORTION = 5;
    static FILM_GRAIN = 6;
    static BLOOM = 7;
    static BLUR = 8;
    static WAVES = 9;

    static _LIST = {
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
        if (points._renderPasses?.length) {
            throw '`addPostRenderPass` should be called prior `Points.init()`';
        }
        let renderPass = RenderPasses._LIST[renderPassId];
        points._postRenderPasses.push(new RenderPass(renderPass.vertexShader, renderPass.fragmentShader, renderPass.computeShader))
        await renderPass.init(points, params)
    }

    static async color(points, color, blendAmount) {
        return await RenderPasses.add(points, RenderPasses.COLOR, { color, blendAmount });
    }
    static async grayscale(points) {
        return await RenderPasses.add(points, RenderPasses.GRAYSCALE);
    }
    static async chromaticAberration(points, distance) {
        return await RenderPasses.add(points, RenderPasses.CHROMATIC_ABERRATION, { distance });
    }
    static async pixelate(points, pixelsWidth, pixelsHeight) {
        return await RenderPasses.add(points, RenderPasses.PIXELATE, { pixelsWidth, pixelsHeight });
    }
    static async lensDistortion(points, amount, distance) {
        return await RenderPasses.add(points, RenderPasses.LENS_DISTORTION, { amount, distance });
    }
    static async filmgrain(points, amount, distance) {
        return await RenderPasses.add(points, RenderPasses.FILM_GRAIN, { amount, distance });
    }
    static async bloom(points, amount) {
        return await RenderPasses.add(points, RenderPasses.BLOOM, { amount });
    }
    static async blur(points, resolution, direction, radians) {
        return await RenderPasses.add(points, RenderPasses.BLUR, { resolution, direction, radians });
    }
    static async waves(points, scale, intensity) {
        return await RenderPasses.add(points, RenderPasses.WAVES, { scale, intensity });
    }
}
