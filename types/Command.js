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
	}

	async execute(msg, args){ // eslint-disable-line no-unused-vars
		throw new Error(`Virtual method 'execute' not implemented in command ${this.meta.name}`);
	}

	async checkPermission(member){
		switch(this.elevation){
			case 3:
				return member.id === this.client.botOwnerID;
			case 2:
				return member.id === member.guild.ownerID;
			case 1: {
				if(member.id === member.guild.ownerID){
					return true;
				}
				console.log("Case 1");
				let elevatedRoleIDs = await this.client.fetchElevatedRoleIDs(member.guild.id);
				console.log(elevatedRoleIDs);
				elevatedRoleIDs.forEach(r => {
					if(member.roles.get(r)){
						console.log("Found a match");
						return true;
					}
				});
				console.log("No match");
				return false;
			}
			case 0:
				return true;
			default:
				return true;
		}
	}
}

module.exports = Command;
