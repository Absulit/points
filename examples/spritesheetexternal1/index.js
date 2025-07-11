import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
import Points from 'points';


async function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = err => reject(err);
    });
}

function strToCodes(str) {
    return Array.from(str).map(char => char.charCodeAt(0))
}

/**
 *
 * @param {Image} atlas Image atlas to parse
 * @param {CanvasRenderingContext2D} ctx Canvas context
 * @param {Number} index index in the atlas, so 0 is the first char
 * @param {Object} size cell dimensions
 * @param {Number} finalIndex final positional index in the canvas
 */
export function sprite(atlas, ctx, index, size, finalIndex) {
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

function strToImage(str, atlasImg, size){
    const chars = strToCodes(str);
    const canvas = document.createElement('canvas');
    canvas.width = chars.length * size.x;
    canvas.height = size.y;
    const ctx = canvas.getContext('2d');

    chars.forEach((c, i) => sprite(atlasImg, ctx, c - 32, size, i));
    return canvas.toDataURL('image/png');
}

const base = {
    vert,
    compute,
    frag,
    /**
     *
     * @param {Points} points
     */
    init: async (points, folder) => {
        let descriptor = {
            addressModeU: 'clamp-to-edge',
            addressModeV: 'clamp-to-edge',
            magFilter: 'nearest',
            minFilter: 'nearest',
            mipmapFilter: 'nearest',
            //maxAnisotropy: 10,
        }

        const atlas = await loadImage('./../img/inconsolata_regular_8x22.png');
        const size = { x: 8, y: 22 };

        const textImg = strToImage('Custom Text', atlas, size);

        points.setSampler('imageSampler', descriptor);
        await points.setTextureImage('textImg', textImg);

    },
    update: points => {
    }
}

export default base;