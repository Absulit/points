/**
 * Class to be used to decide if the output textures can hold more data beyond
 * the range from 0..1. Useful for HDR images.
 *
 * @example
 * points.presentationFormat = PresentationFormat.RGBA16FLOAT;
 *
 */
export default class PresentationFormat {
    static BGRA8UNORM = 'bgra8unorm';
    static RGBA8UNORM = 'rgba8unorm';
    static RGBA16FLOAT = 'rgba16float';
    static RGBA32FLOAT = 'rgba32float';
}
