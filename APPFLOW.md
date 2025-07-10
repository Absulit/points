# APPFLOW

Little document stating the flow of the application to understand it better.

## new Points

To create an application with points you need only a canvas id, meaning the canvas should be created before creating the app

## setUniform, setStorage

before actually starting points (calling points.init), you need to set the uniforms and other calls starting with `points.set`: # TODO: provide fix for this

## points.init

- render passes are assigned
    - post render passes are concatenated
- default internal uniforms are set like TIME and MOUSE
- compileRenderPass:
    in renderPass adds the renderepass.compiledShaders
        .vertex
        .compute
        .fragment
    with the final string version that will be used by WebGPU
    it uses createDynamicGroupBindings to create the bindings
- data size is generated (struct sizes)

- adapted is requested to WebGPU
- device is requested to WebGPU
- canvas is resized
- renderPassDescriptor is created
    - here the clear value is set
- createScreen is called
    - Adds two triangles called points per number of columns and rows
    - the default is one point, two triangles, one quad.

- #createBuffers
    - #createParametersUniforms
        - this is for #uniforms only
        - with the #dataSize creates the paddings for the memory the #createAndMapBuffer needs
    - for each of the variables arrays variables like #storage and #textures2dArray etc creates its memory buffer
    -
- await #createPipeline

- returns true when finished


## points.update

