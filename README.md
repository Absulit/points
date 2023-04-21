# POINTS


POINTS is a library that uses WebGPU and allows you to create shaders without worrying too much about the setup.

You can code freely without the use of any provided support module (effects, noise, image, math) or you can use them and have a little bit less of code in the shader. You can of course create your own modules and import them in the same way.

# Examples

<div>
    <img src="./docs/base_demo.png" alt="base demo image" width="200"/>
    <img src="./docs/bloom1.png" alt="image with bloom" width="200"/>
    <img src="./docs/imagetexture2.png" alt="image with effect" width="200"/>
    <img src="./docs/imagetexture3.png" alt="image with distortion" width="200"/>
</div>
<div>
    <img src="./docs/dithering1.png" alt="image with dithering effect 1" width="200"/>
    <img src="./docs/dithering2.png" alt="image with dithering effect 2" width="200"/>
    <img src="./docs/dithering3.png" alt="image with dithering effect 2" width="200"/>
    <img src="./docs/noise1.png" alt="image with noise layered" width="200"/>
</div>


# Main Audience

The library is for Generative Art, so in general for Creative Coders, for Programmers/Software people who like the arts, and Artists who like to code.

People who just want to create nice live graphics and use mathematics to achieve this.

# Requirements

## A compatible WebGPU browser since it's currently in development

So far Chrome Canary seems to have the best support

More info:
https://developer.chrome.com/docs/web-platform/webgpu/

WebGPU API reference (JavaScript):
https://gpuweb.github.io/gpuweb/

WGSL reference:
https://gpuweb.github.io/gpuweb/wgsl/

## Syntax highlight and IDE

