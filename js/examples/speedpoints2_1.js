import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';

export default class SpeedPoints2_1 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.ONE_TO_ONE;
        //this._imageLoader.type = ImageLoader.FIT;
        this._imageLoader.load('../../assets_ignore/absulit_800x800.jpg');
    }

    update({ fusin, fnusin, fnucos, side }) {

        const screen = this._screen;
        //screen.clear();

        screen.layerIndex = 0;//--------------------------- LAYER 0
        if (this._imageLoader.isLoaded) {
            this._imageLoader.loadToLayer(205, 300, .25 * this._constant, .25 * this._constant,);
        }
        //this._imageLoader.loadToLayer();

        screen.layerIndex = 1;//--------------------------- LAYER 0
        screen.points.forEach((point, index) => {
            const { x: nx, y: ny } = point.normalPosition;
            // const b = fnucos(nx * nx * nx * ny * ny * 100);
            // const c = fnucos(nx*ny * 1000);
            // point.setColor((1 - c) * (1-ny), c * b * nx, nx*b );

            const centerClone = screen.center.clone();
            centerClone.x *= fusin(1.1556) * 2;

            const pointBelow = screen.getPointFromLayer(point, 0);
            const z = pointBelow.getBrightness();
            const zi = 1 - z;

            const d = MathUtil.distance(centerClone, point.coordinates) / side * z;
            const b = Math.sin(200 * nx * ny * d * z * (1 - nx) + fnusin(5) * 10 * zi);



            point.setColor(1 - nx * b, (ny * -b), 0);
            //point.setBrightness(Math.cos(d * fnucos(5)));
            //point.setBrightness(b);
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(60);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.001);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();
    }
}
