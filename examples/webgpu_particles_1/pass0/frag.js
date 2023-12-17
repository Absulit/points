import { structs } from '../structs.js';

const frag = /*wgsl*/`

${structs}

@fragment
fn main(in : VertexOutput) -> @location(0) vec4<f32> {
  var color = in.color;
  // Apply a circular particle alpha mask
  color.a = color.a * max(1.0 - length(in.quad_pos), 0.0);
  return color;
}
`;

export default frag;
