import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';
import Types from './types.js';

// applied from https://generativeartistry.com/tutorials/circle-packing/

export default class Gen15 {
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
        if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        /*if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;

        screen.layerIndex = 0;//--------------------------- LAYER 0




        screen.layerIndex = 1;//--------------------------- LAYER 1




        // checkered
        // screen.points.forEach(point => {
        //     const isOddX = point.coordinates.x % 2;
        //     const isOddY = point.coordinates.y % 2;

        //     if(isOddX){
        //         if(isOddY){
        //             point.setBrightness(1);
        //         }
        //     }else{
        //         point.setBrightness(1);
        //         if(isOddY){
        //             point.setBrightness(0);
        //         }
        //     }
        // });

        // let point = screen.getPointAt(10, 10);
        // point.type = 'water';
        // point.direction = new Coordinate(0, 1, 0);

        this._colorPalette = [
            new RGBAColor(244 / 255, 164 / 255, 96 / 255),
            new RGBAColor(225 / 255, 169 / 255, 95 / 255),
            new RGBAColor(194 / 255, 178 / 255, 128 / 255),
            new RGBAColor(193 / 255, 154 / 255, 107 / 255),
            new RGBAColor(150 / 255, 113 / 255, 23 / 255),
            new RGBAColor(108 / 255, 84 / 255, 30 / 255),
        ]

        this._pointIndex = 0;



    }


    update(usin, ucos, side, utime) {
        const screen = this._screen;


        screen.layerIndex = 0;//--------------------------- LAYER 0

        if (Math.random() > .8) {

            let point = screen.getPointAt(this._screen.center.x, 10);
            point.type = Types.WATER;
            point.direction = new Coordinate(0, 0, 0);
            point.c = this._colorPalette[Math.floor(Math.random() * this._colorPalette.length)];
        }

        screen.points.forEach((point, index) => {
            const pointAbove = screen.layers[1].points[index];

            pointAbove.type = point.type;
            pointAbove.direction = point.direction;
            pointAbove.c = point.c;

            point.type = null;
            point.direction = null;
        });

        screen.layerIndex = 1;//--------------------------- LAYER 1
        //screen.clear();


        const squareSide = 10;
        for (let i = 0; i < squareSide; i++) {
            for (let j = 0; j < squareSide; j++) {
                const point = screen.getPointAt(i + this._screen.center.x - squareSide * .5, j + this._screen.center.y - squareSide * .5);
                point.type = Types.STONE;
            }
        }

        for (let i = 0; i < squareSide; i++) {
            for (let j = 0; j < squareSide; j++) {
                const point = screen.getPointAt(i + this._screen.center.x - squareSide * .5 + squareSide - 5, j + this._screen.center.y - squareSide * .5 + squareSide*2);
                point.type = Types.STONE;
            }
        }





        //-------------- border
        for (let index = 0; index < screen.numColumns; index++) {
            const point = screen.getPointAt(index, screen.numRows - 1);
            if (point) {
                point.type = Types.STONE;

            }
        }

        for (let index = 0; index < screen.numRows; index++) {
            let point = screen.getPointAt(screen.numColumns - 1, index);
            if (point) {
                point.type = Types.STONE;
            }

            point = screen.getPointAt(0, index);
            if (point) {
                point.type = Types.STONE;
            }
        }




        //-------------- border





        screen.points.forEach((point, index) => {
            const point0 = screen.layers[0].points[index];
            point0.direction = point0.direction || new Coordinate(0, 0, 0);

            //point.setColor(0,0,0);
            if (point.type == Types.WATER) {
                //point.setColor(0, 0, 1);
                if (point.c) {
                    point.setColor(point.c.r, point.c.g, point.c.b)
                    //point.color = point.c
                }

                const nextPoint = screen.getPointAt(point.coordinates.x + point.direction.x, point.coordinates.y + point.direction.y + 1);

                if (nextPoint) {
                    if (nextPoint.type == Types.STONE) {
                        //screen.getPointFromLayer()
                        point0.direction.x = Math.random() > .5 ? 1 : -1;
                        //point0.direction.x = Math.random() > .5 ? Math.ceil(4* Math.random()) : Math.ceil(-4* Math.random());
                        point0.direction.y = 0;
                        point0.type = point.type;
                        point0.c = point.c;
                    } else if (nextPoint.type == Types.WATER) {
                        point0.direction.x = Math.random() > .5 ? 1 : -1;
                        //point0.direction.x = Math.random() > .5 ? Math.ceil(4* Math.random()) : Math.ceil(-4* Math.random());
                        point0.direction.y = 0;
                        point0.type = point.type;
                        point0.c = point.c;
                    } else {
                        const nextPoint0 = screen.getPointFromLayer(nextPoint, 0);
                        //nextPoint0.direction = point.direction;
                        nextPoint0.direction = new Coordinate(0, 0, 0);
                        nextPoint0.type = point.type;
                        nextPoint0.c = point.c;
                    }
                }


            } else if (point.type == Types.STONE) {
                point.setColor(.1, .1, .1);
            }
        });


        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(3);
        //this._effects.antialias(3);
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.1);
    }

}
