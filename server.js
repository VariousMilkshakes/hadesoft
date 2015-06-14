var express          = require('express');
var http             = require('http');
var path             = require('path');
var favicon          = require('serve-favicon');
var logger           = require('morgan');
var cookieParser     = require('cookie-parser');
var bodyParser       = require('body-parser');
var session          = require('express-session');
var passport         = require('passport');
var multer           = require('multer');

var config   = require('./serverFiles/config.js');
var controls = require('./serverFiles/functions.js');
var styx     = require('./forumFiles/styx.js');
var validate = require('./serverFiles/validate.js');
var pp = require('./serverFiles/passport.js');
var router = require('./serverFiles/router.js');
var forumRouter = require('./forumFiles/forum-routes.js');

var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set('origins', 'http://82.37.178.154:8765');

// Clear all online users
controls.sleepAllUsers();

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

//App Middleware
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: config.secret, saveUninitialized: false, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

var options = {
    etag    : false,
    maxAge  : '1d'
}

app.use(express.static(path.join(__dirname, 'public'), options));

//Passport Middleware
///Session alerts
app.use(function (req, res, next){
    var err     = req.session.error;
    var msg     = req.session.notice;
    var success = req.session.success;

    delete req.session.error;
    delete req.session.notice;
    delete req.session.success;

    if (err) res.locals.error = err;
    if (msg) res.locals.notice = msg;
    if (success) res.locals.success = success;

    next();
});

///Strategies
passport.use('local-signin', pp.signIn);
passport.use('local-signup', pp.signUp);

///Session control
passport.serializeUser(function (user, next){
    console.log(">> Cereal Boxing " + user.name);

    next(null, user);
});

passport.deserializeUser(function (user, next){
    console.log(">> Removing " + user.name + " from cereal box");

    next(null, user);
});

//Routing
app.use('/', router);
app.use('/forum', forumRouter);
app.get('/logout', pp.signOut);
app.get('/verify', pp.verifyAccount);

app.post('/local-reg', passport.authenticate('local-signup', {
    successRedirect : '/',
    failureRedirect : '/sign-up',
    failureFlash    : false,
    session         : false
}));

app.post('/login', passport.authenticate('local-signin', {
    successRedirect : '/',
    failureRedirect : '/',
    failureFlash    : false
}));

//Error handlers
///Catch 404 errors
app.use(function(req, res, next) {
    var err    = new Error('Not Found');
    err.status = 404;
    next(err);
});

///Dev stack trace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message : err.message,
            error   : err
        });
    });
}

///Production
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message : err.message,
        error   : {}
    });
});

//Socket.io
io.on('connection', function (socket){
    socket.on('currentUser', function (username){
        console.log("?-?" + username + " has requested users");

        controls.getActiveUsers(username)
        .then(function (activeUsers){
            try {
                socket.emit("sendCurrentUsers", activeUsers);
            } catch (e) {
                console.log(e);
            }
        });
    });

    socket.on('addFriend', function (socket){
        console.log("Adding new friend");
        styx.updateFriend(socket.user, socket.profile);
    });

    socket.on('requestPosts', function (query){
        try{
            styx.getPosts(query)
            .then(function (posts){
                socket.emit('sendPosts', posts);
            });
        }catch (e){
            console.log("f# Error getting posts:");
            console.log(e);
        }
    });

    socket.on('getPost', function (id){
        styx.viewPost(io, id);
    });
});

var port = config.dev.port;
var address = config.dev.ip;

console.log("Running on " + port);
server.listen(port, function (){
    console.log("?-?The Socks are on!")
});
module.exports = app;
