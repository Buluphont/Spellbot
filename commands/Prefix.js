const Command = require("../types/Command");
const Guild = require("../models/Guild");
module.exports = class Prefix extends Command{
	constructor(client){
		super(client, {
			name: "prefix",
			help: "Sets the prefix for this guild (you can always execute commands by mentioning me, though).",
			category: "Admin",
			helpArgs: "<prefix>",
			elevation: 1,
			guildChannelOnly: true
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
			return msg.reply(`invalid command; please specify a prefix.\nProper usage: \`${prefix}${this.name} $\``);
		}
		let guild = await Guild.findOne({id: msg.guild.id});
		guild.prefix = args.join(" ");
		await guild.save();
		return msg.reply(`successfully changed this guild's prefix to ${guild.prefix}`);
	}
};
