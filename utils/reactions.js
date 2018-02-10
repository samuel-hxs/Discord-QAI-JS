//LIBS
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const https = require('https');

//UTILS
const utils = require('./funcs.js');
const databaseFile = './_private/userdata.db';  
const trackerfile = './_private/tracker.txt';
let db = new sqlite3.Database(databaseFile);  

const Attachment = require('discord.js').Attachment;

//GAMES
const hangmanGame = require('../games/hangman.js');

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
	
	//Commands made more easy
	mstString = msgString.toLowerCase();
	//endof
	
	switch (msgString){
		default:
			return null; //null => nothing happened
			break;
			
		case "searchplayer":
			if (argument == null){
				return false;
			}
			else{
				utils.log(message.author.username+" is performing an user search with term ["+argument+"]...", "..", message.guild);
				const limit = 5;	//Only 5 results
				//Character escaping
				argument = argument.replace(/\\/g, "\\\\")
			   .replace(/\$/g, "\\$")
			   .replace(/'/g, "\\'")
			   .replace(/"/g, "\\\"");
			   
			   
				https.get('https://api.faforever.com/data/player?filter=login=='+argument+'*&page[limit]='+(limit+1)+'', (res) => {
					
					let ok = false;
					switch (res.statusCode){
						default:
							ok = true;
							break;
							
						case 403:
							utils.log("Access forbidden ?! 403 - doing nothing.", "WW", message.guild);
							break;
							
						case 404:
							utils.log("Server not found ?! 404 - doing nothing.", "WW", message.guild);
							break;
							
						case 500:
							utils.log("Server error ?! 505 - doing nothing.", "WW", message.guild);
							break;
					}
					if (ok){
						res.on('data', (d) => {
							const data = JSON.parse(d);
							
							if (data.data.length > 0){
								let finalMsg = "Search results for "+argument+":\n```";
								let maxQ = limit+1;
								for (i = 0; i < Math.min(data.data.length, maxQ); i++){
									const thisPlayer = data.data[i];
									if (thisPlayer.type == "player"){
										finalMsg += thisPlayer.attributes.login+"\n";
									}
									else{
										maxQ++;
										continue;
									}
								}
								if (data.data.length > limit){
									finalMsg += '...\n```Only the first '+limit+" results are displayed";
								}
								else{
									finalMsg += '```';
								}
								return sendMessage(message.channel, finalMsg);
							}
							else{
								utils.log("...no results!", "><", message.guild);
								return sendMessage(message.channel, "No results for this player name.");
							}
						}).on('error', (e) => {
							utils.log("HTTPS request returned following error : ["+(e)+"]. Doing nothing.", "WW", message.guild);
						});
					}
				});
			   
			}
			break;
			
			
		case "player":
			if (argument == null){
				//utils.log(message.author.username+" command misuse, doing nothing.", "><", message.guild);
				return false;
			}
			else{
				utils.log(message.author.username+" is asking info about FAF Player ["+argument+"]...", "..", message.guild);
				
				//Character escaping
				argument = argument.replace(/\\/g, "\\\\")
			   .replace(/\$/g, "\\$")
			   .replace(/'/g, "\\'")
			   .replace(/"/g, "\\\"");
			   ///end of
			   
			   //Single HTTPS-GET should get us everything we need
				https.get('https://api.faforever.com/data/player?filter=login=='+argument+'&include=clanMemberships.clan,globalRating,ladder1v1Rating', (res) => {
					//console.log('statusCode:', res.statusCode);
					//console.log('headers:', res.headers);
					let ok = false;
					switch (res.statusCode){
						default:
							ok = true;
							break;
							
						case 403:
							utils.log("Access forbidden ?! 403 - doing nothing.", "WW", message.guild);
							break;
							
						case 404:
							utils.log("Server not found ?! 404 - doing nothing.", "WW", message.guild);
							break;
							
						case 500:
							utils.log("Server error ?! 505 - doing nothing.", "WW", message.guild);
							break;
					}
					if (ok){
						res.on('data', (d) => {
							const data = JSON.parse(d);
							if (data.data.length > 0){
								utils.log("....found player ! Retrieving data...", "..", message.guild);
								
								let player = {
									id : data.data[0].id,
									name : data.data[0].attributes.login,
									createTime : data.data[0].attributes.createTime,
									updateTime : data.data[0].attributes.updateTime,
									clans : [],
									aliasesArr : data.data[0].relationships.names.data
								}
								
								const inc = data.included;
								
								for (let i = 0; i < inc.length; i++){
									let thisData = inc[i];
									switch (thisData.type){
										default:
											continue;
											break;
										
										case "clan":	
											player.clans.push({
												name: thisData.attributes.name,
												tag: thisData.attributes.tag,
												size: thisData.relationships.memberships.data.length,
												websiteUrl: thisData.attributes.websiteUrl,
											});
											break;
										
										case "globalRating":	
											player.global = {};
											player.global.numGames = thisData.attributes.numgames;
											player.global.rating = thisData.attributes.rating;
											player.global.rank = thisData.attributes.rank;
											break;
										
										case "ladder1v1Rating":	
											player.ladder = {};
											player.ladder.numGames = thisData.attributes.numgames;
											player.ladder.rating = thisData.attributes.rating;
											player.ladder.rank = thisData.attributes.rank;
											break;
									}
								}
								
								let response = "Player info for ["+player.name+"]\n\n```";
								
								response+= "ID : "+player.id+"\n";
								aliasString = "None";
								/*
								if (player.aliasesArr.length > 0){
									aliasString = player.aliasesArr.join(",");
								}
								*/
								response+= "ALIASES : "+aliasString+"\n";
								
								if (player.ladder){
									response+= "\n- LADDER -\n";
									response+= "Rating : "+player.ladder.rating+"\n";
									//response+= "Games : "+player.ladder.numGames+"\n";
									//response+= "Rank : #"+player.ladder.rank+"\n";
								}
								
								if (player.global){
									response+= "\n- GLOBAL -\n";
									response+= "Rating : "+player.global.rating+"\n";
									//response+= "Games : "+player.global.numGames+"\n";
									//response+= "Rank : #"+player.global.rank+"\n";
								}
								
								if (player.clans.length > 0){
									response+= "\n- CLAN INFO -\n";
									for (i = 0; i < player.clans.length; i++){
										const thisClan = player.clans[i];
										response+= "Name : "+thisClan.name+"["+thisClan.tag+"]\n";
										response+= "Clan size : "+thisClan.size+"\n";
										response+= "URL : "+thisClan.websiteUrl+"\n";
										
										response+="\n";
									}
								}
								response += "```";
								utils.log("...retrieved and returned full data in the guild.", "OK", message.guild);
								return sendMessage(message.channel, response);
							}
							else{
								utils.log("...non-existing player!", "><", message.guild);
								return sendMessage(message.channel, "Requested player do not exist.");
							}
						});
					}

				}).on('error', (e) => {
					utils.log("HTTPS request returned following error : ["+(e)+"]. Doing nothing.", "WW", message.guild);
				});
				return 1;
			}
			break;
			
		case "sendtracker":
			if (fs.existsSync(trackerfile)){
				message.author.send({ files: [new Attachment(trackerfile)] });
				utils.log("Sent trackerfile to "+message.author.username+"", "--", message.guild);
				return true;
			}
			else {
				sendMessage(message.author, "No trackerfile to send!");
				utils.log("No trackerfile to send to "+message.author.username+"", "--", message.guild);
				return true;
			}
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
						sendMessage(message.channel, "Reset points for "+message.author.username+"");
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
		case "help":
			sendMessage(message.author, "Hi there! I have a documentation on our Wiki :slight_smile:. Wiki Article for QAI: *Link here*.");
			break;
		case "hangman":
			hangmanGame.handleGameCommand(message, argument);
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
