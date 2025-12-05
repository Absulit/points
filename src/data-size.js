/**
 * Utility types and methods to set wgsl types in memory.
 * This is mainly internal.
 * @module data-size
 * @ignore
 */

const size_2_align_2 = { size: 2, align: 2 };
const size_4_align_4 = { size: 4, align: 4 };
const size_6_align_8 = { size: 6, align: 8 };
const size_8_align_4 = { size: 6, align: 4 };
const size_8_align_8 = { size: 8, align: 8 };
const size_12_align_4 = { size: 12, align: 4 };
const size_12_align_16 = { size: 12, align: 16 };
const size_16_align_4 = { size: 16, align: 4 };
const size_16_align_16 = { size: 16, align: 16 };
const size_16_align_8 = { size: 16, align: 8 };
const size_24_align_8 = { size: 24, align: 8 };
const size_32_align_8 = { size: 32, align: 8 };
const size_32_align_16 = { size: 32, align: 16 };
const size_48_align_16 = { size: 48, align: 16 };
const size_64_align_16 = { size: 64, align: 16 };

export const typeSizes = {
    'bool': size_4_align_4,
    'i32': size_4_align_4,
    'u32': size_4_align_4,
    'f32': size_4_align_4,

    'f16': size_2_align_2,

    'atomic<u32>': size_4_align_4,
    'atomic<i32>': size_4_align_4,

    'vec2<bool>': size_8_align_8,
    'vec2<i32>': size_8_align_8,
    'vec2<u32>': size_8_align_8,
    'vec2<f32>': size_8_align_8,
    // 'vec2<bool>': size_8_align_8,
    'vec2i': size_8_align_8,
    'vec2u': size_8_align_8,
    'vec2f': size_8_align_8,

    'vec2<f16>': size_4_align_4,
    'vec2h': size_4_align_4,

    'vec3<bool>': size_12_align_16,
    'vec3<i32>': size_12_align_16,
    'vec3<u32>': size_12_align_16,
    'vec3<f32>': size_12_align_16,
    // 'vec3<bool>': size_12_align_16,
    'vec3i': size_12_align_16,
    'vec3u': size_12_align_16,
    'vec3f': size_12_align_16,

    'vec3<f16>': size_6_align_8,
    'vec3h': size_6_align_8,

    'vec4<bool>': size_16_align_16,
    'vec4<i32>': size_16_align_16,
    'vec4<u32>': size_16_align_16,
    'vec4<f32>': size_16_align_16,
    // 'vec4<bool>': size_16_align_16,
    'vec4i': size_16_align_16,
    'vec4u': size_16_align_16,
    'vec4f': size_16_align_16,

    'vec4<f16>': size_8_align_8,
    'vec4h': size_8_align_8,

    'mat2x2<f32>': size_16_align_8,
    'mat2x2f': size_16_align_8,
    'mat2x2<f16>': size_8_align_4,
    'mat2x2h': size_8_align_4,

    'mat3x2<f32>': size_24_align_8,
    'mat3x2f': size_24_align_8,
    'mat3x2<f16>': size_12_align_4,
    'mat3x2h': size_12_align_4,

    'mat4x2<f32>': size_32_align_8,
    'mat4x2f': size_32_align_8,
    'mat4x2<f16>': size_16_align_4,
    'mat4x2h': size_16_align_4,

    'mat2x3<f32>': size_32_align_16,
    'mat2x3f': size_32_align_16,
    'mat2x3<f16>': size_16_align_8,
    'mat2x3h': size_16_align_8,

    'mat3x3<f32>': size_48_align_16,
    'mat3x3f': size_48_align_16,
    'mat3x3<f16>': size_24_align_8,
    'mat3x3h': size_24_align_8,

    'mat4x3<f32>': size_64_align_16,
    'mat4x3f': size_64_align_16,
    'mat4x3<f16>': size_32_align_8,
    'mat4x3h': size_32_align_8,

    'mat2x4<f32>': size_32_align_16,
    'mat2x4f': size_32_align_16,
    'mat2x4<f16>': size_16_align_8,
    'mat2x4h': size_16_align_8,

    'mat3x4<f32>': size_48_align_16,
    'mat3x4f': size_48_align_16,
    'mat3x4<f16>': size_24_align_8,
    'mat3x4h': size_24_align_8,

    'mat4x4<f32>': size_64_align_16,
    'mat4x4f': size_64_align_16,
    'mat4x4<f16>': size_32_align_8,
    'mat4x4h': size_32_align_8,
}


// ignore comments
const removeCommentsRE = /\/\*[\s\S]*?\*\/|\/\/.*/gim

// struct name:
const getStructNameRE = /struct\s+?(\w+)\s*{[^}]+}\n?/g

// what's inside a struct:
const insideStructRE = /struct\s+?\w+\s*{([^}]+)}\n?/g

const arrayTypeAndAmountRE = /\s*<\s*([^,]+)\s*,?\s*(\d+)?\s*>/g

const arrayIntegrityRE = /\s*(array\s*<\s*\w+\s*(?:,\s*\d+)?\s*>)\s*,?/g

// you have to separete the result by splitting new lines

function removeComments(value) {
    const matches = value.matchAll(removeCommentsRE);
    for (const match of matches) {
        const captured = match[0];
        value = value.replace(captured, '');
    }
    return value;
}

