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
        let [r, g, b, a] = this._value;
        return ((r + b + g) / 3);
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
}

export default RGBAColor;
