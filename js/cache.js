export default class Cache {

    /**
     * @param {Number} maxFrames Amount of frames to record and playback
     */
    constructor(maxFrames = 600) {
        this._maxFrames = maxFrames;
        this._currentFrame = 0;
        this._cacheMessageFlag = false;
        this._runningFromCache = false;
        this._currentFrameData = null;
        this._values = {};
    }

    update(cb) {
        this._currentFrameData = this._values[this._currentFrame];
        this._runningFromCache = !!this._currentFrameData;

        if (this._runningFromCache && !this._cacheMessageFlag) {
            console.log('RUNNING FROM CACHE');
            this._cacheMessageFlag = true;
        }

        cb(this._runningFromCache, this._currentFrameData);

        if (++this._currentFrame > this._maxFrames) {
            this._currentFrame = 0;
            // TODO: dispatch event for videoLoader.restart();
        }
    }

    set data(value) {
        this._values[this._currentFrame] = value;
    }

    get data() {
        return this._values[this._currentFrame];
    }
}
