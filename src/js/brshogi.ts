


export class Piece {

    static readonly NONE: number = 0;
    static readonly PAWN: number = 1;
    static readonly LANCE: number = 2;
    static readonly KNIGHT: number = 3;
    static readonly SILVER: number = 4;
    static readonly GOLD: number = 5;
    static readonly BISHOP: number = 6;
    static readonly ROOK: number = 7;
    static readonly PAWN_P: number = 8;
    static readonly LANCE_P: number = 9;
    static readonly KNIGHT_P: number = 10;
    static readonly SILVER_P: number = 11;
    static readonly BISHOP_P: number = 12;
    static readonly ROOK_P: number = 13;
    static readonly KING: number = 14;

    static readonly BLACK: number = 0;
    static readonly WHITE: number = 1;
    
    static readonly Text:string[] =
	[
	 "", "歩", "香", "桂", "銀", "金", "角", "飛",
	 "と", "杏", "圭", "全", "馬", "龍", "玉"
	 ];
};

    
export class Move {
    piece: number;
    from_x: number; 
    from_y: number; 
    to_x: number;
    to_y: number;
    promote: number;
    constructor() {
	this.piece = 0;
	this.from_x = 0;
	this.from_y = 0;
	this.to_x = 0;
	this.to_y = 0;
	this.promote = 0;
    }

    public get_text():string {
	let retval: string = "";
	let ext: string;
	if(this.from_x == 0) {
	    ext = "打";
	} else if(this.promote == 1) {
	    ext = "成";
	} else {
	    ext = "";
	}
	retval += this.to_x + "" + this.to_y;
	retval += Piece.Text[this.piece] + ext;
	if(this.from_x != 0) {
	    retval += "(" + this.from_x + "" + this.from_y + ")";
	}
	return retval;
    }
    
    public set(piece: number,
	       from_x: number,
	       from_y: number,
	       to_x: number,
	       to_y: number,
	       promote: number) {
	this.piece = piece;
	this.from_x = from_x;
	this.from_y = from_y;
	this.to_x = to_x;
	this.to_y = to_y;
	this.promote = promote;
    }
    
    duplicate():Move {
	let m:Move = new Move();
	m.piece = this.piece;
	m.from_x = this.from_x;
	m.from_y = this.from_y;
	m.to_x = this.to_x;
	m.to_y = this.to_y;
	m.promote = this.promote;
	return m;
    }
    
    isEqual(t:Move):boolean {
	return this.from_x == t.from_x &&
	    this.from_y == t.from_y &&
	    this.to_x == t.to_x &&
	    this.to_y == t.to_y &&
	    this.promote == t.promote;
    }
};

/*
class Fnv1a32 {
    static readonly PRIME = 16777619;
    static readonly OFFSET = 2166136261;
    static calc(target:number[]) {
	let hash = Fnv1a32.OFFSET;
	for(let i = 0; i < target.length; i = i + 1) {
	    hash = hash ^ target[i];
	    hash = hash * Fnv1a32.PRIME;
	}
	return hash;
    }
}

class MovesHashEntry {
    hash:number;
    pos:Position;
    moves:Move[];
    constructor() {
	this.clear();
    }
    clear():void {
	this.hash = 0;
	this.pos = null;
	this.moves = null;
    }
}

class MovesHashTable {
    static readonly SIZE_MASK:number = 0x0007FFFF;
    static hit:number;
    static mishit:number;
    static numadd:number;
    static db:MovesHashEntry[];

    static init() : void {
	MovesHashTable.db = new Array();
	for(let i = 0; i < MovesHashTable.SIZE_MASK + 1; i++){
	    MovesHashTable.db.push(new MovesHashEntry());
	}
	MovesHashTable.clear();
    }
    
    static clear():void {
	for(let i = 0; i < MovesHashTable.SIZE_MASK + 1; i++){
	    MovesHashTable.db[i].clear();
	}
	MovesHashTable.hit = 0;
	MovesHashTable.mishit = 0;
	MovesHashTable.numadd = 0;
    }
    
    static add(pos:Position, moves:Move[]):void {
	let hash = pos.calc_hash();
	let index = hash & MovesHashTable.SIZE_MASK;
	MovesHashTable.db[index].pos = pos;
	MovesHashTable.db[index].moves = moves;
	MovesHashTable.numadd ++;
    }

    static search(pos:Position):Move[] {
	let hash = pos.calc_hash();
	let index = hash & MovesHashTable.SIZE_MASK;
	let candidate = MovesHashTable.db[index];
	if(pos.isEqual(candidate.pos)) {
	    MovesHashTable.hit ++;
	    return candidate.moves;
	} else {
	    MovesHashTable.mishit ++;
	    return null;
	}
    }
    static dump():void {
	console.log("Add "+MovesHashTable.numadd+" Hit "+MovesHashTable.hit+" Mishit "+MovesHashTable.mishit);
    }
}
*/
export class Position {
    board: number[]; // 0-80, 81-94
    numPlay:number;
    clear_board():void {
	for(let i:number = 0; i < 95; i ++) {
	    this.board[i] = 0;
	}
	this.numPlay = 0;
    }
    constructor() {
	this.board = new Array(95);
	this.clear_board();
	this.init_board();
    }

    duplicate(move:Move = null):Position {
	let p:Position = new Position();
	for(let i:number = 0; i < 95; i ++) {
	    p.board[i] = this.board[i];
	}
	p.numPlay = this.numPlay;
	if(move != null) {
	    p.play(move);
	}
	return p;
    }

    isEqual(target:Position) {
	if(target == null) return false;
	if(this.numPlay % 2 != target.numPlay % 2) return false;
	for(let i:number = 0; i < 95; i ++) {
	    if(this.board[i] != target.board[i]) return false;
	}
	return true;
    }
    /*
    calc_hash():number {
	let target = this.board;
	target.push(this.numPlay % 2);
	return Fnv1a32.calc(target);
    }
    */
    
    /*
      cell check
     */
    cell_outofbounds(x:number, y:number): boolean {
	let level:number = Math.floor(this.numPlay / 30);
	if(x < 1 + level || x > 9 - level || y < 1 + level || y > 9 - level) return true;
	return false;
    }
    cell_empty(x:number, y:number): boolean {
	let i = this.board[(y-1)*9+x-1];
	if(i == 0) return true; else return false;
    }

    cell_friend(x:number, y:number, p:number): boolean {
	if(this.cell_empty(x, y)) return false;
	let i = this.board[(y-1)*9+x-1];
	let side = Math.floor(i / 128);
	if(p == side) return true; else return false;
    }
    
    cell_enemy(x:number, y:number, p:number): boolean {

	if(this.cell_empty(x, y)) return false;
	let i = this.board[(y-1)*9+x-1];
	let side:number = Math.floor(i / 128);

	if(p == side) return false; else return true;
    }

    /*
      helper
     */

    can_promote(fy:number, ty:number, p:number, s:number):boolean {
	if(p >= Piece.PAWN_P) return false;
	if(p == Piece.GOLD) return false;
	if(s == 0 && (ty <= 3 || fy <= 3)) return true;
	if(s == 1 && (ty >= 7 || fy >= 7)) return true;
	return false;
    }


    static readonly checkNearPos:number[][] =
	[
	 [-1, -2], // 0
	 [1, -2],  // 1
	 [-1, -1], // 2
	 [0, -1],  // 3
	 [1, -1], // 4
	 [-1, 0], // 5
	 [1, 0],  // 6
	 [-1, 1], // 7
	 [0, 1],  // 8
	 [1, 1],  // 9
	 ];
					       
    static readonly checkNearPiece:number[][] =
	[
	 [Piece.KNIGHT], // 0
	 [Piece.KNIGHT], // 1
	 [Piece.SILVER, Piece.GOLD, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.ROOK_P, Piece.KING], //2
	 [Piece.PAWN, Piece.SILVER, Piece.GOLD, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.BISHOP_P, Piece.KING], // 3
	 [Piece.SILVER, Piece.GOLD, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.ROOK_P, Piece.KING], //4
	 [Piece.GOLD, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.BISHOP_P, Piece.KING], //5
	 [Piece.GOLD, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.BISHOP_P, Piece.KING], //6
	 [Piece.SILVER, Piece.ROOK_P, Piece.KING], //7
	 [Piece.GOLD, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.BISHOP_P, Piece.KING], //8
	 [Piece.SILVER, Piece.ROOK_P, Piece.KING], //9
	 ];

    static readonly checkFarPos:number[][] =
	[
	 [0, -1], // 0
	 [-1, 0],  // 1
	 [1, 0], // 2
	 [0, 1], // 3
	 
	 [-1, -1], // 4
	 [1, -1], // 5
	 [-1, 1],  // 6
	 [1, 1], // 7
	 ];
					       
    static readonly checkFarPiece:number[][] =
	[
	 [Piece.LANCE, Piece.ROOK, Piece.ROOK_P], // 0
	 [Piece.ROOK, Piece.ROOK_P], // 1
	 [Piece.ROOK, Piece.ROOK_P], // 2
	 [Piece.ROOK, Piece.ROOK_P], // 3
	 [Piece.BISHOP, Piece.BISHOP_P], // 4
	 [Piece.BISHOP, Piece.BISHOP_P], // 5
	 [Piece.BISHOP, Piece.BISHOP_P], // 6
	 [Piece.BISHOP, Piece.BISHOP_P], // 7
	 ];