function getInsideStruct(value) {
    const matches = value.matchAll(insideStructRE);
    let lines = null;
    for (const match of matches) {
        lines = match[1].split('\n');
        lines = lines.map(element => element.trim())
            .filter(e => e !== '');
    }
    return lines;
}

function getStructDataByName(value) {
    const matches = value.matchAll(getStructNameRE);
    let result = new Map();
    for (const match of matches) {
        const captured = match[0];
        const name = match[1];
        const lines = getInsideStruct(captured);
        const types = lines.map(l => {
            const right = l.split(':')[1];
            let type = '';
            if (isArray(right)) {
                const arrayMatch = right.matchAll(arrayIntegrityRE);
                type = arrayMatch.next().value[1];
            } else {
                type = right.split(',')[0].trim();
            }
            return type;
        });

        const names = lines.map(l => {
            const left = l.split(':')[0];
            let name = '';
            name = left.split(',')[0].trim();
            return name;
        });

        result.set(name, {
            captured,
            lines,
            types,
            unique_types: [...new Set(types)],
            names,
        });
    }
    return result;
}

export function getArrayTypeAndAmount(value) {
    const matches = value.matchAll(arrayTypeAndAmountRE);
    let result = [];
    for (const match of matches) {
        const type = match[1];
        const amount = match[2];
        result.push({ type, amount: Number(amount) });
    }
    return result;
}

function addBytesToAlign(bytes, aligment) {
    const remainder = bytes % aligment;
    let result = 0;
    if (remainder !== 0) {
        // if not multiple we obtain the diff
        // and add it to byteCounter to make it fit the alignment
        const multipleDiff = aligment - remainder;
        result = bytes = multipleDiff;
    }
    return result;
}

/**
 * Check if string has 'array' in it
 * @param {String} value
 * @returns {boolean}
 */
export function isArray(value) {
    return value.indexOf('array') != -1;
}

export function getArrayAlign(structName, structData) {
    const [d] = getArrayTypeAndAmount(structName);
    const t = typeSizes[d.type] || structData.get(d.type);
    if (!t) {
        throw new Error(`${d.type} type has not been declared previously`)
    }

    // if it's not in typeSizes is a struct,
    //therefore probably stored in structData
    return t.align || t.maxAlign;
}

export function getArrayTypeData(currentType, structData) {
    const [d] = getArrayTypeAndAmount(currentType);
    if (!d) {
        throw `${currentType} seems to have an error, maybe a wrong amount?`;
    }
    if (d.amount == 0) {
        throw new Error(`${currentType} has an amount of 0`);
    }
    let currentTypeData = typeSizes[d.type] || structData.get(d.type);
    if (!currentTypeData) {
        throw `Struct or type '${d.type}' in ${currentType} is not defined.`
    }
    if (d.amount) {
        const t = typeSizes[d.type];
        if (t) {
            // if array, the size is equal to the align
            currentTypeData = { size: t.align * d.amount, align: t.align };
        } else {
            const sd = structData.get(d.type);
            if (sd) {
                currentTypeData = { size: sd.bytes * d.amount, align: sd.maxAlign };
            }
        }
    }
    return currentTypeData;
}


/**
 * Calculates if there's a space of bytes left in the row
 * @param {Number} bytes current bytes size
 * @param {Number} maxSize max size of row, in this case probably 16
 * @returns remaining bytes if any
 */
function getPadding(bytes, maxSize) {
    const remainder = bytes % maxSize
    let remainingBytes = 0;
    if (remainder) {
        remainingBytes = maxSize - remainder;
    }
    return remainingBytes
}

export const dataSize = value => {
    const noCommentsValue = removeComments(value);
    const structData = getStructDataByName(noCommentsValue);



    const MAX_ROW_SIZE = 16;
    structData.forEach(sd => {
        let bytes = 0;
        let remainingBytes = 0;
        sd.paddings = {};
        sd.names.forEach((name, i) => {
            const type = sd.types[i];
            let typeSize = typeSizes[type];

            // if no typeSize is an array or struct
            if (!typeSize) {
                if (type) {
                    if (isArray(type)) {
                        typeSize = getArrayTypeData(type, structData);
                    } else {
                        const sd = structData.get(type);
                        if (sd) {
                            typeSize = { size: sd.bytes, align: MAX_ROW_SIZE };
                        }
                    }
                }
            }

            const { size, align } = typeSize;
            const prevName = sd.names[i - 1];

            let aligned = bytes % align === 0;
            const HALF = 2;
            while (!aligned) {
                remainingBytes -= HALF
                bytes += HALF;
                sd.paddings[prevName] ||= 0;
                sd.paddings[prevName] += HALF;
                aligned = bytes % align === 0;
            }

            if (remainingBytes && size > remainingBytes) {
                bytes += remainingBytes;
                sd.paddings[prevName] = remainingBytes;
                remainingBytes = 0;
            }

            bytes += size;

            remainingBytes = getPadding(bytes, MAX_ROW_SIZE);
        })
        remainingBytes = getPadding(bytes, MAX_ROW_SIZE);
        bytes += remainingBytes;
        sd.bytes = bytes;
    })

    return structData
}
