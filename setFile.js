const fs = require('fs');

module.exports = {
    save: function(path,json){
        fs.writeFile(path,JSON.stringify(json),'utf8',function(err){});
    },
    list: function(){
        let server_list;
        fs.exists('./data/list.json', (exists) => {
            if(!exists) {
                server_list = {"data":[{"name" : "NONE","server" : -1,"score" : -1}]};
                let path = './data/list.json';
                sfs.writeFile(path,JSON.stringify(server_list),'utf8',function(err){});
                console.log("Added New file (./data/list.json)");
            }
            else { // json 파일을 열때 오류가 생긴다면 새롭게 생성
                try{
                    server_list = require('./data/list.json');
                }
                catch(err) {
                    server_list = {"data":[{"name" : "NONE","server" : -1,"score" : -1}]};
                    let path = './data/list.json';
                    fs.writeFile(path,JSON.stringify(server_list),'utf8',function(err){});
                    console.log("Reset file (./data/list.json) -> data was wrong");
                }
            }
        });
    }
}