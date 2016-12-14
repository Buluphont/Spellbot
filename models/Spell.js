const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	type: String,
	castingTime: String,
	range: String,
	components: String,
	duration: String,
	description: String,
	url: String
});

module.exports = mongoose.model("Spell", schema);
