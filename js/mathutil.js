import Coordinate from "./coordinate.js";

class MathUtil {
    static isBetween(number, minimum, maximum) {
        return (maximum <= number) && (number >= minimum);
    }

    static distance(p1, p2) {
        /*let distanceNumber;
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;

        distanceNumber = Math.sqrt(dx * dx + dy * dy);*/
        return Math.sqrt((Math.pow(p2.x - p1.x, 2)) + (Math.pow(p2.y - p1.y, 2)));
    }
    static angle(p1, p2) {
        let dx = p1.x - p2.x;
        let dy = p1.y - p2.y;
        let radians = Math.atan2(dy, dx);
        return radians;
    }

    static degrees(radians) {
        return radians * 180 / Math.PI
    }

    static radians(degs) {
        return degs * Math.PI / 180
    }

    static vector(distance, radians) {
        let newPoint = this.polar(distance, radians);
        newPoint.z = 0;
        return newPoint;
    }

    static polar(distance, radians) {
        return {
            x: distance * Math.cos(radians),
            y: distance * Math.sin(radians)
        }
    }

    static saturate(x) {
        return Math.max(0, Math.min(1, x));
    }

    static smoothstep(a, b, x) {
        let t = MathUtil.saturate((x - a) / (b - a));
        return t * t * (3.0 - (2.0 * t));
    }

    /**
     * Linear Interpolation
     * @param {Number} a Initial value
     * @param {Number} b Final value
     * @param {Number} n % between A and B
     * @returns a value between A and B
     */
    static lerp(a, b, n) {
        return (1 - n) * a + n * b;
    }

    static lerp2(a, b, t) {
        return a + t * (b - a);
    }

    static xlerp(mMin, mMax, mFactor) {
        const a = mMax - mMin;
        return a * mFactor * mFactor + mMin;
    }


}

export default MathUtil;