'use strict';
/**
 * Collection of Keys used for the default uniforms
 * assigned in the {@link Points} class.
 * This is mainly for internal purposes.
 * @class UniformKeys
 * @ignore
 */
class UniformKeys {
    /**
     * To set the time in milliseconds
     * @type {string}
     * @static
     */
    static TIME = 'time';
    /**
     * To set the time after the last frame
     * @type {string}
     * @static
     */
    static DELTA = 'delta';
    /**
     * To set the current date and time in seconds
     * @type {string}
     * @static
     */
    static EPOCH = 'epoch';
    /**
     * To set screen dimensions
     * @type {string}
     * @static
     */
    static SCREEN = 'screen';
    /**
     * To set mouse coordinates
     * @type {string}
     * @static
     */
    static MOUSE = 'mouse';
    /**
     * To set if the mouse has been clicked.
     * @type {string}
     * @static
     */
    static MOUSE_CLICK = 'mouseClick';
    /**
     * To set if the mouse is down.
     * @type {string}
     * @static
     */
    static MOUSE_DOWN = 'mouseDown';
    /**
     * To set if the wheel is moving.
     * @type {string}
     * @static
     */
    static MOUSE_WHEEL = 'mouseWheel';
    /**
     * To set how much the wheel has moved.
     * @type {string}
     * @static
     */
    static MOUSE_DELTA = 'mouseDelta';
    /**
     * To set the screen `ScaleMode`.
     * @type {string}
     * @static
     */
    static SCALE_MODE = 'scaleMode';
}

export default UniformKeys;
