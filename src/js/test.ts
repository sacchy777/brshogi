import * as Lib from './brshogi';


function test_match() {

    let m = new Lib.Match();
    while(true) {
	m.play();
	if(m.isFinished) break;
    }
    console.log(m.pos.get_text());
    console.log(m.get_text_history());
}


function test_serialize() {
    let m = new Lib.Match();
    m.pos.test_board2();

    let s:string = m.serialize();
    console.log(s);
    let m2 = Lib.Match.deserialize(s);
    let s2:string = m2.serialize();
    console.log(s2);

    //console.log(Math.random());
}








function test_mate() {
    let pos = new Lib.Position();
    //pos.init_board();
    //console.log(pos.playout());
    pos.test_board5();
    console.log(pos.get_text());
    let m:Lib.MateNode = new Lib.MateNode(pos);
    m.search(9);
    console.log(m.get_text_matemove());
    console.log(m.get_text_numnodes());
}


function test_mcts() {

    let pos = new Lib.Position();
    //    pos.init_board();
    pos.test_board2();
    console.log(pos.get_text());
    let m = new Lib.MctsNode(pos);
    m.search(4000);
    console.log(m.get_text_nextmoves());

}





function test_gamecui() {
    const fs = require('fs');
    let nn:Lib.NN;
    try{
	let data = fs.readFileSync("ai.txt", 'utf8');
	nn = Lib.NN.deserialize(data);
    } catch {
	console.log("no ai file");
	nn = new Lib.NN();
    }
    let gc = new Lib.GameCui();
    gc.init(Lib.Match.MATCHMODE_HUMAN_VS_AI,
	    Lib.Match.AI_HARD,
	    Lib.Match.MATCHORDER_HUMAN_BLACK,
	    nn);
}

function test_movegen() {
    let pos = new Lib.Position();
    let res:string = "";
    pos.clear_board();
    pos.numPlay = 0;

    //pos.inc_jail(Piece.PAWN, 0);
    pos.put_piece(5, 5, Lib.Piece.PAWN, 0);
    console.log(pos.get_text());
    let nextmoves:Lib.Move[] = pos.moveGen(Lib.Position.MOVEGEN_MODE_UNLIMITED);
    nextmoves.forEach((i)=>{res = res + i.get_text() + " ";});
    console.log(res);
}
function test_movegen_all() {
    let nextmoves:Lib.Move[] = [];
    let res = "";
    for(let s = 0; s <= 1; s ++){
	for(let p = 1; p <= 14; p ++) {
	    let piece = p + s * 128;
	    for(let y = 1; y <= 9; y ++) {
		for(let x = 9; x >= 1; x--) {
		    let pos = new Lib.Position();
		    pos.clear_board();
		    pos.numPlay = s;
		    pos.put_piece(x, y, p, s);
		    let nmoves:Lib.Move[] = pos.moveGen(Lib.Position.MOVEGEN_MODE_UNLIMITED);
		    nextmoves = nextmoves.concat(nmoves);
		}
	    }
	}
    }
    nextmoves.forEach((i)=>{res = res + i.get_text() + " ";});
    console.log(res);
    console.log(res.length);
}


function test_playout() {
    const rep = 2500;
    let pos = new Lib.Position();
    pos.init_board();

    pos.clear_piece(9,7);
    pos.put_piece(9,6,Lib.Piece.PAWN,0);
    pos.clear_piece(3,3);
    pos.put_piece(3,4,Lib.Piece.PAWN,1);
    pos.numPlay = 2;

    
    console.log(pos.get_text());
    let a:Lib.Move[] = pos.moveGen();
    for(let i = 0; i < a.length; i ++) {
	let score = 0;
	for(let j = 0; j < rep; j ++) {
	    let tmp = pos.duplicate(a[i]);
	    while(true) {
		let moves:Lib.Move[] = tmp.moveGen();
		if(moves.length == 0) {
		    let side:number = tmp.numPlay % 2;
		    score = score + (side == 0 ? 0 : 1);
		    break;
		}
		let m:number = Math.floor(Math.random() * moves.length);
		tmp.play(moves[m]);
	    }
	}
	let res:string = a[i].get_text() + "(" + (score/rep) + ")";
	console.log(res);
    }
}

function test_learn(match:boolean = false) {
    const fs = require('fs');
    let nn:Lib.NN;
    try{
	let data = fs.readFileSync("ai.txt", 'utf8');
	nn = Lib.NN.deserialize(data);
    } catch {
	console.log("no ai file");
	nn = new Lib.NN();
    }
    
    nn.info();
    nn.learn(match);
    fs.writeFileSync("ai.txt", nn.serialize());
    nn.info();

}
function test_nn() {
    const fs = require('fs');
    let nn:Lib.NN;
    try{
	let data = fs.readFileSync("ai.txt", 'utf8');
	nn = Lib.NN.deserialize(data);
    } catch {
	console.log("no ai file");
	nn = new Lib.NN();
    }

    let pos = new Lib.Position();
    pos.init_board();
    //pos.test_board2();
    while(true){
	console.log(pos.get_text());
	let n:Lib.NNNode = new Lib.NNNode(pos, nn);
	n.search();
	if(n.nextmove == null) break;
	n.dump();
	console.log(n.nextmove.get_text());
	pos.play(n.nextmove);
    }
}
		       
//test_mate();
//test_mcts();
//test_gamecui();
//test_movegen_all();
test_learn(true);
//test_nn();
//test_playout();
