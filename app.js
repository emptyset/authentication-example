var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path');

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var UserProvider = require('./userprovider-memory').UserProvider;
var up = new UserProvider();
//var User = require('.user')

passport.use(new LocalStrategy(function (username, password, done) {
	up.findByUsername(username, function (err, user) {
		if (err) { return done(err); }
		if (!user) { 
			return done(null, false, { message: 'Incorrect username.' });
		}
		if (user.password != password) {
			return done(null, false, { message: 'Incorrect password.' });
		}
		return done(null, user);
	});
}));

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('ghostbusters'));
app.use(express.session({ secret: 'keyboard cat'}));

app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

function ensureAuthenticated(request, response, next) {
	if (request.isAuthenticated()) {
		return next();
	}
	response.redirect('/login');
}

app.get('/', function (request, response) {
	response.render('index', { user: request.user });
});

app.get('/login', function (request, response) {
	if (!request.user) {
		response.render('login-form');
	} else {
		response.render('login', { user: request.user, message: 'error' });
	}
});
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login' }));

app.get('/logout', function (request, response) {
	request.logout();
	response.redirect('/');
});

app.get('/account', ensureAuthenticated, function (request, response) {
	response.render('account', { user: request.user });
});

http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});

passport.serializeUser(function(user, done) {
	done(null, user.username);
});

passport.deserializeUser(function(username, done) {
	up.findByUsername(username, function (err, user) {
		done(err, user);
	});
});
