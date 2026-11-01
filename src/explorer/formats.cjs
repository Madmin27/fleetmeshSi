const { fullFormats } = require('ajv-formats/dist/formats');
module.exports = {
  ...fullFormats,
  uint32: { type: 'number', validate: value => Number.isInteger(value) && value >= 0 && value <= 4294967295 }
};
