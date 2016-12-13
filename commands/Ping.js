const Command = require("../types/Command");

module.exports = class Ping extends Command{
	constructor(client){
		super(client, {
			name: "ping",
			help: "Useless shit.",
			category: "Misc"
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		return msg.reply("Pong.");
	}
};
