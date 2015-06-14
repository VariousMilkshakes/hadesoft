var config = require('../serverFiles/config.js');

var Q = require('q');

var dbConnection = require('orchestrate');
dbConnection.ApiEndPoint = "api.ctl-gb3-a.orchestrate.io";
var db = dbConnection(config.db);

exports.getPosts = function (filter){
    var defer = Q.defer();

    console.log("f# Getting dem poztz");
    db.search(config.dbForum, filter)
    .then(function (result){
        var posts = result.body.results
        console.log("f# Posts: ");
        console.log(posts);
        defer.resolve(posts);
    });

    return defer.promise;
};

exports.viewPost = function (io, key){
    console.log("#f getting post: " + key);

    db.get('forum-posts', key)
    .then(function (result){
        console.log(result.body.title);
        io.emit('viewPost', result.body);
    })
    .fail(function (err){
        console.log(err);
        res.redirect('/');
    });
}

exports.updateFriend = function (username, friend){
    db.get(config.dbLocal, username)
    .then(function (result){
        var user = result.body;
        console.log("f# Adding " + friend + " to " + username);

        var newFriend = true;

        for (each in user.friends) {
            if (user.friends[each] == friend) {
                newFriend = false;
            }
        }

        if (newFriend) {
            if (typeof user.friends == undefined) {
                console.log('f# First friend!');
                user.friends = [friend];
            } else {
                console.log('f# Another friend.');
                user.friends.push(friend);
            }
        }

        db.put(config.dbLocal, username, user);
    })
    .fail(function (err){
        console.log("f# Cannot add friend:");
        console.log(err);
    })
}
