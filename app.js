var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session); // require and call with session in order to allow connect-mongo middleware to access sessions
var app = express();

// mongodb connection
mongoose.connect("mongodb://localhost:27017/bookworm");
var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

// use sessions for tracking logins
app.use(session({
	// secret is only req. param. a string that is used to sign the session id cookie. this adds another layer of security, because it makes it difficult for someone to create a cookie in their browser to try and gain access to session data. 
	secret: 'treehouse loves you',
	// resave option forces the session to be saved in the session store, whether anything changed during the request or not.
  resave: true,
  // saveUninitialized forces an uninitialized session to be saved in the session store.
  // an uninitialized session is a new and not yet modified session.
  saveUninitialized: false,
  // store sets the sessionstore, mongostore constuctor function takes a config object
  store: new MongoStore({
  	mongooseConnection: db
  })
}))

// make user ID available in templates
app.use(function (req, res, next) {
	// locals is a way to add info to the response object
	// all views have access to locals object

	// if user is logged in, userId will have a value, otherwise it is undefined
	res.locals.currentUser = req.session.userId;
	next();
});

// parse incoming requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// serve static files from /public
app.use(express.static(__dirname + '/public'));

// view engine setup
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// include routes
var routes = require('./routes/index');
app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// listen on port 3000
app.listen(3000, function () {
  console.log('Express app listening on port 3000');
});
