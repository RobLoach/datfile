var fs = require('fs')
var parse = require('./parse')

var parseFile = function (file, options) {
	var stream = fs.createReadStream(file, {
		encoding: 'utf8'
	})
	return parse(stream, options)
}

module.exports = parseFile
