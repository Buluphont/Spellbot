const Command = require("./Command");

module.exports = class SearchCommand extends Command{
	constructor(client, meta){
		super(client, meta);
		this._timeout = meta.timeout || 15000;
	}

	async disambiguate(toEdit, querier, typeName, data, identifier, page = 0, extraIdentifier = ""){
		let toSend = [];
		if(data.length === 1){
			toEdit.delete();
			return data[0];
		}
		toSend.push(`Please say the number corresponding to the ${typeName} you meant.`);
		toSend.push(`This search will be automatically cancelled in ${this._timeout/1000} seconds.\n`);
		for(let i = 10 * page; i < data.length && i < (10 * page) + 10; i++){
			toSend.push(`${i + 1}. ${data[i][identifier]}${data[i][extraIdentifier] ? " (" + data[i][extraIdentifier] + ")" : ""}`);
		}

		if(0 < page || 10 * page + 10 < data.length){
			toSend.push("");
		}
		if(0 < page){
			toSend.push("Reply with `back` to go back a page.");
		}
		if(10 * page + 10 < data.length){
			toSend.push("Reply with `next` to go forward a page.");
		}
		toEdit  = await toEdit.edit(toSend.join("\n"));
		let filter = (m) => {
			// Listen only for the querier's commands.
			// Return true if the value is in the content range OR
			// (the content is "next" AND there is a next page) OR
			// (the content is "back" AND this is not the 0th page)
			return (m.author.id === querier.id &&
				(
					(parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= data.length) ||
					((m.content.toLowerCase() === "n" || m.content.toLowerCase() === "next") && 10 * page + 10 < data.length) ||
					((m.content.toLowerCase() === "b" || m.content.toLowerCase() === "back") && 0 < page))
			);
		};
		try{
			let selection = await toEdit.channel.awaitMessages(filter, {
				time: this._timeout,
				maxMatches: 1
			});

			if(parseInt(selection.first().content)){
				toEdit.delete();
				return data[parseInt(selection.first().content) - 1];
			}
			else if(selection.first().content.toLowerCase() === "n" || selection.first().content.toLowerCase() === "next"){
				page = page + 1;
			}
			else if(selection.first().content.toLowerCase() === "b" || selection.first().content.toLowerCase() === "back"){
				page = page - 1;
			}
			else{
				let e = new Error("A strange error has occurred. Please contact my creator!");
				e.toEdit = toEdit;
				throw e;
			}
			let nextMenu = await toEdit.channel.sendMessage("Fetching next page. . .");
			toEdit.delete();
			return this.disambiguate(nextMenu, querier, typeName, data, identifier, page, extraIdentifier);
		}
		catch(err){
			let e = new Error("Query cancelled.");
			e.toEdit = toEdit;
			throw e;
		}
	}
};
