var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
	service: 'Gmail',
	auth: {
		user: 'bn.gladstone@googlemail.com',
		pass: 'password'
	}
});

exports.email = function (email){
	transporter.sendMail({
		from: 'noreply@hadesoft.io',
		to: email,
		subject: 'Email Activation',
		text: 'Sign up complete!'
	});
};