"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dig;

var _child_process = _interopRequireDefault(require("child_process"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dig(params) {
  return new Promise((resolve, reject) => {
    const dig = _child_process.default.spawn('dig', params);

    let result = '';
    dig.stdout.on('data', data => {
      result += data.toString();
    });
    dig.stderr.on('data', err => {
      reject(err.toString());
    });
    dig.on('close', code => {
      if (code === 0) {
        resolve(result);
      } else {
        reject(`dig exit with ${code}`);
      }
    });
    dig.on('error', err => {
      reject(err.message);
    });
  });
}