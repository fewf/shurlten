// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb');

var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost/mydb';

app.use(logfmt.requestLogger());
app.use(express.bodyParser());
app.get('/', function(req, res) {
  res.send('<input type="text" />');
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

app.post(/^\/addurl\/(.+)/, function(req, res) {
	mongo.Db.connect(mongoUri, function (err, db) {
		db.collection('urls', function(er, collection) {
			collection.insert({"short": "g5", "url": req.params[0]});
		});
	});
})

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});	