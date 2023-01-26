export function getShaderSource(url) {
    var result = new Promise((resolve, reject) => {

        var req = new XMLHttpRequest();

        req.onload = () => {
            resolve(req.responseText);
        };

        req.onerror = () => {
            console.error("Failed to get shader source for " + relativePath + ": " + this.statusText);
            reject(req);
        }

        req.open("GET", url, true);
        req.send(null);
    });

    return result;
};

export async function getShaderProgram(context, url) {

    const source = await getShaderSource(url);

    //=> Compile the program.
    const shader = context.createShader(context.COMPUTE_SHADER);
    context.shaderSource(shader, source);
    context.compileShader(shader);

    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
        console.error("compute shader build failed", url);
        console.error(context.getShaderInfoLog(shader));
        return null;
    }

    //=> Create the program.
    const program = context.createProgram();
    context.attachShader(program, shader);
    context.linkProgram(program);

    if (!context.getProgramParameter(program, context.LINK_STATUS)) {
        console.error("compute shader program initialization failed.", url);
        console.error(context.getProgramInfoLog(program));
        return;
    }

    return program;
}