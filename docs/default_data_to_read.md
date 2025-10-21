# Default data available to read

## Params Uniform

Globally there's a uniform struct called `Params` and its instance called `params` that has a few valuable properties to read by default. These values are initialized by the `Points` class and also updated in the `Points.update()` method.

```rust
struct Params {
    time:f32,
    delta:f32,
    epoch:f32,
    screen:vec2f,
    mouse:vec2f,
    mouseClick:f32,
    mouseDown:f32,
    mouseWheel:f32,
    mouseDelta:vec2f,
}
```

| Name          | Description                               | ex. value     |
| ------------- |:-------------                             | -----:        |
| time          | seconds since the app started             | 10.11         |
| delta         | milliseconds since last rendered frame    | 0.16          |
| epoch         | seconds since jan 1st 1970 UTC            | 1674958734.777|
| screen        | pixels in x and y dimensions              |    800, 600   |
| mouse         | mouse coordinates from (0, 0) to screen   |    100, 150   |

```rust
// frag.js
// reading params in the fragment shader
let time = params.time;
```

---

## Mesh Uniform
If you add a mesh to a RenderPass with one of the add* methods like `addCube`, `addSphere`, `addMesh`, the first parameter is a name, this name is an identifier inside the shaders with an id that can be compared with the id parameter in the vertex main function. This can be useful to add conditional behavior like rotating a specific mesh instance, or when the id value is passed from the vertex to the fragment shader, is useful to apply a different block of code and therefore paint the mesh differently.


```rust
// from examples/cube1/cube_renderpass/vert.js
if(id == mesh.cube1){
    angleZ = params.time * 0.1854;
    angleY = params.time * 0.694222;
    angleX = params.time * 0.4865;
}

// from examples/cube1/cube_renderpass/frag.js
if(id == mesh.cube1){
    baseColor = vec4(a*f, d*c*f, f, 1);
}
let finalColor = baseColor.rgb * diffuse;

```

## Parameters in vert.js that go to frag.js

### vert.js

The vertex shader has this set of parameters initialized in the main function: position, color, uv, vertex_index.

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

The `defaultVertexBody` returns a `Fragment` struct that provides the parameters for `frag.js` , it adds a `ratio` parameter with the ratio of the width and height of the canvas, and the mouse position as a `vec2<f32>` . The mouse position is different from the `params.mouse.x` and `params.mouse.y` , but it uses its values to calculate them in the UV space. The uvr is ratio corrected, meaning that if your canvas is wider than taller, a portion of the uv will be out of bounds to mantain the aspect ratio.

```rust
// defaultStructs.js
struct Fragment {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>,          // vertex color
    @location(1) uv: vec2<f32>,             // uv coordinate
    @location(2) ratio: vec2<f32>,          // relation between `params.screen.x` and `params.screen.y`
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
