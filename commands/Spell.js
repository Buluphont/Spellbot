const Command = require("../types/Command");
const SpellModel = require("../models/Spell");
const request = require("request");
const cheerio = require("cheerio");
const TIMEOUT = 30000;
const BASEURL = "http://www.5esrd.com/spellcasting/all-spells";

module.exports = class Spell extends Command{
	constructor(client){
		super(client, {
			name: "spell",
			category: "5e",
			help: "Searches for a spell.",
			helpArgs: "<Spell Name>",
			elevation: 0
		});
	}

	async execute(msg, args){	// eslint-disable-line no-unused-vars
		let toEdit = await msg.reply("fetching your spell. . .");
		let spells = await SpellModel.find({name: new RegExp(args.join(" "), "i")});
		let result;
		if(!spells || spells.length === 0){
			toEdit = await toEdit.edit("Spell not found in cache; consulting the great library. . .");
			let query = args.join("-");
			let endpoint = `${BASEURL}/${query[0]}/${query}`;
			try{
				result = await new Promise((resolve, reject) => {
					request(endpoint, async (err, res, body) => {
						if(!err && res.statusCode === 200){
							let $ = cheerio.load(body);
							let tentativeSpell = {};
							$(".article-content").filter(function(){
								let data = $(this);
								let article = data.text();
								let matches = /\s*(.*)\s*Casting Time: (.*)Range: (.*)Components: (.*)Duration: (.*)\n([\w\W\s\S]*)/.exec(article);
								if(!matches[1] || !matches[2] || !matches[3] || !matches[4] || !matches[5]){
									reject("Page malformed. Please tell my creator!");
								}
								tentativeSpell.type = matches[1];
								tentativeSpell.castingTime = matches[2];
								tentativeSpell.range = matches[3];
								tentativeSpell.components = matches[4];
								tentativeSpell.duration = matches[5];
								tentativeSpell.description = matches[6];
							});
							$("h1").filter(function(){
								let data = $(this);
								if(!data.text()){
									reject("Page malformed. Please tell my creator!");
								}
								tentativeSpell.name = data.text();
							});
							tentativeSpell.url = endpoint;
							await new SpellModel(tentativeSpell).save();
							resolve(tentativeSpell);
						}
						else{
							reject("Unable to find your spell. Sorry!");
						}
					});
				});
			}
			catch(err){
				toEdit.edit(err);
			}
		}
		else if(spells.length > 1){
			let toSend = [];
			toSend.push("Found multiple spells; please specify which spell you meant (only first 10 results shown).");
			spells.forEach((spell, i) => {
				toSend.push(`${i + 1}. ${spell.name}`);
			});
			toEdit = await toEdit.edit(toSend);
			let filter = (m) => {
				return m.author.id === msg.author.id && parseInt(m.content) && 0 < parseInt(m.content) && parseInt(m.content) <= spells.length;
			};
			try{
				let selection = await toEdit.channel.awaitMessages(filter, {
					time: TIMEOUT,
					maxMatches: 1
				});
				result = spells[parseInt(selection.first().content) - 1];
			}
			catch(err){
				console.log(err);
				toEdit.edit("Query cancelled.");
			}

		}
		else{
			result = spells[0];
		}

		console.log(result);
		toEdit.edit("", {embed: {
			title: `__**${result.name}**__`,
			description: `*${result.type}*
			**Casting Time**: ${result.castingTime}
			**Range**: ${result.range}
			**Components**: ${result.components}
			**Duration**: ${result.duration}`,
			url: result.url,
			color: 0x97ff43,
			fields:[{
				name: "Description",
				value: result.description.trim().replace("\n", "\n\n"),
				inline: false
			}]
		}});
		//let toSend = [];
		/*
		toSend.push("```asciidoc");
		toSend.push(`= ${result.name} =`);
		toSend.push(`Casting time :: ${result.castingTime}`);
		toSend.push(`Range :: ${result.range}`);
		toSend.push(`Components :: ${result.components}`);
		toSend.push(`Duration :: ${result.duration}`);
		toSend.push("\n");
		toSend.push(result.description.trim());
		toSend.push("```");
		toEdit.edit(toSend);
		*/
	}
};
