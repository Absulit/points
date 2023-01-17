export const Point = /*wgsl*/`
struct Point{
    x: f32,
    y: f32,
    index: u32,
    isActive: u32,
}
`;

export const pointVec2 = /*wgsl*/`
fn pointVec2(point:Point) -> vec2<f32>{
    return vec2(point.x, point.y);
}
`;