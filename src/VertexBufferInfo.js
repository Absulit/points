/**
 * Along with the vertexArray it calculates some info like offsets required for the pipeline.
 * Internal use.
 * @ignore
 */
class VertexBufferInfo {
    #vertexSize
    #vertexOffset;
    #colorOffset;
    #uvOffset;
    #normalOffset;
    #idOffset;
    #barycentricsOffset;
    #jointOffset;
    #weightOffset;
    #vertexCount;
    /**
     * Along with the vertexArray it calculates some info like offsets required for the pipeline.
     * @param {Float32Array} vertexArray array with vertex, color and uv data
     * @param {Number} triangleDataLength how many items does a triangle row has in vertexArray
     * @param {Number} vertexOffset index where the vertex data starts in a row of `triangleDataLength` items
     * @param {Number} colorOffset index where the color data starts in a row of `triangleDataLength` items
     * @param {Number} uvOffset index where the uv data starts in a row of `triangleDataLength` items
     * @param {Number} barycentricsOffset index where the barycentrics data starts in a row of `triangleDataLength` items
     */
    constructor(
        vertexArray,
        triangleDataLength = 25,
        vertexOffset = 0,
        colorOffset = 4,
        uvOffset = 8,
        normalsOffset = 10,
        idOffset = 13,
        barycentricsOffset = 14,
        jointsOffset = 17,
        weigthsOffset = 21
    ) {
        this.#vertexSize = vertexArray.BYTES_PER_ELEMENT * triangleDataLength; // Byte size of ONE triangle data (vertex, color, uv). (one row)
        this.#vertexOffset = vertexArray.BYTES_PER_ELEMENT * vertexOffset;
        this.#colorOffset = vertexArray.BYTES_PER_ELEMENT * colorOffset; // Byte offset of triangle vertex color attribute.
        this.#uvOffset = vertexArray.BYTES_PER_ELEMENT * uvOffset;
        this.#normalOffset = vertexArray.BYTES_PER_ELEMENT * normalsOffset;
        this.#idOffset = vertexArray.BYTES_PER_ELEMENT * idOffset;
        this.#barycentricsOffset = vertexArray.BYTES_PER_ELEMENT * barycentricsOffset;

        // if (jointsOffset) {
        this.#jointOffset = vertexArray.BYTES_PER_ELEMENT * jointsOffset;
        this.#weightOffset = vertexArray.BYTES_PER_ELEMENT * weigthsOffset;
        // }

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

    get normalOffset() {
        return this.#normalOffset;
    }

    get idOffset() {
        return this.#idOffset;
    }

    get barycentricsOffset() {
        return this.#barycentricsOffset;
    }

    get jointOffset() {
        return this.#jointOffset;
    }

    get weightOffset() {
        return this.#weightOffset;
    }

    get vertexCount() {
        return this.#vertexCount;
    }
}

export default VertexBufferInfo;
