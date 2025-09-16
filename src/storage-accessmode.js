const cache = {
    [GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: 'rw',
        [GPUShaderStage.VERTEX]: 'r',
        [GPUShaderStage.FRAGMENT]: 'r'
    },//
    [GPUShaderStage.COMPUTE]: {
        [GPUShaderStage.COMPUTE]: 'rw',
        [GPUShaderStage.VERTEX]: null,
        [GPUShaderStage.FRAGMENT]: null
    },
    [GPUShaderStage.VERTEX]: {
        [GPUShaderStage.COMPUTE]: null,
        [GPUShaderStage.VERTEX]: 'r',
        [GPUShaderStage.FRAGMENT]: null
    },
    [GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: null,
        [GPUShaderStage.VERTEX]: null,
        [GPUShaderStage.FRAGMENT]: 'rw'
    },//
    [GPUShaderStage.COMPUTE | GPUShaderStage.VERTEX]: {
        [GPUShaderStage.COMPUTE]: 'rw',
        [GPUShaderStage.VERTEX]: 'r',
        [GPUShaderStage.FRAGMENT]: null
    },
    [GPUShaderStage.COMPUTE | GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: 'rw',
        [GPUShaderStage.VERTEX]: null,
        [GPUShaderStage.FRAGMENT]: 'rw'
    },//
    [GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT]: {
        [GPUShaderStage.COMPUTE]: null,
        [GPUShaderStage.VERTEX]: 'r',
        [GPUShaderStage.FRAGMENT]: 'r'
    },
}

export default function getStorageAccessMode(currentStage, storageShaderTypes) {
    // console.log(currentStage, storageShaderTypes);
    return cache[storageShaderTypes][currentStage];
}