    get_king_pos(side:number) : number[] {
	for(let j:number = 1; j <= 9; j ++) {
	    for(let i:number = 9; i >=1; i --) {
		let [p, s] = this.get_piece(i, j);
		if(p == Piece.KING && side == s) return [i, j];
	    }
	}
	return [0, 0];
    }

    is_draw():boolean {
	let level:number = Math.floor(this.numPlay / 30);
	if(this.numPlay % 30 != 28) return false;
	
    }
    
    is_checkmated(side:number):boolean {
	let dirside = side == 0 ? 1 : -1;
	let level:number = Math.floor(this.numPlay / 30);
	let [kx, ky] = this.get_king_pos(side);
	if(kx == 0 || ky == 0) return true;

	if(this.numPlay % 30 == 29 && side == 0) {
	    if(kx >= 9 - level || kx <= 1 + level ||
	       ky >= 9 - level || ky <= 1 + level) return true;
	}
	
	if(this.numPlay % 30 == 0  && side == 1 && level >= 1) {
	    if(kx >= 9 - (level - 1) || kx <= 1 + (level - 1)||
	       ky >= 9 - (level - 1) || ky <= 1 + (level - 1)) return true;
	}

	for(let j:number = 0; j < Position.checkNearPos.length; j ++) {
	    let x = kx + dirside * Position.checkNearPos[j][0];
	    let y = ky + dirside * Position.checkNearPos[j][1];
	    if(this.cell_outofbounds(x, y)) continue;
	    if(this.cell_empty(x, y)) continue;
	    let [p,s] = this.get_piece(x, y);
	    if(s == side) continue;
	    for(let i:number = 0; i < Position.checkNearPiece[j].length; i ++) {
		if(p == Position.checkNearPiece[j][i]) return true;
	    }
	}

	for(let j:number = 0; j < Position.checkFarPos.length; j ++) {
	    let x = kx;
	    let y = ky;
	    while(true) {
		x += dirside * Position.checkFarPos[j][0];
		y += dirside * Position.checkFarPos[j][1];
		if(this.cell_outofbounds(x, y)) break;
		if(this.cell_empty(x, y)) continue;
		let [p,s] = this.get_piece(x, y);
		if(s == side) break;
		for(let i:number = 0; i < Position.checkFarPiece[j].length; i ++) {
		    if(p == Position.checkFarPiece[j][i]) return true;
		}
		break;
	    }
	}
	
	return false;
    }

    /*
      piece control
     */
    
    put_piece(x:number, y:number, piece:number, side:number): void {
	this.board[(y-1)*9+x-1] = piece + side*128;
    }

    clear_piece(x:number, y:number): void {
	this.board[(y-1)*9+x-1] = 0;
    }

    
    get_piece(x:number, y:number) : number[] {
	if(y<1 || y>9 || x<1 || x>9){
	    return [Piece.NONE, 0];
	}
	let val:number = this.board[(y-1)*9+x-1];
	let piece:number = val % 128;
	let side:number = val >> 7;
	return [piece, side];
    }

    get_jail(piece:number, side:number) : number {
	let i = 81 + side * 7 + piece - 1;
	return this.board[i];
    }

    inc_jail(piece:number, side:number) : void {
	let i = 81 + side * 7 + piece - 1;
	this.board[i] ++;
    }
    
    dec_jail(piece:number, side:number) : void {
	let i = 81 + side * 7 + piece - 1;
	this.board[i] --;
    }
    
    /*
      display
     */
    get_text(reverse:boolean = false): string {
	let level:number = Math.floor(this.numPlay / 30);
	
	let retval:string = "";
	retval += "--------------------------------\n";
	retval += "手数" + this.numPlay + "\n";
	retval += " 9  8  7  6  5  4  3  2  1\n";
	for(let j:number = 1; j <= 9; j ++) {
	    for(let i:number = 9; i >=1; i --) {

		if(j <= level || j >= 9-level + 1 ||
		   i <= level || i >= 9-level+1) {
		    retval += " ＊";
		} else {
		    let [p, s] = this.get_piece(i, j);
		    if(p == 0){
			retval += "   ";
		    }else {
			if(s == Piece.WHITE) retval += "v"; else retval += " ";
			retval += Piece.Text[p];
		    }
		}
	    }
	    retval += " " + j + "\n";
	}
	for(let j:number = 0; j < 2; j ++) {
	    if(j == 0) retval += "先手:"; else retval += "後手:";
	    for(let i:number = 1; i < 8; i ++) {
		let num = this.get_jail(i, j);
		if(num > 0) {
		    retval += Piece.Text[i] + num;
		}
	    }
	    retval += "\n";
	}
	return retval;
    }
    
    init_board():void {
	this.clear_board();
	
	this.numPlay = 0;
	
	this.put_piece(9, 1, Piece.LANCE, 1);
	this.put_piece(8, 1, Piece.KNIGHT, 1);
	this.put_piece(7, 1, Piece.SILVER, 1);
	this.put_piece(6, 1, Piece.GOLD, 1);
	this.put_piece(5, 1, Piece.KING, 1);
	this.put_piece(4, 1, Piece.GOLD, 1);
	this.put_piece(3, 1, Piece.SILVER, 1);
	this.put_piece(2, 1, Piece.KNIGHT, 1);
	this.put_piece(1, 1, Piece.LANCE, 1);
	this.put_piece(8, 2, Piece.ROOK, 1);
	this.put_piece(2, 2, Piece.BISHOP, 1);
	this.put_piece(9, 3, Piece.PAWN, 1);
	this.put_piece(8, 3, Piece.PAWN, 1);
	this.put_piece(7, 3, Piece.PAWN, 1);
	this.put_piece(6, 3, Piece.PAWN, 1);
	this.put_piece(5, 3, Piece.PAWN, 1);
	this.put_piece(4, 3, Piece.PAWN, 1);
	this.put_piece(3, 3, Piece.PAWN, 1);
	this.put_piece(2, 3, Piece.PAWN, 1);
	this.put_piece(1, 3, Piece.PAWN, 1);

	this.put_piece(9, 9, Piece.LANCE, 0);
	this.put_piece(8, 9, Piece.KNIGHT, 0);
	this.put_piece(7, 9, Piece.SILVER, 0);
	this.put_piece(6, 9, Piece.GOLD, 0);
	this.put_piece(5, 9, Piece.KING, 0);
	this.put_piece(4, 9, Piece.GOLD, 0);
	this.put_piece(3, 9, Piece.SILVER, 0);
	this.put_piece(2, 9, Piece.KNIGHT, 0);
	this.put_piece(1, 9, Piece.LANCE, 0);
	this.put_piece(8, 8, Piece.BISHOP, 0);
	this.put_piece(2, 8, Piece.ROOK, 0);
	this.put_piece(9, 7, Piece.PAWN, 0);
	this.put_piece(8, 7, Piece.PAWN, 0);
	this.put_piece(7, 7, Piece.PAWN, 0);
	this.put_piece(6, 7, Piece.PAWN, 0);
	this.put_piece(5, 7, Piece.PAWN, 0);
	this.put_piece(4, 7, Piece.PAWN, 0);
	this.put_piece(3, 7, Piece.PAWN, 0);
	this.put_piece(2, 7, Piece.PAWN, 0);
	this.put_piece(1, 7, Piece.PAWN, 0);
	//	this.inc_jail(Piece.PAWN, 0);
    }

    test_board_jail():void {
	this.clear_board();
	
	this.numPlay = 0;
	
	this.inc_jail(Piece.PAWN, 0);
	this.inc_jail(Piece.PAWN, 1);
	this.inc_jail(Piece.LANCE, 0);
	this.inc_jail(Piece.LANCE, 1);
	this.inc_jail(Piece.KNIGHT, 0);
	this.inc_jail(Piece.KNIGHT, 1);
	this.inc_jail(Piece.SILVER, 0);
	this.inc_jail(Piece.SILVER, 1);
	this.inc_jail(Piece.GOLD, 0);
	this.inc_jail(Piece.GOLD, 1);
	this.inc_jail(Piece.BISHOP, 0);
	this.inc_jail(Piece.BISHOP, 1);
	this.inc_jail(Piece.ROOK, 0);
	this.inc_jail(Piece.ROOK, 1);

	this.put_piece(5, 1, Piece.KING, 1);
	this.put_piece(5, 9, Piece.KING, 0);

    }


    test_board1():void {
	this.clear_board();
	this.numPlay = 29;
	this.put_piece(5, 1, Piece.KING, 1);
	this.put_piece(5, 8, Piece.KING, 0);
	this.put_piece(1, 5, Piece.BISHOP, 0);
	this.put_piece(4, 3, Piece.PAWN_P, 0);
	this.put_piece(6, 8, Piece.ROOK, 0);
	this.inc_jail(Piece.PAWN, 0);
	this.inc_jail(Piece.PAWN, 1);
    }

