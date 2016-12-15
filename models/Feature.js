const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	class: String,
	level: String,
	text: String
});

module.exports = mongoose.model("Feature", schema);
