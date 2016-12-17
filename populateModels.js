/**
 * This script inserts models one at a time.
 * The reason for doing it one at a time is... well, my VPS has basically no RAM.
 * At some point, maybe I'll split this script up. Or not. Ahaha.
 */

// XML parsing utilities
const parseString = require("xml2js").parseString;
const fs = require("fs");

// DB models
const Creature = require("./models/Creature");
const Spell = require("./models/Spell");
const Class = require("./models/Class");
const Feature = require("./models/Feature");
const Feat = require("./models/Feat");
const Race = require("./models/Race");
const Trait = require("./models/Trait");
// DB
const mongoose = require("mongoose");
var cr = require("./config.json");
mongoose.Promise = global.Promise;
mongoose.connect(cr.db_endpoint);
const db = mongoose.connection;

// XML dataset
const compendiums = new Map();
compendiums.set("bestiary", "./assets/5e/Bestiary Compendium 2.0.1.xml");
compendiums.set("spells", "./assets/5e/Spells Compendium 1.2.1.xml");
compendiums.set("character", "./assets/5e/Character Compendium 2.0.0.xml");

db.once("open", async function() {
	console.log("Connected to db.");
	insertEverything();
});

async function insertEverything(){
	console.log("Dropping bestiary.");
	console.log(await new Promise((resolve, reject) => {
		Creature.remove({}, function(err) { // eslint-disable-line
			if(err){
				reject("Error dropping Creature table: " + err);
			}
			console.log("Bestiary dropped");
			try{
				insertBestiary();
				resolve("Successfully inserted bestiary.");
			}
			catch(e){
				reject(e);
			}
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping spells.");
		Spell.remove({}, function(err) {
			if(err){
				reject("Error dropping Spell table: " + err);
			}
			console.log("Spells dropped.");
			try{
				insertSpells();
				resolve("Finished inserting spells.");
			}
			catch(e){
				reject(e);
			}
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping classes.");
		Class.remove({}, function(err) {
			if(err){
				reject("Error dropping Class table: " + err);
			}
			resolve("Classes dropped.");
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping features.");
		Feature.remove({}, function(err) {
			if(err){
				reject("Error dropping Feature table: " + err);
			}
			resolve("Features dropped.");
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping feats.");
		Feat.remove({}, function(err) {
			if(err){
				reject("Error dropping Feat table: " + err);
			}
			resolve("Feats dropped.");
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping races.");
		Race.remove({}, function(err) {
			if(err){
				reject("Error dropping Race table: " + err);
			}
			resolve("races dropped.");
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping traits.");
		Trait.remove({}, function(err) {
			if(err){
				reject("Error dropping Trait table: " + err);
			}
			resolve("Traits dropped.");
		});
	}));

	await insertCharacterCompendium();
	console.log("Finished inserting Character compendium.");
}
function expandSchool(acronym){
	switch(acronym){
		case "A":
			return "abjuration";
		case "C":
			return "conjuration";
		case "D":
			return "divination";
		case "EN":
			return "enchantment";
		case "EV":
			return "evocation";
		case "I":
			return "illusion";
		case "N":
			return "necromancy";
		case "T":
			return "transmutation";
		default:
			return "";
	}
}

async function insertCharacterCompendium(){
	let tasks = [];
	parseString(fs.readFileSync(compendiums.get("character")), (err, result) => {
		result.compendium.race.forEach(r => {
			if(!r.name){
				throw new Error("Race with no name parsed.");
			}
			if(r.trait){
				r.trait.forEach((t) => {
					tasks.push(new Trait({
						name: t.name,
						race: r.name,
						text: t.text
					}).save());
				});
				r.trait = r.trait.map(t => t.name[0]);
				console.log(r.trait);
			}
			tasks.push(new Race(r).save());
		});

		result.compendium.feat.forEach(f => {
			let feat = {};
			if(!f.name){
				throw new Error("Feat with no name parsed.");
			}
			feat.name = f.name;
			if(f.modifier){
				feat.modifier = {
					text: f.modifier[0]._,
					category: f.modifier[0].$.category
				};
			}
			if(f.prerequisite){
				feat.prerequisite = f.prerequisite;
			}
			feat.text = f.text.join("\n");
			tasks.push(new Feat(feat).save());
		});

		result.compendium.class.forEach(c => {
			let characterClass = {};
			if(!c.name){
				throw new Error("Class with no name parsed.");
			}
			characterClass.name = c.name;
			characterClass.hd = c.hd;
			if(c.proficiency){
				characterClass.proficiency = c.proficiency;
			}
			if(c.spellAbility){
				characterClass.spellAbility = c.spellAbility;
			}
			characterClass.levels = [];

			c.autolevel.forEach(l => {
				let lvl = {};
				lvl.level = l.$.level;

				if(l.slots){
					lvl.slots = l.slots;
				}

				if(l.feature){
					lvl.features = [];
					l.feature.forEach(feature => {
						lvl.features.push(feature.name);
						tasks.push(new Feature({
							name: feature.name,
							class: c.name,
							level: lvl.level,
							text: feature.text.join("\n")
						}).save());
					});
				}
				characterClass.levels.push(lvl);
			});

			tasks.push(new Class(characterClass).save());
		});
	});
	return await Promise.all(tasks);
}
async function insertSpells(){
	let tasks = [];
	parseString(fs.readFileSync(compendiums.get("spells")), (err, result) => {
		result.compendium.spell.forEach(s => {
			let spell = {};
			if(!s.name){
				throw new Error("Spell with no name parsed.");
			}
			spell.name = s.name;
			spell.level = s.level;
			spell.school = expandSchool(s.school[0]);
			if(s.ritual){
				spell.ritual = s.ritual;
			}
			spell.castingTime = s.time;
			spell.range = s.range;
			spell.components = s.components;
			spell.duration = s.duration;
			spell.classes = s.classes;
			spell.description = s.text.join("\n");
			if(s.rolls){
				spell.rolls = s.roll;
			}
			tasks.push(new Spell(spell).save());
		});
	});
	return await Promise.all(tasks);
}
async function insertBestiary(){
	let tasks = [];
	parseString(fs.readFileSync(compendiums.get("bestiary")), (err, result) => {
		result.compendium.monster.forEach(m => {
			let monster = {};
			if(!m.name){
				throw new Error("Monster with no name parsed.");
			}
			monster.name = m.name;
			if(m.size){
				monster.size = m.size;
			}
			if(m.size){
				monster.size = m.size;
			}
			if(m.type){
				monster.type = m.type;
			}
			if(m.alignment){
				monster.alignment = m.alignment;
			}
			if(m.ac){
				monster.ac = m.ac;
			}
			if(m.hp){
				monster.hp = m.hp;
			}
			if(m.speed){
				monster.speed = m.speed;
			}
			if(m.str){
				monster.str = m.str;
			}
			if(m.dex){
				monster.dex = m.dex;
			}
			if(m.con){
				monster.con = m.con;
			}
			if(m.int){
				monster.int = m.int;
			}
			if(m.wis){
				monster.wis = m.wis;
			}
			if(m.cha){
				monster.cha = m.cha;
			}
			if(m.save){
				monster.saves = m.save;
			}
			if(m.skill){
				monster.skill = m.skill;
			}
			if(m.resist){
				monster.resist = m.resist;
			}
			if(m.vulnerable){
				monster.vulnerable = m.vulnerable;
			}
			if(m.immune){
				monster.immune = m.immune;
			}
			if(m.conditionImmune){
				monster.conditionImmune = m.conditionImmune;
			}
			if(m.senses){
				monster.senses = m.senses;
			}
			if(m.passive){
				monster.passive = m.passive;
			}
			if(m.cr){
				monster.cr = m.cr;
			}
			if(m.spells){
				monster.spells = m.spells;
			}

			if(m.trait){
				monster.traits = [];
				m.trait.forEach(t => {
					let trait = {
						name: t.name,
						text: Array.isArray(t.text) ? t.text.join("\n") : t.text
					};
					if(t.attack){
						trait.attack = Array.isArray(t.attack) ? t.attack.join("\n") : t.attack;
					}
					monster.traits.push(trait);
				});
			}

			if(m.action){
				monster.actions = [];
				if(Array.isArray(m.action)){
					m.action.forEach(t => {
						let action = {
							name: t.name,
							text: Array.isArray(t.text) ? t.text.join("\n") : t.text
						};
						if(t.attack){
							action.attack = Array.isArray(t.attack) ? t.attack.join("\n") : t.attack;
						}
						monster.actions.push(action);
					});
				}
				else{
					let action = {
						name: m.action.name,
						text: Array.isArray(m.action.text) ? m.action.text.join("\n") : m.action.text
					};
					if(m.action.attack){
						action.attack = Array.isArray(m.action.attack) ? m.action.attack.join("\n") : m.action.attack;
					}
					monster.actions.push(action);
				}

			}

			if(m.legendary){
				monster.legendary = [];
				m.legendary.forEach(t => {
					let legendary = {
						name: t.name,
						text: Array.isArray(t.text) ? t.text.join("\n") : t.text
					};
					if(t.attack){
						legendary.attack = Array.isArray(t.attack) ? t.attack.join("\n") : t.attack;
					}
					monster.legendary.push(legendary);
				});
			}
			tasks.push(new Creature(monster).save());
		});
	});
	return await Promise.all(tasks);
}
