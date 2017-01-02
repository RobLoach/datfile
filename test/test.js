var datfile = require('..')
var path = require('path')
var assert = require('assert')
var mocha = require('mocha')

var describe = mocha.describe
var it = mocha.it

describe('robloach-datfile', function () {
	describe('test', function () {
		var file = path.join(__dirname, 'test.dat')
		it('should find the header information', function (done) {
			datfile.parseFile(file).then(function (database) {
				assert.equal(database[0].name, 'Nintendo - Game Boy')
				done()
			}).catch(function (err) {
				done(err)
			})
		})
	})
	describe('test2', function () {
		var test2 = path.join(__dirname, 'test2.dat')
		it('should find game header information', function (done) {
			datfile.parseFile(test2).then(function (database) {
				assert.equal(database[1].name, 'sfinx')
				done()
			}).catch(function (err) {
				done(err)
			})
		})
	})
	describe('test3', function () {
		var test3 = path.join(__dirname, 'test3.dat')
		it('should find game crc information', function (done) {
			datfile.parseFile(test3).then(function (database) {
				assert.equal(database[1].entries[0].crc, '8f7abb81')
				done()
			}).catch(function (err) {
				done(err)
			})
		})
	})
})
