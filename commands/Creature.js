const SearchCommand = require("../types/SearchCommand");
const CreatureModel = require("../models/Creature");
const Discord = require("discord.js");

module.exports = class Creature extends SearchCommand{
	constructor(client){
		super(client, {
			name: "creature",
			help: "Fetches a creature by name.",
			category: "5e",
			helpArgs: "<Creature Name>",
			elevation: 0,
			timeout: 15000
		});

		this._attachFieldToEmbed = function(name, data, embed){
			embed = embed.addField("\u200b", `__**${name}**__`);
			data.forEach((element) => {
				if(element.text.length + (element.attack ? element.attack.length : 0) > 1024){
					let text = element.text;
					text = text.concat(`${element.attack ? "\n**" + element.attack + "**" : ""}`);
					let stringBuilder = [];

					while(text.length > 900){	// TODO: figure out why this doesn't split correctly, factoring in the concat above
						let splitIndex = text.lastIndexOf("\n", 900);
						stringBuilder.push(text.substring(0, splitIndex));
						text = text.substring(splitIndex + 1);
					}
					stringBuilder.push(text);

					embed = embed.addField(element.name, stringBuilder.shift());
					stringBuilder.forEach((string) => {
						embed = embed.addField(`${element.name}, continued. . .`, `${string}${element.attack ? "\n**" + element.attack + "**" : ""}`);
					});
				}
				else if(element.text.length + (element.attack ? element.attack.length : 0) > 0){
					embed = embed.addField(element.name, `${element.text}${element.attack ? "\n**" + element.attack + "**" : ""}`);
				}
			});
			return embed;
		};

		this._getModifierFor = function(attribute){
			let modifier = Math.floor(parseInt(attribute) / 2) - 5;
			if(modifier >= 0){
				return `+${modifier}`;
			}
			else{
				return `${modifier}`; // Integer to string conversion
			}
		};
		this._crToExp = function(cr){
			switch(cr){
				case "0":
					return "10";
				case "1/8":
					return "25";
				case "1/4":
					return "50";
				case "1/2":
					return "100";
				case "1":
					return "200";
				case "2":
					return "450";
				case "3":
					return "700";
				case "4":
					return "1,100";
				case "5":
					return "1,800";
				case "6":
					return "2,300";
				case "7":
					return "2,900";
				case "8":
					return "3,900";
				case "9":
					return "5,000";
				case "10":
					return "5,900";
				case "11":
					return "7,200";
				case "12":
					return "8,400";
				case "13":
					return "10,000";
				case "14":
					return "11,500";
				case "15":
					return "13,000";
				case "16":
					return "15,000";
				case "17":
					return "18,000";
				case "18":
					return "20,000";
				case "19":
					return "22,000";
				case "20":
					return "25,000";
				case "21":
					return "33,000";
				case "22":
					return "41,000";
				case "23":
					return "50,000";
				case "24":
					return "62,000";
				case "30":
					return "155,000";
				default:
					return "";
			}
		};
	}
	async execute(msg, args){
		let prefix;
		if(msg.guild){
			prefix = await this.client.fetchPrefix(msg.guild.id);
		}
		else{
			prefix = "";
		}
		if(!args){
			return msg.reply(`invalid command; please specify a creature.\nProper usage: \`${prefix}${this.name} aboleth\``);
		}
		let toEdit = await msg.reply("fetching your creature. . .");
		let creatures = await CreatureModel.find({name: new RegExp(args.join(" "), "i")});
		if(!creatures || creatures.length === 0){
			return toEdit.edit("Unable to find your creature. Sorry!");
		}

		let result;
		if(creatures.length > 1){
			try{
				result = await super.disambiguate(toEdit, msg.author, "creature", creatures, "name");
			}
			catch(err){
				return toEdit.edit(err);
			}
		}
		else{
			result = creatures[0];
		}

		let description = [];
		description.push(`*${result.size} ${result.type} // ${result.alignment}*\n`);
		description.push(`**Armor Class** ${result.ac}\n**Hit Points** ${result.hp}\n**Speed** ${result.speed}\n`);
		let attributes = [];
		attributes.push(`**STR** ${result.str} (${this._getModifierFor(result.str)})`);
		attributes.push(`**DEX** ${result.dex} (${this._getModifierFor(result.dex)})`);
		attributes.push(`**CON** ${result.con} (${this._getModifierFor(result.con)})`);
		attributes.push(`**INT** ${result.int} (${this._getModifierFor(result.int)})`);
		attributes.push(`**WIS** ${result.wis} (${this._getModifierFor(result.wis)})`);
		attributes.push(`**CHA** ${result.cha} (${this._getModifierFor(result.cha)})`);
		description.push(attributes.join("; "));
		if(result.saves){
			description.push(`**Saving Throws** ${result.saves}`);
		}
		if(result.skill){
			description.push(`**Skills** ${result.skill}\n`);
		}
		if(result.vulnerable){
			description.push(`**Damage Vulnerabilities** ${result.vulnerable}`);
		}
		if(result.immune){
			description.push(`**Damage Immunities** ${result.immune}`);
		}
		if(result.conditionImmune){
			description.push(`**Condition Immunities** ${result.conditionImmune}`);
		}

		description.push(`**Senses** ${result.senses? result.senses + ", " : ""}passive Perception ${result.passive}`);

		if(result.languages){
			description.push(result.languages);
		}
		description.push(`**Challenge** ${result.cr} (${this._crToExp(result.cr)} XP)`);


		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43)
											.setDescription(description.join("\n"));

		// Attach trait fields
		if(result.traits && result.traits.length > 0){
			embed = this._attachFieldToEmbed("Traits", result.traits, embed);
		}

		if(result.spells){
			embed = embed.addField("Known Spells", result.spells);
		}

		if(result.actions && result.actions.length > 0){
			embed = this._attachFieldToEmbed("Actions", result.actions, embed);
		}

		if(result.legendary && result.legendary.length > 0){
			embed = this._attachFieldToEmbed("Legendary Actions", result.legendary, embed);
		}

		return toEdit.edit("", {embed: embed});
	}
};
