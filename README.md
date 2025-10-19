# POINTS

`POINTS` is a library that uses WebGPU and allows you to create shaders without worrying too much about the setup.

# Main Audience

The library is for Generative Art, so in general for Creative Coders, for Programmers/Software people who like the arts, and Artists who like to code.

People who just want to create nice live graphics and use mathematics to achieve this.

There's also a strong case for people who wants to create an application that harness the power of a Compute Shader. So a Software Engineer or Mathematician who has to make heavy calculations can do it with this library.

You can code freely without the use of any of the provided [support modules (math, color, image, effects, noise, sdf, etc)](#support-modules) or you can use them and have a little bit less of code in the shader. You can of course create your own modules and import them in the same way.

# Gallery

https://github.com/Absulit/points/assets/233719/c7c164be-7b69-4277-a80c-ce458e751966


# Examples

<div>
    <a href="https://absulit.github.io/points/examples/index.html#base">
        <img src="./docs/assets/base_demo.png" alt="base demo image" width="200"/>
    </a>
    <a href="https://absulit.github.io/points/examples/index.html#bloom1">
        <img src="./docs/assets/bloom1.png" alt="image with bloom" width="200"/>
    </a>
    <a href="https://absulit.github.io/points/examples/index.html#imagetexture2">
        <img src="./docs/assets/imagetexture2.png" alt="image with effect" width="200"/>
    </a>
    <a href="https://absulit.github.io/points/examples/index.html#imagetexture3">
        <img src="./docs/assets/imagetexture3.png" alt="image with distortion" width="200"/>
    </a>
</div>
<div>
    <a href="https://absulit.github.io/points/examples/index.html#dithering1">
        <img src="./docs/assets/dithering1.png" alt="image with dithering effect 1" width="200"/>
    </a>
    <a href="https://absulit.github.io/points/examples/index.html#dithering2">
        <img src="./docs/assets/dithering2.png" alt="image with dithering effect 2" width="200"/>
    </a>
    <a href="https://absulit.github.io/points/examples/index.html#dithering3_1">
        <img src="./docs/assets/dithering3.png" alt="image with dithering effect 3" width="200"/>
    </a>
    <a href="https://absulit.github.io/points/examples/index.html#noise1">
        <img src="./docs/assets/noise1.png" alt="image with noise layered" width="200"/>
    </a>
</div>

All examples are live here: https://absulit.github.io/points/examples/

# Requirements

## A compatible WebGPU browser since it's currently in development

Currently working on Chrome 113 (Windows and Mac tested)

There's progress on Firefox Nightly but not all is working yet.

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


- [Workflow](docs/workflow.md)
- [API docs](https://absulit.github.io/points/apidocs/index.html)


# Installation

[examples_tutorial](examples_tutorial) has a directory per type of installation:

### cdn (importmap) [code: examples_tutorial/cdn/](examples_tutorial/cdn/)

---

> **Note:**  "points" is the required and main library.
 The others are helper libraries for shaders but not required.

---
```html
<script type="importmap">
    {
        "imports": {
            "points": "https://cdn.jsdelivr.net/npm/@absulit/points/build/points.min.js",

            "points/animation": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/animation.min.js",
            "points/audio": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/audio.min.js",
            "points/color": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/color.min.js",
            "points/debug": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/debug.min.js",
            "points/effects": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/effects.min.js",
            "points/image": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/image.min.js",
            "points/math": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/math.min.js",
            "points/noise2d": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/noise2d.min.js",
            "points/classicnoise2d": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/classicnoise2d.min.js",
            "points/classicnoise3d": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/classicnoise3d.min.js",
            "points/random": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/random.min.js",
            "points/sdf": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/sdf.min.js"
        }
    }
</script>

```

### npm [code: examples_tutorial/npm/](examples_tutorial/npm/)

---

> **Note:** if you copy the example directory you can just run `npm install` and `npm start`

---

1. create `index.html` and `main.js`

    Add main as module in `index.html`

```html
<script type="module" src="main.js"></script>
```

2. Install `points`
```sh
npm init

# select only one of the following two
npm i @absulit/points # npm package
npx jsr add @absulit/points # or jsr package

```

3. Add in `package.json` (so parcel can recognize the paths)

```json
{
    "alias": {
        "points": "@absulit/points/build/points.min.js",
        "points/animation": "@absulit/points/build/core/animation.min.js",
        "points/audio": "@absulit/points/build/core/audio.min.js",
        "points/color": "@absulit/points/build/core/color.min.js",
        "points/debug": "@absulit/points/build/core/debug.min.js",
        "points/effects": "@absulit/points/build/core/effects.min.js",
        "points/image": "@absulit/points/build/core/image.min.js",
        "points/math": "@absulit/points/build/core/math.min.js",
        "points/noise2d": "@absulit/points/build/core/noise2d.min.js",
        "points/classicnoise2d": "@absulit/points/build/core/classicnoise2d.min.js",
        "points/classicnoise3d": "@absulit/points/build/core/classicnoise3d.min.js",
        "points/random": "@absulit/points/build/core/random.min.js",
        "points/sdf": "@absulit/points/build/core/sdf.min.js"
    }
}
```

4. Add/Create `jsconfig.json` (for intellisense)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
        "points": ["node_modules/@absulit/points/build/points.js"],
        "points/animation": ["node_modules/@absulit/points/build/core/animation"],
        "points/audio": ["node_modules/@absulit/points/build/core/audio"],
        "points/color": ["node_modules/@absulit/points/build/core/color"],
        "points/debug": ["node_modules/@absulit/points/build/core/debug"],
        "points/effects": ["node_modules/@absulit/points/build/core/effects"],
        "points/image": ["node_modules/@absulit/points/build/core/image"],
        "points/math": ["node_modules/@absulit/points/build/core/math"],
        "points/noise2d": ["node_modules/@absulit/points/build/core/noise2d"],
        "points/classicnoise2d": ["node_modules/@absulit/points/build/core/classicnoise2d"],
        "points/classicnoise3d": ["node_modules/@absulit/points/build/core/classicnoise3d"],
        "points/random": ["node_modules/@absulit/points/build/core/random"],
        "points/sdf": ["node_modules/@absulit/points/build/core/sdf"]
    }
  }
}
```

5. `Reload Window` in vscode to reload `jsconfig.json`
    - Press `Ctrl + Shift + P` > Developer: Reload Window

6. Install parcel (or any live server that is able to recognize importmaps or path aliases)

```sh
npm install --save-dev parcel
```

7. Run live server
```sh
npx parcel index.html
```

---

> **Note:** if an error shows up after running `parcel`, delete this line ` "main": "main.js",` from package.json

---



### bun [code: examples_tutorial/bun/](examples_tutorial/bun/)

---

> **Note:** if you copy the example directory you can just run `bun install` and `bun start`

---

1. create `index.html` and `main.js`

    Add main as module in `index.html`

```html
<script type="module" src="main.js"></script>
```


2. Install `points`

```sh
bun init #select blank

