# POINTS API docs

`POINTS` is a library that uses WebGPU and allows you to create shaders without worrying too much about the setup.

Looking for an explanation on how to use POINTS? follow this link:
[README](https://github.com/Absulit/points)

## Examples
[Documentation Live demos](https://absulit.github.io/points/examples/)<br>
[Gravity Pull: Audio Visualizer](https://absulit.github.io/Gravity-Pull/)

## Main classes:<br>
```js
import Points { RenderPass, RenderPasses } from 'points';
```

{@link Points|Points}<br>
{@link RenderPass|RenderPass}<br>
{@link RenderPasses|RenderPasses}<br>
{@link PrimitiveTopology|PrimitiveTopology}<br>

## Submodules with helper wgsl functions:

```js
import { fnusin } from 'points/animation';
```

{@link module:points/animation|points/animation}<br>
{@link module:points/audio|points/audio}<br>
{@link module:points/color|points/color}<br>
{@link module:points/debug|points/debug}<br>
{@link module:points/effects|points/effects}<br>
{@link module:points/image|points/image}<br>
{@link module:points/math|points/math}<br>
{@link module:points/noise2d|points/noise2d}<br>
{@link module:points/classicnoise2d|points/classicnoise2d}<br>
{@link module:points/classicnoise3d|points/classicnoise3d}<br>
{@link module:points/random|points/random}<br>
{@link module:points/sdf|points/sdf}<br>
