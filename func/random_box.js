const botMsg = require('./bot_messages.js');
const server = require('./server.js');
const botStr = require("../data/output.json");

module.exports = {
    set: function (clicked){ set(clicked); },
    add: function () { add() },
    reset: function (){ reset() },
    open: function (this_user) {
        global.randomBox.randomNum = Math.round(Math.random() * (global.randomBox.clicked.length - 1)); // 전역변수이기에 랜덤값은 하나로 정해지므로
        let randomData = global.randomBox.clicked[global.randomBox.randomNum]; // 이 값도 하나가 됨
        let msg = randomData.msg;
        let user = randomData.user;
        if(user !== this_user) return; // 함수를 동시에 실행했을때 자신이 이 유저가 아니라면 리턴 (결국 한번 실행)
    
        new_comment ="<@!" + user.id + ">" + "이(가) [" + global.randomBox.score + botStr.emoji.click + "]를 획득하였습니다.";
        msg.edit(comment=new_comment);
    
        let consolLogScore =  botMsg.active(); //로그출력을 위한 원래 클릭 수 저장
        server.score(msg.channel.guild,global.randomBox.score - 1);
        console.log(consolLogScore + " -> " + ( botMsg.active())); //로그 출력
    
        botMsg.active(); //스코어가 바뀌었으므로 상태메시지 변경
        msg.reactions.removeAll();
        set(msg);
        global.randomBox.clicked = []; // 완전 초기화
        global.randomBox.score = 0; // 스코어 초기화
    }
}

set = function(clicked){
    if(clicked === undefined){ clearRandomBoxArr(); } // 클릭한 경우가 아니라면 삭제만
    else{
        new_comment = "**" + clicked.guild.name + "**에서 [" + global.randomBox.score + botStr.emoji.click + "]를 획득하였습니다.";
        for(let i = 0; i < global.randomBox.data.length; i++){
            let msg = global.randomBox.data[i];
            if(clicked === msg) continue; // 클릭한 메시지와 정보가 같다면 다른 문구
            msg.edit(comment=new_comment);
            msg.reactions.removeAll();
        }
        add();
    }
}

add = function(){
    let Milisec = {
        max : 300000, //5분
        min : 150000   //2.5분
    }
    //Milisec = {max : 10000,min : 10000};
    let server_count = require('../data/list.json').data.length;
    let score = {
        max : 6 * server_count,
        min : Math.round(1.5 * server_count)
    }
    global.randomBox.time = Math.round(Math.random() * (Milisec.max - Milisec.min) + Milisec.min);
    console.log("global.randomBox delay : " + (global.randomBox.time / 60000) + "m");
    let thisbox = ++global.randomBox.now;
    setTimeout(function() {
        if(thisbox === global.randomBox.now && !global.stopbot) {
            global.randomBox.score = Math.round(Math.random() * (score.max - score.min) + score.min);
            console.log("global.randomBox score (clicked) : " + global.randomBox.score);
            reset();
        }
    }, global.randomBox.time);
}

reset = function(){
    clearRandomBoxArr();

    let client = global._get.client();
    let server_guilds
    try{server_guilds = client.guilds.valueOf().array();}
    catch(err) {return;}
    for(let i = 0; i < server_guilds.length; i++){
        let channel_list = server_guilds[i].channels.valueOf().array();
        let list = require('../data/list.json');
        let pos = server.pos(list,server_guilds[i]);
        let channel = undefined;
        try{channel = list.data[pos].channel;}catch(err){return;}
        for(let j = 0; j < channel_list.length; j++){
            if(channel !== channel_list[j].id && channel !== undefined) continue;
            try{
                channel_list[j].send(botStr.message.randomBox + global.randomBox.score + botStr.emoji.click + "]를 획득합니다.");
                break;
            }
            catch(err){}
        }
    }
    date = new Date() + "";
    global.randomBox.last_time = date; // 마지막 랜덤상자 획득시간 저장
    set();
}

clearRandomBoxArr = function(){
    for(let i = 0; i < global.randomBox.data.length; i++) try{global.randomBox.data[i].delete();}catch(err){}
    global.randomBox.data = [];
}