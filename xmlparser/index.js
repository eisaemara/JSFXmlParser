var parser = require('./xmlparser');
var fs = require('fs');

const taskflowName = '[taskfow-name]';
var path = ''
fs.readdir(path, function(err, items) {
    for (var i = 0; i < items.length; i++) {
        if (items[i].indexOf('.jsff') != -1) {
            parser.parse(path + '/' + items[i], taskflowName);
        }
    }
});