export let gl, canvas, program, vertices = [], dimension = 2,
    objects = {};

const ORIGIN = [0.0, 0.0, 0.0];
const X = [1.0, 0.0, 0.0];
const Y = [0.0, 1.0, 0.0];
const Z = [0.0, 0.0, 1.0];

export function initWebGL(canvasId, depth) {
    canvas = document.getElementById(canvasId);
    gl = WebGLUtils.setupWebGL(canvas, { preserveDrawingBuffer: true, premultipliedAlpha: false });
    if (!gl) { alert("WebGL isn't available"); }
    gl.viewport(0, 0, canvas.width, canvas.height);
    if (depth) {
        gl.enable(gl.DEPTH_TEST);
    }
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

export function setClearColor(color) {
    gl.clearColor(color[0], color[1], color[2], color[3]);
}

export function clearScreen() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

export function getBuffer(size) {
    const vsize = size || flatten(vertices);
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, vsize, gl.STATIC_DRAW);
    return bufferId;
}

export function getBuffer2(vs) {
    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vs), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, vs, gl.STATIC_DRAW);
    return bufferId;
}

export function assignShaders(vertexName, fragmentName) {
    program = initShaders(gl, vertexName, fragmentName);
    gl.useProgram(program);
}

/**
 * Float Array to buffer
 * @param {string} name Name shared in Javascript and the Shader
 * @param {Array} vectorLen dimension required e.g, color is 4, pointsize is 1
 * @returns shader variable pointer reference
 */
export function shaderVariableToBuffer(name, vectorLen) {
    const shaderVar = gl.getAttribLocation(program, name);
    gl.vertexAttribPointer(shaderVar, vectorLen, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderVar);
    return shaderVar;
}

export function shaderUniformToBuffer(name, value){
    return gl.uniform1f(gl.getUniformLocation(program, name), value);
}

export function drawTriangles() {
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / dimension);
}

export function drawTriangles2(bufferId, vertices, dimension) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / dimension);
}

export function drawTriangleStrip(len) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len);
}

export function drawTriangleStrip2(bufferId, vertices, dimension) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length / dimension);
}

export function drawPoints(len) {
    gl.drawArrays(gl.POINTS, 0, len);
}

export function drawPoints2(bufferId, vertices, dimension) {
    //gl.enable(gl.GL_POINT_SMOOTH);
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.POINTS, 0, vertices.length / dimension);
}

export function drawLines(len) {
    gl.drawArrays(gl.LINES, 0, len);
}

export function drawLines2(bufferId, vertices) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.LINES, 0, vertices.length / dimension);
}

export function polygon(numSides, ratio, position) {
    position = position || [0, 0, 0];
    const x = position[0], y = position[1], z = position[2];
    let k, vertices = [vec4(x, y, z, 1)];
    for (k = 0; k < numSides; k++) {
        vertices.push(
            vec4(
                (Math.sin(2.0 * Math.PI / numSides * k) * ratio) + x,
                (Math.cos(2.0 * Math.PI / numSides * k) * ratio) + y,
                z,
                1.0
            )
        );
    }
    return vertices;
}

export function computeNormal(a, b, c) {
    const t1 = subtract(b, a);
    const t2 = subtract(c, b);
    const normal = vec3(cross(t1, t2));
    return normal;
}

export function averageNormals(indices, normals) {
    let index, normalsPerIndex = {};
    for (let k = 0; k < indices.length; k++) {
        index = indices[k];
        normal = normals[k];
        if (normalsPerIndex[index]) {
            normalsPerIndex[index].push(normal);
        } else {
            normalsPerIndex[index] = [];
        }
    }

    //var averageNormals;
    let sum = [0, 0, 0];
    let currentNormals;
    let average;
    let newNormals = [];
    for (index in normalsPerIndex) {
        currentNormals = normalsPerIndex[index];
        for (k = 0; k < currentNormals.length; k++) {
            sum = add(sum, currentNormals[k]);
        }

        average = mult([1 / currentNormals.length, 1 / currentNormals.length, 1 / currentNormals.length], sum);
        normalsPerIndex[index]['average'] =
            average = normalize(average);
    }
    for (let k = 0; k < indices.length; k++) {
        index = indices[k];
        newNormals.push(normalsPerIndex[index]['average']);
    }
    return newNormals;
}

