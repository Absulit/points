/**
 * To manage time and delta time,
 * based on https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 */
export default class Clock {

    constructor() {
        /** @private */
        this._time = 0;
        /** @private */
        this._oldTime = 0;
    }

    /**
     * Gets the current time, it does not calculate the time, it's calcualted
     *  when `getDelta()` is called.
     */
    get time() {
        return this._time;
    }

    /**
     * Gets the last delta value, it does not calculate the delta, use `getDelta()`
     */
    get delta() {
        return this._delta;
    }

    /** @private */
    now() {
        return (typeof performance === 'undefined' ? Date : performance).now();
    }

    /**
     * Calculate time since last frame
     * It also calculates `time`
     */
    getDelta() {
        this._delta = 0;
        const newTime = this.now();
        this._delta = (newTime - this._oldTime) / 1000;
        this._oldTime = newTime;
        this._time += this._delta;
        return this._delta;
    }
}
