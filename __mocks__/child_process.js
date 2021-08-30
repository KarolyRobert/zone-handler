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
/*
let mockData = [];
let mockError = '';
let mockErrorType = '';
child_process._setData = (data) => {
    mockData = data;
}

child_process._setError = (err) => {
    mockError = err;
}
child_process._setErrorType = (err) => {
  mockErrorType = err;
}

child_process._inData = '';

*/

child_process._current;

child_process.spawn = jest.fn(() => {
    const cprocess = new EventEmitter();
    cprocess.stdin = new WriteMemory();
    cprocess.stdout = new Readable();
    cprocess.stderr = new Readable();



    cprocess.stdout._read = cprocess.stderr._read = (size) => {};
    /*
    
    process.nextTick(() => {
        if(mockError === command){
            if(mockErrorType === ''){
              cprocess.emit('error',`spawn ${command} ENOENT`);
            }else{
              cprocess.stderr.push(`${command} runtime error!`);
            }
        }else{
            if(command === 'dig'){
                let data = mockData[0];
                cprocess.stdout.push(data);
              
                process.nextTick(() => {
                  cprocess.emit('close',0);
                });
            }
        }
    });
   
    cprocess.stdin.on('close', () => {
        child_process._inData = cprocess.stdin.buffer;
        cprocess.emit('close',0);
    });*/
    child_process._current = cprocess;
    return cprocess;
});

module.exports = child_process;