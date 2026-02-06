/**
 * Class to be used to select how the content should be displayed on different
 * screen sizes.
 * ```text
 * FIT: Preserves both, but might show black bars or extend empty content. All content is visible.
 * COVER: Preserves both, but might crop width or height. All screen is covered.
 * WIDTH: Preserves the visibility of the width, but might crop the height.
 * HEIGHT: Preserves the visibility of the height, but might crop the width.
 * ```
 * @example
 *
 * points.scaleMode = ScaleMode.COVER;
 *
 * @class ScaleMode
 */

export default class ScaleMode {
    /**
     * ```text
     * All content is visible.
     * Black bars shown to compensate.
     * No content is cropped.
     *
     * PORTRAIT        LANDSCAPE
     * ░░░░░░░░░░░░░░░ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ░░░░░░░░░░░░░░░ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ░░░░░░░░░░░░░░░
     * ░░░░░░░░░░░░░░░
     * ```
     * @memberof ScaleMode
     */

    static FIT = 1;
    /**
     * ```text
     * Not all content is visible.
     * No black bars shown.
     * Content is cropped on the sides.
     * `
     * PORTRAIT            LANDSCAPE
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ```
     * @memberof ScaleMode
     */
    static COVER = 2;
    /**
     * ```text
     * Content is visible in portrait.
     * Black bars shown to compensate in portrait.
     * Content is cropped in landscape.
     *
     * PORTRAIT        LANDSCAPE
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
     * ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ░░░░░░░░░░░░░░░ ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
     * ```
     * @memberof ScaleMode
     */
    static WIDTH = 4;
    /**
     * ```text
     * Not all content is visible.
     * Black bars shown to compensate in landscape.
     * Content is cropped in portrait.
     *
     * PORTRAIT            LANDSCAPE
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒ ░░░░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ▒▒▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▒▒
     * ```
     * @memberof ScaleMode
     */
    static HEIGHT = 8;
}