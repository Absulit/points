/**
 * Just a few functions to be used with the cameras
 *
 * based on https://github.com/greggman/wgpu-matrix/
 * @module data-size
 * @ignore
 */


/**
 * Divides a vector by its Euclidean length and returns the quotient.
 *
 * @param v - The vector.
 * @returns The normalized vector.
 */
export function normalize(v) {
    const result = [0, 0, 0];

    const v0 = v[0];
    const v1 = v[1];
    const v2 = v[2];
    const len = Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2);

    if (len > 0.00001) {
        result[0] = v0 / len;
        result[1] = v1 / len;
        result[2] = v2 / len;
    }

    return result;
}

/**
 * Subtracts two vectors.
 * @param a - Operand vector.
 * @param b - Operand vector.
 * @param dst - vector to hold result. If not passed in a new one is created.
 * @returns A vector that is the difference of a and b.
 */
export function sub(a, b) {
    const result = [0, 0, 0];

    result[0] = a[0] - b[0];
    result[1] = a[1] - b[1];
    result[2] = a[2] - b[2];

    return result;
}

/**
 * Computes the cross product of two vectors; assumes both vectors have
 * three entries.
 * @param a - Operand vector.
 * @param b - Operand vector.
 * @param dst - vector to hold result. If not passed in a new one is created.
 * @returns The vector of a cross b.
 */
export function cross(a, b) {
    const result = [0, 0, 0];

    const t1 = a[2] * b[0] - a[0] * b[2];
    const t2 = a[0] * b[1] - a[1] * b[0];
    result[0] = a[1] * b[2] - a[2] * b[1];
    result[1] = t1;
    result[2] = t2;

    return result;
}


/**
 * Computes the dot product of two vectors; assumes both vectors have
 * three entries.
 * @param a - Operand vector.
 * @param b - Operand vector.
 * @returns dot product
 */
export function dot(a, b) {
    return (a[0] * b[0]) + (a[1] * b[1]) + (a[2] * b[2]);
}
