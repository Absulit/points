// import the `Points` class
import Points, { RenderPass } from 'points';

// import a function
import { fnusin } from 'points/animation';


// reference the canvas in the constructor
const points = new Points('canvas');

// create your render pass with three shaders as follow
const renderPasses = [
    new RenderPass(/*wgsl*/`
        /**
         * VertexIn
         * position: vec4f,
         * color: vec4f,
         * uv: vec2f,
         * normal: vec3f,
         * id: u32,       // mesh id
         * vertexIndex: u32,
         * instanceIndex: u32,
         */
        @vertex
        fn main(in:VertexIn) -> FragmentIn {
            return defaultVertexBody(in.position, in.color, in.uv, in.normal);
        }`,
        /*wgsl*/`
        ${fnusin} // include the function

        /**
         * VertexIn
         * position: vec4f,
         * color: vec4f,
         * uv: vec2f,
         * ratio: vec2f,  // relation between params.screen.x and params.screen.y
         * uvr: vec2f,    // uv with aspect ratio corrected
         * mouse: vec2f,
         * normal: vec3f,
         * id: u32,       // mesh or instance id
         * barycentrics: vec3f,
         */
        @fragment
        fn main(in:FragmentIn) -> @location(0) vec4f {
            let cellSize = 20. + 10. * fnusin(1.);
            let a = sin(in.uvr.x  * cellSize) * sin(in.uvr.y * cellSize);
            let b = sin(in.uvr.x * in.uvr.y * 10. * 9.1 * .25 );
            let c = fnusin(in.uvr.x * in.uvr.y * 10.);
            let d = distance(a,b);
            let f = d * in.uvr.x * in.uvr.y;
            let finalColor:vec4f = vec4(a*d,f*c*a,f, 1.);

            return finalColor;
        }
        `,
        /*wgsl*/`
        // ComputeIn
        // @builtin(global_invocation_id) GID: vec3u,
        // @builtin(workgroup_id)  in.WID: vec3u,
        // @builtin(local_invocation_id) LID: vec3u
        @compute @workgroup_size(8,8,1)
        fn main(in:ComputeIn) {
            let time = params.time;
        }
        `,
    )
];

// call the POINTS init method and then the update method
(async function init(){
    await points.init(renderPasses);
    update();
})();

// call `points.update()` methods to render a new frame
function update() {
    points.update();
    requestAnimationFrame(update);
}
