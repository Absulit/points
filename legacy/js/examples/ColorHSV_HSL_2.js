import RGBAColor, { RGBFromHSV } from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import Screen from '../screen.js';
import { print } from '../utils.js';

export default class ColorHSV_HSL_2 {
    /**
     * 
     * @param {Screen} screen 
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;


        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.load('/assets_ignore/absulit_800x800.jpg');
        //this._imageLoader.load('/assets_ignore/tucan_jcvp_800x800.jpg');
        this._imageLoader.type = ImageLoader.FIT;

        screen.layerIndex = 0;

        this._imageLoader.loadToLayer();

    }

    // in: r,g,b in [0,1], out: h in [0,360) and s,l in [0,1]
    rgb2hsl(r, g, b) {
        let v = Math.max(r, g, b), c = v - Math.min(r, g, b), f = (1 - Math.abs(v + v - c - 1));
        let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
        return [60 * (h < 0 ? h + 6 : h), f ? c / f : 0, (v + v - c) / 2];
    }
    // input: h as an angle in [0,360] and s,l in [0,1] - output: r,g,b in [0,1]
    hsl2rgb(h, s, l) {
        let a = s * Math.min(l, 1 - l);
        let f = (n, k = (n + h / 30) % 12) => l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return [f(0), f(8), f(4)];
    }

    // input: r,g,b in [0,1], out: h in [0,360) and s,v in [0,1]
    rgb2hsv(r, g, b) {
        let v = Math.max(r, g, b), c = v - Math.min(r, g, b);
        let h = c && ((v == r) ? (g - b) / c : ((v == g) ? 2 + (b - r) / c : 4 + (r - g) / c));
        return [60 * (h < 0 ? h + 6 : h), v && c / v, v];
    }

    // input: h in [0,1] and s,v in [0,1] - output: r,g,b in [0,1]
    hsv2rgb(h, s, v) {
        h = h * 360;
        let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
        return [f(5), f(3), f(1)];
    }

    update({ fnusin, sliders }) {

        const screen = this._screen;
        //screen.clear();

        screen.layerIndex = 0;

        this._imageLoader.loadToLayer();

        // screen.points.forEach(point => {
        //     const { x: nx, y: ny } = point.normalPosition;

        //     //const color = this.hsv2rgb(nx + fnusin(10), sliders.b, sliders.c);
        //     //point.setColor(color[0], color[1], color[2])
        //     const { r, g, b } = RGBAColor.fromHSV(.5 * nx * ny + fnusin(10), sliders.b, sliders.c);
        //     //const {r,g,b} = RGBFromHSV(.5 * nx * ny + fnusin(10), sliders.b, sliders.c);
        //     point.setColor(r, g, b)

        // });

        screen.points.forEach(point => {
            const { x: nx, y: ny } = point.normalPosition;

            point.modifyColor(color => {
                const { h, s, v } = color.toHSV();
                const { r, g, b } = RGBAColor.fromHSV(nx * .5 + h * fnusin(2), s, v);
                color.set(r, g, b);
            });
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
