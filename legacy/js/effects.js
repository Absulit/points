import MathUtil from './mathutil.js';

class Effects {
    constructor(screen) {
        this._screen = screen;
        this._rowCounter = 0;

        this._threshold_map = [
            [1, 9, 3, 11],
            [13, 5, 15, 7],
            [4, 12, 2, 10],
            [16, 8, 14, 6]
        ];
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
        //this._screen.currentLayer.points.forEach(p => {
        let pointsLength = this._screen.currentLayer.points.length;
        let p;
        for (let index = 0; index < pointsLength; index++) {
            p = this._screen.currentLayer.points[index];
            let pointBrightness = p.modifyColor(color => (color.brightness));

            if (pointBrightness > brightnessSensitivity) {
                let nextPoint = this._screen.getRightPoint(p, distance);
                if (nextPoint) {
                    //nextPoint.setColor((nextPoint.color.r + p.color.r) / 2, nextPoint.color.g, nextPoint.color.b, (nextPoint.color.a + p.color.a) / 2);
                    nextPoint.modifyColor(color => color.set((nextPoint.color.r + p.color.r) / 2, nextPoint.color.g, nextPoint.color.b, (nextPoint.color.a + p.color.a) / 2));
                }
                let prevPoint = this._screen.getLeftPoint(p, distance);
                if (prevPoint) {
                    //prevPoint.setColor(prevPoint.color.r, prevPoint.color.g, (prevPoint.color.b + p.color.b) / 2, (prevPoint.color.a + p.color.a) / 2);
                    prevPoint.modifyColor(color => color.set(prevPoint.color.r, prevPoint.color.g, (prevPoint.color.b + p.color.b) / 2, (prevPoint.color.a + p.color.a) / 2));
                }
            }
        }
        //});
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
                        pointAround.modifyColor(color => {
                            color.set(
                                (point.color.r + color.r * colorPower) / (colorPower + 1),
                                (point.color.g + color.g * colorPower) / (colorPower + 1),
                                (point.color.b + color.b * colorPower) / (colorPower + 1),
                                (point.color.a + color.a * colorPower) / (colorPower + 1)
                            );
                        });
                    }
                })
            }
        });
    }

    soften2(colorPower = 2, distance = 1) {
        //this._screen.currentLayer.points.forEach(point => {
        const pointsLength = this._screen.currentLayer.points.length;
        let point;
        for (let index = 0; index < pointsLength; index++) {
            point = this._screen.currentLayer.points[index];

            if (point.modified) {
                const points = this._screen.getPointsInCircle(point, distance);
                points.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.modifyColor(color => {
                            color.set(
                                (point.color.r + color.r * colorPower) / (colorPower + 1),
                                (point.color.g + color.g * colorPower) / (colorPower + 1),
                                (point.color.b + color.b * colorPower) / (colorPower + 1),
                                (point.color.a + color.a * colorPower) / (colorPower + 1)
                            );
                        });
                    }
                })
            }
            //});
        }
    }

    soften3(colorPower = 2, distance = 1) {
        this._screen.currentLayer.shuffledPoints.forEach(point => {

            if (point.modified) {
                const points = this._screen.getPointsInCircle(point, distance);
                points.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.modifyColor(color => {
                            color.set(
                                (point.color.r + color.r * colorPower) / (colorPower + 1),
                                (point.color.g + color.g * colorPower) / (colorPower + 1),
                                (point.color.b + color.b * colorPower) / (colorPower + 1),
                            );
                        });
                    }
                })
            }
        });
    }

    antialias() {
        // Trims the algorithm from processing darks.
        //   0.0833 - upper limit (default, the start of visible unfiltered edges)
        //   0.0625 - high quality (faster)
        //   0.0312 - visible limit (slower)

        // The Math.minimum amount of local contrast required to apply algorithm.
        //   0.333 - too little (faster)
        //   0.250 - low quality
        //   0.166 - default
        //   0.125 - high quality
        //   0.063 - overkill (slower)

        let pointsAround = null;
        let l = { n: null, s: null, e: null, w: null, m: null, highest: null, lowest: null, contrast: null }
        let points = null;
        const colorPower = 4;
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {

                pointsAround = this._screen.getPointsAround(point);

                l.n = pointsAround[1] ? pointsAround[1].color.brightness : 0;
                l.w = pointsAround[3] ? pointsAround[3].color.brightness : 0;
                l.e = pointsAround[4] ? pointsAround[4].color.brightness : 0;
                l.s = pointsAround[6] ? pointsAround[6].color.brightness : 0;
                l.m = point.color.brightness;

                // point.modifyColor(color => {
                //     l.m = color.brightness;
                // });


                l.highest = Math.max(Math.max(Math.max(Math.max(l.n, l.e), l.s), l.w), l.m);
                l.lowest = Math.min(Math.min(Math.min(Math.min(l.n, l.e), l.s), l.w), l.m);
                l.contrast = l.highest - l.lowest;

                if (l.contrast < 0.0312) {
                    return;
                }
                if (l.contrast < 0.166 * l.highest) {
                    return;
                }

                points = this._screen.getPointsAround(point);
                points.forEach(pointAround => {
                    if (pointAround) {

                        pointAround.modifyColor(color => {
                            color.set(
                                (point.color.r + color.r * colorPower) / (colorPower + 1),
                                (point.color.g + color.g * colorPower) / (colorPower + 1),
                                (point.color.b + color.b * colorPower) / (colorPower + 1),
                                (point.color.a + color.a * colorPower) / (colorPower + 1)
                            );
                        });

                    }
                });
            }
        });
    }

    antialias2() {
        // Trims the algorithm from processing darks.
        //   0.0833 - upper limit (default, the start of visible unfiltered edges)
        //   0.0625 - high quality (faster)
        //   0.0312 - visible limit (slower)

        // The Math.minimum amount of local contrast required to apply algorithm.
        //   0.333 - too little (faster)
        //   0.250 - low quality
        //   0.166 - default
        //   0.125 - high quality
        //   0.063 - overkill (slower)

        let pointsAround = null;
        let l = { n: null, s: null, e: null, w: null, nw: null, ne: null, sw: null, se: null, m: null, highest: null, lowest: null, contrast: null }
        const colorPower = 4;
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                pointsAround = this._screen.getPointsAround(point);

                l.nw = pointsAround[0] ? pointsAround[0].getBrightness() : 0;
                l.n = pointsAround[1] ? pointsAround[1].getBrightness() : 0;
                l.ne = pointsAround[2] ? pointsAround[2].getBrightness() : 0;
                l.w = pointsAround[3] ? pointsAround[3].getBrightness() : 0;
                l.e = pointsAround[4] ? pointsAround[4].getBrightness() : 0;
                l.sw = pointsAround[5] ? pointsAround[5].getBrightness() : 0;
                l.s = pointsAround[6] ? pointsAround[6].getBrightness() : 0;
                l.se = pointsAround[7] ? pointsAround[7].getBrightness() : 0;
                l.m = point.getBrightness();

                l.highest = Math.max(Math.max(Math.max(Math.max(l.n, l.e), l.s), l.w), l.m);
                l.lowest = Math.min(Math.min(Math.min(Math.min(l.n, l.e), l.s), l.w), l.m);
                l.contrast = l.highest - l.lowest;

                if (l.contrast < 0.0312) {
                    return;
                }
                if (l.contrast < 0.166 * l.highest) {
                    return;
                }

                let blendFactor = 2 * (l.n + l.e + l.s + l.w);
                blendFactor += l.ne + l.nw + l.se + l.sw;
                blendFactor *= 1.0 / 12;
                blendFactor = Math.abs(blendFactor - l.m);
                blendFactor = MathUtil.saturate(blendFactor / l.contrast);
                blendFactor = MathUtil.smoothstep(0, 1, blendFactor);
                blendFactor = blendFactor * blendFactor;

                let horizontal =
                    Math.abs(l.n + l.s - 2 * l.m) * 2 +
                    Math.abs(l.ne + l.se - 2 * l.e) +
                    Math.abs(l.nw + l.sw - 2 * l.w);
                let vertical =
                    Math.abs(l.e + l.w - 2 * l.m) * 2 +
                    Math.abs(l.ne + l.nw - 2 * l.n) +
                    Math.abs(l.se + l.sw - 2 * l.s);
                let isHorizontal = horizontal >= vertical;

                let pLuminance = isHorizontal ? l.n : l.e;
                let nLuminance = isHorizontal ? l.s : l.w;

                let pGradient = Math.abs(pLuminance - l.m);
                let nGradient = Math.abs(nLuminance - l.m);

                let pixelStep = isHorizontal ? 1 : 1;
                if (pGradient < nGradient) {
                    pixelStep = -pixelStep;
                }

                let points = this._screen.getPointsAround(point);

                let subPoints = null;
                if (isHorizontal) {
                    if (pixelStep >= 0) {
                        subPoints = [points[5], points[6], points[7]]; // bottom
                    } else {
                        subPoints = [points[0], points[1], points[2]]; // top
                    }
                }
                else {
                    if (pixelStep >= 0) {
                        subPoints = [points[0], points[3], points[5]]; // left
                    } else {
                        subPoints = [points[2], points[4], points[7]]; // right
                    }
                }

                subPoints.forEach(pointAround => {
                    if (pointAround) {
                        pointAround.setColor(
                            (point.color.r + pointAround.color.r * colorPower) / (colorPower + 1),
                            (point.color.g + pointAround.color.g * colorPower) / (colorPower + 1),
                            (point.color.b + pointAround.color.b * colorPower) / (colorPower + 1),
                            (point.color.a + pointAround.color.a * colorPower) / (colorPower + 1)
                        );
                    }
                });
            }
        });
    }

    contrast1() {
        let pointsAround = null;

        let l = { n: null, s: null, e: null, w: null, m: null, highest: null, lowest: null, contrast: null }
        this._screen.currentLayer.points.forEach(point => {
            if (point.modified) {
                pointsAround = this._screen.getDirectPointsAround(point);

                l.n = pointsAround[0] ? pointsAround[0].getBrightness() : 1;
                l.s = pointsAround[1] ? pointsAround[1].getBrightness() : 1;
                l.e = pointsAround[2] ? pointsAround[2].getBrightness() : 1;
                l.w = pointsAround[3] ? pointsAround[3].getBrightness() : 1;
                l.m = point.getBrightness();

                l.highest = Math.max(Math.max(Math.max(Math.max(l.n, l.e), l.s), l.w), l.m);
                l.lowest = Math.min(Math.min(Math.min(Math.min(l.n, l.e), l.s), l.w), l.m);
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

    orderedDithering(depth = 32, threshold_map) {
        this._threshold_map = threshold_map || this._threshold_map;
        const screen = this._screen;
        for (let cIndex = 0; cIndex < screen.numColumns; cIndex++) {
            for (let rowIndex = 0; rowIndex < screen.numRows; rowIndex++) {
                const point = screen.getPointAt(cIndex, rowIndex);

                let b = this._threshold_map[cIndex % 4][rowIndex % 4];

                // TODO: using new RGBAColor in this case makes it look weird
                // using setRGBAColor makes it look good
                // const color = new RGBAColor(
                //     (point.color.r + b / depth | 0) * depth,
                //     (point.color.g + b / depth | 0) * depth,
                //     (point.color.b + b / depth | 0) * depth,
                // );
                // point.setRGBAColor(color);

                point.setColor(
                    (point.color.r + b / depth | 0) * depth,
                    (point.color.g + b / depth | 0) * depth,
                    (point.color.b + b / depth | 0) * depth,
                );
            }
        }
    }
}

export default Effects;