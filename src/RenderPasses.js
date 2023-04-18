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
    static COLOR = 'color';
    static GRAYSCALE = 'grayscale';
    static CHROMATIC_ABERRATION = 'chromaticAberration';
    static PIXELATE = 'pixelate';
    static LENS_DISTORTION = 'lensDistortion';
    static FILM_GRAIN = 'filmgrain';
    static BLOOM = 'bloom';
    static BLUR = 'blur';
    static WAVES = 'waves';

    static _LIST = {
        'color': color,
        'grayscale': grayscale,
        'chromaticAberration': chromaticAberration,
        'pixelate': pixelate,
        'lensDistortion': lensDistortion,
        'filmgrain': filmgrain,
        'bloom': bloom,
        'blur': blur,
        'waves': waves,
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

    static async color(points, params) {
        return await RenderPasses.add(points, RenderPasses.COLOR, params);
    }
    static async grayscale(points, params) {
        return await RenderPasses.add(points, RenderPasses.GRAYSCALE, params);
    }
    static async chromaticAberration(points, params) {
        return await RenderPasses.add(points, RenderPasses.CHROMATIC_ABERRATION, params);
    }
    static async pixelate(points, params) {
        return await RenderPasses.add(points, RenderPasses.PIXELATE, params);
    }
    static async lensDistortion(points, params) {
        return await RenderPasses.add(points, RenderPasses.LENS_DISTORTION, params);
    }
    static async filmgrain(points, params) {
        return await RenderPasses.add(points, RenderPasses.FILM_GRAIN, params);
    }
    static async bloom(points, params) {
        return await RenderPasses.add(points, RenderPasses.BLOOM, params);
    }
    static async blur(points, params) {
        return await RenderPasses.add(points, RenderPasses.BLUR, params);
    }
    static async waves(points, params) {
        return await RenderPasses.add(points, RenderPasses.WAVES, params);
    }
}
