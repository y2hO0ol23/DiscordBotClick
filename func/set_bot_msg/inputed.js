const botStr = require("../../data/output.json");

module.exports = {
    click: function(msg){
        msg.react(botStr.emoji.click);
        msg.react(botStr.emoji.erase);
    },
    func_RB: function (msg){
        global.randomBox.data.push(msg);
        msg.react(botStr.emoji.click);
    },
    ld_Emoji: function(msg){
        msg.react(botStr.emoji.reload);
        msg.react(botStr.emoji.back);
        msg.react(botStr.emoji.next);
        msg.react(botStr.emoji.erase);
    }
}