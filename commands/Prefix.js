const Command = require("../types/Command");
const Guild = require("../models/Guild");
module.exports = class Prefix extends Command{
	constructor(client){
		super(client, {
			name: "prefix",
			help: "Sets the prefix for this guild (you can always execute commands by mentioning me, though).",
			category: "Admin",
			helpArgs: "<prefix>",
			elevation: 1
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		if(!args){
			return msg.reply("no prefix specified.");
		}
		let guild = await Guild.findOne({id: msg.guild.id});
		console.log(guild.id);
		guild.prefix = args.join(" ");
		await guild.save();
		return msg.reply(`successfully changed this guild's prefix to ${guild.prefix}`);
	}
};
