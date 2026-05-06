import Points, { Constant } from 'points';

const points = new Points();

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
        constants.CONSTVEC22 = vec2;
        assert.equal(constants.CONSTVEC2.value, `vec2f(${vec2})`, 'Type should be vec2f')

        const vec3 = [0, 0, 0]
        constants.CONSTVEC33 = vec3;
        assert.equal(constants.CONSTVEC3.value, `vec3f(${vec3})`, 'Type should be vec3f')

        const vec4 = [0, 0, 0, 0]
        constants.CONSTVEC44 = vec4;
        assert.equal(constants.CONSTVEC4.value, `vec4f(${vec4})`, 'Type should be vec4f')
    })

    QUnit.test('Assigning array length < 2 should throw an error', assert => {
        const arr = [0];
        assert.throws(() => {
            constants.CONSTLOWER = arr;
        }, 'This should throw an error')
    })

    QUnit.test('Assigning array length > 4 should set type to array', assert => {
        const arr = [0, 0, 0, 0, 5]
        constants.CONSTARR = arr;
        assert.equal(constants.CONSTARR.type, `array<f32, ${arr.length}>`, 'Type should be array')
    })

    QUnit.test('Changing type after value assignment should work', assert => {
        constants.CONSTTYPECHANGE = 10;
        assert.equal(constants.CONSTTYPECHANGE.type, 'u32', 'it first should have u32')
        constants.CONSTTYPECHANGE.setType('f32');
        assert.equal(constants.CONSTTYPECHANGE.type, 'f32', 'then it should have f32')
    })

    QUnit.test('Assigning value after it has been set should throw an error', assert => {
        assert.throws(() => {
            constants.CONSTTRYAGAIN = 10.31;
            constants.CONSTTRYAGAIN.setValue(12);
        }, 'This should not allow to assign again')

        assert.throws(() => {
            constants.CONSTTRYAGAIN2.setValue(10.31).setValue(12);;
        }, 'This should not allow to assign again')
    })

    QUnit.test('Set functions return constant object', assert => {
        constants.TESTRETURN = 10;
        const c = constants.TESTRETURN.setType('f32');
        assert.equal(c.constructor.name, 'Constant');
    })
})

QUnit.module('Constants', hooks => {
    let constants;
    hooks.before(() => {
        constants = points.constants;
    })
    QUnit.test('Set value after creation', assert => {
        const val = 10;
        constants.CONSTSETAFTER.setValue(val);
        assert.equal(constants.CONSTSETAFTER.value, val, 'Values should be the same');
    })

    QUnit.test('Constants.add should verify if constant exists with that name already', assert => {
        constants.EXISTINGCONST = 10;
        const newConstant = new Constant({
            name: 'EXISTINGCONST'
        })

        assert.throws(() => {
            constants.add(newConstant);
        }, 'Should fail if new storage uses existing name')
    })


})
