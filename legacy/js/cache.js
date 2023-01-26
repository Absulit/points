/**
 * To improve performance by storing data per frame in `requestAnimFrame`,
 * and playback the stored data.
 */
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

    /**
     * To call on each `requestAnimFrame` if you need to store data in cache to play back.
     * @param {Function} whenRunning Call when you want to store in cache per frame.
     * @param {Function} whenRunningFromCache Call to retrieve data per frame.
     * @param {Function} whenReset To be called when the cache starts again
     */
    update(whenRunning, whenRunningFromCache, whenReset) {
        this._currentFrameData = this._values[this._currentFrame];
        this._runningFromCache = !!this._currentFrameData;

        if (this._runningFromCache && !this._cacheMessageFlag) {
            console.log('RUNNING FROM CACHE');
            this._cacheMessageFlag = true;
        }

        if (this._runningFromCache) {
            whenRunningFromCache(this._currentFrameData);
        } else {
            whenRunning();
        }

        if (++this._currentFrame > this._maxFrames) {
            this._currentFrame = 0;
            whenReset? whenReset(): 0;
            // TODO: dispatch event for videoLoader.restart();
        }
    }

    /**
     * To save a piece of data in the current frame.
     */
    set data(value) {
        this._values[this._currentFrame] = value;
    }

    /**
     * To retrieve a piece of data from the current frame.
     */
    get data() {
        return this._values[this._currentFrame];
    }
}
