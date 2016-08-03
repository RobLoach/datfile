var datfile = require('..')
var path = require('path')
var assert = require('assert')
var fs = require('fs')

// Load the dat file.
var datFile = path.join(__dirname, 'test.dat')
var dat = fs.readFileSync(datFile, 'utf8')

// Parse the dat file.
var out = datfile.parse(dat)

// Test it.
var zoop = out.pop()
assert.equal(zoop.roms[0].crc, '14F8B6BB')
