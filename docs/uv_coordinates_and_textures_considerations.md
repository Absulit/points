# UV Coordinates and Textures Considerations

## texture method from 'points/image'

Textures as images, video and webcam are vertically flipped, this is part of the WebGPU spec. The coordinate system is UV, where the origin is bottom left. The library uses UV for almost everything, and if there's a function that is not following this spec it will later. So all ranges go from 0..1, origin (0, 0) being bottom left, and 1, 1 being top right.

If you load your image and is not showing, it's probably beyond the bottom left.

A function was created to flip the image and place it in the right coordinate in the UV space, this function is called `texture` from the `points/image` module, you can take a look at how it works in `examples/imagetexture1/frag.js` where it works as a `textureSample` function on steroids, just to fix the coordinates and crop it.

## HDR output

If you need to visually output data beyond a normal `vec4f` that ranges from 0..1 you can change it using the `PresentationFormat` class properties, along with the `Points.presentationFormat` attribute. This is useful for effects like bloom where the brightness goes beyond the normal scale and that would be clamped by default. For this use `PresentationFormat.RGBA16FLOAT` or `RGBA32FLOAT`.

You can take a look at the Bloom2 example that uses `RGBA16FLOAT` for this, so the values that are beyond a certain point of 1.0, are then considered for the bloom passes.

[🔗 see Bloom 2 Example](https://absulit.github.io/points/examples/index.html#bloom2)

The Bloom1 example works different, it's not a true bloom like Bloom 2, it works naively, it affects all the bright elements regarding of the intensity; it doesn't go beyond 1.0.
