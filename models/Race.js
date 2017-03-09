const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	size: String,
	speed: String,
	ability: String,
	proficiency: String,
	trait: [{
		name: String,
		text: String
	}],
	source: String
});

module.exports = mongoose.model("Race", schema);
