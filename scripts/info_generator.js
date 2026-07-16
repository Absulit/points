/**
 * The idea of this script is to generate each info file from each example
 * from the shader_projects.js file.
 * In case a new attribute is required, it would be better to just add it here
 * and it will update all the info files.
 *
 * shader_projects.sh does the opposite, generates the shader_projects.js from
 * the info files.
 */

import fs from 'fs/promises';

import { shaderProjects } from './../examples/index_files/shader_projects.js'

shaderProjects.forEach(async sp => {
    const path = 'examples/' + sp.path.replace('index.js', 'info')
    const { name, uri, desc, author, authlink, fitWindow, enabled, tax } = sp;
    const contents = `#!/bin/bash

name='${name}'
uri='${uri}'
desc='${desc}'
author='${author}'
authlink='${authlink}'
fitWindow=${fitWindow}
enabled=${enabled}
tax='${tax}'
`;

    const fileHandle = await fs.open(path, 'w');
    await fileHandle.writeFile(contents, 'utf-8');
    await fileHandle.close();
})

console.log('info files created.');
