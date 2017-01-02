# robloach-datfile

A [clrmamepro .dat file format](https://github.com/mnadareski/wizzardRedux/wiki/DAT-File-Formats) parser for Node.js.

## Usage

``` javascript
var datfile = require('robloach-datfile')
datfile.parseFile('file.dat').then(function (database) {
	console.log(database)
})
```
