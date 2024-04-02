import InvalidParametersError, { BOARD_POSITION_NOT_VALID_MESSAGE, GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, GAME_NOT_STARTABLE_MESSAGE, MOVE_NOT_YOUR_TURN_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE, } from '../../lib/InvalidParametersError';
import Game from './Game';
function getOtherPlayerColor(color) {
    if (color === 'Yellow') {
        return 'Red';
    }
    return 'Yellow';
}
export default class ConnectFourGame extends Game {
    _preferredRed;
    _preferredYellow;
    constructor(priorGame) {
        super({
            moves: [],
            status: 'WAITING_FOR_PLAYERS',
            firstPlayer: getOtherPlayerColor(priorGame?.state.firstPlayer || 'Yellow'),
        });
        this._preferredRed = priorGame?.state.red;
        this._preferredYellow = priorGame?.state.yellow;
    }
    startGame(player) {
        if (this.state.status !== 'WAITING_TO_START') {
            throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
        }
        if (this.state.red !== player.id && this.state.yellow !== player.id) {
            throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
        }
        if (this.state.red === player.id) {
            this.state.redReady = true;
        }
        if (this.state.yellow === player.id) {
            this.state.yellowReady = true;
        }
        if (!(this._preferredRed === this.state.red || this._preferredYellow === this.state.yellow)) {
            this.state.firstPlayer = 'Red';
        }
        this.state = {
            ...this.state,
            status: this.state.redReady && this.state.yellowReady ? 'IN_PROGRESS' : 'WAITING_TO_START',
        };
    }
    _join(player) {
        if (this.state.yellow === player.id || this.state.red === player.id) {
            throw new InvalidParametersError(PLAYER_ALREADY_IN_GAME_MESSAGE);
        }
        if (this._preferredRed === player.id && !this.state.red) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                red: player.id,
            };
        }
        else if (this._preferredYellow === player.id && !this.state.yellow) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                yellow: player.id,
            };
        }
        else if (!this.state.red) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                red: player.id,
            };
        }
        else if (!this.state.yellow) {
            this.state = {
                ...this.state,
                status: 'WAITING_FOR_PLAYERS',
                yellow: player.id,
            };
        }
        else {
            throw new InvalidParametersError(GAME_FULL_MESSAGE);
        }
        if (this.state.red && this.state.yellow) {
            this.state.status = 'WAITING_TO_START';
        }
    }
    _leave(player) {
        if (this.state.status === 'OVER') {
            return;
        }
        const removePlayer = (playerID) => {
            if (this.state.red === playerID) {
                this.state = {
                    ...this.state,
                    red: undefined,
                    redReady: false,
                };
                return 'Red';
            }
            if (this.state.yellow === playerID) {
                this.state = {
                    ...this.state,
                    yellow: undefined,
                    yellowReady: false,
                };
                return 'Yellow';
            }
            throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
        };
        const color = removePlayer(player.id);
        switch (this.state.status) {
            case 'WAITING_TO_START':
            case 'WAITING_FOR_PLAYERS':
                this.state.status = 'WAITING_FOR_PLAYERS';
                break;
            case 'IN_PROGRESS':
                this.state = {
                    ...this.state,
                    status: 'OVER',
                    winner: color === 'Red' ? this.state.yellow : this.state.red,
                };
                break;
            default:
                throw new Error(`Unexpected game status: ${this.state.status}`);
        }
    }
    _validateMove(move) {
        let nextPlayer;
        if (this.state.firstPlayer === 'Red') {
            nextPlayer = this.state.moves.length % 2 === 0 ? 'Red' : 'Yellow';
        }
        else {
            nextPlayer = this.state.moves.length % 2 === 0 ? 'Yellow' : 'Red';
        }
        if (move.gamePiece !== nextPlayer) {
            throw new InvalidParametersError(MOVE_NOT_YOUR_TURN_MESSAGE);
        }
        const numMovesInCol = this.state.moves.filter(m => m.col === move.col).length;
        if (numMovesInCol === 6) {
            throw new InvalidParametersError(BOARD_POSITION_NOT_VALID_MESSAGE);
        }
        if (move.row !== 5 - numMovesInCol) {
            throw new InvalidParametersError(BOARD_POSITION_NOT_VALID_MESSAGE);
        }
    }
    _applyMove(move) {
        const checkForTie = (moves) => moves.length === 42;
        const checkForWin = (moves) => {
            const board = new Array(6);
            for (let i = 0; i < board.length; i += 1) {
                board[i] = new Array(7).fill(undefined);
            }
            for (const eachMove of moves) {
                board[eachMove.row][eachMove.col] = eachMove.gamePiece;
            }
            for (let row = 0; row < board.length; row += 1) {
                let numInARow = 1;
                for (let col = 1; col < board[row].length; col += 1) {
                    if (board[row][col] && board[row][col] === board[row][col - 1]) {
                        numInARow += 1;
                    }
                    else {
                        numInARow = 1;
                    }
                    if (numInARow === 4) {
                        return true;
                    }
                }
            }
            for (let col = 0; col < board[0].length; col += 1) {
                let numInARow = 1;
                for (let row = 1; row < board.length; row += 1) {
                    if (board[row][col] && board[row][col] === board[row - 1][col]) {
                        numInARow += 1;
                    }
                    else {
                        numInARow = 1;
                    }
                    if (numInARow === 4) {
                        return true;
                    }
                }
            }
            for (let row = 0; row < board.length; row += 1) {
                for (let col = 0; col < board[row].length; col += 1) {
                    if (row + 3 < board.length &&
                        col + 3 < board[row].length &&
                        board[row][col] &&
                        board[row][col] === board[row + 1][col + 1] &&
                        board[row][col] === board[row + 2][col + 2] &&
                        board[row][col] === board[row + 3][col + 3]) {
                        return true;
                    }
                }
            }
            for (let row = 0; row < board.length; row += 1) {
                for (let col = 0; col < board[row].length; col += 1) {
                    if (row + 3 < board.length &&
                        col - 3 >= 0 &&
                        board[row][col] &&
                        board[row][col] === board[row + 1][col - 1] &&
                        board[row][col] === board[row + 2][col - 2] &&
                        board[row][col] === board[row + 3][col - 3]) {
                        return true;
                    }
                }
            }
            return false;
        };
        const newMoves = [...this.state.moves, move];
        const newState = {
            ...this.state,
            moves: newMoves,
        };
        if (checkForWin(newMoves)) {
            newState.status = 'OVER';
            newState.winner = move.gamePiece === 'Red' ? this.state.red : this.state.yellow;
        }
        else if (checkForTie(newMoves)) {
            newState.winner = undefined;
            newState.status = 'OVER';
        }
        this.state = newState;
    }
    applyMove(move) {
        if (this.state.status !== 'IN_PROGRESS') {
            throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
        }
        let gamePiece;
        if (move.playerID === this.state.red) {
            gamePiece = 'Red';
        }
        else if (move.playerID === this.state.yellow) {
            gamePiece = 'Yellow';
        }
        else {
            throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
        }
        const newMove = {
            gamePiece,
            col: move.move.col,
            row: move.move.row,
        };
        this._validateMove(newMove);
        this._applyMove(newMove);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdEZvdXJHYW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvQ29ubmVjdEZvdXJHYW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sc0JBQXNCLEVBQUUsRUFDN0IsZ0NBQWdDLEVBQ2hDLGlCQUFpQixFQUNqQiw0QkFBNEIsRUFDNUIsMEJBQTBCLEVBQzFCLDBCQUEwQixFQUMxQiw4QkFBOEIsRUFDOUIsMEJBQTBCLEdBQzNCLE1BQU0sa0NBQWtDLENBQUM7QUFTMUMsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLFNBQVMsbUJBQW1CLENBQUMsS0FBdUI7SUFDbEQsSUFBSSxLQUFLLEtBQUssUUFBUSxFQUFFO1FBQ3RCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFDRCxPQUFPLFFBQVEsQ0FBQztBQUNsQixDQUFDO0FBTUQsTUFBTSxDQUFDLE9BQU8sT0FBTyxlQUFnQixTQUFRLElBQTJDO0lBQzlFLGFBQWEsQ0FBWTtJQUV6QixnQkFBZ0IsQ0FBWTtJQVNwQyxZQUFtQixTQUEyQjtRQUM1QyxLQUFLLENBQUM7WUFDSixLQUFLLEVBQUUsRUFBRTtZQUNULE1BQU0sRUFBRSxxQkFBcUI7WUFDN0IsV0FBVyxFQUFFLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsV0FBVyxJQUFJLFFBQVEsQ0FBQztTQUMzRSxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsYUFBYSxHQUFHLFNBQVMsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDO1FBQzFDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxTQUFTLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNsRCxDQUFDO0lBbUJNLFNBQVMsQ0FBQyxNQUFjO1FBQzdCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssa0JBQWtCLEVBQUU7WUFDNUMsTUFBTSxJQUFJLHNCQUFzQixDQUFDLDBCQUEwQixDQUFDLENB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