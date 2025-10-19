# Support Modules

The Support Modules are not something that you entirely need but it offers a set of functions that you might find useful and that you will find all over the [/examples](/examples/) directory. The modules have WGSL code snippets wrapped in a JavaScript export string constant that you can embed in the shader string.

| Name          | Description                               |
| ------------- |:-------------                             |
| animation.js  | Functions that use sine and `params.time` to increase and decrease a value over time             |
| cellular2d.js | Cellular noise based on work by Stefan Gustavson (link in file)             |
| classicnoise2d.js | Classic Perlin noise based on work by Stefan Gustavson (link in file)             |
| classicnoise3d.js | Classic Perlin noise based on work by Stefan Gustavson (link in file)             |
| color.js | Color constants and functions that work with a color (vec4<f32>) input             |
| debug.js | Functions that show a cross (useful for mouse position) and a frame (useful to show frame border)             |
| defaultConstants.js | Currently it has nothing but it will have default constants for `POINTS` |
| defaultFunctions.js | Default functions for `POINTS` |
| defaultStructs.js | Default structs used in `POINTS` |
| defaultVertexStructs.js | Legacy code (will be removed)             |
| effects.js | Functions used for more elaborate effects like blur             |
| image.js | Functions that work over a texture like pixelation or sprites             |
| math.js | A few constants like PI and E and a couple of functions for now             |
| noise2d.js | Noise based on the work by Ian McEwan, Ashima Arts             |
| sdf.js | A few sdf functions             |
| valuenoise.js | // currently not working             |
| voronoi.js | Function to create a voronoi like output             |

You might want to take a look at each of the files and what they can offer:

These are still a WIP so expect changes

## How to use them

```js
// /src/core/math.js
export const PI = /*wgsl*/ `const PI = 3.14159265;`;
```

```js
// /examples/bloom`/frag.js
import {
    PI
} from '../../src/core/math.js';

// more js code

const frag = /*wgsl*/ `

// more wgsl code

${PI}

// more wgsl code

`;

export default frag;
```
