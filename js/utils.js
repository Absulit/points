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
