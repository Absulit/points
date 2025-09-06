export const structs = /*wgsl*/`

struct Hist {
    data: array<f32, 256>
}

struct Counter {
    value: atomic<i32>,
};

`;
