const fs = require('fs');
const readStream = fs.createReadStream('README.md');
const writeStream = fs.createWriteStream('README.log');
readStream.pipe(writeStream);