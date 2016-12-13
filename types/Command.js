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
	}

	async execute(msg){ // eslint-disable-line no-unused-vars
		throw new Error(`Virtual method 'execute' not implemented in command ${this.meta.name}`);
	}
}

module.exports = Command;
