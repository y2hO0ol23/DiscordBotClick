const Discord = require('discord.js');
const { send } = require('process');
const client = new Discord.Client();
const bot_data = require("./bot_data.json");
client.login(bot_data.token);
var fs = require('fs');

let bot_id = undefined;

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    let server_list;
    fs.exists('./Click_server_list.json', (exists) => {
        if(!exists) {
            server_list = {"data":[{"name" : "NONE","server" : -1,"score" : -1}]};
            fs.writeFile('./Click_server_list.json',JSON.stringify(server_list),'utf8',function(err){});
            console.log("Added New file (./Click_server_list.json)");
        }
        else { // json 파일을 열때 오류가 생긴다면 새롭게 생성
            try{
                server_list = require('./Click_server_list.json');
            }
            catch(err) {
                server_list = {"data":[{"name" : "NONE","server" : -1,"score" : -1}]};
                fs.writeFile('./Click_server_list.json',JSON.stringify(server_list),'utf8',function(err){});
                console.log("Reset file (./Click_server_list.json) -> data was wrong");
            }
        }
    });
    update_active();
});

let emoji_data = {click : '👆',erase : '❌',next : "➡", back : "⬅",reload : "🔄",start : "🏁"};
let bot_output = {
    click : "클릭하세요**! >> Count : ",
    leaderboard : "> **리더보드**",
    link : "https://discord.com/api/oauth2/authorize?client_id=815675245720502304&permissions=10240&scope=bot",
    backup : "``백업완료``",
    description : "**Click!** with "
};

client.on('message', msg => {
    if(bot_id === undefined){
        msg.react(emoji_data.start);
    }
    let msg_data = msg.content;
    if(msg.author.bot === true){
        if(msg.channel.type === 'dm') return;
        if(msg_data.substring(0,bot_output.click.length) === bot_output.click){ //클릭 이모티콘 생성
            msg.react(emoji_data.click);
            msg.react(emoji_data.erase);
            return;
        }
        else if(msg_data.substring(0,bot_output.backup.length) === bot_output.backup){ //클릭 이모티콘 생성
            setTimeout(function() {
                msg.delete();
            }, 3000);
            return;
        }
        else{
            try{
                let embed_data = msg.embeds[0].title;
                if(embed_data === undefined) return;
                if(msg.channel.type === 'dm') return;
                if(embed_data.substring(0,bot_output.description.length) === bot_output.description){ // 정보 출력시 시간이 지난 후 삭제
                    setTimeout(function() {
                        msg.delete();
                    }, 15000);
                }
                else if(embed_data.substring(0,bot_output.leaderboard.length) === bot_output.leaderboard){
                    let page = {
                        max : 0,
                        now : 0
                    }
                    let start = bot_output.leaderboard.length + "\nPage ".length;
                    _getPage(start,embed_data,page);
                    leaderboard_emoji(msg,page);
                }
            }
            catch(err) {return;}
        }
    }
    else if(msg_data[0] === ">"){
        msg_data = msg_data.slice(1);
        if(msg_data === "클릭"){
            if(msg.channel.type === 'text') msg.delete();
            if(msg.channel.type === 'dm'){ // 개인 메시지로 사용 불가
                msg.channel.send("``서버에서만 사용할 수 있는 기능입니다``");
                return;
            }
            let output = bot_output.click + server_score(msg.channel.guild,0) + "**";
            msg.channel.send(output);
            return;
        }
        else if(msg_data === "리더보드"){ // 리더보드 출력
            if(msg.channel.type === 'text') msg.delete();
            let outputs;
            let type = msg.channel.type;
            outputs = server_rank(msg.channel.guild,type);
            let page = {
                max : 0,
                now : 1
            }
            showServerList(outputs,page,msg,0,type);
            return;
        }
        else if(msg_data === ""){ // 봇 정보 출력
            bot_description(msg);
        }
        else if(msg_data === "백업"){ // 백업 기능
            let server_list
            if(msg.channel.type === 'text') msg.delete();
            try{server_list = require('./Click_server_list.json');}
            catch(err) {return;}
            fs.writeFile('./Click_server_list_backup.json',JSON.stringify(server_list),'utf8',function(err){});
            msg.channel.send(bot_output.backup);    
        }
    }
    else {
        let msg_string = msg.content + "";
        let loop = msg_string.length;
        let mention = {
            id : 0,
            check : false
        };
        for(let i=2;i<loop;i++){
            if(msg_string.substring(i-2,i+1) === "<@!") {
                mention.check = true;
                continue;
            }
            if(mention.check) {
                if(msg_string.substring(i,i+1) === ">"){
                    mention.check = false;
                    if(mention.id * 1 === bot_id * 1) {
                        bot_description(msg);
                        return;
                    }
                    mention.id === 0;
                }
                else{
                    let number = msg_string.substring(i,i+1) * 1;
                    if(number >= 0 && number <=9){
                        mention.id = (mention.id * 10) + number;
                    }
                    else{
                        mention.check = false;
                        mention.id === 0;
                    }
                }
            }
        }
    }
});

