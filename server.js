var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var ppLocalStrategy = require('passport-local');
var ppGoogleSteategy = require('passport-google');


var config = require('./serverFiles/config.js');
var controls = require('./serverFiles/functions.js');
var validate = require('./serverFiles/validate.js');

var dirPath = process.env.OPENSHIFT_REPO_DIR;

//testing
dirPath = "./";

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({secret: "SECRETPLACEHOLD", saveUninitialized: false, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

var options = {
    etag : false,
    maxAge : '1d'
};

app.use(express.static(path.join(__dirname, 'public'), options));


// Passport Session Middlewear
app.use(function (req, res, next){
    var err = req.session.error;
    var msg = req.session.notice;
    var success = req.session.success;

    delete req.session.error;
    delete req.session.notice;
    delete req.session.success;

    if (err)
        res.locals.error = err;
    if (msg)
        res.locals.notice = msg;
    if (success)
        res.locals.success = success;

    next();
});

passport.use('local-signin', new ppLocalStrategy({
    passReqToCallback : true
}, function (req, username, password, next) {
    controls.localAuth(username, password)
    .then(function (user){

        if (user) {
            console.log(">>Logged in as: " + user.name);
            req.session.success = "Welcome back " + user.name + "!";
            next(null, user);
        }

        if (!user) {
            console.log(">>Login Failed!");
            req.session.error = "Could not login, try again!";
            next(null, user);
        }
    })
    .fail(function (error){
        console.log(error.body);
    });
}));

passport.use('local-signup', new ppLocalStrategy({
    passReqToCallback : true
}, function (req, username, password, password2, email, next){

    controls.localReg(username, password)
    .then(function (user) {

        if (user) {
            console.log(">>REGISTERED: " + user.name);
            req.session.success = "Welcome to Hades Broadband " + user.name + "!";
            next(null, user);
        }

        if (!user) {
            console.log(">>Could not sign user up");
            req.session.error = "That username is already in use, please try a different one.";
            next(null, user);
        }
    })
    .fail(function (error){
        console.log(error.body);
    });
}));

passport.serializeUser(function (user, next){
    console.log(">>Cereal Boxing " + user.name);
    next(null, user);
});

passport.deserializeUser(function (user, next){
    console.log(">>Removing " + user.name + " from cereal box");
    next(null, user);
});

function ensureAuthAccess (req, res, next){
    if (req.isAuthenticated()) {
        return next();
    }

    req.session.error = 'Please sign in!';
    res.redirect('/');
}

// Routes
app.get('/', function(req, res) {
    var currentUser = req.user;

    res.render('index', { title : 'Hadesoft', user : currentUser, menu : true });
});

app.get('/sign-up', function (req, res){
    res.render('sign-up', { title : 'Sign Up', menu : false });
});

app.post('/local-reg', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.get('/logout', function (req, res){
    var currentUser = req.user;
    console.log(">>Logging out " + currentUser.name);

    req.logout();
    res.redirect('/');
    req.session.notice = currentUser.name + " has been logged out.";
});


// error handlers
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var port = process.env.OPENSHIFT_NODEJS_PORT;
var address = process.env.OPENSHIFT_NODEJS_IP;

app.listen(8765/*port, address*/);
console.log("Running on 8765");
module.exports = app;