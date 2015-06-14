var router = require('express').Router();

var config = require('../serverFiles/config.js');

router.get('/', function (req, res){
    var currentUser = req.user;

    res.render('index', {
        title           : config.site.title,
        titleMessage    : config.site.bannerMessage,
        onlineUsers     : false,
        user            : currentUser,
        menu            : true
    });
});

router.get('/sign-up', function (req, res){
    res.render('sign-up', {
        title   : 'Sign Up',
        menu    : false
    });
});

module.exports = router;
