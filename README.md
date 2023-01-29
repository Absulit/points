# POINTS


POINTS is a library that uses WebGPU and allows you to create shaders without worrying too much about the setup.

You can code freely without the use of any support module (effects, noise, image, math) or you can use them and have a little bit less of code in the shader. You can of course create your own modules and import them in the same way.

# Examples

[videos]

# Main Audience

The library is for Generative Art, so in general for Creative Coders, for Programmers/Software people who like the arts, and Artists who like to code.

People who just want to create nice live graphics and use mathematics to achieve this.

# Workflow

Currently, we have a workflow of data setup from JavaScript and then 3 shaders:

JavaScript setup and Data → Vertex Shader → Compute Shader → Fragment Shader

This data can be accessed safely in all shaders across the pipeline. In the future there will be an option to add more shaders but now this is the basic setup.

# Requirements

## A compatible WebGPU browser since it's currently in development

So far Chrome Canary seems to have the best support

More info:
https://developer.chrome.com/docs/web-platform/webgpu/


# Setup

You can take a look at `/examples/main.js` and `/examples/index.html`

## index.html

```html
<canvas id="gl-canvas" width="800" height="800">
    Oops ... your browser doesn't support the HTML5 canvas element
</canvas>
```
## main.js

```js
// import the `Points` class, `ShaderType` not needed now, but you will later
import Points, { ShaderType } from '../src/absulit.points.module.js';

// import the base project
import base from '../src/shaders/base/index.js';

// reference the canvas in the constructor
const points = new Points('gl-canvas');
```


```js
async function init() {
    // the base project in composed of the 3 shaders required
    shaders = base;

    // currently the shaders are passed separately, this might change later
    await points.init(shaders.vert, shaders.compute, shaders.frag);

    // first call to update
    update();
}
```

```js
// call the `points.update()` method to render a new frame
function update() {
    points.update();
    requestAnimationFrame(update);
}
```

```js
// call init
init();
```

# Create your custom Shader project

- Copy the `/src/shaders/base/` and place it where you want to store your project
- rename folder
- rename the project inside `base/index.js`, that's the name going to be used in the main.js import and then assigned to the shaders variable.

```js
import vert from './vert.js';
import compute from './compute.js';
import frag from './frag.js';
const base = { // <--- change the name `base` to anything
    vert,
    compute,
    frag
}

export default base; // <--- change the name `base` to anything
```


- change whatever you want inside `vert.js`, `compute.js`, `frag.js`

# I want to send data into the shaders

You can call one of the following methods, you pair the data with a `key` name, and this name is the one you will reference inside the shader:

## Uniforms - addUniform

