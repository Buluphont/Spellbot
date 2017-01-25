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

		this._attachFieldToEmbed = function(name, data, embed){
			embed = embed.addField("\u200b", `__**${name}**__`);
			data.forEach((element) => {
				element.text = element.text.replace(/,,/g, "\n"); // Make up for someone's shitty data entry
				if(element.text.length + (element.attack ? element.attack.length + 5 : 0) > 1024){
					let text = element.text;
					text = text.concat(`${element.attack ? "\n**" + element.attack + "**" : ""}`);
					let stringBuilder = [];

					while(text.length > 900){	// TODO: figure out why this doesn't split correctly, factoring in the concat above
						let splitIndex = text.lastIndexOf("\n", 900);
						let offset = 0;
						if(splitIndex === -1){
							splitIndex = text.lastIndexOf(". ", 900);
							offset = 1;
						}
						stringBuilder.push(text.substring(0, splitIndex + offset));
						text = text.substring(splitIndex + offset + 1);
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
		if(races.length > 1){
			try{
				result = await super.disambiguate(toEdit, msg.author, "race", races, "name");
			}
			catch(err){
				toEdit.edit(err);
			}
		}
		else{
			result = races[0];
		}

		let descriptionBuilder = [];
		descriptionBuilder.push(`**Size** ${result.size}`);
		descriptionBuilder.push(`**Speed** ${result.speed}`);
		if(result.ability){
			descriptionBuilder.push(`**Ability Score Adjustments** ${result.ability}`);
		}
		if(result.proficiency){
			descriptionBuilder.push(`**Proficiencies** ${result.proficiency}`);
		}

		let description = descriptionBuilder.join("\n");

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43)
											.setDescription(description);


		if(result.trait && result.trait.length > 0){
			embed = this._attachFieldToEmbed("Traits", result.trait, embed);
		}

		toEdit.edit("", {embed: embed});
	}
};
