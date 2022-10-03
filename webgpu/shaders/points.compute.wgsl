var<private> rand_seed : vec2<f32>;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}

const yellow:Color = Color(1, 1, 0., 1.);
const green:Color = Color(0., 1, 0., 1.);
const red:Color = Color(1., 0, 0., 1.);
const white:Color = Color(1., 1., 1., 1.);
const orange:Color = Color(1., .64, 0., 1.);

const clearMixlevel = 1.01;
const colorPower = 1.;
const workgroupSize = 8;

struct Color{
    r: f32,
    g: f32,
    b: f32,
    a: f32
}

struct Position{
    x: f32,
    y: f32,
    z: f32,
    w: f32
}




struct Vertex {
    position: Position,
    //color: array<f32,4>,
    color: Color,
    uv: array<f32,2>,
}

struct Screen {
    size: vec2<f32>,
    points: array<f32>
}

struct ScreenSize {
    numRows: f32,
    numColumns: f32,
    uTime: f32
}

struct Point {
    vertex0: Vertex,
    vertex1: Vertex,
    vertex2: Vertex,
    vertex3: Vertex,
    vertex4: Vertex,
    vertex5: Vertex,
}

struct Points {
    points: array<Point>
}

fn getWorkgroupByCoordinate(x: u32, y: u32) -> vec2<u32> {
    // let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
    // let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);

    let columnPointsPerWorkgroup:u32 = x % u32(workgroupSize);
    let rowPointsPerWorkgroup:u32 = y % u32(workgroupSize);

    //let workgroupX:u32 = u32(floor(f32(x) / f32(columnPointsPerWorkgroup)));
    //let workgroupY:u32 = u32(floor(f32(y) / f32(columnPointsPerWorkgroup)));

    let workgroupX:u32 = columnPointsPerWorkgroup;
    let workgroupY:u32 = rowPointsPerWorkgroup;
    return vec2<u32>(workgroupX, workgroupY);
}

fn fnusin(speed: f32, utime: f32) -> f32 {
    return (sin(utime * speed) + 1.) * .5;
}


//let active_particle: ptr<storage,Particle> = &system.particles[system.active_index];
//(*active_particle).position = delta_position + current_position;

fn getPointAt(x: u32, y: u32, pointerPoint: ptr<function,Point>) {
    let index:u32 = y + (x * u32(screenSize.numColumns));
    *pointerPoint = resultMatrix.points[index];
}

struct Test {
    @builtin(workgroup_id) WorkGroupID: vec3<u32>
}

fn getPointsIndex(x: u32, y: u32) -> u32{
    return y + (x * u32(screenSize.numColumns));
}

fn modifyColorAt(x: u32, y: u32, color: Color) {
    let index:u32 = getPointsIndex(x, y);
    let pointerPoint: ptr<storage,Point, read_write> = &resultMatrix.points[index];
    *pointerPoint.vertex0.color = color;
    *pointerPoint.vertex1.color = color;
    *pointerPoint.vertex2.color = color;
    *pointerPoint.vertex3.color = color;
    *pointerPoint.vertex4.color = color;
    *pointerPoint.vertex5.color = color;
}

fn modifyColorAtPointer(pointerPoint:ptr<private, Point>, color: Color){
    (*pointerPoint).vertex0.color = color;
    (*pointerPoint).vertex1.color = color;
    (*pointerPoint).vertex2.color = color;
    (*pointerPoint).vertex3.color = color;
    (*pointerPoint).vertex4.color = color;
    (*pointerPoint).vertex5.color = color;
}

fn getColorAt(x: u32, y: u32) -> Color {
    let index:u32 = getPointsIndex(x, y);
    return resultMatrix.points[index].vertex0.color;
}

fn getColorAtIndex(index:u32) -> Color {
    return resultMatrix.points[index].vertex0.color;
}

fn getBrightness(x: u32, y: u32) -> f32{
    let index:u32 = getPointsIndex(x, y);
    let color = resultMatrix.points[index].vertex0.color;
    return (0.2126 * color.r) + (0.7152 * color.g) + (0.0722 * color.b);
}

