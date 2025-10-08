
import Points, { RenderPass, RenderPasses } from 'points';
import { cube_renderpass } from './cube_renderpass/index.js';

import { WebIO } from 'https://unpkg.com/@gltf-transform/core@latest?module';

async function loadAndExtract(url) {
  const io = new WebIO();

  // Option A: let WebIO fetch the resource (works for .glb or .gltf with resolvable relative resources)
  // const doc = await io.read(url);

  // Option B: fetch yourself then pass a Uint8Array to readBinary (works reliably for .glb or loaded .gltf/.bin combos)
  const resp = await fetch(url);
  const arrayBuffer = await resp.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const doc = await io.readBinary(uint8);

  const root = doc.getRoot();
  const meshes = root.listMeshes();
  const results = [];

  for (const mesh of meshes) {
    for (const prim of mesh.listPrimitives()) {
      const getAttrArray = (name) => {
        const attr = prim.getAttribute(name);
        return attr ? attr.getArray() : null;
      };

      const positions = getAttrArray('POSITION');      // Float32Array | null
      const normals = getAttrArray('NORMAL');        // Float32Array | null
      const uvs = getAttrArray('TEXCOORD_0');    // Float32Array | null
      const colors = getAttrArray('COLOR_0');       // Float32Array | null
      const indices = prim.getIndices() ? prim.getIndices().getArray() : null; // Uint16Array|Uint32Array|null

      results.push({
        meshName: mesh.getName() || null,
        positions,
        normals,
        uvs,
        colors,
        indices,
      });
    }
  }

  return results;
}


const options = {
  loadOp: false
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);


// TODO: cubes need to be outside init() here, because the RenderPass is imported
// and is already in memory the next time is loaded, so new cubes load
// a solution would be to call a remove (like init, update) and delete the RenderPass


cube_renderpass.loadOp = 'clear';
// cube_renderpass.addCube(
//   'cube0',
//   { x: 0, y: 0, z: 0 },
//   { width: 1, height: 1, depth: 1 },
//   { r: 1, g: 0, b: 0, a: 1 }
// );
// cube_renderpass.addCube(
//   'cube1',
//   { x: 0, y: 1, z: 0 },
//   { width: 1, height: 1, depth: 1 },
//   { r: 1, g: 0, b: 0, a: 1 }
// );

const url = 'glb1/monkey.glb'; // or remote URL (CORS must allow)
try {
  const data = await loadAndExtract(url);
  const {positions, colors, uvs, normals, indices} = data[0]
  cube_renderpass.addMesh('test', positions, colors, uvs, normals, indices)
  console.log('Extracted primitives:', data);
  // upload data[i].positions etc to WebGPU buffers
} catch (e) {
  console.error('Failed to load glTF:', e);
}

const base = {
  renderPasses: [
    cube_renderpass,
  ],
  /**
   * @param {Points} points
   */
  init: async (points, folder) => {
    aspect = points.canvas.width / points.canvas.height;
    points.setUniform(
      'projection',
      [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
      ],
      'mat4x4<f32>'
    )

    // camera at [0, 0, 5], looking at origin
    points.setUniform(
      'view',
      [
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        0, 0, -5, 1
      ],
      'mat4x4<f32>'
    )

    // points.addRenderPass(RenderPasses.COLOR);
    // points.addRenderPass(RenderPasses.PIXELATE);
    // points.addRenderPass(RenderPasses.FILM_GRAIN);

    folder.add(options, 'loadOp')
      .name('loadOp: clear|load')
      .onChange(value => cube_renderpass.loadOp = value ? 'load' : 'clear');
    folder.open();
  },
  /**
   * @param {Points} points
   */
  update: points => {

    aspect = points.canvas.width / points.canvas.height;
    points.setUniform(
      'projection',
      [
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far + near) * nf, -1,
        0, 0, (2 * far * near) * nf, 0
      ]
    )
  }
}

export default base;
