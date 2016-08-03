var Parser = require('simple-text-parser')

function parse(datFile) {
	var parser = new Parser()
	parser.addRule(/game \(\n\tname "?(.*?)"?\n\tdescription "?(.*?)"?\n/g, function (tag, name, description) {
		return {
			type: 'game',
			text: tag,
			name: name,
			description: description
		}
	})

	var romParser = new Parser()
	romParser.addRule(/rom \( (.*?)\)\n/g, function (tag, contents) {
		return {
			type: 'rom',
			text: tag,
			contents: contents
		}
	})

	var tree = parser.toTree(datFile)
	var out = []
	var length = -1
	for (var entryIndex in tree) {
		var entry = tree[entryIndex]
		switch (entry.type) {
			case 'text':
				if (length > -1) {
					var romTree = romParser.toTree(entry.text)
					for (var romIndex in romTree) {
						var entryRom = romTree[romIndex]
						if (entryRom.type == 'rom') {
							out[length - 1].roms.push({contents: entryRom.contents})
						}
					}
				}
				break
			case 'game':
				length = out.push({
					name: entry.name,
					description: entry.description,
					roms: []
				})
				break
		}
	}

	var contentsParser = new Parser()
	contentsParser.addRule(/name "(.*?)"/g, function (tag, name) {
		return {
			type: 'name',
			text: tag,
			name: name
		}
	})
	contentsParser.addRule(/size (\d+) /g, function (tag, size) {
		return {
			type: 'size',
			text: tag,
			size: size
		}
	})
	contentsParser.addRule(/crc (\S+) /g, function (tag, crc) {
		return {
			type: 'crc',
			text: tag,
			crc: crc
		}
	})
	contentsParser.addRule(/md5 (\S+) /g, function (tag, md5) {
		return {
			type: 'md5',
			text: tag,
			md5: md5
		}
	})
	contentsParser.addRule(/sha1 (\S+) /g, function (tag, sha1) {
		return {
			type: 'sha1',
			text: tag,
			sha1: sha1
		}
	})

	var romIndex = null
	for (var gameIndex in out) {
		for (romIndex in out[gameIndex].roms) {
			var rom = out[gameIndex].roms[romIndex]
			var data = contentsParser.toTree(rom.contents)

			for (var romData in data) {
				switch (data[romData].type) {
					case 'name':
						out[gameIndex].roms[romIndex].name = data[romData].name
						break
					case 'size':
						out[gameIndex].roms[romIndex].size = data[romData].size
						break
					case 'crc':
						out[gameIndex].roms[romIndex].crc = data[romData].crc
						break
					case 'md5':
						out[gameIndex].roms[romIndex].md5 = data[romData].md5
						break
					case 'sha1':
						out[gameIndex].roms[romIndex].sha1 = data[romData].sha1
						break
				}
			}
			if (out[gameIndex].roms[romIndex].contents) {
				delete out[gameIndex].roms[romIndex].contents
			}
		}
	}

	return out
}

module.exports = {
	parse: parse
}
