var url = require('url');
var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

var htmlIndex = fs.readFileSync(__dirname+'/index.html');
var jsMap = fs.readFileSync(__dirname+'/map.js');
var jsGraph = fs.readFileSync(__dirname+'/graph.js');
var tsvData = fs.readFileSync(__dirname+'/data.tsv');

var app = require('http').createServer(function (req, res) {

	var page = url.parse(req.url).pathname;

	if (req.method=='GET' && page=='/post') {

		MongoClient.connect("mongodb://172.17.0.32:27017/carODB", function(err, db) {
			if(err) throw err;

			var data = url.parse(req.url, true).query;

			if (typeof data.session == 'undefined') {
				data.session = "0"
			}

			console.log(data);

			var collection = db.collection(data.session);
			var doc = {
				id : data.id,
				email : data.eml,
				time : data.time,
				gps : {
					longitude : data.kff1005,
					latitude : data.kff1006,
					altitude : data.kff1010,
					speed : data.kff1001,
					bearing : data.kff1007,
					accurancy : data.kff1239
				},
				accelerometerTotal : data.kff1223,
				barometer : data.kff1270,
				averageTripSpeed : data.kff1272,
				l100LongTerm : data.kff5203,
				l100Instant : data.kff1207,
				horsepower : data.kff1226,
				kw : data.kff1273,
				intakeAirTemp : data.kf,
				intakeManifold : data.kb,
				masseAirFlowRate : data.k10,
				engineCoolantTemp : data.k5,
				engineLoad : data.k4,
				engineRPM : data.kc,
				odbSpeed : data.kd,
				throttlePosition : data.k11,
				turboBoost : data.kff1202,
				voltage : data.kff1238
			}

			collection.insert(doc, {w:1}, function(err, result) {});

			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('OK!');
		});
	}

	if (req.method=='GET' && page=='/') {
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(htmlIndex);
	}

	if (req.method=='GET' && page=='/map.js') {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.end(jsMap);
	}

	if (req.method=='GET' && page=='/data.tsv') {
		res.writeHead(200, {'Content-Type': 'text'});
		res.end(tsvData);
	}

	if (req.method=='GET' && page=='/graph.js') {
		res.writeHead(200, {'Content-Type': 'text/javascript'});
		res.end(jsGraph);
	}

});
app.listen(8080);

var io = require("socket.io").listen(app);

io.set('log level', 2);

io.sockets.on('connection', function (socket){

	socket.on('searchMongo', function (){

		MongoClient.connect("mongodb://172.17.0.32:27017/carODB", function(err, db) {
			if(err) throw err;

			db.collectionNames(function(err, coll){
				var selectObject = {};
				var selectObject={};

				for (var i=0;i<coll.length;i++)
				{
						if (coll[i].name.match(/[0-9]{13}/g) != null) {
							var timestamp = coll[i].name.match(/[0-9]{13}/g)[0].match(/^[0-9]{10}/g)[0]*1000;
							var date = new Date(timestamp);
							selectObject[coll[i].name.match(/[0-9]{13}/g)]=date.toLocaleString();
					}
				}

				socket.emit('date', selectObject);
			});

		});
	});

	socket.on('getTrip', function (date){

		MongoClient.connect("mongodb://172.17.0.32:27017/carODB", function(err, db) {
			if(err) throw err;
			var collection = db.collection(date);
			collection.find().toArray(function(err, items) {
				for (var i=0; i<items.length; i++) {
					socket.emit('drawTrip', items[i]);
				}
				socket.emit('drawGraph');
			});
		});

	});

});
