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

