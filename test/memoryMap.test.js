const MemoryMap = require('..');
const path = require('path');

describe('MemoryMap', () => {
    let memoryMap;

    describe('constructor', () => {
        it('should be defined', () => {
            expect(MemoryMap).toBeDefined();
        });

        it('should create a new instance of a memory map', () => {
            let filePath = path.resolve('./test/resources/file');
            memoryMap = new MemoryMap(filePath);
            expect(memoryMap).toBeDefined();
            expect(memoryMap).toBeInstanceOf(MemoryMap);
        });

        it('should work with utf8 characters in path', () => {
            let filePath = path.resolve('./test/resources/ファイル');
            memoryMap = new MemoryMap(filePath);
            expect(memoryMap).toBeDefined();
            expect(memoryMap).toBeInstanceOf(MemoryMap);
        });
    });

    describe('getSize', () => {
        it('should be defined', () => {
            expect(memoryMap.getSize).toBeDefined();
        });

        it('should return the file\'s size', () => {
            expect(memoryMap.getSize()).toBeGreaterThan(3);
        });
    });

    describe('getPos', () => {
        it('should be defined', () => {
            expect(memoryMap.getPos).toBeDefined();
        });

        it('should return the current position', () => {
            expect(memoryMap.getPos()).toBe(0);
        });
    });

    describe('setPos', () => {
        it('should be defined', () => {
            expect(memoryMap.setPos).toBeDefined();
        });

        it('should set the position', () => {
            memoryMap.setPos(1);
            expect(memoryMap.getPos()).toBe(1);
        });

        it('should throw an error if position is out of bounds', () => {
            let outOfBoundsError = /^Position out of bounds\.$/;
            expect(() => memoryMap.setPos(99999)).toThrow(outOfBoundsError);
            expect(() => memoryMap.setPos(-1)).toThrow(outOfBoundsError);
        });
    });

    describe('read', () => {
        it('should be defined', () => {
            expect(memoryMap.read).toBeDefined();
        });

        it('should return a buffer', () => {
            memoryMap.setPos(0);
            let buf = memoryMap.read(4);
            expect(buf).toBeDefined();
            expect(buf).toBeInstanceOf(Buffer);
            expect(buf.length).toBe(4);
            expect(buf.toString('ascii')).toBe('abcd');
        });

        it('should advance the position', () => {
            memoryMap.setPos(0);
            memoryMap.read(4);
            expect(memoryMap.getPos()).toBe(4);
        });

        it('should throw an error if read is out of bounds', () => {
            let outOfBoundsError = /^Read out of bounds\.$/;
            expect(() => memoryMap.read(99999)).toThrow(outOfBoundsError);
        });
    });
});
