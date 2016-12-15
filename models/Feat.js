const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	class: String,
	prerequisite: String,
	modifier: {
		text: String,
		category: String
	},
	text: String
});

module.exports = mongoose.model("Feat", schema);
