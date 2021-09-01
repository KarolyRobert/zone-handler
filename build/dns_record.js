"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = dns_record;

var _crypto = _interopRequireDefault(require("crypto"));

var _translatableError = require("../lib/translatableError");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const rawToObject = raw => {
  let parts = raw.split(/\s{1,}/);
  let result = {};
  result.name = parts[0];
  result.ttl = parseInt(parts[1]);
  result.type = parts[3];
  let data = parts.filter((e, i) => i > 3);
  result.data = data.join(' ');

  if (result.type === 'TXT') {
    result.data = result.data.replace(/" "/g, '');
    result.data = result.data.replace(/"/g, '');
  }

  return result;
};

function dns_record(raw, zone) {
  let record;

  if (typeof raw === 'string' || raw instanceof String) {
    record = rawToObject(raw);
  } else {
    record = raw;
  }

  const toTXT = () => {
    const parts = record.data.match(/.{1,254}/g);
    return `"${parts.join('" "')}"`;
  };

  const data = () => {
    switch (record.type) {
      case 'TXT':
        return toTXT();

      default:
        return record.data;
    }
  };

  const name = () => {
    if (record.name.endsWith('.')) {
      if (record.name.endsWith(`${zone}.`) && /^(?:[a-z|0-9|_]{1,}-?[a-z|0-9|_]{1,}\.?){1,}\.$/.test(record.name)) {
        return record.name;
      }

      throw new _translatableError.TranslatableError(`The name "${record.name}" is invalid or outside of zone!`, [record.name]);
    } // record.name is valid domain


    if (/^(?:[a-z|0-9|_]{1,}-?[a-z|0-9|_]{1,}\.?){1,}[a-z|0-9|_]$/.test(record.name)) {
      return `${record.name}.${zone}.`;
    }

    throw new _translatableError.TranslatableError(`The name "${record.name}" is invalid!`, [record.name]);
  };

  const hash = _crypto.default.createHash('md5').update(`${name()}${record.ttl}${record.type}${record.data}${zone}`).digest('hex');

  const add_command = () => {
    return `update add ${name()} ${record.ttl} ${record.type} ${data()}\n`;
  };

  const delete_command = () => {
    return `update delete ${name()} ${record.ttl} ${record.type} ${data()}\n`;
  };

  const update_command = update_record => {
    if (record.type === 'SOA') {
      //return ddns_record(raw,zone).add();
      return update_record.add_command();
    } //return [delete_command(),ddns_record(raw,zone).add()];


    return [delete_command(), update_record.add_command()].join('');
  };

  return {
    hash,
    record,
    add_command,
    update_command,
    delete_command
  };
}