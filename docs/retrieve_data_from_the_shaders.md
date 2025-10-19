# Retrieve data from the shaders

## Read Storage - readStorage

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

## Events - addEventListener

An event is an asynchronous message that can be send from the WGSL shaders to the JavaScript code. It works in a very similar way as to listen for a click in JavaScript or a screen resize, you call a `addEventListener`, but the parameters and its use change a bit. In the code below, the first parameter is the name of the event you , the event is fired by **you**, so this name currently has no predefined names like 'click', or 'mouse over', you have to define them and dispatch them.

The second parameter is the data (if any) that you will send from the WGSL shaders, this data is returnes as an array, so you have to acces each item by its index.

The last parameter is the amount of items in this array you are expecting. All items are `f32`.

```js
// as in examples\events1\index.js
points.addEventListener(
    'right_blink', // name of the event (and name of a storage)
    data => { // data returned after the event and callback
        console.log('---- Right Circle');
    },
    4 // size of the data to return
);
```

To fire an event you first need to declare the listener. The name used in the listener is also used as storage buffer that you can manipulate to dispatch the event.

The event has the following structure:

```rust
// as in src\core\defaultStructs.js
struct Event {
    updated: u32,
    data: array<f32>
}
```

To actully fire an event you have to do as follows:

```rust
right_blink.data[0] = 2; // some data
right_blink.data[1] = 2; // some data
right_blink.updated = 1; // update this property to something diff than `0`
```

By just simply changing the value of `updated` to a non zero, the library knows this event has been updated, and will dispatch the event immediately in JavaScript, so the `console.log` will print the text in the JavaScript Console. `updated` will be set as zero in the next frame, and if not updated the library then knows it doesn't have to do anything.

