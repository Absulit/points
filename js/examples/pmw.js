import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';

class PMW {
    constructor(screen) {
        this._screen = screen;
        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.load('/assets_ignore/pmw_800x800.jpg');

        this._effects = new Effects(screen);

        this._constant = (screen.numColumns/100);
    }
    update(usin, ucos) {
        this._imageLoader.type = this._imageLoader.FIT;
        this._imageLoader.loadToLayer();

        this._effects.scanLine(this._constant * 3);
        this._effects.fire(this._constant * 2);
        this._effects.chromaticAberration(.01, 2);
        this._effects.antialias2();
    }
}

export default PMW;
