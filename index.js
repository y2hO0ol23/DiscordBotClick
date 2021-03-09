const Discord = require('discord.js');
const client = new Discord.Client();
const bot_data = require("./data/bot.json");
const botStr = require("./data/output.json");

client.login(bot_data.token);

global._get = {
    client: function() {
        return client;
    },
    ldPage: function(msg, page) {
        let i = botStr.message.leaderboard.length + " ( ".length;
        for(;msg[i] !== '/'; i++) page.now = (page.now * 10) + msg[i];
        for(i++;msg[i] !== ' '; i++) page.max = (page.max * 10) + msg[i];
        page.now *= 1;
        page.max *= 1;
        return page;
    }
}

global.client = client;
global.stopbot = false;
global.bot_id;
global.new_comment;

global.messages = [];
global.LDmsg = [];
global.randomBox = {
    time : 0,
    score : 0,
    now : 0,
    data : [],
    clicked : [],
    randomNum : 0,
    last_time : new Date() + ""
}

const _RB = require("./func/random_box.js");
const botMsg = require("./func/bot_messages");
const setFile = require('./setFile');
const setBot = require("./func/set_bot");
const answerUser = require("./func/answer");

let serial = Math.round(Math.random() * (Number.MAX_SAFE_INTEGER - 1));

client.on('ready', () => {
    console.log("Logged in as " + client.user.tag + "!");
    console.log(">" + serial);
    console.log("");
    
    global.bot_id = client.user.id;
    setFile.list();
    botMsg.active();
    _RB.add();
});

client.on('message', msg => {
    if(global.stopbot) return;
    let msg_data = msg.content;
    if(msg.author.bot === true){ setBot.msgInputed(msg); }
    else if(msg_data[0] === ">"){ answerUser.run(msg); }
    else { answerUser.mention(msg); }
});

client.on('messageReactionAdd', async (messageReaction, user) => {
    let removed = 0;
    runReaction(messageReaction, user, removed);
});

client.on('messageReactionRemove', async (messageReaction, user) => {
    let removed = 1;
    runReaction(messageReaction, user, removed);
});

runReaction = function(messageReaction, user, removed){
    if(global.stopbot) return;
    let msg = messageReaction.message;
    if(user.bot) return;
    if(msg.channel.type === 'dm') return;
    if(msg.author.bot === false) return;
    setBot.msgReacted(messageReaction,user,removed);
}