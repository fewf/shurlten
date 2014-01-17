// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb');


var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World boo!');
});

app.get(/^\/([\d\w]+)$/, function(req, res) {
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('urls', function(er, coll) {
			console.log(req.params[0]);
			var rec = coll.find({'short': req.params[0]});
			if (rec.length) {
				res.redirect(rec[0].url);
			} else {
				res.send('Sorry not found.');
			}
		})
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});