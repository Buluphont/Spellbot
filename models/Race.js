const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	size: String,
	speed: String,
	ability: String,
	proficiency: String,
	trait: [String]
});

module.exports = mongoose.model("Race", schema);
