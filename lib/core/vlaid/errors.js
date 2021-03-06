'use strict';

module.exports = {
  required: '{name} can not be blank',
  contains: '{name} need contains string {args}',
  equals: '{name} need equal {pargs}',
  different: '{name} need not equal {pargs}',
  after: '{name} need a date after {pargs}',
  before: '{name} need a date before {pargs}',
  alpha: '{name} need contains only letters (a-zA-Z)',
  alphaDash: '{name} need contains only letters and dashes(a-zA-Z_)',
  alphaNumeric: '{name} need contains only letters and numeric(a-zA-Z0-9)',
  alphaNumericDash: '{name} need contains only letters, numeric and dash(a-zA-Z0-9_)',
  ascii: '{name} need contains ASCII chars only',
  base64: '{name} need a valid base64 encoded',
  byteLength: '{name} need length (in bytes) under your options',
  creditCard: '{name} need a valid credit card',
  currency: '{name} need a valid currency amount',
  date: '{name} need a date',
  decimal: '{name} need a decimal number',
  divisibleBy: '{name} need a number divisible by {args}',
  email: '{name} need an email under your options',
  fqdn: '{name} need a fully qualified domain name under your options',
  float: '{name} need a float under your options',
  fullWidth: '{name} need contains any full-width chars',
  halfWidth: '{name} need contains any half-width chars',
  hexColor: '{name} need a hexadecimal color',
  hex: '{name} need a hexadecimal number',
  ip: '{name} need an IP (version 4 or 6)',
  ip4: '{name} need an IP (version 4)',
  ip6: '{name} need an IP (version 6)',
  isbn: '{name} need an ISBN (version 10 or 13)',
  isin: '{name} need an ISIN (stock/security identifier)',
  iso8601: '{name} need a valid ISO 8601 date',
  in: '{name} need in an array of {args}',
  notIn: '{name} need not in an array of {args}',
  int: '{name} need an integer under your options',
  length: '{name} should be length under your options',
  lowercase: '{name} should be lowercase',
  uppercase: '{name} should uppercase',
  mobile: '{name} need is a mobile phone number',
  mongoId: '{name} need is a valid hex-encoded representation of a MongoDB ObjectId',
  multibyte: '{name} need contains one or more multibyte chars',
  url: '{name} need an URL under your options',
  order: '{name} need a valid sql order string',
  field: '{name} need a valid sql field string',
  image: '{name} need a valid image file',
  startWith: '{name} need start with {args}',
  endWith: '{name} need end with {args}',
  string: '{name} need a string',
  array: '{name} need an array',
  boolean: '{name} need a boolean',
  object: '{name} need an object',
  regexp: '{name} need match your custom regexp',
  issn: '{name} need an issn',
  uuid: '{name} need an uuid',
  md5: '{name} need a md5',
  macAddress: '{name} need a macAddress',
  numeric: '{name} need a numeric',
  dataURI: '{name} need a dataURI',
  variableWidth: '{name} need contains a mixture of full and half-width chars'
};

function _safeRequire(obj) {
  if (typeof obj === 'string') {
    try {
      obj = require(obj);
    } catch (e) {
      console.error(e);
      obj = null;
    }
  }

  return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
}