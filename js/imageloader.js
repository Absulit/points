class ImageLoader {
    constructor(screen) {
        this._screen = screen;
        this._image = new Image();
        this._imageData;
        this._image.onload = this._onLoadImage;
        this._imageLoaded = false;
    }

    load(path) {
        this._image.src = path;
    }

    _onLoadImage = e => {
        let canvas = document.createElement('canvas');
        let context = canvas.getContext('2d');
        let img = e.target;
        canvas.width = img.width;
        canvas.height = img.height;
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
        let r = this._imageData[(4 * index) + 0] / 255;
        let g = this._imageData[(4 * index) + 1] / 255;
        let b = this._imageData[(4 * index) + 2] / 255;
        let a = this._imageData[(4 * index) + 3] / 255;

        point.setColor(r, g, b, a);
    }

    loadToLayer(){
        if(this._imageLoaded){
            this._screen.points.forEach(this._assignImageToPoints);
        }
    }
}

export default ImageLoader;
