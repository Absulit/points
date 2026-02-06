# Steps after installing

Here you will actually create the application and add the vertex, fragment and compute shaders.

You might need a few resources to learn about shaders or WebGPU in general. You can take a look at [WebGPU Fundamentals](https://webgpufundamentals.org/) but this is a low level guide and you might not need everything from there because POINTS wraps and simplifies a lot of these concepts, but I would recommend the following lessons:

- [WGSL](https://webgpufundamentals.org/webgpu/lessons/webgpu-wgsl.html) the programming language used in the shaders and very important in compute shaders.

- [WebGPU from WebGL](https://webgpufundamentals.org/webgpu/lessons/webgpu-from-webgl.html) If you already know WebGL.


[code: examples_tutorial/cdn/main.js](examples_tutorial/cdn/main.js)

Bellow is basically the same code from the examples like cdn, npm and bun, but what I want you see here and understand is that this is where your main application lives. The vertex, fragment and compute shaders are strings, you can extract them and move them to separate files for convenience, this is what I do in the main examples folder where inside a vert.js, frag.js and compute.js there's a string exported const.

Each string must have this same structure, a function named `main` (this currently can't be changed, but will be optional later) and the parameters it receives; several of the repo examples have a different size of @location parameters, but the order is the same. You can remove the compute shader entirely and send a `null`, but the application will fail if you ommit the other two.


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
            fn main(in:VertexIn) -> FragmentIn {
                return defaultVertexBody(in.position, in.color, in.uv, in.normal);
            }
        `,
        /*wgsl*/`
            // add @fragment string
            @fragment
            fn main(in:FragmentIn) -> @location(0) vec4f {
                return in.color;
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
    points.update(update);
}
init();

// call `points.update()` methods to render a new frame
function update() {
    // update uniforms and other animation variables
}
```

If the shader is running properly you should see this: [Shader Example](https://absulit.github.io/points/examples/index.html#demo_6)
