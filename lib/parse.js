const readline = require('readline')
const stream = require('stream')
const extend = require('extend-shallow')

var replaceSurroundingQuotes = function (str) {
	if (str.charAt(0) === '"' && str.charAt(str.length - 1) === '"') {
		str = str.substr(1, str.length - 2)
	}
	return str
}

var getCleanEntryName = function (line) {
	line = line.trim()
	if (line.substring(0, 5) === 'name ' || line.substring(0, 5) === 'Name:') {
		line = line.substring(5)
	}
	line = replaceSurroundingQuotes(line)
	return line
}

var getLineDetail = function (line) {
	var output = {}

	// Check if this is a "file" or "rom" entry
	if (line.length > 3 && line.charAt(line.length - 1) === ')') {
		var match = line.match(/\S+ \((.+)\)/i)
		if (match && match.index > 0) {
			var entry = match[1]

			// Retrieve the name if it's there.
			var nameMatch = entry.match(/ name ("(.+)") /i)
			if (nameMatch) {
				output.name = replaceSurroundingQuotes(nameMatch[1])
			} else {
				nameMatch = entry.match(/ name (\S*) /i)
				if (nameMatch) {
					output.name = nameMatch[1]
				}
			}

			// Retrieve teh size if it's there.
			var size = entry.match(/ size (\d*) /i)
			if (size) {
				output.size = size[1]
			}

			// Retrieve teh size if it's there.
			var crc = entry.match(/ crc (\S*) /i)
			if (crc) {
				output.crc = crc[1]
			}

			// Retrieve the md5 if it's there.
			var md5 = entry.match(/ md5 (\S*) /i)
			if (md5) {
				output.md5 = md5[1]
			}

			// Retrieve the md5 if it's there.
			var sha1 = entry.match(/ sha1 (\S*) /i)
			if (sha1) {
				output.sha1 = sha1[1]
			}

			output.lineType = 'entry'
		}
	} else if (line.charAt(0) === '\t') {
		// Header information
		var result = line.match(/\t(\S+) (.+)/i)
		if (result) {
			output.lineType = 'header'
			var name = result[1]
			var val = result[2]
			name = name.trim().toLowerCase()
			val = val.trim()
			// Replace beginning and end quotes if needed
			if (val.charAt(0) === '"' && val.charAt(val.length - 1) === '"') {
				val = val.substr(1, val.length - 2)
			}
			// Replace the ending : if needed.
			if (name.charAt(name.length - 1) === ':') {
				name = name.substr(0, name.length - 1)
			}
			output[name] = val
		}
	}

	return output
}

var readLine = function (line) {
	if (line.indexOf('\t') === 0) {
		// Check if we are entering a new game entry.
		if (line.indexOf('\tname ') >= 0 || line.indexOf('\tName:') >= 0) {
			this.addCurrentEntry()

			// Start up a new entry.
			this.currentEntry = {
				name: getCleanEntryName(line),
				entries: []
			}
		} else {
			// Retrieve the line information detail
			var details = getLineDetail(line)
			switch (details.lineType) {
				case 'header':
					delete details.lineType
					extend(this.currentEntry, details)
					break
				case 'entry':
					delete details.lineType
					this.currentEntry.entries.push(details)
					break
				default:
					// Ignore
					break
			}
		}
	}
}

var readError = function (err) {
	// Force a close of the stream and reject the Promise.
	this.close()
	this.reject(err)
}

var addCurrentEntry = function () {
	// If there is no current entry, skip.
	if (!this.currentEntry) {
		return false
	}

	// If we are to ignore the first entry.
	if (this.options.ignoreHeader) {
		this.options.ignoreHeader = false
		return false
	}

	// Delete the entries if they're empty.
	if (this.currentEntry && this.currentEntry.entries.length === 0) {
		delete this.currentEntry.entries
	}

	// Add the entry to the database.
	return this.database.push(this.currentEntry)
}

var readClose = function () {
	this.addCurrentEntry()

	// Output the database
	this.resolve(this.database)
}

var parse = function (input, options) {
	// Prepare the options.
	options = options || {}
	options.ignoreHeader = options.ignoreHeader || false

	return new Promise(function (resolve, reject) {
		// Convert any strings into a stream.
		if (typeof stream === 'string') {
			var string = input
			input = new stream.Readable()
			input.push(string)
			input.push(null)
		}

		// Build the line reader.
		var lineReader = readline.createInterface({
			input: input
		})

		// Set up the events.
		lineReader.options = options || {}
		lineReader.database = []
		lineReader.reject = reject
		lineReader.resolve = resolve
		lineReader.addCurrentEntry = addCurrentEntry
		lineReader.on('line', readLine)
		lineReader.on('error', readError)
		lineReader.on('close', readClose)
	})
}

module.exports = parse
