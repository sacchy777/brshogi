
const img = require('../assets/images/shogisprites.png');
const NORMALIZED_HEIGHT:number = 440;
const NORMALIZED_WIDTH:number = 284;
import * as Lib from "./brshogi";
import nnstring from "./ai.txt";
          
type Rect = {
    x:number;
    y:number;
    w:number;
    h:number;
};

enum SpriteIndex {
    None = 0,
    Board,
    BoardLv1,
    BoardLv2,
    BoardLv3,
    BoardLv4,
    
    BoardRed,
    BoardRedLv1,
    BoardRedLv2,
    BoardRedLv3,
    BoardRedLv4,
    
    BoardGray,
    BoardGrayLv1,
    BoardGrayLv2,
    BoardGrayLv3,
    BoardGrayLv4,
    
    PiecePawn,
    PieceLance,
    PieceKnight,
    PieceSilver,
    PieceGold,
    PieceBishop,
    PieceRook,
    PiecePawnP,
    PieceLanceP,
    PieceKnightP,
    PieceSilverP,
    PieceBishopP,
    PieceRookP,
    PieceKing,


}

const Sprites:{[key:number]:Rect} = {
    [SpriteIndex.Board]:{x:0,y:0,w:284,h:440},
    [SpriteIndex.BoardLv1]:{x:37,y:145,w:211,h:225},
    [SpriteIndex.BoardLv2]:{x:67,y:177,w:151,h:161},
    [SpriteIndex.BoardLv3]:{x:97,y:209,w:91,h:97},
    [SpriteIndex.BoardLv4]:{x:127,y:241,w:31,h:33},
    
    [SpriteIndex.BoardRed]:{x:320,y:0,w:284,h:440},
    [SpriteIndex.BoardRedLv1]:{x:357,y:145,w:211,h:224},
    [SpriteIndex.BoardRedLv2]:{x:387,y:177,w:151,h:161},
    [SpriteIndex.BoardRedLv3]:{x:417,y:209,w:91,h:97},
    [SpriteIndex.BoardRedLv4]:{x:447,y:241,w:31,h:33},
    
    [SpriteIndex.BoardGray]:{x:640,y:0,w:284,h:440},
    [SpriteIndex.BoardGrayLv1]:{x:677,y:145,w:211,h:225},
    [SpriteIndex.BoardGrayLv2]:{x:707,y:177,w:151,h:161},
    [SpriteIndex.BoardGrayLv3]:{x:737,y:209,w:91,h:97},
    [SpriteIndex.BoardGrayLv4]:{x:767,y:241,w:31,h:33},
    
    [SpriteIndex.PiecePawn]:{x:961,y:1,w:27,h:29},
    [SpriteIndex.PieceLance]:{x:993,y:1,w:27,h:29},
    [SpriteIndex.PieceKnight]:{x:1025,y:1,w:27,h:29},
    [SpriteIndex.PieceSilver]:{x:1057,y:1,w:27,h:29},
    [SpriteIndex.PieceGold]:{x:1089,y:1,w:27,h:29},
    [SpriteIndex.PieceBishop]:{x:1121,y:1,w:27,h:29},
    [SpriteIndex.PieceRook]:{x:1153,y:1,w:27,h:29},
    [SpriteIndex.PiecePawnP]:{x:961,y:33,w:27,h:29},
    [SpriteIndex.PieceLanceP]:{x:993,y:33,w:27,h:29},
    [SpriteIndex.PieceKnightP]:{x:1025,y:33,w:27,h:29},
    [SpriteIndex.PieceSilverP]:{x:1057,y:33,w:27,h:29},
    [SpriteIndex.PieceKing]:{x:1089,y:33,w:27,h:29},
    [SpriteIndex.PieceBishopP]:{x:1121,y:33,w:27,h:29},
    [SpriteIndex.PieceRookP]:{x:1153,y:33,w:27,h:29},
    

};


class PlayerConfigAndStats {
    matchMode:number;
    aiMode:number;
    mainMenu:number;
    boardflip:boolean;
    score:number[];
    playtime:number;
    achievement:{[key:string]:boolean};
    
    constructor() {
	this.matchMode = 0;
	this.aiMode = 0;
	this.mainMenu = 3;
	this.boardflip = false;
	this.playtime = 0; // in second

	this.score = [0,0,0];
	
	this.achievement = {"win-easy": false,
			    "win-normal": false,
			    "win-hard": false,
			    "win-in-30": false,
			    "win-over-60": false
	};
    }
    serialize():string {
	return JSON.stringify(this);
    }

