/*
 * ツリーベル四日市事業所
 * 第3回PGコンテスト用ベースすごろくプログラム
 * メイン処理
 */

//更新履歴
//2020 1/16 和田 新規作成
//2020 1/16 美濃 修正


/* 定数 */
//マス数
const  _BOARDSIZE = 54;
const _ROLLSPEED = 10;

/* グローバル変数 */

//プレイヤー数
var playerCnt = 1;

//ターンプレイヤー
var nowPlayerId = 1;

//プレイヤー情報
var playerInfo = [];

//ダイスロール非同期処理管理ID
var diceTimerId;

/**
 * 初期処理
 */
$(function() {
	//ログ初期化
	$("#logMsg").val("");

	//プレイヤー情報初期化
	//スタート位置：0
	playerInfo[1] = {Pos:0};
});

/**
 * ログメッセージ書き込み処理
 */
function writeMsg(msg){
	$("#logMsg").val($("#logMsg").val() + msg  + "\r\n");
	$("#logMsg").scrollTop($("#logMsg")[0].scrollHeight);
}

/**
 * ゲーム開始時処理
 */
function startGame() {
	//盤面描画
	drawBoard();

	//プレイヤー位置描画
	drawBoardPos();

	//設定エリア非表示
	$("#gameSettingArea").hide();

	//ゲームエリア表示
	$("#gameArea").show();
	writeMsg("ゲームを開始します。");
	startTurn(nowPlayerId);
}


/**
 * 盤面描画処理
 */
function drawBoard(){
	var massIdCnt = 0;
	var drawVectorNormal = true;
	var nowYRow =  $('<div class="boardYRow"></div>');

	//プレイヤーの盤面上のコマ
	var massElm =  '<span class="boardMass"><div class="massPlayerArea"></div></span>'

	var boardXSize = 10;

	var xCnt = 0;
	for(var i=0;i < _BOARDSIZE;i++) {
		//右方向にマス描画
		if(drawVectorNormal) {
			if( xCnt  !=  boardXSize) {
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).append(mass);
				massIdCnt++;
				xCnt++;
			} else {
				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
				for(var j=0;j<boardXSize-1;j++) {
					$(nowYRow).append( '<span class="karaMass"></span>')
				}
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).append(mass);
				massIdCnt++;
				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
				drawVectorNormal = false;
				xCnt = 0;
			}
		//左方向にマス描画
		} else {
			if( xCnt  !=  boardXSize) {
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).prepend(mass);
				massIdCnt++;
				xCnt++;
			} else {
				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
				var mass = $(massElm).attr("massNo",massIdCnt).attr("id","mass"+massIdCnt);
				$(nowYRow).append(mass);
				massIdCnt++;
				$("#board").append(nowYRow);
				nowYRow =  $('<div></div>');
				drawVectorNormal = true;
				xCnt = 0;
			}
		}
	}
	$("#board").append(nowYRow).width(80*boardXSize);
	//開始地点と終了地点には色を付ける
	if($("#mass"+0)){
	$("#mass"+0).css("background-color","yellow");
	};
	if ($("#mass"+(_BOARDSIZE-1))){
	$("#mass"+(_BOARDSIZE-1)).css("background-color","blue");
	}else{
	"background-color","white";
	($("#mass")).css("background-color","white");
	}
	
}

/**
 * プレイヤー情報から盤面に位置を再描画
 */
function drawBoardPos() {
	$(".playerMassIcon").remove();
	for(var i=1;i<playerCnt+1;i++) {
		var pos = playerInfo[i].Pos
		$("#mass" + pos + " .massPlayerArea").append("<span class='playerMassIcon'>〇</span>");
	}
}

/**
 * ターン開始時処理
 */
function startTurn(){
	setTimeout(diceRoll,1500);
}

/**
 * ダイス回転開始
 */
function diceRoll(){
	diceTimerId = setInterval(function(){
		$("#dice").text(Math.floor(Math.random() * 10)+1);
	},_ROLLSPEED)
	$("#diceroll").removeAttr("disabled");
}


/**
 * ダイス停止処理
 */
function diceStop() {
	clearInterval(diceTimerId);
	var diceCnt = Number($("#dice").text().trim());
	writeMsg(diceCnt  +"が出ました");
	$("#diceroll").attr("disabled","disabled");

	//ダイスの移動結果か、イベントの実行結果でゲーム終了条件を満たしたらゲーム終了
	if(playerMove(nowPlayerId,diceCnt) || eventCheck(nowPlayerId)) {
		gameEnd();
	} else {
		endTurn();
		
	}
}




/**
 * 指定したプレイヤーの位置を指定したマス分移動させる
 * @param pId 移動させる対象のプレイヤーID
 * @param move 移動数
 * @return true:ゲーム終了 false：ゲーム継続
 */
function playerMove(pId,move) {
	if(playerInfo[pId].Pos+ move <= 0) {
		playerInfo[pId].Pos = 0;
		drawBoardPos();
	} else if(playerInfo[pId].Pos+ move >= _BOARDSIZE-1) {
		playerInfo[pId].Pos = _BOARDSIZE-1;
		drawBoardPos();
		return true
	} else {
		playerInfo[pId].Pos = playerInfo[pId].Pos + move;
		drawBoardPos();
	}
	return false
}

/**
 * 指定プレイヤーのマス位置イベントを実行
 * @param pId
 * @return true:ゲーム終了 false：ゲーム継続
 */
function eventCheck(pId){
   
	//到着マスのイベント発生
	//var massEvt = 6
	var massEvt = Math.floor( Math.random() * 8 );
	if(massEvt == 1){
		writeMsg("落とし穴にハマった・・・。3マス戻る。");
		return playerMove(nowPlayerId,-3);
	}else if(massEvt == 2){
		writeMsg("初めての飛行機に乗った! 4マス進む");
		return playerMove(nowPlayerId,4);
	}else if(massEvt == 3){
		writeMsg("唐揚げ弁当が美味しかった! 2マス進む");
		return playerMove(nowPlayerId,2);
	}else if(massEvt == 4){
		writeMsg("ギャンブルにて大損。10マス戻る");
		return playerMove(nowPlayerId,-10 );
	}else if(massEvt == 5){
		writeMsg("走る！1マス進む");
		return playerMove(nowPlayerId,1 );
	}else if(massEvt == 6){
		writeMsg("謎のイベント発生！奇跡が起こるかも");
		return playerMove(nowPlayerId,54 );
	}else {
		writeMsg("何も起こらなかった");
	}
	return false;
}




/*
 * ターン終了時処理
 */
function endTurn(){
	if(nowPlayerId < playerCnt) {
		nowPlayerId++;
	} else {
		nowPlayerId = 1;
	}
	startTurn();
}

/**
 * ゲーム終了条件が満たされたときにゲームを終了させる
 */
function gameEnd(){
//document.getElementById( '\Sugoroku\clear.mp3' ).play() ;
	var sound1 = new Audio('clear.mp3'); 
	writeMsg("ゲーム終了");
	 sound1.play();
}