var bcrypt = require('bcryptjs');
var Q = require('q');
var config = require('../serverFiles/config.js');
var dbConnection = require('orchestrate');
dbConnection.ApiEndPoint = "api.ctl-gb3-a.orchestrate.io";
var db = dbConnection(config.db);

exports.localReg = function (username, password){
	var deferred = Q.defer();
	var hash = bcrypt.hashSync(password, 8);
	var user = {
		"name" : username,
		"password" : hash,
		"avatar" : "./images/standing.png"
	};

	db.get('local-users', username)
	.then(function (result){
		console.log(">>>Sign up with existing username: " + username);
		deferred.resolve(false);
	})
	.fail(function (result){
		console.log(">>>New user sign up: " + username);
		console.log(result.body);

		if (result.body.message == "The requested items could not be found.") {
			console.log(">>>" + username + " not in use!");

			db.put('local-users', username, user)
			.then(function (){
				console.log(">>>Welcome: " + user.name);
				deferred.resolve(user);
			})
			.fail(function (err){
				console.log(">>>Failed to add user: " + err.body);
				deferred.reject(new Error(err.body));
			});
		} else { 
			deferred.reject(new Error(result.body));
		}
	});

	return deferred.promise;
};

exports.localAuth = function (username, password){
	var deferred = Q.defer();

	db.get('local-users', username)
	.then(function (result){
		console.log(">>>" + username + " exisits");

		var hash  = result.body.password;
		console.log(">>>Testing: " + hash);
		if (bcrypt.compareSync(password, hash)) {
			console.log(">>>Passwords match");
			deferred.resolve(result.body);
		} else {
			console.log(">>>Passwords don't match");
			deferred.resolve(false);
		}
	})
	.fail(function (result){
		if (result.body.message == "The requested items could not be found.") {
			console.log(">>>Could not find user: " + username);
			deferred.resolve(false);
		} else {
			deferred.reject(new Error(result));
		}
	});

	return deferred.promise;
}