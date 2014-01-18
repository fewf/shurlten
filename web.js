// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb');

var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/';
  // console.log(mongoUri);

app.use(logfmt.requestLogger());
app.use(express.urlencoded());
app.get('/', function(req, res) {
  res.sendfile('./main.html');
});

app.get(/^\/([\d\w]+)$/, function(req, res) {
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('urls', function(er, collection) {
			collection.find({"short": req.params[0]}).toArray(function( err, docs) {
				if (docs.length) {
					res.redirect(docs[0].url);
				} else {
					res.send('Sorry not found.');
				}
			});
		});
	});
});

app.get(/^\/addurl/, function(req, res) {
	console.log('req before connect callback: ' + JSON.stringify(req));
	mongo.Db.connect(mongoUri, function (err, db) {
		console.log('req in connect callback: ' + JSON.stringify(req));
		db.collection('urls', function(er, collection) {
			collection.insert({"short": "g5", "url": req.params[0]});
		});
	});
})

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});	