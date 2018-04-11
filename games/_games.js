
//UTILS
const utils = require('../utils/funcs.js');

//GAMES
const hangmanGame = require('./hangman.js');


function react(message){
	let msgString = message.content;
	let argument = null;
	
	if (msgString.indexOf(" ") > -1){
		const index = msgString.indexOf(" ");
		argument = msgString.substring(index+1, msgString.length);
		msgString = msgString.substring(0, index);
		utils.log("...after argument removal, reacting (game) to "+msgString+"["+argument+"]...", "..", message.guild);
	}
	//Commands made more easy
	msgString = msgString.toLowerCase();
	//endof
	
	const aId = parseInt(message.author.id)		
	
	switch (msgString){

		case "hangman":
			hangmanGame.handleGameCommand(message, argument);
			break;
	}
}


function inGame(){
	return hangmanGame.isGameOn();
}


//EXPORTS FOR SHARED USE
module.exports = {
   inGame: 
    function(){
        return inGame();
    }
}  