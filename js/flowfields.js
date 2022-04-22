import Coordinate from './coordinate.js';
import RGBAColor from './color.js';
import MathUtil from './mathutil.js';

export default class FlowFields {
    /**
     *
     * @param {Screen} screen
     * @param {Number} lineAmount number of lines that will be created per update, usually connected to the previous iteration.
     */
    constructor(screen, lineAmount) {
        this._screen = screen;
        const side = screen.numColumns;

        this._startPositions = []
        for (let index = 0; index < lineAmount; index++) {
            const x = Math.floor(screen.numColumns * Math.random());
            const y = Math.floor(screen.numColumns * Math.random());
            const startPosition = {
                position: new Coordinate(x, y),
                prevPoint: null
            };
            this._startPositions.push(startPosition);
        }

        this._initCalled = false;

        this._numSteps = 10;
        this._stepLength = 10;
        this._radians = Math.PI * 2;
    }

    get numSteps() {
        return this._numSteps;
    }

    set numSteps(value) {
        this._numSteps = value;
    }

    get stepLength() {
        return this._stepLength;
    }

    set stepLength(value) {
        this._stepLength = value;
    }

    get radians(){
        return this._radians;
    }

    set radians(value){
        this._radians = value;
    }

    /**
     * Initializes the angles to be used when the curves are drawn.
     * @param {Layer} screenLayer Layer to retrieve the brightness data from
     */
    init(screenLayer) {
        this._screen.currentLayer.points.forEach((point, index) => {
            point.angle = screenLayer.points[index].getBrightness();
        });
        this._initCalled = true;
    }

    /**
     * Draws a bit of the flow field curve
     * @param {Function} callback Function called per flow field point
     */
    update(callback) {
        if (!this._initCalled) {
            throw ('`init()` should be called prior the call of `update()`.')
        }

        this._startPositions.forEach(startPosition => {
            this.drawCurve(startPosition, this._numSteps, this._stepLength, callback);
            //this.drawCurve(startPosition, 10, 100, callback);
        });
    }

    drawCurve(startPosition, numSteps, stepLength = 10, callback = null) {
        const { x, y } = startPosition.position;
        let point = null;
        for (let index = 0; index < numSteps; index++) {

            point = this._screen.getPointAt(x, y);
            if (callback) {
                callback(point);
            }
            if (point) {
                const mathPoint = MathUtil.polar(stepLength, point.angle * this._radians);
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