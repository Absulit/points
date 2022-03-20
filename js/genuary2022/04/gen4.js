import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import MathUtil from '../../mathutil.js';

export default class Gen4 {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }*/

        this._constant = screen.numColumns / 100;

        this._startPositions = []
        for (let index = 0; index < 1000; index++) {
            const x = Math.floor(screen.numColumns * Math.random());
            const y = Math.floor(screen.numColumns * Math.random());
            const startPosition = {
                position: new Coordinate(x, y),
                color: new RGBAColor(Math.random(), Math.random(), 0),
                prevPoint: null
            }
            ;
            this._startPositions.push(startPosition);
        }


        this._left_x = screen.numColumns * -0.5;
        this._right_x = screen.numColumns * 1.5;
        this._top_y = screen.numRows * -0.5;
        this._bottom_y = screen.numRows * 1.5;

        this._resolution = Math.floor(screen.numColumns * 0.01)

        screen.points.forEach(point => {
            point.angle = (point.position.x / screen.numColumns) * Math.PI ;
        });
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen

        this._startPositions.forEach(startPosition => {
            this.drawCurve(startPosition, 1, 10);
        });

    }

    drawCurve(startPosition, numSteps, stepLength = 10) {
        let { x, y } = startPosition.position;
        let point = null;
        for (let index = 0; index < numSteps; index++) {

            // let x_offset = x - left_x
            // let y_offset = y - top_y
            // let column_index = int(x_offset / resolution)
            // let row_index = int(y_offset / resolution)

            point = this._screen.getPointAt(x, y);
            if(point){
                //point.setBrightness(1);
                point.color = startPosition.color;
                const mathPoint = MathUtil.polar(stepLength, point.angle);
                startPosition.position.x = Math.floor(mathPoint.x + x);
                startPosition.position.y = Math.floor(mathPoint.y + y);

                if(startPosition.prevPoint){
                    this._screen.drawLineWithPoints(startPosition.prevPoint, point);
                }
                startPosition.prevPoint = point;
            }
        }
    }
}