    static deserialize(d:string):PlayerConfigAndStats {
	let j = JSON.parse(d);
	let o = Object.assign(new PlayerConfigAndStats(), j);
	return o;
    }
}

export default class Game {
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private height : number = window.innerHeight;
    private width : number = window.innerWidth;
    private ratio : number;
    private x:number;
    private ticks:number;
    private image : HTMLImageElement;
    private numopen:number;
    private match:Lib.Match;
    private lastX:number;
    private lastY:number;
    
    private config:PlayerConfigAndStats;
    private startedTime:number;


    static readonly UI_STATE_NONE = 0;
    static readonly UI_STATE_PICKUP = 1;
    static readonly UI_STATE_PUT = 2;
    static readonly UI_STATE_PROMOTE = 3;
    uistate:number;
    piece:number;
    fromx:number;
    fromy:number;
    tox:number;
    toy:number;
    tmp:Lib.Position;
    pointerx:number;
    pointery:number;
    

    finished:boolean;

    nn:Lib.NN;
    
    constructor() {

	this.nn = Lib.NN.deserialize(nnstring);
	
	this.lastX = 0;
	this.lastY = 0;
	this.canvas = <HTMLCanvasElement> document.getElementById('canvas');
	this.ctx = this.canvas.getContext("2d");
	this.canvas.addEventListener("mousedown", this.click, false);
	this.canvas.addEventListener("mousemove", this.move, false);
	this.ratio = this.height / NORMALIZED_HEIGHT;
	this.x = 0;
	this.ticks = 0;
	this.image = <HTMLImageElement> document.createElement('img');
	this.image.src = img;
	//this.info = new Image(284,440);


	let conf:string = localStorage.getItem("config");
	if(conf == undefined){
	    this.config = new PlayerConfigAndStats();
	} else {
	    this.config = PlayerConfigAndStats.deserialize(conf);
	}
	
	this.numopen = parseInt(localStorage.getItem("numopen"));
	if(isNaN(this.numopen)) this.numopen = 0;
	
	window.addEventListener("beforeunload", this.quit);
	window.addEventListener("resize", this.resize);
	
	this.startedTime = new Date().getTime();
	this.init();
	this.gameinit();
    }
    
    init():void {
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	this.canvas.width = this.width;
	this.canvas.height = this.height;
	if(this.width > this.height) {
	    this.ratio = this.height / NORMALIZED_HEIGHT;
	}else{
	    this.ratio = this.width / NORMALIZED_WIDTH;
	}
    }
    
    uiinit(): void {
	this.piece = 0;
	this.fromx = 0;
	this.fromy = 0;
	this.tox = 0;
	this.toy = 0;
	if(this.match.pos) this.tmp = this.match.pos.duplicate();
	this.pointerx = 0;
	this.pointery = 0;
	this.uistate = Game.UI_STATE_PICKUP;
    }
	
    gameinit():void {
	this.uistate = Game.UI_STATE_NONE;
	let mode:number = Lib.Match.MATCHMODE_AI_VS_AI;
	let ai = Lib.Match.AI_EASY;
	let side = Lib.Match.MATCHORDER_HUMAN_BLACK;

	switch(this.config.matchMode) {
	case 0:
	    mode = Lib.Match.MATCHMODE_HUMAN_VS_AI;
	    break;
	case 1:
	    mode = Lib.Match.MATCHMODE_HUMAN_VS_AI;
	    side = Lib.Match.MATCHORDER_HUMAN_WHITE;
	    break;
	case 2:
	    mode = Lib.Match.MATCHMODE_HUMAN_VS_AI;
	    if(Math.random() < 0.5) side = Lib.Match.MATCHORDER_HUMAN_WHITE;
	    break;
	case 3:
	    break;
	}

	switch(this.config.aiMode) {
	case 0:
	    break;
	case 1:
	    ai = Lib.Match.AI_NORMAL;
	    break;
	case 2:
	    ai = Lib.Match.AI_HARD;
	    break;
	case 3:
	    ai = Lib.Match.AI_RANDOM;
	    break;
	}
	
	this.match = new Lib.Match();
	this.match.init(mode, ai, side, this.nn);
	this.finished = false;
	if(side == Lib.Match.MATCHORDER_HUMAN_WHITE) {
	    this.config.boardflip = true;
	} else {
	    this.config.boardflip = false;
	}
    }


    
    
