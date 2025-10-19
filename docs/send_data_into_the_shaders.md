# Send data into the shaders

You can call one of the following methods, you pair the data with a `key` name, and this name is the one you will reference inside the shader:

---

> **Note:** all the `set*()` methods add the variables/buffers/data into all the shaders in all `RenderPass` passes.

---

## Uniforms - setUniform

Uniforms are sent separately in the `main.js` file and they are all combined in the shaders in the struct called `params` . By default, all values are `f32` if no Struct or Type is specified in the third parameter. If values have more than one dimension (`array`, `vec2f`, `vec3f`, `vec4f`...) the data has to be send as an array. Uniforms can not be modified at runtime inside the shaders, they can only receive data from the JavaScript side.


```js
// main.js
let valueToUpdate = 10;

async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    points.setUniform('myKeyName', 0); // 0 is your default value
    points.setUniform('myTestVec2', [0.2, 2.1], 'vec2f'); // array of lenght 2 as data
    points.setUniform('myTestStruct', [99, 1, 2, 3], 'MyTestStruct'); // prop value is 99 and the rest is a vec3f

    // valueToUpdate value 10
    points.setUniform('valueToUpdate', myKeyNameValue);

    // more init code
    await points.init(renderPasses);
    update();
}

function update() {
    valueToUpdate += 1;
    // updated valueToUpdate value increases on each frame
    points.setUniform('valueToUpdate', valueToUpdate);

    // more update code
    points.update();
    requestAnimationFrame(update);
}
```

```rust
// frag.js

struct MyTestStruct {
    prop: f32,
    another_prop: vec3f
}

let aValue = params.myKeyName; // 0

let bValue = params.myTestVec2; // 0.2, 2.1

let cValue1 = params.myTestStruct.prop; // 99
let cValue2 = params.myTestStruct.another_prop; // 1, 2, 3

// value is read the same way, but will vary per frame
let dValue = params.valueToUpdate;
```

## Sampler - setSampler

A sampler for textures is sometimes required, and you need to explicitly reference it.

Don't name it just `sampler` , because that's the data type inside WGSL. `POINTS` will throw an exception if you do.