We use VSCode with [WGSL Literal](https://marketplace.visualstudio.com/items?itemName=ggsimm.wgsl-literal); if you have a different IDE with WGSL hightlight go for it.

---
> You might have noticed or will notice the modules are actually JavaScript modules and imported to vert.js, compute.js, and frag.js which are then again JavaScript files, no WGSL files. This is based on a [recommendation by Brandon Jones from Google](https://toji.github.io/webgpu-best-practices/dynamic-shader-construction.html), so we take advantage of the power of the JavaScript string interpolation, instead of creating fetch calls to import wgsl files, so we can just simply interpolate the modules in our projects. Also, there's currently no way to create or import WGSL modules in other files.
>
> The simpler route we took is just to declare a single function, struct or constant as a JavaScript export, and then import them as you do, and then interpolate the reference with the same name.
---

# Workflow

Currently, we have a workflow of data setup from JavaScript and then a RenderPass composed of 3 shaders:

JavaScript setup and Data → RenderPass (Vertex Shader → Compute Shader → Fragment Shader) → Screen Output

This data can be accessed safely in all shaders across the pipeline.

To add more shaders you need to add a new RenderPass.

# Setup 
` as in examples/basic.html`

```js
// import the `Points` class

import Points, {RenderPass} from '../src/absulit.points.module.js';

// reference the canvas in the constructor
const points = new Points('gl-canvas');

// create your render pass with three shaders as follow
const renderPasses = [
    new RenderPass(/*wgsl*/`
        // add @vertex string
    `,
    /*wgsl*/`
        // add @compute string
    `,
    /*wgsl*/`
        // add @fragment string
    `
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
```

# Setup 
` as in (examples/index.html)`

You can take a look at `/examples/main.js` and `/examples/index.html`

## index.html

```html
<canvas id="gl-canvas" width="800" height="800">
    Oops ... your browser doesn't support the HTML5 canvas element
</canvas>
```
## main.js

```js
// import the `Points` class

import Points from '../src/absulit.points.module.js';

// import the base project
import base from '../examples/base/index.js';

// reference the canvas in the constructor
const points = new Points('gl-canvas');
```

```js
async function init() {
    // the base project in composed of the 3 shaders required
    await base.init(points);
    let renderPasses = base.renderPasses || [new RenderPass(base.vert, base.compute, base.frag)]

    // we pass the array of renderPasses
    await points.init(renderPasses);

    // first call to update
    update();
}
```

```js
// call the `base.update()`, and `points.update()` methods to render a new frame
function update() {
    base.update();
    points.update();
    requestAnimationFrame(update);
}
```

```js
// call init
init();
```

# RenderPass

As shown before a `RenderPass` is a way to have a block of shaders to pass to your application pipeline and they will be executed in the order you pass them in the `Points.init()` method.

```js
let renderPasses = [
    new RenderPass(vert1, frag1, compute1),
    new RenderPass(vert2, frag2, compute2)
];

// we pass the array of renderPasses
await points.init(renderPasses);
```

You can pass a Compute Shader only, or a Vertex and Fragment together only. This way you can have a Compute Shader without visual output, create calculations and return their response values, or a regular Render Pipeline without Compute Shader calculations.


# Create your custom Shader project

1. Copy the `/examples/base/` and place it where you want to store your project.
2. Rename folder.
3. Rename the project inside `base/index.js`, that's the name going to be used in the main.js import and then assigned to the shaders variable.

```js
import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const base = { // <--- change the name `base` to anything
    vert,
    compute,
    frag,
    init: async points => {
        // ...
    },
    update: points => {
        // ...
    }
}

export default base; // <--- change the name `base` to anything
```

You can also do as in the renderpasses1 example, where you can define the full renderpass with the `RenderPass` class:

```js
const renderpasses1 = {
    /**
     * Render Passes expect to have an order
     */
    renderPasses: [
        new RenderPass(vert, frag, compute),
        // new RenderPass(vert2, frag2, compute2),
        // ...
    ],
    init: async points => {
        // ...
    },
    update: points => {
        // ...
    }
}

export default renderpasses1;

```


4. Change whatever you want inside `vert.js`, `compute.js`, `frag.js`.

# Default data available to read

## Params Uniform

Globally there's a uniform struct called `Params` and its instance called `params` that has a few valuable properties to read by default. These values are initialized by the `Points` class and also updated in the `Points.update()` method.

```rust
struct Params {
    time:f32,
    epoch:f32,
    screenWidth:f32,
    screenHeight:f32,
    mouseX:f32,
    mouseY:f32,
}
```

| Name          | Description                               | ex. value     |
| ------------- |:-------------                             | -----:        |
| time          | seconds since the app started             | 10.11         |
| epoch         | seconds since jan 1s 1970 UTC             | 1674958734.777|
| screenWidth   | pixels in x dimension                     |    800        |
| screenHeight  | pixels in y dimension                     |    600        |
| mouseX        | mouse x coordinate from 0 to screenWidth  |    100        |
| mouseY        | mouse y coordinate from 0 to screenHeight |    150        |


```rust
// frag.js
// reading params in the fragment shader
let time = params.time;
```

---

## Parameters in vert.js that go to frag.js

### vert.js

The vertex shader has this set of parameters set in the main function: position, color, uv, vertex_index.

```rust
@vertex
fn main(
    @location(0) position: vec4<f32>,       // position of the current vertex
    @location(1) color: vec4<f32>,          // vertex color
    @location(2) uv: vec2<f32>,             // uv coordinate
    @builtin(vertex_index) VertexIndex: u32 // index of the vertex
) -> Fragment {

    return defaultVertexBody(position, color, uv);
}
```

The `defaultVertexBody` returns a `Fragment` struct that provides the parameters for `frag.js`, it adds a ratio parameter with the ratio of the width and height of the canvas, and the mouse position as a `vec2<f32>`. The mouse position is different from the `params.mouseX` and `params.mouseY`, but it uses its values to calculate them in the UV space. The uv is ratio corrected, meaning that if your canvas is wider than taller, a portion of the uv will be out of bounds to mantain the aspect ratio. This might change later to a new uv[some name] to differentiate them, and still have the regular uv space to calculate the screen. Right now if you need to do that in a different canvas size rather than a 1:1 dimension, you have to use ratio to deconstruct the original value.

```rust
// defaultStructs.js
struct Fragment {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,          // vertex color
    @location(1) uv: vec2<f32>,             // uv coordinate
    @location(2) ratio: vec2<f32>,          // relation between `params.screenWidth` and `params.screenHeight`
    @location(3) uvr: vec2<f32>,            // uv with aspect ratio corrected using `ratio`
    @location(4) mouse: vec2<f32>           // mouse coordinates normalized between 0..1
}
```

### frag.js

The parameters are then received in the same order as the `Fragment` set them up

```rust
@fragment
fn main(
        @location(0) color: vec4<f32>,
        @location(1) uv: vec2<f32>,
        @location(2) ratio: vec2<f32>,
        @location(3) uvr: vec2<f32>,
        @location(4) mouse: vec2<f32>,
        @builtin(position) position: vec4<f32>
    ) -> @location(0) vec4<f32> {

    let finalColor:vec4<f32> = vec4(1., 0., 0., 1.);

    return finalColor;
}
```

---
> **Note:** you can modify these values if you need to. Currently, I don't feel the need to add more, but this might change later.
---

# Send data into the shaders

You can call one of the following methods, you pair the data with a `key` name, and this name is the one you will reference inside the shader:

---
> **Note:** all the `add*()` methods add the variables/buffers/data into all the shaders in all `RenderPass`es
---

## Uniforms - addUniform

Uniforms are sent separately in the `main.js` file and they are all combined in the shaders in the struct called `params`. Currently, by default, all values are `f32`. Uniforms can not be modified at runtime inside the shaders, they can only receive data from the JavaScript side.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    points.addUniform('myKeyName', 0); // 0 is your default value

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let aValue = params.myKeyName;
```

## Sampler - addSampler

A sampler for textures is sometimes required, and you need to explicitly reference it.

Don't name it just `sampler`, because that's the data type inside WGSL. POINTS will throw an exception if you do.

A descripttor is assigned by default, if you want to sample your image in a different way, you can take a look at [GPUObjectDescriptorBase](https://gpuweb.github.io/gpuweb/#texture-creation) in the WGSL docs.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    let descriptor = {
        addressModeU: 'clamp-to-edge',
        addressModeV: 'clamp-to-edge',
        magFilter: 'nearest',
        minFilter: 'nearest',
        mipmapFilter: 'nearest',
        //maxAnisotropy: 10,
    }

    points.addSampler('mySampler', descriptor);

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let rgba = textureSample(texture, mySampler, uv);
```

## Texture - addTexture2d

You can create an empty texture, which is not very useful on its own, but if you set the second parameter to true, after the Fragment Shader is printed out to screen, it saves the output value to this texture and you can use it in the next update call, so basically you can sample the value from the previous frame.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    points.addTexture2d('feedbackTexture', true);

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// compute.js
let rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(0,0),  0.0);
```

## TextureImage - addTextureImage

With `addTextureImage` you can pass an image and sample it with the Sampler you just added.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    // await since the resource is async we need to wait for it to be ready
    await points.addTextureImage('image', './../img/absulit_800x800.jpg');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let startPosition = vec2(.0);
let rgbaImage = texturePosition(image, mySampler, startPosition, uv, false);
```

## Storage - addStorage

A storage is a large array with the same data type and this data can be modified at runtime inside the shaders, so in principle this is different to any other data type here where you can only send data and not modify it in the shaders, or as the uniforms where the data can only be updated from the JavaScript side. You can allocate this space and use it in the shaders and the data will remain in the next update/frame call.

Common uses:

- Store particles
- Store variables
- Store positions
- Store colors
- Store results from a heavy calculation in the compute shader

---
> **Note:** This method is one with tricky parameters, it's fully documented in the module, but here is an overview:
>
> - name - name this property/variable will have inside the shader
> - size - number of items it will allocate
> - structName - You can use one of the default structs/types like `f32`, `i32`, `u32`, but if you use a more complex one you have to pair it properly with structSize. If it's a custom `struct` it has to be declared in the shader or it will throw an error.
> - structSize - if the `struct` you reference in `structName` has 4 properties then you have to add `4`. If it's only a f32 then here you should place `1`.
---
> **Note:** if the size of the storage is greater than `1` then it's created as an array in the shader and you have to access its items like an array, but if size is just `1` you can access its properties directly. Please check the following example for reference.
---
```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    const numPoints = 800*800;
    points.addStorage('value_noise_data', numPoints, 'f32', 1); // size is 640,000
    points.addStorage('variables', 1, 'Variable', 1); // size is 1

    // more init code
    await points.init(renderPasses);
    update();
}
```
```rust
// compute.js outside the main function in the shader

// declare struct referenced here:
// points.addStorage('variables', 1, 'Variable', 1);
struct Variable {
    isCreated:f32
}
```

```rust
// compute.js

// size greater than 1 Storage
let b = value_noise_data[0];

// size 1 Storage, you can access struct property
variables.isCreated = 1;
```
## StorageMap - addStorageMap

Creates a Storage in the same way as a `addStorage` does, except it can be set with data from the start of the application.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    points.addStorageMap('values', [1.0, 99.0], 'f32');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// compute.js

// we retrieve the 99.0 value
let c = values[1];
```

## BindingTexture - addBindingTexture

If you require to send data as a texture from the Compute Shader to the Fragment shader and you do not want to use a Storage, you can use a `addBindingTexture()`, then in the compute shader a variable will exist where you can write colors to it, and in the Fragment Shader will exist a variable to read data from it.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    // First parameter goes to Compute Shader, second to Fragment Shader
    points.addBindingTexture('outputTex', 'computeTexture');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// compute.js
textureStore(outputTex, vec2<u32>(0,0), vec4(1,0,0,1));
```

```rust
// frag.js
let rgba = textureSample(computeTexture, feedbackSampler, uv);
```

## Video - addTextureVideo

You can load and play a video in the same fashion as a texture. The video is updated with a new value every frame.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    await points.addTextureVideo('video', './../assets_ignore/VIDEO0244.mp4');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let rgbaVideo = textureSampleBaseClampToEdge(video, feedbackSampler, fract(uv));
```

## Webcam - addTextureWebcam

You can load and play a webcam in the same fashion as a texture. The webcam is updated with a new value every frame.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    await points.addTextureWebcam('webcam');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let rgbaWebcam = textureSampleBaseClampToEdge(webcam, feedbackSampler, fract(uv));
```

## Layers - addLayers

A layer is basically a Storage but pre-made with the exact same dimension of the canvas, this for potentially create multi-layered effects that require a type of temporary storage and swap values between them. All items are `vec4<f32>`

To access a layer the first bracket of the array is the layer index and the second is the index of the `vec4<f32>` item you want to access.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    points.addLayers(2);

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// compute.js

let point = layers[layerIndex][itemIndex];
```

## Increase mesh resolution - setMeshDensity

By default the screen is covered by only two triangles. To display 2d data like the shaders do you don't need a lot of triangles, but if you want to make an effect that manipulates the triangles via `vert.js` you can increase the resolution of the mesh by calling `setMeshDensity`. The following example shows how to increase the mesh density, and `vert.js` manipulates its vertices.

```js
// check example/mesh1
shaders = mesh1;
points.setMeshDensity(20,20);
```

# Update data sent to the shaders (in the update method)

In the same fashion as the `add*` methods, there are a couple of `update*` methods for now

`points.updateUniform();`

and

`points.updateStorageMap();`

---
> **WARNING**: updateStorage tends to slow the application if the data to update is too big, so be aware.
---

## updateUniform

```js
// main.js
let myKeyNameValue = 10;

async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    // myKeyName value 10
    points.addUniform('myKeyName', myKeyNameValue);

    // more init code
    await points.init(renderPasses);
    update();
}

