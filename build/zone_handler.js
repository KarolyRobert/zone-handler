"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = zone_handler;

var _dns_zone = _interopRequireDefault(require("./dns_zone"));

var _utils = require("./util/utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function zone_handler(req) {
  let request = Object.assign({
    zone: false,
    server: false,
    updateKey: false,
    transferKey: false
  }, req);
  return new Promise((resolve, reject) => {
    if (request.zone) {
      (0, _utils.getAuthoritative)(request.zone).then(authoritative => {
        if (request.transferKey) {
          request = Object.assign(request, authoritative);
          (0, _dns_zone.default)(request).then(zone => {
            resolve(zone);
          }, err => reject(err));
        } else {
          resolve(authoritative);
        }
      }, err => reject(err));
    } else {
      reject('zone_handler expect an object parameter with zone,updateKey,transferKey fields!');
    }
  });
}