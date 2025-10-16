import { WebIO } from 'https://unpkg.com/@gltf-transform/core@latest?module';

// original from AFrame
// https://github.com/aframevr/aframe/blob/aa792c9/src/utils/device.js#L52


function isTablet(mockUserAgent) {
    var userAgent = mockUserAgent || window.navigator.userAgent;
    return /ipad|Nexus (7|9)|xoom|sch-i800|playbook|tablet|kindle/i.test(userAgent);
}

function isIOS() {
    return /iPad|iPhone|iPod/.test(window.navigator.platform);
}

export const isMobile = (function () {
    var _isMobile = false;
    (function (a) {
        // eslint-disable-next-line no-useless-escape
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) {
            _isMobile = true;
        }
        if (isIOS() || isTablet()) {
            _isMobile = true;
        }
    })(window.navigator.userAgent || window.navigator.vendor || window.opera);
    return function () { return _isMobile; };
})();


export function uint8ToBase64(uint8Array) {
    let binary = '';
    for (let i = 0; i < uint8Array.length; i++) {
        binary += String.fromCharCode(uint8Array[i]);
    }
    return btoa(binary);
}

export async function loadAndExtract(url) {
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
