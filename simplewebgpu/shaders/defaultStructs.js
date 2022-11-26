const defaultStructs = /*wgsl*/`

struct Fragment {
    @builtin(position) Position: vec4<f32>,
    @location(0) Color: vec4<f32>,
    @location(1) uv: vec2<f32>,
    @location(2) ratio: f32,
    @location(3) mouse: vec2<f32>
}

// struct Color{
//     r: f32,
//     g: f32,
//     b: f32,
//     a: f32
// }

// struct Position{
//     x: f32,
//     y: f32,
//     z: f32,
//     w: f32
// }

// struct Vertex {
//     position: Position,
//     color: Color,
//     uv: vec2<f32>,
// }

// struct Point {
//     vertex0: Vertex,
//     vertex1: Vertex,
//     vertex2: Vertex,
//     vertex3: Vertex,
//     vertex4: Vertex,
//     vertex5: Vertex,
// }

// struct Points {
//     points: array<Point>
// }

`;

export default defaultStructs;
