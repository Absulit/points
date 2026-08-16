export { RenderPasses as default };
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
declare class RenderPasses {
    /**
     * Apply a color {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
     * @type {RenderPass}
     */
    static COLOR: RenderPass;
    /**
     * Apply a grayscale {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.GRAYSCALE);
     * @type {RenderPass}
     */
    static GRAYSCALE: RenderPass;
    /**
     * Apply a chromatic aberration {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
     * @type {RenderPass}
     */
    static CHROMATIC_ABERRATION: RenderPass;
    /**
     * Apply a pixelation {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.PIXELATE);
     * @type {RenderPass}
     */
    static PIXELATE: RenderPass;
    /**
     * Apply a lens distortion {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.LENS_DISTORTION);
     * @type {RenderPass}
     */
    static LENS_DISTORTION: RenderPass;
    /**
     * Apply a film grain {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.FILM_GRAIN);
     * @type {RenderPass}
     */
    static FILM_GRAIN: RenderPass;
    /**
     * Apply a bloom {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLOOM);
     * @type {RenderPass}
     */
    static BLOOM: RenderPass;
    /**
     * Apply a blur {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
     * @type {RenderPass}
     */
    static BLUR: RenderPass;
    /**
     * Apply a waives noise {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.WAVES, { scale: .05 });
     * @type {RenderPass}
     */
    static WAVES: RenderPass;
    /**
     * Apply a CRT tv pixels effect {@link RenderPass}
     * @example
     * points.addRenderPass(RenderPasses.CRT, { scale: .05 });
     * @type {RenderPass}
     */
    static CRT: RenderPass;
}
