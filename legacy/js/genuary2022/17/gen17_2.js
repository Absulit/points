import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';


export default class Gen17_2 {
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }*/
        /*if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);

        screen.layerIndex = 0;//--------------------------- LAYER 0

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.FIT;
        //this._imageLoader.load('../../img/old_king_600x600.jpg');
        //this._imageLoader.load('../../img/angel_600x600.jpg');
        this._imageLoader.load('../../img/gratia_800x800.jpg');
        //this._imageLoader.load('../../img/gioconda_300x300.jpg');
        //this._imageLoader.load('../../img/grace_hopper_512x600.jpg');
        //this._imageLoader.load('../../img/astronaut_512x512.jpg');
        //this._imageLoader.load('../../img/house_512x512.jpg');
        //this._imageLoader.load('../../img/carmen_lyra_423x643.jpg');

        this._palette1 = [
            new RGBAColor(0, 0, 0),
            new RGBAColor(.5, .5, .5),
            new RGBAColor(1, 1, 1),
        ];

        this._palette2 = [
            new RGBAColor(255, 69, 0),
            new RGBAColor(255, 168, 0),
            new RGBAColor(255, 214, 53),
            new RGBAColor(0, 204, 120),
            new RGBAColor(126, 237, 86),
            new RGBAColor(0, 117, 111),
            new RGBAColor(0, 158, 170),
            new RGBAColor(36, 80, 164),
            new RGBAColor(54, 144, 234),
            new RGBAColor(81, 233, 244),
            new RGBAColor(73, 58, 193),
            new RGBAColor(106, 92, 255),
            new RGBAColor(129, 30, 159),
            new RGBAColor(180, 74, 192),
            new RGBAColor(255, 56, 129),
            new RGBAColor(255, 153, 170),
            new RGBAColor(109, 72, 48),
            new RGBAColor(156, 105, 38),
            new RGBAColor(0, 0, 0),
            new RGBAColor(137, 141, 144),
            new RGBAColor(212, 215, 217),
            //new RGBAColor(1, 1, 1),
        ];

        this._palette3 = [
            new RGBAColor(1, 0, .1),
            new RGBAColor(1, .5, 0),
            new RGBAColor(0, 0, 0),
        ];

        this._palette4 = [
            new RGBAColor(0, 0, 0),
            new RGBAColor(0, 1, 0),
            new RGBAColor(1, 0, 0),
            new RGBAColor(0, 0, 1),
            new RGBAColor(1, 1, 1),
        ];

        this._palette = this._palette3;

        this._imageParsed = false;


        // d( 0), d(48), d(12), d(60), d( 3), d(51), d(15), d(63),
        // d(32), d(16), d(44), d(28), d(35), d(19), d(47), d(31),
        // d( 8), d(56), d( 4), d(52), d(11), d(59), d( 7), d(55),
        // d(40), d(24), d(36), d(20), d(43), d(27), d(39), d(23),
        // d( 2), d(50), d(14), d(62), d( 1), d(49), d(13), d(61),
        // d(34), d(18), d(46), d(30), d(33), d(17), d(45), d(29),
        // d(10), d(58), d( 6), d(54), d( 9), d(57), d( 5), d(53),
        // d(42), d(26), d(38), d(22), d(41), d(25), d(37), d(21)

        this._threshold_map1 = [
            [1, 9, 3, 11],
            [13, 5, 15, 7],
            [4, 12, 2, 10],
            [16, 8, 14, 6]
        ];

        this._threshold_map2 = [
            [0, 48, 12, 60, 3, 51, 15, 63],
            [32, 16, 44, 28, 35, 19, 47, 31],
            [8, 56, 4, 52, 11, 59, 7, 55],
            [40, 24, 36, 2043, 27, 39, 23],
            [2, 50, 14, 62, 1, 49, 13, 61],
            [34, 18, 46, 30, 33, 17, 45, 29],
            [10, 58, 6, 54, 9, 57, 5, 53],
            [42, 26, 22, 41, 25, 37, 21]
        ]


        this._threshold_map = this._threshold_map1;


        screen.layerIndex = 1;//--------------------------- LAYER 1
        //screen.points.forEach(point => point.setColor(0, 0, 0));
    }


    update({usin, ucos, side, utime, nusin}) {
        const screen = this._screen;

        screen.layerIndex = 0;//--------------------------- LAYER 0

        //if (!this._imageParsed && this._imageLoader.isLoaded) {
            this._imageLoader.loadToLayer();

            const squareSide = 3;
            //const squareSide = 3;
            //const squareSide = 4;
            //const squareSide = 5;
            //const squareSide = 6;

            //------------------------------- Closest color from palette
            // screen.points.forEach(point => {
            //     if (point.color.r) {
            //         const closestColor = this.getClosestColorInPalette(point.color);
            //         point.setRGBAColor(closestColor);
            //     }
            // });

            //------------------------------- CUSTOM DITHERING
            // for (let cIndex = 0; cIndex < screen.numColumns; cIndex += squareSide) {
            //     for (let rowIndex = 0; rowIndex < screen.numRows; rowIndex += squareSide) {
            //         const point = screen.getPointAt(cIndex, rowIndex);
            //         const points = screen.getPointsArea(cIndex, rowIndex, cIndex + squareSide, rowIndex + squareSide)

            //         let averageBrightness = 0;
            //         points.forEach(point => averageBrightness += point.getBrightness());
            //         averageBrightness /= points.length;

            //         const amountOfPixels = Math.floor(averageBrightness * points.length);

            //         points.forEach(point => point.setBrightness(0));

            //         let pointIndex;
            //         for (pointIndex = 0; pointIndex < amountOfPixels; pointIndex++) {
            //             const point = points[pointIndex];
            //             point.setBrightness(1);
            //         }
            //     }
            // }

            //------------------------------- CUSTOM DITHERING 2
            // for (let cIndex = 0; cIndex < screen.numColumns; cIndex += squareSide) {
            //     for (let rowIndex = 0; rowIndex < screen.numRows; rowIndex += squareSide) {
            //         const point = screen.getPointAt(cIndex, rowIndex);
            //         const points = screen.getPointsArea(cIndex, rowIndex, cIndex + squareSide, rowIndex + squareSide)
            //         let colors =  points.map(point => point.color );
            //         const averageColor =  RGBAColor.average(colors);
            //         const closestColor = this.getClosestColorInPalette(averageColor);
            //         points.forEach(point => point.setRGBAColor(closestColor));
            //     }
            // }
            //------------------------------- CUSTOM DITHERING 3
            // for (let cIndex = 0; cIndex < screen.numColumns; cIndex += 1) {
            //     for (let rowIndex = 0; rowIndex < screen.numRows; rowIndex += 1) {
            //         const point = screen.getPointAt(cIndex, rowIndex);
            //         //const points = screen.getPointsArea(cIndex, rowIndex, cIndex + squareSide, rowIndex + squareSide)
            //         //const points = screen.getPointsAround(point, Math.ceil(5 * usin));
            //         const points = screen.getPointsAround(point, 1);
            //         let colors =  points.filter(point => point).map(point => point.color );
            //         const averageColor =  RGBAColor.average(colors);
            //         const averageColor2 = RGBAColor.average([averageColor, point.color]);
            //         const closestColor = this.getClosestColorInPalette(averageColor2);


            //         //point.setRGBAColor(closestColor);
            //         const pointAbove = screen.getPointFromLayer(point, 1);
            //         pointAbove.setRGBAColor(closestColor);
            //     }
            // }
            //------------------------------- CUSTOM DITHERING 4
            //https://stackoverflow.com/questions/15149290/ordered-dithering-to-256-colours
            // large threshold_map https://bisqwit.iki.fi/story/howto/dither/jy/
            const depth = Math.abs(Math.ceil(68 * nusin));

            //console.log(depth);
            this._effects.orderedDithering(depth);

            //screen.layerIndex = 2;//--------------------------- LAYER 0
            screen.points.forEach(point => {
                point.setRGBAColor(RGBAColor.getClosestColorInPalette(point.color, this._palette))
            });

            this._imageParsed = true;
        //}


        //screen.layerIndex = 1;//--------------------------- LAYER 1


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.1);
    }

    getClosestColorInPalette(c1) {
        let distance = 100;
        let selectedColor = null;
        this._palette.forEach(color => {
            let currentDistance = this.colorRGBEuclideanDistance(c1, color);
            if (currentDistance < distance) {
                selectedColor = color;
                distance = currentDistance;
            }
        })
        return selectedColor;
    }

    getClosestColorInPaletteAndDistance(c1, prevDistance = null) {
        let distance = 2;
        let selectedColor = null;
        this._palette.forEach(color => {
            let currentDistance = this.colorRGBEuclideanDistance(c1, color) + (prevDistance || 0);
            if (currentDistance < distance) {
                selectedColor = color;
                distance = currentDistance;
            }
        })
        return { color: selectedColor, distance: distance };
    }

    colorRGBEuclideanDistance(c1, c2) {
        return Math.sqrt(Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2));
    }
}
