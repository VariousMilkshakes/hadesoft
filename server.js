var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var ppLocalStrategy = require('passport-local').Strategy;
var ppGoogleSteategy = require('passport-google');

var config = require('./serverFiles/config.js');
var controls = require('./serverFiles/functions.js');
var validate = require('./serverFiles/validate.js');

var dirPath = config.dev.dir;

var app = express();

// Clear all online users
controls.sleepAllUsers();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//REPLACE SECRET WITH YOUR OWN
app.use(session({secret: config.secret, saveUninitialized: false, resave: true}));
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
}, function (req, username, password, done) {
    controls.localAuth(username, password)
    .then(function (user){

        if (user) {
            console.log(">>Logged in as: " + user.valid + ", " + user.name);
            controls.activateUser(user);

            req.session.success = "Welcome back " + user.name + "!";
            done(null, user);
        }

        if (!user) {
            console.log(">>Login Failed!");
            req.session.error = "Could not login, try again!";
            done(null, user);
        }
    })
    .fail(function (error){
        console.log(error.body);
    });
}));

passport.use('local-signup', new ppLocalStrategy({
    passReqToCallback : true,
}, function (req, username, password, done){

    var email = req.body.email;

    controls.localReg(username, password, email)
    .then(function (user) {

        if (user) {
            console.log(">>REGISTERED: " + user.name);
            req.session.success = "Please check your email in order to activate your account!";
            return done(null, user);
        }

        if (!user) {
            console.log(">>Could not sign user up");
            req.session.error = "That username is already in use, please try a different one.";
            return done(null, false);
        }
    })
    .fail(function (e){
        console.log(error.body);
        return done(null, false, { error : e });
    });
}));

passport.serializeUser(function (user, next){
    console.log(">>Cereal Boxing " + user.name);
    next(null, user);
});

passport.deserializeUser(function (id, next){
    console.log(">>Removing " + id.name + " from cereal box");

    next(null, id);
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

    res.render('index', {
        title : config.site.title,
        titleMessage : config.site.bannerMessage,
        user : currentUser,
        menu : true
    });
});

app.get('/sign-up', function (req, res){
    res.render('sign-up', {
        title : 'Sign Up',
        menu : false
    });
});

app.post('/local-reg', passport.authenticate('local-signup', {
    successRedirect: '/',
    failureRedirect: '/sign-up',
    failureFlash : true,
    session : false
}));

app.post('/login', passport.authenticate('local-signin', {
    successRedirect: '/',
    failureRedirect: '/'
}));

app.get('/logout', function (req, res){
    var currentUser = req.user;

    req.logout();
    console.log(">>Logging out " + currentUser.name);

    controls.sleepUser(currentUser.name);

    req.session.notice = currentUser.name + " has logged out.";
    res.redirect('/');
});

app.get('/verify', function (req, res){
    var id = req.query.id;
    var username = req.query.username;
    console.log(id + " : " + username);
    
    validate.verify(id, username)
    .then(function (status) {
        console.log(status);
        if (status == "Your account has been validated") {
            req.session.notice = status;
            res.redirect('/');
        } else {
            res.render('error', { error : status });
        }
    })
    .fail(function (error) {
        console.log(error);
    });
});

app.get('/welcome', function (req, res){
    res.render('index', {
        title : config.site.title,
        titleMessage : config.site.welcomeMessage,
        menu : true,
        user : false
    });
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

var port = config.dev.port;
var address = config.dev.ip;

app.listen(port,address);
console.log("Running on 8765");
module.exports = app;