
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

    'vec3<bool>': size_12_align_16,
    'vec3<f32>': size_12_align_16,
    'vec3<i32>': size_12_align_16,
    'vec3<u32>': size_12_align_16,

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
}



// ignore comments
const removeCommentsRE = /^(?:(?!\/\/|\/*.*\/).|\n)+/gim

// struct name:
const getStructNameRE = /struct\s+?(\w+)\s*{[^}]+}\n?/g

// what's inside a struct:
const insideStructRE = /struct\s+?\w+\s*{([^}]+)}\n?/g

// you have to separete the result by splitting new lines

function removeComments(value) {
    const matches = value.matchAll(removeCommentsRE);
    let result = '';
    for (const match of matches) {
        const captured = match[0]
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

function getStructName(value) {
    const matches = value.matchAll(getStructNameRE);
    let result = {};
    for (const match of matches) {
        const captured = match[0]
        const name = match[1];
        console.log(name, captured);
        // result += captured;
        const lines = getInsideStruct(captured);
        const types = lines.map(l => {
            const right = l.split(':')[1];
            const type = right.split(',')[0].trim()
            return type;
        })
        result[name] = {
            captured,
            lines,
            types,
            unique_types: [...new Set(types)]
        }
    }
    console.log(result);
    // return result;
}

export const dataSize = value => {

    console.log('---- dataSize', value);

    const noCommentsValue = removeComments(value);
    console.log('---- dataSize', noCommentsValue);
    getStructName(noCommentsValue)

}


// // const result = re.exec(value);
// const matches = value.matchAll(removeCommentsRE);
// for (const match of matches) {
//     console.log(match)
//     const captured = match[0]
//     const name = match[1]
//     // console.log(name)
//     console.log(captured)
// }