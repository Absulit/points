import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import FlowFields from '../flowfields.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import SpriteLoader from '../spriteloader.js';
import Particle from './Particle.js';


export default class Slime2 {
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
        screen.layerIndex = 1;//--------------------------- LAYER 1
        screen.clear(this._clearMixColor);

        this._lineColor = new RGBAColor(1, 1, 1);


        this._particles = [];

        for (let index = 0; index < 2000; index++) {
            const particle = {
                x: screen.center.x,
                y: screen.center.y,
                angle: Math.random() * Math.PI * 2,
                distance: 1
            };
            this._particles.push(particle);
        }
    }

    update({usin, ucos, side, utime, nusin}) {
        const screen = this._screen;



        screen.layerIndex = 0;//--------------------------- LAYER 1
        //screen.clear();

        for (const particle of this._particles) {
            const p = MathUtil.polar(particle.distance, particle.angle);
            particle.x += p.x;
            particle.y += p.y;

            const point = screen.getPointAt(Math.floor(particle.x), Math.floor(particle.y));


            // https://youtu.be/X-iSQQgOd1A?t=814
            if (point) {
                const turnSpeed = .1;
                const distance = 3 * this._constant;
                let p = MathUtil.polar(distance, particle.angle);
                const pointForward = screen.getPointAt(Math.floor(particle.x + p.x), Math.floor(particle.y + p.y));
                p = MathUtil.polar(distance, particle.angle + MathUtil.radians(15));
                const pointRight = screen.getPointAt(Math.floor(particle.x + p.x), Math.floor(particle.y + p.y));
                p = MathUtil.polar(distance, particle.angle - MathUtil.radians(15));
                const pointLeft = screen.getPointAt(Math.floor(particle.x + p.x), Math.floor(particle.y + p.y));

                if (pointForward && pointRight && pointLeft && pointForward.getBrightness() > pointLeft.getBrightness() && pointForward.getBrightness() > pointRight.getBrightness()) {
                    // do nothing, continue
                } else if (pointForward && pointRight && pointLeft && pointForward.getBrightness() < pointLeft.getBrightness() && pointForward.getBrightness() < pointRight.getBrightness()) {
                    // turn randomly
                    particle.angle += (Math.random() - .5) * 2 * turnSpeed * utime
                } else if (pointRight && pointLeft && pointRight.getBrightness() > pointLeft.getBrightness()) {
                    // turn right
                    particle.angle += Math.random() * turnSpeed * utime;
                } else if (pointLeft && pointRight && pointLeft.getBrightness() > pointRight.getBrightness()) {
                    // turn left
                    particle.angle -= Math.random() * turnSpeed * utime;
                }

                const { x, y } = point.normalPosition;
                point.setBrightness(1);
                const pointAbove = screen.getPointFromLayer(point, 2);
                pointAbove.setColor(1 - x, 1 - y, x * nusin);

            } else {
                particle.angle = Math.random() * Math.PI * 2
            }
        }

        this._effects.soften2(30);
        this._screen.clearAlpha(1.1);

        //screen.moveColorToLayer(2);

        //debugger;
        //screen.layerIndex = 1;//--------------------------- LAYER 1


        screen.layerIndex = 2;//--------------------------- LAYER 2
        // for (const particle of this._particles) {
        //     const point = screen.getPointAt(Math.floor(particle.x), Math.floor(particle.y));
        //     if(point){
        //         const { x, y } = point.normalPosition;
        //         point.setColor(1 - x, 1 - y, x * nusin);
        //     }
        // }

        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        this._effects.soften2(30);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