client.on('messageReactionAdd', async (messageReaction, user) => {
    let msg = messageReaction.message;
    if(user.bot) {
        if(bot_id === undefined && messageReaction._emoji.name === emoji_data.start){
            bot_id = user.id;
            update_active();
            if(msg.channel.type === 'text') messageReaction.remove(user);
        }
        return;
    }
    if(msg.channel.type === 'dm') return;
    if(msg.author.bot === false) return;
    
    if(msg.content.substring(0,bot_output.click.length) === bot_output.click){ // 클릭 이모지
        if(messageReaction._emoji.name === emoji_data.erase) {
            let score = server_score(msg.channel.guild,1);
            update_active();
            let new_comment ="<@!" + user.id + ">" + "이(가) 클릭을 싫어합니다";
            msg.edit(comment=new_comment);
            msg.reactions.removeAll();
            setTimeout(function() {
                msg.delete(); // 지우기
            }, 3000);
        }
        else if(messageReaction._emoji.name === emoji_data.click){
            let score = server_score(msg.channel.guild,1);
            update_active();
            msg.edit(comment=bot_output.click + score + "**"); // 내용 변경
        }
        return;
    }
    try{ //오류가 생기면 embed형태가 아니므로 넘어감
        let embed_msg = msg.embeds[0].title; //값 받아오기
        let user_data = (user.username + "#" + user.discriminator);
        if(embed_msg.substring(0,bot_output.leaderboard.length) === bot_output.leaderboard && msg.embeds[0].footer.text === user_data){
            let page = {max : 0,now : 0} // 페이지 만들어놓기
            let start = bot_output.leaderboard.length + "\nPage ".length;
            if(messageReaction._emoji.name === emoji_data.erase) {// 지우기
                msg.delete();
                return;
            }
            else if(messageReaction._emoji.name === emoji_data.reload) {// 지우기
                _getPage(start,embed_msg,page);
            }
            else if(messageReaction._emoji.name === emoji_data.next) {
                _getPage(start,embed_msg,page);
                if(page.now === page.max) return;
                page.now++; //넘기기
            }
            else if(messageReaction._emoji.name === emoji_data.back) {
                _getPage(start,embed_msg,page);
                if(page.now === 1) return;
                page.now--; //돌아가기
            }
            else return;

            let type = msg.channel.type;
            let outputs = server_rank(msg.channel.guild,type);
            showServerList(outputs,page,msg,1,type,user_data);
            msg.reactions.removeAll();
            leaderboard_emoji(msg,page);
            return;
        }
    }
    catch(err){return};
});

function server_score(server_data,added){
    //int로 바꾸기
    server_data.id *= 1;
    let server_list = require('./Click_server_list.json');
    let list_count = server_list.data.length; // 갯수 저장
    let pos = -1;
    //이진탐색으로 서버 찾기
    let bs_st = 0;
    let bs_ed = list_count - 1;
    while(bs_ed >= bs_st){
        let mid = Math.floor((bs_ed + bs_st) / 2);
        let mid_data = server_list.data[mid].server;
        if(mid_data < server_data.id) bs_st = mid + 1;
        if(mid_data > server_data.id) bs_ed = mid - 1;
        if(mid_data === server_data.id){
            pos = mid;
            break;
        }
    }
    // 서버를 불러오지 못했을 경우 새로 추가
    if(pos === -1){
        pos = bs_st;
        for(let i = list_count - 1; i >= pos; i--) server_list.data[i + 1] = server_list.data[i];

        let new_data = {
            name : "",
            server : 0,
            score : 0
        };
        new_data.server = server_data.id;
        server_list.data[pos] = new_data;
    }
    if(server_list.data[pos].name !== server_list.name) server_list.data[pos].name = server_data.name;

    server_list.data[pos].score += added;
    fs.writeFile('./Click_server_list.json',JSON.stringify(server_list),'utf8',function(err){});
    return server_list.data[pos].score;
}

function server_rank(server_data,type){ // 클릭 순위와 현재 서버 정보
    let outputs = {
        score : 0,
        data : [],
        rank_here : 0
    };
    if(type === 'text'){
        let for_server_score = server_data;
        outputs.score = server_score(for_server_score,0);
        server_data.id *= 1;
    }
    outputs.data = _getJson('./Click_server_list.json').data;
    
    let loop = outputs.data.length;
    sort(0,loop - 1,outputs); // 리스트 받아서 정렬
    if(type === 'text'){
        let pushed = 1;
        for(let i = 0; i < loop; i++){
            if(i > 0 && outputs.data[i].score === outputs.data[i - 1].score) pushed--;
            else pushed = 1;
            if(outputs.data[i].server === server_data.id){
                outputs.rank_here = i + pushed;
                break;
            }
        }
    }
    
    return outputs;
}

