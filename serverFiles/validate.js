var nodemailer = require('nodemailer');
var Q = require('q');

var config = require('../serverFiles/config.js');

var dbConnection = require('orchestrate');
dbConnection.ApiEndPoint = "api.ctl-gb3-a.orchestrate.io";
var db = dbConnection(config.db);

var transporter = nodemailer.createTransport({
	host: "mail.hadesbroadband.co.uk",
	port: 26,
	secure: false,
	tls: {
		rejectUnauthorized: false
	},
	auth: {
		user: "noreply@hadesbroadband.co.uk",
		pass: ""
	}
});

var rand;
var link;

exports.email = function (email, username){
	rand = Math.floor(Math.random() * 100000);
	link = "http://address/verify?id=" + rand + "&username=" + username;

	console.log(">>>>User account verify at: " + rand);


	transporter.sendMail({
		from : "noreply@hadesbroadband.co.uk",
		to : email,
		subject : "Email Activation",
		html : "Hello,<br> Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>"
	}, function (error, res){
		if(error){
			console.log(error);
		}else{
			console.log(">>>>Message sent: " + res.accepted);
		}

		transporter.close();
	});

	return rand;
};

exports.password = function (pass1, pass2){
	if (pass1 == pass2) {
		return true;
	} else {
		return "Passwords do not match!";
	}
};

exports.verify = function (vID, username){
	var defer = Q.defer();

	db.get('local-users', username)
	.then(function (result){
		var user = result.body;
		console.log(user);

		var verificationCode = user['validationID'];
		if (verificationCode = vID) {
			user.valid = true;

			db.put('local-users', username, user)
			.then(function (){
				defer.resolve("Your account has been validated");
			})
			.fail(function (err){
				console.log(">>>>" + username + "'s account has not able to be validated!");
				console.log(err);
				defer.resolve("Your account was not validated");
			})
		} else {
			defer.reject("Invalid verification code!");
		}
	})
	.fail(function (err){
		console.log(">>>>User: " + username + " could not be found!");
		console.log(err);
		defer.reject("Your account could not be found!");
	});

	return defer.promise;
}