const Command = require("../types/Command");
const CreatureModel = require("../models/Creature");
const Discord = require("discord.js");

const TIMEOUT = 15000;
module.exports = class Creature extends Command{
	constructor(client){
		super(client, {
			name: "creature",
			help: "Fetches a creature by name.",
			category: "5e",
			helpArgs: "<Creature Name>",
			elevation: 0
		});
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
	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let toEdit = await msg.reply("fetching your creature. . .");
		let creatures = await CreatureModel.find({name: new RegExp(args.join(" "), "i")});
		if(!creatures || creatures.length === 0){
			return toEdit.edit("Unable to find your creature. Sorry!");
		}

		let result;
		if(creatures.length > 1){
			let toSend = [];
			toSend.push("Found multiple creatures; please specify which creature you meant (maximum 10 results shown).");
			toSend.push(`This search will be automatically cancelled in ${TIMEOUT/1000} seconds.`);
			for(let i = 0; i < creatures.length && i < 10; i++){
				toSend.push(`${i + 1}. ${creatures[i].name}`);
			}
			toEdit = await toEdit.edit(toSend);
			let filter = (m) => {
				return m.author.id === msg.author.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= creatures.length;
			};
			try{
				let selection = await toEdit.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});
				result = creatures[parseInt(selection.first().content) - 1];
			}
			catch(err){
				console.log(err);
				return toEdit.edit("Query cancelled.");
			}
		}
		else{
			result = creatures[0];
		}

		let description = [];
		description.push(`*${result.size} ${result.type} // ${result.alignment}*\n`);
		description.push(`**Armor Class** ${result.ac}\n**Hit Points** ${result.hp}\n**Speed** ${result.speed}\n`);
		let attributes = [];
		attributes.push(`**STR** ${result.str} (${Math.floor(parseInt(result.str) / 2) - 5 >= 0 ? "+" : ""}${Math.floor(parseInt(result.str) / 2) - 5})`);
		attributes.push(`**DEX** ${result.dex} (${Math.floor(parseInt(result.dex) / 2) - 5 >= 0 ? "+" : ""}${Math.floor(parseInt(result.dex) / 2) - 5})`);
		attributes.push(`**CON** ${result.con} (${Math.floor(parseInt(result.con) / 2) - 5 >= 0 ? "+" : ""}${Math.floor(parseInt(result.con) / 2) - 5})`);
		attributes.push(`**INT** ${result.int} (${Math.floor(parseInt(result.int) / 2) - 5 >= 0 ? "+" : ""}${Math.floor(parseInt(result.int) / 2) - 5})`);
		attributes.push(`**WIS** ${result.wis} (${Math.floor(parseInt(result.wis) / 2) - 5 >= 0 ? "+" : ""}${Math.floor(parseInt(result.wis) / 2) - 5})`);
		attributes.push(`**CHA** ${result.cha} (${Math.floor(parseInt(result.cha) / 2) - 5 >= 0 ? "+" : ""}${Math.floor(parseInt(result.cha) / 2) - 5})`);
		description.push(attributes.join("; "));
		if(result.saves){
			description.push(`**Saving Throws** ${result.saves}`);
		}
		if(result.skills){
			description.push(`**Skills** ${result.skills}\n`);
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
			embed = embed.addField("\u200b", "__**Traits**__");
			result.traits.forEach((trait) => {
				if(trait.text.length + (trait.attack ? trait.attack.length : 0) > 1024){
					let text = trait.text;
					text = text.concat(`${trait.attack ? "\n**" + trait.attack + "**" : ""}`);
					let stringBuilder = [];

					while(text.length > 1024){
						let splitIndex = text.lastIndexOf("\n", 1024);
						stringBuilder.push(text.substring(0, splitIndex));
						text = text.substring(splitIndex + 1);
					}
					stringBuilder.push(text);
					embed = embed.addField(trait.name, stringBuilder.shift());
					stringBuilder.forEach((string) => {
						embed = embed.addField(`${trait.name} continued. . .`, `${string}${trait.attack ? "\n**" + trait.attack + "**" : ""}`);
					});
				}
				else if(trait.text.length + (trait.attack ? trait.attack.length : 0) > 0){
					embed = embed.addField(trait.name, `${trait.text}${trait.attack ? "\n**" + trait.attack + "**" : ""}`);
				}
			});
		}

		if(result.spells){
			embed = embed.addField("Known Spells", result.spells);
		}

		// Attach action fields
		if(result.actions && result.actions.length > 0){
			embed = embed.addField("\u200b", "__**Actions**__");
			result.actions.forEach((action) => {
				if(action.text.length + (action.attack ? action.attack.length : 0) > 1024){
					let text = action.text;
					text = text.concat(`${action.attack ? "\n**" + action.attack + "**" : ""}`);
					let stringBuilder = [];
					while(text.length > 1024){
						let splitIndex = text.lastIndexOf("\n", 1024);
						stringBuilder.push(text.substring(0, splitIndex));
						text = text.substring(splitIndex + 1);
					}
					stringBuilder.push(text);
					embed = embed.addField(action.name, stringBuilder.shift());
					stringBuilder.forEach((string) => {
						embed = embed.addField(`${action.name} continued. . .`, string);
					});
				}
				else if(action.text.length + (action.attack ? action.attack.length : 0) > 0){
					embed = embed.addField(action.name, `${action.text}${action.attack ? "\n**" + action.attack + "**" : ""}`);
				}
			});
		}

		if(result.legendary && result.legendary.length > 0){
			embed = embed.addField("\u200b", "__**Legendary Actions**__");
			result.legendary.forEach((legendary) => {
				if(legendary.text.length + (legendary.attack ? legendary.attack.length : 0) > 1024){
					let text = legendary.text;
					text = text.concat(`${legendary.attack ? "\n**" + legendary.attack + "**" : ""}`);
					let stringBuilder = [];

					while(text.length > 1024){
						let splitIndex = text.lastIndexOf("\n", 1024);
						stringBuilder.push(text.substring(0, splitIndex));
						text = text.substring(splitIndex + 1);
					}

					stringBuilder.push(text);
					embed = embed.addField(legendary.name, stringBuilder.shift());
					stringBuilder.forEach((string) => {
						embed = embed.addField(`${legendary.name} continued. . .`, `${string}${legendary.attack ? "\n**" + legendary.attack + "**" : ""}`);
					});
				}
				else if(legendary.text.length + (legendary.attack ? legendary.attack.length : 0) > 0){
					embed = embed.addField(legendary.name, `${legendary.text}${legendary.attack ? "\n**" + legendary.attack + "**" : ""}`);
				}
			});
		}

		return toEdit.edit("", {embed: embed});
	}
};