    test_board2():void {
	this.clear_board();
	this.numPlay = 0;
	this.put_piece(5, 1, Piece.KING, 1);
	this.put_piece(4, 1, Piece.SILVER, 1);
	this.put_piece(6, 1, Piece.SILVER, 1);
	this.put_piece(5, 3, Piece.GOLD, 0);
	this.put_piece(5, 9, Piece.KING, 0);
	this.inc_jail(Piece.SILVER, 0);
	this.inc_jail(Piece.SILVER, 0);
    }

    test_board2_rev():void {
	this.clear_board();
	this.numPlay = 1;
	this.put_piece(5, 1, Piece.KING, 1);
	this.put_piece(4, 9, Piece.SILVER, 0);
	this.put_piece(6, 9, Piece.SILVER, 0);
	this.put_piece(5, 7, Piece.GOLD, 1);
	this.put_piece(5, 9, Piece.KING, 0);
	this.inc_jail(Piece.SILVER, 1);
	this.inc_jail(Piece.SILVER, 1);
    }

    test_board3():void {
	this.clear_board();
	this.numPlay = 0;
	this.put_piece(2, 1, Piece.KING, 1);
	this.put_piece(2, 2, Piece.SILVER, 1);
	this.put_piece(3, 2, Piece.PAWN, 0);
	this.put_piece(1, 2, Piece.PAWN, 0);
	this.put_piece(2, 3, Piece.SILVER, 0);

	this.put_piece(5, 9, Piece.KING, 0);
	this.inc_jail(Piece.KNIGHT, 0);
	this.inc_jail(Piece.LANCE, 0);
	
	this.inc_jail(Piece.PAWN, 1);
	this.inc_jail(Piece.LANCE, 1);
	this.inc_jail(Piece.KNIGHT, 1);
	this.inc_jail(Piece.SILVER, 1);
	this.inc_jail(Piece.GOLD, 1);
	this.inc_jail(Piece.BISHOP, 1);
	this.inc_jail(Piece.ROOK, 1);
    }

    test_board4():void {
	this.clear_board();
	this.numPlay = 0;
	this.put_piece(2, 1, Piece.BISHOP, 1);
	this.put_piece(5, 2, Piece.PAWN_P, 0);
	this.put_piece(3, 2, Piece.KNIGHT, 1);
	this.put_piece(2, 2, Piece.KING, 1);
	this.put_piece(4, 3, Piece.PAWN, 1);
	this.put_piece(3, 3, Piece.PAWN, 1);
	this.put_piece(2, 3, Piece.PAWN, 1);
	this.put_piece(1, 4, Piece.PAWN, 1);
	this.put_piece(2, 5, Piece.PAWN, 0);
	
	this.put_piece(5, 9, Piece.KING, 0);
	this.inc_jail(Piece.BISHOP, 0);
	this.inc_jail(Piece.GOLD, 0);
	this.inc_jail(Piece.SILVER, 0);
	this.inc_jail(Piece.KNIGHT, 0);
	
	this.inc_jail(Piece.PAWN, 1);
	this.inc_jail(Piece.LANCE, 1);
	this.inc_jail(Piece.KNIGHT, 1);
	this.inc_jail(Piece.SILVER, 1);
	this.inc_jail(Piece.GOLD, 1);
	this.inc_jail(Piece.BISHOP, 1);
	this.inc_jail(Piece.ROOK, 1);
    }
    
    test_board5():void {
	this.clear_board();
	this.numPlay = 27;
	this.put_piece(1, 1, Piece.KING, 1);
	this.put_piece(8, 9, Piece.PAWN, 0);
	this.put_piece(9, 9, Piece.KING, 0);
	this.inc_jail(Piece.PAWN, 1);
	this.inc_jail(Piece.GOLD, 1);
    }

    

    static readonly toPromote:number [] =
	[
	 0, Piece.PAWN_P, Piece.LANCE_P, Piece.KNIGHT_P, Piece.SILVER_P, Piece.GOLD, Piece.BISHOP_P, Piece.ROOK_P,
	 ];
    
    static readonly toJail:number[] = [
		       0, Piece.PAWN, Piece.LANCE, Piece.KNIGHT, Piece.SILVER, Piece.GOLD, Piece.BISHOP, Piece.ROOK,
		       Piece.PAWN, Piece.LANCE, Piece.KNIGHT, Piece.SILVER, Piece.BISHOP, Piece.ROOK, 
    ];

    playRoyal():void {
	if(this.numPlay % 30 != 0) return;
	let level:number = Math.floor(this.numPlay / 30);
	if(level >= 6) return;
	for(let y:number = 9; y >= 1; y --){
	    for(let x:number = 1; x <= 9; x ++) {
		if(y == level || y == 9-level+1 || x == level || x == 9-level+1) {
		    let [p, side] = this.get_piece(x, y);
		    if (p == 0) continue;
		    if (p != Piece.KING) {
			let jside = side == 0 ? 1 : 0;
			let jpiece = Position.toJail[p];
			this.inc_jail(jpiece, jside);
		    }
		    this.clear_piece(x, y);
		}
	    }
	}
    }
    
    play(m:Move):boolean {
	let player = this.numPlay % 2;
	if(m.from_x == 0) {
	    let num = this.get_jail(m.piece, player);
	    if(num == 0) return false;
	    if(!this.cell_empty(m.to_x, m.to_y)) return false;
	    this.put_piece(m.to_x, m.to_y, m.piece, player);
	    this.dec_jail(m.piece, player);
	} else {
	    let [p, side] = this.get_piece(m.from_x, m.from_y);


	    if(side != player) return false;

	    if(p != m.piece) return false;


	    if(this.cell_friend(m.to_x, m.to_y, player)) return false;


	    let piece:number = m.piece;
   
	    if(m.promote == 1 && m.piece != Piece.KING) {
		piece = Position.toPromote[m.piece];
	    }
	    
	    this.clear_piece(m.from_x, m.from_y);
	    if(this.cell_enemy(m.to_x, m.to_y, player)) {
		let [jpiece,jpieceplayer] = this.get_piece(m.to_x, m.to_y);
		jpiece = Position.toJail[jpiece];

		// take piece
		this.inc_jail(jpiece, player);
	    }

   // console.log(" "+m.to_x+" "+m.to_y+" "+piece+" "+player);
	    this.put_piece(m.to_x, m.to_y, piece, player);
	}
	this.numPlay ++;
	this.playRoyal();
	return true;
    }

    static readonly MOVEGEN_MODE_ALL = 0;
    static readonly MOVEGEN_MODE_CHECKMATE = 1;
    static readonly MOVEGEN_MODE_UNLIMITED = 2;
    
    static readonly movelist:{[key:number]:number[]} =
    {
	[Piece.PAWN] : [0,-1],
	[Piece.KNIGHT] : [-1, -2, 1, -2],
	[Piece.SILVER] : [1, -1, 0, -1, -1, -1, 1, 1, -1, 1],
	[Piece.GOLD] : [1, -1, 0, -1, -1, -1, 1, 0, -1, 0, 0, 1],
	[Piece.PAWN_P] : [1, -1, 0, -1, -1, -1, 1, 0, -1, 0, 0, 1],
	[Piece.LANCE_P] : [1, -1, 0, -1, -1, -1, 1, 0, -1, 0, 0, 1],
	[Piece.KNIGHT_P] : [1, -1, 0, -1, -1, -1, 1, 0, -1, 0, 0, 1],
	[Piece.SILVER_P] : [1, -1, 0, -1, -1, -1, 1, 0, -1, 0, 0, 1],
	[Piece.KING] : [1, -1, 0, -1, -1, -1, 1, 0, -1, 0, 1, 1, 0, 1, -1, 1],
	[Piece.BISHOP_P] : [0, -1, 1, 0, -1, 0, 0, 1, ],
	[Piece.ROOK_P] : [1, -1, -1, -1, 1, 1, -1, 1],
    };

    static readonly movelistseq:{[key:number]:number[][]} =
    {
	[Piece.LANCE]:[[0, -1, 0, -2, 0, -3, 0, -4, 0, -5, 0, -6, 0, -7, 0, -8]],
	[Piece.BISHOP] :
	[
	 [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8],
	 [-1, -1, -2, -2, -3, -3, -4, -4, -5, -5, -6, -6, -7, -7, -8, -8],
	 [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8],
	 [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]
	 ],
	[Piece.BISHOP_P] :
	[
	 [1, -1, 2, -2, 3, -3, 4, -4, 5, -5, 6, -6, 7, -7, 8, -8],
	 [-1, -1, -2, -2, -3, -3, -4, -4, -5, -5, -6, -6, -7, -7, -8, -8],
	 [-1, 1, -2, 2, -3, 3, -4, 4, -5, 5, -6, 6, -7, 7, -8, 8],
	 [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8]
	 ],
	[Piece.ROOK] :
	[
	 [-1, 0, -2, 0, -3, 0, -4, 0, -5, 0, -6, 0, -7, 0, -8, 0],
	 [0, -1, 0, -2, 0, -3, 0, -4, 0, -5, 0, -6, 0, -7, 0, -8],
	 [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0],
	 [0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8],
	 ],
	[Piece.ROOK_P] :
	[
	 [-1, 0, -2, 0, -3, 0, -4, 0, -5, 0, -6, 0, -7, 0, -8, 0],
	 [0, -1, 0, -2, 0, -3, 0, -4, 0, -5, 0, -6, 0, -7, 0, -8],
	 [1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8, 0],
	 [0, 1, 0, 2, 0, 3, 0, 4, 0, 5, 0, 6, 0, 7, 0, 8],
	 ],
    };


