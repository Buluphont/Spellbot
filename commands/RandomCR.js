const Command = require("../types/Command");
const CreatureModel = require("../models/Creature");
const Discord = require("discord.js");
const TIMEOUT = 15000;
module.exports = class RandomCR extends Command{
	constructor(client){
		super(client, {
			name: "randomcr",
			help: "Fetches random creatures by CR.",
			category: "5e",
			helpArgs: "<Challenge Rating>",
			elevation: 0
		});

		this._menuLoop = async function(options, menuMessage, querier, page = 0){
			let toSend = [];
			toSend.push("Please say the number corresponding to the creature you meant.");
			toSend.push(`This search will be automatically cancelled in ${TIMEOUT/1000} seconds.\n`);
			for(let i = 10 * page; i < options.length && i < (10 * page) + 10; i++){
				toSend.push(`${i + 1}. ${options[i].name}`);
			}

			if(0 < page || 10 * page + 10 < options.length){
				toSend.push("");
			}
			if(0 < page){
				toSend.push("Reply with `back` to go back a page.");
			}
			if(10 * page + 10 < options.length){
				toSend.push("Reply with `next` to go forward a page.");
			}
			menuMessage  = await menuMessage.edit(toSend.join("\n"));
			let filter = (m) => {
				// Listen only for the querier's commands.
				// Return true if the value is in the content range OR
				// (the content is "next" AND there is a next page) OR
				// (the content is "back" AND this is not the 0th page)
				return (m.author.id === querier.id &&
					(
						(parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= options.length) ||
						(m.content === "next" && 10 * page + 10 < options.length) ||
						m.content === "back" && 0 < page)
				);
			};
			try{
				let selection = await menuMessage.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});

				if(parseInt(selection.first().content)){
					menuMessage.delete();
					return options[parseInt(selection.first().content) - 1];
				}
				else if(selection.first().content === "next"){
					page = page + 1;
				}
				else if(selection.first().content === "back"){
					page = page - 1;
				}
				else{
					throw new Error("A strange error has occurred. Please contact my creator!");
				}

				let nextMenu = await menuMessage.channel.sendMessage("Fetching next page. . .");
				menuMessage.delete();
				return this._menuLoop(options, nextMenu, querier, page);
			}
			catch(err){
				menuMessage.delete();
				throw new Error("Query cancelled.");
			}
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
			return msg.reply(`invalid command; please specify a Challenge Rating.\nProper usage: \`${prefix}${this.name} 13\``);
		}
		let toEdit = await msg.reply("fetching your creatures. . .");
		let creatures = await CreatureModel.find({cr: args[0]});
		if(!creatures || creatures.length === 0){
			return toEdit.edit("Unable to find creatures at that CR. Sorry!");
		}

		let result;
		if(creatures.length > 1){
			try{
				// Shuffle the array
				for (let i = creatures.length; i; i--) {
					let j = Math.floor(Math.random() * i);
					[creatures[i - 1], creatures[j]] = [creatures[j], creatures[i - 1]];
				}
				result = await this._menuLoop(creatures, toEdit, msg.author);
			}
			catch(err){
				return msg.channel.sendMessage(err.message);
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
			embed = super.attachFieldToEmbed("Traits", result.traits, embed);
		}

		if(result.spells){
			embed = embed.addField("Known Spells", result.spells);
		}

		if(result.actions && result.actions.length > 0){
			embed = super.attachFieldToEmbed("Actions", result.actions, embed);
		}

		if(result.legendary && result.legendary.length > 0){
			embed = super.attachFieldToEmbed("Legendary Actions", result.legendary, embed);
		}

		return msg.channel.sendEmbed(embed);
	}
};
