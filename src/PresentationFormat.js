/**
 * Class to be used to decide if the output textures can hold more data beyond
 * the range from 0..1. Useful for HDR images.
 *
 * @example
 * points.presentationFormat = PresentationFormat.RGBA16FLOAT;
 *
 * @class PresentationFormat
 */
export default class PresentationFormat {
    /**
     * @memberof PresentationFormat
     */
    static BGRA8UNORM = 'bgra8unorm';
    /**
     * @memberof PresentationFormat
     */
    static RGBA8UNORM = 'rgba8unorm';
    /**
     * @memberof PresentationFormat
     */
    static RGBA16FLOAT = 'rgba16float';
    /**
     * @memberof PresentationFormat
     */
    static RGBA32FLOAT = 'rgba32float';
}
