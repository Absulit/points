var gl, canvas, program, vertices = [], dimension = 2,
    objects = {};

const ORIGIN = [0.0, 0.0, 0.0];
const X = [1.0, 0.0, 0.0];
const Y = [0.0, 1.0, 0.0];
const Z = [0.0, 0.0, 1.0];

function initWebGL(canvasId, depth) {
    canvas = document.getElementById(canvasId);
    gl = WebGLUtils.setupWebGL(canvas, {preserveDrawingBuffer:true, premultipliedAlpha: false });
    if (!gl) { alert("WebGL isn't available"); }
    gl.viewport(0, 0, canvas.width, canvas.height);
    if(depth){
        gl.enable(gl.DEPTH_TEST);
    }
}

function setClearColor(color) {
    gl.clearColor(color[0], color[1], color[2], 1);
}

function clearScreen() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

function getBuffer(size) {
    var size = size || flatten(vertices);
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, size, gl.STATIC_DRAW);
    return bufferId;
}

function getBuffer2(vs) {
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vs), gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER, vs, gl.STATIC_DRAW);
    return bufferId;
}

function assignShaders(vertexName, fragmentName) {
    program = initShaders(gl, vertexName, fragmentName);
    gl.useProgram(program);
}

function shaderVariableToBuffer(name, vectorLen) {
    var shaderVar = gl.getAttribLocation( program, name);
    gl.vertexAttribPointer(shaderVar, vectorLen, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(shaderVar);
    return shaderVar;
}

function drawTriangles() {
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / dimension);
}

function drawTriangles2(bufferId, vertices) {
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / dimension);
}

function drawTriangleStrip(len) {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, len);
}
function drawPoints(len) {
    gl.drawArrays(gl.POINTS, 0, len);
}

function drawPoints2(bufferId, vertices, dimension){
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.POINTS, 0, vertices.length / dimension);
}

function drawLines(len){
   gl.drawArrays(gl.LINES, 0, len);
}

function drawLines2(bufferId, vertices){
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.drawArrays(gl.LINES, 0, vertices.length / dimension);
}

function polygon(numSides, ratio, position){
    position = position || [0,0,0];
    var x = position[0],y = position[1],z = position[2];
    var k, vertices = [vec4(x, y, z,1)];
    for(k = 0; k < numSides; k++){
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

function computeNormal (a,b,c){
    var t1 = subtract(b, a);
     var t2 = subtract(c, b);
     var normal = vec3(cross(t1, t2));
     return normal;
}

function averageNormals(indices, normals){
    var index, normalsPerIndex = {};
    for(var k = 0; k < indices.length; k++){
        index = indices[k];
        normal = normals[k];
        if(normalsPerIndex[index]){
            normalsPerIndex[index].push(normal);
        }else{
            normalsPerIndex[index] = [];
        }
    }

    var averageNormals;
    var sum = [0,0,0];
    var currentNormals;
    var average;
    var newNormals = [];
    for(index in normalsPerIndex){
        currentNormals = normalsPerIndex[index];
        for(k = 0; k < currentNormals.length; k++){
            sum = add(sum, currentNormals[k]);
        }

        average = mult([1/currentNormals.length,1/currentNormals.length,1/currentNormals.length], sum);
        normalsPerIndex[index]['average'] =
        average = normalize(average);
    }
    for(var k = 0; k<indices.length; k++){
        index = indices[k];
        newNormals.push(normalsPerIndex[index]['average']);
    }
   return newNormals;
}

/************************************************************************/

function getUV(p){
    var x = p[0];
    var y = p[1];
    var z = p[2];

    var u = (Math.atan2(x, z) / (2 * Math.PI)) + 0.5;
    var v = 0.5 - (Math.asin(y) / Math.PI);
    return[u, v]
}

function XYtoUV(p){
    return [p[0], p[1]];
}

function XZtoUV(p){
    return [p[0], p[2]];
}

function YZtoUV(p){
    return [p[1], p[2]];
}

/************************************************************************/
function generateBuffers(meshRes){
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

    if(obj.texCoords){
        obj.tBuffer = getBuffer(flatten(obj.texCoords));
        obj.vTexCoord = shaderVariableToBuffer("vTexCoord", 2);
    }
    return obj;
}
