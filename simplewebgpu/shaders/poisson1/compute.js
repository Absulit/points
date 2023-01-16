import { brightness } from '../defaultFunctions.js';
import defaultStructs from '../defaultStructs.js';
import { rand } from '../random.js';

const compute = /*wgsl*/`

${defaultStructs}

struct PVector{
    x: f32,
    y: f32,
    used: i32
}

struct Variable{
    init: i32,
    activeIndex: i32,
}

${brightness}
${rand}

const workgroupSize = 8;

// https://dev.to/christiankastner/poisson-disc-sampling-and-generative-art-2fpd

fn testSample(sample: vec2<f32>) -> bool {
    let col = floor(sample.x / params.w);
    let row = floor(sample.y / params.w);
    //println(col, row, cols, rows, grid[col + row * cols]);
    if (col > 0 && row > 0 && col < params.columns - 1 && row < params.rows - 1 && (col + row * params.columns) < params.numCels ) {
      for (var i = -1; i <= 1; i++) {
        for (var j = -1; j <= 1; j++) {
          let index = ( i32(col) + i) + (i32(row) + j) * i32(params.columns);
          let neighbor = grid[index];
          if (index < i32(params.numCels)) {
            let d = distance(sample, neighbor);
            if (d < params.r) {
              return false;
            }
          }
        }
      }
      return true;
    }
    return false;
}

@compute @workgroup_size(workgroupSize,workgroupSize,1)
fn main(
    @builtin(global_invocation_id) GlobalId: vec3<u32>,
    @builtin(workgroup_id) WorkGroupID: vec3<u32>,
    @builtin(local_invocation_id) LocalInvocationID: vec3<u32>
) {
    _ = params.utime;



    _ = grid[0];
    _ = active_grid[0];

    //--------------------------------------------------
    let dims = textureDimensions(image);

    let numColumns:f32 = f32(dims.x);
    let numRows:f32 = f32(dims.y);
    //let constant = u32(numColumns) / 93u;

    let numColumnsPiece:i32 = i32(numColumns / f32(workgroupSize));
    let numRowsPiece:i32 = i32(numRows / f32(workgroupSize));

    var layerIndex = 0;
    if(variables.init == 0){

        let point = vec2(rand() * params.screenWidth, rand() * params.screenHeight);

        let i = u32(floor(point.x/params.w));
        let j = u32(floor(point.y/params.w));

        grid[i + j * u32(params.columns)] = point;
        variables.activeIndex = 0;
        active_grid[variables.activeIndex] = point;



        variables.init = 1;
    }else{
        layerIndex = 1;
    }



    if (variables.activeIndex > 0) {
        let i = i32(floor(rand() * f32(variables.activeIndex)));
        let pos = active_grid[i];
        for (var j = 0; j < i32(params.k); j++) {
          rand();
          var sample = rand_seed;
          let newMagnitude = params.r + rand() * 2*params.r;// random(r, 2 * r);
          //sample = length(m);
          let magnitude = sqrt(sample.x * sample.x + sample.y * sample.y);
          sample.x = sample.x * newMagnitude / magnitude;
          sample.y = sample.y * newMagnitude / magnitude;
          sample += pos;
          if (testSample(sample) == true) {
            variables.activeIndex++;
            active_grid[variables.activeIndex] = sample;
            let x = i32(floor(sample.x / params.w));
            let y = i32(floor(sample.y / params.w));
            grid[x + y * i32(params.columns)] = sample;
            break;
          } else if (j == i32(params.k) - 1) {
            active_grid[i] = vec2(0.); // maybe vec3 and use z as flag
          }
        }
      }




    //--------------------------------------------------




    for (var indexColumns:i32 = 0; indexColumns < numColumnsPiece; indexColumns++) {
        let x:f32 = f32(WorkGroupID.x) * f32(numColumnsPiece) + f32(indexColumns);
        let ux = u32(x);
        let ix = i32(x);
        let nx = x / numColumns;
        for (var indexRows:i32 = 0; indexRows < numRowsPiece; indexRows++) {

            let y:f32 = f32(WorkGroupID.y) * f32(numRowsPiece) + f32(indexRows);
            let uy = u32(y);
            let iy = i32(y);
            let ny = y / numRows;
            let uv = vec2(nx,ny);

            let pointIndex = i32(x + (y * numColumns));

            var point = textureLoad(image, vec2<i32>(ix,iy), 0); // image
            //var point = textureLoad(image, vec2<i32>(ix,iy) * factor); // video
            // layers[0][pointIndex] = point;
            // layers[1][pointIndex] = point;

            let positionU = vec2<u32>(ux,uy);
            textureStore(outputTex, positionU, point);
        }
    }


}
`;

export default compute;
