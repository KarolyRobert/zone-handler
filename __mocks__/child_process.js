'use strict';

const { EventEmitter, Readable, Writable } = require('stream');
const child_process = jest.createMockFromModule('child_process');

class WriteMemory extends Writable {
    constructor() {
      super();
      this.buffer = "";
    }
  
    _write(chunk, _, next) {
      this.buffer += chunk;
      next();
    }
  
    reset() {
      this.buffer = "";
    }
  }

child_process._current;

child_process.spawn = jest.fn(() => {
    const cprocess = new EventEmitter();
    cprocess.stdin = new WriteMemory();
    cprocess.stdout = new Readable();
    cprocess.stderr = new Readable();



    cprocess.stdout._read = cprocess.stderr._read = (size) => {};
   
    child_process._current = cprocess;
    return cprocess;
});

module.exports = child_process;