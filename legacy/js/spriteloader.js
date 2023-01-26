import { gl, program } from './../absulit.module.js';
class SpriteLoader {
    static numInstances = 0;
    constructor(screen, tileWidth, tileHeight) {
        this._screen = screen;
        this._image = new Image();
        this._image.onload = this._onLoadImage;
        this._imageLoaded = false;

        this._tileWidth = tileWidth;
        this._tileHeight = tileHeight;

        // increasing static variable
        SpriteLoader.numInstances++;
        this._instanceId = SpriteLoader.numInstances - 1;

        this._glTexture = null;
    }

    load(path) {
        this._image.src = path;gl
    }

    _onLoadImage = () => {
        this._glTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + this._instanceId );  // this is the 0th texture
        gl.bindTexture(gl.TEXTURE_2D, this._glTexture);

        // actually upload bytes
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._image);

        // WebGL1 has different requirements for power of 2 images
        // vs non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (this._isPowerOf2(this._image.width) && this._isPowerOf2(this._image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        ////
        gl.uniform2fv(gl.getUniformLocation(program, "textureAtlasSize"), [this._image.width, this._image.height]);
        gl.uniform2fv(gl.getUniformLocation(program, "imageSize"), [this._tileWidth, this._tileHeight]);
    }

    loadToLayer() {
        this._onLoadImage();
    }

    _isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
}

export default SpriteLoader;