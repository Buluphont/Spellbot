
const parseString = require("xml2js").parseString;
const fs = require("fs");
const Creature = require("./models/Creature");
const mongoose = require("mongoose");
var cr = require("./config.json");

mongoose.Promise = global.Promise;
mongoose.connect(cr.db_endpoint);
const db = mongoose.connection;

const compendiums = new Map();
compendiums.set("bestiary", "./assets/5e/Bestiary Compendium 2.0.1.xml");

db.once("open", function() {
	console.log("Connected to db.");
	console.log("Dropping bestiary.");
	Creature.remove({}, function(err) { // eslint-disable-line
		console.log("Bestiary removed");
		insertBestiary();
	});
});

function insertBestiary(){
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
			new Creature(monster).save();
		});
	});
}
