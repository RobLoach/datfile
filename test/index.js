var datfile = require('..')
var assert = require('assert')
var fs = require('fs')

var dat = fs.readFileSync('test/test.dat', 'utf8')
var out = datfile.parse(dat)

var zoop = out.pop()
assert.equal(zoop.roms[0].crc, '14F8B6BB')
