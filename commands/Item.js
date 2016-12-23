const SearchCommand = require("../types/SearchCommand");
const Discord = require("discord.js");
const ItemModel = require("../models/Item");

module.exports = class Item extends SearchCommand{
	constructor(client){
		super(client, {
			name: "item",
			category: "5e",
			help: "Searches for an item by name.",
			helpArgs: "<Item Name>",
			elevation: 0,
			timeout: 15000
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		console.log("Entered exec");
		let prefix;
		if(msg.guild){
			prefix = await this.client.fetchPrefix(msg.guild.id);
		}
		else{
			prefix = "";
		}
		if(!args){
			return msg.reply(`invalid command; please specify an item.\nProper usage: \`${prefix}${this.name} armor of invulnerability\``);
		}
		let toEdit = await msg.reply("fetching your item. . .");
		let items = await ItemModel.find({name: new RegExp(args.join(" "), "i")});
		if(!items || items.length === 0){
			return toEdit.edit("Unable to find your item. Sorry!");
		}
		let result;
		if(items.length > 1){
			try{
				result = await super.disambiguate(toEdit, msg.author, "item", items, "name");
			}
			catch(err){
				return toEdit.edit(err);
			}
		}
		else{
			result = items[0];
		}

		let text = result.text;
		let stringBuilder = [];
		while(text.length > 1024){
			let splitIndex = text.lastIndexOf("\n", 1024);
			stringBuilder.push(text.substring(0, splitIndex));
			text = text.substring(splitIndex + 1);
		}
		stringBuilder.push(text);

		let itemMeta = [];
		itemMeta.push(`*${result.type}*`);
		if(result.dmg1){
			itemMeta.push(`${result.dmg1} ${result.dmgType}${result.property ? " - " + result.property : ""}${result.dmg2 ? " (" + result.dmg2 + ")" : ""}`);
		}

		if(result.ac){
			itemMeta.push(`*AC ${result.ac}*`);
		}

		if(result.stealth){
			itemMeta.push("*Stealth Disadvantage*");
		}
		if(result.strength){
			itemMeta.push(`*Requires ${result.strength} STR*`);
		}

		itemMeta.push(`*Weight ${result.weight}*`);
		if(result.value){
			itemMeta.push(`*Value ${result.value}*`);
		}

		let embed = new Discord.RichEmbed().setTitle(`__**${result.name}**__`)
											.setDescription(itemMeta.join("\n"))
											.setColor(0x97ff43);

		embed = embed.addField("Description", stringBuilder.shift());
		stringBuilder.forEach((string) => {
			embed = embed.addField("\u200b", string);
		});

		return toEdit.edit("", {embed: embed});
	}
};
