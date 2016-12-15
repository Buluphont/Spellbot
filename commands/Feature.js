const Discord = require("discord.js");
const Command = require("../types/Command");
const Class = require("../models/Class");
const Feature = require("../models/Feature");
const TIMEOUT = 15000;

module.exports = class Prefix extends Command{
	constructor(client){
		super(client, {
			name: "feature",
			category: "5e",
			help: "Searches for a class feature by name.",
			helpArgs: "<Class Name>/<Feature Name>",
			elevation: 0,
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let toEdit = await msg.reply("fetching your class. . .");
		let matches = /\s*(\w*.*?)\s*[^\s\w]\s*((?:\w|\s)+\w)\s*$/.exec(args.join(" "));
		if(!matches || !matches[1] || !matches[2]){
			let prefix;
			if(msg.guild){
				prefix = await this.client.fetchPrefix(msg.guild.id);
			}
			else{
				prefix = "";
			}
			return msg.reply(`invalid command. Proper usage: \`${prefix}${this.name} barbarian/primal rage\``);
		}
		console.log(matches[1]);
		let classes = await Class.find({name: new RegExp(matches[1], "i")});
		if(!classes || classes.length === 0){
			return toEdit.edit("Unable to find that class. Sorry!");
		}

		let resultClass;
		if(classes.length > 1){
			let toSend = [];
			toSend.push("Found multiple classes; please specify which class you meant (maximum 10 results shown).");
			toSend.push(`This search will be automatically cancelled in ${TIMEOUT/1000} seconds.`);
			for(let i = 0; i < classes.length && i < 10; i++){
				toSend.push(`${i + 1}. ${classes[i].name}`);
			}
			toEdit = await toEdit.edit(toSend);
			let filter = (m) => {
				return m.author.id === msg.author.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= classes.length;
			};
			try{
				let selection = await toEdit.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});
				resultClass = classes[parseInt(selection.first().content) - 1];
			}
			catch(err){
				console.log(err);
				return toEdit.edit("Query cancelled.");
			}
		}
		else{
			resultClass = classes[0];
		}
		let features = await Feature.find({name: new RegExp(matches[2], "i"), class: resultClass.name});
		console.log(features);
		let result;
		if(features.length > 1){
			let toSend = [];
			toSend.push("Found multiple features; please specify which class feature you meant (maximum 10 results shown).");
			toSend.push(`This search will be automatically cancelled in ${TIMEOUT/1000} seconds.`);
			for(let i = 0; i < features.length && i < 10; i++){
				toSend.push(`${i + 1}. ${features[i].name}`);
			}
			toEdit = await toEdit.edit(toSend);
			let filter = (m) => {
				return m.author.id === msg.author.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= features.length;
			};
			try{
				let selection = await toEdit.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});
				result = features[parseInt(selection.first().content) - 1];
			}
			catch(err){
				console.log(err);
				return toEdit.edit("Query cancelled.");
			}
		}
		else{
			result = features[0];
		}
		let description;
		if(result.class.length + result.text.length <= 1998){
			description = `**Class** ${result.class}\n\n**Description** ${result.text}`;
		}
		else{
			description = `**Class** ${result.class}`;
			let text = result.text;
			text = text.concat(`**Description** ${result.text}`);
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

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setColor(0x97ff43)
											.setDescription(description);

		toEdit.edit("", {embed: embed});
	}
};
