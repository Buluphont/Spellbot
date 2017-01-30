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
			toEdit.edit(err.toString());
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
			embed = super.attachFieldToEmbed("Traits", result.trait, embed);
		}

		return msg.channel.send("", {embed: embed});
	}
};
