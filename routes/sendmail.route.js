'use strict';
const express = require('express'),
	nodemailer = require('nodemailer'),
	config = require('../config'),
	path = require('path'),
	mailRoute = express.Router();
const { getMaxListeners } = require('process');
let Token = require('../models/token');

mailRoute.get('/', (req, res, next) => {
	// http://localhost:2223/sendmail?apikey=rk&mailfrom=no-reply@eartheye.space&mailto=rama@eartheye.space&subject=Subject%20Tesing&mailbody=This%20is%20testing
	// to access http://localhost:2223/sendmail?apikey=rk&mailfrom=no-reply@eartheye.space&mailto=rksingh.rama@gmail.com&subject=Subject Tesing&mailbody=This is testing
	// http://localhost:2223/sendmail?apikey=rk&mailfrom=no-reply@eartheye.space&mailto=rksingh_rk@yahoo.com&subject=Subject%20Tesing&mailbody=This%20is%20testing
	let apikey = req.query.apikey;


	const mailObj = {
		sender: req.query.mailfrom,
		to: req.query.mailto, //["Person1 <person1@example.com>", "Person2 <person2@test.com>"]
		// cc:  req.query.mailcc,
		// bcc:  req.query.mailbcc,
		subject: req.query.subject,
		attachments: [{
			filename: 'logo.png',
			path: config.logo,
			cid: 'unique@cid'
		}],

		// text_body: "My test mail",
		html: ' <img style="width:250px;" src="cid:unique@cid">' + req.body.mailbody
	};

	mailbody = "<h1>This is testing email</h1>";
	if (apikey === undefined) {
		res.send({ message: 'Access key is missing' });
	} else {
		// console.log('get', apikey, emailfrom, emailto, subject, mailbody)
		// sendMail(email, sub, emailbody);
		// console.log(emailfrom, emailto, emailcc, emailbcc, subject, mailbody);
		sendmailBySMTP2go(res, mailObj);
		res.json({ message: 'Success' });
	}
});

mailRoute.post('/', (req, res, next) => {
	let apikey, emailParamas;
	apikey = req.headers.apikey;
	if (apikey === undefined) {
		res.send({ message: 'Access key is missing' });
	} else {
		emailParamas = req.body;
		const mailObj = {
			sender: emailParamas.mailfrom,
			to: emailParamas.mailto, //["Person1 <person1@example.com>", "Person2 <person2@test.com>"]
			// cc: ['rksingh.rama@gmail.com'],
			cc: emailParamas.mailcc,
			bcc: emailParamas.mailbcc,
			subject: emailParamas.subject,
			attachments: [{
				filename: 'logo.png',
				path: config.logo,
				cid: 'unique@cid'
			}],

			// text_body: "My test mail",
			html: ' <img style="width:250px;" src="cid:unique@cid">' + req.body.mailbody
			// text_body: "My test mail",
		};
		sendmailBySMTP2go(res, mailObj);
	}
});
// send email
// async function sendmailBySMTP2goNew (res, mailfrom, mailto, mailcc, mailbcc, subject, mailbody) {
// 	const query = {operator: 'smtp2go'};
// 	getSMTPKey((query), function(err, result) {
//         if(err){
//           console.log({ error: 'Something went wrong' });
//         } else {
// 			const mailObj = {
// 				// form: mailfrom,
// 				sender: mailfrom,
// 				to: mailto, //["Person1 <person1@example.com>", "Person2 <person2@test.com>"]
// 				// cc: mailcc,
// 				// bcc: mailbcc,
// 				subject: subject,
// 				// text: "My test mail",
// 				html: mailbody
// 			};
// 			// console.log(mailObj, smtpParams(result));
// 			nodemailer.createTransport(smtpParams(result)).sendMail(mailObj, function(error, response){
// 			if(error){
// 				console.log(error);
// 			}else{
// 				console.log("Message sent: " + JSON.stringify(response));
// 				res.send({message: 'Success'});
// 			}
// 			});
// 		}
// 	});
// }
function smtpParams(smtp) {
	const host = smtp.server,
		port = '587', //smtp.port,  //Alternative ports: 8025, 587, 80 or 25. TLS is available on the same ports.
		user = smtp.key,
		pass = smtp.secret,
		auth = { user, pass };
	return ({ host, port, auth });
}
// send email
async function sendmailBySMTP2go(res, mailObj) {
	// async function sendmailBySMTP2go(res, mailfrom, mailto, mailcc, mailbcc, subject, mailbody) {
	// const query = {operator: 'mailjet'};
	const query = { operator: 'smtp2go' };
	getSMTPKey((query), function (err, result) {
		if (err) {
			console.log({ error: 'Something went wrong' });
		} else {
			let transporter = nodemailer.createTransport({
				host: "mail.smtp2go.com",
				port: config.SMTPPort,  //Alternative ports: 8025, 587, 80 or 25. TLS is available on the same ports.
				auth: {
					user: 'archanaxminds',//config.SMTPUser,
					pass: 'KBh76H69hxTpNlqZ',//config.SMTPpwd
				}
			});
			// console.log(mailObj, transporter); //return
			transporter.sendMail(mailObj, function (error, response) {
				if (error) {
					console.log(error);
				} else {
					// console.log("Message sent: " + JSON.stringify(response));
				}
			});
		}
	});
}

var getSMTPKey = function (query, callback) {
	Token.findOne(query, function (error, result) {
		if (result) {
			callback(null, result);
		} else {
			callback(error);
		}
	})
}

module.exports = mailRoute;