A descriptor is assigned by default, if you want to sample your image in a different way, you can take a look at [GPUTextureDescriptor](https://gpuweb.github.io/gpuweb/#texture-creation) in the WGSL docs.

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

    points.setSampler('mySampler', descriptor);

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let rgba = textureSample(texture, mySampler, uv);
```

## Texture - setTexture2d

You can create an empty texture, which is not very useful on its own, but if you set the second parameter to true, after the Fragment Shader is printed out to screen, it saves the output value to this texture and you can use it in the next update call, so basically you can sample the value from the previous frame.

There's also a third parameter that signals the texture to only capture that RenderPass index from your list of renderPasses (if you have multiple), if you don't pass that parameter, the texture ( in this case named `feedbackTexture`) will be overwriten by the next `RenderPass`. Useful if you want to send that renderPass output texture to a future `RenderPass`.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    points.setTexture2d('feedbackTexture', true, 0);

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// compute.js
let rgba = textureSampleLevel(feedbackTexture, feedbackSampler, vec2<f32>(0,0),  0.0);
```

## TextureImage - setTextureImage

With `setTextureImage` you can pass an image and sample it with the Sampler you just added.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    // await since the resource is async we need to wait for it to be ready
    await points.setTextureImage('image', './../img/absulit_800x800.jpg');

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

## Texture2dArray - setTextureImageArray

With `setTextureImageArray` you can send a list of images of the same dimensions to wgsl and access each one of them with an index.


```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    const paths = ['./image1.jpg', './image2.jpg'];
    // await since the resource is async we need to wait for it to be ready
    await points.setTextureImageArray('images', paths); // texture array is named `images`

    // more init code
    await points.init(renderPasses);
    update();
}
```


```rust
// frag.js
// 0 is the index of image1.jpg, 1 is the index of image2.jpg
let image1Color = textureSample(images, aSampler, imageUV, 0);
let image2Color = textureSample(images, aSampler, imageUV, 1);
```

## Storage - setStorage

A storage is a large array with the same data type and this data can be modified at runtime inside the shaders, so in principle this is different to any other data type here where you can only send data and not modify it in the shaders, or as the uniforms where the data can only be updated from the JavaScript side. You can allocate this space and use it in the shaders and the data will remain in the next update/frame call.

Common uses:

* Store particles
* Store variables
* Store positions
* Store colors
* Store results from a heavy calculation in the compute shader


```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    const numPoints = 800 * 800;
    points.setStorage('value_noise_data', `array<f32, ${numPoints}>`);
    points.setStorage('variables', 'Variable');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// compute.js outside the main function in the shader

// declare struct referenced here:
// points.setStorage('variables', 1, 'Variable', 1);
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

You can also add a default type instead of a custom struct in `structName`:

```js
points.setStorage('myVar', 'f32');
points.setStorage('myVar2', 'vec2f');
```

## StorageMap - setStorageMap

Creates a Storage in the same way as a `setStorage` does, except it can be set with data from the start of the application.

---

> **WARNING**: `setStorage` tends to slow the application if the data to update is too big, so be aware.

---

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    points.setStorageMap('values', [1.0, 99.0], 'array<f32, 2>');

    // more init code


    // this is before any GPU calculation, so it's ok
    let data = [];
    let dataAmount = 800 * 800;
    for (let k = 0; k < dataAmount k++) {
        data.push(Math.random());
    }
    // it doesn't require size because uses the data to size it
    points.setStorageMap('rands', data, `array<f32, ${dataAmount}>`);

    await points.init(renderPasses);
    update();
}

// if the amount of data is way too large, then this is a performance bottleneck.
function update() {
    // this is a processor hog
    let data = [];
    let dataAmount = 800 * 800;
    for (let k = 0; k < dataAmount; k++) {
        data.push(Math.random());
    }
    points.setStorageMap('rands', data);

    // more update code
    points.update();
    requestAnimationFrame(update);
}
```

```rust
// compute.js

// we retrieve the 99.0 value
let c = values[1];
let randVal = rands[0]; // or any index between 0 and 800 * 800
```

## BindingTexture - setBindingTexture

If you require to send data as a texture from the Compute Shader to the Fragment shader and you do not want to use a Storage, you can use a `setBindingTexture()` , then in the compute shader a variable will exist where you can write colors to it, and in the Fragment Shader will exist a variable to read data from it.

---

> **Note:** Currently only supporting creating a write texture on Compute shader and a read texture on Fragment shader.

---


```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];

    // First parameter goes to Compute Shader, second to Fragment Shader
    points.setBindingTexture('outputTex', 'computeTexture');

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

## Video - setTextureVideo

You can load and play a video in the same fashion as a texture. The video is updated with a new value every frame.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    await points.setTextureVideo('video', './../assets_ignore/VIDEO0244.mp4');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let rgbaVideo = textureSampleBaseClampToEdge(video, feedbackSampler, fract(uv));
```

## Webcam - setTextureWebcam

You can load and play a webcam in the same fashion as a texture. The webcam is updated with a new value every frame.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    await points.setTextureWebcam('webcam');

    // more init code
    await points.init(renderPasses);
    update();
}
```

```rust
// frag.js
let rgbaWebcam = textureSampleBaseClampToEdge(webcam, feedbackSampler, fract(uv));
```

## Audio - setAudio

You can load audio and use its data for visualization.

```js
// index.js
let audio = points.setAudio('myAudio', './../../audio/cognitive_dissonance.mp3', volume, loop, false);
```


With the `myAudio` name, a `Sound` type named `myAudio` is created. In the future it will have more information but now it only has the `data` property. `data` is an `array<f32, 2048>`, but it's not completely filled with data, it's only filled up to `params.myAudioLength`, (`myAudio` used as prefix for each different audio) and then each of these values has a max of 256, so if you want something like a percentage, you have to divide the value at a certain index between 256
```rust
let audioX = audio.data[ u32(uvr.x * params.audioLength)] / 256;
```


---

> **Note:** The `points.setAudio` method returns a `new Audio` reference, you are responsible to start and stop the audio from the JavaScript side, if you require to start and stop a sound by creating a call from the shaders, please check the `Events - addEventListener` section

---

## Events - addEventListener

An event is an asynchronous message that can be send from the WGSL shaders to the JavaScript code. It works in a very similar way as to listen for a click in JavaScript or a screen resize, you call a `addEventListener`, but the parameters and its use change a bit. In the code below, the first parameter is the name of the event you , the event is fired by **you**, so this name currently has no predefined names like 'click', or 'mouse over', you have to define them and dispatch them.

The second parameter is the data (if any) that you will send from the WGSL shaders, this data is returnes as an array, so you have to acces each item by its index.

The last parameter is the amount of items in this array you are expecting. All items are `f32`.

```js
// as in examples\events1\index.js
points.addEventListener(
    'right_blink', // name of the event (and name of a storage)
    data => { // data returned after the event and callback
        console.log('---- Right Circle');
    },
    4 // size of the data to return
);
```

To fire an event you first need to declare the listener. The name used in the listener is also used as storage buffer that you can manipulate to dispatch the event.

The event has the following structure:

```rust
// as in src\core\defaultStructs.js
struct Event {
    updated: u32,
    data: array<f32>
}
```

To actully fire an event you have to do as follows:

```rust
right_blink.data[0] = 2; // some data
right_blink.data[1] = 2; // some data
right_blink.updated = 1; // update this property to something diff than `0`
```

By just simply changing the value of `updated` to a non zero, the library knows this event has been updated, and will dispatch the event immediately in JavaScript, so the `console.log` will print the text in the JavaScript Console. `updated` will be set as zero in the next frame, and if not updated the library then knows it doesn't have to do anything.


## Layers - setLayers

A layer is basically a Storage but pre-made with the exact same dimension of the canvas, this for potentially create multi-layered effects that require a type of temporary storage and swap values between them. All items are `vec4<f32>`

To access a layer the first bracket of the array is the layer index and the second is the index of the `vec4<f32>` item you want to access.

```js
// main.js
async function init() {
    let renderPasses = [shaders.vert, shaders.compute, shaders.frag];
    points.setLayers(2);

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

By default the screen is covered by only two triangles. To display 2d data like the shaders do you don't need a lot of triangles, but if you want to make an effect that manipulates the triangles via `vert.js` you can increase the resolution of the mesh by calling `setMeshDensity` . The following example shows how to increase the mesh density, and `vert.js` manipulates its vertices.

```js
// check example/mesh1
shaders = mesh1;
points.setMeshDensity(20, 20);
```

