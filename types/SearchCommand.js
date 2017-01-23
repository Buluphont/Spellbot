const Command = require("./Command");

module.exports = class SearchCommand extends Command{
	constructor(client, meta){
		super(client, meta);
		this._timeout = meta.timeout;
	}

	async disambiguate(toEdit, querier, typeName, data, identifier){
		let toSend = [];
		toSend.push(`Found multiple ${typeName}s; please say the number corresponding to the ${typeName} you meant (maximum 10 results shown).`);
		toSend.push(`This search will be automatically cancelled in ${this._timeout/1000} seconds.\n`);
		for(let i = 0; i < data.length && i < 10; i++){
			toSend.push(`${i + 1}. ${data[i][identifier]}`);
		}
		toEdit = await toEdit.edit(toSend.join("\n"));
		let filter = (m) => {
			return m.author.id === querier.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= data.length;
		};
		try{
			let selection = await toEdit.channel.awaitMessages(filter, {
				time: this._timeout,
				maxMatches: 1
			});
			return data[parseInt(selection.first().content) - 1];
		}
		catch(err){
			console.log(err);
			throw new Error("Query cancelled.");
		}
	}
};
