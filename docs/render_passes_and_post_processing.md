# RenderPasses for Post Processing

You can already add render passes for postprocessing, you should add a new render pass as discussed in the [RenderPass](#renderpass) section, but you can also use a set of predefined renderpasses already included in the library to add a Post Processing effect by just adding a line of code. The RenderPasses2 demo has the 9 already included render passes running all at once with a few parameter:

```js
points.addRenderPass(RenderPasses.GRAYSCALE);
points.addRenderPass(RenderPasses.CHROMATIC_ABERRATION, { distance: .02 });
points.addRenderPass(RenderPasses.COLOR, { color: [.5, 1, 0, 1], blendAmount: .5 });
points.addRenderPass(RenderPasses.PIXELATE);
points.addRenderPass(RenderPasses.LENS_DISTORTION);
points.addRenderPass(RenderPasses.FILM_GRAIN);
points.addRenderPass(RenderPasses.BLOOM);
points.addRenderPass(RenderPasses.BLUR, { resolution: [100, 100], direction: [.4, 0], radians: 0 });
points.addRenderPass(RenderPasses.WAVES, { scale: .045 });
```

The render pass takes the output from your already defined shaders as a Texture and then applies a process to create an effect. It takes a few assumptions to work interchangeably between them or in a layered way, this by using the same name for the output texture and input texture.

Also because JavaScript wraps and hides all of this process, I think it's better for you in the long run to just study and extract the postprocessing render pass and include it in your own render passes. Currently adding all 9 render passes seems to have no effect in the framerate, but this could be different in a larger project, so customizing your render passes is better.
