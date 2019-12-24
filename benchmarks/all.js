const MemoryMap = require('..');
const path = require('path');
const Benchmark = require('./Benchmark');

let filenames = ['string', '1K', '1M', '1G'];
let filePaths = filenames.map(filename => {
    return path.resolve(`./test/resources/${filename}`);
});

filePaths.forEach((filePath) => {
    let filename = path.basename(filePath);

    Benchmark(`new MemoryMap('${filePath}')`, () => {
        new MemoryMap(filePath);
    }, { speedsUp: true });

    Benchmark.Suite(`${filename} - instance methods`, () => {
        let memoryMap = new MemoryMap(filePath);

        Benchmark('getSize()', () => {
            memoryMap.getSize();
        });

        let size = memoryMap.getSize();
        let randomPos = (minSpace = 0) => Math.random() * (size - minSpace);
        let setRandomPos = (minSpace = 0) => {
            memoryMap.setPos(randomPos(minSpace));
        };

        Benchmark('setPos()', (nextPos) => {
            memoryMap.setPos(nextPos);
        }, { seed: randomPos });

        Benchmark('getPos()', () => {
            memoryMap.getPos();
        }, { seed: setRandomPos });

        Benchmark('read(1)', () => {
            memoryMap.read(1);
        }, { seed: () => setRandomPos(1) });

        Benchmark('read(2)', () => {
            memoryMap.read(2);
        }, { seed: () => setRandomPos(2) });

        Benchmark('read(4)', () => {
            memoryMap.read(4);
        }, { seed: () => setRandomPos(4) });

        Benchmark('read(8)', () => {
            memoryMap.read(8);
        }, { seed: () => setRandomPos(8) });
    });
});