fn getColorsAround(x: u32, y: u32, distance: u32) -> array<  Color, 8  > {

    return array< Color,8 >(
        getColorAt(x - distance, y - distance), // top left   NW 0
        getColorAt(x, y - distance),              // top        N 1
        getColorAt(x + distance, y - distance), // top right   NW 0
        getColorAt(x - distance, y),              // left        N 1
        getColorAt(x + distance, y),              // right        N 1
        getColorAt(x - distance, y + distance), // bottom left        N 1
        getColorAt(x, y + distance),              // bottom         N 1
        getColorAt(x + distance, y + distance), // bottom   right      N 1
    );
}

fn getRightColor(x: u32, y: u32, distance: u32) -> Color{
    return getColorAt(x + distance, y);
}

fn getLeftColor(x: u32, y: u32, distance: u32) -> Color{
    return getColorAt(x - distance, y);
}

fn getColorsAroundCross(x: u32, y: u32, distance: u32) -> array<  Color, 4  > {

    return array< Color, 4 >(
        getColorAt(x, y - distance),              // top        N 1
        getColorAt(x - distance, y),              // left        N 1
        getColorAt(x + distance, y),              // right        N 1
        getColorAt(x, y + distance),              // bottom         N 1
    );
}

fn getColorsAroundX(x: u32, y: u32, distance: u32) -> array<  Color, 4> {

    return array< Color, 4>(
        getColorAt(x - distance, y - distance), // top left   NW 0
        getColorAt(x + distance, y - distance), // top right   NW 0
        getColorAt(x - distance, y + distance), // bottom left        N 1
        getColorAt(x + distance, y + distance), // bottom   right      N 1
    );
}

fn plotLineLow(x0: u32, y0: u32, x1: u32, y1: u32, color: Color) {
    var dx:i32 = i32(x1) - i32(x0);
    var dy:i32 = i32(y1 - y0);
    var yi:i32 = 1;
    if (dy < 0) {
        yi = -1;
        dy = -1 * dy;
    }
    var D = (2 * i32(dy)) - dx;
    var y = y0;

    for (var x:u32 = x0; x < x1; x++) {
        modifyColorAt(x, y, color);
        if (D > 0) {
            y = y + u32(yi);
            D = D + (2 * (dy - dx));
        } else {
            D = D + 2 * dy;
        }
    }
}

fn plotLineHigh(x0: u32, y0: u32, x1: u32, y1: u32, color: Color) {
    var dx:i32 = i32(x1) - i32(x0);
    var dy:i32 = i32(y1 - y0);
    var xi:i32 = 1;
    if (dx < 0) {
        xi = -1;
        dx = -dx;
    }
    var D = (2 * dx) - dy;
    var x = x0;

    for (var y = y0; y < y1; y++) {
        modifyColorAt(x, y, color);
        if (D > 0) {
            x = x + u32(xi);
            D = D + (2 * (dx - dy));
        } else {
            D = D + 2 * dx;
        }
    }
}

fn drawLine(x0: u32, y0: u32, x1: u32, y1: u32, color: Color) {
    if (abs(y1 - y0) < abs(x1 - x0)) {
        if (x0 > x1) {
            plotLineLow(x1, y1, x0, y0, color);
        } else {
            plotLineLow(x0, y0, x1, y1, color);
        }
    } else {
        if (y0 > y1) {
            plotLineHigh(x1, y1, x0, y0, color);
        } else {
            plotLineHigh(x0, y0, x1, y1, color);
        }
    }
}

fn degToRad(angle: f32) -> f32 {
    let pi = 3.14159;
    return angle * pi / 180.;
}

fn polar(distance: u32, radians: f32) -> vec2<i32> {
    return vec2<i32>(i32(f32(distance) * cos(radians)), i32(f32(distance) * sin(radians)));
}

fn drawCircle(x: u32, y: u32, radius: u32, color: Color) {
    var rads:f32;
    var lastModifiedPoint:vec2<u32> = vec2(0u, 0u);
    for (var angle:f32 = 0.; angle < 360.; angle += .1) {
        rads = radians(angle);
        let pointFromCenter = polar(radius, rads);
        let cx:u32 = u32(pointFromCenter.x + i32(x));
        let cy:u32 = u32(pointFromCenter.y + i32(y));
        if (lastModifiedPoint.x != cx && lastModifiedPoint.y != cy) {
            modifyColorAt(cx, cy, color);
            lastModifiedPoint = vec2(cx, cy);
        }
    }
}

