import Coordinate from './coordinate.js';
import RGBAColor from './color.js';
import MathUtil from './mathutil.js';

export default class FlowFields {
    constructor(screen) {
        this._screen = screen;
        this._constant = screen.numColumns / 100;
        const side = screen.numColumns;

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


        //this.init();
    }

    init(screenLayer){
        this._screen.currentLayer.points.forEach((point, index) => {
            //point.angle = (point.position.x / this._screen.numColumns) * Math.PI;
            //point.angle = this._screen.layers[0].points[index].getBrightness() * Math.PI * 2;
            point.angle = screenLayer.points[index].getBrightness() * Math.PI * 2;
        });
    }

    update(){
        this._startPositions.forEach(startPosition => {
            this.drawCurve(startPosition, 10, 10);
        });
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

}