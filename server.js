const express = require('express'),
	session = require('express-session'),
	MongoStore = require('connect-mongo')(session),
	mongoose = require('mongoose'),
    path = require('path'),
	cookieParser = require('cookie-parser')
    bodyParser = require('body-parser'),
    cors = require('cors'),
    config = require('./config'),
	port = process.env.PORT || config.port,
	db = mongoose.connection;

	const app = express();

	var whitelist = config.whitelist;
	var corsOptionsDelegate = function (req, callback) {
		var corsOptions;
		if (whitelist.indexOf(req.header('Origin')) !== -1) {
		corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
		} else {
		corsOptions = { origin: false } // disable CORS for this request
		}
		callback(null, corsOptions) // callback expects two parameters: error and options
	};

	process.setMaxListeners(Infinity); // <== Important line
	mongoose.set('useNewUrlParser', true);
	mongoose.set('useFindAndModify', false);
	mongoose.set('useCreateIndex', true);
	mongoose.set('useUnifiedTopology', true);

	mongoose.Promise = global.Promise;
	const dbURI = config.DB || process.env.MONGODB_URI;

	var isConnectedBefore = false;
	var connect = function() {
		  mongoose.connect(dbURI, { useNewUrlParser: true, auto_reconnect:true }).then(
		  () => {console.log('Database is connected\n...') },
		  err => { console.log('Can not connect to the database'+ err)}
		);
	};
	connect();

	db.on('error', function() {
		console.log('Could not connect to MongoDB');
	});

	db.on('disconnected', function(){
		console.log('Lost MongoDB connection...');
		if (!isConnectedBefore)
			connect();
	});
	db.on('connected', function() {
		isConnectedBefore = true;
		console.log('Connection established to MongoDB');
	});

	db.on('reconnected', function() {
		console.log('Reconnected to MongoDB\n...');
	});

	// Close the Mongoose connection, when receiving SIGINT
	process.on('SIGINT', function() {
		db.close(function () {
			console.log('Force to close the MongoDB conection');
			process.exit(0);
		});
	})
 	
	app.use(bodyParser.json({limit: '20mb', extended: true}))

	app.use(bodyParser.urlencoded({
		limit: "50mb",
		extended: false
	}));
	app.use(cookieParser());
	app.use(cors(corsOptionsDelegate));
	// Express Session middleware
	app.use(session({
	  resave: false,
	  secret: 'rk risingsunmart mail service',
	  saveUninitialized: true,
	  store: new MongoStore({mongooseConnection: mongoose.connection}),
	  unset: 'destroy',
	  name: 'session cookies name',
	  cookie: {
		path: '/',
		httpOnly: true,
		maxAge: 180 * 60 * 1000
	  }
	}));
	
	app.use(express.static(path.join(__dirname, 'public')));
	const mailRoute = require('./routes/sendmail.route');
	app.use('/sendmail', mailRoute);
		
	const server = app.listen(port, () => {
		console.log('CORS-enabled web server(%s) listening on port %s', server.address().address, server.address().port);
	});
				
