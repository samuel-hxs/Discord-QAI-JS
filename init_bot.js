const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");

//Config Files
const config = require('./json/config.json');

client.on('ready', () => {
	console.log("I am ready!");
	client.user.setGame(`with the Seven Hand Node.`);
});

function log(message){
	console.log(message);
}

client.login(config.token);