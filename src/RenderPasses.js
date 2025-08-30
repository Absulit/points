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
 * update();
 *
 * function update() {
 *     points.update();
 *     requestAnimationFrame(update);
 * }
 */
class RenderPasses {
    /**
     * Apply a color {@link RenderPass}
     */
    static COLOR = color;
    /**
     * Apply a grayscale {@link RenderPass}
     */
    static GRAYSCALE = grayscale;
    /**
     * Apply a chromatic aberration {@link RenderPass}
     */
    static CHROMATIC_ABERRATION = chromaticAberration;
    /**
     * Apply a pixelation {@link RenderPass}
     */
    static PIXELATE = pixelate;
    /**
     * Apply a lens distortion {@link RenderPass}
     */
    static LENS_DISTORTION = lensDistortion;
    /**
     * Apply a film grain {@link RenderPass}
     */
    static FILM_GRAIN = filmgrain;
    /**
     * Apply a bloom {@link RenderPass}
     */
    static BLOOM = bloom;
    /**
     * Apply a blur {@link RenderPass}
     */
    static BLUR = blur;
    /**
     * Apply a waives noise {@link RenderPass}
     */
    static WAVES = waves;
}

export default RenderPasses;
