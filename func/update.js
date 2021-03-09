
module.exports = {
    updateLb: function(msg, page, user){
        let user_data = {
            tag : user.tag,
            profile : user.avatarURL()
        };
        let outputs = server.rank(msg.channel.guild,msg.channel.type);
        botMsg.list(outputs,page,msg,1,user_data);
    }
}