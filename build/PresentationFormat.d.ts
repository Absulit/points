export { PresentationFormat as default };
/**
 * Class to be used to decide if the output textures can hold more data beyond
 * the range from 0..1. Useful for HDR images.
 *
 * @example
 * points.presentationFormat = PresentationFormat.RGBA16FLOAT;
 *
 * @class PresentationFormat
 */
declare class PresentationFormat {
    /**
     * @memberof PresentationFormat
     */
    static BGRA8UNORM: string;
    /**
     * @memberof PresentationFormat
     */
    static RGBA8UNORM: string;
    /**
     * @memberof PresentationFormat
     */
    static RGBA16FLOAT: string;
    /**
     * @memberof PresentationFormat
     */
    static RGBA32FLOAT: string;
}
