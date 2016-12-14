const Command = require("../types/Command");
module.exports = class About extends Command{
	constructor(client){
		super(client, {
			name: "about",
			help: "Let me tell you all about me.",
			category: "Misc",
			elevation: 0
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		return msg.reply(`Hi! I'm Spellbot.

			You can contact my creator and/or get an invite link for your server here: <https://discord.gg/KWsvFGG>`);
	}
};
