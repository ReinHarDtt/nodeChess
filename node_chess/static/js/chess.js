// author:焦锦辉
// PLAY FOR FUN
var socket = io.connect('http://192.168.1.114:1337');

socket.on('type',function(data){
	var type = data['type'];
	$('.you').html(type);
});
var roomId = location.search.substring(8);
var NEXT = '红方';
function Character() {
    this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0; 
	/**0普通1DEAD*/
	this.state = 0;
	this.id = "";
	/** 1车2马3相4士5帅6炮7卒子*/
	this.type = 0;
	/**方向，为卒子准备的 1↓走 2↑ - -。。*/
	this.dir = 1;
	this.boardpos = 0;
	this.instance = {};
	this.prepare = 0;
	this.aniTime = 500;
	this.label01 = 1;

	this.show = function() {
		$("#"+this.id).css("left",this.x);
		$("#"+this.id).css("top",this.y);
	};
	
	
	this.init = function() {
		
		var _this = this;

		$("#"+this.id).bind("click",function(){
			socket.emit('msg01',{'chessmanId': _this.id,'label01': _this.label01,'roomId': roomId});
			_this.updateShow();
			_this.label01++;
			
		});
		
		$("#"+this.id).show();
	}
	
	this.socInit = function(){

		this.updateShow();

		$("#"+this.id).show();
	}
	this.aniMove = function(despos) {
		 
		 var _this = this;
		 var _srcpos = this.boardpos;
		$("#"+this.id).animate({left:this.instance.board[despos].x,top:this.instance.board[despos].y},200,"swing",function(){
			_this.aniEat(_srcpos,despos);
			
		});
		socket.emit('msg02',{'despos': despos,'thisId': this.id});
		if (this.instance.turn == 1) {
			NEXT = '黑方';
		} else {
			NEXT = '红方';
		}
		$('.next').html(NEXT);
	}
	
	this.aniEat = function(_srcpos,despos) {
		 
		var hasindex = this.hasChessIndex(this.id,despos);
		if(hasindex != 0) {
			this.deleteChess(hasindex);
			var posstr = this.id +  "|" + _srcpos + "|" + despos + "|" + this.instance.chessman[hasindex].id;
		    this.instance.history.push(posstr);
		} else {
		    var posstr = this.id +  "|" + _srcpos + "|" + despos + "|" + "";
		    this.instance.history.push(posstr); 
		}
	}
	
	this.deleteChess = function(index) {
		if(index != 0) {
			$("#" + this.instance.chessman[index].id).hide();
			this.instance.chessman[index].boardpos = 0; 
			
			if(this.instance.chessman[index].id == "a5"  
			 || this.instance.chessman[index].id == "b5"
				) {
				alert("GAME OVER!");
			}
		}
	}
	
	this.hasChessIndex = function(exceptid,pos) {
		for( var ic = 1;ic <= 32; ic++) {
			if(this.instance.chessman[ic].boardpos == pos && this.instance.chessman[ic].id != exceptid) {
				return ic;
			}
		}
		return 0;
	}
	
	this.updateShow = function() {
 			var id = (this.id.substring(0,1));
			//alert(this.dir  + " " + this.instance.turn);
			if(id == "a" && this.instance.turn == 1) {
				
				//alert(this.prepare);
				if(this.prepare == 0) {
				    this.prepare0();
					this.prepare = 1;	
				} else {
					
					if(this.instance.indacatorsrcPos == this.boardpos) {
					 	
						return false;
					}
					if(!this.validation(this.boardpos,this.instance.indacatorsrcPos)) {
						// console.log(this.instance.indacatorsrcPos);
						return false;
					}

					this.prepare1();
			     	this.instance.turn = 2;		
				}
			} else if( id == "b" &&  this.instance.turn == 2) {
				
				if(this.prepare == 0) {
					this.prepare0();
					this.prepare = 1;	
				} else {
					if(this.instance.indacatorsrcPos == this.boardpos) {
						return false;
					}
					if(!this.validation(this.boardpos,this.instance.indacatorsrcPos)) {
						return false;
					}
					this.prepare1();
					 this.instance.turn = 1;
					 
					 
				}
				
			}
	}
	
	this.prepare0 = function() {
        $("#indacatordir").css("left",this.instance.board[this.boardpos].x);
		$("#indacatordir").css("top",this.instance.board[this.boardpos].y);
		$("#indacatordir").show();
		for( var i=1 ;i <=32;i++ ) {
			this.instance.chessman[i].prepare = 0;
		} 
		this.prepare = 1;
		return 1;
	}
	
	this.prepare1 = function() {
		 
		this.prepare = 0;	
		$("#indacatordir").hide();

		this.aniMove(this.instance.indacatorsrcPos);
		this.boardpos = this.instance.indacatorsrcPos;
		
		
		return 1;
	
	}
	
	this.validation = function(srcpos,despos) {
		
		var chessindex = 0;
		var chesstype = 0;
		var chesscolor = 1;
		var isValidation = true;
		for( var ic = 1;ic <= 32;ic++) {
			if(this.instance.chessman[ic].boardpos == srcpos) {
				chessindex = ic;
				chesstype = this.instance.chessman[ic].type;
				chesscolor = this.dir;
				break;
			}
		}
		
		if(chessindex == 0) {
			return false;
		}
		
		switch(chesstype) {
		case 1:
			isValidation = this.validChe(chessindex,srcpos,despos);
			break;
		case 2:
			isValidation = this.validMa(chessindex,srcpos,despos);
			break;
		case 3:
			 
			isValidation = this.validXiang(chessindex,srcpos,despos);
			break;
		case 4:
			isValidation = this.validShi(chessindex,srcpos,despos);
			break;
		case 5:
			isValidation = this.validJiang(chessindex,srcpos,despos);
			break;
		case 6:
			isValidation = this.validPao(chessindex,srcpos,despos);
			break;
		case 7:
			isValidation = this.validBing(chessindex,srcpos,despos);
			break;
		default:
			isValidation = false;
			break;
		
		}
		
		return isValidation;
		
	}
	
	this.getColumn = function(pos) {
		if(pos < 0 || pos > 90) {
			return 0;
		}
		return parseInt((pos-1)%9+1);
	}
	
	this.getRow = function(pos) {
		if(pos < 0 || pos > 90) {
			return 0;
		}
		return parseInt((pos-1)/9+1);
	}
	
	this.getPos = function(row,col) {
		if(row < 1 || row > 10) {
			return 0;
		}
		if(col < 1 || col > 9) {
			return 0;
		} 
		return parseInt( (row-1)*9 + Number(col) );
	}
	/**0空1红2黑*/
 	this.hasChess = function(pos) {
		for(var i=1;i<=32;i++) {
			if(this.instance.chessman[i].boardpos == pos) {
				return this.instance.chessman[i].dir;	
			}
		}
		
		return 0;
	}
	
	this.validChe = function(chessindex,srcpos,despos) {
		
 		var srccol = this.getColumn(srcpos);
		var srcrow = this.getRow(srcpos);
		var descol = this.getColumn(despos);
		var desrow = this.getRow(despos);
		var ishor = false;
		var isver = false; 
		
		if(srccol == descol) {
			isver = true;
		}
		
		if(srcrow == desrow) {
			ishor = true;
		}
		
		if(!isver && !ishor) {
			return false;
		}
		
		if(srcrow != desrow && srccol != descol) {
			return false;
		}
		
		if(this.hasChess(despos) == this.dir) {
			return false;
		} 
		
		var begin = 0;
		var end = 0;
		var chessCount = 0;
		if( ishor ) {
			
			if(srccol < descol) { 
				begin = srccol;
				end = descol;
			} else {
				begin = descol;
				end = srccol;	
			}
			
			for(var i = Number(begin)+1;i < end;i++) {
				if(this.hasChess(this.getPos(srcrow,i)) > 0) { 
					return false;
				}
				
			}
			
		} else if(isver) {
			
			if(srcrow < desrow) { 
				begin = srcrow;
				end = desrow;
			} else {
				begin = desrow;
				end = srcrow;	
			}
			for(var i = Number(begin)+1;i < end;i++) {
				if(this.hasChess(this.getPos(i,srccol)) > 0) {
					return false;
				} 
			} 
		}
		
		return true;
		
	}
	
	 this.validMa = function(chessindex,srcpos,despos) {
		 
		 var row = this.getRow(srcpos);
		 var col = this.getColumn(srcpos);
		 var dirType = 0;
		
		 if       ( col < 9 && row > 2 && despos == Number(srcpos) - 17   ) {
			 dirType = 1; 
		 } else if( col < 8 && row > 1 && despos == Number(srcpos) - 7  ) {
			 dirType = 2; 
		 } else if( col < 8 && row < 10 && despos == Number(srcpos) + 11  ) {
			 dirType = 2;  
		 } else if( col < 9 && row < 9 && despos == Number(srcpos) + 19  ) {
			 dirType = 3; 
		 } else if( col > 1 && row < 9 && despos == Number(srcpos) + 17  ) {
			 
			 dirType = 3;
		 } else if( col > 2 && row < 10 && despos == Number(srcpos) + 7   ) {
			 dirType = 4;
		 } else if( col > 2 && row > 1 && despos == Number(srcpos) - 11  ) {
			 dirType = 4;
		 } else if( col > 1 && row > 2 && despos == Number(srcpos) - 19  ) {
			 dirType = 1;
		 }  else {  
			return false;
		 }
		 
		 if(this.hasChess(despos) == this.dir) {
			 
			 return false;
		 }
		 var tmp = 0;
		 switch(dirType){
		 case 1:
			 tmp = Number(srcpos) - 9;
			 break;
		 case 2:
		 
			 tmp = Number(srcpos) + 1;
			  
			 break;
		 case 3:
			 tmp = Number(srcpos) + 9;
			 break;
		 case 4:
			 tmp = Number(srcpos) - 1;
			 break;
			 
		 default:
			 return false;
			 break;
		 }
		 if(tmp < 1 || tmp > 90) {
			 
			 return false;
		 }
		 
		 if( this.hasChess(tmp) > 0 ) {
			 return false;
		 }
		 
		 return true;
		 
	 }
	 
	 this.validXiang = function(chessindex,srcpos,despos) {
		 
		 var isValid = false;
		 var srccol = this.getColumn(srcpos);
		 var srcrow = this.getRow(srcpos);
		 var descol = this.getColumn(despos);
		 var desrow = this.getRow(despos);
		 
		 //alert(srcrow);
		 // alert(srcpos + " " + srcrow);
		 var xAddr = new Array(3);
		 xAddr[1] = new Array(3,7,19,23,27,39,43);
		 xAddr[2] = new Array(48,52,64,68,72,84,88);
		 var clag = new Array(3);
		 clag[1] = new Array(11,13,15,17,29,31,33,35);
		 clag[2] = new Array(56,58,60,62,74,76,78,80);
		 
		 
		 if(this.hasChess(despos) == this.dir) {
			 return false;
		 }
		 
		 for(var i=0;i < xAddr[this.dir].length;i++) {
			 if(despos == (xAddr[this.dir])[i]) {
				isValid = true;
				break;
			 }
		 }
		 
		 if(!isValid) {
			return false; 
		 }
		 
		 var tmprow = desrow - srcrow > 0 ? 1 : -1;
		 var tmpcol = descol - srccol > 0 ? 1 : -1;
		
		 if(Math.abs(desrow - srcrow) != 2 || Math.abs(descol - srccol) != 2) {
			return false; 
		 }
		 
		 if(this.hasChess(this.getPos(Number(srcrow)+Number(tmprow),Number(srccol)+Number(tmpcol)))) {
			 return false;
		 }
		 
		 return true;
	 }
 	this.validShi = function(chessindex,srcpos,despos) {
		
		var isValid = false;
		var sAddr = new Array(3);
		sAddr[1] = new Array(4,6,14,22,24);
		sAddr[2] = new Array(67,69,77,85,87);
		
		var srccol = this.getColumn(srcpos);
		var srcrow = this.getRow(srcpos);
		var descol = this.getColumn(despos);
		var desrow = this.getRow(despos);
		//alert(1);
		for(var i=0;i < sAddr[this.dir].length;i++) {
			if(despos == (sAddr[this.dir])[i]) {
				
				isValid = true;
				break;	
			}
		}
		
		if(!isValid) {
			return false;
		}
		
		if(this.hasChess(despos) == this.dir) {
			return false;	
		}
		
		 var tmprow = desrow - srcrow > 0 ? 1 : -1;
		 var tmpcol = descol - srccol > 0 ? 1 : -1;
		 
		 if(Math.abs(desrow - srcrow) != 1 || Math.abs(descol - srccol) != 1) {
			  
			return false; 
		 }
		 
		 return true;
		
	}
	
	this.validJiang = function(chessindex,srcpos,despos) {
		
		var srccol = this.getColumn(srcpos);
		var srcrow = this.getRow(srcpos);
		var descol = this.getColumn(despos);
		var desrow = this.getRow(despos);
		
		var sAddr = new Array(3);
		sAddr[1] = new Array(4,5,6,13,14,15,22,23,24);
		sAddr[2] = new Array(67,68,69,76,77,78,85,86,87);
		
		
		var isValid = false;
		
		if(this.hasChess(despos) == this.dir) {
			return false;
		}
		
		if(Math.abs(srccol - descol) > 1 || Math.abs(srcrow - desrow) > 1) {
			return false;	
		}
		
		for(var i=0;i < sAddr[this.dir].length;i++) {
			if(despos == (sAddr[this.dir])[i]) {
				
				isValid = true;
				break;	
			}
		}
		if(!isValid) {
			return false;
		}
		
		
		if(srccol != descol && srcrow != desrow ) {
			return false;
		}
		
		return true;

	}
	
	this.validPao = function(chessindex,srcpos,despos) {
		 
		var srccol = this.getColumn(srcpos);
		var srcrow = this.getRow(srcpos);
		var descol = this.getColumn(despos);
		var desrow = this.getRow(despos);
		var ishor = false;
		var isver = false;
		var iseat = false;
		
		if(srccol == descol) {
			isver = true;
		}
		
		if(srcrow == desrow) {
			ishor = true;
		}
		
		if(!isver && !ishor) {
			return false;
		}
		
		if(srcrow != desrow && srccol != descol) {
			return false;
		}
		
		if(this.hasChess(despos) == this.dir) {
			return false;
		} else if(this.hasChess(despos) == 3 - this.dir) {
			iseat = true;
		} 
		
		var begin = 0;
		var end = 0;
		var chessCount = 0;
		if( ishor ) {
			
			if(srccol < descol) { 
				begin = srccol;
				end = descol;
			} else {
				begin = descol;
				end = srccol;	
			}
			
			for(var i = begin;i <= end;i++) {
				if(this.hasChess(this.getPos(srcrow,i)) > 0) {
					 
					chessCount++;
				}
				
			}
			
		} else if(isver) {
			
			if(srcrow < desrow) { 
				begin = srcrow;
				end = desrow;
			} else {
				begin = desrow;
				end = srcrow;	
			}
			for(var i = begin;i <= end;i++) {
				if(this.hasChess(this.getPos(i,srccol)) > 0) {
					chessCount++;
				} 
			} 
		}
		//alert(chessCount + " " + iseat);
		//alert(chessCount);
		if((iseat && chessCount != 3)  ) {
			//alert(1);
			return false;	
		} else if(!iseat && chessCount>1) {
			//alert(chessCount);	
			return false;
		}
		
		return true;
		
	}
	
	this.validBing = function(chessindex,srcpos,despos) {
		
		var srccol = this.getColumn(srcpos);
		var srcrow = this.getRow(srcpos);
		var descol = this.getColumn(despos);
		var desrow = this.getRow(despos);
		var ishor = false;
		//var ins = this.dir == 1 ? 1 : -1;
		
		if(this.hasChess(despos) == this.dir ) {
			return false;
		}
		
		if(srcrow != desrow && srccol != descol) {
			return false;
		}
		
		if(Math.abs(srccol - descol) > 1 || Math.abs(srcrow - desrow) > 1) {
 			return false;
		}
		
		if(srcrow == desrow) {
			ishor = true;
		}
		
		if(srccol == 1 && descol < srccol) {
			return false;
		}
		
		if(srccol == 9 && descol > srccol) {
			return false;
		}
		
		//alert(srccol);
		if(this.dir == 1) { 
			if(srcrow > desrow) {
				
				return false;	
			}
			
			if(ishor) {
				if(srcrow < 6) {
					return false;
				}
			}
			
		
		
		} else { 
			if(srcrow < desrow) { 
				return false;	
			}
			
			if(ishor) {
				if(srcrow > 5) {
					return false;
				}
			}
		}
		
		return true;
		
	}

	this.boardClick = function() {
		 
		if(this.prepare == 1) {
			
			this.updateShow();	
		}
	}	
}
 
 

 
function Rect() {
	this.minChar = {};
	this.maxChar = {};
	this.child = new Array();
	this.index = "";
	this.root = "";
}
function Chessman() {
	this.x=0;
	this.y=0;	
}

