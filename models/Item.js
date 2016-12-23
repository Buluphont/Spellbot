const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	type: String,
	weight: String,
	text: String,

	// Optionals
	value: String,
	rarity: String, // Do not use, included in text

	// Armour
	ac: String,
	strength: String,
	stealth: String,

	// Weapons
	dmg1: String,
	dmg2: String,
	dmgType: String,
	property: String
});

module.exports = mongoose.model("Item", schema);