    canPutPawn(x:number, side:number):boolean {
	for(let y:number = 1; y <= 9; y ++) {
	    let [p,s] = this.get_piece(x, y);
	    if(p == Piece.PAWN && side == s) return false;
	}
	return true;
    }
    
    moveFromJail(moves:Move[], mode:number, piece:number):Move[] {
	let level:number = Math.floor(this.numPlay / 30);
	let side = this.numPlay % 2;
	for(let j:number = 1; j <= 9; j ++) {
	    for(let i:number = 9; i >=1; i --) {
		if(j <= level || j >= 9-level + 1 ||
		   i <= level || i >= 9-level+1) continue;
		if(!this.cell_empty(i, j)) continue;
		if(piece == Piece.PAWN) {
		    if(!this.canPutPawn(i, side)) continue; // double pawn
		} else if(piece == Piece.LANCE) {
		} else if(piece == Piece.KNIGHT) {
		}
		let m:Move = new Move();
		m.set(piece, 0, 0, i, j, 0);
		let pos2:Position = this.duplicate(m);
		if(!pos2.is_checkmated(side) || mode == Position.MOVEGEN_MODE_UNLIMITED) {
		    // pawn mate check
		    if(pos2.is_checkmated(side == 0 ? 1 : 0) && piece == Piece.PAWN) {
			let mm:Move[] = pos2.moveGen();
			if(mm.length == 0) continue;
		    }
		    
		    if(mode == Position.MOVEGEN_MODE_CHECKMATE) {
			if(pos2.is_checkmated(side == 0 ? 1 : 0)) {
			    moves.push(m);
			}
		    } else {
			moves.push(m);
		    }
		}
	    }
	}
	return moves;
    }

    
    moveFromPosition(moves:Move[], mode:number, x:number, y:number, piece:number):Move[] {
	let side = this.numPlay % 2;
	let dirside = side == 0 ? 1 : -1;
	let level:number = Math.floor(this.numPlay / 30);
	
	let move:number[] = Position.movelist[piece];
	if(move != null) {
	    for(let i:number = 0; i < move.length; i +=2) {
		let tx = x + move[i] * dirside;
		let ty = y + move[i+1] * dirside;
		if(this.cell_outofbounds(tx, ty)) continue;
		if(this.cell_friend(tx, ty, side)) continue;
		if(this.can_promote(y, ty, piece, side)) {
		    let m:Move = new Move();
		    m.set(piece, x, y, tx, ty, 1);
		    let pos2:Position = this.duplicate(m);
		    if(!pos2.is_checkmated(side) || mode == Position.MOVEGEN_MODE_UNLIMITED) {
			if(mode == Position.MOVEGEN_MODE_CHECKMATE) {
			    if(pos2.is_checkmated(side == 0 ? 1 : 0)) moves.push(m);
			} else {
			    moves.push(m);
			}
		    }
		}
		let m:Move = new Move();
		m.set(piece, x, y, tx, ty, 0);
		let pos2:Position = this.duplicate(m);
		if(!pos2.is_checkmated(side) || mode == Position.MOVEGEN_MODE_UNLIMITED) {
		    if(mode == Position.MOVEGEN_MODE_CHECKMATE) {
			if(pos2.is_checkmated(side == 0 ? 1 : 0)) moves.push(m);
		    } else {
			moves.push(m);
		    }
		}
	    }
	}
	
	let moveseq:number[][] = Position.movelistseq[piece];
	if(moveseq != null) {
	    for(let j:number = 0; j < moveseq.length; j ++) {
		for(let i:number = 0; i < moveseq[j].length; i +=2) {
		    let tx = x + moveseq[j][i] * dirside;
		    let ty = y + moveseq[j][i+1] * dirside;
		    if(this.cell_outofbounds(tx, ty)) break;
		    if(this.cell_friend(tx, ty, side)) break;
		    if(this.can_promote(y, ty, piece, side)) {
			let m:Move = new Move();
			m.set(piece, x, y, tx, ty, 1);
			let pos2:Position = this.duplicate(m);
			if(!pos2.is_checkmated(side) || mode == Position.MOVEGEN_MODE_UNLIMITED) {
			    if(mode == Position.MOVEGEN_MODE_CHECKMATE) {
				if(pos2.is_checkmated(side == 0 ? 1 : 0)) moves.push(m);
			    } else {
				moves.push(m);
			    }
			}
		    }
		    let m:Move = new Move();
		    m.set(piece, x, y, tx, ty, 0);
		    let pos2:Position = this.duplicate(m);
		    if(!pos2.is_checkmated(side) || mode == Position.MOVEGEN_MODE_UNLIMITED) {
			if(mode == Position.MOVEGEN_MODE_CHECKMATE) {
			    if(pos2.is_checkmated(side == 0 ? 1 : 0)) moves.push(m);
			} else {
			    moves.push(m);
			}
		    }
		    if(this.cell_enemy(tx, ty, side)) break;
		}
	    }
	}
	
	return moves;
    }
    
    moveGen(mode:number = Position.MOVEGEN_MODE_ALL):Move[] {

	//	let hashed:Move[] = MovesHashTable.search(this);
	//	if(hashed) return hashed;
	
	let level:number = Math.floor(this.numPlay / 30);
	let m:Move[] = [];
	let side = this.numPlay % 2;
	
	// take piece from jail
	for(let i:number = 1; i < 8; i ++) {
	    if(this.get_jail(i, side) == 0) continue;
	    m = this.moveFromJail(m, mode, i);
	}

	for(let j:number = 1; j <= 9; j ++) {
	    for(let i:number = 9; i >=1; i --) {
		if(j <= level || j >= 9-level + 1 ||
		   i <= level || i >= 9-level+1) continue;
		let [piece, player] = this.get_piece(i, j);
		if(piece == 0 || player != side) continue;
		m = this.moveFromPosition(m, mode, i, j, piece);
	    }
	}
	
	//	MovesHashTable.add(this, m);
	
	return m;
    }
    
    move_get_text(m:Move[]):string {
	let retval:string = "";
	for(let i:number = 0; i < m.length; i ++) {
	    retval += m[i].get_text() + " ";
	}
	return retval;
    }

    playout():number {
	let tmp:Position = this.duplicate();
	while(true) {
	    let moves:Move[] = tmp.moveGen();
	    let side:number = tmp.numPlay % 2;
	    if(moves.length == 0) {
		return side == 0 ? 1 : 0;
	    }
	    let m:number = Math.floor(Math.random() * moves.length);
	    tmp.play(moves[m]);
	    console.log(moves[m].get_text());
	    console.log(tmp.get_text());
	}
    }
    
};


export class MateNode {
    static readonly SCOREMAX = 9999;
    static readonly SCORETHRESH = 9900;
    side:number;
    pos:Position;
    prevmove:Move;
    nextmoves:Move[];
    nextmove:Move;
    subnodes:MateNode[];
    open:boolean;
    score:number;
    mate:boolean;

    
    constructor(p:Position) {
	this.side = p.numPlay % 2;
	this.pos = p.duplicate();
	this.nextmoves = [];
	this.open = true;
	this.subnodes = [];
	this.prevmove = null;
	this.score = 0;
	this.mate = false;
	this.nextmove = null;
    }

    search(maxLevel:number) {
	let value = this.search_rec(maxLevel, 0);
	if(this.side == 0) {
	    if(value >= MateNode.SCORETHRESH) this.mate = true;
	} else {
	    if(value <= -MateNode.SCORETHRESH) this.mate = true;
	}
	
    }