function Chess() { 
	this.board = new Array();
	this.chessman = new Array();
	this.offsetX=43/2;
	this.offsetY=43/2;
	this.boardStartPointUpX = 35;
	this.boardStartPointUpY = 30;
	this.boardStartPointDownX = 35;
	this.boardStartPointDownY = 272;
	this.boardTileWidth = 48;
	this.boardTileHeight = 49;
	this.mouseX = 0;
	this.mouseY = 0;
	/**0未移动 1移动发生*/
	this.isMove = 0;  
	this.rectRootMap = new Rect();
	/**1红2黑*/
	this.turn = 1;
	this.indacatorsrcStay = 0;
	this.indacatordirStay = 0;
	this.selectChess = 0;
	this.indacatorsrcPos = 0;
	this.history = new Array();
	this.backlock = false;
	
}

Chess.prototype.init = function() {
	
	for(var i1=1;i1<=5;i1++) {
		for(var i2=1;i2<=9;i2++) {
			 var tmp = new Character();
			 tmp.x = this.boardStartPointUpX + this.boardTileWidth * (i2 - 1) - this.offsetX;
			 tmp.y = this.boardStartPointUpY + this.boardTileHeight * (i1 -1) - this.offsetY;
			 this.board[(i1-1) * 9 + i2] = tmp;
		}
	}
	
	for(var i1=6;i1<=10;i1++) {
		for(var i2=1;i2<=9;i2++) {
			 var tmp = new Character();
			 tmp.x = this.boardStartPointDownX + this.boardTileWidth * (i2 - 1) - this.offsetX;
			 tmp.y = this.boardStartPointDownY + this.boardTileHeight * (i1 -1 - 5) - this.offsetY;
			 this.board[(i1-1) * 9 + i2] = tmp;
		}
	}
	
	
	//alert(this.board[5].x);
	for( var i=1;i<=32;i++) {
		var char = new Character();
		this.chessman[i] = char;
	}
	
	this.initChessmanPos();

//alert(this.chessman[6].boardpos);
	//alert(this.board[5].x);

	
	var instance = this;
	$("#board").bind("mousemove",{fo:this},function(e){ 
		e.data.fo.boardMouseMove(e);
		});
	this.isMove=1;
	
	var callback = function() {
		instance.show();	
	}
	 
	this.initIndexMap();
	
	$("#board").bind("click",function() {	 
		for( var i=1;i<=32;i++) {
			instance.chessman[i].boardClick();
		}	
	});
	
	socket.on('msg02',function(data){
		// console.log(data);
		instance.indacatorsrcPos = data.despos;
		for(var i=1; i<=32; i++){
			if (instance.chessman[i].id == data.thisId) {
				instance.chessman[i].boardClick();
			}
		}
	});
	
	var beginLabel = 1;
	var noBeginLabel = 1;
	socket.on('aniBegin',function(data){
		if (beginLabel == data.beginLabel) {
			$('.begin').show();
			beginLabel++;
		}
		
	});

	var label = 1;
	socket.on('chessBack',function(data){
		if (data.label == label) {
			if(instance.backlock) {
		        alert(instance.backlock);
		        return ;
		    }
		    instance.backlock = true; 
		    instance.chessBack();
		    label++;
		};
		
	});

	socket.on('noBegin',function(data){
		if (noBeginLabel == data.noBeginLabel) {
			console.log('sdsd');
			$('.noBegin').show();
			setTimeout(function(){
				$('.noBegin').hide();
			},3000);
			noBeginLabel++;	
		}
		
	});

	socket.on('yesBegin',function(){
		instance.aniBegin();
		instance.initChessmanPos();
	});


	$('.begin>.NO').bind('click',function(){
		socket.emit('noBegin',{'noBeginLabel': noBeginLabel});
		noBeginLabel++;
		$('.begin').hide();
	});

	$('.begin>.YES').bind('click',function(){
		socket.emit('yesBegin');
		instance.aniBegin();
		instance.initChessmanPos();
		$('.begin').hide();
	});
	$("#button_begin").bind("mouseover",function(){ $(this).css("background","url(../static/img/button_begin.gif) -108px 0px");});
	$("#button_begin").bind("mousedown",function(){ $(this).css("background","url(../static/img/button_begin.gif) -54px 0px");});
	$("#button_begin").bind("mouseout",function(){ $(this).css("background","url(../static/img/button_begin.gif) -0px 0px");});
	$("#button_begin").bind("mouseup",function(){ $(this).css("background","url(../static/img/button_begin.gif) -0px 0px");
		// instance.aniBegin();instance.initChessmanPos();
		socket.emit('aniBegin',{'beginLabel': beginLabel});
		beginLabel++;
	});
	
	$("#button_regret").bind("mouseover",function(){ $(this).css("background","url(../static/img/button_regret.gif) -102px 0px");});
	$("#button_regret").bind("mousedown",function(){ $(this).css("background","url(../static/img/button_regret.gif) -51px 0px");});
	$("#button_regret").bind("mouseout",function(){ $(this).css("background","url(../static/img/button_regret.gif) -0px 0px");});
	$("#button_regret").bind("mouseup",function(){ 
	    $(this).css("background","url(../static/img/button_regret.gif) -0px 0px");
	    if(instance.backlock) {
	        alert(instance.backlock);
	        return ;
	    }
	    instance.backlock = true; 
	    instance.chessBack();
	    socket.emit('chessBack',{'label': label});
	    label++;
    });
		
	
	
	
	setInterval(callback,100);
	 
	//this.show();
		
}

