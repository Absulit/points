# Retrieve data from the shaders

You can send and retrieve data from the shaders the following way:

First declare a storage as in `examples/data1/index.js`

```js
// the last parameter as `true` means you will use this `Storage` to read back
points.setStorage('resultMatrix', 'Matrix', true);
```

Read the data back after modification

```js
let result = await points.readStorage('resultMatrix');
console.log(result);
```