function update() {
    myKeyNameValue += 1;
     // updated myKeyName value increases on each frame
    points.updateUniform('myKeyName', myKeyNameValue);

    // more update code
    points.update();
    requestAnimationFrame(update);
}
```

```rust
// frag.js
// value is read the same way, but will vary per frame
let aValue = params.myKeyName;
```
## updateStorageMap

Used in conjunction with `addStorageMap()`, but if the amount of data is way too large, then this is a performance bottleneck.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    // this is before any GPU calculation, so it's ok
    let data = [];
    for (let k = 0; k < 800*800; k++) {
        data.push(Math.random());
    }
    // it doesn't require size because uses the data to size it
    points.addStorageMap('rands', data, 'f32');

    // more init code
    await points.init(renderPasses);
    update();
}

function update() {
    // this is a processor hog
    let data = [];
    for (let k = 0; k < 800*800; k++) {
        data.push(Math.random());
    }
    points.updateStorageMap('rands', data);

    // more update code
    points.update();
    requestAnimationFrame(update);
}
```

# Retrieve data from the shaders

You can send and retrieve data from the shaders the following way:


First declare a storage as in `examples/data1/index.js`
```js
// the last parameter as `true` means you will use this `Storage` to read back
points.addStorage('resultMatrix', 1, 'Matrix', resultMatrixBufferSize, true);
```