Chess.prototype.initChessmanPos = function() {
	
	this.chessman[1].id = "a1";this.chessman[1].dir = 1;this.chessman[1].type = 1;this.chessman[1].boardpos = 1;
	this.chessman[2].id = "a2";this.chessman[2].dir = 1;this.chessman[2].type = 2;this.chessman[2].boardpos = 2;
	this.chessman[3].id = "a3";this.chessman[3].dir = 1;this.chessman[3].type = 3;this.chessman[3].boardpos = 3;
	this.chessman[4].id = "a4";this.chessman[4].dir = 1;this.chessman[4].type = 4;this.chessman[4].boardpos = 4;
	this.chessman[5].id = "a5";this.chessman[5].dir = 1;this.chessman[5].type = 5;this.chessman[5].boardpos = 5;
	this.chessman[6].id = "a6";this.chessman[6].dir = 1;this.chessman[6].type = 4;this.chessman[6].boardpos = 6;
	this.chessman[7].id = "a7";this.chessman[7].dir = 1;this.chessman[7].type = 3;this.chessman[7].boardpos = 7;	
	this.chessman[8].id = "a8";this.chessman[8].dir = 1;this.chessman[8].type = 2;this.chessman[8].boardpos = 8;
	this.chessman[9].id = "a9";this.chessman[9].dir = 1;this.chessman[9].type = 1;this.chessman[9].boardpos = 9;
	this.chessman[10].id = "a10";this.chessman[10].dir = 1;this.chessman[10].type = 6;this.chessman[10].boardpos = 20;
	this.chessman[11].id = "a11";this.chessman[11].dir = 1;this.chessman[11].type = 6;this.chessman[11].boardpos = 26;
	this.chessman[12].id = "a12";this.chessman[12].dir = 1;this.chessman[12].type = 7;this.chessman[12].boardpos = 28;	
	this.chessman[13].id = "a13";this.chessman[13].dir = 1;this.chessman[13].type = 7;this.chessman[13].boardpos = 30;	
	this.chessman[14].id = "a14";this.chessman[14].dir = 1;this.chessman[14].type = 7;this.chessman[14].boardpos = 32;
	this.chessman[15].id = "a15";this.chessman[15].dir = 1;this.chessman[15].type = 7;this.chessman[15].boardpos = 34;	
	this.chessman[16].id = "a16";this.chessman[16].dir = 1;this.chessman[16].type = 7;this.chessman[16].boardpos = 36;	
 	
	this.chessman[17].id = "b1";this.chessman [17].dir = 2;this.chessman[17].type = 1;this.chessman[17].boardpos = 82;
	this.chessman[18].id = "b2";this.chessman [18].dir = 2;this.chessman[18].type = 2;this.chessman[18].boardpos = 83;
	this.chessman[19].id = "b3";this.chessman [19].dir = 2;this.chessman[19].type = 3;this.chessman[19].boardpos = 84;
	this.chessman[20].id = "b4";this.chessman [20].dir = 2;this.chessman[20].type = 4;this.chessman[20].boardpos = 85;
	this.chessman[21].id = "b5";this.chessman [21].dir = 2;this.chessman[21].type = 5;this.chessman[21].boardpos = 86;
	this.chessman[22].id = "b6";this.chessman [22].dir = 2;this.chessman[22].type = 4;this.chessman[22].boardpos = 87;	
	this.chessman[23].id = "b7";this.chessman [23].dir = 2;this.chessman[23].type = 3;this.chessman[23].boardpos = 88;	
	this.chessman[24].id = "b8";this.chessman [24].dir = 2;this.chessman[24].type = 2;this.chessman[24].boardpos = 89;
	this.chessman[25].id = "b9";this.chessman [25].dir = 2;this.chessman[25].type = 1;this.chessman[25].boardpos = 90;
	this.chessman[26].id = "b10";this.chessman[26].dir = 2;this.chessman[26].type = 6;this.chessman[26].boardpos = 65;
	this.chessman[27].id = "b11";this.chessman[27].dir = 2;this.chessman[27].type = 6;this.chessman[27].boardpos = 71;	
	this.chessman[28].id = "b12";this.chessman[28].dir = 2;this.chessman[28].type = 7;this.chessman[28].boardpos = 55;	
	this.chessman[29].id = "b13";this.chessman[29].dir = 2;this.chessman[29].type = 7;this.chessman[29].boardpos = 57;	
	this.chessman[30].id = "b14";this.chessman[30].dir = 2;this.chessman[30].type = 7;this.chessman[30].boardpos = 59;
	this.chessman[31].id = "b15";this.chessman[31].dir = 2;this.chessman[31].type = 7;this.chessman[31].boardpos = 61;	
	this.chessman[32].id = "b16";this.chessman[32].dir = 2;this.chessman[32].type = 7;this.chessman[32].boardpos = 63;	
	
	for( var i=1;i<=32;i++) {
		this.chessman[i].x = this.board[this.chessman[i].boardpos].x;
		this.chessman[i].y = this.board[this.chessman[i].boardpos].y;
		this.chessman[i].instance = this;
		this.chessman[i].init();
		this.chessman[i].show();
	};
	//加入部分 
	var _this = this;
	socket.on('msg01',function(data){
		for (var j = 1; j<= 32; j++) {
			if (_this.chessman[j].id == data.chessmanId) {
				if (_this.chessman[j].label01 == data.label01) {
					_this.chessman[j].x = _this.board[_this.chessman[j].boardpos].x;
					_this.chessman[j].y = _this.board[_this.chessman[j].boardpos].y;
					_this.chessman[j].instance = _this;
					_this.chessman[j].socInit();
					_this.chessman[j].show();
					_this.chessman[j].label01++;
				}
				
			}
		}
		// console.log(data);
	});
	
	this.turn = 1;
	// this.filp();
}

