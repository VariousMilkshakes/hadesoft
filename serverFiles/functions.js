var bcrypt = require('bcryptjs');
var Q = require('q');
var dateFormat = require('date-format');

var config = require('../serverFiles/config.js');
var validate = require('../serverFiles/validate.js');

var dbConnection = require('orchestrate');
dbConnection.ApiEndPoint = "api.ctl-gb3-a.orchestrate.io";
var db = dbConnection(config.db);

exports.localReg = function (username, password, email){
	var deferred = Q.defer();
	var hash = bcrypt.hashSync(password, 8);

	db.get(config.dbLocal, username)
	.then(function (result){
		console.log(">>>Sign up with existing username: " + username);
		deferred.resolve(false);
	})
	.fail(function (result){

		var vID = validate.email(email, username);
		var time = new Date();
		var ISO8601B = dateFormat.asString('yyyyMMddThhmmssZ');

		var user = {
			"name" : username,
			"password" : hash,
			"email" : email,
			"valid" : false,
			"start" : ISO8601B,
			"validationID" : vID,
			"avatar" : config.defaultAvatar
		};

		console.log(">>>New user sign up: " + username);
		console.log(result.body);

		if (result.body.message == "The requested items could not be found.") {
			console.log(">>>" + username + " not in use!");

			db.put(config.dbLocal, username, user)
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

	db.get(config.dbLocal, username)
	.then(function (result){
		console.log(">>>" + username + " exisits");
		console.log(">>>" + username + ", valid : " + result.body.valid);

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

exports.sleepAllUsers = function (){
	db.deleteCollection(config.dbOnline);
	console.log(">>>ALL ONLINE USERS HAVE BEEN CLEARED");
}

exports.activateUser = function (user){
	var id = user.name;
	var avatar = user.avatar;
	var time = new Date();
	var ISO8601B = dateFormat.asString('yyyyMMddThhmmssZ');

	var activeUser = {
		"name" : id,
		"avatar" : avatar,
		"activeSince" : ISO8601B
	};

	db.put(config.dbOnline, id, activeUser)
	.then(function (result) {
		console.log(">>>User: " + id + " is now ACTIVE");
	})
	.fail(function (error) {
		console.log(">>>Failed to add " + id + " to active users");
		console.log(">>>" + error);
	});
}

exports.sleepUser = function (user){
	db.remove(config.dbOnline, user)
	.then(function (result){
		console.log(">>>" + user + " has become inactive");
	})
	.fail(function (error){
		console.log(">>>" + user + " could not be made inactive!");
		console.log(error);
	})
}