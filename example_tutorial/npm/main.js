// import the `Points` class

import Points, { RenderPass } from 'points';
import { fnusin } from 'points/animation';

// reference the canvas in the constructor
const points = new Points('canvas');

// create your render pass with three shaders as follow
const renderPasses = [
    new RenderPass(/*wgsl*/`
        @vertex
        fn main(
            @location(0) position:vec4f,
            @location(1) color:vec4f,
            @location(2) uv:vec2f,
            @builtin(vertex_index) vertexIndex:u32
        ) -> Fragment {

            return defaultVertexBody(position, color, uv);
        }`,
        /*wgsl*/`
        ${fnusin}
        @fragment
        fn main(
            @location(0) color:vec4f,
            @location(1) uv:vec2f,
            @location(2) ratio:vec2f,  // relation between params.screen.x and params.screen.y
            @location(3) uvr:vec2f,    // uv with aspect ratio corrected
            @location(4) mouse:vec2f,
            @builtin(position) position:vec4f
        ) -> @location(0) vec4f {

            let cellSize = 20. + 10. * fnusin(1.);
            let a = sin(uvr.x  * cellSize) * sin(uvr.y * cellSize);
            let b = sin(uvr.x * uvr.y * 10. * 9.1 * .25 );
            let c = fnusin(uvr.x * uvr.y * 10.);
            let d = distance(a,b);
            let f = d * uvr.x * uvr.y;
            let finalColor:vec4f = vec4(a*d,f*c*a,f, 1.);

            return finalColor;
        }
        `,
        /*wgsl*/`

        @compute @workgroup_size(8,8,1)
        fn main(
            @builtin(global_invocation_id) GlobalId:vec3u,
            @builtin(workgroup_id) WorkGroupID:vec3u,
            @builtin(local_invocation_id) LocalInvocationID:vec3u
        ) {
            let time = params.time;
        }
        `,
    )
];

// call the POINTS init method and then the update method
await points.init(renderPasses);
update();

// call `points.update()` methods to render a new frame
function update() {
    points.update();
    requestAnimationFrame(update);
}
