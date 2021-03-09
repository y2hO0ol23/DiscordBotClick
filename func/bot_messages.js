const botStr = require("../data/output.json").message;

module.exports = {
    list: function(outputs, page, msg, change, user_data){
        let type = msg.channel.type;
        let _loop = 5;
        page.max = Math.ceil(outputs.data.length / _loop);
        let embed_output = {here:"",all: botStr.leaderboard};
        if(_loop > 0) embed_output.all += " ( " + page.now + "/" + page.max + " )\n"; 
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
    
        if(user_data === undefined) {
            user_data = {
                tag : msg.author.tag,
                profile : msg.author.avatarURL()
            }
        }
        global.date = new Date() + "";
        const embed_list = {
            color: 0x0099ff,
            description: embed_output.here,
            title: embed_output.all,
            footer : {
                text : user_data.tag + "\n" + global.date,
                icon_url : user_data.profile
            }
        };
        if(change) msg.edit({embed:embed_list});
        else msg.channel.send({ embed: embed_list });
    },
    active: function(){ return active() },
    description: function(msg){
        if(msg.channel.type === 'text') msg.delete();
        let server_count = require('../data/list.json').data.length - 1;
        date = new Date() + "";
        let embed_output = {
            description : "Commands : **>**,  **>클릭**,   **>랜덤박스**,   **>리더보드**,  **>백업**" + "\n" + "Bot link : " + botStr.link,
            title : botStr.description + server_count + " server" + ((server_count > 1) ? "s" : "") + "\n[" + active() + "👆]",
            footer_text : global.date + "" + "\nLast random box : " + global.randomBox.last_time
        }
        const embed_list = {
            color: 0x0099ff,
            description: embed_output.description,
            title: embed_output.title,
            footer : {
                text : embed_output.footer_text
            }
        };
        msg.channel.send({ embed: embed_list });
    }
}

active = function(){
    let client = global._get.client();
    let server_list = require('../data/list.json');
    let clicked = 0;
    for(let i=0;i<server_list.data.length;i++) clicked += server_list.data[i].score;
    client.user.setActivity("[" + clicked + "👆] @Click!");
    return clicked;
}