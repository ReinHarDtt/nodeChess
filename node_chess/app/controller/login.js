module.exports = function(_res,_req){

	this.enterRoom = function(){
		var roomId = lib.httpParam.GET('roomId');
		if(!onlineList[roomId]){
			onlineList[roomId] = [];
		}
		
		if(!onlineList[roomId]['type']){
			onlineList[roomId]['type'] = {};
		}
		var time = 0;
            io.sockets.on('connection', function (socket){
                var  username = sessionLib.username;
				if(!username){
					return;
				}
                if(!onlineList[roomId][username] ){
                    onlineList[roomId][username] = socket;
                }
                var refresh_online = function(){
                    var n = [];
					var athlete = '';
                    for (var i in onlineList[roomId]){
						if(i != 'type'){
							n.push(i);
						}
                    }
					switch(n.length){
						case 1 : athlete = '红方';
						break;
						case 2 : athlete = '黑方';
						break;
						default : athlete = '吃瓜群众';
						break;
					}
					if(n.length > 1){
						publicMsg(roomId, 'start', {'msg':'start game'});
					}
					onlineList[roomId]['type'][username] = athlete;
					onlineList[roomId][username] = socket;
					socket.emit('type', {'type' : athlete});
                }
				//确保每次发送一个socket消息
                if(time > 0){
                    return;
                }
                refresh_online();
                socket.on('msg01',function(data){
                	publicMsg(roomId, 'msg01', data);
                });
				socket.on('msg02', function(data){
					publicMsg(roomId, 'msg02', data);
					console.log(onlineList);
                });

				socket.on('aniBegin',function(data){
					publicMsg(roomId, 'aniBegin',data);
				});

				socket.on('noBegin',function(data){
					publicMsg(roomId, 'noBegin',data);
				});

				socket.on('yesBegin',function(){
					publicMsg(roomId, 'yesBegin');
				});

				socket.on('chessBack',function(data){
					publicMsg(roomId, 'chessBack',data);
				});

                socket.on('disconnect', function(){
                    delete onlineList[roomId][username];
					delete onlineList[roomId]['type'][username];
					publicMsg(roomId, 'game_over', {'msg':'user has left the room, you are win!'});
                    refresh_online();
                });
                time++;
            });
			var readPath = VIEW +lib.url.parse('index.html').pathname;
			var indexPage = lib.fs.readFileSync(readPath);
			_res.writeHead(200, { 'Content-Type': 'text/html' });
			_res.end(indexPage);
	}
	
	function publicMsg(roomId, type, msg){
		for (var i in onlineList[roomId]){
			if(i != 'type'){
				onlineList[roomId][i].emit(type, msg);
			}
        }
	}
}