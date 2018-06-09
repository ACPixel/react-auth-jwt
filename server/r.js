const r = require('rethinkdbdash')({
  host: 'localhost',
  db: "Pixel"
});

module.exports = r;