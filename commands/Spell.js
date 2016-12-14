const Command = require("../types/Command");
const Discord = require("discord.js");
const SpellModel = require("../models/Spell");
const TIMEOUT = 15000;

module.exports = class Spell extends Command{
	constructor(client){
		super(client, {
			name: "spell",
			category: "5e",
			help: "Searches for a spell by name.",
			helpArgs: "<Spell Name>",
			elevation: 0
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
		let toEdit = await msg.reply("fetching your spell. . .");
		let spells = await SpellModel.find({name: new RegExp(args.join(" "), "i")});
		if(!spells || spells.length === 0){
			return toEdit.edit("Unable to find your spell. Sorry!");
		}
		let result;
		if(spells.length > 1){
			let toSend = [];
			toSend.push("Found multiple spells; please specify which spell you meant (maximum 10 results shown).");
			toSend.push(`This search will be automatically cancelled in ${TIMEOUT/1000} seconds.`);
			for(let i = 0; i < spells.length && i < 10; i++){
				toSend.push(`${i + 1}. ${spells[i].name}`);
			}
			toEdit = await toEdit.edit(toSend);
			let filter = (m) => {
				return m.author.id === msg.author.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= spells.length;
			};
			try{
				let selection = await toEdit.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});
				result = spells[parseInt(selection.first().content) - 1];
			}
			catch(err){
				console.log(err);
				return toEdit.edit("Query cancelled.");
			}
		}
		else{
			result = spells[0];
		}

		console.log(result);
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

		return toEdit.edit("", {embed: embed});
	}
};
