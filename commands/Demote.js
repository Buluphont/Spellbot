const Command = require("../types/Command");
const Guild = require("../models/Guild");
module.exports = class Demote extends Command{
	constructor(client){
		super(client, {
			name: "demote",
			category: "Admin",
			help: "Demotes a role.",
			helpArgs: "<Role Name>",
			elevation: 2,
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
			return msg.reply(`invalid command; please specify a role name.\nProper usage: \`${prefix}${this.name} Some Role Name\``);
		}
		let targetRole = msg.guild.roles.find("name", args.join(" "));
		if(targetRole){
			let guild = await Guild.findOne({id: msg.guild.id});
			if(!guild.elevatedRoles){
				guild.elevatedRoles = [];
			}

			let i = guild.elevatedRoles.indexOf(targetRole.id);
			if(i !== -1){
				guild.elevatedRoles.splice(i, 1);
				await guild.save();
				return msg.reply(`Successfully demoted role ${targetRole.name}`);
			}
			else{
				return msg.reply(`${targetRole.name} is not elevated.`);
			}
		}
		else{
			return msg.reply("I was unable to find a role with that name.");
		}
	}
};
