const readline = require('readline')
const stream = require('stream')
const extend = require('extend-shallow')

const replaceSurroundingQuotes = function (string) {
	if (string.charAt(0) === '"' && string.charAt(string.length - 1) === '"') {
		string = string.substr(1, string.length - 2)
	}

	return string
}

const getCleanEntryName = function (line) {
	line = line.trim()
	if (line.substring(0, 5) === 'name ' || line.substring(0, 5) === 'Name:') {
		line = line.substring(5)
	}

	line = replaceSurroundingQuotes(line)

	return line
}

const getLineDetail = function (line) {
	const output = {}

	// Check if this is a "file" or "rom" entry
	if (line.length > 3 && line.charAt(line.length - 1) === ')') {
		const match = line.match(/\S+ \((.+)\)/i)
		if (match && match.index > 0) {
			const entry = match[1]

			// Retrieve the name if it's there.
			let nameMatch = entry.match(/ name ("(.+)") /i)
			if (nameMatch) {
				output.name = replaceSurroundingQuotes(nameMatch[1])
			} else {
				nameMatch = entry.match(/ name (\S*) /i)
				if (nameMatch) {
					output.name = nameMatch[1]
				}
			}

			// Retrieve teh size if it's there.
			const size = entry.match(/ size (\d*) /i)
			if (size) {
				output.size = size[1]
			}

			// Retrieve teh size if it's there.
			const crc = entry.match(/ crc (\S*) /i)
			if (crc) {
				output.crc = crc[1]
			}

			// Retrieve the md5 if it's there.
			const md5 = entry.match(/ md5 (\S*) /i)
			if (md5) {
				output.md5 = md5[1]
			}

			// Retrieve the md5 if it's there.
			const sha1 = entry.match(/ sha1 (\S*) /i)
			if (sha1) {
				output.sha1 = sha1[1]
			}

			output.lineType = 'entry'
		}
	} else if (line.charAt(0) === '\t' || line.substring(0, 2) === '  ') {
		// Header information
		const result = line.match(/(\t|\s\s)(\S+) (.+)/i)
		if (result) {
			output.lineType = 'header'
			let name = result[2]
			let value = result[3]
			name = name.trim().toLowerCase()
			value = value.trim()
			// Replace beginning and end quotes if needed
			if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
				value = value.substr(1, value.length - 2)
			}

			// Replace the ending : if needed.
			if (name.charAt(name.length - 1) === ':') {
				name = name.substr(0, name.length - 1)
			}

			output[name] = value
		}
	}

	return output
}

const readLine = function (line) {
	if (line.indexOf('\t') === 0 || line.substring(0, 2) === '  ') {
		// Check if we are entering a new game entry.
		if (line.includes('\tname ') || line.includes('  name ') || line.includes('\tName:') || line.includes('  Name:')) {
			this.addCurrentEntry()

			// Start up a new entry.
			this.currentEntry = {
				name: getCleanEntryName(line),
				entries: []
			}
		} else {
			// Retrieve the line information detail
			const details = getLineDetail(line)
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

const readError = function (err) {
	// Force a close of the stream and reject the Promise.
	this.close()
	this.reject(err)
}

const addCurrentEntry = function () {
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

const readClose = function () {
	this.addCurrentEntry()

	// Output the database
	this.resolve(this.database)
}

const parse = function (input, options) {
	// Prepare the options.
	options = options || {}
	options.ignoreHeader = options.ignoreHeader || false

	return new Promise((resolve, reject) => {
		// Convert any strings into a stream.
		if (typeof input === 'string') {
			const string = input
			input = new stream.Readable()
			input.push(string)
			input.push(null)
		}

		// Build the line reader.
		const lineReader = readline.createInterface({
			input
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
