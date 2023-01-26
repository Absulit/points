import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import MathUtil from '../../mathutil.js';

export default class Gen4_1 {
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

        const side = screen.numColumns;
        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ', this._constant);

        this._startPositions = []
        for (let index = 0; index < (1000 * this._constant); index++) {
            const x = Math.floor(screen.numColumns * Math.random());
            const y = Math.floor(screen.numColumns * Math.random());
            const startPosition = {
                position: new Coordinate(x, y),
                color: new RGBAColor(x/side, y/side, y/side),
                prevPoint: null
            };
            this._startPositions.push(startPosition);
        }

        screen.layerIndex = 0;//--------------------------- LAYER 0
        this._randomPoints = [];
        for (let index = 0; index < (40 * this._constant); index++) {
            this._randomPoints.push(screen.getRandomPoint());
        }
        //console.log('---- this._randomPoints: ', this._randomPoints);
        this._randomPoints.forEach(randomPoint => {
            //randomPoint.setBrightness(1);
            const {x,y} = randomPoint.coordinates;
            screen.drawFilledSquare(x,y, 10 * this._constant, 1,1,1);
        });

        for (let index = 0; index < 6; index++) {
            this._effects.soften2(4, 2.5 * this._constant);
            //this._effects.soften2(16/this._constant, 2.5 * this._constant);
        }

        screen.layerIndex = 2;//--------------------------- LAYER 1
        screen.points.forEach((point, index) => {
            point.modifyColor(color => color.brightness = 0);
        });


        screen.layerIndex = 2;//--------------------------- LAYER 2
        screen.points.forEach((point, index) => {
            //point.angle = (point.position.x / screen.numColumns) * Math.PI;
            point.angle = screen.layers[0].points[index].color.brightness * Math.PI * 4;
        });
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen

        screen.layerIndex = 2;//--------------------------- LAYER 2
        this._startPositions.forEach(startPosition => {
            this.drawCurve(startPosition, 10, 10);
        });
        //this._effects.antialias();
        //this._effects.soften3(3);
        this._screen.clearMix(this._clearMixColor, 1.001);
    }

    drawCurve(startPosition, numSteps, stepLength = 10) {
        let { x, y } = startPosition.position;
        let point = null;
        for (let index = 0; index < numSteps; index++) {

            point = this._screen.getPointAt(x, y);
            if (point) {
                point.color = startPosition.color;
                const mathPoint = MathUtil.polar(stepLength, point.angle);
                startPosition.position.x = Math.floor(mathPoint.x + x);
                startPosition.position.y = Math.floor(mathPoint.y + y);

                if (startPosition.prevPoint) {
                    this._screen.drawLineWithPoints(startPosition.prevPoint, point);
                }
                startPosition.prevPoint = point;
            }
        }
    }

    createPosition(){
        const x = Math.floor(this._screen.numColumns * Math.random());
        const y = Math.floor(this._screen.numColumns * Math.random());
        const side = this._screen.numColumns;
        const startPosition = {
            position: new Coordinate(x, y),
            color: new RGBAColor(x/side, y/side, y/side),
            prevPoint: null
        };
        return startPosition;
    }

}
