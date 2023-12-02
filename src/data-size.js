// ignore comments
const removeCommentsRE = /^(?:(?!\/\/|\/*.*\/).|\n)+/gim

// struct name:
const getStructNameRE = /struct\s+?(\w+)\s*{[^}]+}\n?/g

// what's inside a struct:
const insideStructRE = /struct\s+?\w+\s*{([^}]+)}\n?/g

// you have to separete the result by splitting new lines

// TODO SARK 3h:49

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
        result[name] = {
            captured,
            lines
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