Chess.prototype.chessBack = function() {

    var next = $('.next').html();
    if (next == '红方') {
    	$('.next').html('黑方');
    } else {
		$('.next').html('红方');
    }
    
    if(this.history.length == 0) {
        this.backlock = false;
        return false;
    }
    
    var index = this.history.length - 1;
    var historyVal = this.history[index];
    var chessInfo = historyVal.split("|");
    
    // this.filp();
    
    for(var i=1;i <= 32 ;i++) {
        if(this.chessman[i].id == chessInfo[0]) {
            this.chessman[i].boardpos = chessInfo[1];
            this.turn = 3 - this.turn;
            $("#" + this.chessman[i].id).css("left",this.board[chessInfo[1]].x);
            $("#" + this.chessman[i].id).css("top",this.board[chessInfo[1]].y);
            $("#" + this.chessman[i].id).show();
             
           
        }
        if(this.chessman[i].id == chessInfo[3]) {
        
            this.chessman[i].boardpos = chessInfo[2];
            $("#" + this.chessman[i].id).css("left",this.board[chessInfo[2]].x);
            $("#" + this.chessman[i].id).css("top",this.board[chessInfo[2]].y);
            $("#" + this.chessman[i].id).show();
        
        } 
         
    }
     //alert(index);
    this.history.splice(index);
    //alert(this.backlock);
    this.backlock = false;
    //alert(this.backlock);
}

