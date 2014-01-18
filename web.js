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

if (!global.db) {
    mongo.Db.connect(mongoUri, function (err, db) {
        if (!err) {
            global.db = db;
        } else {
            throw new Error(err);
        }
    });
}

app.get(/^\/([\d\w]+)$/, function(req, res) {
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

app.get('/addurl/', function(req, res) {
    getSeqColl(req, res, getAndIncSeq);



    function getSeqColl(req, res, callback) {    
        global.db.collection('ref_seq', function(err, collection) {
            if (!err) {
                callback(req, res, collection, getURLsColl)
            } else {
                throw new Error(err);
            }        

        });
    }

    function getURLsColl(req, res, collection, object, callback) {
        global.db.collection('urls', function(err, collection) {
            callback(req, res, collection, genID(object.seq), sendToShortened);
        });
    }

    function getAndIncSeq(req, res, collection, callback) {
            collection.findAndModify({ _id: "seq"}, {}, { $inc: { seq: 1 }},
                                 {}, function(err, object) {
            if (!err) {
                callback(req, res, collection, object, addNewShort);
            } else {
                throw new Error(err);
            }

        });
	}

	function addNewShort(req, res, collection, seq, callback) {
	        var url = req.query.url;
	        collection.insert({"short": seq, "url": url}, function() {
	            callback(seq);
	        });
	}

	function sendToShortened(link) {
	    res.send(genResponse(link));
	}

});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});    

function genResponse(link) {
    return 'here\'s your link: <a href="http://quiet-scrubland-5884.herokuapp' +
            '.com/'  + link + '" target="_blank">quiet-scrubland' +
            '-5884.herokuapp.com/'  + link + '<br />' +
            '<a href="https://github.com/greggreggreg7/url_shortener" target="_blank">github</a>';
}

function genID(decimal, symbols) {
    if (typeof symbols === 'undefined' || !symbols.length) {
        var symbols = ['0','1','2','3','4','5','6','7','8',
                   '9','b','c','d','f','g','h',
                   'j','k','n','p','q',
                   'r','s','t','w','x','y','z'];    
    }
    decimal = decimal * 25;

    function pow(power) {
        return Math.pow(symbols.length, power);
    }

    var numstr = '';
    var rem;
    var i = 0;
    while (true) {

        if ( decimal/pow(i+1) < 1) {
            break;
        }
        i++;

    }

    while ( i >= 0 ) {

        var leftMost = symbols[Math.floor(decimal / pow(i))];
        numstr += leftMost;
        decimal = decimal - pow(i) * Math.floor(decimal / pow(i));
        i--;
    }

    return numstr;
}