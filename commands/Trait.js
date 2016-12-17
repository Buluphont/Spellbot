const Discord = require("discord.js");
const SearchCommand = require("../types/SearchCommand");
const RaceModel = require("../models/Race");
const TraitModel = require("../models/Trait");

module.exports = class Trait extends SearchCommand{
	constructor(client){
		super(client, {
			name: "trait",
			category: "5e",
			help: "Searches for a racial trait by name.",
			helpArgs: "<Race Name>/<Trait Name>",
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
			return msg.reply(`invalid command; please specify a race and trait name.\nProper usage: \`${prefix}${this.name} half-orc/savage attacks\``);
		}

		let toEdit = await msg.reply("fetching your race. . .");
		let matches = /\s*(\w*.*?)\s*[^\s\w-()]\s*(\w*(?:\s\w+)*)\s*/.exec(args.join(" "));
		if(!matches || !matches[1] || !matches[2]){
			return msg.reply(`invalid command; please specify a race and trait name.\nProper usage: \`${prefix}${this.name} half-orc/savage attacks\``);
		}

		let races = await RaceModel.find({
			name: new RegExp(matches[1], "i"),
			trait: new RegExp(matches[2], "i")
		});
		if(!races || races.length === 0){
			return toEdit.edit("Unable to find that race. Sorry!");
		}

		let resultRace;
		if(races.length > 1){
			try{
				resultRace = await super.disambiguate(toEdit, msg.author, "race", races, "name");
			}
			catch(err){
				toEdit.edit(err);
			}
		}
		else{
			resultRace = races[0];
		}
		let traits = await TraitModel.find({name: new RegExp(matches[2], "i"), race: resultRace.name});
		if(!traits || traits.length === 0){
			return toEdit.edit("Unable to find that trait. Sorry!");
		}
		let result;
		if(traits.length > 1){
			try{
				result = await super.disambiguate(toEdit, msg.author, "trait", traits, "name");
			}
			catch(err){
				return toEdit.edit(err);
			}
		}
		else{
			result = traits[0];
		}

		let description = `**Race** ${result.race}\n\n${result.text}`;

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43)
											.setDescription(description);

		toEdit.edit("", {embed: embed});
	}
};
