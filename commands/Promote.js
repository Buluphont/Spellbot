const Command = require("../types/Command");
const Guild = require("../models/Guild");
module.exports = class Elevate extends Command{
	constructor(client){
		super(client, {
			name: "promote",
			category: "Admin",
			help: "Promotes a role.",
			helpArgs: "<Role Name>",
			elevation: 2,
			guildChannelOnly: true
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let targetRole = msg.guild.roles.find("name", args.join(" "));
		if(targetRole){
			let guild = await Guild.findOne({id: msg.guild.id});
			if(!guild.elevatedRoles){
				guild.elevatedRoles = [];
			}

			if(guild.elevatedRoles.find((e) => {return e === targetRole.id;})){
				return msg.reply(`${targetRole.name} is already elevated.`);
			}
			else{
				guild.elevatedRoles.push(targetRole.id);
				await guild.save();
				return msg.reply(`Successfully elevated role ${targetRole.name}`);
			}
		}
		else{
			return msg.reply("I was unable to find a role with that name.");
		}
	}
};
