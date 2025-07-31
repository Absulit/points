/**
 * To manage time and delta time,
 * based on https://github.com/mrdoob/three.js/blob/master/src/core/Clock.js
 * @class Clock
 */
class Clock {
    #time = 0;
    #oldTime = 0;
    #delta = 0;
    constructor() {

    }

    /**
     * Gets the current time, it does not calculate the time, it's calcualted
     *  when `getDelta()` is called.
     */
    get time() {
        return this.#time;
    }

    /**
     * Gets the last delta value, it does not calculate the delta, use `getDelta()`
     */
    get delta() {
        return this.#delta;
    }

    #now() {
        return (typeof performance === 'undefined' ? Date : performance).now();
    }

    /**
     * Calculate time since last frame
     * It also calculates `time`
     */
    getDelta() {
        this.#delta = 0;
        const newTime = this.#now();
        this.#delta = (newTime - this.#oldTime) / 1000;
        this.#oldTime = newTime;
        this.#time += this.#delta;
        return this.#delta;
    }
}

export default Clock;