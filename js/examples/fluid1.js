import RGBAColor from '../color.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
export default class Fluid1 {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.load('/img/old_king_100x100.jpg');

        this._effects = new Effects(screen);
    };

    update(u_time) {
        const screen = this._screen;
        screen.layerIndex = 0;

        this._imageLoader.loadToLayer();


        screen.layerIndex = 1;
        const level = 1;
        this._imageLoader.loadToLayer();
        let distance = 1;
        screen.currentLayer.shufflePoints();
        screen.currentLayer.shuffledPoints.forEach((point, index) => {
            let brightness = point.getBrightness();
            //point.setBrightness(brightness);
            let pointTo = null;
            if (brightness > .8) {
                pointTo = screen.getPointAt(point.coordinates.x + 1, point.coordinates.y);
            } else if (brightness > .4) {
                pointTo = screen.getPointAt(point.coordinates.x - 1, point.coordinates.y);
            } else {
                pointTo = screen.getPointAt(point.coordinates.x, point.coordinates.y - 1);
            }
            if (pointTo) {
                screen.movePointTo(point, pointTo.coordinates.x, pointTo.coordinates.y);
            }
        });

        //this._effects.chromaticAberration(.1, 1);
        //this._effects.antialias2();
        //this._effects.soften3();
        //screen.clearMix(new RGBAColor(0,0,0), 1.1);
    }
}
