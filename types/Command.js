module.exports = class Command{
	constructor(client, meta){
		if(!client){
			throw new Error("Cannot construct a Command without a client instance.");
		}
		if(!meta){
			throw new Error("Cannot construct a Command without metadata.");
		}
		if(!meta.name){
			throw new Error("Cannot construct a Command without a name.");
		}

		this.client = client;
		this.name = meta.name;
		this.category = meta.category;
		this.help = meta.help;
		this.elevation = meta.elevation || 0;
		this.helpArgs = meta.helpArgs;
		this.guildChannelOnly = meta.guildChannelOnly || false;
	}

	/**
	 * @abstract
	 */
	async execute(msg, args){ // eslint-disable-line no-unused-vars
		throw new Error(`Abstract method 'execute' not implemented in command ${this.meta.name}`);
	}

	/**
	 * @param {Discord.GuildMember | Discord.User}
	 * @return {boolean}
	 */
	async checkPermission(member){
		if(this.guildChannelOnly && !member.guild){
			return false;
		}
		switch(this.elevation){
			case 3:	// Bot owner only
				return member.id === this.client.botOwnerID;
			case 2:	// Guild owner
				return member.id === member.guild.ownerID;
			case 1: {	// Promoted Roles
				if(member.id === member.guild.ownerID){
					return true;
				}
				let elevatedRoleIDs = await this.client.fetchElevatedRoleIDs(member.guild.id);
				elevatedRoleIDs.forEach(r => {
					if(member.roles.get(r)){
						return true;
					}
				});
				return false;
			}
			case 0:	// Everyone
				return true;
			default:
				return true;
		}
	}

	attachFieldToEmbed(name, data, embed){
		embed = embed.addField("\u200b", `__**${name}**__`);
		data.forEach((element) => {
			element.text = element.text.replace(/,,/g, "\n"); // Make up for someone's shitty data entry
			if(element.text.length + (element.attack ? element.attack.length + 5 : 0) > 1024){
				let text = element.text;
				text = text.concat(`${element.attack ? "\n**" + element.attack + "**" : ""}`);
				let stringBuilder = [];

				while(text.length > 900){	// TODO: figure out why this doesn't split correctly, factoring in the concat above
					let splitIndex = text.lastIndexOf("\n", 900);
					let offset = 0;
					if(splitIndex === -1){
						splitIndex = text.lastIndexOf(". ", 900);
						offset = 1;
					}
					stringBuilder.push(text.substring(0, splitIndex + offset));
					text = text.substring(splitIndex + offset + 1);
				}
				stringBuilder.push(text);

				embed = embed.addField(element.name, stringBuilder.shift());
				stringBuilder.forEach((string) => {
					embed = embed.addField(`${element.name}, continued. . .`, `${string}${element.attack ? "\n**" + element.attack + "**" : ""}`);
				});
			}
			else if(element.text.length + (element.attack ? element.attack.length : 0) > 0){
				embed = embed.addField(element.name, `${element.text}${element.attack ? "\n**" + element.attack + "**" : ""}`);
			}
		});
		return embed;
	}
};
