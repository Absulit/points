class RGBAColor {
    constructor(r = 0, g = 0, b = 0, a = 1) {
        if (r > 1 && g > 1 && b > 1) {
            r /= 255;
            g /= 255;
            b /= 255;
            if (a > 1) {
                a /= 255;
            }
        }
        this._value = [r, g, b, a];
    }

    set r(value) {
        this._value[0] = value;
    }

    set g(value) {
        this._value[1] = value;
    }

    set b(value) {
        this._value[2] = value;
    }

    set a(value) {
        this._value[3] = value;
    }

    get r() {
        return this._value[0];
    }

    get g() {
        return this._value[1];
    }

    get b() {
        return this._value[2];
    }

    get a() {
        return this._value[3];
    }

    get value() {
        return this._value;
    }

    get brightness() {
        // #Standard
        // LuminanceA = (0.2126*R) + (0.7152*G) + (0.0722*B)
        // #Percieved A
        // LuminanceB = (0.299*R + 0.587*G + 0.114*B)
        // #Perceived B, slower to calculate
        // LuminanceC = sqrt(0.299*(R**2) + 0.587*(G**2) + 0.114*(B**2))


        let [r, g, b, a] = this._value;
        return (0.2126 * r) + (0.7152 * g) + (0.0722 * b);
    }

    set brightness(value) {
        this._value = [value, value, value, 1];
    }

    set(r, g, b, a) {
        this._value = [r, g, b, a]
    }

    setColor(color) {
        this._value = [color.r, color.g, color.b, color.a];
    }

    clone() {
        let [r, g, b, a] = this._value;
        return new RGBAColor(r, g, b, a);
    }

    add(color) {
        let [r, g, b, a] = this._value;
        //this._value = [(r + color.r)/2, (g + color.g)/2, (b + color.b)/2, (a + color.a)/2];
        //this._value = [(r*a + color.r*color.a), (g*a + color.g*color.a), (b*a + color.b*color.a), 1];
        this._value = [(r + color.r), (g + color.g), (b + color.b), (a + color.a)];


    }

    blend(color) {
        let [r0, g0, b0, a0] = this._value;
        let [r1, b1, g1, a1] = color.value;

        let a01 = (1 - a0) * a1 + a0

        let r01 = ((1 - a0) * a1 * r1 + a0 * r0) / a01

        let g01 = ((1 - a0) * a1 * g1 + a0 * g0) / a01

        let b01 = ((1 - a0) * a1 * b1 + a0 * b0) / a01

        this._value = [r01, g01, b01, a01];
    }


    additive(color) {
        // https://gist.github.com/JordanDelcros/518396da1c13f75ee057
        let base = this._value;
        let added = color.value;

        let mix = [];
        mix[3] = 1 - (1 - added[3]) * (1 - base[3]); // alpha
        mix[0] = Math.round((added[0] * added[3] / mix[3]) + (base[0] * base[3] * (1 - added[3]) / mix[3])); // red
        mix[1] = Math.round((added[1] * added[3] / mix[3]) + (base[1] * base[3] * (1 - added[3]) / mix[3])); // green
        mix[2] = Math.round((added[2] * added[3] / mix[3]) + (base[2] * base[3] * (1 - added[3]) / mix[3])); // blue

        this._value = mix;
    }

    equal(color) {
        return (this._value[0] == color.r) && (this._value[1] == color.g) && (this._value[2] == color.b) && (this._value[3] == color.a);
    }


    /**
     * Averages `RGBAColor` into one
     * @param {Array<RGBAColor>} colors 
     * @returns RGBAColor
     */
    static average(colors) {
        // https://sighack.com/post/averaging-rgb-colors-the-right-way
        let r = 0, g = 0, b = 0, a = 0;
        for (let index = 0; index < colors.length; index++) {
            const color = colors[index];
            //if (!color.isNull()) {
                r += color.r * color.r;
                g += color.g * color.g;
                b += color.b * color.b;
                //a += color.a * color.a;
            //}
        }
        return new RGBAColor(
            Math.sqrt(r / colors.length),
            Math.sqrt(g / colors.length),
            Math.sqrt(b / colors.length)
            //Math.sqrt(a),
        );
    }

    static difference(c1, c2) {
        let r = 0;
        let g = 0;
        let b = 0;
        if (c1 && !c1.isNull() && c2 && !c2.isNull()) {
            const { r: r1, g: g1, b: b1 } = c1;
            const { r: r2, g: g2, b: b2 } = c2;
            r = r1 - r2;
            g = g1 - g2;
            b = b1 - b2;
        }

        return new RGBAColor(r, g, b);
    }

    isNull() {
        const [r, g, b, a] = this._value;
        return !(isNaN(r) && isNaN(g) && isNaN(b) && isNaN(a))
    }

    static colorRGBEuclideanDistance(c1, c2) {
        return Math.sqrt(Math.pow(c1.r - c2.r, 2) +
            Math.pow(c1.g - c2.g, 2) +
            Math.pow(c1.b - c2.b, 2));
    }

    /**
     * Checks how close two colors are. Closest is `0`.
     * @param {RGBAColor} color : Color to check distance;
     * @returns Number distace up to `1.42` I think...
     */
    euclideanDistance(color) {
        const [r, g, b] = this._value;
        return Math.sqrt(Math.pow(r - color.r, 2) +
            Math.pow(g - color.g, 2) +
            Math.pow(b - color.b, 2));
    }

    static getClosestColorInPalette(color, palette) {
        if (!palette) {
            throw ('Palette should be an array of `RGBA`s')
        }
        let distance = 100;
        let selectedColor = null;
        palette.forEach(paletteColor => {
            let currentDistance = color.euclideanDistance(paletteColor);
            if (currentDistance < distance) {
                selectedColor = paletteColor;
                distance = currentDistance;
            }
        })
        return selectedColor;
    }
}

export default RGBAColor;
