const request = require("request-promise-native");

// DB models
const Creature = require("./models/Creature");
const Spell = require("./models/Spell");
const Class = require("./models/Class");
const Feature = require("./models/Feature");
const Feat = require("./models/Feat");
const Race = require("./models/Race");
const Background = require("./models/Background");
const Item = require("./models/Item");

// DB
const mongoose = require("mongoose");
var cr = require("./config.json");
mongoose.Promise = global.Promise;
mongoose.connect(cr.db_endpoint);
const db = mongoose.connection;

const BASE_URL = "https://astranauta.github.io";

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
				insertBestiary().then(resolve("Successfully inserted bestiary."));
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
				insertSpells().then(resolve("Finished inserting spells."));
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
			console.log("Classes dropped.");
			console.log("Dropping features.");
			Feature.remove({}, function(err) {
				if(err){
					reject("Error dropping Feature table: " + err);
				}
				console.log("Features dropped.");
				try{
					insertClasses().then(resolve("Finished inserting classes."));
				}
				catch(e){
					reject(e);
				}
			});

		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping feats.");
		Feat.remove({}, function(err) {
			if(err){
				reject("Error dropping Feat table: " + err);
			}
			console.log("Feats dropped.");
			try{
				insertFeats().then(resolve("Finished inserting feats."));
			}
			catch(e){
				reject(e);
			}
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping races.");
		Race.remove({}, function(err) {
			if(err){
				reject("Error dropping Race table: " + err);
			}
			console.log("Races dropped.");
			try{
				insertRaces().then(resolve("Finished inserting races."));
			}
			catch(e){
				reject(e);
			}
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping backgrounds.");
		Background.remove({}, function(err) {
			if(err){
				reject("Error dropping Background table: " + err);
			}
			console.log("Backgrounds dropped.");
			try{
				insertBackgrounds().then(resolve("Finished inserting backgrounds."));
			}
			catch(e){
				reject(e);
			}
		});
	}));

	console.log(await new Promise((resolve, reject) => {
		console.log("Dropping items.");
		Item.remove({}, function(err) {
			if(err){
				reject("Error dropping Item table: " + err);
			}
			console.log("Items dropped.");
			try{
				insertItems().then(resolve("Finished inserting items."));
			}
			catch(e){
				reject(e);
			}
		});
	}));
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
function expandItemType(type){
	switch(type){
		case "$":
			return "Trade Goods";
		case "G":
			return "Adventuring Gear";
		case "A":
			return "Ammunition";
		case "M":
			return "Melee Weapon";
		case "R":
			return "Ranged Weapon";
		case "SIMW":
			return "Simple Weapon";
		case "MARW":
			return "Martial Weapon";
		case "GUN":
			return "Firearm";
		case "LA":
			return "Light Armour";
		case "MA":
			return "Medium Armour";
		case "HA":
			return "Heavy Armour";
		case "S":
			return "Shield";
		case "W":
			return "Wondrous Item";
		case "P":
			return "Potion";
		case "ST":
			return "Staff";
		case "RD":
			return "Rod";
		case "RG":
			return "Ring";
		case "WD":
			return "Wand";
		case "SC":
			return "Scroll";
		case "AT":
			return "Artisan Tool";
		case "INS":
			return "Instrument";
		case "SCF":
			return "Spellcasting Focus";
		case "GS":
			return "Gaming Set";
		case "T":
			return "Tool";
		case "EXP":
			return "Explosive";
		case "VEH":
			return "Vehicle";
		case "TAH":
			return "Tack and Harness";
		case "MNT":
			return "Mount";
		case "TG":
			return "Trade Good";
		default:
			console.log(type);
			console.log(type.length);
			throw new Error(`Unknown type: ${type}`);
	}
}

function expandWeaponProperty(property){
	switch(property){
		case "A":
			return "ammunition";
		case "LD":
			return "loading";
		case "L":
			return "light";
		case "F":
			return "finesse";
		case "T":
			return "thrown";
		case "H":
			return "heavy";
		case "R":
			return "reach";
		case "2H":
			return "two-handed";
		case "V":
			return "versatile";
		case "S":
			return "special";
		case "RLD":
			return "reload";
		case "BF":
			return "burst fire";
		default:
			throw new Error(`Unknown weapon property: ${property}`);
	}
}

function expandDamageType(type){
	switch(type){
		case "S":
			return "slashing";
		case "B":
			return "bludgeoning";
		case "P":
			return "piercing";
		case "R":
			return "radiant";
		case "N":
			return "necrotic";
		default:
			throw new Error(`Unknown damage type: ${type}`);
	}
}

async function insertBestiary(){
	let response = await request(`${BASE_URL}/data/bestiary.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in bestiary.\n${err}`);
	}

	let tasks = [];
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
	return Promise.all(tasks);
}

