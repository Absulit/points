# RenderPass

A `RenderPass` is a way to have a block of shaders to pass to your application pipeline and these render passes will be executed in the order you pass them in the `Points.init()` method.

You can have a look at the full [RenderPass API here](https://absulit.github.io/points/apidocs/RenderPass.html#RenderPass).



```js
let renderPasses = [
    new RenderPass(vert1, frag1, compute1),
    new RenderPass(vert2, frag2, compute2)
];

// we pass the array of renderPasses
await points.init(renderPasses);
```

You can pass a Compute Shader only, or a Vertex and Fragment together only. This way you can have a Compute Shader without visual output, create calculations and return their response values, or a regular Render Pipeline without Compute Shader calculations.

As mentioned in [Workflow](workflow.md) the order of execution goes like this:

```
Compute Shader → Vertex Shader → Fragment Shader
```
But as you can see in the parameters, the vertex shader, and the fragment shader go first in the constructor, this is because most of the time you can create a RenderPass without a Compute Shader, so you can just call it this way:

```js
new RenderPass(vert1, frag1)
```


There's also three extra parameters in the RenderPass, these are to dispatch the Workgroups for each dimension (x, y, z) in a Compute Shader:

```js
new RenderPass(vert1, frag1, compute1, 8, 8, 1);
```

A last parameter is also included called `init`, this is made for Post Processing purposes, and a lot of examples of use are at the [RenderPasses](../src/RenderPasses.js) class, in case you want to create and use one this way, but preferably, a `new RenderPass` is enough.

## Important features of a RenderPass

A RenderPass takes charge by default of a quad mesh to display graphics, so you can just start coding in the Fragment Shader and see results, but if you need more, you can add a few 3d primitives or a custom mesh. Adding a custom primitive will remove the default quad in this RenderPass. Also to use 3d meshes and being drawn correctly, you must set `RenderPass#depthWriteEnabled` to `true`, by default is false since it's assumed a 2d workflow from the start. Depending on if you want to use the depth features, enabling or disabling this value is very useful.


```js
renderpass.depthWriteEnabled = true;
renderpass.addCube('cube0');
renderpass.addCube('cube1', { x: 0, y: 1, z: 0 });
```

## Clear or preserve previous RenderPass output

By default, when a new RenderPass runs, the content written to the screen is erased; you can preserve the content in the next RenderPass by changing the `RenderPass#loadOp` attribute to `load`, by default it's `clear`.

The `cube1` example has a great demonstration about this. It uses two RenderPass, in the first one there's a giant cube placed at the origin, in the second RenderPass there are two cubes spinning. By default the second RenderPass is `loadOp` `clear`, but in the options menu you can change the loadOp value to `load`

[🔗 see Cube 1 Example](https://absulit.github.io/points/examples/index.html#cube1)

```js
renderPass0.loadOp = 'clear'; // default
renderPass1.loadOp = 'load'; // to preserve first render pass output
```


## Lines, Points, Triangles (wireframe)

To change the way the vertex primitives are displayed use the RenderPass#topology attribute along with the `PrimitiveTopology` class. You can display, triangles (by default), points and lines. Lines could be used to display a wireframe, but it depends on the vertices order.

```js
renderPass.topology = PrimitiveTopology.POINT_LIST;
```

## Instances
If you plan to work with multiple items of the same mesh, you can use instances. By default, adding a new mesh sets its instances as `1`, and this is new draw call, so a good management of the instances is required for performance. Each method to add a mesh (plane, sphere, cube, torus, cylinder) and the same `addMesh` methods, return an object with a few properties but the most important is `instanceCount`, you can increase this value along with the amount of threads to be used in a Compute Shader (review the Particles examples) so each instance goes in par with the amount of threads available, this way a single process can run a mesh characteristics like rotation, position, color, etc.

```js
renderPass.addPlane(
    'plane',
    { x: 0, y: 0, z: 0 },
    { width: 2, height: 2 }
).instanceCount = NUMPARTICLES;

```