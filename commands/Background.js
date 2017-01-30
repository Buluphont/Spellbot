const Discord = require("discord.js");
const SearchCommand = require("../types/SearchCommand");
const BackgroundModel = require("../models/Background");

module.exports = class Background extends SearchCommand{
	constructor(client){
		super(client, {
			name: "background",
			category: "5e",
			help: "Searches for a character background.",
			helpArgs: "<Background Name>",
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
			return msg.reply(`invalid command; please specify a background.\nProper usage: \`${prefix}${this.name} entertainer\``);
		}

		let toEdit = await msg.reply("fetching your background. . .");

		let backgrounds = await BackgroundModel.find({name: new RegExp(args.join(" "), "i")});
		if(!backgrounds || backgrounds.length === 0){
			return toEdit.edit("Unable to find that background. Sorry!");
		}

		let result;
		try{
			result = await super.disambiguate(toEdit, msg.author, "background", backgrounds, "name");
		}
		catch(err){
			return err.toEdit.edit(err.toString());
		}

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43);

		if(result.trait){
			result.trait.forEach(t => {
				embed = embed.addField(t.name, t.text);
			});
		}

		return msg.channel.send("", {embed: embed});
	}
};