Uniforms are sent separately in the `main.js` file and they are all combined in the shaders in a struct called `params`. Currently all values are `f32`. Uniforms can not be modified at runtime inside the shaders, they can only receive data from the JavaScript side.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0); // 0 is your default value

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js
let aValue = params.myKeyName;
```


## Sampler

A sampler for textures is sometimes required, and you need to explicitly reference it.

Don't name it just `sampler`, because that's the data type inside WebGPU. It will throw an exception if you do.

```js
// main.js
async function init() {
    shaders = base;
    // ShaderType tells you in which shader the variable will be created
    points.addSampler('mySampler', null, ShaderType.FRAGMENT);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js
let rgba = textureSample(texture, mySampler, uv);
```

## Texture

You can create an empty texture, which is not very useful on its own, but if you set the second parameter to true, after the Fragment Shader is printed out to screen, and it saves the output value and you can use it in the next update, so basically you can sample the value from the previous frame.

```js
// main.js
async function init() {
    shaders = base;
    // ShaderType tells you in which shader the variable will be created
    points.addTexture2d('feedbackTexture', true, ShaderType.COMPUTE);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// compute.js
let rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(0,0),  0.0);
```

## TextureImage

With texture you can pass an image and sample it with the Sampler you just added.

```js
// main.js
async function init() {
    shaders = base;
    // ShaderType tells you in which shader the variable will be created
    // await since the resource is async we need to wait for it to be ready
    await points.addTextureImage('image', './../img/absulit_800x800.jpg', ShaderType.FRAGMENT);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js
    let startPosition = vec2(.0);
    let rgbaImage = texturePosition(image, aSampler, startPosition, uv / params.sliderA, false);
```

## Storage

A storage is a large array with the same data type and this data can be modified at runtime inside the shaders, so in principle this is different to any other data type here where you can only send data and not modify it in the shaders, or as the uniforms where the data can only be updated from the JavaScript side. You can allocate this space and use it in the shaders and the data will remain in the next update/frame call.

Common uses:

- Store particles
- Store variables
- Store positions
- Store colors
- Store results from a heavy calculation

Note: This method is one with tricky parameters, it's fully documented in the module, but here is an overview

- name - name this property/variable will have inside the shader
- size - number of items will allocate
- structName - You can use one of the default structs/types like f32, i32m u32, but if you use a more complex one you have to pair it property with structSize. If it's a custom struct it has to be declared in the shader or it will throw an error.
- structSize - if the structName you reference in `structName` has 4 properties then you have to add 4. If it's only a f32 then here you should place 1
shaderType - Into what shader the property/variable will be added.

Note: if the size of the storage is greater than `1` it's created as an array in the shader and you have to access it's items like an array, but if size is just `1` you can access its properties directly. Please check the following example for reference.

```js
// main.js
async function init() {
    shaders = base;

    const numPoints = 800*800;
    // ShaderType tells you in which shader the variable will be created
    points.addStorage('value_noise_data', numPoints, 'f32', 1, ShaderType.COMPUTE); // size is 640,000
    points.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE); // size is 1

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```
```rust
// declare struct referenced here:
//points.addStorage('variables', 1, 'Variable', 1, ShaderType.COMPUTE);
struct Variable{
    isCreated:f32,
}
```



```rust
// compute.js

// size greater than 1 Storage
let b = value_noise_data[0];

// size 1 Storage, you can access struct property
variables.isCreated = 1;
```


## BindingTexture

If you require to send data as a texture from the Compute Shader to the Fragment shader and you do not want to use a Storage, you can use a addBindingTexture(), then in the compute shader a variable will exist where you can write colors to it, and in the Fragment Shader will exist a variable to read data from it.

```js
// main.js
async function init() {
    shaders = base;
    // Method without `ShaderType`
    points.addBindingTexture('outputTex', 'computeTexture');

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
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


## Video

You can load and play a video in the same fashion as a texture

```js
// main.js
async function init() {
    shaders = base;
    // ShaderType tells you in which shader the variable will be created
    await points.addTextureVideo('video', './../assets_ignore/VIDEO0244.mp4', ShaderType.FRAGMENT);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js
let rgbaVideo = textureSampleBaseClampToEdge(video, feedbackSampler, fract(uv));
```

## Webcam

You can load and play a webcam in the same fashion as a texture

```js
// main.js
async function init() {
    shaders = base;
    // ShaderType tells you in which shader the variable will be created
    await points.addTextureWebcam('video', ShaderType.FRAGMENT);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js
let rgbaVideo = textureSampleBaseClampToEdge(video, feedbackSampler, fract(uv));
```



## Layers

A layer is basically a Storage but pre-made with the exact same dimension of the canvas, this for potentially create multilayered effects and require a type of temporary storage and swap values between them. All items are `vec4<f32>`

To access a layer the first bracket of the array is the layerIndex and

```js
// main.js
async function init() {
    shaders = base;
    // ShaderType tells you in which shader the variable will be created
    points.addLayers(2, ShaderType.COMPUTE);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// compute.js

let point = layers[layerIndex][itemIndex];
```


# I want to update data sent to the shaders (in the update method)

In the same fashion as the `add*` methods, there are a couple of `update*` methods for now

`points.updateUniform();`

and

`points.updateStorageMap();`

**WARNING**: updateStorage tends to slow the application if the data to update is too big, so be aware.


```js
// main.js
let myKeyNameValue = 10;

async function init() {
    shaders = base;
    // myKeyName value 10
    points.addUniform('myKeyName', myKeyNameValue);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
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



# I want to retrieve data from the shaders

Currently not available, but it will in the future.

# UV Coordinates and Textures Considerations

Textures as images, video and webcam are vertically flipped, this is part of the WebGPU spec. The coordinate system is UV, where the origin is bottom left. The library uses UV for almost everything, and if there's a function that is not following this spec it will later. So all ranges go from 0..1, origin (0,0) being bottom left, and 1,1 being top right.

If you load your image and is not showing, it's probably beyond the bottom left.

A function was created to flip the image and place it in the right coordinate in the UV space, this function is called `texturePosition` and you can take a look at how it works in `examples/imagetexture1/frag.js` where it works as a `textureSample` function on steroids, just to fix the coordinates and crop it.


# Legacy

It was originally a grid made in JavaScript with a bit of WebGL but it's very slow, it still has value so it's stored in the Legacy folder. It's now used as reference for effects and is also useful for learning purposes.