    search_rec(maxLevel:number, currentLevel:number):number {
	/*
	let space:string = "";
	for(let i = 0;i < currentLevel; i ++) space = space + "  ";
	console.log("Entering "+currentLevel+ "...");
	*/
	
	let socresign = this.pos.numPlay % 2 == 0 ? 1 : -1;
	if(this.open) {
	    
	    if(this.side == this.pos.numPlay %2) { // attack side
		this.nextmoves = this.pos.moveGen(Position.MOVEGEN_MODE_CHECKMATE);
	    } else { // defense side
		this.nextmoves = this.pos.moveGen(Position.MOVEGEN_MODE_ALL);
	    }
	    /*
	    this.nextmoves.forEach((i) => {
		    console.log(space + i.get_text());
		});
	    */
	    this.subnodes = this.nextmoves.map((i) => {
		    let nextPos:Position = this.pos.duplicate(i);
		    let nextMateNode:MateNode = new MateNode(nextPos);
		    nextMateNode.pos = nextPos;
		    nextMateNode.side = this.side;
		    nextMateNode.prevmove = i;
		    return nextMateNode;
		});
	    this.open = false;
	}
	
	let scoresign = this.pos.numPlay % 2 == 0 ? 1 : -1;
	let retval = (MateNode.SCOREMAX - currentLevel) * scoresign;
	
	if(this.nextmoves.length == 0) {
	    /*
	    console.log(space + "no next move " + (-retval));
	    */
	    if(this.side != this.pos.numPlay % 2) {
		let m:Move = this.prevmove;
		if(m.from_x == 0 && m.piece == 1){
		    this.score = retval;
		    return retval; // mate by pawn put
		} else {
		    this.score = -retval;
		    return -retval; // mate found
		}
	    } else {
		this.score = -retval;
		return -retval; // give up looking for mate
	    }
	}
	
	if(maxLevel == currentLevel) {
	    if(this.side != this.pos.numPlay % 2) {
		/*
		console.log(space + "maxlevel reached " + (retval));
		*/
		this.score = retval;
		return retval; // give up looking for mate
	    } else {
		/*
		console.log(space + "maxlevel reached " + (-retval));
		*/
		this.score = -retval;
		return -retval; // give up looking for mate
	    }
	}

	let selected = false;
	let minmax = -retval;
	for(let i:number = 0; i < this.subnodes.length; i ++) {
	    let score = this.subnodes[i].search_rec(maxLevel, currentLevel + 1);
	    if(!selected) {
		minmax = score;
		this.nextmove = this.subnodes[i].prevmove;
		this.score = minmax;
		selected = true;
	    }
	    if(this.pos.numPlay %2 == 0) {
		if(score > minmax) {
		    minmax = score;
		    this.nextmove = this.subnodes[i].prevmove;
		    this.score = minmax;
		}
		if(minmax >= MateNode.SCORETHRESH) {
		    break;
		}
	    } else {
		if(score < minmax) {
		    minmax = score;
		    this.nextmove = this.subnodes[i].prevmove;
		    this.score = minmax;
		}
		if(minmax <= -MateNode.SCORETHRESH) {
		    break;
		}
	    }

	}
	/*
	console.log("Selected: "+this.nextmove.get_text() + "[" + this.score + "]");
	*/
	let next:MateNode = 
	    this.subnodes.reduce((a, b) => {
		    if(this.pos.numPlay%2 == 0) {
			return a.score > b.score ? a : b;
		    } else {
			return a.score < b.score ? a : b;
		    }
		});
	this.nextmove = next.prevmove;
	return minmax;
    }

    get_text_matemove_rec(str:string):string {
	if(this.nextmoves.length == 0) return "";
	let chosen = this.nextmove.get_text();
	let m:MateNode = this.subnodes.find((i) => {
	    return i.prevmove == this.nextmove;
	});
	let append = m.get_text_matemove_rec(str);
	str = chosen + " " + append;
	return str;
    }
    
    get_text_matemove():string {
	let retval = "";
	if(!this.mate) return "No mate found";
	retval = this.get_text_matemove_rec(retval);
	return retval;
    }

    get_text_numnodes_rec():number[] {
	let current_node = this.subnodes.length;
	let current_closed = 0;
	if(current_node == 0) return [0,0];
	this.subnodes.forEach((i)=>{current_closed += i.open ? 0 : 1;});
	for(let i = 0; i < this.subnodes.length; i ++){
	    if(this.subnodes[i].open) continue;
	    let [sub_node, sub_closed] = this.subnodes[i].get_text_numnodes_rec();
	    current_node += sub_node;
	    current_closed += sub_closed;
	}

	return [current_node, current_closed];
    }
    
    get_text_numnodes():string {
	let [node, closed] = this.get_text_numnodes_rec();
	return "[探索済み/局面数] "+closed+"/"+node;
    }
}

export class MatchPlayerConfig {
    static readonly HUMAN = 0;
    static readonly EASY = 1;
    static readonly NORMAL = 2;
    static readonly HARD = 3;
    static readonly RANDOM = 4;

    isHuman:boolean;
    useMcts:boolean;
    mctsDepth:number;
    mateDepth:number;
    useNn:boolean;
    nnRandom:number;
    
    constructor(level:number = MatchPlayerConfig.EASY) {
	//	console.log("ai:"+level);
	
	switch(level) {
	case MatchPlayerConfig.HUMAN:
	    this.isHuman = true;
	    this.useMcts = false;
	    this.mctsDepth = 0;
	    this.mateDepth = 0;
	    this.useNn = true;
	    this.nnRandom = 0;
	    break;
	case MatchPlayerConfig.EASY:
	    this.isHuman = false;
	    this.useMcts = true;
	    this.mctsDepth = 1000;
	    this.mateDepth = 3;
	    this.useNn = true;
	    this.nnRandom = 0.25;
	    break;
	case MatchPlayerConfig.NORMAL:
	    this.isHuman = false;
	    this.useMcts = true;
	    this.mctsDepth = 3000;
	    this.mateDepth = 5;
	    this.useNn = true;
	    this.nnRandom = 0.1;
	    break;
	case MatchPlayerConfig.HARD:
	    this.isHuman = false;
	    this.useMcts = true;
	    this.mctsDepth = 5000;
	    this.mateDepth = 7;
	    this.useNn = true;
	    this.nnRandom = 0;
	    break;
	case MatchPlayerConfig.RANDOM:
	    this.isHuman = false;
	    this.useMcts = false;
	    this.mctsDepth = 0;
	    this.mateDepth = 0;
	    this.useNn = false;
	    this.nnRandom = 0;
	    break;
	}
    }
    
};
export class Match {
    static readonly instruction:string[] =
	[
	 "30手ごとに最外周が使えなくなる将棋です。",
	 "自玉がそのとき最外周にいる場合負けとなります。",
	 "最外周に自駒がある場合、相手の持ち駒になります。",
	 "駒の動かし方は本将棋と同じです。二歩、打ち歩詰めは禁止です。",
	 "進行不能となる不成・駒の移動・駒打、および千日手は禁止していません。",
	 ];
    static readonly PLAYER_HUMAN:number = 0;
    static readonly PLAYER_AI:number = 1;
    
    static readonly MATCHMODE_AI_VS_AI = 0;
    static readonly MATCHMODE_HUMAN_VS_AI = 1;
	
    static readonly AI_EASY = 0;
    static readonly AI_NORMAL = 1;
    static readonly AI_HARD = 2;
    static readonly AI_RANDOM = 3;

    static readonly MATCHORDER_HUMAN_BLACK = 0;
    static readonly MATCHORDER_HUMAN_WHITE = 1;
    static readonly MATCHORDER_HUMAN_RANDOM = 2;
    
    pos:Position;
    history:Move[];
    players:number[] = [Match.PLAYER_AI, Match.PLAYER_AI];
    isFinished:boolean;
    win:number;
    difficulty:number = Match.AI_EASY;
    playerconfig:MatchPlayerConfig[];

    static readonly AI_STATE_NONE = 0;
    static readonly AI_STATE_MATE = 1;
    static readonly AI_STATE_MCTS = 2;
    static readonly AI_STEP = 10;
    
    ai_state:number;
    ai_mcts_step:number;
    ai_mcts:MctsNode;
    ai_ready:number;

    nn:NN;
    ai_nn:NNNode;

    updated:boolean;

    isAIMatch():boolean {
	return (this.players[0] == Match.PLAYER_AI &&
		this.players[1] == Match.PLAYER_AI);
    }
    
    isPlayerBlack():boolean {
	return (this.players[0] == Match.PLAYER_HUMAN);
    }
    
    isPlayerTurn():boolean {
	let side = this.pos.numPlay % 2;
	if(this.players[side] == Match.PLAYER_HUMAN) return true;
	return false;
    }


    constructor() {
	this.pos = new Position();
	this.playerconfig = [new MatchPlayerConfig(), new MatchPlayerConfig()];
	this.init();
    }
    
    init(matchmode:number = Match.MATCHMODE_AI_VS_AI,
	 ai_difficulty:number = Match.AI_EASY,
	 matchorder:number = Match.MATCHORDER_HUMAN_BLACK,
	 nn:NN = null
	 ) {

	//	console.log("init called "+matchmode+" "+ai_difficulty+" "+matchorder);
	this.difficulty = ai_difficulty;
	this.updated = false;
	this.isFinished=false;
	this.win = 0;
	this.history = [];
	this.pos.init_board();
	this.nn = nn;
	let ai_config:number;
	
	switch(ai_difficulty) {
	case Match.AI_EASY: ai_config = MatchPlayerConfig.EASY; break;
	case Match.AI_NORMAL: ai_config = MatchPlayerConfig.NORMAL; break;
	case Match.AI_HARD: ai_config = MatchPlayerConfig.HARD; break;
	case Match.AI_RANDOM: ai_config = MatchPlayerConfig.RANDOM; break;
	}


	//	console.log("ai_config "+ai_config);


	
	this.playerconfig = [new MatchPlayerConfig(ai_config),
			     new MatchPlayerConfig(ai_config)];
	
	this.players = [Match.PLAYER_AI, Match.PLAYER_AI];
			
	if(matchmode == Match.MATCHMODE_HUMAN_VS_AI) {
	    let side = 0;
	    if(matchorder == Match.MATCHORDER_HUMAN_WHITE) {
		side = 1;
	    } else if(matchorder == Match.MATCHORDER_HUMAN_RANDOM) {
		if(Math.random() >= 0.5) {
		    side = 1;
		}
	    }
	    this.players[side] = Match.PLAYER_HUMAN;
	}
	
	this.ai_state = Match.AI_STATE_NONE;
	this.ai_mcts_step = 0;
	this.pretend_think();
    }

