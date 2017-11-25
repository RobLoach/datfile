const datfile = require('..')
const path = require('path')
const assert = require('assert')
const mocha = require('mocha')

const describe = mocha.describe
const it = mocha.it

describe('robloach-datfile', () => {
	describe('test', () => {
		const file = path.join(__dirname, 'test.dat')
		it('should find the header information', done => {
			datfile.parseFile(file).then(database => {
				assert.equal(database[0].name, 'Nintendo - Game Boy')
				done()
			}).catch(err => {
				done(err)
			})
		})
	})
	describe('test2', () => {
		const test2 = path.join(__dirname, 'test2.dat')
		it('should find game header information', done => {
			datfile.parseFile(test2).then(database => {
				assert.equal(database[1].name, 'sfinx')
				done()
			}).catch(err => {
				done(err)
			})
		})
	})
	describe('test3', () => {
		const test3 = path.join(__dirname, 'test3.dat')
		it('should find game crc information', done => {
			datfile.parseFile(test3).then(database => {
				assert.equal(database[1].entries[0].crc, '8f7abb81')
				done()
			}).catch(err => {
				done(err)
			})
		})
	})
	describe('test4', () => {
		const test4 = path.join(__dirname, 'test4.dat')
		it('should find game crc information', done => {
			const options = {
				ignoreHeader: true
			}
			datfile.parseFile(test4, options).then(database => {
				assert.equal(database[0].entries[0].name, 'dinothawr.game')
				done()
			}).catch(err => {
				done(err)
			})
		})
	})
	describe('doublespace', () => {
		const doublespace = path.join(__dirname, 'doublespace.dat')
		it('should find game crc information', done => {
			const options = {
				ignoreHeader: true
			}
			datfile.parseFile(doublespace, options).then(database => {
				assert.equal(database[2].entries[1].crc, '026e1651')
				done()
			}).catch(err => {
				done(err)
			})
		})
	})
})
