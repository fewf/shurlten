// web.js
var express = require("express");
var logfmt = require("logfmt");
var mongo = require('mongodb');

var app = express();

var mongoUri = process.env.MONGOLAB_URI ||
  process.env.MONGOHQ_URL ||
  'mongodb://localhost:27017/';

app.use(logfmt.requestLogger());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/public'));

// Optional since express defaults to CWD/views

// app.set('views', '');

// Set our default template engine to "jade"
// which prevents the need for extensions
// (although you can still mix and match)
app.set('view engine', 'jade');


app.get('/', function(req, res) {
    res.render('main');
  // res.sendfile('./main.html');
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
                
                res.render('sub', { site: false });
                // res.send('Sorry not found.');
            }
        });
    });
});

app.get('/addurl/', function(req, res) {

    getSeqColl(getAndIncSeq);



    function getSeqColl(callback) {    
        global.db.collection('ref_seq', function(err, collection) {
            if (!err) {
                console.log("didn't error in getSeqColl")
                // getAndIncSeq
                callback(collection, getURLsColl);
            } else {
                throw new Error(err);
            }
        });
    }

    function getAndIncSeq(collection, callback) {
            collection.findAndModify({ _id: "seq" }, {}, { $inc: { seq: 1 }},
                                 {}, function(err, object) {
                if (!err) {
                    console.log("didn't error in getanincseq")
                    console.log(JSON.stringify(object));
                    // getURLsColl
                    callback(object, addNewShort);
                } else {
                    throw new Error(err);
                }
        });
	}

    function getURLsColl(object, callback) {
        global.db.collection('urls', function(err, collection) {
            console.log("appears to have gotten urls collection ok")
            callback(req, res, collection, genID(object.seq), sendToShortened);
        });
    }

	function addNewShort(req, res, collection, seq, callback) {
	        var url = req.query.url;
            collection.insert({"short": seq, "url": url}, function() {
                callback(seq);
            });
	}

	function sendToShortened(link) {
        res.render('sub', { site: 'http://shurlten.herokuapp.com/' + link });
	    // res.send(genResponse(link));
	}

});


var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});    

// function genResponse(link) {   
//     return 'here\'s your link: <a href="http://shurlten.herokuapp' +
//             '.com/'  + link + '" target="_blank">shurlten' +
//             '.herokuapp.com/'  + link + '<br />' +
//             '<a href="https://github.com/fewf/url_shortener" target="_blank">github</a>';
// }

function genID(decimal, symbols) {
    console.log("start genID: " + decimal);

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
    console.log("got out of first while")
    while ( i >= 0 ) {

        var leftMost = symbols[Math.floor(decimal / pow(i))];
        numstr += leftMost;
        decimal = decimal - pow(i) * Math.floor(decimal / pow(i));
        i--;
    }
    console.log("end genid");
    return numstr;
}