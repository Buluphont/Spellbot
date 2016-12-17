const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	race: String,
	text: String
});

module.exports = mongoose.model("Trait", schema);
