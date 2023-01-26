import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';

export default class Noise2_1 {
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
        this._imageLoader.load('../../img/noiseTexture.png');
        //this._imageLoader.load('../../img/noiseTexture2.png');
        //this._imageLoader.load('../../img/carmen_lyra_800x800.jpg');


        this._imageLoader2 = new ImageLoader(screen);
        this._imageLoader2.type = ImageLoader.FIT;
        //this._imageLoader2.load('../../assets_ignore/absulit_800x800.jpg');
        this._imageLoader2.load('../../assets_ignore/sunset_800x800_20220604_173907.jpg');

        screen.layerIndex = 2;//--------------------------- LAYER 2
        screen.clear(this._clearMixColor);


        this._coordinates = Array(2500 * this._constant).fill(screen.getRandomPoint().coordinates);
        this._coordinateIndex = 0;
    }

    update({ fnucos, fnusin, fusin, side, fnsin }) {
        //debugger
        const screen = this._screen;
        //screen.clear();

        screen.layerIndex = 0;//--------------------------- LAYER 0
        //this._imageLoader.loadToLayer();

        screen.points.forEach(point => {
            const d = Math.sin(MathUtil.angle(point.coordinates, screen.center) * Math.PI * 2 * fusin(.5) /** 50 + 10 * fnusin(.57)*/);
            point.setBrightness(d);
        });


        screen.layerIndex = 1;//--------------------------- LAYER 1

        // screen.points.forEach(point => {
        //     const { x: nx, y: ny } = point.normalPosition;
        //     point.setColor(nx, ny, 1 - nx);
        // });

        //this._imageLoader2.loadToLayer();

        screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.points.forEach(point => point.setColor(0, 0, 0, 1));
        screen.layerIndex = 3;//--------------------------- LAYER 3
        //screen.clear();

        this._coordinates.forEach(c => {
        //if(this._coordinateIndex < this._coordinates.length){

        
            //let c = this._coordinates[this._coordinateIndex];
            const p = screen.getPointAt(c.x, c.y);
            if (p) {
                //p.setBrightness(1);

                const point0 = screen.getPointFromLayer(p, 0);
                const angle = point0.getBrightness() * Math.PI * 2 + Math.PI * fnusin(.5);

                const newCoordinate = MathUtil.polar(5 + 4 * fnusin(.3), angle);

                const newPoint = screen.getPointAt(Math.floor(p.coordinates.x + newCoordinate.x), Math.floor(p.coordinates.y + newCoordinate.y));

                if (newPoint) {
                    const { x: nx, y: ny } = newPoint.normalPosition;
                    c.x = newPoint.coordinates.x;
                    c.y = newPoint.coordinates.y;
                    p.setColor(ny, nx, 1-ny);

                    screen.drawLineWithPoints(p, newPoint);
                } else {
                    const randomPoint = screen.getRandomPoint();
                    c.x = randomPoint.coordinates.x;
                    c.y = randomPoint.coordinates.y;
                }
            }
            //++this._coordinateIndex;
            //debugger
        // }else{
        //     this._coordinateIndex = 0;
        // }
        });


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(100);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
        //this._effects.orderedDithering();



    }
}