fn sdfCircle(position:vec2<f32>, currentPosition:vec2<f32>, percent: f32) -> bool{
    let d = distance( currentPosition, position) / screenSize.numColumns;
    return d < percent;
}


// fn clearMix(r:f32, g:f32, b:f32, a:f32) -> Color{
//     let rr = r / clearMixlevel;
//     let gr = g / clearMixlevel;
//     let br = b / clearMixlevel;
//     return Color(rr, gr, br, a);
// }

fn clearMix(color:Color) -> Color{
    let rr = color.r / clearMixlevel;
    let gr = color.g / clearMixlevel;
    let br = color.b / clearMixlevel;
    return Color(rr, gr, br, color.a);
}

fn soften8(color:Color, colorsAround:array<Color, 8>, colorPower:f32) -> Color {
    var newColor:Color = color;
    for (var indexColors = 0u; indexColors < 8u; indexColors++) {
        let colorAround = colorsAround[indexColors];
        newColor.r = (newColor.r + colorAround.r * colorPower) / (colorPower + 1.);
        newColor.g = (newColor.g + colorAround.g * colorPower) / (colorPower + 1.);
        newColor.b = (newColor.b + colorAround.b * colorPower) / (colorPower + 1.);
        newColor.a = (newColor.a + colorAround.a * colorPower) / (colorPower + 1.);
    }
    return newColor;
}

fn soften4(color:Color, colorsAround:array<Color, 4>, colorPower:f32) -> Color {
    var newColor:Color = color;
    for (var indexColors = 0u; indexColors < 4u; indexColors++) {
        let colorAround = colorsAround[indexColors];
        newColor.r = (newColor.r + colorAround.r * colorPower) / (colorPower + 1.);
        newColor.g = (newColor.g + colorAround.g * colorPower) / (colorPower + 1.);
        newColor.b = (newColor.b + colorAround.b * colorPower) / (colorPower + 1.);
        newColor.a = (newColor.a + colorAround.a * colorPower) / (colorPower + 1.);
    }
    return newColor;
}

fn chromaticAberration(x:u32, y:u32, color:Color, threshold:f32, distance:u32){
    // thresold .5
    if(getBrightness(x, y) > threshold ){
        let rightColor = getRightColor(x, y, distance);

        var newColor = Color((rightColor.r + color.r) / 2, rightColor.g, rightColor.b, (rightColor.a + color.a) / 2) ;
        modifyColorAt(x + distance, y, newColor);

        let leftColor = getLeftColor(x, y, distance);
        newColor = Color(leftColor.r, leftColor.g, (leftColor.b + color.b) / 2, (leftColor.a + color.a) / 2) ;
        modifyColorAt(x - distance, y, newColor);
    }
}


@group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
@group(0) @binding(1) var<storage, read_write> resultMatrix : Points;
@group(0) @binding(2) var<storage, read> screenSize : ScreenSize;

