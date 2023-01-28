# POINTS


POINTS es ia library that uses WebGPU and allows you to create shaders without worrying too much about the setup.

You can code freely without the use of any support module (effects, noise, image, math) or you can use them and have a little bit less of code in the shader. You can of course create your own modules and import them in the same way.

# Workflow

Currently we have a workflow of data setup from Javascript and then 3 shaders:

Javascript setup and Data -> Vertex Shader -> Compute Shader -> Fragment Shader

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
- change whatever you want inside `vert.js`, `compute.js`, `frag.js`

# I want to send data into the shaders

You can call one of the following methods, you pair the data with a `key` name, and this name is the one you will reference inside the shader:

## Uniforms

Uniforms are sent separately in the `main.js` file and they are all combined in the shaders in a struct called `params`. Currently all values are `f32`. Uniforms can not be modified at runtime inside the shaders, they can only receive data from the Javascript side.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

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

A sampler for textures is sometimes required, and you need to explicitely reference it.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```

## Texture 

You can create an empty texture, which is not very useful on its own, but if you set the second parameter to true, after the Fragment Shader is printed out to screen, and it saves the output value and you can use it in the next update, so basically you can sample the value from the previous frame.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```

## TextureImage

With texture you can pass an image and sample it with the Sampler you just added.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```

## Storage

A storage is a large array with the same data type and this data can be modified at runtime inside the shaders, so in principle this is different to any other data type here where you can only send data and not modify it in the shaders, or as the uniforms where the data can only be updated from the Javascript side. You can allocate this space and use it in the shaders and the data will remain in the next update/frame call.

Common uses:

- Store particles
- Store variables
- Store positions
- Store colors
- Store results from a heavy calculation

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```


## BindingTexture

If you require to send data as a texture from the Compute Shader to the Fragment shader and you do not want to use a Storage, you can use a addBindingTexture(), then in the compute shader a variable will exist where you can write colors to it, and in the Fragment Shader will exist a variable to read data from it.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);
    //addBindingTexture

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```


## Video

You can load and play a video in the same fashion as a texture

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```

## Webcam

You can load and play a webcam in the same fashion as a texture

## Layers

A layer is basically a Storage but premade with the exact same dimension of the canvas, this for potentially create multilayered effects and require a type of temporary storage and swap values between them.

```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```






# I want to update data sent to the shaders (in the update method)


```js
// main.js
async function init() {
    shaders = base;
    points.addUniform('myKeyName', 0);

    // more init code
    await points.init(shaders.vert, shaders.compute, shaders.frag);
    update();
}
```

```rust
// frag.js

let aValue = params.myKeyName;
```



# I want to retrieve data from the shaders

Currently not available, but it will in the future.

# UV Coordinates and Textures Considerations

Textures as images, video and webcam are vertically flipped, this is part of the WebGPU spec. The coordinate system is UV, where the origin is bottom left. The library uses UV for almost everything, and if there's a function that is not following this spec it will later. So all ranges go from 0..1, origin (0,0) being bottom left, and 1,1 being top right.

If you load your image and is not showing, it's probably beyond the bottom left.

A function was created to flip the image and place it in the right coordinate in the UV space, this function is called `texturePosition` and you can take a look at how it works in `examples/imagetexture1/frag.js` where it works as a `textureSample` function on steroids, just to fix the coordinates and crop it.


# Legacy

It was originally a grid made in Javascript with a bit of WebGL but it's very slow, it still has value so it's stored in the Legacy folder. It's now used as reference for effects and is also useful for learning purposes.
