/**

The idea here is that the columns are the current stage of the storage
being checked at entries and dynamic bindings, and the rows are the stage where
the storage should show; the table then matches both.
The thing to remember here is, if the storage is required in any combination,
then the fragment stage (if is included) then there the storage must be
read access mode; if there's no vertex then the storage during fragment can be
read_write. Compute is always read_write.


| storage      \     current| COMPUTE    | VERTEX	 | FRAGMENT
| --------------------------|:-----------|:----------|----------:|
| compute, vertex, fragment | read_write | read	     | read
| compute                   | read_write |           |
| vertex                    |            | read      |
| fragment                  |            |           | read_write
| compute, vertex           | read_write | read      |
| compute, fragment         | read_write |           | read_write
| vertex, fragment          |            | read	     | read

* @module storage-accessmode
* @ignore
*/

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

export const bindingModes = { ['r']: 'read', ['rw']: 'read_write' };
export const entriesModes = { ['r']: 'read-only-storage', ['rw']: 'storage' };
