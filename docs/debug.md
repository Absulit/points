# Debug (errors, warnings and logs)

The library has been designed with ease of development in mind, one of those
features is that errors and warnings should be as clear as possible on what's
happening.

If an error occurs the library will try to explain it in the most human way,
even telling you what you might need to fix it or what you did to provoque the
error. For example, calling `setUniform` in an update without first set the
uniform before the `init` method, will result in a descriptive error telling you
exactly how to fix it.

By default in the console you will see the following printed out:

* [GPUSupportedLimits](https://developer.mozilla.org/en-US/docs/Web/API/GPUSupportedLimits)
* A list of `RenderPass` with:
    * compute
    * vertex
    * fragment

Each render pass has inside the complete string that makes the shaders,
the main structure of the shaders described by you and all the structs,
methods, and bindings added by the POINTS library. This can be perfectly
used to debug if whatever you added is actually in your shader.

This will look something like this:

**points.js:1451 Render Pass 0: (Render Pass Name 0)**

**points.js:1451 Render Pass 1: (Render Pass Name 1)**

In between parentheses, the custom name given to your `RenderPass` will be
displayed here, also its index, to help know where is what on each `RenderPass`
and shaders from that specific `RenderPass`.

Later, for a production release it's better to remove this output. You can do
this by disabling it with the `debug` property:

```js
points.debug = false;
```