    drawsprite(index:number, x:number, y:number, invert:boolean=false, alpha:number = 1.0):void {
	let src:Rect = Sprites[index];
	this.ctx.save();
	this.ctx.globalAlpha = alpha;
	if(invert) {
	    this.ctx.translate(x * this.ratio, y * this.ratio);
	    this.ctx.rotate(Math.PI/180*180);
	    this.ctx.drawImage
		(this.image, src.x, src.y, src.w, src.h,
		 -src.w * this.ratio, -src.h * this.ratio,
		 src.w * this.ratio, src.h * this.ratio);
	} else {
	    this.ctx.drawImage(this.image, src.x, src.y, src.w, src.h,
			       x * this.ratio, y * this.ratio,
			       src.w * this.ratio, src.h * this.ratio);
	}
    
	this.ctx.restore();
    }

    drawboard(step:number = 0):void {
	let ticks:number = this.ticks%120;
	let blink:number = ticks < 60 ? ticks / 60 : (120-ticks)/60;
	let x:number[] = [0, 
			  Sprites[SpriteIndex.BoardLv1].x,
			  Sprites[SpriteIndex.BoardLv2].x,
			  Sprites[SpriteIndex.BoardLv3].x,
			  Sprites[SpriteIndex.BoardLv4].x,
			  ];
	let y:number[] = [0, 
			  Sprites[SpriteIndex.BoardLv1].y,
			  Sprites[SpriteIndex.BoardLv2].y,
			  Sprites[SpriteIndex.BoardLv3].y,
			  Sprites[SpriteIndex.BoardLv4].y,
			  ];
			  
	if(step < 28) {
	    this.drawsprite(SpriteIndex.Board, x[0], y[0]);
	} else if(step < 30) {
	    this.drawsprite(SpriteIndex.Board, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardRed, x[0], y[0], false, blink);
	    this.drawsprite(SpriteIndex.BoardLv1, x[1], y[1]);
	} else if(step < 58) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv1, x[1], y[1]);
	} else if(step < 60) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], x[0]);
	    this.drawsprite(SpriteIndex.BoardLv1, x[1], y[1]);
	    this.drawsprite(SpriteIndex.BoardRedLv1, x[1], y[1], false, blink);
	    this.drawsprite(SpriteIndex.BoardLv2, x[2], y[2]);
	} else if(step < 88) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv2, x[2], y[2]);
	} else if(step < 90) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv2, x[2], y[2]);
	    this.drawsprite(SpriteIndex.BoardRedLv2, x[2], y[2], false, blink);
	    this.drawsprite(SpriteIndex.BoardLv3, x[3], y[3]);
	} else if(step < 118) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv3, x[3], y[3]);
	} else if(step < 120) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv3, x[3], y[3]);
	    this.drawsprite(SpriteIndex.BoardRedLv3, x[3], y[3], false, blink);
	    this.drawsprite(SpriteIndex.BoardLv4, x[4], y[4]);
	} else if(step < 148) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv4, x[4], y[4]);
	} else if(step < 150) {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	    this.drawsprite(SpriteIndex.BoardLv4, x[4], y[4]);
	    this.drawsprite(SpriteIndex.BoardRedLv4, x[4], y[4], false, blink);
	} else {
	    this.drawsprite(SpriteIndex.BoardGray, x[0], y[0]);
	}
    }

    drawpiece(piece:number, x:number, y:number, side:number) : void {
	let dx:number = 7 + (9 - x) * 30 + 2;
	let dy:number = 112 + (y - 1) * 32 + 3;
	this.drawsprite(piece, dx, dy, side == 0 ? false : true);
    }

    static readonly spriteMapping:{[key:number]:number} = {
	[Lib.Piece.PAWN]:SpriteIndex.PiecePawn,
	[Lib.Piece.LANCE]:SpriteIndex.PieceLance,
	[Lib.Piece.KNIGHT]:SpriteIndex.PieceKnight,
	[Lib.Piece.SILVER]:SpriteIndex.PieceSilver,
	[Lib.Piece.GOLD]:SpriteIndex.PieceGold,
	[Lib.Piece.BISHOP]:SpriteIndex.PieceBishop,
	[Lib.Piece.ROOK]:SpriteIndex.PieceRook,
	[Lib.Piece.PAWN_P]:SpriteIndex.PiecePawnP,
	[Lib.Piece.LANCE_P]:SpriteIndex.PieceLanceP,
	[Lib.Piece.KNIGHT_P]:SpriteIndex.PieceKnightP,
	[Lib.Piece.SILVER_P]:SpriteIndex.PieceSilverP,
	[Lib.Piece.BISHOP_P]:SpriteIndex.PieceBishopP,
	[Lib.Piece.ROOK_P]:SpriteIndex.PieceRookP,
	[Lib.Piece.KING]:SpriteIndex.PieceKing
    };

    // helper
    specfont(size:number, color:string):void{
	let fontsize = size * this.ratio;
	this.ctx.font = ""+fontsize+"px メイリオ";
	this.ctx.fillStyle = color;
    }
    drawtext(str:string, x:number, y:number):void {
	this.ctx.fillText(str, x*this.ratio, y*this.ratio);
    }

    
    public drawpos() : void {
	let pos:Lib.Position = this.match.pos;
	if(this.uistate == Game.UI_STATE_PUT ||
	   this.uistate == Game.UI_STATE_PROMOTE) {
	    pos = this.tmp;
	}
	
	for(let y:number = 1; y <= 9; y ++) {
	    for(let x:number = 9; x >= 1; x--) {
		let [p, s] = pos.get_piece(x, y);
		if(p == 0) continue;
		if(this.config.boardflip){
		    this.drawpiece(Game.spriteMapping[p], (10-x), (10-y), s == 0? 1:0);
		} else {
		    this.drawpiece(Game.spriteMapping[p], x, y, s);
		}
	    }
	}

	let fontsize = 14 * this.ratio;
	this.ctx.font = ""+fontsize+"px メイリオ";
	this.ctx.fillStyle = 'white';
	
	for(let j:number = 0; j <= 1; j ++) {
	    for(let i:number = 1; i <= 7; i ++) {
		let side = j;
		if(this.config.boardflip) {
		    side = side == 0 ? 1 : 0;
		}
		let num = pos.get_jail(i, side);
		
		if(num == 0) continue;
		this.drawsprite(Game.spriteMapping[i], 10 + i * 30, (1-j)*322+82, j == 0 ? false : true);
		if(num > 1){
		    this.ctx.fillText(""+num, (25 + i*30)*this.ratio, ((1-j)*322+112)*this.ratio);
		}
		
	    }
	}


	let flip:boolean = false;
	if(this.match.isPlayerBlack() && this.config.boardflip) flip = true;
	if(!this.match.isPlayerBlack() && !this.config.boardflip) flip = true;
	
	if(this.uistate == Game.UI_STATE_PUT || this.uistate == Game.UI_STATE_PROMOTE) {
	    this.drawsprite(Game.spriteMapping[this.piece],
			    this.lastX - 14, this.lastY - 15,
			    flip);
	    
	}
    }
    
    public drawinfo() : void {
	this.ctx.fillStyle = 'black';
	let fontsize = 18 * this.ratio;
	this.ctx.font = ""+fontsize+"px メイリオ";

	/*
	*/
	let mes;
	if(this.match.pos.numPlay != 0) {
	mes = "[手数 "+(this.match.pos.numPlay)+ "] " + this.match.get_last_move();
	} else {
	    mes = "対局開始";
	}
	this.ctx.fillText(mes , 10*this.ratio, 80*this.ratio);

	this.specfont(25, 'black');

	if(this.config.boardflip) {
	    this.ctx.fillText("▲", 10*this.ratio, 108*this.ratio);
	    this.ctx.fillText("△", 10*this.ratio, 430*this.ratio);
	} else {
	    this.ctx.fillText("▲", 10*this.ratio, 430*this.ratio);
	    this.ctx.fillText("△", 10*this.ratio, 108*this.ratio);
	}

	if(!this.finished) {
	    this.specfont(12, 'black');
	    if(!this.match.isPlayerTurn()) {
		mes = this.ticks % 30 < 15 ? "AI考慮中" : "AI考慮中.";
		this.ctx.fillText(mes, 224*this.ratio, 82*this.ratio);
	    } else {
		mes = this.ticks % 30 < 15 ? "あなたの番です" : "あなたの番です.";
		this.ctx.fillText(mes, 194*this.ratio, 82*this.ratio);
	    }
	}
	

    }

    public drawresult(): void {
	this.ctx.save();
	this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
	this.ctx.fillRect(2 * this.ratio, 40 * this.ratio,
			  280 * this.ratio, 380 * this.ratio);

	this.specfont(20, 'white');
	if(this.match.isFinished) {
	    this.ctx.fillText("[終局] "+(this.match.pos.numPlay)+"手にて" +
			      (this.match.win == 0 ? "先手" : "後手") +
			      "の勝ち",
			      10*this.ratio,
			      65*this.ratio);
	} else {
	    this.ctx.fillText("[対局中]",
			      110*this.ratio,
			      65*this.ratio);
	}

	let ailevel:string = "";
	
	switch(this.match.difficulty){
	case Lib.Match.AI_EASY: ailevel = "やさしい"; break;
	case Lib.Match.AI_NORMAL: ailevel = "ふつう"; break;
	case Lib.Match.AI_HARD: ailevel = "むずかしい"; break;
	case Lib.Match.AI_RANDOM: ailevel = "ランダム"; break;
	}
	
	this.specfont(10, 'white');
	this.drawtext("AI:"+ailevel, 5, 82);
	if(!this.match.isAIMatch()){
	    let side:string = this.match.isPlayerBlack() ? "先手" : "後手";
	    this.drawtext("手番:"+side, 140, 82);
	}
	
	
	
	this.specfont(8, 'white');
	for(let i:number = 0; i < this.match.history.length; i ++) {
	    this.ctx.fillText("["+(i+1)+"] "+this.match.history[i].get_text(),
			      (5 + Math.floor(i/30)*68) * this.ratio,
			      (93 + (i%30)*11) * this.ratio);
	    
	}
	this.ctx.restore();
    }


    public drawpromote(): void {
	this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
	this.ctx.fillRect(40 * this.ratio, 200 * this.ratio,
			  210 * this.ratio, 100 * this.ratio);
	this.specfont(20, 'white');
	this.drawtext("成りますか？", 85, 240);
	this.drawtext("はい            いいえ", 50, 270);

    }
    
    public drawdebug(): void {
	let fontsize = 12 * this.ratio;
	this.ctx.font = ""+fontsize+"px メイリオ";
	this.ctx.fillStyle = 'black';
	
	this.ctx.fillText("Pos "+this.lastX+","+this.lastY+" Size("+ this.width + "x" + this.height + ") [" + this.ratio+ "] NumOpen " + this.numopen + " Ticks "+this.ticks, 0, 30);


	this.ctx.fillText("piece"+this.piece+" "+this.fromx+","+
			  this.fromy+" "+this.tox+","+this.toy,0,60);
	
	this.ctx.fillStyle = 'rgba(0,100,0,0.7)';
	this.ctx.fillRect((165)*this.ratio,
			  (250)*this.ratio,
			  (70)*this.ratio,
			  (30)*this.ratio);
    }


    public drawmaincontrol(): void {
	this.ctx.save();
	this.specfont(14, 'white');
	
	this.specfont(14, this.config.mainMenu == 1 ? 'white':'gray');
	this.drawtext("[対局設定]", 210, 15);
	this.specfont(14, this.config.mainMenu == 2 ? 'white':'gray');
	this.drawtext("[対局状況]", 210, 35);
	this.specfont(14, this.config.mainMenu == 3 ? 'white':'gray');
	this.drawtext("[統計情報]", 140, 15);
	this.specfont(14, this.config.boardflip ? 'white':'gray');
	this.drawtext("[盤面反転]", 140, 35);
	this.ctx.restore();
    }
    
    static readonly maincontrolregions:{[key:string]:Rect} = {
	MODE_CONFIG:{x:210,y:(15-14+2),w:(14*5),h:14},
	MODE_STATUS:{x:210,y:(35-14+2),w:(14*5),h:14},
	MODE_STATS:{x:140,y:(15-14+2),w:(14*5),h:14},
	FLIP:{x:140,y:(35-14+2),w:(14*5),h:14},
    };

    public processmaincontrol(selected:string):void {
	switch(selected) {
	case 'MODE_CONFIG':
	    this.config.mainMenu = this.config.mainMenu == 1 ? 0 : 1;
	    break;
	case 'MODE_STATUS':
	    this.config.mainMenu = this.config.mainMenu == 2 ? 0 : 2;
	    break;
	case 'MODE_STATS':
	    this.config.mainMenu = this.config.mainMenu == 3 ? 0 : 3;
	    break;
	case 'FLIP':
	    this.config.boardflip = !this.config.boardflip;
	    break;
	}
    }

    
    static readonly matchcontrolregions:{[key:string]:Rect} = {
	MODE_BLACK:{x:10,y:(150-14+2),w:(14*6),h:14},
	MODE_WHITE:{x:160,y:(150-14+2),w:(14*6),h:14},
	MODE_RANDOM:{x:10,y:(180-14+2),w:(14*9),h:14},
	MODE_WATCH:{x:160,y:(180-14+2),w:(14*7),h:14},
	AI_EASY:{x:10,y:(250-14+2),w:(14*4),h:14},
	AI_NORMAL:{x:160,y:(250-14+2),w:(14*3),h:14},
	AI_HARD:{x:10,y:(280-14+2),w:(14*5),h:14},
	AI_RANDOM:{x:160,y:(280-14+2),w:(14*7),h:14},
	START:{x:100,y:(390-20+2),w:(20*4),h:20},
    };

    public processmatchcontrol(selected:string):void {
	switch(selected) {
	case 'MODE_BLACK':
	    this.config.matchMode = 0;
	    break;
	case 'MODE_WHITE':
	    this.config.matchMode = 1;
	    break;
	case 'MODE_RANDOM':
	    this.config.matchMode = 2;
	    break;
	case 'MODE_WATCH':
	    this.config.matchMode = 3;
	    break;
	case 'AI_EASY':
	    this.config.aiMode = 0;
	    break;
	case 'AI_NORMAL':
	    this.config.aiMode = 1;
	    break;
	case 'AI_HARD':
	    this.config.aiMode = 2;
	    break;
	case 'AI_RANDOM':
	    this.config.aiMode = 3;
	    break;
	case 'START':
	    this.gameinit();
	    this.config.mainMenu = 0;
	    break;
	}
    }
    
    public drawmatchcontrol(): void {
	this.ctx.save();
	this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
	this.ctx.fillRect(2 * this.ratio, 40 * this.ratio,
			  280 * this.ratio, 380 * this.ratio);
	
	this.specfont(24, 'white');
	this.drawtext("[対局設定]", 80, 70);
	
	this.specfont(14, 'white');
	this.drawtext("[モード]", 10, 120);

	this.specfont(14, this.config.matchMode == 0 ? 'white':'gray');
	this.drawtext("先手番で対局", 10, 150);
	this.specfont(14, this.config.matchMode == 1 ? 'white':'gray');
	this.drawtext("後手番で対局", 160, 150);
	this.specfont(14, this.config.matchMode == 2 ? 'white':'gray');
	this.drawtext("手番ランダムで対局", 10, 180);
	this.specfont(14, this.config.matchMode == 3 ? 'white':'gray');
	this.drawtext("AIの対局を観戦", 160, 180);

	this.specfont(14, 'white');
	this.drawtext("[AIの強さ]", 10, 220);
	this.specfont(14, this.config.aiMode == 0 ? 'white':'gray');
	this.drawtext("やさしい", 10, 250);
	this.specfont(14, this.config.aiMode == 1 ? 'white':'gray');
	this.drawtext("ふつう", 160, 250);
	this.specfont(14, this.config.aiMode == 2 ? 'white':'gray');
	this.drawtext("むずかしい", 10, 280);
	this.specfont(14, this.config.aiMode == 3 ? 'white':'gray');
	this.drawtext("指し手ランダム", 160, 280);
	
	this.specfont(20, 'white');
	this.drawtext("対局開始", 100, 390);

	this.specfont(10, 'white');
	this.drawtext("--- ルール説明 ---", 10, 310);
	let yy:number = 0;
	this.specfont(7, 'white');
	Lib.Match.instruction.forEach((i)=>{
		this.drawtext(i, 20, 320 + yy);
		yy += 10;
	    });


	
	this.ctx.restore();
	
    }



    public drawstats(): void {
	this.ctx.save();
	this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
	this.ctx.fillRect(2 * this.ratio, 40 * this.ratio,
			  280 * this.ratio, 380 * this.ratio);
	
	this.specfont(24, 'white');
	this.drawtext("[統計情報]", 80, 70);

	this.specfont(14, 'white');
	this.drawtext("総プレイ時間", 10, 120);
	let elapsed:number = this.config.playtime + Math.floor((new Date().getTime() - this.startedTime)/1000);
	let sec = elapsed % 60;
	elapsed = Math.floor(elapsed / 60);
	let min = elapsed % 60;
	let hour = Math.floor(elapsed / 60);
	this.drawtext("" + hour + "時間" + min + "分" + sec + "秒",
		      140,120);
	
	this.drawtext("戦績", 10, 160);
	/*
	this.drawtext(""+this.config.score[0]+"勝"+
		      this.config.score[1]+"敗"+
		      this.config.score[2]+"分",
		      140,160);
	*/
	this.drawtext(""+this.config.score[0]+"勝",140,160);
	this.drawtext("目標達成状況", 10, 240);
	this.specfont(14, this.config.achievement['win-easy'] ? 'white':'gray');
	this.drawtext("やさしいAIに勝利", 140, 240);
	this.specfont(14, this.config.achievement['win-normal'] ? 'white':'gray');
	this.drawtext("ふつうAIに勝利", 140, 270);
	this.specfont(14, this.config.achievement['win-hard'] ? 'white':'gray');
	this.drawtext("むずかしいAIに勝利", 140, 300);
	this.specfont(14, this.config.achievement['win-in-30'] ? 'white':'gray');
	this.drawtext("30手以内に勝利", 140, 330);
	this.specfont(14, this.config.achievement['win-over-60'] ? 'white':'gray');
	this.drawtext("60手以上で勝利", 140, 360);
	
	
    }


    
    
    /* main code */
    public process() : void {
	if(this.match.isPlayerTurn()) {
	    if(this.uistate == Game.UI_STATE_NONE) {
		this.uiinit();
	    }
	} else { 
	    this.match.play();
	    this.uistate = Game.UI_STATE_NONE;
	}
	if(this.match.isFinished) {
	    if(!this.finished){
		this.finished = true;
		this.config.mainMenu = 2;
		// achievement
		if(!this.match.isAIMatch()) {
		    if((this.match.win == 0 && this.match.isPlayerBlack()) || (this.match.win == 1 && !this.match.isPlayerBlack())) {
			this.config.score[0] ++;
		    }
		    if(this.match.difficulty == Lib.Match.AI_EASY){
			this.config.achievement['win-easy'] = true;
		    }
		    if(this.match.difficulty == Lib.Match.AI_NORMAL){
			this.config.achievement['win-normal'] = true;
		    }
		    if(this.match.difficulty == Lib.Match.AI_HARD){
			this.config.achievement['win-hard'] = true;
		    }
		    if(this.match.pos.numPlay < 30) {
			this.config.achievement['win-in-30'] = true;
		    }
		    if(this.match.pos.numPlay >= 60) {
			this.config.achievement['win-over-60'] = true;
		    }
		}
		
	    }
	}
    }
    
    public render() : void {

	this.process();
	
	this.ticks ++;
	this.ctx.clearRect(0, 0, this.width, this.height);
	//	this.ctx.fillRect(this.x, 0, this.x+10, 10);
	//	this.ctx.drawImage(this.image, this.x, 40);
	this.x += 1;
	this.drawboard(this.match.pos.numPlay);
	this.drawpos();
	this.drawinfo();
	this.drawmaincontrol();
	if(this.config.mainMenu == 3) this.drawstats();
	if(this.config.mainMenu == 2) this.drawresult();
	if(this.config.mainMenu == 1) this.drawmatchcontrol();
	

	this.ctx.fillStyle = 'rgba(0,100,0,0.7)';

	if(this.uistate == Game.UI_STATE_PROMOTE) {
	    this.drawpromote();
	}
	
	//this.drawdebug();
	/*
	*/
	
    }

    public quit = (event:Event) : void => {
	this.numopen ++;
	let str_numopen:string = "" + this.numopen;
	localStorage.setItem("numopen", ""+str_numopen);

	let elapsed:number = Math.floor((new Date().getTime() - this.startedTime)/1000);
	this.config.playtime += elapsed;
	let conf = this.config.serialize();
	localStorage.setItem("config", conf);
	
    }
	
    public resize = (event:Event) : void => {
	this.init();
    }


    isInside(r:Rect, x:number, y:number):boolean {
	if(r.x <= x && r.y <= y &&
	   x <= r.x + r.w && y <= r.y + r.h) return true;
	return false;
    }
	       

    get_board_pos(mousex:number, mousey:number):[number,number] {
	
	let x = 9 - Math.floor((mousex - 8)/30);
	let y = 1 + Math.floor((mousey - 114)/32);
	if(this.config.boardflip) {
	    x = 10 - x;
	    y = 10 - y;
	}
	return [x,y];
    }
    
    get_jail_pos(mousex:number, mousey:number, side:number):number {

	let dy = 80;
	if(side == 0 && !this.config.boardflip) {
	    dy = 404;
	}
	if(side == 1 && this.config.boardflip) {
	    dy = 404;
	}

	let x = 1 + Math.floor((mousex - 38)/30);
	let y = Math.floor((mousey - dy)/32);
	if(y == 0) return x;
	
	return 0;
    }
    
    public move = (event:MouseEvent) : void => {
	let x = event.clientX / this.ratio;
	let y = event.clientY / this.ratio;
	if(this.uistate == Game.UI_STATE_PUT){
	    this.lastX = x;
	    this.lastY = y;
	}
    }
	
    public click = (event:MouseEvent) : void => {
	let x = event.clientX / this.ratio;
	let y = event.clientY / this.ratio;
	this.lastX = x;
	this.lastY = y;
	
	for(let key in Game.maincontrolregions) {
	    let r = Game.maincontrolregions[key];
	    if(this.isInside(r, x, y)) {
		this.processmaincontrol(key);
		this.uiinit();
	    }		
	}
	
	if(this.config.mainMenu == 1) {
	    for(let key in Game.matchcontrolregions) {
		let r = Game.matchcontrolregions[key];
		if(this.isInside(r, x, y)) this.processmatchcontrol(key);
	    }
	}

	if(this.config.mainMenu == 0 && this.uistate != Game.UI_STATE_NONE) {
	    let fx:number = 0;
	    let fy:number = 0;
	    let s:number = 0;
	    let p:number = 0;
	    let side = this.match.isPlayerBlack() ? 0 : 1;
	    switch(this.uistate) {
	    case Game.UI_STATE_PICKUP:
		[fx,fy] = this.get_board_pos(x, y);
		
		if(fx >= 1 && fx <= 9 && fy >= 1 && fy <= 9) {
		    [p,s] = this.match.pos.get_piece(fx, fy);
		    if(p == 0) break;
		    if((this.match.isPlayerBlack() && s == 0) ||
		       (!this.match.isPlayerBlack() && s == 1)) {
			this.piece = p;
			this.fromx = fx;
			this.fromy = fy;
			this.tmp.clear_piece(fx, fy);
			this.uistate = Game.UI_STATE_PUT;
		    }
		} else {
		    p = this.get_jail_pos(x, y, side);
		    if(p == 0) break;
		    if(this.match.pos.get_jail(p, side) == 0) break;
		    this.piece = p;
		    this.fromx = 0;
		    this.fromy = 0;
		    this.tmp.dec_jail(p, side);
		    this.uistate = Game.UI_STATE_PUT;
		}
		break;
	    case Game.UI_STATE_PUT:
		[fx,fy] = this.get_board_pos(x, y);
		if(fx >= 1 && fx <= 9 && fy >= 1 && fy <= 9) {
		    [p,s] = this.match.pos.get_piece(fx, fy);
		    if(this.match.pos.cell_friend(fx, fy, side)) {
			this.uiinit();
			break;
		    }
		    this.tox = fx;
		    this.toy = fy;
		    let nextmoves:Lib.Move[] = this.match.pos.moveGen(Lib.Position.MOVEGEN_MODE_ALL);
		    let m1:Lib.Move = new Lib.Move();
		    let m2:Lib.Move = new Lib.Move();
		    let legal:boolean = false;
		    let canpromote:boolean = false;
		    m1.set(this.piece, this.fromx, this.fromy,
			   this.tox, this.toy, 0);
		    m2.set(this.piece, this.fromx, this.fromy,
			   this.tox, this.toy, 1);
		    for(let i:number = 0; i < nextmoves.length; i ++) {
			if(nextmoves[i].isEqual(m1)) legal = true;
			if(nextmoves[i].isEqual(m2)) canpromote = true;
		    }
		    
		    if(!legal){
			this.uiinit();
			break;
		    } else {
			if(!canpromote) {
			    this.match.playhuman(m1);
			    this.uistate = Game.UI_STATE_NONE;
			} else {
			    this.uistate = Game.UI_STATE_PROMOTE;
			}
		    }
		//		    this.uistate = Game.UI_STATE_NONE;
		}
		break;
	    case Game.UI_STATE_PROMOTE:
		if(x >= 45 && y >= 250 && x <= 45 + 50 && y <= 250 + 30) {
		    let m:Lib.Move = new Lib.Move();
		    m.set(this.piece, this.fromx, this.fromy,
			   this.tox, this.toy, 1);
		    this.match.playhuman(m);
		    this.uistate = Game.UI_STATE_NONE;
		} else if(x >= 165 && y>=250 && x <= 165+70 && y <= 250+30) {
		    let m:Lib.Move = new Lib.Move();
		    m.set(this.piece, this.fromx, this.fromy,
			   this.tox, this.toy, 0);
		    this.match.playhuman(m);
		    this.uistate = Game.UI_STATE_NONE;
		}
		
		break;
	    }
	    
	}
	
	this.x = 0;
	
    }

}
