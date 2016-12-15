const Command = require("../types/Command");
const Discord = require("discord.js");
const FeatModel = require("../models/Feat");
const TIMEOUT = 15000;

module.exports = class Feat extends Command{
	constructor(client){
		super(client, {
			name: "feat",
			category: "5e",
			help: "Searches for a feat by name.",
			helpArgs: "<Feat Name>",
			elevation: 0
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let toEdit = await msg.reply("fetching your feat. . .");
		let feats = await FeatModel.find({name: new RegExp(args.join(" "), "i")});
		if(!feats || feats.length === 0){
			return toEdit.edit("Unable to find your feat. Sorry!");
		}

		let result;
		if(feats.length > 1){
			let toSend = [];
			toSend.push("Found multiple feats; please say the number corresponding to the feat you meant (maximum 10 results shown).");
			toSend.push(`This search will be automatically cancelled in ${TIMEOUT/1000} seconds.\n`);
			for(let i = 0; i < feats.length && i < 10; i++){
				toSend.push(`${i + 1}. ${feats[i].name}`);
			}
			toEdit = await toEdit.edit(toSend);
			let filter = (m) => {
				return m.author.id === msg.author.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= feats.length;
			};
			try{
				let selection = await toEdit.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});
				result = feats[parseInt(selection.first().content) - 1];
			}
			catch(err){
				console.log(err);
				return toEdit.edit("Query cancelled.");
			}
		}
		else{
			result = feats[0];
		}

		let descriptionBuilder = [];
		if(result.prerequisite){
			descriptionBuilder.push(`**Prerequisites** ${result.prerequisite}\n`);
		}
		descriptionBuilder.push(result.text);
		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setDescription(descriptionBuilder.join("\n"))
											.setColor(0x97ff43);

		return toEdit.edit("", {embed: embed});
	}
};
