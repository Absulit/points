@group(0) @binding(0) var myTexture: texture_2d<f32>;

@stage(fragment)
fn main(@location(0) Color: vec4<f32>) -> @location(0) vec4<f32> {
    return Color;
    //return vec4<f32>(sin(3.0), 0.0, 0.0, 1.0);
}