# select only one of the following two
bun i @absulit/points # npm package or
bun x jsr add @absulit/points # jsr package
```



3. Add to `tsconfig.json` (for intellisense)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
        "points": ["node_modules/@absulit/points/build/points.js"],
        "points/animation": ["node_modules/@absulit/points/build/core/animation"],
        "points/audio": ["node_modules/@absulit/points/build/core/audio"],
        "points/color": ["node_modules/@absulit/points/build/core/color"],
        "points/debug": ["node_modules/@absulit/points/build/core/debug"],
        "points/effects": ["node_modules/@absulit/points/build/core/effects"],
        "points/image": ["node_modules/@absulit/points/build/core/image"],
        "points/math": ["node_modules/@absulit/points/build/core/math"],
        "points/noise2d": ["node_modules/@absulit/points/build/core/noise2d"],
        "points/classicnoise2d": ["node_modules/@absulit/points/build/core/classicnoise2d"],
        "points/classicnoise3d": ["node_modules/@absulit/points/build/core/classicnoise3d"],
        "points/random": ["node_modules/@absulit/points/build/core/random"],
        "points/sdf": ["node_modules/@absulit/points/build/core/sdf"]
    }
  }
}
```

4. Run server
```sh
bun index.html
```

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

# Repository Examples
These are the examples from the live demo page here: https://absulit.github.io/points/examples/. It's recommended to download the repo for this. You can also click the source button (`<>`) in the live examples

Source located at [examples/index.html](examples)

You can take a look at `/examples/main.js` and `/examples/index.html`

## index.html

```html
<canvas id="canvas" width="800" height="800">
    Oops ... your browser doesn't support the HTML5 canvas element
</canvas>
```

## main.js

```js
// import the `Points` class

import Points from 'points';

// import the base project
import base from '../examples/base/index.js';

// reference the canvas in the constructor
const points = new Points('canvas');
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

- [RenderPass](docs/renderpass.md)

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

- [Default data available to read](docs/default_data_to_read.md)
- [Send data into the shaders](docs/send_data_into_the_shaders.md)
- [Retrieve data from the shaders](docs/retrieve_data_from_the_shaders.md)
- [UV Coordinates and Textures Considerations](docs/uv_coordinates_and_textures_considerations.md)
- [Support Modules](docs/support_modules.md)
- [RenderPasses for Post Processing](docs/render_passes_and_post_processing.md)
- [Legacy folder (original project)](docs/legacy_folder.md)




# Collaborators

[@juulio](https://github.com/juulio)
- Documentation testing
- Verifying installation is understandable
