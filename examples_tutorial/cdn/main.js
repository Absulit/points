// import the `Points` class
import Points, { RenderPass } from 'points';

// import a function
import { fnusin } from 'points/animation';

// reference the canvas in the constructor
const points = new Points('canvas');

// create your render pass with three shaders as follow
const renderPasses = [
    new RenderPass(/*wgsl*/`
        @vertex
        fn main(in:VertexIn) -> FragmentIn {
            return defaultVertexBody(in.position, in.color, in.uv, in.normal);
        }`,
        /*wgsl*/`
        ${fnusin} // include the function
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

        @compute @workgroup_size(8,8,1)
        fn main(in:ComputeIn) {
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
