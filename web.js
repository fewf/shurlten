// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb');


var app = express();


var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

mongo.Db.connect(mongoUri, function (err, db) {
	db.collection('urls', function(er, collection) {
		collection.remove();
		if (!collection.find({'short': 'a'}).length) {
			collection.insert({'short': 'a', 'url': 'http://www.google.com'}, {safe: true});
		}
	});
});

app.use(logfmt.requestLogger());

app.get('/', function(req, res) {
  res.send('Hello World boo!');
});

app.get(/^\/([A-Za-z0-9]+)$/, function(req, res) {
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('urls', function(er, coll) {
			var rec = coll.find({'short': req.param[0]});
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