Read the data back after modification
```js
let result = await points.readStorage('resultMatrix');
console.log(result);
```

# UV Coordinates and Textures Considerations

Textures as images, video and webcam are vertically flipped, this is part of the WebGPU spec. The coordinate system is UV, where the origin is bottom left. The library uses UV for almost everything, and if there's a function that is not following this spec it will later. So all ranges go from 0..1, origin (0,0) being bottom left, and 1,1 being top right.

If you load your image and is not showing, it's probably beyond the bottom left.

A function was created to flip the image and place it in the right coordinate in the UV space, this function is called `texturePosition` and you can take a look at how it works in `examples/imagetexture1/frag.js` where it works as a `textureSample` function on steroids, just to fix the coordinates and crop it.

# RenderPasses for Post Processing

You can already add render passes for postprocessing, you should add a new render pass as discussed in the [RenderPass](#renderpass) section, but you can also use a set of predefined renderpasses already included in the library to add a Post Processing effect by just adding a line of code. The RenderPasses2 demo has the 9 already included render passes running all at once with a few parameter:

```js
RenderPasses.grayscale(points);
RenderPasses.chromaticAberration(points, .02);
RenderPasses.color(points, .5, 1, 0, 1, .5);
RenderPasses.pixelate(points, 10, 10);
RenderPasses.lensDistortion(points, .4, .01);
RenderPasses.filmgrain(points);
RenderPasses.bloom(points, .5);
RenderPasses.blur(points, 100, 100, .4, 0, 0.0);
RenderPasses.waves(points, .05, .03);
```
The render pass takes the output from your already defined shaders as a Texture and then applies a process to create an effect. It takes a few assumptions to work interchangeably between them or in a layered way, this by using the same name for the output texture and input texture.

Also because JavaScript wraps and hides all of this process, I think it's better for you in the long run to just study and extract the postprocessing render pass and include it in your own render passes. Currently adding all 9 render passes seems to have no effect in the framerate, but this could be different in a larger project, so customizing your render passes is better.

# Legacy folder (original project)

The project was originally a grid made in JavaScript with a bit of WebGL but it's very slow, it still has value so it's stored in the Legacy folder. It's now used as reference for effects and is also useful for learning purposes.
