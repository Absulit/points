export const Point = /*wgsl*/`
struct Point{
    position:vec2<f32>,
    index: u32,
    used: u32,
}
`;

export const pointVec2 = /*wgsl*/`
fn pointVec2(point:Point) -> vec2<f32>{
    return vec2(point.x, point.y);
}
`;