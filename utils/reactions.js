//LIBS
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();

//UTILS
const utils = require('./funcs.js');
const databaseFile = './_private/userdata.db';  
let db = new sqlite3.Database(databaseFile);  

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
			
		case "addpoints":
			if (argument == null){
				return false;
			}
			else{
				//Determining user amount
				let pointsToGive = 0;
				let usersToGive = [];
				
				const argArr = argument.split(" ");
				
				if (argArr.length > 0){
					pointsToGive = argArr[0];
				}
				let replyList = [];
				if (argArr.length > 1){
					for (let i = 1; i < argArr.length; i++){
						thisUserId = utils.replyToId(argArr[i]);
						usersToGive.push(thisUserId);
						replyList.push(argArr[i]);
					}
				}
				addPoints(db, usersToGive, parseFloat(pointsToGive), function(){
					sendMessage(message.channel, "Added "+(pointsToGive)+" points to "+replyList.join(" ")+"");
				});
				return true;
			}
			break;
			
		case "getpoints":
		case "level":
			let id = 0;
			if (argument == null){
				id = message.author.id;
			}
			else{
				id = utils.replyToId(argument);
			}
			getPoints(db, id, function(int_points){
				sendMessage(message.channel, "<@"+id+"> has "+int_points+" points");
			});
			return true;
			
			break;
		
		case "setpoints":
			if (argument == null){
				setPoints(db, message.author.id, 0, function(){
						sendMessage(message.channel, "Resetted points for "+message.author.username+"");
					});
			}
			else{
				//Determining user amount
				let pointsToGive = 0;
				let usersToGive = [];
				
				const argArr = argument.split(" ");
				
				if (argArr.length > 0){
					pointsToGive = argArr[0];
				}
				if (argArr.length > 1){
					for (let i = 1; i < argArr.length; i++){
						thisUserId = utils.replyToId(argArr[i]);
						usersToGive.push(thisUserId);
					}
				}
				setPoints(db, usersToGive, pointsToGive, function(){
					let userDisplayList = [];
					for (let i = 0; i < usersToGive.length; i++){
						userDisplayList.push("<@"+usersToGive[i]+">")
					}
					if (usersToGive.length <= 0){
						sendMessage(message.channel, "Set points to "+pointsToGive+" every user")
					}
					else{
						sendMessage(message.channel, "Set "+pointsToGive+" points to "+userDisplayList.join(" "))
					}
				});
			}
			return true;
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
function addPoints (database, userList, int_points, function_callback){
	for (let i = 0; i < userList.length; i++){
		let fakeList = [];
		fakeList.push(userList[i]);
		if (i == userList.length-1){
			getPoints(database, userList[i], function(pointsStock){
				if (!isNaN(int_points)){
					setPoints(database, fakeList, pointsStock+int_points, function(){
						function_callback()});
				}
				else{
					utils.log("Error while adding "+int_points+" to user "+userList[i]+"", "><");
				}
			});
		}
		else{
			getPoints(database, userList[i], function(pointsStock){
				if (!isNaN(int_points)){
					setPoints(database, fakeList, pointsStock+int_points, function(){});
				}
				else{
					utils.log("Error while adding "+int_points+" to user "+userList[i]+"", "><");
				}
			});
		}
	}
}
function setPoints(database, userList, int_points, function_callback){
	
	database.run("CREATE TABLE IF NOT EXISTS users (`id` INT PRIMARY KEY NOT NULL, `points` INT)", function(){
		//Now database exists
		if (userList.length <= 0){
			database.all("UPDATE users SET `points`="+int_points, function(err, rows) {
				if (err){
					utils.log(err, '><');
				}
				function_callback();
			});   
		}
		else{
			for (let i = 0; i < userList.length; i++){
				const request = 'INSERT INTO users (`id`, `points`) VALUES('+userList[i]+', 0)';
				database.all(request, function(err) {
					/*
					utils.log(request, '><');
					utils.log(err, '><');
					*/
					//Now row exists
					if (i == userList.length-1){
						database.all("UPDATE users SET `points`="+int_points+" WHERE `id`="+userList[i], function(err, rows) {
							if (err){
								utils.log(err, '><');
							}
						}, function(){ function_callback();});  
					}
					else{
						database.all("UPDATE users SET `points`="+int_points+" WHERE `id`="+userList[i], function(err, rows) {
							if (err){
								utils.log(err, '><');
							}
						});  
					}					
				});
			}
		}
	});
}

function getPoints(database, userId, function_callback){
	database.run("CREATE TABLE IF NOT EXISTS users (`id` INT PRIMARY KEY NOT NULL, `points` INT)", function(){
		//Now database exists
		
		database.run('INSERT INTO users (`id`, `points`) VALUES ('+userId+', 0)', function() {
			//Now row exists
			database.get('SELECT `points` FROM users WHERE id='+userId, function(err, row) {
				if (err){
					utils.log(err, '><');
				}
				function_callback(row.points);
			});   
		});
	});
}
//...//


//EXPORTS FOR SHARED USE
module.exports = {
   react: 
	function(message){
		return react(message);
	},
   addPoints: 
	function(database, userList, int_points){
		addPoints(database, userList, int_points, function(){});
	},
}
