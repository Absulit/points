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
        console.log(myUniform.value);
    })

    QUnit.test('myUniform.value has the value set with setValue', assert => {
        myUniform.setValue(10);
        assert.equal(myUniform.value, 10, 'value is 10')
    })

    //----

    QUnit.test('Uniform should throw error if not number or array', assert => {

        assert.throws(() => {
            points.setUniform('u', {})
        }, 'Should throw an error when passed an object');

        assert.throws(() => {
            points.setUniform('u', '')
        }, 'Should throw an error when passed an string');
    })

});
