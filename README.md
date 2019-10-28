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

let filePath = path.resolve('./package.json'); // loads package.json in the current directory
let memoryMap = new MemoryMap(filePath);
console.log(memoryMap.getSize()); // logs the file's size in bytes

// logs the first four characters of the file
let str = memoryMap.read(4).toString('ascii');
console.log(str);

// jumps to byte position 20 in the file
memoryMap.setPos(20); 

// logs the characters from position 20 to position 30 in the file
str = memoryMap.read(10).toString('ascii'); 
console.log(str);
```