/************************************************************************/

export function getUV(p) {
    const x = p[0];
    const y = p[1];
    const z = p[2];

    const u = (Math.atan2(x, z) / (2 * Math.PI)) + 0.5;
    const v = 0.5 - (Math.asin(y) / Math.PI);
    return [u, v]
}

export function XYtoUV(p) {
    return [p[0], p[1]];
}

export function XZtoUV(p) {
    return [p[0], p[2]];
}

export function YZtoUV(p) {
    return [p[1], p[2]];
}

/************************************************************************/
export function generateBuffers(meshRes) {
    var obj = {};
    obj.colors = meshRes.colors;
    obj.points = meshRes.points;
    obj.normals = meshRes.normals;
    obj.texCoords = meshRes.texCoords;

    //obj.cBuffer = getBuffer(flatten(obj.colors));
    //obj.vColor = shaderVariableToBuffer("vColor", 4);

    obj.vBuffer = getBuffer(flatten(obj.points));
    obj.vPosition = shaderVariableToBuffer("vPosition", 4);

    obj.nBuffer = getBuffer(flatten(obj.normals));
    obj.vNormal = shaderVariableToBuffer("vNormal", 3);

    if (obj.texCoords) {
        obj.tBuffer = getBuffer(flatten(obj.texCoords));
        obj.vTexCoord = shaderVariableToBuffer("vTexCoord", 2);
    }
    return obj;
}
/************************************************************************/
// MINI ENGINE for POINTS

const dimension4 = 4;
const dimension3 = 3;
const dimension1 = 1;
export function printPoints(vertices, colors, pointsizes, atlasids) {
    //vertices = flatten(vertices);
    const vBuffer = getBuffer2(vertices);
    shaderVariableToBuffer("vPosition", dimension3);

    //colors = flatten(colors); // TODO: test if call is required
    getBuffer2(colors);
    shaderVariableToBuffer("vColor", dimension4);

    //pointsizes = pointsizes;
    getBuffer2(pointsizes);
    shaderVariableToBuffer("vPointSize", dimension1);

    //atlasids = atlasids;
    getBuffer2(atlasids);
    shaderVariableToBuffer("vAtlasId", dimension1);

    drawPoints2(vBuffer, vertices, dimension3);
}

function printPoint(point) {
    let vBuffer = getBuffer2(point.position.value);
    shaderVariableToBuffer("vPosition", dimension);

    getBuffer2(point.color.value);
    shaderVariableToBuffer("vColor", 4);

    drawPoints2(vBuffer, point.position.value);
}


export function printLayers(layers) {
    for (let indexLayer = 0; indexLayer < layers.length; indexLayer++) {
        const layer = layers[indexLayer];
        const vBuffer = getBuffer2(layer.vertices);
        shaderVariableToBuffer(`layer${indexLayer}_vPosition`, dimension3);

        getBuffer2(layer.colors);
        shaderVariableToBuffer(`layer${indexLayer}_vColor`, dimension4);

        getBuffer2(layer.pointsizes);
        shaderVariableToBuffer(`layer${indexLayer}_vPointSize`, dimension1);

        getBuffer2(layer.atlasIds);
        shaderVariableToBuffer(`layer${indexLayer}_vAtlasId`, dimension1);

        getBuffer2(layer.modifieds);
        shaderVariableToBuffer(`layer${indexLayer}_vModified`, dimension1);

        drawPoints2(vBuffer, layer.vertices, dimension3);
    }
}


/************************************************************************/
/*

// RotationAngle is in radians
x = RotationAxis.x * sin(RotationAngle / 2)
y = RotationAxis.y * sin(RotationAngle / 2)
z = RotationAxis.z * sin(RotationAngle / 2)
w = cos(RotationAngle / 2)

*/