Chess.prototype.initIndexMap = function() {
	
	/**1*/
	this.rectRootMap.minChar = this.board[1];
	this.rectRootMap.maxChar = this.board[90];
	this.rectRootMap.root = "root";
	/**2*/
	var rect_2_1 = new Rect();
	rect_2_1.minChar = this.board[1];
	rect_2_1.maxChar = this.board[41];
	var rect_2_2 = new Rect();
	rect_2_2.minChar = this.board[5];
	rect_2_2.maxChar = this.board[45];
	var rect_2_3 = new Rect();
	rect_2_3.minChar = this.board[37];
	rect_2_3.maxChar = this.board[77];
	var rect_2_4 = new Rect();
	rect_2_4.minChar = this.board[41];
	rect_2_4.maxChar = this.board[81];
	var rect_2_5 = new Rect();
	rect_2_5.minChar = this.board[73];
	rect_2_5.maxChar = this.board[90];
 
	

	/**3*/
	var rect_3_1 = new Rect();
	rect_3_1.minChar = this.board[1];
	rect_3_1.maxChar = this.board[21];
	var rect_3_2 = new Rect();
	rect_3_2.minChar = this.board[3];
	rect_3_2.maxChar = this.board[23];
	var rect_3_3 = new Rect();
	rect_3_3.minChar = this.board[19];
	rect_3_3.maxChar = this.board[39];
	var rect_3_4 = new Rect();
	rect_3_4.minChar = this.board[21];
	rect_3_4.maxChar = this.board[41];
	
	var rect_3_5 = new Rect();
	rect_3_5.minChar = this.board[5];
	rect_3_5.maxChar = this.board[25];
	var rect_3_6 = new Rect();
	rect_3_6.minChar = this.board[7];
	rect_3_6.maxChar = this.board[27];
	var rect_3_7 = new Rect();
	rect_3_7.minChar = this.board[23];
	rect_3_7.maxChar = this.board[43];
	var rect_3_8 = new Rect();
	rect_3_8.minChar = this.board[25];
	rect_3_8.maxChar = this.board[45];
	
	var rect_3_9 = new Rect();
	rect_3_9.minChar = this.board[37];
	rect_3_9.maxChar = this.board[57]; 
	var rect_3_10 = new Rect();
	rect_3_10.minChar = this.board[39];
	rect_3_10.maxChar = this.board[59];
	var rect_3_11 = new Rect();
	rect_3_11.minChar = this.board[55];
	rect_3_11.maxChar = this.board[75];
	var rect_3_12 = new Rect();
	rect_3_12.minChar = this.board[57];
	rect_3_12.maxChar = this.board[77];
	
	var rect_3_13 = new Rect();
	rect_3_13.minChar = this.board[41];
	rect_3_13.maxChar = this.board[61]; 
	var rect_3_14 = new Rect();
	rect_3_14.minChar = this.board[43];
	rect_3_14.maxChar = this.board[63];
	var rect_3_15 = new Rect();
	rect_3_15.minChar = this.board[59];
	rect_3_15.maxChar = this.board[79];
	var rect_3_16 = new Rect();
	rect_3_16.minChar = this.board[61];
	rect_3_16.maxChar = this.board[81];

	var rect_3_17 = new Rect();
	rect_3_17.minChar = this.board[73];
	rect_3_17.maxChar = this.board[86];
	var rect_3_18 = new Rect();
	rect_3_18.minChar = this.board[77];
	rect_3_18.maxChar = this.board[90];	
	
	
	this.rectRootMap.child.push(rect_2_1);
	this.rectRootMap.child.push(rect_2_2);
	this.rectRootMap.child.push(rect_2_3);
	this.rectRootMap.child.push(rect_2_4);
	this.rectRootMap.child.push(rect_2_5);
	
	rect_2_1.child.push(rect_3_1);
	rect_2_1.child.push(rect_3_2);
	rect_2_1.child.push(rect_3_3);
	rect_2_1.child.push(rect_3_4);
	
	rect_2_2.child.push(rect_3_5);
	rect_2_2.child.push(rect_3_6);
	rect_2_2.child.push(rect_3_7);
	rect_2_2.child.push(rect_3_8);
	
	rect_2_3.child.push(rect_3_9);
	rect_2_3.child.push(rect_3_10);
	rect_2_3.child.push(rect_3_11);
	rect_2_3.child.push(rect_3_12);	
	
	rect_2_4.child.push(rect_3_13);
	rect_2_4.child.push(rect_3_14);
	rect_2_4.child.push(rect_3_15);
	rect_2_4.child.push(rect_3_16);	
	
	rect_2_5.child.push(rect_3_17);
	rect_2_5.child.push(rect_3_18);	
	
	/**4*/
	rect_3_1.index = "1,2,3,10,11,12,19,20,21";
	rect_3_2.index = "3,4,5,12,13,14,21,22,23";
	rect_3_3.index = "19,20,21,28,29,30,37,38,39";
	rect_3_4.index = "21,22,23,30,31,32,39,40,41";
	
	rect_3_5.index = "5,6,7,14,15,16,23,24,25";
	rect_3_6.index = "7,8,9,16,17,18,25,26,27";
	rect_3_7.index = "23,24,25,32,33,34,41,42,43";
	rect_3_8.index = "25,26,27,34,35,36,43,44,45";
	
	rect_3_9.index = "37,38,39,46,47,48,55,56,57";
	rect_3_10.index = "39,40,41,48,49,50,57,58,59";
	rect_3_11.index = "55,56,57,64,65,66,73,74,75";
	rect_3_12.index = "57,58,59,66,67,68,75,76,77";
	
	rect_3_13.index = "41,42,43,50,51,52,59,60,61";
	rect_3_14.index = "43,44,45,52,53,54,61,62,63";
	rect_3_15.index = "59,60,61,68,69,70,77,78,79";
	rect_3_16.index = "61,62,63,70,71,72,79,80,81";
	
	rect_3_17.index = "73,74,75,76,77,82,83,84,85,86";
	rect_3_18.index = "77,78,79,80,81,86,87,88,89,90";
	
	
	
	
	
}

