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
                    for (let indexLevel = 0; indexLevel <= level-1; indexLevel++) {
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
}

export default Effects;