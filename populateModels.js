
const parseString = require("xml2js").parseString;
const fs = require("fs");
const Creature = require("./models/Creature");
const Spell = require("./models/Spell");
const mongoose = require("mongoose");
var cr = require("./config.json");

mongoose.Promise = global.Promise;
mongoose.connect(cr.db_endpoint);
const db = mongoose.connection;

const compendiums = new Map();
compendiums.set("bestiary", "./assets/5e/Bestiary Compendium 2.0.1.xml");
compendiums.set("spells", "./assets/5e/Spells Compendium 1.2.1.xml");
compendiums.set("character", "./assets/5e/Character Compendium 2.0.0.xml");

db.once("open", function() {
	console.log("Connected to db.");
	parseString(fs.readFileSync(compendiums.get("character")), (err, result) => {
		console.log(JSON.stringify(result.compendium.class));
		process.exit(0);
	});
	// console.log("Dropping bestiary.");
	// Creature.remove({}, function(cErr) { // eslint-disable-line
	// 	if(cErr){
	// 		return console.log("Error dropping Creature table: " + cErr);
	// 	}
	// 	console.log("Bestiary removed");
	// 	insertBestiary();
	//
	// 	console.log("Dropping spells.");
	// 	Spell.remove({}, function(sErr) {
	// 		if(sErr){
	// 			return console.log("Error dropping Spell table: " + sErr);
	// 		}
	// 		insertSpells();
	// 		console.log("Finished inserting spells.");
	// 		//process.exit(0);
	// 	});
	// });
});

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
async function insertSpells(){
	let tasks = [];
	parseString(fs.readFileSync(compendiums.get("spells")), (err, result) => {
		result.compendium.spell.forEach(s => {
			let spell = {};
			if(!s.name){
				return console.log("Spell with no name parsed.");
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
			console.log(spell.name);
			console.log(spell.school);
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
				return console.log("Monster with no name parsed.");
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
