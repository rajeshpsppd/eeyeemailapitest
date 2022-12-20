var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var schema = new Schema(
	{
	operator: String,
	authUrl: String,
	authKey: String,
    orgId: String,
    userId: String,
	server: String,
	port: String,
	key: String,
	secret: String,
	accessToken: String
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Token', schema);