// Chess.prototype.filp = function() {
 
 	 
// 	for(var i=1;i<=32;i++) {
// 		if(this.chessman[i].boardpos == 0) {
// 			continue;
// 		}
// 		this.chessman[i].boardpos = 91 - this.chessman[i].boardpos;
// 		this.chessman[i].dir = 3 - this.chessman[i].dir;
// 		//this.turn = 3 - this.turn;
// 		this.chessman[i].x = this.board[this.chessman[i].boardpos].x;
// 		this.chessman[i].y = this.board[this.chessman[i].boardpos].y;
		
// 		this.chessman[i].show();
		
// 	}
	
// }

Chess.prototype.start = function() {
	this.init();	
}

Chess.prototype.show = function() {
	
	
	/* 
	if(this.isMove) {
		for( var i=1;i<=32;i++) {
			this.chessman[i].show();
		}
		 
		this.isMove = 0;
	}
	*/
 
	
	
}

Chess.prototype.boardMouseMove = function(e) { 
	this.mouseX = e.pageX-$("#board")[0].offsetLeft - this.offsetX;
	this.mouseY = e.pageY-$("#board")[0].offsetTop - this.offsetY;
	
	var index = this.searchIndex(this.mouseX,this.mouseY);
	$("#test").text(this.mouseX + "----" + this.mouseY + "---index=" + index + "board 10=" + this.board[20].x + "-" + this.board[20].y + "--chessman[1].boardpos=" + this.chessman[1].boardpos);
	
	if(index > 0) {
		this.indacatorsrcPos = index;
		$("#indacatorsrc").css("left",this.board[index].x);
		$("#indacatorsrc").css("top",this.board[index].y);
	}
}

