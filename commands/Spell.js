const SearchCommand = require("../types/SearchCommand");
const Discord = require("discord.js");
const SpellModel = require("../models/Spell");

module.exports = class Spell extends SearchCommand{
	constructor(client){
		super(client, {
			name: "spell",
			category: "5e",
			help: "Searches for a spell by name.",
			helpArgs: "<Spell Name>",
			elevation: 0,
			timeout: 15000
		});

		this._ordinal_suffix_of = function(i){
			var j = i % 10,
				k = i % 100;
			if (j == 1 && k != 11) {
				return i + "st";
			}
			if (j == 2 && k != 12) {
				return i + "nd";
			}
			if (j == 3 && k != 13) {
				return i + "rd";
			}
			return i + "th";
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
			return msg.reply(`invalid command; please specify a spell.\nProper usage: \`${prefix}${this.name} dancing lights\``);
		}
		let toEdit = await msg.reply("fetching your spell. . .");
		let spells = await SpellModel.find({name: new RegExp(args.join(" "), "i")});
		if(!spells || spells.length === 0){
			return toEdit.edit("Unable to find your spell. Sorry!");
		}

		let result;
		try{
			result = await super.disambiguate(toEdit, msg.author, "spell", spells, "name");
		}
		catch(err){
			return err.toEdit.edit(err.toString());
		}

		let descFieldValues = [];
		let paragraphs = result.description.trim().split("\n");
		paragraphs.forEach(p => {
			if(p && p.length > 0){
				descFieldValues.push(p);
			}
		});
		let spellMeta = [];
		let type = `*${this._ordinal_suffix_of(result.level)}-level ${result.school}${result.ritual ? " (ritual)" : ""}*\n`;
		spellMeta.push(type);
		spellMeta.push(`**Casting Time**: ${result.castingTime}`);
		spellMeta.push(`**Range**: ${result.range}`);
		spellMeta.push(`**Components**: ${result.components}`);
		spellMeta.push(`**Duration**: ${result.duration}`);
		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setDescription(spellMeta.join("\n"))
											.setColor(0x97ff43);

		descFieldValues.forEach((p, i) => {
			if(i == 0){
				embed = embed.addField("Description", p.trim());
			}
			else{
				embed = embed.addField("\u200b", p.trim());
			}
		});

		return msg.channel.send("", {embed: embed});
	}
};
