"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dns_zone;

var _nsupdate = _interopRequireDefault(require("./util/nsupdate"));

var _utils = require("./util/utils");

var _dns_record = _interopRequireDefault(require("./dns_record"));

var _translatableError = require("../lib/translatableError");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function dns_zone(request) {
  let list = [];
  let hashtable = {};

  const transferRecord = record => {
    let new_record = (0, _dns_record.default)(record, request.zone);

    if (hashtable[new_record.hash] === undefined) {
      hashtable[new_record.hash] = list.length;
      list.push(new_record);
    }
  };

  const nsupdateCommands = command => {
    if (request.updateKey) {
      return `zone ${request.zone}\n` + `key ${request.updateKey.algorithm}:${request.updateKey.name} ${request.updateKey.secret}\n` + `${command}send\n`;
    } else {
      throw new _translatableError.TranslatableError('Missing updateKey!');
    }
  };

  const getRecords = () => {
    return list.map(record => {
      return {
        hash: record.hash,
        record: record.record
      };
    });
  };

  const command = (type, hash, record) => {
    let index;

    switch (type) {
      case 'add':
        let new_record = (0, _dns_record.default)(record, request.zone);

        if (hashtable[new_record.hash] === undefined) {
          return nsupdateCommands(new_record.add_command());
        } else {
          throw new _translatableError.TranslatableError(`Such record already is in the ${request.zone} zone!`, [request.zone]);
        }

      case 'update':
        index = hashtable[hash];

        if (index > -1) {
          let old_record = list[index];
          let new_record = (0, _dns_record.default)(record, request.zone);

          if (!hashtable[new_record.hash]) {
            return nsupdateCommands(old_record.update_command(new_record));
          } else {
            throw new _translatableError.TranslatableError(`Such record already is in the ${request.zone} zone!`, [request.zone]);
          }
        } else {
          throw new _translatableError.TranslatableError(`Not such record in ${request.zone} zone!`, [request.zone]);
        }

      case 'delete':
        index = hashtable[hash];

        if (index > -1) {
          let deleted_record = list[index];
          return nsupdateCommands(deleted_record.delete_command());
        } else {
          throw new _translatableError.TranslatableError(`Not such record in ${request.zone} zone!`, [request.zone]);
        }

    }
  };

  const add_record = record => {
    try {
      let nsupdateCommand = command('add', null, record);
      return (0, _nsupdate.default)(nsupdateCommand);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const update_record = (hash, record) => {
    try {
      let nsupdateCommand = command('update', hash, record);
      return (0, _nsupdate.default)(nsupdateCommand);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const delete_record = hash => {
    try {
      let nsupdateCommand = command('delete', hash);
      return (0, _nsupdate.default)(nsupdateCommand);
    } catch (err) {
      return Promise.reject(err);
    }
  };

  return new Promise((resolve, reject) => {
    (0, _utils.transferZone)(request, transferRecord).then(() => {
      resolve({
        getRecords,
        add: add_record,
        update: update_record,
        delete: delete_record
      });
    }, err => reject(err));
  });
}