import RGBAColor from '../color.js';
import Coordinate from '../coordinate.js';
import Effects from '../effects.js';
import FlowFields from '../flowfields.js';
import ImageLoader from '../imageloader.js';
import MathUtil from '../mathutil.js';
import SpriteLoader from '../spriteloader.js';
import { print } from '../utils.js';
import Particle from './Particle.js';


export default class ArtificialLife1 {
    /**
     * https://www.youtube.com/watch?v=0Kx4Y9TVMGg
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


        this._particles = [];
        this._yellow = new RGBAColor(1, 1, 0);
        this._red = new RGBAColor(1, 0, 0);
        this._green = new RGBAColor(0, 1, 0);
        this._white = new RGBAColor(1, 1, 1);

        this._yellowGroup = this._createParticleSet(400, this._yellow);
        this._redGroup = this._createParticleSet(400, this._red);
        this._greenGroup = this._createParticleSet(400, this._green);
        this._whiteGroup = this._createParticleSet(400, this._white);
    }

    _particle(x, y, color) {
        return {
            x: x,
            y: y,
            color: color,
            vx: 0,
            vy: 0
        }
    }

    _createParticleSet(amount, color) {
        const group = [];
        for (let index = 0; index < amount; index++) {
            let particle = this._particle(Math.random() * this._screen.numColumns, Math.random() * this._screen.numRows, color)
            group.push(particle);
            this._particles.push(particle);
        }
        return group;
    }

    _rule(particles1, particles2, g) {
        for (let i = 0; i < particles1.length; i++) {
            let fx = 0;
            let fy = 0;
            for (let j = 0; j < particles2.length; j++) {
                let a = particles1[i];
                let b = particles2[j];
                let dx = a.x - b.x;
                let dy = a.y - b.y;
                let d = Math.sqrt(dx * dx + dy * dy);
                if (d > 0 && d < 16 * this._constant) {
                    let F = g * 1 / d;
                    fx += (F * dx);
                    fy += (F * dy);
                }
                a.vx = (a.vx + fx) * .01;
                a.vy = (a.vy + fy) * .01;

                a.x += a.vx;
                a.y += a.vy;
                if(a.x <= 0 || a.x >= this._screen.numColumns) {a.vx *= -1};
                if(a.y <= 0 || a.y >= this._screen.numRows) {a.vy *= -1};
            }
        }
    }

    update({ usin, ucos, side, utime, nusin, sliders }) {
        const screen = this._screen;

        screen.clear(this._clearMixColor);
        // screen.points.forEach(point => {
        //     point.particleCount = 0;
        // });


        this._rule(this._redGroup, this._redGroup, sliders.a);
        this._rule(this._yellowGroup, this._redGroup, sliders.b);
        this._rule(this._greenGroup, this._greenGroup, -1 * sliders.c);
        this._rule(this._greenGroup, this._redGroup, -1 * sliders.b);
        this._rule(this._redGroup, this._greenGroup, -1 * sliders.a);

        this._rule(this._whiteGroup, this._redGroup, sliders.a);
        this._rule(this._whiteGroup, this._yellowGroup, -1 * sliders.c);
        this._rule(this._whiteGroup, this._greenGroup, sliders.b);

        this._rule(this._redGroup, this._whiteGroup, -1 * sliders.c);
        this._rule(this._yellowGroup, this._whiteGroup, -1 * sliders.b);
        this._rule(this._greenGroup, this._whiteGroup, sliders.a);



        for (const particle of this._particles) {
            const point = screen.getPointAt(Math.floor(particle.x), Math.floor(particle.y));
            //print(point);
            //debugger

            point && point.modifyColor(color => {
                color.setColor(particle.color);
            });
        }


        //screen.layerIndex = 1;//--------------------------- LAYER 1
        //screen.layerIndex = 2;//--------------------------- LAYER 2
        //screen.layerIndex = 3;//--------------------------- LAYER 3

        //this._effects.chromaticAberration(.05, 2);
        //this._effects.fire(1);
        //this._effects.soften2(30);
        //this._effects.antialias();
        //this._screen.clearMix(this._clearMixColor, 1.1);
        //this._screen.clearAlpha(1.01);
        //this._effects.orderedDithering();
    }


}
