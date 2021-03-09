const botStr = require("../data/output.json");

const setMsgInputed = require('./set_bot_msg/inputed.js');
const setMsgReacted = require('./set_bot_msg/reacted.js');
const server = require('./server.js');

module.exports = {
    msgInputed: function(msg){
        let msg_data = msg.content;
        if(msg.channel.type === 'dm') return;
        if(msg.author.id !== global.bot_id) return;
        global.messages.push(msg);
        if(msg_data.substring(0,botStr.message.click.length) === botStr.message.click){ setMsgInputed.click(msg); } // 클릭
        else if(msg_data.substring(0,botStr.message.backup.length) === botStr.message.backup){ erase(msg,5000); } // 백업
        else if(msg_data.substring(0,botStr.message.randomBox.length) === botStr.message.randomBox){ setMsgInputed.func_RB(msg); } // 랜덤박스 (이모지 + 메시지 위치 저장)
        else if(msg_data.substring(0,botStr.message.randomBoxMoved.length) === botStr.message.randomBoxMoved){ erase(msg,5000); }// 랜덤박스 생성 위치 설정
        else{
            let embed_data;
            try{embed_data = msg.embeds[0].title;}catch(err) {return;}
            if(embed_data === undefined) return;
            if(msg.channel.type === 'dm') return;
            if(embed_data.substring(0,botStr.message.description.length) === botStr.message.description){ erase(msg,20000); } // 정보 출력
            else if(embed_data.substring(0,botStr.message.leaderboard.length) === botStr.message.leaderboard){ setMsgInputed.ld_Emoji(msg); } // 이모지
        }
    },
    msgReacted: function(messageReaction,user,removed){
        let msg = messageReaction.message;
        let score = server.score(msg.channel.guild,1);  
        if(msg.content.substring(0,botStr.message.click.length) === botStr.message.click){ // 클릭!
            if(messageReaction._emoji.name === botStr.emoji.erase) { // 지우기
                setMsgReacted.erase(msg,user);
                erase(msg,5000);
            }
            else { setMsgReacted.click(messageReaction,score); } // 누르기
        }
        else if(removed === 0 && msg.content.substring(0,botStr.message.randomBox.length) === botStr.message.randomBox){ //랜덤박스
            if(messageReaction._emoji.name === botStr.emoji.click && global.randomBox.score > 0) {
                setMsgReacted.randomBox(msg,user);
            }
        }
        else {
            let embed_msg;
            try{ embed_msg = msg.embeds[0].title; }catch(err){return;}
            let user_data = {
                tag : user.tag,
                profile : user.avatarURL()
            };
            if(msg.embeds[0].footer.text.substring(0,user_data.tag.length) + "" === user_data.tag + ""){ // 같은 사람이 눌렀을때
                if(embed_msg.substring(0,botStr.message.leaderboard.length) === botStr.message.leaderboard){ setMsgReacted.leaderboard(messageReaction,user,removed); }// 리더보드
            }
        }
    }
}

erase = function(msg, Msec){
    if(Msec === undefined){
        msg.delete();
        return;
    }
    setTimeout(function() {
        msg.delete();
    }, Msec);
}