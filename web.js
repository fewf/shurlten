// web.js
var express = require("express");
var logfmt = require("logfmt");
var fs = require("fs")
var app = express();

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World boo!');
});

app.get(/^\/([A-Za-z0-9]+)$/, function(req, res) {
	fs.open('shorten_dict.js', 'r', function(err, fd) {
		fs.fstat(fd, function(err, stat) {
			var bufferSize = stats.size;
			var chunkSize = 512;
			var buffer = new Buffer(bufferSize);
			var bytesRead = 0;

			while (bytesRead < bufferSize) {
				if ((bytesRead + chunkSize) > bufferSize) {
					chunkSize = (bufferSize - bytesRead);
				}
				fs.read(fd, buffer, bytesRead, chunkSize, bytesRead);
				bytesRead += chunkSize;
			}
			var url_dict = JSON.parse(buffer.toString('utf8', 0, bufferSize));
			if (url_dict[req.param[0]]) {
				res.redirect(url_dict[req.param[0]]);
			} else {
				res.send('Sorry not found.');
			}
		});
	})
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});