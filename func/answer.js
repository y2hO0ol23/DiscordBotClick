const botStr = require('../data/output.json');

const server = require('./server.js');
const botMsg = require('./bot_messages.js');
const setFile = require('../setFile.js');

module.exports = {
    run: function(msg){
        let msg_data = msg.content;
        msg_data = msg_data.slice(1); // 접두사를 지움
        if(msg_data === "클릭"){ answer.click(msg); }
        else if(msg_data === "리더보드"){ answer.leaderboard(msg) }
        else if(msg_data === ""){ botMsg.description(msg);}
        else if(msg_data === "백업"){ answer.backup(msg); }
        else if(msg_data === "랜덤박스"){ answer.setRandomBoxChannel(msg); }
        else if(msg_data * 1 === serial){ serial.input(msg); }
        else if(msg_data === "serial"){ serial.get(msg); }
    },
    mention: function(msg){
        let msg_string = msg.content + "";
        let loop = msg_string.length;
        let mention = {
            id : 0,
            check : false
        };
        for(let i=2;i<loop;i++){
            if(msg_string.substring(i-2,i+1) === "<@!") { mention.check = true; } // 멘션이 시작되었을때 멘션 탐지 on
            else if(mention.check) {
                if(msg_string.substring(i,i+1) === ">") { // 멘션이 끝났을때
                    mention.check = false; //멘션 탐지 off
                    if(mention.id * 1 === global.bot_id * 1) { // 만약 같으면
                        botMsg.description(msg); // 봇 설명 출력
                        return;
                    }
                    mention.id === 0; // 초기화
                }
                else{
                    let number = msg_string.substring(i,i+1) * 1; // 멘션 중 일때
                    if(number >= 0 && number <=9) { // 숫자라면
                        mention.id = (mention.id * 10) + number; // 값을 계산
                    }
                    else {
                        mention.check = false; // 숫자가 아니라면 멘션 탐지 off
                        mention.id === 0;
                    }
                }
            }
        }
    }
}

const answer = {
    click: function(msg){
        if(msg.channel.type === 'text') msg.delete();
        if(msg.channel.type === 'dm'){ // 개인 메시지로 사용 불가
            msg.channel.send("``서버에서만 사용할 수 있는 기능입니다``");
            return;
        }
        let output = botStr.message.click + (server.score(msg.channel.guild,0)) + "**";
        msg.channel.send(output);
        return;
    },
    leaderboard: function(msg){
        if(msg.channel.type === 'text') msg.delete();
        let type = msg.channel.type;
        let server_rank = server.rank(msg.channel.guild,type);
        let page = {
            max : 0,
            now : 1
        }
        botMsg.list(server_rank,page,msg,0);
        return;
    },
    backup: function(msg){
        let server_list
        if(msg.channel.type === 'text') msg.delete();
        try{server_list = require('../data/list.json');}
        catch(err) {return;}
        let path = './data/list_backup.json';
        setFile.save(path,server_list);
        msg.channel.send(botStr.message.backup);
    },
    setRandomBoxChannel: function(msg){
        let server_list
        if(msg.channel.type === 'text') msg.delete();
        if(msg.channel.type === 'dm'){ // 개인 메시지로 사용 불가
            msg.channel.send("``서버에서만 사용할 수 있는 기능입니다``");
            return;
        }
        server_list = require('../data/list.json');
        let pos = server.pos(server_list,msg.guild);
        try{
            msg.channel.send(botStr.message.randomBoxMoved);
            server_list.data[pos].channel = msg.channel.id;
        }
        catch(err){return;}
        let path = './data/list.json';
        setFile.save(path,server_list);
    }
}

const serial = {
    input: function(msg){
        if(msg.channel.type === 'text') msg.delete(); // 봇 정지
        global.stopbot = true;
        let loop = global.messages.length;
        for(let i = 0; i < loop; i++) try{global.messages[i].delete();}catch(err){continue;}
        loop = global.randomBox.data.length;
        for(let i = 0; i < loop; i++) try{global.randomBox.data[i].delete();}catch(err){}
        setTimeout(function() {
            console.log("Stopped || "  + new Date());
            send_dm(msg,"**Stopped** || " + new Date());
        }, 100);
    },
    get: function(msg){
        if(msg.channel.type === 'text') msg.delete();
        console.log(">" + serial);
        send_dm(msg,"**Sended** || " + new Date());
    }
}

send_dm = async function(msg, msg_send){
    let dm_Channel = await msg.author.createDM();
    await dm_Channel.send(msg_send);
}
