'use strict';
import { resizeViewport } from './utils.js';
import {
    AmbientLight,
    BoxGeometry,
    CameraHelper,
    Color,
    DirectionalLight,
    EquirectangularReflectionMapping,
    Float32BufferAttribute,
    Float64BufferAttribute,
    Layers,
    Mesh, MeshBasicMaterial, MeshLambertMaterial,
    OrthographicCamera,
    PerspectiveCamera,
    PlaneBufferGeometry,
    PlaneGeometry,
    Points,
    PointsMaterial,
    ReinhardToneMapping,
    Scene,
    ShaderMaterial,
    Vector2,
    Vector3,
    WebGLRenderer
} from './three.module.js';
import Screen from '../screen.js';
import ChromaSpiral from '../examples/chromaspiral.js';

const stats = new Stats();
stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

let side = 100;
let numColumns = side;
let numRows = side;
let numMargin = 0;
let screen;
let numLayers = 1;

let scene, camera, renderer, light, points;

let geometry, material;
let chromaSpiral;
var canvas;
function init() {
    renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    //renderer.toneMapping = ReinhardToneMapping;

    scene = new Scene();

    const fov = false ? 0.8 * 180 / Math.PI : 60;

    //const width = 100;
    //const height = 100;
    const width = window.innerWidth;
    const height = window.innerHeight;

    const ortoSide = width > height ? height : width;

    camera = new OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 1, 1000);
    //camera = new OrthographicCamera(ortoSide / - 2, ortoSide / 2, ortoSide / 2, ortoSide / - 2, 1, 1000);
    /*
        My code
    */
    console.log(renderer.domElement);
    canvas = renderer.domElement;
    screen = new Screen(renderer.domElement, numColumns, numRows, numMargin, numLayers);
    chromaSpiral = new ChromaSpiral(screen);

    camera.position.set(0, 0, 100);

    geometry = new PlaneBufferGeometry(800, 800, numColumns - 1, numRows - 1);
    //geometry.setAttribute( 'position', positionAttribute );
    //geometry.setAttribute( 'customColor', new THREE.Float32BufferAttribute( colors, 3 ) );
    //geometry.setAttribute( 'size', 0 );

    geometry.setAttribute('color', new Float64BufferAttribute(colors, 3));
    material = new PointsMaterial({ size: (800 / side) * 1.333, vertexColors: true });


    points = new Points(geometry, material);
    scene.add(points);
    /*
        - My code ends
    */

    window.addEventListener('resize', _onResizeViewport, false);
    document.body.appendChild(renderer.domElement);

    //resizeViewport(camera, renderer, composer, finalComposer);
}

function _onResizeViewport() {
    //resizeViewport(camera, renderer, composer, finalComposer);
}

let colors = [];
let uround;
let urounddec;
let usin;
let ucos;
let utime = 0;

let r, g, b;
function update() {
    stats.begin();
    utime += 1 / 60;//0.01;
    uround = Math.round(utime);
    usin = Math.sin(utime);
    ucos = Math.cos(utime);
    urounddec = utime % 1;

    /*
        My code
    */

    chromaSpiral.update(usin, ucos, side, utime);



    screen.mergeLayers();


    colors = [];
    /*screen.mainLayer.points.forEach(point => {
        //r = point.color.r;
        //g = point.color.g;
        //b = point.color.b;
        const [ r, g, b ] = point.color.value;
        //console.log(r, g, b , point.color)
        colors.push(r, g, b);
    });*/

    for (let index = 0; index < screen.mainLayer.points.length; index++) {
        const point = screen.mainLayer.points[index];
        const [r, g, b] = point.color.value;
        colors.push(r, g, b);
    }

    geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
    /*
        - My code ends
    */

    renderer.render(scene, camera);
    requestAnimationFrame(update);
    stats.end();
}

init();
update();
