import Points, { Uniform, Storage } from 'points';
import Uniforms from './../src/Uniforms.js';
import Storages from './../src/Storages.js';

const points = new Points();

QUnit.module('Uniform', hooks => {
    /** @type{Uniform} */
    let myUniform;
    const name = 'myUniform';
    hooks.before(() => {
        myUniform = points.setUniform(name);
    })
    QUnit.test('Uniform name', assert => {
        assert.equal(myUniform.name, name, `name should be ${name}`);
    });
    QUnit.test('Uniform is default f32', assert => {
        assert.equal(myUniform.type, 'f32', `type should be f32`);
    })

    QUnit.test('myUniform is instance of Uniform', assert => {
        assert.true(myUniform instanceof Uniform, 'myUniform should be of type Uniform');
    })

    QUnit.test('myUniform.value has the value set with setValue', assert => {
        myUniform.setValue(10);
        assert.equal(myUniform.value, 10, 'value should be 10')
    })

    //----

    QUnit.test('Uniform should throw error if object is passed as value', assert => {
        assert.throws(() => {
            points.setUniform('a', {})
        }, 'Should throw an error when passed an object in function call');

        assert.throws(() => {
            points.setUniform('b')
                .setValue({})
        }, 'Should throw an error when passed an object in setValue')

        assert.throws(() => {
            myUniform.value = {}
        }, 'Should throw an error when passed an object in value attribute')

    })

    QUnit.test('Uniform should throw error if a string is passed as value', assert => {
        assert.throws(() => {
            points.setUniform('c', '')
        }, 'Should throw an error when passed a string in function call');

        assert.throws(() => {
            points.setUniform('d')
                .setValue('')
        }, 'Should throw an error when passed a string in setValue')

        assert.throws(() => {
            myUniform.value = ''
        }, 'Should throw an error when passed an string in value attribute')
    })

    QUnit.test('Uniform should throw error if type is array', assert => {

        assert.throws(() => {
            points.setUniform('h', [0, 0, 0, 0, 0], 'array<f32, 5>');
        }, 'Should throw an error when passed an array in function call');

        assert.throws(() => {
            points.setUniform('i')
                .setType('array<f32, 5>')
        }, 'Should throw an error when passed an array in setValue')

        assert.throws(() => {
            points.setUniform('j')
                .type = 'array<f32, 5>'
        }, 'Should throw an error when passed an array in type attribute')

    })


    QUnit.test('Uniform name should not be a number even if string', assert => {
        assert.throws(() => {
            points.setUniform(123)
        }, 'Should throw an error when passed a number')
        assert.throws(() => {
            points.setUniform('123')
        }, 'Should throw an error when passed a number as string')
    })

    // QUnit.test('Uniform set an array as value should fail if greater than 4', assert => {
    //     assert.throws(() => {
    //         points.uniforms.k = [1, 2, 3, 4, 5];
    //     }, 'Should throw an error when array passed has a length greater than 4')
    // })

    QUnit.test('Uniform set an array as value should fail if lower than 2', assert => {
        assert.throws(() => {
            points.uniforms.k = [1];
        }, 'Should throw an error when array passed has a length lower than 2')
    })

});

