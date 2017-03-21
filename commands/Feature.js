const Discord = require("discord.js");
const SearchCommand = require("../types/SearchCommand");
const Class = require("../models/Class");
const FeatureModel = require("../models/Feature");

module.exports = class Feature extends SearchCommand{
	constructor(client){
		super(client, {
			name: "feature",
			category: "5e",
			help: "Searches for a class feature by name.",
			helpArgs: "<Class Name>/<Feature Name>",
			elevation: 0,
			timeout: 15000
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		return msg.reply("Sorry, this command is *temporarily* unavailable. Will hopefully have it straightened out by the end of the day (21 Mar 2017).\nFor support or more information, contact my creator via DM (Best 2hu#0550) or my development server (try my `about` command).");
		let prefix;
		if(msg.guild){
			prefix = await this.client.fetchPrefix(msg.guild.id);
		}
		else{
			prefix = "";
		}
		if(!args){
			return msg.reply(`invalid command; please specify a class and feature name.\nProper usage: \`${prefix}${this.name} barbarian/primal path\``);
		}

		let toEdit = await msg.reply("fetching your class. . .");
		let matches = /\s*(\w*.*?)\s*[^\s\w]\s*([^\s]*(?:\s[^\s]+)*)\s*/.exec(args.join(" "));
		if(!matches || !matches[1] || !matches[2]){
			return msg.reply(`invalid command; please specify a class and feature name.\nProper usage: \`${prefix}${this.name} barbarian/primal path\``);
		}

		let classes = await Class.find({name: new RegExp(matches[1], "i")});
		if(!classes || classes.length === 0){
			return toEdit.edit("Unable to find that class. Sorry!");
		}

		let resultClass;
		if(classes.length > 1){
			try{
				resultClass = await super.disambiguate(toEdit, msg.author, "class", classes, "name");
			}
			catch(err){
				toEdit.edit(err.toString());
			}
		}
		else{
			resultClass = classes[0];
		}
		let features = await FeatureModel.find({name: new RegExp(matches[2], "i"), class: resultClass.name});
		if(!features || features.length === 0){
			return toEdit.edit("Unable to find that feature. Sorry!");
		}

		let result;
		try{
			result = await super.disambiguate(toEdit, msg.author, "feature", features, "name");
		}
		catch(err){
			return err.toEdit.edit(err.toString());
		}

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43);
		let description;
		if(result.class.length + result.text.length + result.level.length <= 1995){
			description = `*${result.class} ${result.level}*\n\n${result.text}`;
		}
		else{
			description = `*${result.class} ${result.level}*`;
			let text = result.text;
			let stringBuilder = [];

			while(text.length > 1024){
				let splitIndex = text.lastIndexOf("\n", 1024);
				stringBuilder.push(text.substring(0, splitIndex));
				text = text.substring(splitIndex + 1);
			}

			stringBuilder.forEach(e => {
				embed = embed.addField("\u200b", e);
			});
		}


		embed = embed.setDescription(description);

		return msg.channel.send("", {embed: embed});
	}
};
