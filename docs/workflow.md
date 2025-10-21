# Workflow

Currently, we have a workflow of data setup from JavaScript and then a RenderPass composed of 3 shaders:

JavaScript setup and Data → RenderPass (Compute Shader → Vertex Shader → Fragment Shader) → Screen Output

This data (Uniforms, Storage, Texture Images, etc) can be accessed safely in all shaders across the pipeline.

To add more shaders you need to add a new RenderPass. So for example if you need two compute shaders, you need two RenderPass

You can have a Vertex + Fragment shaders without a Compute shader, and also a Compute shader without a Vertex + Fragment shaders, so you can have a computational shader, a visual shader, or both.
