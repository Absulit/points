# Memory Management

In most cases you don't have to worry about this, but there are a few scenarios
where this might be important

## Switch to a new set of RenderPass - Points.reset()

Basically if you want o load a new set of shaders you have two options:
- call the constructor again
    This will create a new instance of Points, but it will destroy the
    `GPUAdapter` and `GPUDevice`, and it will take longer to recreate and previous
    references might linger in memory.
- call the `Points.reset()` method (**recommended**)
    This removes references to all the buffers, textures, RenderPass and many
    other internal variables, but **will not** remove the references to the
    `GPUAdapter` and `GPUDevice`, so restarting the app again will be
    as fast as possible. Reset ensures that GPU memory and objects do not spike.
    You can test this in the [examples page](https://absulit.github.io/points/examples/index.html#dithering3_2), by jumping between demos.


## Remove Points instance - Points.destroy()

Once you have finished with the presentation of the content in the application,
calling `Points.destroy()` makes sure no GPU object and its references are still
in memory, freeing up the resources for another use.