QUnit.module('Storage', hooks => {
    /** @type{Storage} */
    let myStorage;
    const name = 'storageName';
    hooks.before(() => {
        myStorage = points.setStorage(name);
    })

    QUnit.test('Storage name has the same name assigned', assert => {
        assert.equal(myStorage.name, name, 'Storage name should be the same as assigned in function')
    })

    QUnit.test('Storage is default f32', assert => {
        assert.equal(myStorage.type, 'f32', `type should be f32`);
    })

    QUnit.test('myStorage is instance of Storage', assert => {
        assert.true(myStorage instanceof Storage, 'myStorage should be of type Storage');
    })

    QUnit.test('myStorage.value has the value set with setValue', assert => {
        const value = 10;
        myStorage.setValue(value);
        assert.equal(myStorage.value, value, 'value should be 10')
    })

    //----
    QUnit.test('Storage should throw error if object is passed as value', assert => {
        assert.throws(() => {
            points.setStorage('a', 'f32', {})
        }, 'Should throw an error when passed an object in function call');

        assert.throws(() => {
            points.setStorage('b')
                .setValue({})
        }, 'Should throw an error when passed an object in setValue')

        assert.throws(() => {
            myStorage.value = {}
        }, 'Should throw an error when passed an object in value attribute')

    })

    QUnit.test('Storage should throw error if a string is passed as value', assert => {
        assert.throws(() => {
            points.setStorage('c', 'f32', '')
        }, 'Should throw an error when passed a string in function call');

        assert.throws(() => {
            points.setStorage('d')
                .setValue('')
        }, 'Should throw an error when passed a string in setValue')

        assert.throws(() => {
            myStorage.value = ''
        }, 'Should throw an error when passed an string in value attribute')
    })

    QUnit.test('Storage name should not be a number even if string', assert => {
        assert.throws(() => {
            points.setStorage(123)
        }, 'Should throw an error when passed a number')
        assert.throws(() => {
            points.setStorage('123')
        }, 'Should throw an error when passed a number as string')
    })

    QUnit.test('Storage can accept Uint8Array as value', assert => {
        try {
            const bufferLength = 4;
            const data = new Uint8Array(bufferLength);
            points.setStorage('testUintArray').setValue(data);
            assert.ok(true, `assignment didn't throw error`);
        } catch (e) {
            assert.ok(false, `assignment throw error: ${e.message}`);
        }
    })


})

QUnit.module('Uniforms', hooks => {
    /** @type{Uniforms} */
    let uniforms;
    hooks.before(() => {
        uniforms = new Uniforms();
    })

    QUnit.test('Uniforms creates an Uniform class entry by calling a property', assert => {
        assert.equal(uniforms.a.constructor.name, 'Uniform', 'Attribute should be an Uniform class')
    })

    QUnit.test('Uniform created type should be f32', assert => {
        assert.equal(uniforms.a.type, 'f32', 'Type should be f32')
    })

    QUnit.test('Uniform default value should be undefined or null', assert => {
        assert.true(!uniforms.a.value, 'Value should be undefined or null')
    })

    QUnit.test('Assigning a value directly to attribute should create Uniform and set its value', assert => {
        const value = 14;
        uniforms.b = value;
        assert.equal(uniforms.b.value, value, 'Value should be the same assigned before reading')
    })

    QUnit.test('Assigning a string to attribute should throw an error', assert => {
        assert.throws(() => {
            uniforms.c = 'some string';
        }, 'Should throw an error when a string is assigned')
    })

    QUnit.test('Assigning an object to attribute should throw an error', assert => {
        assert.throws(() => {
            uniforms.d = {};
        }, 'Should throw an error when an object is assigned')
    })

    QUnit.test('Assigning an array to attribute should NOT throw an error', assert => {
        try {
            uniforms.e = [0, 0, 0];
            assert.ok(true, `assignment didn't throw error`);
        } catch (e) {
            assert.ok(false, `assignment throw error: ${e.message}`);
        }
    })

    QUnit.test('Uniforms.list is of type UniformsArray', assert => {
        assert.equal(uniforms.list.constructor.name, 'UniformsArray', 'list should be of type UniformsArray')
    })

    QUnit.test('Assigning a value to an already existing uniform should replace the value', assert => {
        const originalValue = 10;
        const newValue = 20;

        uniforms.oldUniform = originalValue;
        uniforms.oldUniform = newValue;

        assert.equal(uniforms.oldUniform.value, newValue, 'Should have the new value assigned');
    })

    QUnit.test('Updating array size should throw an error', assert => {
        const originalValue = [0, 0, 0];
        const newValue = [0, 0, 0, 0];

        assert.throws(() => {
            uniforms.oldUniform2 = originalValue;
            uniforms.oldUniform2 = newValue;
        }, 'Should throw an error if the array length has changed')
    })

    QUnit.test('Incrementing value directly with += should increase its value', assert => {
        const finalValue = 3;
        uniforms.numUniform = 0;
        uniforms.numUniform += finalValue;
        assert.equal(uniforms.numUniform.value, finalValue);
    })

    QUnit.test('Incrementing value directly with += should throw error if the types don\'t match', assert => {
        const arrayValue = [3];
        uniforms.numUniform2 = 0;
        assert.throws(() => {
            uniforms.numUniform2 += arrayValue;
        }, 'Should throw an error if the types don\'t match')
    })

    QUnit.test('Adding an array sets the type to corresponding vecXf form', assert => {
        uniforms.vec2Uniform = [0, 1];
        assert.equal(uniforms.vec2Uniform.type, 'vec2f', 'Type should be vec2f');

        uniforms.vec3Uniform = [0, 1, 2];
        assert.equal(uniforms.vec3Uniform.type, 'vec3f', 'Type should be vec3f');

        uniforms.vec4Uniform = [0, 1, 2, 3];
        assert.equal(uniforms.vec4Uniform.type, 'vec4f', 'Type should be vec4f');
    });

})

