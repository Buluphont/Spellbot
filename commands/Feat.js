const SearchCommand = require("../types/SearchCommand");
const Discord = require("discord.js");
const FeatModel = require("../models/Feat");

module.exports = class Feat extends SearchCommand{
	constructor(client){
		super(client, {
			name: "feat",
			category: "5e",
			help: "Searches for a feat by name.",
			helpArgs: "<Feat Name>",
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
			return msg.reply(`invalid command; please specify a feat.\nProper usage: \`${prefix}${this.name} tavern brawler\``);
		}
		let toEdit = await msg.reply("fetching your feat. . .");
		let feats = await FeatModel.find({name: new RegExp(args.join(" "), "i")});
		if(!feats || feats.length === 0){
			return toEdit.edit("Unable to find your feat. Sorry!");
		}

		let result;
		try{
			result = await super.disambiguate(toEdit, msg.author, "feat", feats, "name");
		}
		catch(err){
			return toEdit.edit(err.toString());
		}

		let descriptionBuilder = [];
		if(result.prerequisite){
			descriptionBuilder.push(`**Prerequisites** ${result.prerequisite}\n`);
		}
		descriptionBuilder.push(result.text);
		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setDescription(descriptionBuilder.join("\n"))
											.setColor(0x97ff43);

		return msg.channel.send("", {embed: embed});
	}
};
