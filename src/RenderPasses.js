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
 * import Points, { RenderPass, RenderPasses } from 'points';
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
    static COLOR = color;
    static GRAYSCALE = grayscale;
    static CHROMATIC_ABERRATION = chromaticAberration;
    static PIXELATE = pixelate;
    static LENS_DISTORTION = lensDistortion;
    static FILM_GRAIN = filmgrain;
    static BLOOM = bloom;
    static BLUR = blur;
    static WAVES = waves;
}

export default RenderPasses;
