const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	level: String,
	school: String,
	ritual: String,
	castingTime: String,
	range: String,
	components: String,
	duration: String,
	classes: String,
	description: String,
	rolls: [String]
});

module.exports = mongoose.model("Spell", schema);
