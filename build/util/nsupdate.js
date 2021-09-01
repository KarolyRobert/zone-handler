"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = nsupdate;

var _child_process = _interopRequireDefault(require("child_process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function nsupdate(commands) {
  return new Promise((resolve, reject) => {
    let output = '';

    const nsupdateProcess = _child_process.default.spawn('nsupdate', ['-v']);

    nsupdateProcess.stdout.on('data', data => {
      output += data.toString();
    });
    nsupdateProcess.stderr.on('data', err => {
      reject(err.toString());
    });
    nsupdateProcess.on('close', code => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(`nsupdate exit with ${code}`);
      }
    });
    nsupdateProcess.on('error', err => {
      reject(err.message);
    });
    process.nextTick(() => {
      nsupdateProcess.stdin.end(commands);
    });
  });
}