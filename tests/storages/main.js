import Points, { Storage } from 'points';
import Storages from './../../src/Storages.js';

const points = new Points();

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

    // QUnit.test('Storage is default f32', assert => {
    //     assert.equal(myStorage.type, 'f32', `type should be f32`);
    // })

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

QUnit.module('Storages', hooks => {
    /** @type{Uniforms} */
    let storages;
    hooks.before(() => {
        storages = new Storages();
    })

    QUnit.test('Storages creates a Storage class entry by calling a property', assert => {
        assert.equal(storages.a.constructor.name, 'Storage', 'Attribute should be an Storage class')
    })

    // QUnit.test('Storage created type should be f32', assert => {
    //     assert.equal(storages.a.type, 'f32', 'Type should be f32')
    // })

    QUnit.test('Assigning value without type, sets the type automatically', assert => {
        const type = 'u32';
        storages.MYSTORAGE = 10;
        assert.equal(storages.MYCONST.type, type, 'It should have a type assigned');
    })

    QUnit.test('Assigning float should set type to f32', assert => {
        storages.STOF32 = 10.1;
        assert.equal(storages.STOF32.type, 'f32', 'Type should be f32')
    })

    QUnit.test('Assigning integer should set type to u32', assert => {
        storages.STOU32 = 10;
        assert.equal(storages.STOU32.type, 'u32', 'Type should be u32')
    })

    QUnit.test('Assigning negative integer should set type to i32', assert => {
        storages.STOI32 = -10;
        assert.equal(storages.STOI32.type, 'i32', 'Type should be i32')
    })

    QUnit.test('Assigning array length < 5 should set type to vecX', assert => {
        storages.STOVEC2 = [0, 0];
        assert.equal(storages.STOVEC2.type, 'vec2f', 'Type should be vec2f')

        storages.STOVEC3 = [0, 0, 0];
        assert.equal(storages.STOVEC3.type, 'vec3f', 'Type should be vec3f')

        storages.STOVEC4 = [0, 0, 0, 0];
        assert.equal(storages.STOVEC4.type, 'vec4f', 'Type should be vec4f')
    })

    QUnit.test('Assigning array length < 5 should set value in form vecXf', assert => {
        const vec2 = [0, 0]
        storages.STOVEC22 = vec2;
        assert.equal(storages.STOVEC22.value, `vec2f(${vec2})`, 'Type should be vec2f')

        const vec3 = [0, 0, 0]
        storages.STOVEC33 = vec3;
        assert.equal(storages.STOVEC33.value, `vec3f(${vec3})`, 'Type should be vec3f')

        const vec4 = [0, 0, 0, 0]
        storages.STOVEC44 = vec4;
        assert.equal(storages.STOVEC44.value, `vec4f(${vec4})`, 'Type should be vec4f')
    })

    QUnit.test('Assigning array length < 2 should throw an error', assert => {
        const arr = [0];
        assert.throws(() => {
            storages.STOLOWER = arr;
        }, 'This should throw an error')
    })

    QUnit.test('Assigning array length > 4 should set type to array', assert => {
        const arr = [0, 0, 0, 0, 5]
        storages.STOARR = arr;
        assert.equal(storages.STOARR.type, `array<f32, ${arr.length}>`, 'Type should be array')
    })

    QUnit.test('Changing type after value assignment should work', assert => {
        storages.STOTYPECHANGE = 10;
        assert.equal(storages.STOTYPECHANGE.type, 'u32', 'it first should have u32')
        storages.STOTYPECHANGE.setType('f32');
        assert.equal(storages.STOTYPECHANGE.type, 'f32', 'then it should have f32')
    })

    QUnit.test('Storage default value should be undefined or null', assert => {
        assert.true(!storages.a.value, 'Value should be undefined or null')
    })

    QUnit.test('Assigning a value directly to attribute should create Storage and set its value', assert => {
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

    QUnit.test('storages.list is of type Array', assert => {
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

    QUnit.test('Type should be kept the same if set first before a setValue', assert => {
        const type = 'f32';
        storages.STOTYPEKEEP.setType(type).setValue(10);
        assert.equal(storages.STOTYPEKEEP.type, type, `Type should be ${type}`);
    })

    QUnit.test('Storages.add should verify if storage exists with that name already', assert => {
        storages.existingStorage = 10;
        const newStorage = new Storage({
            name: 'existingStorage'
        })

        assert.throws(() => {
            storages.add(newStorage);
        }, 'Should fail if new storage uses existing name')
    })

})
