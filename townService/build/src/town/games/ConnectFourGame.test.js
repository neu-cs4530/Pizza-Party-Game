import { Console } from 'console';
import { BOARD_POSITION_NOT_VALID_MESSAGE, GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, GAME_NOT_STARTABLE_MESSAGE, MOVE_NOT_YOUR_TURN_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE, } from '../../lib/InvalidParametersError';
import { createPlayerForTesting } from '../../TestUtils';
import ConnectFourGame from './ConnectFourGame';
const logger = new Console(process.stdout, process.stderr);
function createMovesFromPattern(game, pattern, redID, yellowID, firstColor) {
    const queues = {
        Yellow: [],
        Red: [],
    };
    pattern.forEach((row, rowIdx) => {
        row.forEach((col, colIdx) => {
            if (col === 'Y') {
                queues.Yellow.push({
                    rowIdx: rowIdx,
                    colIdx: colIdx,
                });
            }
            else if (col === 'R') {
                queues.Red.push({
                    rowIdx: rowIdx,
                    colIdx: colIdx,
                });
            }
            else if (col !== '_') {
                throw new Error(`Invalid pattern: ${pattern}, expecting 2-d array of Y, R or _`);
            }
        });
    });
    const queueSorter = (a, b) => {
        function cellNumber(move) {
            return 6 * (5 - move.rowIdx) + move.colIdx;
        }
        return cellNumber(a) - cellNumber(b);
    };
    queues.Yellow.sort(queueSorter);
    queues.Red.sort(queueSorter);
    const colHeights = [5, 5, 5, 5, 5, 5, 5];
    const movesMade = [[], [], [], [], [], []];
    const makeMove = (color) => {
        const queue = queues[color];
        if (queue.length === 0)
            return;
        for (const move of queue) {
            if (move.rowIdx === colHeights[move.colIdx]) {
                game.applyMove({
                    gameID: game.id,
                    move: {
                        gamePiece: color,
                        col: move.colIdx,
                        row: move.rowIdx,
                    },
                    playerID: color === 'Red' ? redID : yellowID,
                });
                movesMade[move.rowIdx][move.colIdx] = color === 'Red' ? 'R' : 'Y';
                queues[color] = queue.filter(m => m !== move);
                colHeights[move.colIdx] -= 1;
                return;
            }
        }
        logger.table(pattern);
        logger.table(movesMade);
        throw new Error(`Unable to apply pattern: ${JSON.stringify(pattern, null, 2)}
      If this is a pattern in the autograder: are you sure that you checked for game-ending conditions? If this is a pattern you provided: please double-check your pattern - it may be invalid.`);
    };
    const gameOver = () => game.state.status === 'OVER';
    while (queues.Yellow.length > 0 || queues.Red.length > 0) {
        makeMove(firstColor);
        if (gameOver())
            return;
        makeMove(firstColor === 'Red' ? 'Yellow' : 'Red');
        if (gameOver())
            return;
    }
}
describe('ConnectFourGame', () => {
    let game;
    beforeEach(() => {
        game = new ConnectFourGame();
    });
    describe('[T1.1] _join', () => {
        it('should throw an error if the player is already in the game', () => {
            const player = createPlayerForTesting();
            game.join(player);
            expect(() => game.join(player)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
            const player2 = createPlayerForTesting();
            game.join(player2);
            expect(() => game.join(player2)).toThrowError(PLAYER_ALREADY_IN_GAME_MESSAGE);
        });
        it('should throw an error if the player is not in the game and the game is full', () => {
            const player1 = createPlayerForTesting();
            const player2 = createPlayerForTesting();
            const player3 = createPlayerForTesting();
            game.join(player1);
            game.join(player2);
            expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
        });
        describe('if the player is not in the game and the game is not full', () => {
            describe('if the player was not the yellow in the last game', () => {
                it('should add the player as red if red is empty', () => {
                    const red = createPlayerForTesting();
                    game.join(red);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBeUndefined();
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                it('should add the player as yellow if red is present', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                    game.join(yellow);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBe(yellow.id);
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_TO_START');
                });
            });
            describe('if the player was yellow in the last game', () => {
                it('should add the player as yellow if yellow is empty', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    game.join(yellow);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBe(yellow.id);
                    const secondGame = new ConnectFourGame(game);
                    expect(secondGame.state.red).toBeUndefined();
                    expect(secondGame.state.yellow).toBeUndefined();
                    secondGame.join(yellow);
                    expect(secondGame.state.red).toBe(undefined);
                    expect(secondGame.state.yellow).toBe(yellow.id);
                    const newRed = createPlayerForTesting();
                    secondGame.join(newRed);
                    expect(secondGame.state.red).toBe(newRed.id);
                });
            });
            it('should set the status to WAITING_TO_START if both players are present', () => {
                const red = createPlayerForTesting();
                const yellow = createPlayerForTesting();
                game.join(red);
                game.join(yellow);
                expect(game.state.status).toBe('WAITING_TO_START');
                expect(game.state.redReady).toBeFalsy();
                expect(game.state.yellowReady).toBeFalsy();
            });
        });
    });
    describe('[T1.2] _startGame', () => {
        test('if the status is not WAITING_TO_START, it throws an error', () => {
            const player = createPlayerForTesting();
            game.join(player);
            expect(() => game.startGame(player)).toThrowError(GAME_NOT_STARTABLE_MESSAGE);
        });
        test('if the player is not in the game, it throws an error', () => {
            game.join(createPlayerForTesting());
            game.join(createPlayerForTesting());
            expect(() => game.startGame(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
        describe('if the player is in the game', () => {
            const red = createPlayerForTesting();
            const yellow = createPlayerForTesting();
            beforeEach(() => {
                game.join(red);
                game.join(yellow);
            });
            test('if the player is red, it sets redReady to true', () => {
                game.startGame(red);
                expect(game.state.redReady).toBe(true);
                expect(game.state.yellowReady).toBeFalsy();
                expect(game.state.status).toBe('WAITING_TO_START');
            });
            test('if the player is yellow, it sets yellowReady to true', () => {
                game.startGame(yellow);
                expect(game.state.redReady).toBeFalsy();
                expect(game.state.yellowReady).toBe(true);
                expect(game.state.status).toBe('WAITING_TO_START');
            });
            test('if both players are ready, it sets the status to IN_PROGRESS', () => {
                game.startGame(red);
                game.startGame(yellow);
                expect(game.state.redReady).toBe(true);
                expect(game.state.yellowReady).toBe(true);
                expect(game.state.status).toBe('IN_PROGRESS');
            });
            test('if a player already reported ready, it does not change the status or throw an error', () => {
                game.startGame(red);
                game.startGame(red);
                expect(game.state.redReady).toBe(true);
                expect(game.state.yellowReady).toBeFalsy();
                expect(game.state.status).toBe('WAITING_TO_START');
            });
            test('if there are not any players from a prior game, it always sets the first player to red when the game starts', () => {
                game.startGame(red);
                game.startGame(yellow);
                game.leave(red);
                expect(game.state.status).toBe('OVER');
                const secondGame = new ConnectFourGame(game);
                secondGame.join(red);
                expect(secondGame.state.red).toBe(red.id);
                const newYellow = createPlayerForTesting();
                secondGame.join(newYellow);
                expect(secondGame.state.yellow).toBe(newYellow.id);
                secondGame.leave(red);
                const newRed = createPlayerForTesting();
                secondGame.join(newRed);
                secondGame.startGame(newYellow);
                secondGame.startGame(newRed);
                expect(secondGame.state.firstPlayer).toBe('Red');
            });
            test('if there are players from a prior game, it sets the first player to the player who was not first in the last game', () => {
                game.startGame(red);
                game.startGame(yellow);
                game.leave(red);
                const secondGame = new ConnectFourGame(game);
                const newRed = createPlayerForTesting();
                secondGame.join(newRed);
                secondGame.join(yellow);
                secondGame.startGame(newRed);
                secondGame.startGame(yellow);
                expect(secondGame.state.firstPlayer).toBe('Yellow');
            });
        });
    });
    describe('[T1.3] _leave', () => {
        it('should throw an error if the player is not in the game', () => {
            const player = createPlayerForTesting();
            expect(() => game.leave(player)).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            game.join(player);
            expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
        describe('when the player is in the game', () => {
            describe('when the game is in progress', () => {
                test('if the player is red, it sets the winner to yellow and status to OVER', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    game.join(yellow);
                    game.startGame(red);
                    game.startGame(yellow);
                    game.leave(red);
                    expect(game.state.winner).toBe(yellow.id);
                    expect(game.state.status).toBe('OVER');
                });
                test('if the player is yellow, it sets the winner to red and status to OVER', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    game.join(yellow);
                    game.startGame(red);
                    game.startGame(yellow);
                    game.leave(yellow);
                    expect(game.state.winner).toBe(red.id);
                    expect(game.state.status).toBe('OVER');
                });
            });
            test('when the game is already over before the player leaves, it does not update the state', () => {
                const red = createPlayerForTesting();
                const yellow = createPlayerForTesting();
                game.join(red);
                game.join(yellow);
                game.startGame(red);
                game.startGame(yellow);
                expect(game.state.yellow).toBe(yellow.id);
                expect(game.state.red).toBe(red.id);
                game.leave(red);
                expect(game.state.status).toBe('OVER');
                const stateBeforeLeaving = { ...game.state };
                game.leave(yellow);
                expect(game.state).toEqual(stateBeforeLeaving);
            });
            describe('when the game is waiting to start, with status WAITING_TO_START', () => {
                test('if the player is red, it sets red to undefined and status to WAITING_FOR_PLAYERS', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    expect(game.state.redReady).toBeFalsy();
                    game.join(yellow);
                    game.startGame(red);
                    expect(game.state.redReady).toBeTruthy();
                    game.leave(red);
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.red).toBeUndefined();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                test('if the player is yellow, it sets yellow to undefined and status to WAITING_FOR_PLAYERS', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    game.join(yellow);
                    expect(game.state.yellowReady).toBeFalsy();
                    game.startGame(yellow);
                    expect(game.state.yellowReady).toBeTruthy();
                    game.leave(yellow);
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.yellow).toBeUndefined();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                test('if the player is red, and the "preferred yellow" player joins, it should add the player as red', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    game.join(yellow);
                    expect(game.state.red).toBe(red.id);
                    expect(game.state.yellow).toBe(yellow.id);
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.yellowReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_TO_START');
                    const secondGame = new ConnectFourGame(game);
                    expect(secondGame.state.red).toBeUndefined();
                    expect(secondGame.state.yellow).toBeUndefined();
                    const newRed = createPlayerForTesting();
                    secondGame.join(newRed);
                    expect(secondGame.state.red).toBe(newRed.id);
                    const newYellow = createPlayerForTesting();
                    secondGame.join(newYellow);
                    expect(secondGame.state.yellow).toBe(newYellow.id);
                    secondGame.leave(newRed);
                    secondGame.join(yellow);
                    expect(secondGame.state.red).toBe(yellow.id);
                    expect(secondGame.state.yellow).toBe(newYellow.id);
                });
            });
            describe('when the game is waiting for players, in state WAITING_FOR_PLAYERS', () => {
                test('if the player is red, it sets red to undefined, redReady to false and status remains WAITING_FOR_PLAYERS', () => {
                    const red = createPlayerForTesting();
                    game.join(red);
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                    game.leave(red);
                    expect(game.state.red).toBeUndefined();
                    expect(game.state.redReady).toBeFalsy();
                    expect(game.state.status).toBe('WAITING_FOR_PLAYERS');
                });
                test('if the player is yellow, it sets yellow to undefined, yellowReady to false and status remains WAITING_FOR_PLAYERS', () => {
                    const red = createPlayerForTesting();
                    const yellow = createPlayerForTesting();
                    game.join(red);
                    game.join(yellow);
                    game.leave(red);
                    const secondGame = new ConnectFourGame(game);
                    secondGame.join(yellow);
                    expect(secondGame.state.yellow).toBe(yellow.id);
                    expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
                    secondGame.leave(yellow);
                    expect(secondGame.state.yellow).toBeUndefined();
                    expect(secondGame.state.yellowReady).toBeFalsy();
                    expect(secondGame.state.status).toBe('WAITING_FOR_PLAYERS');
                });
            });
        });
    });
    describe('applyMove', () => {
        const red = createPlayerForTesting();
        const yellow = createPlayerForTesting();
        beforeEach(() => {
            game.join(red);
            game.join(yellow);
            game.startGame(red);
            game.startGame(yellow);
        });
        describe('[T2.1] Determining who is the first player', () => {
            test('If there is no prior game, the first player is red', () => {
                expect(game.state.firstPlayer).toEqual('Red');
            });
            test('If there is a prior game, and both players join this one, then the first player is the player who was NOT first in the last game', () => {
                expect(game.state.firstPlayer).toEqual('Red');
                const game2 = new ConnectFourGame(game);
                game2.join(red);
                game2.join(yellow);
                game2.startGame(red);
                game2.startGame(yellow);
                expect(game2.state.firstPlayer).toEqual('Yellow');
            });
            test('If there is a prior game, and only one player joins this one, then that player will be first if they were NOT first in the last game', () => {
                expect(game.state.firstPlayer).toEqual('Red');
                const game2 = new ConnectFourGame(game);
                const newPlayer = createPlayerForTesting();
                game2.join(newPlayer);
                game2.join(yellow);
                game2.startGame(newPlayer);
                game2.startGame(yellow);
                expect(game2.state.firstPlayer).toEqual('Yellow');
                const game3 = new ConnectFourGame(game2);
                const newPlayer2 = createPlayerForTesting();
                game3.join(newPlayer2);
                game3.join(yellow);
                game3.startGame(newPlayer2);
                game3.startGame(yellow);
                expect(game3.state.firstPlayer).toEqual('Red');
            });
        });
        describe('[T2.2] when given a valid move', () => {
            it.each([0, 1, 2, 3, 4, 5, 6])('should add the move to the game state in column %d and not end the game', (col) => {
                game.applyMove({
                    gameID: game.id,
                    playerID: red.id,
                    move: { gamePiece: 'Red', col: col, row: 5 },
                });
                expect(game.state.moves[0]).toEqual({
                    gamePiece: 'Red',
                    col: col,
                    row: 5,
                });
                expect(game.state.status).toBe('IN_PROGRESS');
            });
            it.each([0, 1, 2, 3, 4, 5])('should permit stacking the moves in column %d and not end the game if the move does not win', (col) => {
                for (let i = 0; i < 3; i++) {
                    game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: {
                            gamePiece: 'Red',
                            col: col,
                            row: (5 - 2 * i),
                        },
                    });
                    game.applyMove({
                        gameID: game.id,
                        playerID: yellow.id,
                        move: {
                            gamePiece: 'Yellow',
                            col: col,
                            row: (4 - 2 * i),
                        },
                    });
                }
                for (let i = 0; i < 3; i++) {
                    expect(game.state.moves[2 * i]).toEqual({
                        gamePiece: 'Red',
                        col: col,
                        row: (5 - 2 * i),
                    });
                    expect(game.state.moves[2 * i + 1]).toEqual({
                        gamePiece: 'Yellow',
                        col: col,
                        row: (4 - 2 * i),
                    });
                }
                expect(game.state.status).toBe('IN_PROGRESS');
            });
        });
        describe('[T2.3] when given a move that wins the game, it ends the game and declares the winner', () => {
            test('horizontal wins in the first row', () => {
                createMovesFromPattern(game, [[], [], [], [], [], ['Y', 'Y', 'Y', 'R', 'R', 'R', 'R']], red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
                const secondGame = new ConnectFourGame(game);
                secondGame.join(red);
                secondGame.join(yellow);
                secondGame.startGame(red);
                secondGame.startGame(yellow);
                createMovesFromPattern(secondGame, [
                    [],
                    [],
                    [],
                    [],
                    ['R', 'R', 'R', 'Y', 'R', 'R', 'R'],
                    ['Y', 'Y', 'R', 'Y', 'Y', 'Y', 'Y'],
                ], red.id, yellow.id, 'Yellow');
                const thirdGame = new ConnectFourGame(secondGame);
                thirdGame.join(red);
                thirdGame.join(yellow);
                thirdGame.startGame(red);
                thirdGame.startGame(yellow);
                createMovesFromPattern(thirdGame, [[], [], [], [], ['R', 'R', 'R'], ['Y', 'Y', 'Y', 'Y', 'R', 'R', 'R']], red.id, yellow.id, 'Red');
            });
            test('horizontal wins in the top row', () => {
                const pattern = [
                    ['R', 'R', 'R', 'R', 'Y', 'Y', 'Y'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['R', 'Y', 'Y', 'Y', 'R', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
                ];
                createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
            });
            test('horizontal wins right aligned', () => {
                const pattern = [
                    ['Y', 'Y', 'Y', 'R', 'R', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['R', 'Y', 'R', 'Y', 'Y', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                    ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
                    ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
                ];
                createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
            });
            test('vertical wins', () => {
                const pattern = [[], [], ['R'], ['R'], ['R', 'Y'], ['R', 'Y', 'Y', 'Y']];
                createMovesFromPattern(game, pattern, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(red.id);
                const secondGame = new ConnectFourGame(game);
                secondGame.join(red);
                secondGame.join(yellow);
                secondGame.startGame(red);
                secondGame.startGame(yellow);
                const secondPattern = [
                    [],
                    [],
                    ['_', '_', '_', '_', '_', 'Y'],
                    ['_', '_', '_', '_', '_', 'Y'],
                    ['_', '_', '_', '_', '_', 'Y'],
                    ['R', 'R', 'R', 'Y', 'R', 'Y'],
                ];
                createMovesFromPattern(secondGame, secondPattern, red.id, yellow.id, 'Yellow');
                expect(secondGame.state.status).toBe('OVER');
                expect(secondGame.state.winner).toBe(yellow.id);
            });
            test.each([
                {
                    board: [
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', 'Y', 'R', '_', '_', '_'],
                        ['_', '_', 'R', 'R', '_', '_', '_'],
                        ['_', 'R', 'Y', 'Y', '_', '_', '_'],
                        ['R', 'R', 'Y', 'Y', '_', '_', '_'],
                    ],
                    expectedWinner: 'Red',
                },
                {
                    board: [
                        ['_', '_', '_', '_', '_', 'R', 'Y'],
                        ['_', '_', '_', '_', '_', 'Y', 'R'],
                        ['_', '_', '_', '_', 'Y', 'Y', 'R'],
                        ['_', '_', '_', 'Y', 'R', 'Y', 'R'],
                        ['_', '_', '_', 'R', 'Y', 'R', 'Y'],
                        ['_', '_', '_', 'Y', 'R', 'R', 'R'],
                    ],
                    expectedWinner: 'Yellow',
                },
                {
                    board: [
                        ['_', '_', '_', '_', '_', 'R', 'Y'],
                        ['_', '_', '_', '_', '_', 'Y', 'R'],
                        ['_', '_', '_', '_', 'R', 'Y', 'Y'],
                        ['_', '_', '_', 'Y', 'R', 'Y', 'R'],
                        ['_', '_', '_', 'R', 'Y', 'R', 'Y'],
                        ['_', '_', '_', 'Y', 'R', 'R', 'R'],
                    ],
                    expectedWinner: 'Yellow',
                },
                {
                    board: [
                        [],
                        ['Y', 'R', 'Y', 'R', 'Y'],
                        ['Y', 'R', 'R', 'Y', 'Y'],
                        ['R', 'Y', 'Y', 'Y', 'R'],
                        ['R', 'R', 'Y', 'Y', 'R'],
                        ['R', 'Y', 'Y', 'Y', 'R'],
                    ],
                    expectedWinner: 'Yellow',
                },
                {
                    board: [
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', 'Y', '_', '_', '_'],
                        ['_', '_', '_', 'R', 'Y', '_', '_'],
                        ['_', '_', '_', 'R', 'R', 'Y', '_'],
                        ['_', '_', '_', 'Y', 'R', 'R', 'Y'],
                    ],
                    expectedWinner: 'Yellow',
                },
            ])('diagonal wins', ({ board, expectedWinner }) => {
                createMovesFromPattern(game, board, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('OVER');
                expect(game.state.winner).toBe(expectedWinner === 'Red' ? red.id : yellow.id);
            });
        });
        describe('[T2.3] when given a move that does not win the game, it does not end it', () => {
            test('Near-win horizontally', () => {
                createMovesFromPattern(game, [
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', 'Y', 'Y', 'Y', '_', '_', '_'],
                    ['_', 'R', 'R', 'R', '_', '_', '_'],
                ], red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
            test('Near-win vertically', () => {
                createMovesFromPattern(game, [
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['_', '_', '_', '_', '_', '_', '_'],
                    ['R', 'Y', '_', '_', '_', '_', '_'],
                    ['R', 'Y', '_', '_', '_', '_', '_'],
                    ['R', 'Y', '_', '_', '_', '_', '_'],
                ], red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
            test.each([
                {
                    board: [
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_', '_'],
                        ['_', '_', 'R', 'Y', '_', '_', '_'],
                        ['Y', 'R', 'R', 'Y', '_', '_', '_'],
                        ['R', 'Y', 'R', 'Y', '_', '_', '_'],
                    ],
                    expectedWinner: undefined,
                },
                {
                    board: [
                        ['R', 'Y', '_', '_', '_', '_', '_'],
                        ['Y', 'R', '_', '_', '_', '_', '_'],
                        ['Y', 'R', 'Y', 'R', '_', '_', '_'],
                        ['R', 'Y', 'Y', 'R', '_', '_', '_'],
                        ['Y', 'R', 'R', 'Y', '_', '_', '_'],
                        ['R', 'Y', 'R', 'R', 'Y', '_', '_'],
                    ],
                    expectedWinner: undefined,
                },
            ])('Near-win diagonally', ({ board }) => {
                createMovesFromPattern(game, board, red.id, yellow.id, 'Red');
                expect(game.state.status).toBe('IN_PROGRESS');
                expect(game.state.winner).toBeUndefined();
            });
        });
        it('[T2.3] should declare a tie if the board is full and no one has won', () => {
            createMovesFromPattern(game, [
                ['Y', 'R', 'R', 'R', 'Y', 'R', 'Y'],
                ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                ['R', 'Y', 'Y', 'Y', 'R', 'R', 'R'],
                ['Y', 'R', 'Y', 'Y', 'R', 'Y', 'Y'],
                ['Y', 'R', 'R', 'R', 'Y', 'R', 'R'],
                ['Y', 'R', 'Y', 'Y', 'R', 'R', 'R'],
            ], red.id, yellow.id, 'Red');
            expect(game.state.status).toBe('OVER');
            expect(game.state.winner).toBeUndefined();
        });
    });
    describe('[T2.4] when given an invalid move request', () => {
        it('throws an error if the game is not in progress', () => {
            const player = createPlayerForTesting();
            game.join(player);
            expect(() => game.applyMove({
                gameID: game.id,
                playerID: player.id,
                move: { gamePiece: 'Red', col: 0, row: 0 },
            })).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
        describe('when the game is in progress', () => {
            const red = createPlayerForTesting();
            const yellow = createPlayerForTesting();
            beforeEach(() => {
                game.join(red);
                game.join(yellow);
                game.startGame(red);
                game.startGame(yellow);
            });
            it('should throw an error if the player is not in the game', () => {
                const otherPlayer = createPlayerForTesting();
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: otherPlayer.id,
                    move: { gamePiece: 'Red', col: 0, row: 5 },
                })).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            });
            describe('when the player is in the game', () => {
                it('should throw an error if the player is not the active player', () => {
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: yellow.id,
                        move: { gamePiece: 'Yellow', col: 0, row: 5 },
                    })).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                    const secondGame = new ConnectFourGame(game);
                    secondGame.join(red);
                    secondGame.join(yellow);
                    secondGame.startGame(yellow);
                    secondGame.startGame(red);
                    expect(() => secondGame.applyMove({
                        gameID: secondGame.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 5 },
                    })).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                });
                it('should throw an error if the cell is not at the bottom of the column', () => {
                    createMovesFromPattern(game, [
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['_', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['R', 'Y', '_', '_', '_', '_'],
                    ], red.id, yellow.id, 'Red');
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 1 },
                    })).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
                });
                it('should throw an error if the cell is full', () => {
                    createMovesFromPattern(game, [
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                    ], red.id, yellow.id, 'Red');
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 0 },
                    })).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
                });
                it('should not change the game state', () => {
                    createMovesFromPattern(game, [
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                        ['Y', '_', '_', '_', '_', '_'],
                        ['R', '_', '_', '_', '_', '_'],
                    ], red.id, yellow.id, 'Red');
                    expect(game.state.moves.length).toBe(6);
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 0, row: 0 },
                    })).toThrowError(BOARD_POSITION_NOT_VALID_MESSAGE);
                    expect(game.state.moves.length).toBe(6);
                    game.applyMove({
                        gameID: game.id,
                        playerID: red.id,
                        move: { gamePiece: 'Red', col: 1, row: 5 },
                    });
                    expect(game.state.moves.length).toBe(7);
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdEZvdXJHYW1lLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdG93bi9nYW1lcy9Db25uZWN0Rm91ckdhbWUudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ2xDLE9BQU8sRUFDTCxnQ0FBZ0MsRUFDaEMsaUJBQWlCLEVBQ2pCLDRCQUE0QixFQUM1QiwwQkFBMEIsRUFDMUIsMEJBQTBCLEVBQzFCLDhCQUE4QixFQUM5QiwwQkFBMEIsR0FDM0IsTUFBTSxrQ0FBa0MsQ0FBQztBQUMxQyxPQUFPLEVBQUUsc0JBQXNCLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQU16RCxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQU9oRCxNQUFNLE1BQU0sR0FBRyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztBQW9CM0QsU0FBUyxzQkFBc0IsQ0FDN0IsSUFBcUIsRUFDckIsT0FBbUIsRUFDbkIsS0FBYSxFQUNiLFFBQWdCLEVBQ2hCLFVBQTRCO0lBRzVCLE1BQU0sTUFBTSxHQUFHO1FBQ2IsTUFBTSxFQUFFLEVBQWtCO1FBQzFCLEdBQUcsRUFBRSxFQUFrQjtLQUN4QixDQUFDO0lBR0YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsRUFBRTtRQUM5QixHQUFHLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxFQUFFO1lBQzFCLElBQUksR0FBRyxLQUFLLEdBQUcsRUFBRTtnQkFDZixNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDakIsTUFBTSxFQUFFLE1BQTZCO29CQUNyQyxNQUFNLEVBQUUsTUFBNkI7aUJBQ3RDLENBQUMsQ0FBQzthQUNKO2lCQUFNLElBQUksR0FBRyxLQUFLLEdBQUcsRUFB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