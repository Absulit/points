# Using the examples for a custom project

You can also use the examples structure to create a custom project. This is the structure used in the [examples page](absulit.github.io/points/examples/).

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


