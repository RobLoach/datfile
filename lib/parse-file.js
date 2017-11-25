const fs = require('fs')
const parse = require('./parse')

const parseFile = function (file, options) {
	const stream = fs.createReadStream(file, {
		encoding: 'utf8'
	})
	return parse(stream, options)
}

module.exports = parseFile
