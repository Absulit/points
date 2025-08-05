/**
 * Utility methods to for the {@link Points#setTextureString | setTextureString()}
 * @module texture-string
 * @ignore
 */

/**
 * Method to load image with await
 * @param {String} src
 * @returns {Promise<void>}
 */
export async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
    });
}

/**
 * Returns UTF-16 array of each char
 * @param {String} s
 * @returns {Array<Number>}
 */
function strToCodes(s) {
    return Array.from(s).map(c => c.charCodeAt(0))
}

/**
 *
 * @param {HTMLImageElement} atlas Image atlas to parse
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {Number} index index in the atlas, so 0 is the first char
 * @param {{x: number, y: number}} size cell dimensions
 * @param {Number} finalIndex final positional index in the canvas
 */
function sprite(atlas, ctx, index, size, finalIndex) {
    const { width } = atlas;
    const numColumns = width / size.x

    const x = index % numColumns;
    const y = Math.floor(index / numColumns);

    ctx.drawImage(
        atlas,
        x * size.x,
        y * size.y,
        size.x,
        size.y,

        size.x * finalIndex,
        0,

        size.x,
        size.y);
}

/**
 * @typedef {number} SignedNumber
 * A numeric value that may be negative or positive.
 */

/**
 * Expects an atlas/spritesheed with chars in UTF-16 order.
 * This means `A` is expected at index `65`; if not there,
 * use offset to move backwards (negative) or forward (positive)
 * @param {String} str String used to extract letters from the image
 * @param {HTMLImageElement} atlasImg image with the Atlas to extract letters from
 * @param {{x: number, y: number}} size width and height in pixels of each letter
 * @param {SignedNumber} offset how many chars is the atlas offset from the UTF-16
 * @returns {string} Base64 image
 */
export function strToImage(str, atlasImg, size, offset = 0) {
    const chars = strToCodes(str);
    const canvas = document.createElement('canvas');
    canvas.width = chars.length * size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext('2d');

    chars.forEach((c, i) => sprite(atlasImg, ctx, c + offset, size, i));
    return canvas.toDataURL('image/png');
}