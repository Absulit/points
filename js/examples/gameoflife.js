import RGBAColor from '../color.js';
import Effects from '../effects.js';
export default class GameOfLife {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);


        this._effects = new Effects(screen);

        this._lastPoint = null;

        screen.layerIndex = 0;
        for (let i = 0; i < 2000 * (screen.numRows / 100); i++) {
            let point = screen.getRandomPoint();
            //point.count = point.coordinates.x;
            point.alive = true;
        }



    };

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;
        //screen.getRandomPoint().setColor(1,0,0, .5);
        screen.currentLayer.points.forEach((point, index) => {
            const pointAbove = screen.layers[1].points[index];
            pointAbove.alive = point.alive;
            point.alive = false;
        });


        screen.layerIndex = 1;
        screen.clear();
        //screen.getRandomPoint().setColor(1, 1, 1, .1);

        //screen.clearMix(new RGBAColor(0, 0, 0), 1.5);
        //console.log(screen.currentLayer.points);
        //debugger;
        screen.currentLayer.points.forEach((point, index) => {
            // do something to every point
            // or every p.modified point
            /*if (Math.round(index % usin) == 0) {
                point.setBrightness(1);
                //point.addColor(new RGBAColor(1,0,0,.1));
                screen.movePointTo(point, point.coordinates.x + 1, point.coordinates.y);

            }*/

            /*if (point.alive) {
                point.setBrightness(1);
                point.count = point.count || 0;
                let x = 1, y = 1;
                if (point.count++ % 2 == 0) {
                    x = 2;
                    y = -1;
                }else{
                    x = -1;
                    y = 0;
                }

                if (point.count % 3 == 0) {
                    x = -2;
                    y = 10;
                }

                if (point.count % 5 == 0) {
                    x = 2;
                    y = 2;
                }
                if(point.count % 100 == 0){
                    y = -1;
                }
                let newPoint = screen.movePointTo(point, point.coordinates.x  + x, point.coordinates.y + y);
                if(newPoint){
                    newPoint.alive = true;
                    newPoint.count = point.count;
                }else{
                    newPoint = screen.getRandomPoint();
                    newPoint.alive = true;
                }
                point.alive = false;
                point.count = null;
            }*/

            const pointBelow = screen.getPointFromLayerAt(point.coordinates.x, point.coordinates.y, 0);

            let aliveCounter = 0;
            let pointsAround = screen.getPointsAround(point);
            pointsAround.forEach(pointAround => {
                if (pointAround) {
                    if (pointAround.alive) {
                        ++aliveCounter;
                    }
                }
            });
            if (point.alive) {
                point.setColor(1,1,1);
                //const condition1 = aliveCounter < 2;
                //const condition2 = aliveCounter > 3
                //point.alive = !(condition1 || condition2);
                //point.alive = (aliveCounter == 2) || (aliveCounter == 3);
                pointBelow.alive = (aliveCounter == 2) || (aliveCounter == 3)
            } else {
                point.setColor(0,0,0);
                //point.alive = aliveCounter == 3;
                pointBelow.alive = aliveCounter == 3;
            }


        });
        //screen.clear();
        //this._screen.clearMix(new RGBAColor(0, 0, 0), 1.001);
        //this._effects.fire(2);
        //this._effects.chromaticAberration(.05, 2);
        //this._effects.soften3();
        //this._effects.antialias();
    }
}
