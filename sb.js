const Discord = require("discord.js");
const client = new Discord.Client();

var cr = require("./config.json");
client.prefix = cr.prefix;
client.login(cr.token);

// This shit is used everywhere. Might as well make it global.
client.random = function(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
};

var COMMANDS = new Map();
COMMANDS.set("ping", (msg) => {
	msg.reply("Pong!");
});

client.once("ready", () => {
	console.log(`Ready to begin! Serving in ${client.guilds.size} servers.`);
});

client.on("disconnect", () => {
	console.log("Disconnected.");
	process.exit(0);
});

client.on("error", (error) => {
	console.log("Error event:");
	console.log(error);
});

client.on("message", (msg) => {
	if(msg.content.startsWith(client.prefix)){
		let command = msg.content.split(" ")[0].substring(1);
		try{
			if(COMMANDS.get(command.toLowerCase())){
				COMMANDS.get(command.toLowerCase())(msg);
			}
		}
		catch(err){
			console.log("Error onMessage:");
			console.log(err);
		}
	}
});
