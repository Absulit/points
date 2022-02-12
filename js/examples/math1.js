import RGBAColor from '../color.js';
import Effects from '../effects.js';
export default class Math1 {
    constructor(screen) {
        this._screen = screen;
        this._clearMixColor = new RGBAColor(0, 0, 0);


        this._effects = new Effects(screen);


        this._MAX_ITER = 1000;
        this._constant = screen.numColumns / 200;
    };

    update(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;

        screen.clearMix(new RGBAColor(0, 0, 0), 1.001);
        screen.currentLayer.points.forEach((point, index) => {
            // do something to every point
            // or every p.modified point
            const { x, y } = point.coordinates;
            const r = Math.tan(Math.pow(x, 2) + Math.pow(y, 2));
            //console.log(r);
            let val;
            if (r > 0) {
                val = r / 15 * utime * usin;
                point.setColor(0, 0, val);
            } else {
                val = Math.abs(r) / 45 * ucos;
                point.setColor(val, 0, 0)
            }
            //point.setBrightness(Math.floor(r * usin));
            //point.setBrightness(r * usin);
            //debugger;

        });
        //this._screen.clearMix(new RGBAColor(0, 0, 0), 1.001);
        //this._effects.fire(2);
        //this._effects.chromaticAberration(.05, 2);
        //this._effects.soften3();
        //this._effects.antialias();
    }

    update2(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;

        screen.clearMix(new RGBAColor(0, 0, 0), 1.1);
        screen.currentLayer.points.forEach((point, index) => {
            const { x, y } = point.coordinates;

            const n = Math.floor(400 * usin);
            //const n = 10;
            const r = Math.sin(Math.pow(x - (screen.center.x), n) * Math.pow(y - (screen.center.y), n));
            //console.log(r);
            let val;
            if (r > 0) {
                val = r;
                point.setColor(val, 0, 0);
            } else {
                val = Math.abs(r) / 45 * ucos;
                point.setColor(val, 0, 0)
            }
        });
        //this._screen.clearMix(new RGBAColor(0, 0, 0), 1.001);
        //this._effects.fire(2);
        //this._effects.chromaticAberration(.05, 2);
        this._effects.soften3();
        //this._effects.antialias();
    }



    update3(usin, ucos, side, utime) {
        const screen = this._screen;

        screen.layerIndex = 0;

        //screen.clearMix(new RGBAColor(0, 0, 0), 1.1);
        screen.clear();
        screen.currentLayer.points.forEach((point, index) => {
            const { x, y } = point.coordinates;
            //point.setBrightness(1);

            //let nx = Math.round(usin * x * y * ucos) * 2;
            //let ny = Math.round(x * x / y * usin + y * ucos) * 2;

            //let nx = Math.round(ucos * y*x) + y;
            //let ny = Math.round(usin * x) + x;

            // let nPoint = screen.getPointAt(nx + (screen.center.x), ny + (screen.center.y));
            // if (nPoint) {
            //     nPoint.setBrightness(1);
            // }
            let r = (x * y ** ucos % 10 == 0) || (Math.round(y * x ** usin / 10) % 7 == 0);
            if (r) {
                point.setBrightness(y * usin);
            }


        });
        //this._screen.clearMix(new RGBAColor(0, 0, 0), 1.001);
        //this._effects.fire(2);
        //this._effects.chromaticAberration(.05, 2);
        //this._effects.soften3();
        //this._effects.antialias();
    }

    update4(usin, ucos, side, utime) {
        const screen = this._screen;
        
        //screen.clear();
        let finalPoint;
        const fusin = (0.0366 * usin) + (0.0366*2);
        let lastPoint  = null;
        for (let index = 0; index < 100; index += .1) {
            //finalPoint = screen.getFinalPointFromPolar(screen.center.x, screen.center.y, Math.round(index / usin), (index * usin));
            //finalPoint = screen.getFinalPointFromPolar(screen.center.x, screen.center.y,  Math.sin(index / fusin / 50) + (this._constant * 50), (index * fusin));
            finalPoint = screen.getFinalPointFromPolar(screen.center.x, screen.center.y, Math.tan(index / usin / 50), (index * usin));

            if (finalPoint) {
                //finalPoint.setColor(1, usin, 0);
                finalPoint.setColor(1, 1, 1);
                if(lastPoint){
                    screen.drawLineWithPoints(lastPoint, finalPoint);
                }
            }

            lastPoint = finalPoint;
        }
        this._effects.chromaticAberration(.05, 2);
        //this._effects.soften3();
        this._effects.antialias();
        screen.clearMix(new RGBAColor(0, 0, 0), 1.1);
    }
}
