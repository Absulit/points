# Installation

Here is a list of several ways you can use POINTS, with a CDN which is plain html and js and the one I recommend the most, or you can use npm and also bun. There's also the [quick setup](../README.md#quick-setup) that is composed of all you need in a single html file, also available to [download in here](../examples_tutorial/index.html).

The [examples_tutorial](examples_tutorial) folder has a directory per type of installation (cdn, npm, bun):

### cdn (importmap) [code: examples_tutorial/cdn/](examples_tutorial/cdn/)

---

> **Note:**  "points" is the required and main library.
 The others are helper libraries for shaders but not required.

---
```html
<script type="importmap">
    {
        "imports": {
            "points": "https://cdn.jsdelivr.net/npm/@absulit/points/build/points.min.js",

            "points/animation": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/animation.min.js",
            "points/audio": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/audio.min.js",
            "points/color": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/color.min.js",
            "points/debug": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/debug.min.js",
            "points/effects": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/effects.min.js",
            "points/image": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/image.min.js",
            "points/math": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/math.min.js",
            "points/noise2d": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/noise2d.min.js",
            "points/classicnoise2d": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/classicnoise2d.min.js",
            "points/classicnoise3d": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/classicnoise3d.min.js",
            "points/random": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/random.min.js",
            "points/sdf": "https://cdn.jsdelivr.net/npm/@absulit/points/build/core/sdf.min.js"
        }
    }
</script>

```

### npm [code: examples_tutorial/npm/](examples_tutorial/npm/)

---

> **Note:** if you copy the example directory you can just run `npm install` and `npm start`

---

1. create `index.html` and `main.js`

    Add main as module in `index.html`

```html
<script type="module" src="main.js"></script>
```

2. Install `points`
```sh
npm init

# select only one of the following two
npm i @absulit/points # npm package
npx jsr add @absulit/points # or jsr package

```

3. Add in `package.json` (so parcel can recognize the paths)

```json
{
    "alias": {
        "points": "@absulit/points/build/points.min.js",
        "points/animation": "@absulit/points/build/core/animation.min.js",
        "points/audio": "@absulit/points/build/core/audio.min.js",
        "points/color": "@absulit/points/build/core/color.min.js",
        "points/debug": "@absulit/points/build/core/debug.min.js",
        "points/effects": "@absulit/points/build/core/effects.min.js",
        "points/image": "@absulit/points/build/core/image.min.js",
        "points/math": "@absulit/points/build/core/math.min.js",
        "points/noise2d": "@absulit/points/build/core/noise2d.min.js",
        "points/classicnoise2d": "@absulit/points/build/core/classicnoise2d.min.js",
        "points/classicnoise3d": "@absulit/points/build/core/classicnoise3d.min.js",
        "points/random": "@absulit/points/build/core/random.min.js",
        "points/sdf": "@absulit/points/build/core/sdf.min.js"
    }
}
```

4. Add/Create `jsconfig.json` (for intellisense)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
        "points": ["node_modules/@absulit/points/build/points.js"],
        "points/animation": ["node_modules/@absulit/points/build/core/animation"],
        "points/audio": ["node_modules/@absulit/points/build/core/audio"],
        "points/color": ["node_modules/@absulit/points/build/core/color"],
        "points/debug": ["node_modules/@absulit/points/build/core/debug"],
        "points/effects": ["node_modules/@absulit/points/build/core/effects"],
        "points/image": ["node_modules/@absulit/points/build/core/image"],
        "points/math": ["node_modules/@absulit/points/build/core/math"],
        "points/noise2d": ["node_modules/@absulit/points/build/core/noise2d"],
        "points/classicnoise2d": ["node_modules/@absulit/points/build/core/classicnoise2d"],
        "points/classicnoise3d": ["node_modules/@absulit/points/build/core/classicnoise3d"],
        "points/random": ["node_modules/@absulit/points/build/core/random"],
        "points/sdf": ["node_modules/@absulit/points/build/core/sdf"]
    }
  }
}
```

5. `Reload Window` in vscode to reload `jsconfig.json`
    - Press `Ctrl + Shift + P` > Developer: Reload Window

6. Install parcel (or any live server that is able to recognize importmaps or path aliases)

```sh
npm install --save-dev parcel
```

7. Run live server
```sh
npx parcel index.html
```

---

> **Note:** if an error shows up after running `parcel`, delete this line ` "main": "main.js",` from package.json

---



### bun [code: examples_tutorial/bun/](examples_tutorial/bun/)

---

> **Note:** if you copy the example directory you can just run `bun install` and `bun start`

---

1. create `index.html` and `main.js`

    Add main as module in `index.html`

```html
<script type="module" src="main.js"></script>
```


2. Install `points`

```sh
bun init #select blank

# select only one of the following two
bun i @absulit/points # npm package or
bun x jsr add @absulit/points # jsr package
```



3. Add to `tsconfig.json` (for intellisense)
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
        "points": ["node_modules/@absulit/points/build/points.js"],
        "points/animation": ["node_modules/@absulit/points/build/core/animation"],
        "points/audio": ["node_modules/@absulit/points/build/core/audio"],
        "points/color": ["node_modules/@absulit/points/build/core/color"],
        "points/debug": ["node_modules/@absulit/points/build/core/debug"],
        "points/effects": ["node_modules/@absulit/points/build/core/effects"],
        "points/image": ["node_modules/@absulit/points/build/core/image"],
        "points/math": ["node_modules/@absulit/points/build/core/math"],
        "points/noise2d": ["node_modules/@absulit/points/build/core/noise2d"],
        "points/classicnoise2d": ["node_modules/@absulit/points/build/core/classicnoise2d"],
        "points/classicnoise3d": ["node_modules/@absulit/points/build/core/classicnoise3d"],
        "points/random": ["node_modules/@absulit/points/build/core/random"],
        "points/sdf": ["node_modules/@absulit/points/build/core/sdf"]
    }
  }
}
```

4. Run server
```sh
bun index.html
```

