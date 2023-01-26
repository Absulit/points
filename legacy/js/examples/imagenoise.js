import WaveNoise from './wavenoise.js';
import RGBAColor from '../color.js';
class ImageNoise {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);
        this._wavenoise = new WaveNoise(screen);

        this._imageData;
        this._imageLoaded = false;

        let imageObj = new Image();
        imageObj.onload = e => {
            let canvas = document.createElement('canvas');
            let context = canvas.getContext('2d');
            let img = e.target;
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            let myData = context.getImageData(0, 0, img.width, img.height);
            console.log(myData);

            this._imageData = myData.data;
            //this._screen.points.forEach(this._assignImageToPoints);
            this._imageLoaded = true;
        };
        imageObj.src = '/img/old_king_100x100.jpg';


    }
    _assignImageToPoints = (point, index) => {
        let r = this._imageData[(4 * index) + 0] / 255;
        let g = this._imageData[(4 * index) + 1] / 255;
        let b = this._imageData[(4 * index) + 2] / 255;
        let a = this._imageData[(4 * index) + 3] / 255;

        point.setColor(r, g, b, a);
    }

    update(usin) {
        if (this._imageLoaded) {
            this._screen.points.forEach(this._assignImageToPoints);
            //this._wavenoise.scanLine2();
        }

        let amountNoise = Math.abs(1000 * usin) + 5000;
        for (let index = 0; index < amountNoise; index++) {
            let point = this._screen.getRandomPoint();
            //let point2 = this._screen.getRandomPoint();
            this._screen.movePointTo(point, point.coordinates.x, point.coordinates.y - 1, 3);
            //this._screen.movePointTo(point, point.coordinates.x+1, point.coordinates.y-2);
            //this._screen.movePointTo(point, point.coordinates.x+2, point.coordinates.y-3);
        }
        //screen.clearMix(clearMixColor, 1.01);

        this._wavenoise.scanLine2();
    }
}

export default ImageNoise;