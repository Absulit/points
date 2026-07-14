import { getArrayTypeAndAmount } from "../data-size.js";

class ArrayBufferWriter {
    #buffer
    #view
    #offset = 0

    #indexesAdded = [];

    #vecs = {
        'vec4f': 'f32',
        'vec4<f32>': 'f32',

        'vec4u': 'u32',
        'vec4<u32>': 'u32',

        'vec4i': 'i32',
        'vec4<i32>': 'i32',

        'vec3f': 'f32',
        'vec3<f32>': 'f32',

        'vec3u': 'u32',
        'vec3<u32>': 'u32',

        'vec3i': 'i32',
        'vec3<i32>': 'i32',

        'vec2f': 'f32',
        'vec2<f32>': 'f32',

        'vec2u': 'u32',
        'vec2<u32>': 'u32',

        'vec2i': 'i32',
        'vec2<i32>': 'i32',
    }

    constructor(numItems) {
        this.#buffer = new ArrayBuffer(numItems * 4);
        this.#view = new DataView(this.#buffer);
    }

    get offset() {
        return this.#offset
    }

    get buffer() {
        return this.#buffer
    }

    setN32(value, type) {
        this.#indexesAdded.push(this.#offset);

        switch (type) {
            default:
            case 'f32':
                this.#view.setFloat32(this.#offset, value, true);
                break;
            case 'u32':
                this.#view.setUint32(this.#offset, value, true);
                break;
            case 'i32':
                this.#view.setInt32(this.#offset, value, true);
                break;
        }
        this.#offset += Float32Array.BYTES_PER_ELEMENT;
    }

    set(value, type) {
        const isArray = Array.isArray(value);
        if (isArray) {
            const isWGSLArray = type.includes('array');
            if (isWGSLArray) {
                type = getArrayTypeAndAmount(type)[0].type;
            }
            if (type.includes('vec')) {
                type = this.#vecs[type];
            }

            value.forEach(v => this.setN32(v, type));
            return;
        }

        this.setN32(value, type);
    }

    hexDump() {
        const byteView = new Uint8Array(this.#buffer);

        const hexRows = Array.from(byteView).map((b, i) => {
            return {
                offset: `0x${i.toString(16).padStart(2, '0').toUpperCase()}`,
                byte: b,
                hex: `0x${b.toString(16).padStart(2, '0').toUpperCase()}`,
                binary: b.toString(2).padStart(8, '0')
            };
        });

        console.table(hexRows);
    }

    dump() {
        const view = this.#view;
        const results = [];

        for (let i = 0; i < view.byteLength; i++) {
            const isInList = this.#indexesAdded.includes(i / 4);
            if (!isInList) {
                continue;
            }

            const row = { byteOffset: i, uint8: view.getUint8(i) };

            if (i <= view.byteLength - Int32Array.BYTES_PER_ELEMENT) {
                row.int32_LE = view.getInt32(i, true);
                row.uint32_LE = view.getUint32(i, true);
                row.float32_LE = +view.getFloat32(i, true).toFixed(2);
            }

            results.push(row);
        }

        console.table(results);
    }
}

export default ArrayBufferWriter;
