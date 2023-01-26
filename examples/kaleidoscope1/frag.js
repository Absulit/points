import defaultStructs from '../../src/shaders/defaultStructs.js';
import { fnusin } from '../../src/shaders/defaultFunctions.js';
import { RGBAFromHSV } from '../../src/shaders/color.js';

const frag = /*wgsl*/`

${defaultStructs}

${fnusin}
${RGBAFromHSV}

// // Single axis mirror (x-axis)
// fn mirrorH(uv:vec2<f32>, offset: f32) -> vec2<f32> {
//     return vec2(abs( (uv.x % 1.0) - 0.5) + offset, uv.y);
// }

// fn mirror(uv:vec2<f32>, offset: f32, angle: f32) -> vec2<f32>  {
//     // Rotate the input point by the given angle
//     let rotationMatrix = mat2x2(cos(angle), sin(angle), -sin(angle), cos(angle));
//     let rotatedP = rotationMatrix * uv;

//     // Mirror the rotated point horizontally
//     let mirroredP = vec2(abs((rotatedP.x % 1.0) - 0.5) + offset, rotatedP.y);

//     // Return the mirrored and rotated point
//     return mirroredP;
// }

fn rotate(p:vec2<f32>, angle:f32)  -> vec2<f32> {
  let rotationMatrix = mat2x2(cos(angle), sin(angle), -sin(angle), cos(angle));
  return rotationMatrix * p;
}

// Declare a function to mirror a 2D point horizontally
fn mirror(p:vec2<f32>, offset:f32) -> vec2<f32>  {
  return vec2(abs((p.x % 1.0) - 0.5) + offset, p.y);
}

// Declare a function to generate a gradient color
fn gradient(p:vec2<f32>, color1:vec4<f32>, color2:vec4<f32>) -> vec4<f32> {
  return mix(color1, color2, p.y);
}



@fragment
fn main(
        @location(0) Color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    var texCoord:vec2<f32> = uv;

    texCoord -= ratio * .5;
    var angle:f32 = fnusin(.1) * 2 * 3.14 ;

    // Initialize the color accumulator
    var color = vec4(0.0);

    // Set the number of kaleidoscope segments
    let segments = i32(48 * fnusin(.1)) + 3;

    // Calculate the rotation angle for each segment
    let angleStep = radians(360.0 / f32(segments));

    // Generate a color for each mirrored and rotated texture coordinate
    for (var i = 0; i < segments; i++) {
        let segmentAngle = f32(i) * angleStep;
        let rotatedCoord = rotate((texCoord) / params.sliderB , angle + segmentAngle);
        let mirroredTexCoord = mirror(rotatedCoord, 0.0);
        let pattern = mirroredTexCoord.x  * fnusin(fract(rotatedCoord.x * rotatedCoord.x));
        //color += gradient(mirroredTexCoord, vec4(1.0, 0.0, 0.0, .1), vec4(0.0, 0.0, 1.0, .1));
        //color += vec4(1-(pattern), pattern * uv.x, 0, 1);
        color += vec4(pattern);
    }

    // Average the generated colors
    color /= f32(segments);

    // Set the fragment color to the averaged color

    // 0.3252
    // 0.4668

    //return vec4(rotate(texCoord + vec2(-.5,-.5), angle), 0,1);
    //return RGBAFromHSV(color.a - (0.3252 + (0.1416 * fnusin(1)) ), 1, color.a);
    //return mix(RGBAFromHSV(color.a - 0.3252, 1, color.a), RGBAFromHSV(color.a - params.sliderA, 1, color.a), color.a);
    return mix(vec4(1,0,0,1), vec4(1,1,0,1), 1-color.a);
}
`;

export default frag;
