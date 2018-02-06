//LIBS
const Discord = require('discord.js');
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

//UTILS
const utils = require('../utils/funcs.js');
const funcs = require('../utils/reactions.js');
const databaseFile = './_private/userdata.db';  
let db = new sqlite3.Database(databaseFile);

//PRIV VARS
let b_hStarted = false;
let a_hPlayers = [];
let a_hPlayerNames = [];
let hPot = 0;
let embedContent;
let lastEmbedMessage;

function handleGameCommand(message, args) {
	if(!b_hStarted) {
		startGame(message, args);
	} else {
		joinGame(message, args);
	}
}

function startGame(message, args) {
	if(a_hPlayers.indexOf(message.author.id) > -1) return;

	if(args == null) 
	{
		message.channel.send(`Don't be silly ${message.author.toString()}! You need to bet some points!`);
	} else {
		message.channel.send(`${message.author.toString()} has started a game of hangman.`);
		b_hStarted = true;

		a_hPlayers.push(message.author.id);
		a_hPlayerNames.push(message.author.username);

		refreshList(message.channel, message.author);
	}
}

function joinGame(message, args) {
	if(a_hPlayers.indexOf(message.author.id) > -1) return;

	if(args == null) {
		message.channel.send(`Don't be silly ${message.author.toString()}! You need to bet some points!`);
	} else {
		message.channel.send(`${message.author.toString()} has joined the game!`);

		a_hPlayers.push(message.author.id);
		a_hPlayerNames.push(message.author.username);

		refreshList(message.channel, message.author);
	}
}

function refreshList(channel, player) {
	if(lastEmbedMessage != null)
		lastEmbedMessage.delete();

	embedContent = new Discord.RichEmbed();
	embedContent.setTitle("Hangman Player List");
	embedContent.setColor(3447003);
	embedContent.setThumbnail("https://www.shareicon.net/download/2015/08/19/87559_grey_1042x1042.png");
	embedContent.addField("Name", `${a_hPlayerNames.map(g => g).join("\n")}`, true);
	embedContent.addField("Prize Pot", `${hPot}`, true);
	embedContent.setTimestamp();

	channel.send(embedContent).then(message => lastEmbedMessage = message);
}

//EXPORTS FOR SHARED USE
module.exports = {
   handleGameCommand: 
	function(message, args){
		handleGameCommand(message, args);
	},
} 