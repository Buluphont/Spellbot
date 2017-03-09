const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	prerequisite: String,
	source: String,
	text: String
});

module.exports = mongoose.model("Feat", schema);
