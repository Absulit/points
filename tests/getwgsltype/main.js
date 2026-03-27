import Points from 'points';

import { getWGSLType } from './../../src/data-size.js';

const points = new Points();

QUnit.module('getWGSLType', hooks => {
    QUnit.test('If value is a integer it returns u32', assert => {
        const type = getWGSLType(10);
        assert.equal(type, 'u32', 'Type should be u32');
    })

    QUnit.test('If value is a float it returns f32', assert => {
        const type = getWGSLType(10.1);
        assert.equal(type, 'f32', 'Type should be f32');
    })

    QUnit.test('If value is a negative it returns i32', assert => {
        const type = getWGSLType(-10);
        assert.equal(type, 'i32', 'Type should be i32');
    })

    QUnit.test('If value is a string it returns empty string', assert => {
        const type = getWGSLType('10');
        assert.equal(type, '', 'Type should be empy string');
    })

    QUnit.test('If value is an object it returns empty string', assert => {
        const type = getWGSLType({});
        assert.equal(type, '', 'Type should be empy string');
    })

    QUnit.test('If value is null it returns empty string', assert => {
        const type = getWGSLType(null);
        assert.equal(type, '', 'Type should be empy string');
    })

    QUnit.test('If value is  0 it returns u32', assert => {
        const type = getWGSLType(0);
        assert.equal(type, 'u32', 'Type should be u32');
    })

})
