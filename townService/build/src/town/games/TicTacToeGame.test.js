import { createPlayerForTesting } from '../../TestUtils';
import { GAME_FULL_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, BOARD_POSITION_NOT_EMPTY_MESSAGE, MOVE_NOT_YOUR_TURN_MESSAGE, PLAYER_ALREADY_IN_GAME_MESSAGE, PLAYER_NOT_IN_GAME_MESSAGE, } from '../../lib/InvalidParametersError';
import TicTacToeGame from './TicTacToeGame';
describe('TicTacToeGame', () => {
    let game;
    beforeEach(() => {
        game = new TicTacToeGame();
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
        it('should throw an error if the game is full', () => {
            const player1 = createPlayerForTesting();
            const player2 = createPlayerForTesting();
            const player3 = createPlayerForTesting();
            game.join(player1);
            game.join(player2);
            expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
        });
        describe('When the player can be added', () => {
            it('makes the first player X and initializes the state with status WAITING_TO_START', () => {
                const player = createPlayerForTesting();
                game.join(player);
                expect(game.state.x).toEqual(player.id);
                expect(game.state.o).toBeUndefined();
                expect(game.state.moves).toHaveLength(0);
                expect(game.state.status).toEqual('WAITING_TO_START');
                expect(game.state.winner).toBeUndefined();
            });
            describe('When the second player joins', () => {
                const player1 = createPlayerForTesting();
                const player2 = createPlayerForTesting();
                beforeEach(() => {
                    game.join(player1);
                    game.join(player2);
                });
                it('makes the second player O', () => {
                    expect(game.state.x).toEqual(player1.id);
                    expect(game.state.o).toEqual(player2.id);
                });
                it('sets the game status to IN_PROGRESS', () => {
                    expect(game.state.status).toEqual('IN_PROGRESS');
                    expect(game.state.winner).toBeUndefined();
                    expect(game.state.moves).toHaveLength(0);
                });
            });
        });
    });
    describe('[T1.2] _leave', () => {
        it('should throw an error if the player is not in the game', () => {
            expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
            const player = createPlayerForTesting();
            game.join(player);
            expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
        });
        describe('when the player is in the game', () => {
            describe('when the game is in progress, it should set the game status to OVER and declare the other player the winner', () => {
                test('when x leaves', () => {
                    const player1 = createPlayerForTesting();
                    const player2 = createPlayerForTesting();
                    game.join(player1);
                    game.join(player2);
                    expect(game.state.x).toEqual(player1.id);
                    expect(game.state.o).toEqual(player2.id);
                    game.leave(player1);
                    expect(game.state.status).toEqual('OVER');
                    expect(game.state.winner).toEqual(player2.id);
                    expect(game.state.moves).toHaveLength(0);
                    expect(game.state.x).toEqual(player1.id);
                    expect(game.state.o).toEqual(player2.id);
                });
                test('when o leaves', () => {
                    const player1 = createPlayerForTesting();
                    const player2 = createPlayerForTesting();
                    game.join(player1);
                    game.join(player2);
                    expect(game.state.x).toEqual(player1.id);
                    expect(game.state.o).toEqual(player2.id);
                    game.leave(player2);
                    expect(game.state.status).toEqual('OVER');
                    expect(game.state.winner).toEqual(player1.id);
                    expect(game.state.moves).toHaveLength(0);
                    expect(game.state.x).toEqual(player1.id);
                    expect(game.state.o).toEqual(player2.id);
                });
            });
            it('when the game is not in progress, it should set the game status to WAITING_TO_START and remove the player', () => {
                const player1 = createPlayerForTesting();
                game.join(player1);
                expect(game.state.x).toEqual(player1.id);
                expect(game.state.o).toBeUndefined();
                expect(game.state.status).toEqual('WAITING_TO_START');
                expect(game.state.winner).toBeUndefined();
                game.leave(player1);
                expect(game.state.x).toBeUndefined();
                expect(game.state.o).toBeUndefined();
                expect(game.state.status).toEqual('WAITING_TO_START');
                expect(game.state.winner).toBeUndefined();
            });
        });
    });
    describe('applyMove', () => {
        let moves = [];
        describe('[T2.2] when given an invalid move', () => {
            it('should throw an error if the game is not in progress', () => {
                const player1 = createPlayerForTesting();
                game.join(player1);
                expect(() => game.applyMove({
                    gameID: game.id,
                    playerID: player1.id,
                    move: {
                        row: 0,
                        col: 0,
                        gamePiece: 'X',
                    },
                })).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
            });
            describe('when the game is in progress', () => {
                let player1;
                let player2;
                beforeEach(() => {
                    player1 = createPlayerForTesting();
                    player2 = createPlayerForTesting();
                    game.join(player1);
                    game.join(player2);
                    expect(game.state.status).toEqual('IN_PROGRESS');
                });
                it('should rely on the player ID to determine whose turn it is', () => {
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: player2.id,
                        move: {
                            row: 0,
                            col: 0,
                            gamePiece: 'X',
                        },
                    })).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            row: 0,
                            col: 0,
                            gamePiece: 'O',
                        },
                    })).not.toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                });
                it('should throw an error if the move is out of turn for the player ID', () => {
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: player2.id,
                        move: {
                            row: 0,
                            col: 0,
                            gamePiece: 'X',
                        },
                    })).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                    game.applyMove({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            row: 0,
                            col: 0,
                            gamePiece: 'X',
                        },
                    });
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            row: 0,
                            col: 1,
                            gamePiece: 'X',
                        },
                    })).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                    game.applyMove({
                        gameID: game.id,
                        playerID: player2.id,
                        move: {
                            row: 0,
                            col: 2,
                            gamePiece: 'O',
                        },
                    });
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: player2.id,
                        move: {
                            row: 2,
                            col: 1,
                            gamePiece: 'O',
                        },
                    })).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                });
                it('should throw an error if the move is on an occupied space', () => {
                    const row = 0;
                    const col = 0;
                    game.applyMove({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            row,
                            col,
                            gamePiece: 'X',
                        },
                    });
                    expect(() => game.applyMove({
                        gameID: game.id,
                        playerID: player2.id,
                        move: {
                            row,
                            col,
                            gamePiece: 'O',
                        },
                    })).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
                });
                it('should not change whose turn it is when an invalid move is made', () => {
                    game.applyMove({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            row: 1,
                            col: 1,
                            gamePiece: 'X',
                        },
                    });
                    expect(() => {
                        game.applyMove({
                            gameID: game.id,
                            playerID: player2.id,
                            move: {
                                row: 1,
                                col: 1,
                                gamePiece: 'O',
                            },
                        });
                    }).toThrowError(BOARD_POSITION_NOT_EMPTY_MESSAGE);
                    expect(game.state.moves).toHaveLength(1);
                    game.applyMove({
                        gameID: game.id,
                        playerID: player2.id,
                        move: {
                            row: 1,
                            col: 2,
                            gamePiece: 'O',
                        },
                    });
                    expect(game.state.moves).toHaveLength(2);
                });
                it('should not prevent the reuse of a space after an invalid move on it', () => {
                    expect(() => {
                        game.applyMove({
                            gameID: game.id,
                            playerID: player2.id,
                            move: {
                                row: 1,
                                col: 1,
                                gamePiece: 'O',
                            },
                        });
                    }).toThrowError(MOVE_NOT_YOUR_TURN_MESSAGE);
                    game.applyMove({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            row: 1,
                            col: 1,
                            gamePiece: 'X',
                        },
                    });
                });
            });
        });
        describe('when given a valid move', () => {
            let player1;
            let player2;
            let numMoves = 0;
            beforeEach(() => {
                player1 = createPlayerForTesting();
                player2 = createPlayerForTesting();
                numMoves = 0;
                moves = [];
                game.join(player1);
                game.join(player2);
                expect(game.state.status).toEqual('IN_PROGRESS');
            });
            function makeMoveAndCheckState(row, col, gamePiece, expectedOutcome = undefined) {
                game.applyMove({
                    gameID: game.id,
                    playerID: gamePiece === 'X' ? player1.id : player2.id,
                    move: {
                        row,
                        col,
                        gamePiece,
                    },
                });
                moves.push({ row, col, gamePiece });
                expect(game.state.moves).toHaveLength(++numMoves);
                for (let i = 0; i < numMoves; i++) {
                    expect(game.state.moves[i]).toEqual(moves[i]);
                }
                if (expectedOutcome === 'WIN') {
                    expect(game.state.status).toEqual('OVER');
                    expect(game.state.winner).toEqual(gamePiece === 'X' ? player1.id : player2.id);
                }
                else if (expectedOutcome === 'TIE') {
                    expect(game.state.status).toEqual('OVER');
                    expect(game.state.winner).toBeUndefined();
                }
                else {
                    expect(game.state.status).toEqual('IN_PROGRESS');
                    expect(game.state.winner).toBeUndefined();
                }
            }
            it('[T2.1] should add the move to the game state', () => {
                makeMoveAndCheckState(1, 2, 'X');
            });
            it('[T2.1] should not end the game if the move does not end the game', () => {
                makeMoveAndCheckState(1, 2, 'X');
                makeMoveAndCheckState(1, 0, 'O');
                makeMoveAndCheckState(0, 2, 'X');
                makeMoveAndCheckState(2, 2, 'O');
                makeMoveAndCheckState(1, 1, 'X');
                makeMoveAndCheckState(2, 0, 'O');
            });
            describe('[T2.3] when the move ends the game', () => {
                describe('it checks for winning conditions', () => {
                    describe('a horizontal win', () => {
                        test('x wins', () => {
                            makeMoveAndCheckState(0, 0, 'X');
                            makeMoveAndCheckState(1, 0, 'O');
                            makeMoveAndCheckState(0, 1, 'X');
                            makeMoveAndCheckState(1, 1, 'O');
                            makeMoveAndCheckState(0, 2, 'X', 'WIN');
                        });
                        test('o wins', () => {
                            makeMoveAndCheckState(0, 0, 'X');
                            makeMoveAndCheckState(1, 0, 'O');
                            makeMoveAndCheckState(0, 1, 'X');
                            makeMoveAndCheckState(1, 1, 'O');
                            makeMoveAndCheckState(2, 0, 'X');
                            makeMoveAndCheckState(1, 2, 'O', 'WIN');
                        });
                    });
                    describe('a vertical win', () => {
                        test('x wins', () => {
                            makeMoveAndCheckState(0, 0, 'X');
                            makeMoveAndCheckState(0, 1, 'O');
                            makeMoveAndCheckState(1, 0, 'X');
                            makeMoveAndCheckState(1, 1, 'O');
                            makeMoveAndCheckState(2, 0, 'X', 'WIN');
                        });
                        test('o wins', () => {
                            makeMoveAndCheckState(0, 0, 'X');
                            makeMoveAndCheckState(0, 1, 'O');
                            makeMoveAndCheckState(1, 0, 'X');
                            makeMoveAndCheckState(1, 1, 'O');
                            makeMoveAndCheckState(2, 2, 'X');
                            makeMoveAndCheckState(2, 1, 'O', 'WIN');
                        });
                    });
                    describe('a diagonal win', () => {
                        test('x wins', () => {
                            makeMoveAndCheckState(0, 0, 'X');
                            makeMoveAndCheckState(0, 1, 'O');
                            makeMoveAndCheckState(1, 1, 'X');
                            makeMoveAndCheckState(1, 2, 'O');
                            makeMoveAndCheckState(2, 2, 'X', 'WIN');
                        });
                        test('o wins', () => {
                            makeMoveAndCheckState(0, 1, 'X');
                            makeMoveAndCheckState(0, 0, 'O');
                            makeMoveAndCheckState(1, 0, 'X');
                            makeMoveAndCheckState(1, 1, 'O');
                            makeMoveAndCheckState(2, 0, 'X');
                            makeMoveAndCheckState(2, 2, 'O', 'WIN');
                        });
                        test('other diagonal - x wins', () => {
                            makeMoveAndCheckState(0, 2, 'X');
                            makeMoveAndCheckState(0, 1, 'O');
                            makeMoveAndCheckState(1, 1, 'X');
                            makeMoveAndCheckState(1, 2, 'O');
                            makeMoveAndCheckState(2, 0, 'X', 'WIN');
                        });
                        test('other diagonal - o wins', () => {
                            makeMoveAndCheckState(0, 1, 'X');
                            makeMoveAndCheckState(0, 2, 'O');
                            makeMoveAndCheckState(1, 0, 'X');
                            makeMoveAndCheckState(1, 1, 'O');
                            makeMoveAndCheckState(2, 1, 'X');
                            makeMoveAndCheckState(2, 0, 'O', 'WIN');
                        });
                    });
                });
                it('declares a tie if there are no winning conditions but the board is full', () => {
                    makeMoveAndCheckState(0, 0, 'X');
                    makeMoveAndCheckState(0, 1, 'O');
                    makeMoveAndCheckState(0, 2, 'X');
                    makeMoveAndCheckState(2, 0, 'O');
                    makeMoveAndCheckState(1, 1, 'X');
                    makeMoveAndCheckState(1, 2, 'O');
                    makeMoveAndCheckState(1, 0, 'X');
                    makeMoveAndCheckState(2, 2, 'O');
                    makeMoveAndCheckState(2, 1, 'X', 'TIE');
                });
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGljVGFjVG9lR2FtZS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvVGljVGFjVG9lR2FtZS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ3pELE9BQU8sRUFDTCxpQkFBaUIsRUFDakIsNEJBQTRCLEVBQzVCLGdDQUFnQyxFQUNoQywwQkFBMEIsRUFDMUIsOEJBQThCLEVBQzlCLDBCQUEwQixHQUMzQixNQUFNLGtDQUFrQyxDQUFDO0FBQzFDLE9BQU8sYUFBYSxNQUFNLGlCQUFpQixDQUFDO0FBSTVDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO0lBQzdCLElBQUksSUFBbUIsQ0FBQztJQUV4QixVQUFVLENBQUMsR0FBRyxFQUFFO1FBQ2QsSUFBSSxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7SUFDN0IsQ0FBQyxDQUFDLENBQUM7SUFFSCxRQUFRLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRTtRQUM1QixFQUFFLENBQUMsNERBQTRELEVBQUUsR0FBRyxFQUFFO1lBQ3BFLE1BQU0sTUFBTSxHQUFHLHNCQUFzQixFQUFFLENBQUM7WUFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1lBQzdFLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7WUFFekMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNuQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFlBQVksQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLEdBQUcsRUFBRTtZQUNuRCxNQUFNLE9BQU8sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO1lBQ3pDLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7WUFDekMsTUFBTSxPQUFPLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztZQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFFbkIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQztRQUNuRSxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7WUFDNUMsRUFBRSxDQUFDLGlGQUFpRixFQUFFLEdBQUcsRUFBRTtnQkFDekYsTUFBTSxNQUFNLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztnQkFDeEMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDbEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDeEMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLGtCQUFrQixDQUFDLENBQUM7Z0JBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO1lBQzVDLENBQUMsQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLDhCQUE4QixFQUFFLEdBQUcsRUFBRTtnQkFDNUMsTUFBTSxPQUFPLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekMsTUFBTSxPQUFPLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekMsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDZCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQixDQUFDLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMsMkJBQTJCLEVBQUUsR0FBRyxFQUFFO29CQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMscUNBQXFDLEVBQUUsR0FBRyxFQUFFO29CQUM3QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO29CQUMxQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFDN0IsRUFBRSxDQUFDLHdEQUF3RCxFQUFFLEdBQUcsRUFBRTtZQUNoRSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsRUFBRSxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsMEJBQTBCLENBQUMsQ0FBQztZQUU1RixNQUFNLE1BQU0sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO1lBQ3hDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsc0JBQXNCLEVBQUUsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUM7UUFDOUYsQ0FBQyxDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMsZ0NBQWdDLEVBQUUsR0FBRyxFQUFFO1lBQzlDLFFBQVEsQ0FBQyw2R0FBNkcsRUFBRSxHQUFHLEVBQUU7Z0JBQzNILElBQUksQ0FBQyxlQUFlLEVBQUUsR0FBRyxFQUFFO29CQUN6QixNQUFNLE9BQU8sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO29CQUN6QyxNQUFNLE9BQU8sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO29CQUN6QyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUNuQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUV6QyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUVwQixNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFekMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsSUFBSSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7b0JBQ3pCLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7b0JBQ3pDLE1BQU0sT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7b0JBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBRXpDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBRXBCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUV6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN6QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUMzQyxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLDJHQUEyRyxFQUFFLEdBQUcsRUFBRTtnQkFDbkgsTUFBTSxPQUFPLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztnQkFDekMsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztnQkFDekMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO2dCQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztnQkFDMUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO2dCQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDNUMsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLFdBQVcsRUFBRSxHQUFHLEVBQUU7UUFDekIsSUFBSSxLQUFLLEdBQW9CLEVBQUUsQ0FBQztRQUVoQyxRQUFRLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO1lBQ2pELEVBQUUsQ0FBQyxzREFBc0QsRUFBRSxHQUFHLEVBQUU7Z0JBQzlELE1BQU0sT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7Z0JBQ3pDLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FDVixJQUFJLENBQUMsU0FBUyxDQUFDO29CQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTtvQkFDZixRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7b0JBQ3BCLElBQUksRUFBRTt3QkFDSixHQUFHLEVBQUUsQ0FBQzt3QkFDTixHQUFHLEVBQUUsQ0FBQzt3QkFDTixTQUFTLEVBQUUsR0FBRztxQkFDZjtpQkFDRixDQUFDLENBQ0gsQ0FBQyxZQUFZLENBQUMsNEJBQTRCLENBQUMsQ0FBQztZQUMvQyxDQUFDLENBQUMsQ0FBQztZQUNILFFBQVEsQ0FBQyw4QkFBOEIsRUFBRSxHQUFHLEVBQUU7Z0JBQzVDLElBQUksT0FBZSxDQUFDO2dCQUNwQixJQUFJLE9BQWUsQ0FBQztnQkFDcEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDZCxPQUFPLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztvQkFDbkMsT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7b0JBQ25DLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztnQkFDbkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLDREQUE0RCxFQUFFLEdBQUcsRUFBRTtvQkFDcEUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUNWLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNmLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDcEIsSUFBSSxFQUFFOzRCQUNKLEdBQUcsRUFBRSxDQUFDOzRCQUNOLEdBQUcsRUFBRSxDQUFDOzRCQUNOLFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FDSCxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO29CQUMzQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxFQUFFLENBQUM7NEJBQ04sR0FBRyxFQUFFLENBQUM7NEJBQ04sU0FBUyxFQUFFLEdBQUc7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUNILENBQUMsR0FBRyxDQUFDLFlBQVksQ0FBQywwQkFBMEIsQ0FBQyxDQUFDO2dCQUNqRCxDQUFDLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMsb0VBQW9FLEVBQUUsR0FBRyxFQUFFO29CQUM1RSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxFQUFFLENBQUM7NEJBQ04sR0FBRyxFQUFFLENBQUM7NEJBQ04sU0FBUyxFQUFFLEdBQUc7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUNILENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzNDLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNmLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDcEIsSUFBSSxFQUFFOzRCQUNKLEdBQUcsRUFBRSxDQUFDOzRCQUNOLEdBQUcsRUFBRSxDQUFDOzRCQUNOLFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxFQUFFLENBQUM7NEJBQ04sR0FBRyxFQUFFLENBQUM7NEJBQ04sU0FBUyxFQUFFLEdBQUc7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUNILENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBRTNDLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNmLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDcEIsSUFBSSxFQUFFOzRCQUNKLEdBQUcsRUFBRSxDQUFDOzRCQUNOLEdBQUcsRUFBRSxDQUFDOzRCQUNOLFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxFQUFFLENBQUM7NEJBQ04sR0FBRyxFQUFFLENBQUM7NEJBQ04sU0FBUyxFQUFFLEdBQUc7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUNILENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUM7Z0JBQzdDLENBQUMsQ0FBQyxDQUFDO2dCQUNILEVBQUUsQ0FBQywyREFBMkQsRUFBRSxHQUFHLEVBQUU7b0JBQ25FLE1BQU0sR0FBRyxHQUFHLENBQUMsQ0FBQztvQkFDZCxNQUFNLEdBQUcsR0FBRyxDQUFDLENBQUM7b0JBQ2QsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRzs0QkFDSCxHQUFHOzRCQUNILFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRzs0QkFDSCxHQUFHOzRCQUNILFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FDSCxDQUFDLFlBQVksQ0FBQyxnQ0FBZ0MsQ0FBQyxDQUFDO2dCQUNuRCxDQUFDLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMsaUVBQWlFLEVBQUUsR0FBRyxFQUFFO29CQUN6RSxJQUFJLENBQUMsU0FBUyxDQUFDO3dCQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTt3QkFDZixRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7d0JBQ3BCLElBQUksRUFBRTs0QkFDSixHQUFHLEVBQUUsQ0FBQzs0QkFDTixHQUFHLEVBQUUsQ0FBQzs0QkFDTixTQUFTLEVBQUUsR0FBRzt5QkFDZjtxQkFDRixDQUFDLENBQUM7b0JBQ0gsTUFBTSxDQUFDLEdBQUcsRUFBRTt3QkFDVixJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFDZixRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7NEJBQ3BCLElBQUksRUFBRTtnQ0FDSixHQUFHLEVBQUUsQ0FBQztnQ0FDTixHQUFHLEVBQUUsQ0FBQztnQ0FDTixTQUFTLEVBQUUsR0FBRzs2QkFDZjt5QkFDRixDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7b0JBQ2xELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekMsSUFBSSxDQUFDLFNBQVMsQ0FBQzt3QkFDYixNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxFQUFFLENBQUM7NEJBQ04sR0FBRyxFQUFFLENBQUM7NEJBQ04sU0FBUyxFQUFFLEdBQUc7eUJBQ2Y7cUJBQ0YsQ0FBQyxDQUFDO29CQUNILE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDM0MsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLHFFQUFxRSxFQUFFLEdBQUcsRUFBRTtvQkFDN0UsTUFBTSxDQUFDLEdBQUcsRUFBRTt3QkFDVixJQUFJLENBQUMsU0FBUyxDQUFDOzRCQUNiLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRTs0QkFDZixRQUFRLEVBQUUsT0FBTyxDQUFDLEVBQUU7NEJBQ3BCLElBQUksRUFBRTtnQ0FDSixHQUFHLEVBQUUsQ0FBQztnQ0FDTixHQUFHLEVBQUUsQ0FBQztnQ0FDTixTQUFTLEVBQUUsR0FBRzs2QkFDZjt5QkFDRixDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUFDLDBCQUEwQixDQUFDLENBQUM7b0JBQzVDLElBQUksQ0FBQyxTQUFTLENBQUM7d0JBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO3dCQUNmLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRTt3QkFDcEIsSUFBSSxFQUFFOzRCQUNKLEdBQUcsRUFBRSxDQUFDOzRCQUNOLEdBQUcsRUFBRSxDQUFDOzRCQUNOLFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FBQztnQkFDTCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxRQUFRLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFO1lBQ3ZDLElBQUksT0FBZSxDQUFDO1lBQ3BCLElBQUksT0FBZSxDQUFDO1lBQ3BCLElBQUksUUFBUSxHQUFHLENBQUMsQ0FBQztZQUNqQixVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNkLE9BQU8sR0FBRyxzQkFBc0IsRUFBRSxDQUFDO2dCQUNuQyxPQUFPLEdBQUcsc0JBQXNCLEVBQUUsQ0FBQztnQkFDbkMsUUFBUSxHQUFHLENBQUMsQ0FBQztnQkFDYixLQUFLLEdBQUcsRUFBRSxDQUFDO2dCQUNYLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25CLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ25CLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNuRCxDQUFDLENBQUMsQ0FBQztZQUNILFNBQVMscUJBQXFCLENBQzVCLEdBQWMsRUFDZCxHQUFjLEVBQ2QsU0FBb0IsRUFDcEIsa0JBQTZDLFNBQVM7Z0JBRXRELElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ2IsTUFBTSxFQUFFLElBQUksQ0FBQyxFQUFFO29CQUNmLFFBQVEsRUFBRSxTQUFTLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRTtvQkFDckQsSUFBSSxFQUFFO3dCQUNKLEdBQUc7d0JBQ0gsR0FBRzt3QkFDSCxTQUFTO3FCQUNWO2lCQUNGLENBQUMsQ0FBQztnQkFDSCxLQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO2dCQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDbEQsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsRUFBRSxDQUFDLEVBQUUsRUFBRTtvQkFDakMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2lCQUMvQztnQkFDRCxJQUFJLGVBQWUsS0FBSyxLQUFLLEVBQUU7b0JBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsQ0FBQztpQkFDaEY7cUJBQU0sSUFBSSxlQUFlLEtBQUssS0FBSyxFQUFFO29CQUNwQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUM7b0JBQzFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO2lCQUMzQztxQkFBTTtvQkFDTCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7b0JBQ2pELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLGFBQWEsRUFBRSxDQUFDO2lCQUMzQztZQUNILENBQUM7WUFDRCxFQUFFLENBQUMsOENBQThDLEVBQUUsR0FBRyxFQUFFO2dCQUN0RCxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsRUFBRSxDQUFDLGtFQUFrRSxFQUFFLEdBQUcsRUFBRTtnQkFDMUUscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztZQUNILFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSxHQUFHLEVBQUU7Z0JBQ2xELFFBQVEsQ0FBQyxrQ0FBa0MsRUFBRSxHQUFHLEVBQUU7b0JBQ2hELFFBQVEsQ0FBQyxrQkFBa0IsRUFBRSxHQUFHLEVBQUU7d0JBQ2hDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUNsQixxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQyxDQUFDLENBQUM7d0JBQ0gsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7NEJBQ2xCLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUMxQyxDQUFDLENBQUMsQ0FBQztvQkFDTCxDQUFDLENBQUMsQ0FBQztvQkFDSCxRQUFRLENBQUMsZ0JBQWdCLEVBQUUsR0FBRyxFQUFFO3dCQUM5QixJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTs0QkFDbEIscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzFDLENBQUMsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFOzRCQUNsQixxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsUUFBUSxDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRTt3QkFDOUIsSUFBSSxDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUU7NEJBQ2xCLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUMxQyxDQUFDLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRTs0QkFDbEIscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs0QkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7d0JBQzFDLENBQUMsQ0FBQyxDQUFDO3dCQUNILElBQUksQ0FBQyx5QkFBeUIsRUFBRSxHQUFHLEVBQUU7NEJBQ25DLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7NEJBQ2pDLHFCQUFxQixDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO3dCQUMxQyxDQUFDLENBQUMsQ0FBQzt3QkFDSCxJQUFJLENBQUMseUJBQXlCLEVBQUUsR0FBRyxFQUFFOzRCQUNuQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDOzRCQUNqQyxxQkFBcUIsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQyxDQUFDLENBQUM7b0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLHlFQUF5RSxFQUFFLEdBQUcsRUFBRTtvQkFDakYscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztvQkFDakMscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLENBQUM7Z0JBQzFDLENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMifQ==