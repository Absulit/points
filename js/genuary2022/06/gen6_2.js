import RGBAColor from '../../color.js';
import Coordinate from '../../coordinate.js';
import Effects from '../../effects.js';
import Particle from '../../examples/Particle.js';
import FlowFields from '../../flowfields.js';
import ImageLoader from '../../imageloader.js';
import MathUtil from '../../mathutil.js';
import SpriteLoader from '../../spriteloader.js';


export default class Gen6_2 {
    /**
     *
     * @param {Screen} screen
     */
    constructor(screen) {
        this._screen = screen;
        this._effects = new Effects(screen);
        this._clearMixColor = new RGBAColor(0, 0, 0);

        /*const is10K = (screen.numRows * screen.numColumns) == 10000
        if (!is10K) {
            throw ('this demo needs 10K items, so the recommended side should be 100')
        }
        if(screen._numMargin != 1){
            throw ('this demo needs 1px margin')
        }*/
        /*if (screen.layers.length != 3) {
            throw new Error(`This demo needs 3 layers to work`);
        }

        if (screen.numColumns != 800 && screen.numRows != 80) {
            throw new Error(`This demo needs 800x80`);
        }*/

        this._constant = screen.numColumns / 100;
        console.log('---- CONSTANT: ' + this._constant);




        //screen.layerIndex = 0;//--------------------------- LAYER 0

        this._lineColor = new RGBAColor(1, 1, 1);


        this._particles = [];

        for (let index = 0; index < 10; index++) {
            const particle = new Particle(screen.center.x, screen.center.y);
            this._particles.push(particle);
        }
    }

    update(usin, ucos, side, utime, nusin) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 1
        //screen.clear();

        for (const particle of this._particles) {
            particle.update();
            const point = screen.getPointAt(Math.floor(particle.x), Math.floor(particle.y));
            if (point) {
                //point.setBrightness(1);
                const { x, y } = point.normalPosition;
                //point.setColor(1 - x, 1 - y, x * nusin);
                point.modifyColor(color => color.set(1 - x, 1 - y, x * nusin));
                //point.color.a = particle.a;
            }
        }

        this._particles = this._particles.filter(particle => (particle.x < screen.numColumns && particle.x >= 0 && particle.y < screen.numRows && particle.y >= 0))

        for (let index = 0; index < 5; index++) {
            this._particles.push(new Particle(screen.center.x, screen.numRows - 1, this._constant));
        }


        //debugger;
        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(30);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
