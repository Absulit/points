
import Points, { RenderPass, RenderPasses } from 'points';
import { cube_renderpass } from './cube_renderpass/index.js';

import { WebIO } from 'https://unpkg.com/@gltf-transform/core@latest?module';

function uint8ToBase64(uint8Array) {
  let binary = '';
  for (let i = 0; i < uint8Array.length; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
}

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
      console.log(prim);

      const getAttrArray = (name) => {
        const attr = prim.getAttribute(name);
        return attr ? attr.getArray() : null;
      };

      const positions = getAttrArray('POSITION');      // Float32Array | null
      const normals = getAttrArray('NORMAL');        // Float32Array | null
      const uvs = getAttrArray('TEXCOORD_0');    // Float32Array | null
      const colors = getAttrArray('COLOR_0');       // Float32Array | null

      const indices = prim.getIndices() ? prim.getIndices().getArray() : null; // Uint16Array|Uint32Array|null
      let texture = null;

      // const colorAccessor = prim.getAttribute('COLOR_0');
      // console.log(colorAccessor.getComponentType()); // Should be 5126 (FLOAT) or 5121 (UNSIGNED_BYTE)
      // console.log(colorAccessor.getNormalized());    // true or false
      const colorSize = prim.getAttribute('COLOR_0').getElementSize(); // 3 or 4

      const material = prim.getMaterial();
      if (!material) {
        console.log('  No material assigned.');
        continue;
      }

      const baseColorTexture = material.getBaseColorTexture();
      if (baseColorTexture) {
        console.log('  Base Color Texture:', baseColorTexture.getName());
        console.log('  MIME Type:', baseColorTexture.getMimeType());// e.g. 'image/png'
        console.log('  Image Size:', baseColorTexture.getImage()?.length);// Uint8Array

        const mimeType = baseColorTexture.getMimeType();
        const imageData = baseColorTexture.getImage();


        texture = `data:${mimeType};base64,${uint8ToBase64(imageData)}`;


      } else {
        console.log('  No base color texture.');
      }

      // You can also check other texture slots:
      // material.getNormalTexture()
      // material.getMetallicRoughnessTexture()
      // material.getEmissiveTexture()

      results.push({
        meshName: mesh.getName() || null,
        positions,
        normals,
        uvs,
        colors,
        indices,
        colorSize,
        texture
      });
    }
  }

  return results;
}


const options = {
  mode: 1
}

const near = 0.1, far = 100;
const f = 1.0 / Math.tan(Math.PI / 8); // ≈ 2.414
let aspect = null
const nf = 1 / (near - far);



const url = '../models/monkey.glb'; // or remote URL (CORS must allow)
const data = await loadAndExtract(url);
const { positions, colors, uvs, normals, indices, colorSize, texture } = data[0]
cube_renderpass.addMesh('test', positions, colors, colorSize, uvs, normals, indices)
cube_renderpass.depthWriteEnabled = true;
const textureOut = texture;


const base = {
  renderPasses: [
    cube_renderpass,
  ],
  /**
   * @param {Points} points
   */
  init: async (points, folder) => {
    await points.setTextureImage('albedo', textureOut);
    points.setSampler('imageSampler', null)

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

    const dropdownItems = { /*'Vertex': 0,*/ 'Texture': 1, 'Shader': 2 };

    points.setUniform('color_mode', options.mode);
    folder.add(options, 'mode', dropdownItems).name('Colors').onChange(value => {
      console.log(value);
      points.setUniform('color_mode', value);
    });



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