Chess.prototype.aniBegin = function() {
	this.history = null;
	this.history = new Array();
	//$("#a1").animate({left:100,top:200},1000,"swing",function(){alert(12313);});
	//alert(1);
}

Chess.prototype.searchIndex = function(x,y) {
	
	if(x > this.rectRootMap.minChar.x - 30 && x < this.rectRootMap.maxChar.x + 30 && 
	   y > this.rectRootMap.minChar.y - 30 && y < this.rectRootMap.maxChar.y + 30)  {
		   
	    return this.searchBack(this.rectRootMap,x,y);
	} else {
		
		return 0;	
	}
	return 0;
}

Chess.prototype.searchBack = function(instance,x,y) {
	
	var child = instance.child;
	 
	if(child != undefined && instance.child.length > 0) { 
		for( var i=0;i<child.length;i++) {
			if(x > child[i].minChar.x - 20 && x < child[i].maxChar.x + 20 && 
			   y > child[i].minChar.y - 20 && y < child[i].maxChar.y + 20 ) {
				return this.searchBack(child[i],x,y);
			}
		}
	} else {
		
		child = instance;
		
		var indexarr = child.index.split(",");
		for( var i=0;i<indexarr.length;i++) {
			if(indexarr[i] == "") {
				continue;	
			} 
			//$("#test").text(child.index + "----" + this.mouseX + "---x=" + x + "index=" + "");
			if( x > this.board[indexarr[i]].x - 20 && x < this.board[indexarr[i]].x + 20 && 
				y > this.board[indexarr[i]].y - 20 && y < this.board[indexarr[i]].y + 20) {
				
				return indexarr[i];
			}
			
		}
			
	}
	
	return 0;	
}

