QUnit.module('Storages', hooks => {
    /** @type{Uniforms} */
    let storages;
    hooks.before(() => {
        storages = new Storages();
    })

    QUnit.test('Storages creates a Storage class entry by calling a property', assert => {
        assert.equal(storages.a.constructor.name, 'Storage', 'Attribute should be an Storage class')
    })

    QUnit.test('Storage created type should be f32', assert => {
        assert.equal(storages.a.type, 'f32', 'Type should be f32')
    })

    QUnit.test('Storage default value should be undefined or null', assert => {
        assert.true(!storages.a.value, 'Value should be undefined or null')
    })

    QUnit.test('Assigning a value directly to attribute should create Uniform and set its value', assert => {
        const value = 14;
        storages.b = value;
        assert.equal(storages.b.value, value, 'Value should be the same assigned before reading')
    })

    QUnit.test('Assigning a string to attribute should throw an error', assert => {
        assert.throws(() => {
            storages.c = 'some string';
        }, 'Should throw an error when a string is assigned')
    })

    QUnit.test('Assigning an object to attribute should throw an error', assert => {
        assert.throws(() => {
            storages.d = {};
        }, 'Should throw an error when an object is assigned')
    })

    QUnit.test('Assigning an array to attribute should NOT throw an error', assert => {
        try {
            storages.e = [0, 0, 0];
            assert.ok(true, `assignment didn't throw error`);
        } catch (e) {
            assert.ok(false, `assignment throw error: ${e.message}`);
        }
    })

    QUnit.test('Uniforms.list is of type Array', assert => {
        assert.equal(storages.list.constructor.name, 'Array', 'list should be of type Array')
    })

    QUnit.test('Assigning a value to an already existing Storage should replace the value', assert => {
        const originalValue = 10;
        const newValue = 20;

        storages.oldStorage = originalValue;
        storages.oldStorage = newValue;

        assert.equal(storages.oldStorage.value, newValue, 'Should have the new value assigned');
    })

    QUnit.test('Updating array size should throw an error', assert => {
        const originalValue = [0, 0, 0];
        const newValue = [0, 0, 0, 0];

        assert.throws(() => {
            storages.oldStorage2 = originalValue;
            storages.oldStorage2 = newValue;
        }, 'Should throw an error if the array length has changed')
    })

    QUnit.test('Incrementing value directly with += should increase its value', assert => {
        const finalValue = 3;
        storages.numStorage = 0;
        storages.numStorage += finalValue;
        assert.equal(storages.numStorage.value, finalValue);
    })

    QUnit.test('Incrementing value directly with += should throw error if the types don\'t match', assert => {
        const arrayValue = [3];
        storages.numStorage2 = 0;
        assert.throws(() => {
            storages.numStorage2 += arrayValue;
        }, 'Should throw an error if the types don\'t match')
    })

    QUnit.test('Adding an array sets the type to corresponding vecXf form', assert => {
        storages.vec2Storage = [0, 1];
        assert.equal(storages.vec2Storage.type, 'vec2f', 'Type should be vec2f');

        storages.vec3Storage = [0, 1, 2];
        assert.equal(storages.vec3Storage.type, 'vec3f', 'Type should be vec3f');

        storages.vec4Storage = [0, 1, 2, 3];
        assert.equal(storages.vec4Storage.type, 'vec4f', 'Type should be vec4f');
    });

    QUnit.test('Adding an array greater than 4 items sets the type to corresponding array form', assert => {
        const type = 'array<f32, 5>';
        storages.arrayStorage = [0, 1, 2, 3, 4];
        assert.equal(storages.arrayStorage.type, type, `Type should be ${type}`);
    });

})

