class Utils {
    /**
     * Shuffles an array.
     * based on:
     * https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array/2450976#2450976
     * @param {array} array
     * @returns array shuffled
     */
    static shuffle(array) {
        return array
            .map((value) => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
    }


}

export default Utils;

export const print = (...s) => console.log(s);

/**
 * Creating a deprecated / obsolete behavior for methods in a library.
 * [Credits]{@link: https://stackoverflow.com/q/21726472/1333836}
 * 
 * @param  {function} replacementFunction
 * @param  {string} oldFnName
 * @param  {string} newFnName
 * @return {function}
 */
export const obsolete = function (replacementFunction, oldFnName, newFnName) {
    const wrapper = function () {
        console.warn("WARNING! Obsolete function called. Function '" + oldFnName + "' has been deprecated, please use the new '" + newFnName + "' function instead!");

        replacementFunction.apply(this, arguments);
    }
    wrapper.prototype = replacementFunction.prototype;

    return wrapper;
}
