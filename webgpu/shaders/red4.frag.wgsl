@stage(fragment)
fn main(@location(0) Color: vec4<f32>) -> @location(0) vec4<f32> {
    return Color;
    //return vec4<f32>(sin(3.0), 0.0, 0.0, 1.0);
}

