import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import Screen from '../screen.js';

export default class Noise1_2 {
    /**
     * 
     * @param {Screen} screen 
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor();

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        const side = screen.numColumns;

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.FIT;
        //this._imageLoader.load('../../assets_ignore/absulit_800x800.jpg');
        //this._imageLoader.load('../../assets_ignore/pmw_800x800.jpg');
        //this._imageLoader.load('../../assets_ignore/tucan_jcvp_800x800.jpg');
        //this._imageLoader.load('../../img/noiseTexture.png');
        this._imageLoader.load('../../img/noiseTexture2.png');
        //this._imageLoader.load('../../img/carmen_lyra_800x800.jpg');


        this._imageLoader2 = new ImageLoader(screen);
        this._imageLoader2.type = ImageLoader.FIT;
        //this._imageLoader2.load('../../assets_ignore/absulit_800x800.jpg');
        this._imageLoader2.load('../../assets_ignore/sunset_800x800_20220604_173907.jpg');

        screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.clear();
        //screen.points.forEach(point => point.setColor(0, 0, 0, 1));
        screen.points.forEach(point => point.modifyColor(color => color.set(0, 0, 0, 1)));
    }

    update({ fnucos, fnusin, fusin, side, fnsin, utime }) {

        const screen = this._screen;
        screen.clear();

        screen.layerIndex = 0;//--------------------------- LAYER 0
        //this._imageLoader.loadToLayer();

        // screen.points.forEach(point => {
        //     const d = Math.sin(MathUtil.distance(point.coordinates, screen.center) / side /** 50 + 10 * fnusin(.57)*/);
        //     point.setBrightness(d);
        // });
        screen.points.forEach(point => {
            const { x: nx, y: ny } = point.normalPosition;

            const wave = Math.sin(point.coordinates.y * .2 / this._constant + utime);
            //const wave = Math.sin(point.coordinates.y + point.coordinates.x);


            //const b = Math.sin(point.coordinates.x * .5) * wave;
            //const b = Math.sin(point.coordinates.x * .5 + wave) * wave;
            const b = Math.sin(point.coordinates.x * .5 / this._constant + wave * fusin(1));


            //point.setBrightness(b);
            point.modifyColor(color => color.brightness = b);
            //point.setColor(b * ny, wave * nx, 0);
        });


        screen.layerIndex = 1;//--------------------------- LAYER 1

        screen.points.forEach(point => {
            const { x: nx, y: ny } = point.normalPosition;
            //point.setColor(nx, ny, 1 - nx);
            point.modifyColor(color => color.set(nx, ny, 1 - nx));
        });

        //this._imageLoader2.loadToLayer();

        screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.points.forEach(point => point.setColor(0, 0, 0, 1));
        screen.layerIndex = 3;//--------------------------- LAYER 3
        //screen.clear();
        screen.points.forEach(point => {
            //const { x: nx, y: ny } = point.normalPosition;

            const point0 = screen.getPointFromLayer(point, 0);
            const point1 = screen.getPointFromLayer(point, 1);

            const angle = point0.color.brightness * Math.PI * 2 + 2 * fusin(.98);

            const newCoordinate = MathUtil.polar(5 * this._constant + 5 * fnusin(.56) * this._constant, angle);
            const newPoint = screen.getPointAt(Math.floor(point.coordinates.x + newCoordinate.x), Math.floor(point.coordinates.y + newCoordinate.y));

            if (newPoint) {
                //newPoint.setRGBAColor(point1.color);
                newPoint.modifyColor(color => {
                    //color.setColor(point1.color);
                    //color.add(point1.color);
                    //color.blend(point1.color);
                    //color.additive(point1.color);

                    color.setColor(RGBAColor.average([color, point1.color]));
                });
            }
        });

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(100);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.01);
        //this._screen.clearAlpha(1.001);
        //this._effects.orderedDithering();



    }
}