    pretend_think():void { this.ai_ready = 50;}
    
    serialize():string {
	return JSON.stringify(this);
    }

    static deserialize(d:string):Match {
	let j = JSON.parse(d);
	let o = Object.assign(new Match(), j);
	return o;
    }
    
    finishcheck():boolean {
	let moves:Move[] = this.pos.moveGen(Position.MOVEGEN_MODE_ALL);
	if(moves.length == 0) {
	    this.win = this.pos.numPlay %2 == 0 ? 1 : 0;
	    this.isFinished = true;
	    return true;
	}
	return false;
    }
    
    playhuman(m:Move):void {
	this.history.push(m);
	this.pos.play(m);
	this.pretend_think();
    }
    
    play():void {

	if(this.isFinished) return;

	if(this.isPlayerTurn()) return;

	if(this.updated) this.updated = false;
	
	if(this.ai_ready > 0) {
	    this.ai_ready --;
	    return;
	}

	
	//	let moves:Move[] = pos.moveGen(Position.MOVEGEN_MODE_CHECKMATE);

	if(this.ai_state == Match.AI_STATE_NONE) {
	    this.ai_state = Match.AI_STATE_MATE;
	    return;
	}

	let nextMove:Move = null;
	let side = this.pos.numPlay %2;
	    
	if(this.ai_state == Match.AI_STATE_MATE) {
	    
	    //	    console.log(this.playerconfig[side].mateDepth);
	    
	    let m:MateNode = new MateNode(this.pos);

	    if(this.playerconfig[side].mateDepth > 0) {
		for(let i = 1; i <= this.playerconfig[side].mateDepth; i = i+ 2) {
		    m.search(i);
		    if(m.mate){
			nextMove = m.nextmove;
			break;
		    }		
		}
		
	    }
	    if(nextMove == null) {
		this.ai_state = Match.AI_STATE_MCTS;
		if(this.playerconfig[side].useNn) {
		    this.ai_nn = new NNNode(this.pos,this.nn);
		    this.ai_mcts_step = 0;
		} else {
		    this.ai_mcts = new MctsNode(this.pos);
		    this.ai_mcts_step = 0;
		}
		return;
	    }
	    
	    this.history.push(nextMove);
	    this.pos.play(nextMove);
	    this.ai_state = Match.AI_STATE_NONE;
	    this.updated = true;
	    return;
	}

	if(this.ai_state == Match.AI_STATE_MCTS) {
	    
	    if(this.playerconfig[side].useNn) {
		if(Math.random() < this.playerconfig[side].nnRandom) {
		    let moves:Move[] = this.pos.moveGen();
		    let moveindex:number = Math.floor(Math.random() * moves.length);
		    if(moves.length == 0) nextMove = null;
		    nextMove = moves[moveindex];
		} else {
		    this.ai_nn.search();
		    nextMove = this.ai_nn.nextmove;
		}
		
	    } else if(this.playerconfig[side].useMcts) {
		
		this.ai_mcts.search(Match.AI_STEP);
		this.ai_mcts_step += Match.AI_STEP;
		if(this.ai_mcts_step > this.playerconfig[side].mctsDepth) {
		    nextMove = this.ai_mcts.nextmove;
		} else {
		    return; // yield
		}
	    } else {
		let moves:Move[] = this.pos.moveGen();
		let moveindex:number = Math.floor(Math.random() * moves.length);
		if(moves.length == 0) nextMove = null;
		nextMove = moves[moveindex];
	    }
	    
	}

	if(nextMove == null) {
	    this.win = this.pos.numPlay %2 == 0 ? 1 : 0;
	    this.isFinished = true;
	} else {
	    this.updated = true;
	    this.history.push(nextMove);
	    this.pos.play(nextMove);
	}
	
	this.ai_state = Match.AI_STATE_NONE;
	this.ai_mcts_step = 0;

	//	MovesHashTable.dump();


	
    }
    
    get_text_history():string {
	let retval:string = "";
	for(let i:number = 0; i < this.history.length; i ++) {
	    retval += this.history[i].get_text() + " ";
	}
	return retval;
    }
    
    get_last_move():string {
	return this.history[this.history.length-1].get_text();
    }
}



export class MctsNode {
    static readonly EXPAND_THRESH:number = 15;
    static readonly C = 0.3;

    side:number;
    pos:Position;
    prevnode:MctsNode;
    nextmoves:Move[];
    nextmove:Move;
    prevmove:Move;
    searchnodes:MctsNode[];
    subnodes:MctsNode[];
    open:boolean;
    started:boolean;
    
    score:number;
    
    numplayed:number;
    win:number;
    
    constructor(p:Position) {
	this.side = p.numPlay % 2;
	this.pos = p.duplicate();
	this.nextmoves = [];
	this.open = true;
	//	this.searchnodes = [];
	this.prevnode = null;
	this.score = 0;
	this.nextmove = null;
	this.numplayed = 0;
	this.win = 0;
	this.started = false;
    }


    choose():MctsNode {
	let m:MctsNode = this.subnodes.find((i)=>{return i.numplayed ==0;});
	if(m) return m;
	
	let n:number = 2*Math.log(this.numplayed);

	let total:number = 0;
	this.subnodes.forEach((i)=>{
		i.score = (i.win/i.numplayed) + MctsNode.C * Math.pow(n/i.numplayed,0.5);
		total+= i.score;
	    });
	let index:number = Math.floor(total * Math.random());
	let proc:number = 0;

	m = this.subnodes[this.subnodes.length - 1];
	for(let i:number = 0; i < this.subnodes.length; i++) {
	    proc += this.subnodes[i].score;
	    if(index < proc) {
		m = this.subnodes[i];
		break;
	    }
	}
	
	if(!m.open) {
	    m = m.choose();
	}
	return m;
	
    }

    expand(target:MctsNode):void {
	if(target.numplayed < MctsNode.EXPAND_THRESH) return;

	target.nextmoves = target.pos.moveGen(Position.MOVEGEN_MODE_ALL);

	target.subnodes = target.nextmoves.map((i) => {
		let nextPos:Position = target.pos.duplicate(i);
		let nextMctsNode:MctsNode = new MctsNode(nextPos);
		nextMctsNode.pos = nextPos;
		nextMctsNode.side = target.side;
		nextMctsNode.prevnode = target;
		nextMctsNode.prevmove = i;
		//		nextMctsNode.numplayed = target.numplayed;
		//		nextMctsNode.win = target.win;
		return nextMctsNode;
	    });

	target.open = false;
    }
    
    search(maxplayout:number) {
	if(!this.started){
	    this.nextmoves = this.pos.moveGen(Position.MOVEGEN_MODE_ALL);
	    if(this.nextmoves.length == 0) { // lose
		this.nextmove = null;
		return;
	    }
	    this.subnodes = this.nextmoves.map((i) => {
		    let nextPos:Position = this.pos.duplicate(i);
		    let nextMctsNode:MctsNode = new MctsNode(nextPos);
		    nextMctsNode.pos = nextPos;
		    nextMctsNode.side = this.side;
		    nextMctsNode.prevnode = this;
		    nextMctsNode.prevmove = i;
		    return nextMctsNode;
		});
	    //	    this.searchnodes = this.subnodes.map((i) => {return i;});

	    this.open = false;
	    this.started = true;
	}
	
	
	for(let i:number = 0; i < maxplayout; i ++) {
	    let c:MctsNode = this.choose();
	    if(c != null) {
		c.playout();
		this.expand(c);
	    }
	}

	this.subnodes.sort((a,b)=>{
		let rate_a:number = a.win/a.numplayed;
		let rate_b:number = b.win/b.numplayed;
		return rate_a > rate_b ? -1 : 1;
	    });
	
	this.nextmove = this.subnodes[0].prevmove;
    }
    
    playout():number {
	this.numplayed ++;
	let tmp:Position = this.pos.duplicate();
	while(true) {
	    let moves:Move[] = tmp.moveGen();
	    if(moves.length == 0) {
		let side:number = tmp.numPlay % 2;
		
		let win = this.side == side ? 0 : 1;
		this.win = this.win + win;
		let supernode = this.prevnode;
		while(supernode.prevmove != null) {
		    supernode.win = supernode.win + win;
		    supernode.numplayed = supernode.numplayed + 1;
		    supernode = supernode.prevnode;
		}
		supernode.numplayed = supernode.numplayed + 1; // root node
		return;
	    }
	    let m:number = Math.floor(Math.random() * moves.length);
	    tmp.play(moves[m]);
	}
    }
    
