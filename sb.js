const Discord = require("discord.js");
const client = new Discord.Client();

var cr = require("./config.json");
client.defaultPrefix = cr.prefix;
const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const Guild = require("./models/Guild");

mongoose.connect("mongodb://localhost:27017/myproject");
// This shit is used everywhere. Might as well make it global.
client.random = function(low, high) {
	return Math.floor(Math.random() * (high - low + 1) + low);
};

client.commands = new Map();

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", function() {
	client.db = db;
	client.login(cr.token);
	console.log("Connected to db.");
});

client.once("ready", () => {
	const dir = "./commands/";
	const fs = require("fs");

	fs.readdir(dir, (err, files) => {
		if(err){
			console.log(dir);
			console.log(err);
			process.exit(0);
		}
		else{
			for(let i = 0; i < files.length; i++){
				let fileName = files[i];
				let mod = require(`./commands/${/(.*)\.js/.exec(fileName)[1]}`);
				let cmd = new mod(client);
				console.log(`Loaded command ${cmd.name}`);
				client.commands.set(cmd.name, cmd);
			}
		}
	});
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

client.on("message", async (msg) => {
	let prefix = await client.fetchPrefix(msg.guild.id);
	let offset;
	if(msg.content.startsWith(prefix)){
		offset = prefix.length;
	}
	else if(msg.content.startsWith(client.user.toString())){
		offset = client.user.toString().length + 1;
	}
	else{
		return;
	}

	let commandString = msg.content.substring(offset).split(" ")[0].toLowerCase();
	let command = client.commands.get(commandString);
	try{
		let pattern = new RegExp(`${command.name}(.*)`);
		let args = pattern.exec(msg.content.substring(offset + commandString))[1].trim();
		if(args){
			args = args.split(" ");
		}
		if(command && await command.checkPermission(msg.member)){
			command.execute(msg, args);
		}
	}
	catch(err){
		console.log("Error onMessage:");
		console.log(err);
	}
});

client.fetchPrefix = async function(id){
	if(client.db){
		try{
			let guild = await Guild.findOne({id: id});
			if(guild){
				return guild.prefix || client.defaultPrefix;
			}
			else{
				await new Guild({id: id, prefix: client.defaultPrefix, elevatedRoles: []}).save();
				return client.defaultPrefix;
			}
		}
		catch(err){
			throw new Error(err);
		}
	}
};
