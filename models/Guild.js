const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	id: "string",
	prefix: "string"
});

module.exports = mongoose.model("Guild", schema);
