//UTILS
const utils = require('./funcs.js');

//EXPORTS AT EOF

////////////////
/// REACT FUNCTION
////////////////

function react(message){
	let msgString = message.content;
	let argument = null;
	
	if (msgString.indexOf(" ") > -1){
		const index = msgString.indexOf(" ");
		argument = msgString.substring(index+1, msgString.length);
		msgString = msgString.substring(0, index);
		utils.log("...after argument removal, reacting to "+msgString+"["+argument+"]...", "..", message.guild);
	}

	switch (msgString){
		default:
			return null; //null => nothing happened
			break;
		
		case "respond":
		case "alive":
			return respond(message, "QAIx has not crashed yet.", message.author);
			break;
			
		case "gym":
			if (argument == null){
				let string = "*whips everyone on behalf of <@"+message.author.id+">* GO TO GYM NOW! PUMP THAT IRON! GROW THE BICEPS! EAT THAT PROTEIN!";
				return sendMessage(message.channel, string);
			}
			else{
				const args = argument.split(" ");
				let users = [];
				for (let i = 0; i < args.length; i++){
					const thisUser = args[i];
					if (thisUser.substring(0, 2) == "<@" && thisUser.substring(thisUser.length-1, thisUser.length) == ">"){
						users.push(thisUser);
					}
				}
				if (users.length > 0){
					let string = "*whips "+users.join(',')+" on behalf of <@"+message.author.id+">* GO TO GYM NOW! PUMP THAT IRON! GROW THE BICEPS! EAT THAT PROTEIN!";
					return sendMessage(message.channel, string);
				}
				return false;
			}
			break;
	}
}
////////////
///	MAIN BOT BEHAVIOR
////////////
function respond(oMessage, rspMsgString, author=null){
	let string = rspMsgString;
	oMessage.reply(string);
	return true;
}
function sendMessage(channel, msgString){
    channel.send(msgString);
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
