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
console.log(zoop)
assert.equal(zoop.roms[0].crc, '14F8B6BB')

// Load the dat file.
datFile = path.join(__dirname, 'test2.dat')
dat = fs.readFileSync(datFile, 'utf8')

// Parse the dat file.
out = datfile.parse(dat)
var sfinx = out.pop()
console.log(sfinx)
assert.equal(sfinx.name, 'sfinx-pl-1')
assert.equal(sfinx.roms[1].name, 'vol.dat')
