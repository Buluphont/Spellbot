const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	hd: String,
	proficiency: String,
	spellAbility: String,
	levels: [{
		level: Number,
		slots: String,
		features: [String]
	}]
});

module.exports = mongoose.model("Class", schema);