async function insertSpells(){
	let response = await request(`${BASE_URL}/data/spells.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in spells.\n${err}`);
	}

	let tasks = [];
	result.compendium.spell.forEach(s => {
		let spell = {};
		if(!s.name){
			throw new Error("Spell with no name parsed.");
		}
		spell.name = s.name;
		spell.level = s.level;
		spell.school = expandSchool(s.school);
		if(s.ritual){
			spell.ritual = s.ritual;
		}
		spell.castingTime = s.time;
		spell.range = s.range;
		spell.components = s.components;
		spell.duration = s.duration;
		spell.classes = s.classes;
		if(typeof(s.text) === "string"){
			spell.description = s.text;
		}
		else{
			spell.description = s.text.join("\n");
		}

		if(s.rolls){
			spell.rolls = s.roll;
		}
		tasks.push(new Spell(spell).save());
	});
	return Promise.all(tasks);
}

async function insertClasses(){
	let response = await request(`${BASE_URL}/data/classes.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in classes.\n${err}`);
	}

	let tasks = [];
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
			lvl.level = l._level;

			if(!l.feature){
				return;
			}

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

			characterClass.levels.push(lvl);
		});

		tasks.push(new Class(characterClass).save());
	});
	return Promise.all(tasks);
}

async function insertFeats(){
	let response = await request(`${BASE_URL}/data/feats.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in feats.\n${err}`);
	}
	let tasks = [];

	result.compendium.feat.forEach(f => {
		let feat = {};
		if(!f.name){
			throw new Error("Feat with no name parsed.");
		}
		feat.name = f.name;
		if(f.source){
			feat.source = f.source;
		}
		if(f.prerequisite){
			feat.prerequisite = f.prerequisite;
		}
		feat.text = f.text.join("\n");
		tasks.push(new Feat(feat).save());
	});
	return Promise.all(tasks);
}

async function insertRaces(){
	let response = await request(`${BASE_URL}/data/races.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in races.\n${err}`);
	}

	let tasks = [];
	result.compendium.race.forEach(r => {
		if(!r.name){
			throw new Error("Race with no name parsed.");
		}
		tasks.push(new Race(r).save());
	});
	return Promise.all(tasks);
}

async function insertBackgrounds(){
	let response = await request(`${BASE_URL}/data/backgrounds.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in backgrounds.\n${err}`);
	}

	let tasks = [];
	result.compendium.background.forEach(b => {
		if(!b.name){
			throw new Error("Background with no name parsed.");
		}
		tasks.push(new Background(b).save());
	});
	return Promise.all(tasks);
}

async function insertItems(){
	let response = await request(`${BASE_URL}/data/items.json`);
	let result;
	try{
		result = JSON.parse(response.match(/.*({[\w\W]*)/)[1]);
	}
	catch(err){
		console.log(`Invalid JSON in items.\n${err}`);
	}

	let tasks = [];
	result.compendium.item.forEach(i => {
		if(!i.name){
			throw new Error("Item with no name parsed.");
		}

		i.text = i.text.join("\n");
		let types = i.type.split(",");
		if(types.includes("LA")){
			i.ac += " + DEX";
		}
		else if(types.includes("MA")){
			i.ac += " + DEX (max 2)";
		}

		// The fuck. There's items with blank STR requirements.
		if(i.strength === " "){
			delete i.strength;
		}

		i.type = types.reduce((acc, val, i, arr) => {
			return (acc + expandItemType(val) + (i < arr.length - 1 ? ", " : ""));
		}, "");

		if(i.property){
			i.property = i.property.split(",").map(p => expandWeaponProperty(p)).join(", ");
		}
		if(i.dmgType){
			i.dmgType = expandDamageType(i.dmgType);
		}
		tasks.push(new Item(i).save());
	});
	return Promise.all(tasks);
}
