
const size_4_align_4 = { size: 4, align: 4 };
const size_8_align_8 = { size: 8, align: 8 };
const size_12_align_16 = { size: 12, align: 16 };
const size_16_align_16 = { size: 16, align: 16 };
const size_16_align_8 = { size: 16, align: 8 };
const size_32_align_8 = { size: 32, align: 8 };
const size_24_align_16 = { size: 24, align: 16 };
const size_48_align_16 = { size: 48, align: 16 };
const size_32_align_16 = { size: 32, align: 16 };
const size_64_align_16 = { size: 64, align: 16 };

const typeSizes = {
    'bool': size_4_align_4,
    'f32': size_4_align_4,
    'i32': size_4_align_4,
    'u32': size_4_align_4,

    'vec2<bool>': size_8_align_8,
    'vec2<f32>': size_8_align_8,
    'vec2<i32>': size_8_align_8,
    'vec2<u32>': size_8_align_8,

    // 'vec2<bool>': size_8_align_8,
    'vec2f': size_8_align_8,
    'vec2i': size_8_align_8,
    'vec2u': size_8_align_8,

    'vec3<bool>': size_12_align_16,
    'vec3<f32>': size_12_align_16,
    'vec3<i32>': size_12_align_16,
    'vec3<u32>': size_12_align_16,

    // 'vec3<bool>': size_12_align_16,
    'vec3f': size_12_align_16,
    'vec3i': size_12_align_16,
    'vec3u': size_12_align_16,

    'vec4<bool>': size_16_align_16,
    'vec4<f32>': size_16_align_16,
    'vec4<i32>': size_16_align_16,
    'vec4<u32>': size_16_align_16,
    'mat2x2<f32>': size_16_align_8,
    'mat2x3<f32>': size_32_align_8,
    'mat2x4<f32>': size_32_align_8,
    'mat3x2<f32>': size_24_align_16,
    'mat3x3<f32>': size_48_align_16,
    'mat3x4<f32>': size_48_align_16,
    'mat4x2<f32>': size_32_align_16,
    'mat4x3<f32>': size_64_align_16,
    'mat4x4<f32>': size_64_align_16,

    // 'vec4<bool>': size_16_align_16,
    'vec4f': size_16_align_16,
    'vec4i': size_16_align_16,
    'vec4u': size_16_align_16,
    'mat2x2f': size_16_align_8,
    'mat2x3f': size_32_align_8,
    'mat2x4f': size_32_align_8,
    'mat3x2f': size_24_align_16,
    'mat3x3f': size_48_align_16,
    'mat3x4f': size_48_align_16,
    'mat4x2f': size_32_align_16,
    'mat4x3f': size_64_align_16,
    'mat4x4f': size_64_align_16,
}


// ignore comments
const removeCommentsRE = /^(?:(?!\/\/|\/*.*\/).|\n)+/gim

// struct name:
const getStructNameRE = /struct\s+?(\w+)\s*{[^}]+}\n?/g

// what's inside a struct:
const insideStructRE = /struct\s+?\w+\s*{([^}]+)}\n?/g

const arrayTypeAndAmountRE = /\s*<\s*([^,]+)\s*,\s*(\d+)\s*>/g

// you have to separete the result by splitting new lines

function removeComments(value) {
    const matches = value.matchAll(removeCommentsRE);
    let result = '';
    for (const match of matches) {
        const captured = match[0];
        result += captured;
    }
    return result;
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
            const type = right.slice(',', -1).trim();
            return type;
        })
        result.set(name, {
            captured,
            lines,
            types,
            unique_types: [...new Set(types)]
        });
    }
    return result;
}

function getArrayTypeAndAmount(value) {
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
function isArray(value) {
    return value.indexOf('array') != -1;
}

export const dataSize = value => {
    const noCommentsValue = removeComments(value);
    const structData = getStructDataByName(noCommentsValue);
    for (const [structDatumKey, structDatum] of structData) {

        // to obtain the higher max alignment, but this can be also calculated
        // in the next step
        structDatum.unique_types.forEach(ut => {
            let maxAlign = structDatum.maxAlign || 0;
            // if it doesn't exists in typeSizes is an Array or a new Struct
            if (!typeSizes[ut]) {
                if (isArray(ut)) {

                    const [d] = getArrayTypeAndAmount(ut);
                    const t = typeSizes[d.type];
                    if (t) {
                        const align = t.align;
                        maxAlign = align > maxAlign ? align : maxAlign;
                        structDatum.maxAlign = maxAlign;

                    } else {
                        const sd = structData.get(d.type);
                        const align = sd.maxAlign;
                        maxAlign = align > maxAlign ? align : maxAlign;
                        structDatum.maxAlign = maxAlign;
                    }
                } else {
                    const sd = structData.get(ut);
                    // return;
                    const align = sd.maxAlign;
                    maxAlign = align > maxAlign ? align : maxAlign;
                    structDatum.maxAlign = maxAlign;
                }

            } else {
                const align = typeSizes[ut].align;
                maxAlign = align > maxAlign ? align : maxAlign;
                structDatum.maxAlign = maxAlign;
            }

        });

        let byteCounter = 0;
        structDatum.types.forEach((t, i) => {
            const currentType = t;
            const nextType = structDatum.types[i + 1];
            let currentTypeData = typeSizes[currentType];
            let nextTypeData = typeSizes[nextType];

            // if currentTypeData or nextTypeData have no data it means
            // it's a struct or an array
            // if it's a struct the data is already saved in structData
            // because it was calculated previously
            // assuming the struct was declared previously
            if (!currentTypeData) {

                if (currentType) {
                    if (isArray(currentType)) {
                        const [d] = getArrayTypeAndAmount(currentType);
                        const t = typeSizes[d.type];
                        if (t) {
                            // if array, the size is equal to the align
                            // currentTypeData = { size: t.align * d.amount, align: t.align };
                            currentTypeData = { size: t.size * d.amount, align: t.align };
                            // currentTypeData = { size: 0, align: 0 };
                        } else {
                            const sd = structData.get(d.type);
                            if (sd) {
                                currentTypeData = { size: sd.bytes * d.amount, align: sd.maxAlign };
                            }
                        }

                    } else {

                        const sd = structData.get(currentType);
                        if (sd) {
                            currentTypeData = { size: sd.bytes, align: sd.maxAlign };
                        }

                    }
                }

            }
            // read above
            if (!nextTypeData) {
                if (nextType) {

                    if (isArray(nextType)) {
                        const [d] = getArrayTypeAndAmount(nextType);
                        const t = typeSizes[d.type];
                        if (t) {
                            // nextTypeData = { size: t.align * d.amount, align: t.align };
                            nextTypeData = { size: t.size * d.amount, align: t.align };
                            // nextTypeData = { size: 0, align: 0 };
                        } else {
                            const sd = structData.get(d.type);
                            if (sd) {
                                nextTypeData = { size: sd.bytes * d.amount, align: sd.maxAlign };
                            }
                        }
                    } else {
                        const sd = structData.get(nextType)
                        if (sd) {
                            nextTypeData = { size: sd.bytes, align: sd.maxAlign };
                        }
                    }
                }
            }

            byteCounter += currentTypeData.size;
            if ((currentTypeData.size === structDatum.maxAlign) || !nextType) {
                return;
            }

            if (nextTypeData.align == structDatum.maxAlign) {
                byteCounter += addBytesToAlign(byteCounter, structDatum.maxAlign);
            }
        });

        byteCounter += addBytesToAlign(byteCounter, structDatum.maxAlign);
        structDatum.bytes = byteCounter;
    }
    return structData;
}
