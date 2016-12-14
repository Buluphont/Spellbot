const mongoose = require("mongoose");

var schema = new mongoose.Schema({
	name: String,
	size: String,
	type: String,
	alignment: String,
	ac: String,
	hp: String,
	speed: String,
	str: String,
	dex: String,
	con: String,
	int: String,
	wis: String,
	cha: String,
	saves: String,
	skill: String,
	resist: String,
	vulnerable: String,
	immune: String,
	conditionImmune: String,
	senses: String,
	passive: String,
	cr: String,
	spells: String,
	traits: [{
		name: String,
		text: String,
		attack: String
	}],
	actions: [{
		name: String,
		text: String,
		attack: String
	}],
	legendary: [{
		name: String,
		text: String,
		attack: String
	}]

});

module.exports = mongoose.model("Creature", schema);
