const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	size: String,
	speed: String,
	ability: {
		str: Number,
		dex: Number,
		con: Number,
		int: Number,
		wis: Number,
		cha: Number,
		choose: [{
			from:[String],
			count: Number,
			amount: Number
		}]
	},
	proficiency: String,
	trait: [{
		name: String,
		text: String
	}],
	source: String
});

module.exports = mongoose.model("Race", schema);
