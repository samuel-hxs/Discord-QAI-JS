//LIBS
const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require("fs");

//UTILS
const utils = require('./utils/funcs.js');

//CONFIG
const config = require('./sys/config.json');

utils.log('QAIx fired ! Preparing...');

client.on('ready', () => {
	utils.log('QAIx ready !');
	client.user.setGame(`with the Seven Hand Node.`);
});

client.login(config.token);