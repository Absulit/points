var<private> rand_seed : vec2<f32>;

fn rand() -> f32 {
    rand_seed.x = fract(cos(dot(rand_seed, vec2<f32>(23.14077926, 232.61690225))) * 136.8168);
    rand_seed.y = fract(cos(dot(rand_seed, vec2<f32>(54.47856553, 345.84153136))) * 534.7645);
    return rand_seed.y;
}



struct Vertex {
    position: array<f32,4>,
    color: array<f32,4>,
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

fn getWorkgroupByCoordinate(x: u32, y: u32) -> vec2<u32>{
    // let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
    // let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);

    let columnPointsPerWorkgroup:u32 = x % 8u;
    let rowPointsPerWorkgroup:u32 = y % 8u;

    //let workgroupX:u32 = u32(floor(f32(x) / f32(columnPointsPerWorkgroup)));
    //let workgroupY:u32 = u32(floor(f32(y) / f32(columnPointsPerWorkgroup)));

    let workgroupX:u32 = columnPointsPerWorkgroup;
    let workgroupY:u32 = rowPointsPerWorkgroup;
    return vec2<u32>(workgroupX, workgroupY);
}

fn fusin(speed: f32, utime: f32) -> f32 {
    return (sin(utime * speed) + 1.) * .5;
}

fn getPointAt(x: u32, y: u32) -> Point {
    let index:u32 = y + (x * u32(screenSize.numColumns));
    let r:Point = resultMatrix.points[index];
    return r;
}

struct Test{
    @builtin(workgroup_id) WorkGroupID: vec3<u32>
}

fn modifyColorAt(x: u32, y: u32, color: array<f32, 4>) {
    let index:u32 = y + (x * u32(screenSize.numColumns));
    resultMatrix.points[index].vertex0.color = color;
    resultMatrix.points[index].vertex1.color = color;
    resultMatrix.points[index].vertex2.color = color;
    resultMatrix.points[index].vertex3.color = color;
    resultMatrix.points[index].vertex4.color = color;
    resultMatrix.points[index].vertex5.color = color;

}

fn plotLineLow(x0: u32, y0: u32, x1: u32, y1: u32, color: array<f32, 4>) {
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

fn plotLineHigh(x0: u32, y0: u32, x1: u32, y1: u32, color: array<f32, 4>) {
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

fn drawLine(x0: u32, y0: u32, x1: u32, y1: u32, color: array<f32, 4>) {
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

// fn radians(angle:f32)->f32{
//     let pi = 3.14159;
//     return angle * (pi/180.);
// }

fn polar(distance:u32, radians:f32)->vec2<u32>{
    return vec2<u32>(  distance * u32(cos(radians)), distance * u32(sin(radians)));
}

fn drawCircle(x:u32, y:u32, radius:u32, color: array<f32, 4>) {
    var rads:f32;
    var lastModifiedPoint = vec2(0u,0u);
    for (var angle:f32 = 0.; angle < 360.; angle += .1) {
        rads = radians(angle);
        let pointFromCenter = polar(radius, rads);
        //if (lastModifiedPoint.x != x && lastModifiedPoint.y != y) {
            modifyColorAt( pointFromCenter.x + x, pointFromCenter.y + y, color);
            //lastModifiedPoint = vec2(x,y);
        //}
    }
}


@group(0) @binding(0) var<storage, read> firstMatrix : array<f32>;
@group(0) @binding(1) var<storage, read_write> resultMatrix : Points;
@group(0) @binding(2) var<storage, read> screenSize : ScreenSize;

@compute @workgroup_size(8,8,2)
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
    let constant = u32(numColumns) / 96u;

    let numColumnsPiece:i32 = i32(screenSize.numColumns / 8.);
    let numRowsPiece:i32 = i32(screenSize.numRows / 8.);
    if(WorkGroupID.z == 1u){

        for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
            for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

                let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
                let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);

                let nx:f32 = x / f32(numColumns);
                let ny:f32 = y / f32(numRows);

                let index:f32 = y + (x * screenSize.numColumns);

                let z = fusin(1., screenSize.uTime * .001 * x) * fusin(1., screenSize.uTime * .1 * y);
                let indexSin = z - sin(z - y * ny - x * screenSize.uTime * .0001);
                let indexCos = 1. - cos(nx - y * x * screenSize.uTime * .002);
                let indexTan = tan(index * screenSize.uTime * .00003);

                let color1 = array<f32,4>(indexSin, 0., 0., 1.);
                let color2 = array<f32,4>(z * indexSin, 0., 0., 1.);
                let color3 = array<f32,4>(0., 0., indexCos, 1.);
                modifyColorAt(u32(x),u32(y), color2);
            }
        }
    }


        let color1:array<f32, 4> = array<f32, 4>(1, 1, 0., 1.);

        modifyColorAt(10u * constant, 10u * constant, color1);
        drawLine(u32(  fusin(.1, screenSize.uTime ) * 80. )  * constant, 20u * constant, 90u * constant, 90u * constant, color1);
        drawLine( 10u  * constant, 50u * constant, 60u * constant, 90u * constant, color1);


        drawCircle(48u * constant,48u * constant, 100u,color1);


}
