import Points, { Uniform } from 'points';

const points = new Points();

QUnit.module('Uniforms', hooks => {
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
        assert.equal(myUniform.type, 'f32', `type is f32`);
    })

    QUnit.test('myUniform is instance of Uniform', assert => {
        assert.true(myUniform instanceof Uniform, 'myUniform is of type Uniform');
    })

    QUnit.test('myUniform.value has the value set with setValue', assert => {
        myUniform.setValue(10);
        assert.equal(myUniform.value, 10, 'value is 10')
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

    QUnit.test('Uniform should throw error if value is array', assert => {

        assert.throws(() => {
            points.setUniform('e', [0, 0, 0, 0, 0], 'array<f32, 5>');
        }, 'Should throw an error when passed an array in function call');

        assert.throws(() => {
            points.setUniform('f')
                .setValue([0, 0, 0, 0, 0])
        }, 'Should throw an error when passed an array in setValue')

        assert.throws(() => {
            points.setUniform('g')
                .value = [0, 0, 0, 0, 0]
        }, 'Should throw an error when passed an array in value attribute')

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

});
