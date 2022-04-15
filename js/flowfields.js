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

        this._initCalled = false;
    }

    /**
     * Initializes the angles to be used when the curves are drawn.
     * @param {Layer} screenLayer Layer to retrieve the brightness data from
     */
    init(screenLayer){
        this._screen.currentLayer.points.forEach((point, index) => {
            point.angle = screenLayer.points[index].getBrightness() * Math.PI * 2;
        });
        this._initCalled = true;
    }

    update(){
        if(!this._initCalled){
            throw('`init()` should be called prior the call of `update()`.')
        }
        this._startPositions.forEach(startPosition => {
            this.drawCurve(startPosition, 10, 10);
        });
    }

    drawCurve(startPosition, numSteps, stepLength = 10) {
        const { x, y } = startPosition.position;
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