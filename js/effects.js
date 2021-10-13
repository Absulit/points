import Utils from './utils.js';

class Effects {
    constructor(screen) {
        this._screen = screen;
        this._rowCounter = 0;
    }

    fire(level = 1) {
        let amountNoise = 6000;
        for (let index = 0; index < amountNoise; index++) {
            let point = this._screen.getRandomPoint(); {
                if (point.modified) {
                    let yDisplace;
                    for (let indexLevel = 0; indexLevel <= level - 1; indexLevel++) {
                        yDisplace = indexLevel + 1;
                        this._screen.movePointTo(point, point.coordinates.x + indexLevel, point.coordinates.y - yDisplace);
                    }
                }
            }
        }
    }

    scanLine(level = 1) {
        for (let columIndex = 0; columIndex < this._screen.numColumns; columIndex++) {
            this._pointA = this._screen.getPointAt(columIndex, this._rowCounter);
            if (this._pointA) {
                for (let indexLevel = 0; indexLevel <= level; indexLevel++) {
                    this._screen.movePointTo(this._pointA, columIndex, this._rowCounter - indexLevel + 1);
                }
            }
        }

        if (++this._rowCounter >= this._screen.numRows) {
            this._rowCounter = 0;
        }
    }

    blackAndWhite() {
        let brightness;
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                brightness = point.getBrightness();
                point.setBrightness(brightness);
            }
        });
    }

    blackAndWhitePointSize() {
        let brightness;
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                brightness = point.getBrightness();
                point.size = brightness * this._screen.pointSizeFull;
                point.setBrightness(1);
            }
        });
    }

    chromaticAberration(brightnessSensitivity = .5, distance = 1) {
        this._screen.currentLayer.points.forEach(p => {
            if (p.getBrightness() > brightnessSensitivity) {
                let nextPoint = this._screen.getRightPoint(p, distance);
                if (nextPoint) {
                    nextPoint.setColor((nextPoint.color.r + p.color.r) / 2, nextPoint.color.g, nextPoint.color.b, (nextPoint.color.a + p.color.a) / 2);
                }
                let prevPoint = this._screen.getLeftPoint(p, distance);
                if (prevPoint) {
                    prevPoint.setColor(prevPoint.color.r, prevPoint.color.g, (prevPoint.color.b + p.color.b) / 2, (prevPoint.color.a + p.color.a) / 2);
                }
            }
        });
    }


    /**
     * Not a perfect soften, that's why its named soften1.
     * I want to keep the effect, but it's not a good implementation of a soften
     * @param {Number} colorPower colors could be a bit dim, so increasing this numbers enhances them.
     */
    soften1(colorPower = 2) {
        this._screen.currentLayer.points.forEach(point => {

            if (point.modified) {
                // TODO this can be done better in a circle, since the smalles circle is a square
                const points = this._screen.getPointsAround(point);
                points.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.setColor(
                            (point.color.r + pointAround.color.r * colorPower) / (colorPower + 1),
                            (point.color.g + pointAround.color.g * colorPower) / (colorPower + 1),
                            (point.color.b + pointAround.color.b * colorPower) / (colorPower + 1)
                        );
                    }
                })
            }
        });
    }

    soften2(colorPower = 2, distance = 1) {
        this._screen.currentLayer.points.forEach(point => {

            if (point.modified) {
                const points = this._screen.getPointsInCircle(point, distance);
                points.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.setColor(
                            (point.color.r + pointAround.color.r * colorPower) / (colorPower + 1),
                            (point.color.g + pointAround.color.g * colorPower) / (colorPower + 1),
                            (point.color.b + pointAround.color.b * colorPower) / (colorPower + 1)
                        );
                    }
                })
            }
        });
    }

    soften3(colorPower = 2, distance = 1) {
        this._screen.currentLayer.shuffledPoints.forEach(point => {

            if (point.modified) {
                const points = this._screen.getPointsInCircle(point, distance);
                points.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.setColor(
                            (point.color.r + pointAround.color.r * colorPower) / (colorPower + 1),
                            (point.color.g + pointAround.color.g * colorPower) / (colorPower + 1),
                            (point.color.b + pointAround.color.b * colorPower) / (colorPower + 1)
                        );
                    }
                })
            }
        });
    }

    antialias() {
        let brightness;
        let pointsAround = null;
        const max = Math.max;
        const min = Math.min;
        // Trims the algorithm from processing darks.
        //   0.0833 - upper limit (default, the start of visible unfiltered edges)
        //   0.0625 - high quality (faster)
        //   0.0312 - visible limit (slower)

        // The minimum amount of local contrast required to apply algorithm.
        //   0.333 - too little (faster)
        //   0.250 - low quality
        //   0.166 - default
        //   0.125 - high quality 
        //   0.063 - overkill (slower)




        let l = { n: null, s: null, e: null, w: null, m: null, highest: null, lowest: null, contrast: null }
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                //brightness = point.getBrightness();
                //point.setColor(brightness, point.color.g, point.color.g);
                pointsAround = this._screen.getDirectPointsAround(point);

                l.n = pointsAround[0] ? pointsAround[0].getBrightness() : 0;
                l.s = pointsAround[1] ? pointsAround[1].getBrightness() : 0;
                l.e = pointsAround[2] ? pointsAround[2].getBrightness() : 0;
                l.w = pointsAround[3] ? pointsAround[3].getBrightness() : 0;
                l.m = point.getBrightness();

                l.highest = max(max(max(max(l.n, l.e), l.s), l.w), l.m);
                l.lowest = min(min(min(min(l.n, l.e), l.s), l.w), l.m);
                l.contrast = l.highest - l.lowest;
                //point.setBrightness(l.contrast);
                if (l.contrast < 0.0312) {
                    //point.setColor(0, 0, 0, 1);
                    return;
                }
                if (l.contrast < 0.166  * l.highest) {
                    //point.setColor(0, 0, 0, 1);
                    return;
                }
                //const distance = 3;
                const points = this._screen.getPointsAround(point);
                //const points = this._screen.getPointsInCircle(point, distance);
                const colorPower = 2;
                points.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.setColor(
                            (point.color.r + pointAround.color.r * colorPower) / (colorPower + 1),
                            (point.color.g + pointAround.color.g * colorPower) / (colorPower + 1),
                            (point.color.b + pointAround.color.b * colorPower) / (colorPower + 1)
                        );
                    }
                })

            }
        });
    }

    contrast1() {
        let brightness;
        let pointsAround = null;
        const max = Math.max;
        const min = Math.min;

        let l = { n: null, s: null, e: null, w: null, m: null, highest: null, lowest: null, contrast: null }
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                //brightness = point.getBrightness();
                //point.setColor(brightness, point.color.g, point.color.g);
                pointsAround = this._screen.getDirectPointsAround(point);

                l.n = pointsAround[0] ? pointsAround[0].getBrightness() : 1;
                l.s = pointsAround[1] ? pointsAround[1].getBrightness() : 1;
                l.e = pointsAround[2] ? pointsAround[2].getBrightness() : 1;
                l.w = pointsAround[3] ? pointsAround[3].getBrightness() : 1;
                l.m = point.getBrightness();

                l.highest = max(max(max(max(l.n, l.e), l.s), l.w), l.m);
                l.lowest = min(min(min(min(l.n, l.e), l.s), l.w), l.m);
                l.contrast = l.highest - l.lowest;


                point.setBrightness(l.contrast);
            }
        });
    }

    /**
     * A little color variation
     */
    tone1() {
        let brightness;
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                brightness = point.getBrightness();
                point.setColor(brightness, point.color.g, point.color.g);
            } else {
                point.setBrightness(0);
            }
        });

    }

    tone2() {
        let brightness;
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                brightness = point.getBrightness();
                point.setColor(brightness, point.color.b, point.color.b);
            } else {
                point.setBrightness(0);
            }
        });

    }
}

export default Effects;