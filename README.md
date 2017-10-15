# generate-image-file

You can generate image file of any size and byte.

You can specify vertical and horizontal size or number of bytes, or both.

```bash
$ node app --size 100,100 --byte 2kb
```

That way, a PNG file of that size will be created in `./images`.

## Installation

### 1

Node.js is required.

### 2

This programming uses `node-canvas` internally.  
So it is essential to install the libraries that `node-canvas` needs.

If you are a Mac user, you may be able to install it easily with `Homebrew`.

For details please read the official document.

[https://github.com/Automattic/node-canvas](https://github.com/Automattic/node-canvas)

### 3

```bash
$ npm i
```

This is now completely ready.

## Specify vertical and horizontal size

**--size -s**

Specify by `width,height` or `width*height`.

```bash
$ node app --size 100,60
```

## Specify number of bytes

**--byte -b**

```bash
$ node app --byte 200
```

That way, An PNG file of 200 bytes is created.

### example

```
--byte 200 -> 200bytes
--byte 190b -> 190bytes
--byte 2kb -> 2048bytes(= 2 * 1024 = 2kb)
--byte 1.5mb  -> 1572864bytes(= 1.5 * 1024 * 1024 = 1.5mb)
```

## Size and bytes

You can specify both.

```bash
$ node app -s 500,280 -b 900
```

A PNG file that satisfies both conditions is created.

## Fill

**--fill -f**

Usually, a transparent image is created.  
However, if this option is specified, an image filled with a specific color will be created.

```bash
$ node app -s 100,50 -b 900 -f
```

## Hint

If you run `$ node app --help`, you can see a list of available options.