    get_text_nextmoves():string {
	this.subnodes.sort((a,b)=>{
		let rate_a:number = a.win/a.numplayed;
		let rate_b:number = b.win/b.numplayed;
		return rate_a > rate_b ? -1 : 1;
	    });
	let retval:string = "";
	this.subnodes.forEach((i) => {
		retval += i.prevmove.get_text()
		+ (i.open ? "o":"c")
		+ "(" + i.win+ "/"+i.numplayed+") ";
	    });

	return retval;
    }
}


export class GameCui {
    static readonly STATE_NONE = 0;
    static readonly STATE_PICKUP = 1;
    static readonly STATE_PUT = 2;
    static readonly STATE_PROMOTE = 3;
    
    state:number;
    move:Move;
    match:Match;
    nn:NN;
    
    
    play():void {

	console.log(this.match.pos.get_text());
	console.log(this.match.get_text_history());

       
	this.match.finishcheck();
	
	if(this.match.isFinished) {
	    this.quit();
	    return;
	}
	
	while(true) {
	    if(!this.match.isPlayerTurn()) {
		console.log("AI考慮中...");

		while(true){
		    this.match.play();
		    if(this.match.updated || this.match.isFinished) break;
		}
		
		console.log(this.match.pos.get_text());
		console.log(this.match.get_text_history());
		if(this.match.isFinished){
		    this.quit();
		    break;
		}
	    } else {
		console.log("あなたの番です...");
		this.state = GameCui.STATE_PICKUP;
		break;
	    }
	}
    }
    
    init(matchmode:number = Match.MATCHMODE_AI_VS_AI,
	 ai_difficulty:number = Match.AI_EASY,
	 matchorder:number = Match.MATCHORDER_HUMAN_BLACK,
	 nn:NN = null
	 ){
	this.state = GameCui.STATE_NONE;
	this.match = new Match();
	this.match.init(matchmode, ai_difficulty, matchorder, nn);


	//	console.log("gcinit"+ai_difficulty);
	
	this.play();
	if(this.match.isFinished) return;
	process.stdin.resume();
	process.stdin.setEncoding('utf-8');
	process.stdin.on('data', (i) => {
		this.dispatch(i.trim());
	    });
    }
    init_ai(nn:NN) { this.nn = nn; }
    
    quit():void {
	process.stdin.pause();
	if(this.match.isFinished){
	    console.log((this.match.win == 0 ? "先手":"後手")+"の勝ち");
	}
    }
    
    dispatch(cmd:string):void {
	if(cmd.substring(0,1) == "i") {
	    console.log("--- ルール説明 ---");
	    Match.instruction.forEach((i)=> {
		    console.log(i);
		});
	    return;
	}
	if(cmd.substring(0,1) == "c") {
	    console.log("キャンセルしました");
	    this.state = GameCui.STATE_PICKUP;
	    return;
	}
	if(cmd.substring(0,1) == "q") {
	    console.log("終了しました");
	    this.quit();
	    return;
	}
	
	
	switch(this.state){
	case GameCui.STATE_PICKUP:
	    this.pickup(cmd);
	    break;
	case GameCui.STATE_PUT:
	    this.put(cmd);
	    break;
	case GameCui.STATE_PROMOTE:
	    this.promote(cmd);
	    break;
	}
	
    }
    
    pickup(cmd:string):void {
	let x = parseInt(cmd.substring(0,1));
	let y = parseInt(cmd.substring(1,2));

	if(x == 0 && y >=1 && y <= 7) {
	    let s = this.match.isPlayerBlack() ? 0 : 1;
	    let n = this.match.pos.get_jail(y, s);
	    if(n == 0) {
		console.log("持ち駒にありません("+y+")");
	    } else {
		this.move = new Move();
		this.move.piece = y;
		this.move.from_x = 0;
		this.move.from_y = 0;
		this.state = GameCui.STATE_PUT;
	    }
	} else if(x >= 1 && x <= 9 && y >= 1 && y<= 9) {
	    let [p,s] = this.match.pos.get_piece(x, y);
	    if(p == 0) {
		console.log(""+x+""+y+"に駒がありません");
	    } else if((s == 0 && !this.match.isPlayerBlack()) ||
	       s == 1 && this.match.isPlayerBlack()) {
		console.log(""+x+""+y+"はあなたの駒ではありません");
	    } else {
		this.move = new Move();
		this.move.piece = p;
		this.move.from_x = x;
		this.move.from_y = y;
		this.state = GameCui.STATE_PUT;
	    }
	} else{
	    console.log("XYで盤上の駒または0Nで手駒を選んでください(1歩,2香,3桂,4銀,5金,6角,7飛).");
	}
    }
    
    put(cmd:string):void {
	let x = parseInt(cmd.substring(0,1));
	let y = parseInt(cmd.substring(1,2));
	
	let s = this.match.isPlayerBlack() ? 0 : 1;
	
	if(x >= 1 && x <= 9 && y >= 1 && y<= 9) {
	    if(this.match.pos.cell_friend(x, y, s)) {
		console.log(""+x+""+y+"に駒をおけません");
	    } else {
		this.move.to_x = x;
		this.move.to_y = y;
		let m1:Move = this.move.duplicate();
		let m2:Move = this.move.duplicate();
		m2.promote = 1;
		let nextmoves:Move[] = this.match.pos.moveGen(Position.MOVEGEN_MODE_ALL);
		let legal:boolean = false;
		let canpromote:boolean = false;
		for(let i:number = 0; i < nextmoves.length; i ++) {
		    if(nextmoves[i].isEqual(m1)) legal = true;
		    if(nextmoves[i].isEqual(m2)) canpromote = true;
		}
		
		if(!legal) {
		    console.log(""+x+""+y+"に駒をおけません");
		} else if(!canpromote) {
		    this.match.playhuman(m1);
		    this.state = GameCui.STATE_NONE;
		    this.play();
		} else {
		    console.log("成りますか(y/n)?");
		    this.state = GameCui.STATE_PROMOTE;
		}
	    }
	} else{
	    console.log("XYで駒を置く場所を選んでください");
	}
    }
    promote(cmd:string):void {
	if(cmd.substring(0,1) == "y") {
	    let m2:Move = this.move.duplicate();
	    m2.promote = 1;
	    this.match.playhuman(m2);
	    this.state = GameCui.STATE_NONE;
	    this.play();
	} else if (cmd.substring(0,1) == "n") {
	    this.match.playhuman(this.move);
	    this.state = GameCui.STATE_NONE;
	    this.play();
	} else {
	    console.log("成りますか(y/n)?");
	}
    }
}




export class NN {
    
    // bias, piece*position*side, jail-piece*jail-side, put-piece, fromx, fromy, tox, toy, promote, numplay
    static readonly NUM_INPUT = (1+81*14*2+7*2+14+9+9+9+9+1+100); // 2434
    static readonly NUM_HIDDEN = 350;
    static readonly NUM_OUTPUT = 1;
    static readonly NUM_PLAYOUT = 2500;
    static readonly NUM_BATCH = 4*7;
    //static readonly NUM_BATCH = 1;
    static readonly NUM_BP_REPEAT = 1;
	
    static readonly INITIAL_W = 0.009;
    static readonly ETA = 0.001;
    eta:number;

    input:number[];
    hidden:number[];
    hidden_f:number[];
    hidden_w:number[];
    output:number[];
    output_f:number[];
    output_w:number[];
    
    moves:Move[];

    num_learn:number;
    elapsed:number;
    

    serialize():string {
	this.cleanup();
	return JSON.stringify(this);
    }

    static deserialize(d:string):NN {
	let j = JSON.parse(d);
	let o = Object.assign(new NN(), j);
	return o;
    }
    
    constructor() {
	this.input = new Array(NN.NUM_INPUT);
	this.hidden = new Array(NN.NUM_HIDDEN);
	this.hidden_f = new Array(NN.NUM_HIDDEN);
	this.hidden_w = new Array((NN.NUM_HIDDEN) * (NN.NUM_INPUT));
	this.output = new Array(NN.NUM_OUTPUT);
	this.output_f = new Array(NN.NUM_OUTPUT);
	this.output_w = new Array(NN.NUM_OUTPUT * (NN.NUM_HIDDEN));
	this.elapsed = 0;
	this.eta = NN.ETA;
	this.num_learn = 0;
	this.init();
    }
    duplicate():NN {
	let nn:NN = new NN();
	for(let i = 0; i < this.hidden_w.length; i = i + 1) {
	    nn.hidden_w[i] = this.hidden_w[i];
	}
	for(let i = 0; i < this.output_w.length; i = i + 1) {
	    nn.output_w[i] = this.output_w[i];
	}
	return nn;
    }
    cleanup() {
	this.input.fill(0);
	this.hidden.fill(0);
	this.hidden_f.fill(0);
	this.output.fill(0);
	this.output_f.fill(0);
	this.moves = null;
    }
    
