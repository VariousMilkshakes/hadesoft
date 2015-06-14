var ppLocalStrategy  = require('passport-local').Strategy;
var ppGoogleSteategy = require('passport-google');

var controls = require('../serverFiles/functions.js');
var validate = require('../serverFiles/validate.js');

//Sign in
exports.signIn = new ppLocalStrategy({
    passReqToCallback   : true
}, function (req, username, password, done){
    var username = req.body.username;
    var password = req.body.password;

    console.log(done);

    controls.localAuth(username, password)
    .then(function (user){

        if (user) {
            console.log("pp> Logged in as: " + user.valid + " : " + user.name);

            //Add user to online users
            controls.activateUser(user);

            req.session.success = "Welcome back " + user.name + "!";
            done(null, user);
        } else {
            console.log("pp> Login failed!");

            req.session.error = "Could not login, try again";
            done(null, user);
        }
    })
    .fail(function (error){
        console.log(error.body);

        req.session.error = "Could not login, try again";
    });
});

exports.signUp = new ppLocalStrategy({
    passReqToCallback   : true
}, function (req, username, password, done){
    console.log("pp> Signing up user");

    validate.recaptcha(req)
    .then(function (result){
        console.log(result);
    })
    .fail(function (err){
        console.log(err);
    });

    var password  = req.body.password   || "A";
    var password2 = req.body.password2  || "A";
    var username  = req.body.username   || "A";
    var email     = req.body.email      || "A";

    var passLength = password.length;
    var userLength = username.length;

    if (passLength >= 7 && userLength >= 3) {
        if (password == password2) {
            controls.localReg(username, password, email)
            .then(function (user){
                if (user) {
                    console.log("pp> NEW USER: " + user.name);

                    req.session.notice = "Please check your email in order to activate your account!";
                    return done(null, user);
                } else {
                    console.log("pp> Could not create new user!");

                    req.session.error = "That username or email is already in use, please try a different one.";
                    return (null, false);
                }
            })
            .fail(function (err){
                console.log(err);
                return done(null, false, {
                    error : err
                });
            });
        } else {
            console.log("pp> Passwords do not match!");

            req.session.error = "Passwords do not match!"
            return done(null, false);
        }
    } else if (userLength < 3) {
        console.log("pp> Username too short: " + username);

        req.session.error = "Username needs to be longer than 2 characters."
        return done(null, false);
    } else if (passLength < 7) {
        console.log("pp> Password is only " + passLength + " characters long.");

        req.session.error = "Password needs to be longer than 6 characters";
        return done(null, false);
    }
});

exports.signOut = function (req, res){
    var currentUser = req.user;

    console.log("pp> Logging out: " + currentUser.name);
    req.logout();

    //Remove user from online users
    controls.sleepUser(currentUser.name);

    req.session.notice = currentUser.name + " has been logged out.";
    res.redirect('/');
};

exports.verifyAccount = function (req, res){
    var id = req.query.id;
    var username = req.query.username;
    console.log(id + " : " + username);

    validate.verify(id, username)
    .then(function (status) {
        console.log(status);
        if (status == "Your account has been validated") {
            req.session.success = status;
            res.redirect('/');
        } else {
            req.session.error = "Could not verify your account. Try again.";
            res.render('error', { error : status });
        }
    })
    .fail(function (error) {
        console.log(error);
    });
}
