const Discord = require("discord.js");
const SearchCommand = require("../types/SearchCommand");
const RaceModel = require("../models/Race");

module.exports = class Trait extends SearchCommand{
	constructor(client){
		super(client, {
			name: "race",
			category: "5e",
			help: "Searches for a race.",
			helpArgs: "<Race Name>",
			elevation: 0,
			timeout: 15000
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let prefix;
		if(msg.guild){
			prefix = await this.client.fetchPrefix(msg.guild.id);
		}
		else{
			prefix = "";
		}
		if(!args){
			return msg.reply(`invalid command; please specify a race.\nProper usage: \`${prefix}${this.name} half-orc\``);
		}

		let toEdit = await msg.reply("fetching your race. . .");

		let races = await RaceModel.find({name: new RegExp(args.join(" "), "i")});
		if(!races || races.length === 0){
			return toEdit.edit("Unable to find that race. Sorry!");
		}

		let result;
		try{
			result = await super.disambiguate(toEdit, msg.author, "race", races, "name");
		}
		catch(err){
			return err.toEdit.edit(err.toString());
		}

		let descriptionBuilder = [];
		descriptionBuilder.push(`**Size** ${result.size}`);
		descriptionBuilder.push(`**Speed** ${result.speed}`);
		if(result.ability){
			let adjustmentsText = "**Ability Score Adjustments** ";
			let hasStaticModifiers = false;

			if(result.ability.str){
				adjustmentsText += `Str: ${result.ability.str}, `;
				hasStaticModifiers = true;
			}

			if(result.ability.dex){
				adjustmentsText += `Dex: ${result.ability.dex}, `;
				hasStaticModifiers = true;
			}

			if(result.ability.con){
				adjustmentsText += `Con: ${result.ability.con}, `;
				hasStaticModifiers = true;
			}

			if(result.ability.int){
				adjustmentsText += `Int: ${result.ability.int}, `;
				hasStaticModifiers = true;
			}

			if(result.ability.wis){
				adjustmentsText += `Wis: ${result.ability.wis}, `;
				hasStaticModifiers = true;
			}

			if(result.ability.cha){
				adjustmentsText += `Cha: ${result.ability.cha}, `;
				hasStaticModifiers = true;
			}

			if(hasStaticModifiers){
				// Remove the trailing comma and space after the last element
				adjustmentsText = adjustmentsText.substring(0, adjustmentsText.length - 2);
			}

			if(result.ability.choose){
				result.ability.choose.forEach(decision => {
					let count = decision.count;
					let amount = decision.amount;

					adjustmentsText += `\n+${amount ? amount : "1"} to any ${count} from `;

					decision.from.forEach(choice => {
						adjustmentsText += `${choice}, `;
					});

					adjustmentsText = adjustmentsText.substring(0, adjustmentsText.length - 2);
				});
			}
			
			descriptionBuilder.push(adjustmentsText);
		}
		if(result.proficiency){
			descriptionBuilder.push(`**Proficiencies** ${result.proficiency}`);
		}
		if(result.source){
			descriptionBuilder.push(`**Source** ${result.source}`);
		}
		let description = descriptionBuilder.join("\n");

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43)
											.setDescription(description);


		if(result.trait && result.trait.length > 0){
			embed = super.attachFieldToEmbed("Traits", result.trait, embed);
		}

		return msg.channel.send("", {embed: embed});
	}
};