@compute @workgroup_size(workgroupSize,workgroupSize,2)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {

    let longvarname = firstMatrix[0];
    //resultMatrix[0] = -1;
    // let b = secondMatrix.size.x;

    let numColumns:f32 = screenSize.numColumns;
    let numRows:f32 = screenSize.numRows;
    let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(screenSize.numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(screenSize.numRows / f32(workgroupSize));
    if (WorkGroupID.z == 0u) {

        // for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        //     let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        //     let ux = u32(x);
        //     for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

        //         let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
        //         let uy = u32(y);

        //         let nx:f32 = x / f32(numColumns);
        //         let ny:f32 = y / f32(numRows);

        //         var currentColor = getColorAt(ux, uy);


        //         let index:f32 = y + (x * screenSize.numColumns);

        //         let d = distance( vec2<f32>(x, y), vec2<f32>(48.*f32(constant),48.*f32(constant))) / numColumns;
        //         let z = fnusin(1., screenSize.uTime * .001 * x) * fnusin(1., screenSize.uTime * .1 * y);
        //         let indexSin = z - sin(z - y * ny - x * screenSize.uTime * .0001);
        //         let indexCos = 1. - cos(nx - y * x * screenSize.uTime * .002);
        //         let indexTan = tan(index * screenSize.uTime * .00003);

        //         let color1 = Color(indexSin, 0., 0., 1.);
        //         let color2 = Color(z * indexSin, 0., 0., 1.);
        //         let color3 = Color(0., 0., indexCos, 1.);

        //         currentColor = color2;
        //         if( sdfCircle( vec2<f32>(48.*f32(constant),48.*f32(constant)), vec2<f32>(x, y),  .1 + .2 * fnusin(1.359, screenSize.uTime)  ) ){
        //             currentColor = white;
        //         }

        //         modifyColorAt(ux, uy, currentColor);
                
        //     }
        //     let color1 = Color(1., 1., 1., 1.);
        //     let centerRows = numRows / 2.;
        //     let xCurve = centerRows + sin(( f32(x) / f32(constant) * 1.) + screenSize.uTime) * f32(constant) * 2.;
        //     modifyColorAt(u32(x), u32(xCurve), color1);
        // }
    }

    if (WorkGroupID.z == 0u) {
        //modifyColorAt(10u * constant, 10u * constant, yellow);
        //drawLine(u32(fnusin(2, screenSize.uTime) * 80. * f32(constant)), 20u * constant, 90u * constant, 90u * constant, white);
        //drawLine(10u * constant, 50u * constant, 60u * constant, 90u * constant, yellow);
        //drawLine(1u * constant, 80u * constant, 80u * constant, 10u * constant, green);
        //drawCircle(48u * constant, 48u * constant, u32(fnusin(1.5, screenSize.uTime) * 80. * f32(constant)), red);


        // let usin = sin(screenSize.uTime);
        // let ucos = cos(screenSize.uTime);
        // let radius = 10.;
        // let side = numColumns;
        // let x = 48u * constant;
        // let y = 48u * constant;
        // let ix = i32(x);
        // let iy = i32(y);

        // var rads:f32;
        // var lastModifiedPoint:vec2<u32> = vec2(0u, 0u);
        // let fconstant = f32(constant);
        // for (var angle:f32 = 0.; angle < 360.; angle += 1.) {
        //     rads = radians(angle);


        //     let pointFromCenter = polar( u32(radius * usin * ucos * angle / fconstant   )  , rads/usin );
        //     let cx:u32 = u32(pointFromCenter.x + ix);
        //     let cy:u32 = u32(pointFromCenter.y + iy);

        //     if (lastModifiedPoint.x != cx && lastModifiedPoint.y != cy) {

        //         drawLine(lastModifiedPoint.x, lastModifiedPoint.y, cx, cy, orange);
        //         lastModifiedPoint = vec2(cx, cy);
        //     }
        // }
    }


    if (WorkGroupID.z == 1u) {
        for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
            let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
            let ux = u32(x);
            for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

                let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
                let uy = u32(y);

                //let index:f32 = y + (x * screenSize.numColumns);

                //let colorsAround = getColorsAround(ux, uy, 1u);
                let colorsAround = getColorsAroundCross(ux, uy, u32( 1 + 50. * fnusin(1.1, screenSize.uTime)));
                //let colorsAround = getColorsAroundCross(ux, uy, 1);
                //let colorsAround = getColorsAroundX(ux, uy, 1u);
                var currentColor = getColorAt(ux, uy);


                if( sdfCircle( vec2<f32>(48.*f32(constant),48.*f32(constant)), vec2<f32>(x, y),  .1 + .2 * fnusin(1.359, screenSize.uTime)  ) ){
                    currentColor = white;
                }

                currentColor = soften4(currentColor, colorsAround, colorPower);
                //currentColor = soften8(currentColor, colorsAround, colorPower);
                currentColor = clearMix(currentColor);

                chromaticAberration(ux, uy, currentColor, .1 + .8 * fnusin(3, screenSize.uTime), u32( 2 + 50. * fnusin(.5, screenSize.uTime)) );

                modifyColorAt(ux, uy, currentColor);
            }

            let centerRows = numRows / 2.;
            let xCurve = centerRows + sin(( x / f32(constant) * fnusin(.5596, screenSize.uTime) ) + screenSize.uTime) * f32(constant) * 2.;
            modifyColorAt(ux, u32(xCurve), orange);
        }
    }
}