QUnit.module('Constant', hooks => {
    let constants;
    hooks.before(() => {
        constants = points.constants;
    })

    QUnit.test('Constant has same name as assigned', assert => {
        const TESTNAME = 'TESTNAME';
        points.setConstant(TESTNAME, 10, 'u32');
        assert.equal(constants[TESTNAME].name, TESTNAME, 'Name should be equal as assigned');
    })

    QUnit.test('Assigning value without type, sets the type automatically', assert => {
        const type = 'u32';
        constants.MYCONST = 10;
        assert.equal(constants.MYCONST.type, type, 'It should have a type assigned');
    })

    QUnit.test('Assigning float should set type to f32', assert => {
        constants.CONSTF32 = 10.1;
        assert.equal(constants.CONSTF32.type, 'f32', 'Type should be f32')
    })

    QUnit.test('Assigning integer should set type to u32', assert => {
        constants.CONSTU32 = 10;
        assert.equal(constants.CONSTU32.type, 'u32', 'Type should be u32')

    })

    QUnit.test('Assigning negative integer should set type to i32', assert => {
        constants.CONSTI32 = -10;
        assert.equal(constants.CONSTI32.type, 'i32', 'Type should be i32')
    })

    QUnit.test('Assigning array length < 5 should set type to vecX', assert => {
        constants.CONSTVEC2 = [0, 0];
        assert.equal(constants.CONSTVEC2.type, 'vec2f', 'Type should be vec2f')

        constants.CONSTVEC3 = [0, 0, 0];
        assert.equal(constants.CONSTVEC3.type, 'vec3f', 'Type should be vec3f')

        constants.CONSTVEC4 = [0, 0, 0, 0];
        assert.equal(constants.CONSTVEC4.type, 'vec4f', 'Type should be vec4f')
    })

    QUnit.test('Assigning array length < 5 should set value in form vecXf', assert => {
        const vec2 = [0, 0]
        constants.CONSTVEC2 = vec2;
        assert.equal(constants.CONSTVEC2.value, `vec2f(${vec2})`, 'Type should be vec2f')

        const vec3 = [0, 0, 0]
        constants.CONSTVEC3 = vec3;
        assert.equal(constants.CONSTVEC3.value, `vec3f(${vec3})`, 'Type should be vec3f')

        const vec4 = [0, 0, 0, 0]
        constants.CONSTVEC4 = vec4;
        assert.equal(constants.CONSTVEC4.value, `vec4f(${vec4})`, 'Type should be vec4f')
    })

    QUnit.test('Assigning array length < 2 should throw an error', assert => {
        const arr = [0];
        assert.throws(() => {
            constants.CONSTLOWER = arr;
        }, 'This should throw an error')
    })

})


