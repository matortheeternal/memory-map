interface MemoryMap {
    constructor: 'object';
}

declare class MemoryMap {
    /**
     * Synchronousmy maps a file to memory.
     * @param filePath A path to a file.
     */
    constructor(filePath: string);

    /**
     * Sets the memory map's offset position.
     * @param pos The position to set.
     */
    setPos(pos: number);

    /**
     * Gets the memory map's offset position.
     */
    getPos(): number;

    /**
     * Gets the memory mapped file's size.
     */
    getSize(): number;

    /**
     * Reads bytes from the memory map's current offset position
     * and incrments the position by the number of bytes read.
     * @param numBytes
     */
    read(numBytes: number): Buffer;

    /**
     * Reads bytes from the memory map's current offset position
     * until a specific byte sequence is found.  Sets the memory
     * map's position after the found byte sequence.
     * @param bytes
     */
    readUntil(bytes: Buffer): Buffer;
}

export = MemoryMap;
