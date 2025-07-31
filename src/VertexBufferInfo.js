'use strict';

class VertexBufferInfo {
    #vertexSize
    #vertexOffset;
    #colorOffset;
    #uvOffset;
    #vertexCount;
    /**
     * Along with the vertexArray it calculates some info like offsets required for the pipeline.
     * @param {Float32Array} vertexArray array with vertex, color and uv data
     * @param {Number} triangleDataLength how many items does a triangle row has in vertexArray
     * @param {Number} vertexOffset index where the vertex data starts in a row of `triangleDataLength` items
     * @param {Number} colorOffset index where the color data starts in a row of `triangleDataLength` items
     * @param {Number} uvOffset index where the uv data starts in a row of `triangleDataLength` items
     */
    constructor(vertexArray, triangleDataLength = 10, vertexOffset = 0, colorOffset = 4, uvOffset = 8) {
        this.#vertexSize = vertexArray.BYTES_PER_ELEMENT * triangleDataLength; // Byte size of ONE triangle data (vertex, color, uv). (one row)
        this.#vertexOffset = vertexArray.BYTES_PER_ELEMENT * vertexOffset;
        this.#colorOffset = vertexArray.BYTES_PER_ELEMENT * colorOffset; // Byte offset of triangle vertex color attribute.
        this.#uvOffset = vertexArray.BYTES_PER_ELEMENT * uvOffset;
        this.#vertexCount = vertexArray.byteLength / this.#vertexSize;
    }

    get vertexSize() {
        return this.#vertexSize;
    }

    get vertexOffset() {
        return this.#vertexOffset;
    }

    get colorOffset() {
        return this.#colorOffset;
    }

    get uvOffset() {
        return this.#uvOffset;
    }

    get vertexCount() {
        return this.#vertexCount;
    }
}

export default VertexBufferInfo;
