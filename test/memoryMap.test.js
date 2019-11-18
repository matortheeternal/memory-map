const MemoryMap = require('..');
const path = require('path');

const outOfBoundsError = 'Read out of bounds.';

describe('MemoryMap', () => {
    let filePath = path.resolve('./test/resources/file'),
        utf8Path = path.resolve('./test/resources/ファイル'),
        strfPath = path.resolve('./test/resources/string');

    describe('constructor', () => {
        it('should be defined', () => {
            expect(MemoryMap).toBeDefined();
        });

        it('should create a new instance of a memory map', () => {
            let memoryMap = new MemoryMap(filePath);
            expect(memoryMap).toBeDefined();
            expect(memoryMap).toBeInstanceOf(MemoryMap);
        });

        it('should work with utf8 characters in path', () => {
            let memoryMap = new MemoryMap(utf8Path);
            expect(memoryMap).toBeDefined();
            expect(memoryMap).toBeInstanceOf(MemoryMap);
        });
    });

    describe('instance methods', () => {
        let memoryMap, strfMap;

        beforeAll(() => {
            memoryMap = new MemoryMap(filePath);
            strfMap = new MemoryMap(strfPath);
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
                expect(() => memoryMap.read(99999)).toThrow(outOfBoundsError);
            });
        });

        describe('readUntil', () => {
            it('should be defined', () => {
                expect(strfMap.readUntil).toBeDefined();
            });

            it('should return a buffer', () => {
                strfMap.setPos(0);
                let buf = strfMap.readUntil(new Buffer([0x00]));
                expect(buf).toBeDefined();
                expect(buf).toBeInstanceOf(Buffer);
                expect(buf.length).toBe(0x0C);
                expect(buf.toString('ascii')).toBe('abcdefghijkl');
            });

            it('should advance the position past the target bytes', () => {
                strfMap.setPos(0);
                strfMap.readUntil(new Buffer([0x00, 0x00]));
                expect(strfMap.getPos()).toBe(0x0E);
            });

            it('should throw an error if read is out of bounds', () => {
                strfMap.setPos(0);
                expect(() => {
                    strfMap.readUntil(new Buffer([0x00, 0x00, 0x00, 0x00]));
                }).toThrow(outOfBoundsError);
            });
        });
    });
});
