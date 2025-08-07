import { structs } from '../structs.js';

const compute = /*wgsl*/`

${structs}

var<private> rand_seed : vec2f;

fn init_rand(invocation_id : u32, seed : vec4<f32>) {
  rand_seed = seed.xz;
  rand_seed = fract(rand_seed * cos(35.456+f32(invocation_id) * seed.yw));
  rand_seed = fract(rand_seed * cos(41.235+f32(invocation_id) * seed.xw));
}

fn rand() -> f32 {
  rand_seed.x = fract(cos(dot(rand_seed, vec2f(23.14077926, 232.61690225))) * 136.8168);
  rand_seed.y = fract(cos(dot(rand_seed, vec2f(54.47856553, 345.84153136))) * 534.7645);
  return rand_seed.y;
}


@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) global_invocation_id : vec3<u32>
) {
    let idx = global_invocation_id.x;

    init_rand(idx, params.seed);

    var particle = data.particles[idx];

    // Apply gravity
    particle.velocity.z = particle.velocity.z - params.deltaTime * 0.5;

    // Basic velocity integration
    particle.position = particle.position + params.deltaTime * particle.velocity;

    // Age each particle. Fade out before vanishing.
    particle.lifetime = particle.lifetime - params.deltaTime;
    particle.color.a = smoothstep(0.0, 0.5, particle.lifetime);

    // If the lifetime has gone negative, then the particle is dead and should be
    // respawned.
    if (particle.lifetime < 0.0) {
      // Use the probability map to find where the particle should be spawned.
      // Starting with the 1x1 mip level.
      var coord : vec2<i32>;
      for (var level = u32(textureNumLevels(texture) - 1); level > 0; level--) {
        // Load the probability value from the mip-level
        // Generate a random number and using the probabilty values, pick the
        // next texel in the next largest mip level:
        //
        // 0.0    probabilites.r    probabilites.g    probabilites.b   1.0
        //  |              |              |              |              |
        //  |   TOP-LEFT   |  TOP-RIGHT   | BOTTOM-LEFT  | BOTTOM_RIGHT |
        //
        let probabilites = textureLoad(texture, coord, level);
        let value = vec4<f32>(rand());
        let mask = (value >= vec4<f32>(0.0, probabilites.xyz)) & (value < probabilites);
        coord = coord * 2;
        coord.x = coord.x + select(0, 1, any(mask.yw)); // x  y
        coord.y = coord.y + select(0, 1, any(mask.zw)); // z  w
      }
      let uv = vec2f(coord) / vec2f(textureDimensions(texture));
      particle.position = vec3f((uv - 0.5) * 3.0 * vec2f(1.0, -1.0), 0.0);
      particle.color = textureLoad(texture, coord, 0);
      particle.velocity.x = (rand() - 0.5) * 0.1;
      particle.velocity.y = (rand() - 0.5) * 0.1;
      particle.velocity.z = rand() * 0.3;
      particle.lifetime = 0.5 + rand() * 3.0;
    }

    // Store the new particle value
    data.particles[idx] = particle;
}
`;

export default compute;
