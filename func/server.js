const setFile = require('../setFile.js');

module.exports = {
    score: function(server_data,added){ return score(server_data,added); },
    pos: function(server_list,server_data){ return pos(server_list,server_data); },
    rank : function(server_data,type){ return rank(server_data,type); }
}

score = function(server_data,added){ //스코어 값 가져오기 (added만큼 스코어 변경)
    let path = './data/list.json';
    let server_list = require('.' + path); // 데이터 꺼내기
    let _pos = pos(server_list,server_data);
    server_list.data[_pos].score += added;

    setFile.save(path,server_list);
    return server_list.data[_pos].score;
}

pos = function(server_list,server_data){ // 서버가 저장되어있는 위치 가져오기
    server_data.id *= 1;
    let list_count = server_list.data.length; // 갯수 저장
    let pos = -1; // 위치가 0 미만이 될 수 없기 때문에 찾지 못할경우 pos = -1
    let bs_st = 0; //이진탐색
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
    if(pos === -1){ // 서버를 불러오지 못했을 경우 새로 추가
        pos = bs_st;
        for(let i = list_count - 1; i >= pos; i--) server_list.data[i + 1] = server_list.data[i]; // 넣을 부분부터 뒤로 밀기

        let new_data = {
            name : "",
            server : 0,
            score : 0
        };
        new_data.server = server_data.id;
        server_list.data[pos] = new_data; // 위치에 새로운 값을 저장
    }
    if(server_list.data[pos].name !== server_list.name) server_list.data[pos].name = server_data.name; // 서버 이름이 다르다면 바꾸기
    return pos;
}

sort = function(st, ed, server_list){ // 클릭 순위 정렬 함수
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

rank = function(server_data,type){// 클릭 순위와 현재 서버 정보 가져오기
    let outputs = {
        score : 0,
        data : [],
        rank_here : 0
    };
    if(type === 'text'){
        let for_server_score = server_data;
        outputs.score = score(for_server_score,0);
        server_data.id *= 1;
    }
    outputs.data = JSON.parse(JSON.stringify(require('../data/list.json'))).data;
    
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