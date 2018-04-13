//LIBS
const Discord = require('discord.js');
const fs = require("fs");
const sqlite3 = require('sqlite3').verbose();
const randomWord = require('random-word');

//UTILS
const utils = require('../utils/funcs.js');
const funcs = require('../utils/reactions.js');

//PRIV VARS
const maxTries = 10;

let b_hStarted = false;
let b_hGameOn = false;
let b_hFinished = false;
let b_EntryLocked = false;

let players = [];
let a_hPlayers = [];
let a_hPlayerNames = [];
let guessedLetters = [];
let guessingWord = [];

let hTimer = 0;
let remainingGuesses = 0;
let hPot = 0;

let embedContent;
let lastEmbedMessage;
let currentWordIndex;
let activePlayer;

function checkPointsAfterBet(user) {
    funcs.getPoints(db, user, function(int_points){
        if(int_points < args) {
            return false;
        } else {
            return true;
        }   
    });
}

function handleGameCommand(message, args) {
    if(!b_hStarted) {
        startGame(message, args);
    } else {
        joinGame(message, args);
    }
}

function startGame(message, args) {
    if(a_hPlayers.indexOf(message.author.id) > -1) return;

    if(args == null) {
        message.channel.send(`Don't be silly ${message.author.toString()}! You need to bet some points!`);
    } else {
        if(!checkPointsAfterBet(message.author.id)) {
            return message.channel.send(`${message.author.toString()} you do not have enough points to bet that amount!`);
        } else {
            funcs.addPoints(db, message.author.id, parseFloat(-args))

            message.channel.send(`${message.author.toString()} has started a game of hangman. Everyone has 45 seconds to join!`);
            b_hStarted = true;

            //players.push({"name": message.author.username, "id": message.author.id});
            a_hPlayers.push(message.author.id);
            a_hPlayerNames.push(message.author.username);


            hTimer = setTimeout(beginHangman, 1000, message.channel);
            //hTimer = setTimeout(beginHangman, 45000, message.channel);

            refreshList(message.channel, message.author);
        }
    }
}

function joinGame(message, args) {
    if(a_hPlayers.indexOf(message.author.id) > -1) return;
    if(b_EntryLocked) return;

    if(args == null) {
        message.channel.send(`Don't be silly ${message.author.toString()}! You need to bet some points!`);
    } else {
        if(!checkPointsAfterBet(message.author.id)) {
            return message.channel.send(`${message.author.toString()} you do not have enough points to bet that amount!`);
        }
        else {
            funcs.addPoints(db, message.author.id, parseFloat(-args))

            message.channel.send(`${message.author.toString()} has joined the game!`);

            //players.push({"name": message.author.username, "id": message.author.id});
            a_hPlayers.push(message.author.id);
            a_hPlayerNames.push(message.author.username);

            refreshList(message.channel, message.author);
    	}
    }
}

function refreshList(channel, player) {
    if(lastEmbedMessage != null)
        lastEmbedMessage.delete();

    embedContent = new Discord.RichEmbed();
    embedContent.setTitle("Hangman Player List");
    embedContent.setColor(3447003);
    embedContent.setThumbnail("https://www.shareicon.net/download/2015/08/19/87559_grey_1042x1042.png");
    embedContent.addField("Name", `${players.name.map(g => g).join("\n")}`, true);
    embedContent.addField("Prize Pot", `${hPot}`, true);
    embedContent.setTimestamp();

    channel.send(embedContent).then(message => lastEmbedMessage = message);
}

function beginHangman(channel) {
    clearTimeout(hTimer);
    remainingGuesses = maxTries;
    b_EntryLocked = true;

    guessingWord = [];
    guessedLetters = [];

    if(a_hPlayers.length == 0) {
        channel.send(`Points refunded, not enough players to start.`);
    } else {
        currentWordIndex = randomWord();

        utils.log("The word is " + currentWordIndex);

        for (let i = 0; i < currentWordIndex.length; i++) {
            guessingWord.push("-");
        }

        // Start a game
        channel.send(`${a_hPlayers.length} players are registered. Starting game in 10 seconds.`);
        hTimer = setTimeout(function() {
            processTurn(channel);
        }, 10000);
    }
}

function processTurn(channel) {
    clearTimeout(hTimer);

    if(lastEmbedMessage != null)
        lastEmbedMessage.delete();

    embedContent = new Discord.RichEmbed();
    embedContent.setTitle(`Guess the word!`);
    embedContent.setColor(3447003);
    embedContent.setThumbnail("https://www.shareicon.net/download/2015/08/19/87559_grey_1042x1042.png");
    embedContent.addField("Word", `${guessingWord.map(g => g).join(" ")}`, true);
    embedContent.addField("Prize Pot", `${hPot}`, true);
    embedContent.addField("Remaining Guesses", `${remainingGuesses}`, true);
    embedContent.setTimestamp();

    channel.send(embedContent).then(message => lastEmbedMessage = message);

    //
}

function processAnswer(message, args) {
    if(GetIsGameOn) {
        if(players.indexOf(message.author.id) > -1) {
            if(message.author.username == activePlayer) {
                handleUserGuess(message.channel, message[0]);
            }
        }
    }
}

function handleUserGuess(channel, letter) {
    let positions = [];

    for (var i = 0; i < currentWordIndex.length; i++) {
        if(currentWordIndex[i] === letter) {
            positions.push(i);
        }
    }

    if (positions.length <= 0) {
        remainingGuesses--;
        channel.send("Incorrect guess!");
    } else {
        // Loop through all the indicies and replace the '_' with a letter.
        for(var i = 0; i < positions.length; i++) {
            guessingWord[positions[i]] = letter;
        }
        channel.send("Correct guess!")
    }

    hTimer = setTimeout(function() {
        processTurn(channel);
    }, 5000);
}

function isGameOn() {
   // utils.log("Running isGameOn");
    return b_hGameOn;
}

//EXPORTS FOR SHARED USE
module.exports = {
   handleGameCommand: 
    function(message, args){
        handleGameCommand(message, args);
    },

    isGameOn:
    function(message, args){
        isGameOn(message, args);
    }
}  
