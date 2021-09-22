class ImageLoader {
    ONE_TO_ONE = 0;
    FIT = 1;
    constructor(screen) {
        this._screen = screen;
        this._image = new Image();
        this._imageData;
        this._image.onload = this._onLoadImage;
        this._imageLoaded = false;

        this._width = 0;
        this._height = 0;

        this._typesToFunction = {};
        this._typesToFunction[this.ONE_TO_ONE] = this._mapOneToOne;
        this._typesToFunction[this.FIT] = this._mapToFit;

        this._type = this.ONE_TO_ONE;
    }

    /**
     * Loads the image without placing it yet in the layer.
     * @param {string} path Path of image to load.
     */
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
        this._imageLoaded = true;
    }

    /**
     * Fits the image no matter resolution and no matter Point number.
     * If you don't want stretch or image squash, crop the image to fit
     * the ratio selected for the `Screen` grid.
     */
    _mapToFit = (point, x = 0, y = 0, scaleX = 1, scaleY = 1) => {
        let pixelPerColumnX = Math.round(this._width / this._screen.numColumns);
        let pixelPerColumnY = Math.round(this._height / this._screen.numRows);
        let pointX = point.coordinates.x;
        let pointY = point.coordinates.y;
        // we select the row (rowIndex)
        // we jump in the row per block (pixelBlock)
        // the 4 is the amount of data per pixel block: rgba
        let rowWidth = 4 * this._width;
        let rowIndex = rowWidth * Math.round(pointY / scaleY) * pixelPerColumnY;
        let pixelBlock = Math.round(pointX / scaleX) * pixelPerColumnX * 4;
        let pixelBlockIndex = rowIndex + pixelBlock;

        let r = this._imageData[pixelBlockIndex + 0] / 255;
        let g = this._imageData[pixelBlockIndex + 1] / 255;
        let b = this._imageData[pixelBlockIndex + 2] / 255;
        let a = this._imageData[pixelBlockIndex + 3] / 255;

        point.setColor(r, g, b, a);
    }

    /**
     * DO NOT USE
     * the only purpose of this method is to help create new ones.
     * the slice method slows the render and the framerate
     * @param {Point} point
     * @param {Number} index
     */
    __mapToFitExample__ = (point, index) => {
        let pixelPerColumnX = Math.round(this._width / this._screen.numColumns);
        let pixelPerColumnY = Math.round(this._height / this._screen.numRows);
        let pointX = point.coordinates.x;
        let pointY = point.coordinates.y;

        let rowWidth = 4 * this._width;
        let rowIndex = rowWidth * pointY * pixelPerColumnY;
        let dataRow = this._imageData.slice(rowIndex, rowIndex + rowWidth);

        let pixelBlock = pointX * pixelPerColumnX * 4;

        let r = dataRow[pixelBlock + 0] / 255;
        let g = dataRow[pixelBlock + 1] / 255;
        let b = dataRow[pixelBlock + 2] / 255;
        let a = dataRow[pixelBlock + 3] / 255;

        point.setColor(r, g, b, a);

    }
    /**
     * Map the image loaded one pixel per `Point`.
     * To fit the image you need to increase resolution.
     */
    _mapOneToOne = (point, x = 0, y = 0, scaleX = 1, scaleY = 1) => {
        let pointX = point.coordinates.x;
        let pointY = point.coordinates.y;

        let rowWidth = 4 * this._width;

        let pixelJump = (((Math.round(pointY / scaleY) + y) * rowWidth) + ((Math.round(pointX / scaleX) + x) * 4));

        let r = this._imageData[pixelJump + 0] / 255;
        let g = this._imageData[pixelJump + 1] / 255;
        let b = this._imageData[pixelJump + 2] / 255;
        let a = this._imageData[pixelJump + 3] / 255;

        point.setColor(r, g, b, a);
    }

    /**
     * Loads image into current layer
     * @param {Number} x starting point of the image in x
     * @param {Number} y starting point of the image in y
     * @param {Number} scaleX scales the image in x
     * @param {Number} scaleY scales the image in y
     */
    loadToLayer = (x = 0, y = 0, scaleX = 1, scaleY = 1) => {
        if (this._imageLoaded) {
            for (let index = 0; index < this._screen.points.length; index++) {
                const point = this._screen.points[index];
                this._typesToFunction[this._type](point, x, y, scaleX, scaleY);
            }
        }
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }
}

export default ImageLoader;
