class ImageLoader {
    constructor(screen) {
        this._screen = screen;
        this._image = new Image();
        this._imageData;
        this._image.onload = this._onLoadImage;
        this._imageLoaded = false;

        this._width = 0;
        this._height = 0;
    }

    load(path) {
        this._image.src = path;
    }

    _onLoadImage = e => {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let img = e.target;
        this._width = canvas.width = img.width;
        this._height = canvas.height = img.height;
        context.drawImage(img, 0, 0);
        let imageData = context.getImageData(0, 0, img.width, img.height);
        console.log(imageData);

        this._imageData = imageData.data;
        //this._screen.points.forEach(this._assignImageToPoints);
        //this._onCompleteImage();
        this._imageLoaded = true;
    }


    _onCompleteImage = () => {
        this._screen.points.forEach(this._assignImageToPoints);
    }

    _assignImageToPoints = (point, index) => {
        let x = Math.round(this._width / this._screen.numColumns);
        let y = Math.round(this._height / this._screen.numRows);
        let pointX = point.coordinates.x;
        let pointY = point.coordinates.y;

        let rowWidth = 4 * this._width;

        // we select the row (pointY * rowWidth * y) 
        // we displace ourselves in the row (pointX * x * 4)
        // the 4 is the amount of data per pixel: rgba
        let pixelJump = ((pointY * rowWidth * y) + (pointX * x * 4));

        let r = this._imageData[pixelJump + 0] / 255;
        let g = this._imageData[pixelJump + 1] / 255;
        let b = this._imageData[pixelJump + 2] / 255;
        let a = this._imageData[pixelJump + 3] / 255;

        point.setColor(r, g, b, a);
    }

    loadToLayer() {
        if (this._imageLoaded) {
            this._screen.points.forEach(this._assignImageToPoints);
        }
    }
}

export default ImageLoader;