function sort(st, ed, server_list){ // 클릭 순위 정렬 함수
    if(st >= ed) return;
    let pivot = st;
    let mov_to_ed = pivot + 1;
    let mov_to_st = ed; 
    while(mov_to_ed <= mov_to_st){
        while(mov_to_ed <= ed && server_list.data[mov_to_ed].score >= server_list.data[pivot].score) mov_to_ed++;
        while(mov_to_st > st && server_list.data[mov_to_st].score <= server_list.data[pivot].score) mov_to_st--;
        if(mov_to_ed > mov_to_st){
            let temp = server_list.data[pivot];
            server_list.data[pivot] = server_list.data[mov_to_st];
            server_list.data[mov_to_st] = temp;
        }
        else {
            let temp = server_list.data[mov_to_ed];
            server_list.data[mov_to_ed] = server_list.data[mov_to_st];
            server_list.data[mov_to_st] = temp;
        }
    }
    sort(st,mov_to_st - 1,server_list);
    sort(mov_to_st + 1,ed,server_list);
}

function _getJson(namespace){
    let _getJson = require(namespace);
    return JSON.parse(JSON.stringify(_getJson));
}

function _getPage(i, msg, page){
    for(;(msg[i] * 1) >= 0 && (msg[i] * 1) <= 9; i++) page.now = (page.now * 10) + msg[i];
    for(i++;msg[i] !== '\n'; i++) page.max = (page.max * 10) + msg[i];
    page.now *= 1;
    page.max *= 1;
    return;
}

function showServerList(outputs, page, msg,change,type,user_data){
    let _loop = 5;
    page.max = Math.ceil(outputs.data.length / _loop);
    let embed_output = {here:"",all:"> **리더보드**"};
    if(_loop > 0) embed_output.all += "\n" + "Page " + page.now + "/" + page.max + "\n"; 
    let pushed = {
        same : 1,
        page : 0
    };
    pushed.page = (page.now - 1) * _loop;
    let i = 0;
    for(; i < pushed.page; i++){
        if(outputs.data[i].server === -1) break; 
        if(i > 0 && outputs.data[i].score === outputs.data[i - 1].score) pushed.same--;
        else pushed.same = 1;
    }
    _loop *= page.now;
    for(; i < _loop; i++){
        if(outputs.data[i].server === -1) break; 
        if(i > 0 && outputs.data[i].score === outputs.data[i - 1].score) pushed.same--;
        else pushed.same = 1;

        embed_output.all += (i + pushed.same) + ". " + outputs.data[i].name + " -> Count : " + outputs.data[i].score + "\n";
    }
    for(pushed.same = 1; i < _loop; i++) embed_output.all += (i + pushed.same) + ".\n";

    if(type === 'text') embed_output.here = outputs.rank_here + ". " + msg.channel.guild.name + " -> Count : " + outputs.score;
    else embed_output.here = "Can move page only in server";

    if(user_data === undefined) user_data = (msg.author.username + "#" + msg.author.discriminator);
    const embed_list = {
        color: 0x0099ff,
        description: embed_output.here,
        title: embed_output.all,
        footer : {
            text : user_data
        }
    };
    if(change) msg.edit({embed:embed_list});
    else msg.channel.send({ embed: embed_list });
}

function leaderboard_emoji(msg,page){
    if(page.now !== 1) msg.react(emoji_data.back); //페이지 계산 후 다음 페이지와 이전 페이지 이모티콘
    if(page.now !== page.max) msg.react(emoji_data.next);
    msg.react(emoji_data.reload); // 지우기 이모티콘
    msg.react(emoji_data.erase); // 지우기 이모티콘
}

function update_active(){
    server_list = require('./Click_server_list.json');
    let clicked = 0;
    for(let i=0;i<server_list.data.length;i++) clicked += server_list.data[i].score;
    if(bot_id === undefined) client.user.setActivity("Need chat to get data");
    else client.user.setActivity("[" + clicked + "👆] @Click!");
    return clicked;
}

function bot_description(msg){
    if(msg.channel.type === 'text') msg.delete();
    let server_count = require('./Click_server_list.json').data.length - 1;
    let embed_output = {
        description : "Commands : **>**,  **>클릭**,   **>리더보드**,  **>백업**" + "\n" + "Bot link : " + bot_output.link,
        title : bot_output.description + server_count + " server" + ((server_count > 1) ? "s" : "") + "\n[" + update_active() + "👆]"
    }
    const embed_list = {
        color: 0x0099ff,
        description: embed_output.description,
        title: embed_output.title
    };
    msg.channel.send({ embed: embed_list });
}