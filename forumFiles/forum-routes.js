var config = require('../serverFiles/config.js');
var functions = require('../serverFiles/functions.js');
var styx = require('../forumFiles/styx.js');

var dateFormat = require('date-format');
var router = require('express').Router();
var nyx = require('nyxml');

var dbConnection = require('orchestrate');
dbConnection.ApiEndPoint = "api.ctl-gb3-a.orchestrate.io";
var db = dbConnection(config.db);


//User new post
router.post('/forum/new_post', function (req, res, next){
    var title = req.body.title;
    var postFormat = req.body.format;
    var post = req.body.postContent;
    var date = functions.currentISTime();
    var key = req.user.name + date;
    console.log("f# post: " + key + " t: " + title + " in " + postFormat + " = " + post + " @ " + date);

    var log = {
        "action": "new-post",
        "key": key,
        "content": title,
        "date": date
    };

    if (postFormat == "NYX") {
        nyx.toHtml(post, true)
        .then(function (result){
            console.log(result);
            post = result;
            
        })
        .fail(function (error){
            console.log(error);
        });
    }

    db.put(config.dbForum, key, {
        "key": key,
        "title": title,
        "type": postFormat,
        "time": date,
        "post": post,
        "editor": req.user.name
    })
    .then(function (result){
        console.log(log);
        console.log("f# User: " + req.user.name + " posted " + title);
        functions.logActivity(req.user.name, 'post', log);
        res.redirect('/');
    })
    .fail(function (err){
        console.log("f# Post Error:");
        console.log(err);
        res.redirect('/');
    });
});

module.exports = router;