    init():void {
	for(let i = 0; i < this.hidden_w.length; i = i + 1){
	    this.hidden_w[i] = NN.INITIAL_W * Math.random();
	}
	for(let i = 0; i < this.output_w.length; i = i + 1){
	    this.output_w[i] = NN.INITIAL_W * Math.random();
	}
    }
    info():void {
	let sec_r = Math.floor(this.elapsed/1000);
	let sec = sec_r%60;
	let min_r = Math.floor(sec_r / 60);
	let min = min_r % 60;
	let hour_r = Math.floor(min_r / 60);
	let hour = hour_r % 24;
	let day = Math.floor(hour_r / 24);
	
	console.log("-------------------------------------");
	console.log("Info");
	console.log("Input "+this.input.length+" Hidden "+this.hidden.length);
	console.log("learn "+ this.num_learn + " elapsed "+day+":"+hour+":"+min+":"+sec);
	console.log("-------------------------------------");
    }
    
    makeinput(pos:Position, move:Move):void {
	this.input.fill(0);
	this.input[0] = 1.0; // bias
	for(let x = 9; x >= 1; x--) { // position
	    for(let y = 1; y <= 9; y++) {
		let [p,s] = pos.get_piece(x, y);
		if(p != 0) this.input[(s*14+(p-1))*81 + (y-1)*9 + (x-1) + 1] = 1.0;
	    }
	}
	for(let s = 0; s <= 1; s++) { // jail
	    for(let p = 1; p <= 7; p++) {
		let n = pos.get_jail(p, s);
		if(n > 0) this.input[ ( s*7 + p-1 ) + 81*14*2 + 1] = 1.0;
	    }
	}
	
	this.input[81*14*2+1+2*7+(move.piece-1)] = 1.0;
	if(move.from_x != 0) this.input[81*14*2+1+2*7+14+(move.from_x-1)] = 1.0;
	if(move.from_y != 0) this.input[81*14*2+1+2*7+14+9+(move.from_y-1)] = 1.0;
	this.input[81*14*2+1+2*7+14+9+9+(move.to_x-1)] = 1.0;
	this.input[81*14*2+1+2*7+14+9+9+9+(move.to_y-1)] = 1.0;
	if(move.promote == 1) this.input[81*14*2+1+2*7+14+9+9+9+9] = 1.0;
	let play = pos.numPlay;
	if(play > 99) play = 99;
	this.input[81*14*2+1+2*7+14+9+9+9+9+1 + play] = 1.0;
    }
    
    forward():void {
	this.hidden.fill(0);
	this.hidden_f.fill(0);
	this.output.fill(0);
	this.output_f.fill(0);
	let k = 0;
	
	this.hidden[0] = 1.0; // bias
	this.hidden_f[0] = this.hidden[0] > 0 ? this.hidden[0] : 0;
	for(let i = 1; i < this.hidden.length; i = i + 1) {
	    let sum = 0;
	    for(let j = 0; j < this.input.length; j = j + 1) {
		sum = sum + this.hidden_w[k] * this.input[j];
		k = k + 1;
	    }
	    this.hidden[i] = sum;
	    this.hidden_f[i] = sum > 0 ? sum : 0; // ReLU
	    //	    console.log("hidden["+i+"]:"+this.hidden[i]);
	}

	k = 0;
	for(let i = 0; i < this.output.length; i = i + 1) {
	    let sum = 0;
	    for(let j = 0; j < this.hidden.length; j = j + 1) {
		sum = sum + this.output_w[k] * this.hidden_f[j];
		k = k + 1;
	    }
	    this.output[i] = sum;
	    this.output_f[i] = sum > 0 ? sum : 0; // ReLU
	    //	    console.log("output:"+this.output[i]);
	}
    }


    backprop(teacher:number[]):void {
	let k = 0;
	for(let i = 0; i < this.output.length; i = i + 1) {
	    let errp = this.output_f[i] - teacher[i]; // error prime
	    let err = 0.5 * Math.pow(errp, 2.0);
	    
	    console.log(this.output_f[i] + "(" + errp + ")");
	    
	    let funcp = this.output[i] > 0 ? 1.0 : 0; // ReLU prime
	    let sigma = errp * funcp;
	    for(let j = 0; j < this.hidden.length; j = j + 1) {
		let delta = -this.eta * sigma * this.hidden_f[j];
		this.output_w[k] = this.output_w[k] + delta;
		k = k + 1;
	    }
	}
	k = 0;
	
	
	for(let i = 0; i < this.hidden.length; i = i + 1) {
	    let presigma = 0;
	    let errp = 0;
	    for(let j = 0; j < this.output.length; j = j + 1) {
		errp = this.output_f[j] - teacher[j]; // error prime
		let funcp = this.output[j] > 0 ? 1.0 : 0; // ReLU prime
		presigma = presigma + errp * funcp;
	    }
	    presigma = presigma * this.output_w[i];
	    for(let l = 0; l < this.input.length; l = l + 1) {
		let funcp = this.hidden[i] > 0 ? 1.0 : 0; // ReLU prime
		let delta = -this.eta * presigma * funcp * this.input[l];
		this.hidden_w[k] = this.hidden_w[k] + delta;
		k = k + 1;
	    }
	}
	
    }
    
    playout(pos:Position):number {
	let tmp = pos.duplicate();
	while(true) {
	    let moves:Move[] = tmp.moveGen();
	    if(moves.length == 0) {
		let side:number = tmp.numPlay % 2;
		return side == 0 ? 0 : 1;
	    }
	    let m:number = Math.floor(Math.random() * moves.length);
	    tmp.play(moves[m]);
	}
    }

    learn(match:boolean = false):void {
	let then = new Date().getTime();

	
	for(let j = 0; j < NN.NUM_BATCH; j++) {
	    console.log("Iter "+j);
	    let pos = new Position();
	    let nn:NN = this.duplicate();
	    while(true) {
		let moves = pos.moveGen();
		if(moves.length == 0) break;
		
		let move:Move = null;
		
		if(!match) { // random pickup
		    let m:number = Math.floor(Math.random() * moves.length);
		    move = moves[m];
		} else { // match pickup
		    let m:MateNode = new MateNode(pos);
		    for(let i = 1; i <= 7; i = i+ 2) {
			m.search(i);
			if(m.mate){
			    move = m.nextmove;
			    break;
			}		
		    }
		    if(!move) {
			if(Math.random() < 0.75) {// random prob
			    let m:number = Math.floor(Math.random() * moves.length);
			    move = moves[m];
			} else {
			
			    let m:NNNode = new NNNode(pos, nn);
			    m.search();
			    move = m.nextmove;
			}
		    }
		}
		
		let tmp = pos.duplicate(move);
		
		let teacher = 0;
		for(let i = 0; i < NN.NUM_PLAYOUT; i ++) {
		    teacher += this.playout(tmp);
		}
		teacher /= NN.NUM_PLAYOUT;
		
		console.log(pos.get_text());
		console.log((pos.numPlay%2==0?"B":"W")+move.get_text() + " playout:"+teacher);
		
		this.makeinput(pos, move);
		for(let k = 0; k < NN.NUM_BP_REPEAT; k++) {
		    this.forward();
		    this.backprop([teacher]);
		    this.num_learn ++;
		}
		pos.play(move);
	    }
	}
	let now = new Date().getTime();
	this.elapsed += now-then;
	console.log("elapsed "+ (now-then)/1000 + "(total " + this.elapsed/1000+") sec");
	console.log("total weight updated "+this.num_learn);
    }
}

export class NNMove {
    move:Move;
    prob:number;
    constructor(move:Move, prob:number) {
	this.move = move;
	this.prob = prob;
    }
}

export class NNNode {
    nextmove:Move;
    nn:NN;
    pos:Position;
    moves:NNMove[];
    total:number;

    constructor(p:Position, nn:NN) {
	this.nn = nn;
	this.nextmove = null;
	this.pos = p;
	this.total = 0;
	let nextmoves = this.pos.moveGen();
	this.moves = [];
	if(nextmoves.length != 0) {
	    for(let i = 0; i < nextmoves.length; i ++) {
		this.moves.push(new NNMove(nextmoves[i], 0));
	    }
	}
    }
    
    search() {
	this.nextmove = null;
	if(this.moves.length == 0) return;
	this.total = 0;
	for(let i = 0; i < this.moves.length; i ++) {
	    this.nn.makeinput(this.pos, this.moves[i].move);
	    this.nn.forward();
	    let prob = this.nn.output_f[0];
	    this.moves[i].prob = prob;
	}
	if(this.pos.numPlay % 2 == 0) {
	    this.moves.sort((a,b)=>{return a.prob > b.prob ? -1 : 1;});
	} else {
	    this.moves.sort((a,b)=>{return a.prob > b.prob ? 1 : -1;});
	}
	
	let p = 0.66;
	this.nextmove = this.moves[this.moves.length - 1].move;
	for(let i = 0; i < this.moves.length; i ++) {
	    if(Math.random() < p) {
		this.nextmove=this.moves[i].move;
		break;
	    }
	}
    }
    
    dump() {
	let str = "";
	for(let i = 0; i < this.moves.length; i ++) {
	    str = str + this.moves[i].move.get_text() + " " + this.moves[i].prob + "\n";
	}
	console.log(str);
    }
}


