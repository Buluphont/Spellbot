const Command = require("../types/Command");

module.exports = class Help extends Command{
	constructor(client){
		super(client, {
			name: "help",
			help: "Generates what you're reading now!",
			category: "Misc"
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let categories = new Map();
		let prefix = await this.client.fetchPrefix(msg.guild.id);
		this.client.commands.forEach((command) => {
			console.log(command.name);
			console.log(command.category);
			console.log(command.help);
			if(command.category && command.help){
				if(!categories.get(command.category)){
					categories.set(command.category, {name: command.category, helptext: []});
				}
				categories.get(command.category).helptext.push(`${prefix}${command.name} :: ${command.help}`);
				console.log(`${prefix}${command.name} :: ${command.help}`);
			}
		});

		let tosend = [];
		tosend.push("```asciidoc");
		categories.forEach(category => {
			tosend.push(`= ${category.name} =`);
			category.helptext.forEach(help => {
				tosend.push(help);
			});
			tosend.push("");
		});
		tosend.splice(-1);
		tosend.push("```");
		return msg.channel.sendMessage(tosend);
	}
};
