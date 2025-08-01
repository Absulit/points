export { defaultVertexStructs as default };
/**
 * non used structs unless required
 * <br>
 * <br>
 * These are wgsl functions, not js functions.
 * The function is enclosed in a js string constant,
 * to be appended into the code to reference it in the string shader.
 * @module defaultVertexStructs
 */
/**
 * Unused structs for the future.
 */
declare const defaultVertexStructs: "\n\nstruct Color{\n    r: f32,\n    g: f32,\n    b: f32,\n    a: f32\n}\n\nstruct Position{\n    x: f32,\n    y: f32,\n    z: f32,\n    w: f32\n}\n\nstruct Vertex {\n    position: Position,\n    color: Color,\n    uv: vec2<f32>,\n}\n\nstruct Point {\n    vertex0: Vertex,\n    vertex1: Vertex,\n    vertex2: Vertex,\n    vertex3: Vertex,\n    vertex4: Vertex,\n    vertex5: Vertex,\n}\n\nstruct Points {\n    points: array<Point>\n}\n\n";
