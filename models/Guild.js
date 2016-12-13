const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	id: String,
	prefix: String,
	elevatedRoles: [String]
});

module.exports = mongoose.model("Guild", schema);
