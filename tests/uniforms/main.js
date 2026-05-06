import Points, { Uniform} from 'points';
import Uniforms from './../../src/Uniforms.js';


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

    QUnit.test('Uniforms.add should verify if uniform exists with that name already', assert => {
        uniforms.existingUniform = 10;
        const newUniform = new Uniform({
            name: 'existingUniform'
        })

        assert.throws(() => {
            uniforms.add(newUniform);
        }, 'Should fail if new uniform uses existing name')
    })

})
