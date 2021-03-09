const botMsg = require("../bot_messages.js");
const botStr = require("../../data/output.json");
const _RB = require('../random_box.js');

module.exports = {
    erase: function(msg,user){
        botMsg.active();
        global.new_comment ="<@!" + user.id + ">" + "이(가) 클릭을 싫어합니다";
        msg.edit(comment=global.new_comment);
        msg.reactions.removeAll();
    },
    click: function(messageReaction,score){
        let msg = messageReaction.message;
        botMsg.active();
        msg.edit(comment=botStr.message.click + score + "**");
    },
    randomBox: function(msg,user){
        let pushData = {
            msg : msg,
            user : user
        }
        global.randomBox.clicked.push(pushData);
        _RB.open(user);
    },
    leaderboard: function(messageReaction,user){
        let msg = messageReaction.message;
        let embed_msg = msg.embeds[0].title;
        let page = {max : 0,now : 0} // 페이지 만들어놓기
        global._get.ldPage(embed_msg,page);
        if(messageReaction._emoji.name === botStr.emoji.erase) {// 지우기
            msg.delete();
            return;
        }
        else if(messageReaction._emoji.name === botStr.emoji.next) {
            leaderboard.next(page);
        }
        else if(messageReaction._emoji.name === botStr.emoji.back) {
            leaderboard.back(page);
        }
        else if(messageReaction._emoji.name !== botStr.emoji.reload) return;

        leaderboard.update(msg,page,user);
    }
}

const leaderboard = {
    next: function(page){
        if(page.now === page.max) return;
        page.now++; //넘기기
    },
    back: function(page){
        if(page.now === 1) return;
        page.now--; //돌아가기
    },
    update: function(msg, page, user){
        let user_data = {
            tag : user.tag,
            profile : user.avatarURL()
        };
        let outputs = rank(msg.channel.guild,msg.channel.type);
        botMsg.list(outputs,page,msg,1,user_data);
    }
}

