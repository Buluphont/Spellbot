const Command = require("../types/Command");
const beautify = require("js-beautify").js_beautify;

module.exports = class Eval extends Command{
	constructor(client){
		super(client, {
			name: "eval",
			help: "Evaluates an expression.",
			category: "Really Admin",
			helpArgs: "<expression>",
			elevation: 3
		});
		this._clean = function(text) {
			if (typeof(text) === "string") {
				return text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));
			}
			else {
				return text;
			}
		};
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		msg.reply("Evaluating...").then(reply => {
			let code = args.join(" ");
			try {
				let evaled = eval(code);
				if (typeof evaled !== "string"){
					evaled = require("util").inspect(evaled);
				}
				return reply.edit("`In:`\n" +
						"```js\n" + beautify(this._clean(code)) + "\n```\n" +
						"`Out:`\n" +
						"```xl\n" + this._clean(evaled) +
						"\n```"
				);
			}
			catch(err) {
				return reply.edit("`In:`\n" +
						"```js\n" + beautify(this._clean(code)) + "\n```\n" +
						"`Out:`\n" +
						"```xl\n" + this._clean(err) +
						"\n```");
			}
		});
	}
};
