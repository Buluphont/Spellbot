class Command{
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
}

module.exports = Command;
