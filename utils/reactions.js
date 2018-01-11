//UTILS
const utils = require('./funcs.js');

//EXPORTS AT EOF

////////////////
/// REACT FUNCTION
////////////////

function react(message){
	const msgString = message.content;
	switch (msgString){
		default:
			return null; //null => nothing happened
			break;
		
		case "respond":
		case "alive":
			return respond(message, "QAIx has not crashed yet.", message.author);
			break;
	}
}
////////////
///	MAIN BOT BEHAVIOR
////////////
function respond(oMessage, rspMsgString, author=null){
	let string = rspMsgString;
	/*
	if (author != null && author.id){
		string = "<@"+author.id+">"+string;
	}
	*/
	oMessage.reply(string);
	return true;
}

//...//


//EXPORTS FOR SHARED USE
module.exports = {
   react: 
	function(message){
		return react(message);
	},
}
