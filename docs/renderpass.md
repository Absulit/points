# RenderPass

As shown before a `RenderPass` is a way to have a block of shaders to pass to your application pipeline and these render passes will be executed in the order you pass them in the `Points.init()` method.

```js
let renderPasses = [
    new RenderPass(vert1, frag1, compute1),
    new RenderPass(vert2, frag2, compute2)
];

// we pass the array of renderPasses
await points.init(renderPasses);
```

You can pass a Compute Shader only, or a Vertex and Fragment together only. This way you can have a Compute Shader without visual output, create calculations and return their response values, or a regular Render Pipeline without Compute Shader calculations.

There's also three extra parameters in the RenderPass, these are to dispatch the workgroups for each dimension (x, y, z):

```js
new RenderPass(vert1, frag1, compute1, 800, 800, 1);
```