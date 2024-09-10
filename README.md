# robloach-datfile

A [clrmamepro .dat file format](https://github.com/SabreTools/SabreTools/wiki/DatFile-Formats#clrmamepro-format) parser for Node.js.

## Usage

``` javascript
var datfile = require('robloach-datfile')
datfile.parseFile('file.dat').then(function (database) {
	console.log(database)
})
```
