# Code Setup

Steps after installing. Here you will actually create the application and add the vertex, fragment and compute shaders.

[code: examples_tutorial/cdn/main.js](examples_tutorial/cdn/main.js)


```js
// this is your main.js file
// import the `Points` class

import Points, { RenderPass } from 'points';

// reference the canvas in the constructor
const points = new Points('canvas');

// create your render pass with three shaders as follow
const renderPasses = [
    new RenderPass(
        /*wgsl*/ `
            // add @vertex string
            @vertex
            fn main(
                @location(0) position: vec4f,
                @location(1) color: vec4f,
                @location(2) uv: vec2f,
                @builtin(vertex_index) vertexIndex: u32
            ) -> Fragment {
                return defaultVertexBody(position, color, uv);
            }
        `,
        /*wgsl*/`
            // add @fragment string
            @fragment
            fn main(
                @location(0) color: vec4f,
                @location(1) uv: vec2f,
                @location(2) ratio: vec2f,  // relation between params.screen.x and params.screen.y
                @location(3) uvr: vec2f,    // uv with aspect ratio corrected
                @location(4) mouse: vec2f,
                @builtin(position) position: vec4f
            ) -> @location(0) vec4f {
                return color;
            }
        `,
        /*wgsl*/`
            // add @compute string (this can be null)
        `
    )
];

// call the `POINTS` init method and then the update method
async function init(){
    await points.init(renderPasses);
    update();
}
init();

// call `points.update()` methods to render a new frame
function update() {
    points.update();
    requestAnimationFrame(update);
}
```

If the shader is running properly you should see this: [Shader Example](https://absulit.github.io/points/examples/index.html#demo_6)
