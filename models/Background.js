const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	proficiency: String,
	trait: [{
		name: String,
		text: String
	}]
});

module.exports = mongoose.model("Background", schema);
