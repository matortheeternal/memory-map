# memory-map [![Build Status](https://travis-ci.org/matortheeternal/memory-map.svg?branch=master)](https://travis-ci.org/matortheeternal/memory-map)
Native addon which uses the windows api to memory map files.  Use with large files for memory and performance benefits.

## installation

```
npm i matortheeternal/memory-map --save
```

## usage

```js
const MemoryMap = require('memory-map');
const path = require('path');

// loads package.json in the current directory
let filePath = path.resolve('./package.json');
let memoryMap = new MemoryMap(filePath);

// gets the file's size in bytes
let fileSize = memoryMap.getSize();
console.log(fileSize);

// reads the first four bytes of the file
let buf = memoryMap.read(4);
console.log(buf.toString('ascii'));

// reads the bytes from position 4 to position 14 in the file
buf = memoryMap.read(10); 
console.log(buf.toString('ascii'));

// jumps to byte position 20 in the file
memoryMap.setPos(20); 

// reads the bytes from position 20 to position 30 in the file
buf = memoryMap.read(10); 
console.log(buf.toString('ascii')); 
```
