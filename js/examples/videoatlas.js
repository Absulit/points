import SpriteLoader from '../spriteloader.js';
import VideoLoader from '../videoloader.js';

class VideoAtlas {
    constructor(screen) {
        this._screen = screen;
        this._scale = .05 / (80 / screen.numColumns); // assuming both width and height are the same, a square
        //videoLoader.type = videoLoader.FIT;
        this._videoLoader = new VideoLoader(screen);
        this._videoLoader.load('/assets_ignore/20210925_183936.mp4');

        this._spriteLoader = new SpriteLoader(screen, 32, 32);
        this._spriteLoader.load('/assets_ignore/pixelspritefont 32_green.png', 32, 32);

        this._idsOfChars = [-1, 31, 51, 37, 40, 47, 61, 30, 62, 63];
        this._idsOfChars2 = [-1, 60, 36, 51, 48, 57, 38, 61, 45, 64, 63];
    }

    update() {
        this._videoLoader.loadToLayer(0, 0, this._scale, this._scale);
        this._screen.currentLayer.points.forEach(p => {

            let brightness = p.getBrightness();

            if (Math.random() > .5) {
                p.atlasId = this._idsOfChars[Math.round(this._idsOfChars.length * brightness) - 1];
            } else {
                p.atlasId = this._idsOfChars2[Math.round(this._idsOfChars2.length * brightness) - 1];
            }
            p.setBrightness(0);
        });
    }
}

export default VideoAtlas;
