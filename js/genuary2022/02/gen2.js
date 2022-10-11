import RGBAColor from '../../color.js';
import ImageLoader from '../../imageloader.js';

export default class Gen2 {
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

        this._imageLoader = new ImageLoader(screen);
        this._imageLoader.type = ImageLoader.FIT;
        this._imageLoader.load('../../img/angel_600x600.jpg');
    }

    find_closest_palette_color(brightness) {
        return brightness > 0.5 ? 1.0 : 0.0
        //return brightness + (Math.random() - 0.5)  > 0.5  ? 1.0  : 0.0
    }

    update(usin, ucos, side, utime) {
        const screen = this._screen
        this._imageLoader.loadToLayer();

        screen.points.forEach(point => {
            /*point.tempR = point.tempR || point.color.r;
            let brightness = point.tempR + (Math.random() - 0.5) > 0.5  ? 1.0  : 0.0
            brightness = brightness > Math.random()  ? 1.0  : 0.0*/
            const { r, g, b } = point.color;
            const brightness = 0.3 * r + 0.59 * b + 0.11 * g
            const originalBrighness = brightness;
            const newBrightness = this.find_closest_palette_color(originalBrighness);
            const quant_error = originalBrighness - newBrightness;

            point.modifyColor(color => color.brightness = newBrightness);
            //const pointsAround = screen.getPointsAround(point);
            let columnIndex = point.coordinates.x;
            let rowIndex = point.coordinates.y;
            let distance = 1
            const rightPoint = screen.getPointAt(columnIndex + distance, rowIndex);
            const bottomPoint = screen.getPointAt(columnIndex, rowIndex + distance);
            //const bottomRightPoint = screen.getPointAt(columnIndex + distance, rowIndex + distance);

            rightPoint && rightPoint.modifyColor(color => color.brightness = rightPoint.color.brightness + (.5 * quant_error));
            bottomPoint && bottomPoint.modifyColor(color => color.brightness = bottomPoint.color.brightness + (.5 * quant_error));
            /*if(bottomRightPoint){
                bottomRightPoint.setBrightness(bottomRightPoint.getBrightness() ));
            }*/



        });
    }
}
