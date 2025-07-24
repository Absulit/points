export { RenderPasses as default };
/**
 * List of predefined Render Passes for Post Processing.
 */
declare class RenderPasses {
    static COLOR: number;
    static GRAYSCALE: number;
    static CHROMATIC_ABERRATION: number;
    static PIXELATE: number;
    static LENS_DISTORTION: number;
    static FILM_GRAIN: number;
    static BLOOM: number;
    static BLUR: number;
    static WAVES: number;
    static "__#3@#LIST": {
        1: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        2: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        3: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        4: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        5: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => Promise<void>;
        };
        6: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        7: {
            vertexShader: string;
            fragmentShader: string;
            /**
             *
             * @param {Points} points
             * @param {*} params
             */
            init: (points: Points, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        8: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
        9: {
            vertexShader: string;
            fragmentShader: string;
            init: (points: any, params: any) => Promise<void>;
            update: (points: any) => void;
        };
    };
    /**
     * Add a `RenderPass` from the `RenderPasses` list
     * @param {Points} points References a `Points` instance
     * @param {RenderPasses} renderPassId Select a static property from `RenderPasses`
     * @param {Object} params An object with the params needed by the `RenderPass`
     */
    static add(points: Points, renderPassId: RenderPasses, params: any): Promise<void>;
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
    static color(points: Points, r: number, g: number, b: number, a: number, blendAmount: number): Promise<void>;
    /**
     * Grayscale postprocessing. Takes the brightness of an image and returns it; that makes the grayscale result.
     * @param {Points} points a `Points` reference
     * @returns
     */
    static grayscale(points: Points): Promise<void>;
    /**
     * Chromatic Aberration postprocessing. Color bleeds simulating a lens effect without distortion.
     * @param {Points} points a `Points` reference
     * @param {Number} distance from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns
     */
    static chromaticAberration(points: Points, distance: number): Promise<void>;
    /**
     * Pixelate postprocessing. It reduces the amount of pixels in the output preserving the scale.
     * @param {Points} points a `Points` reference
     * @param {Number} width width of the pixel in pixels
     * @param {Number} height width of the pixel in pixels
     * @returns
     */
    static pixelate(points: Points, width: number, height: number): Promise<void>;
    /**
     * Lens Distortion postprocessing. A fisheye distortion with chromatic aberration.
     * @param {Points} points a `Points` reference
     * @param {Number} amount positive or negative value on how distorted the image will be
     * @param {Number} distance of chromatic aberration: from 0..1 how far the channels are visually apart from each other in the screen, but the value can be greater and negative
     * @returns
     */
    static lensDistortion(points: Points, amount: number, distance: number): Promise<void>;
    /**
     * Film grain postprocessing. White noise added to the output to simulate film irregularities.
     * @param {Points} points a `Points` reference
     * @returns
     */
    static filmgrain(points: Points): Promise<void>;
    /**
     * Bloom postprocessing. Increases brightness of already bright areas to create a haze effect.
     * @param {Points} points a `Points` reference
     * @param {Number} amount how bright the effect will be
     * @returns
     */
    static bloom(points: Points, amount: number): Promise<void>;
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
    static blur(points: Points, resolutionX: number, resolutionY: number, directionX: number, directionY: number, radians: number): Promise<void>;
    /**
     * Waves postprocessing. Distorts the image with noise to create a water like effect.
     * @param {Points} points a `Points` reference
     * @param {Number} scale how big the wave noise is
     * @param {Number} intensity a soft or hard effect
     * @returns
     */
    static waves(points: Points, scale: number, intensity: number): Promise<void>;
}
