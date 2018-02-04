//LIBS
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();


//UTILS
const utils = require('./utils/funcs.js');
const behavior = require('./utils/reactions.js');

//CONFIG
const config = require('./_private/config.json');
const settings = require('./sys/settings.json');
const databaseFile = './_private/userdata.db';  
let db = new sqlite3.Database(databaseFile);  

utils.log('QAIx fired ! Preparing...');

//INITIALIZATION
client.on('ready', () => {
	utils.log('QAIx ready !');
	client.user.setGame(`with the Seven Hand Node.`);
});

//ON DISCONNECT
client.on('disconnect', () => {
  utils.log('QAIx has disconnected', 'WW');
});

//ON MESSAGE
client.on('message', message => {
	//SAFETY
	if (!message.guild){
		utils.log('Received message from empty guild. Doing nothing.', '><');
		return;
	}
	
	const msgString = message.content;
	let issuedCommand = false;
	
	//////////////////////
	// INPUT DETECTION
	//////////////////////
	for (var i = 0; i < settings.prefixes.length; i++){	//Check if message includes on of the prefixes
		const thisPref = settings.prefixes[i];
		let validPref = true;
		for (var j = 0; j < thisPref.length; j++){
			var thisChar = msgString.charAt(j);
			var thisPrefChar = thisPref.charAt(j);
			if (thisChar != thisPrefChar){
				validPref = false;
			}
		}
		if (validPref){	//It does => Execing command
			utils.log(message.author.username+' is talking to me', '!!', message.guild);
			message.content = message.content.slice(settings.prefixes[i].length, message.content.length);
			let canDo = true;
			if (settings["dev-only-mode"]){
				const aId = parseInt(message.author.id)
				if (settings["devs"].indexOf(aId, settings["devs"]) < 0){
					utils.log(message.author.username+' is not a developper, and dev-only-mode activated. Doing nothing.', '><', message.guild);
					canDo = false;
				}
			}
			if (canDo){
				utils.log("Reacting to ["+msgString+"] ...", "..", message.guild);
				issuedCommand = true;
				const reaction = behavior.react(message);
				if (reaction == false){
					utils.log("...failed!", "WW", message.guild);
				}
				else if (reaction == null){
					utils.log("...nothing to respond to that", "><", message.guild);
				}
				else{
					utils.log("...end of interaction", "OK", message.guild);
				}
			}
			break;
		}
	}
	
	//////////////////////
	// POINT-ADDING BEHAVIOR
	//////////////////////
	if (!issuedCommand){
		let fakeList = [];
		fakeList.push(message.author.id);
		behavior.addPoints(db, fakeList, message.content.length);
	}
});

client.login(config.token);