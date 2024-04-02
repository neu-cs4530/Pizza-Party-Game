import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { createPlayerForTesting } from '../../TestUtils';
import { GAME_ID_MISSMATCH_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, INVALID_COMMAND_MESSAGE, } from '../../lib/InvalidParametersError';
import TicTacToeGameArea from './TicTacToeGameArea';
import * as TicTacToeGameModule from './TicTacToeGame';
import Game from './Game';
class TestingGame extends Game {
    constructor() {
        super({
            moves: [],
            status: 'WAITING_TO_START',
        });
    }
    applyMove() { }
    endGame(winner) {
        this.state = {
            ...this.state,
            status: 'OVER',
            winner,
        };
    }
    _join(player) {
        if (this.state.x) {
            this.state.o = player.id;
        }
        else {
            this.state.x = player.id;
        }
        this._players.push(player);
    }
    _leave() { }
}
describe('TicTacToeGameArea', () => {
    let gameArea;
    let player1;
    let player2;
    let interactableUpdateSpy;
    let game;
    beforeEach(() => {
        const gameConstructorSpy = jest.spyOn(TicTacToeGameModule, 'default');
        game = new TestingGame();
        gameConstructorSpy.mockReturnValue(game);
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        gameArea = new TicTacToeGameArea(nanoid(), { x: 0, y: 0, width: 100, height: 100 }, mock());
        gameArea.add(player1);
        gameArea.add(player2);
        interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
    });
    describe('handleCommand', () => {
        describe('[T3.1] when given a JoinGame command', () => {
            describe('when there is no game in progress', () => {
                it('should create a new game and call _emitAreaChanged', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    expect(gameID).toBeDefined();
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    expect(gameID).toEqual(game.id);
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
            });
            describe('when there is a game in progress', () => {
                it('should dispatch the join command to the game and call _emitAreaChanged', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    const joinSpy = jest.spyOn(game, 'join');
                    const gameID2 = gameArea.handleCommand({ type: 'JoinGame' }, player2).gameID;
                    expect(joinSpy).toHaveBeenCalledWith(player2);
                    expect(gameID).toEqual(gameID2);
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
                });
                it('should not call _emitAreaChanged if the game throws an error', () => {
                    gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    interactableUpdateSpy.mockClear();
                    const joinSpy = jest.spyOn(game, 'join').mockImplementationOnce(() => {
                        throw new Error('Test Error');
                    });
                    expect(() => gameArea.handleCommand({ type: 'JoinGame' }, player2)).toThrowError('Test Error');
                    expect(joinSpy).toHaveBeenCalledWith(player2);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
            });
        });
        describe('[T3.2] when given a GameMove command', () => {
            it('should throw an error when there is no game in progress', () => {
                expect(() => gameArea.handleCommand({ type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() }, player1)).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
            });
            describe('when there is a game in progress', () => {
                let gameID;
                beforeEach(() => {
                    gameID = gameArea.handleCommand({ type: 'JoinGame' }, player1).gameID;
                    gameArea.handleCommand({ type: 'JoinGame' }, player2);
                    interactableUpdateSpy.mockClear();
                });
                it('should throw an error when the game ID does not match', () => {
                    expect(() => gameArea.handleCommand({ type: 'GameMove', move: { col: 0, row: 0, gamePiece: 'X' }, gameID: nanoid() }, player1)).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
                });
                it('should dispatch the move to the game and call _emitAreaChanged', () => {
                    const move = { col: 0, row: 0, gamePiece: 'X' };
                    const applyMoveSpy = jest.spyOn(game, 'applyMove');
                    gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
                    expect(applyMoveSpy).toHaveBeenCalledWith({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            ...move,
                            gamePiece: 'X',
                        },
                    });
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
                it('should not call _emitAreaChanged if the game throws an error', () => {
                    const move = { col: 0, row: 0, gamePiece: 'X' };
                    const applyMoveSpy = jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                        throw new Error('Test Error');
                    });
                    expect(() => gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1)).toThrowError('Test Error');
                    expect(applyMoveSpy).toHaveBeenCalledWith({
                        gameID: game.id,
                        playerID: player1.id,
                        move: {
                            ...move,
                            gamePiece: 'X',
                        },
                    });
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
                describe('when the game is over, it records a new row in the history and calls _emitAreaChanged', () => {
                    test('when X wins', () => {
                        const move = { col: 0, row: 0, gamePiece: 'X' };
                        jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                            game.endGame(player1.id);
                        });
                        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
                        expect(game.state.status).toEqual('OVER');
                        expect(gameArea.history.length).toEqual(1);
                        expect(gameArea.history[0]).toEqual({
                            gameID: game.id,
                            scores: {
                                [player1.userName]: 1,
                                [player2.userName]: 0,
                            },
                        });
                        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    });
                    test('when O wins', () => {
                        const move = { col: 0, row: 0, gamePiece: 'O' };
                        jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                            game.endGame(player2.id);
                        });
                        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player2);
                        expect(game.state.status).toEqual('OVER');
                        expect(gameArea.history.length).toEqual(1);
                        expect(gameArea.history[0]).toEqual({
                            gameID: game.id,
                            scores: {
                                [player1.userName]: 0,
                                [player2.userName]: 1,
                            },
                        });
                        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    });
                    test('when there is a tie', () => {
                        const move = { col: 0, row: 0, gamePiece: 'X' };
                        jest.spyOn(game, 'applyMove').mockImplementationOnce(() => {
                            game.endGame();
                        });
                        gameArea.handleCommand({ type: 'GameMove', move, gameID }, player1);
                        expect(game.state.status).toEqual('OVER');
                        expect(gameArea.history.length).toEqual(1);
                        expect(gameArea.history[0]).toEqual({
                            gameID: game.id,
                            scores: {
                                [player1.userName]: 0,
                                [player2.userName]: 0,
                            },
                        });
                        expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    });
                });
            });
        });
        describe('[T3.3] when given a LeaveGame command', () => {
            describe('when there is no game in progress', () => {
                it('should throw an error', () => {
                    expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1)).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
            });
            describe('when there is a game in progress', () => {
                it('should throw an error when the game ID does not match', () => {
                    gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    interactableUpdateSpy.mockClear();
                    expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1)).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
                it('should dispatch the leave command to the game and call _emitAreaChanged', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                    const leaveSpy = jest.spyOn(game, 'leave');
                    gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
                    expect(leaveSpy).toHaveBeenCalledWith(player1);
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(2);
                });
                it('should not call _emitAreaChanged if the game throws an error', () => {
                    gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    if (!game) {
                        throw new Error('Game was not created by the first call to join');
                    }
                    interactableUpdateSpy.mockClear();
                    const leaveSpy = jest.spyOn(game, 'leave').mockImplementationOnce(() => {
                        throw new Error('Test Error');
                    });
                    expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: game.id }, player1)).toThrowError('Test Error');
                    expect(leaveSpy).toHaveBeenCalledWith(player1);
                    expect(interactableUpdateSpy).not.toHaveBeenCalled();
                });
                it('should update the history if the game is over', () => {
                    const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                    gameArea.handleCommand({ type: 'JoinGame' }, player2);
                    interactableUpdateSpy.mockClear();
                    jest.spyOn(game, 'leave').mockImplementationOnce(() => {
                        game.endGame(player1.id);
                    });
                    gameArea.handleCommand({ type: 'LeaveGame', gameID }, player1);
                    expect(game.state.status).toEqual('OVER');
                    expect(gameArea.history.length).toEqual(1);
                    expect(gameArea.history[0]).toEqual({
                        gameID: game.id,
                        scores: {
                            [player1.userName]: 1,
                            [player2.userName]: 0,
                        },
                    });
                    expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                });
            });
        });
        describe('[T3.4] when given an invalid command', () => {
            it('should throw an error', () => {
                expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(INVALID_COMMAND_MESSAGE);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVGljVGFjVG9lR2FtZUFyZWEudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90b3duL2dhbWVzL1RpY1RhY1RvZUdhbWVBcmVhLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQzFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDaEMsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekQsT0FBTyxFQUNMLHlCQUF5QixFQUN6Qiw0QkFBNEIsRUFDNUIsdUJBQXVCLEdBQ3hCLE1BQU0sa0NBQWtDLENBQUM7QUFRMUMsT0FBTyxpQkFBaUIsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEtBQUssbUJBQW1CLE1BQU0saUJBQWlCLENBQUM7QUFDdkQsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLE1BQU0sV0FBWSxTQUFRLElBQXVDO0lBQy9EO1FBQ0UsS0FBSyxDQUFDO1lBQ0osS0FBSyxFQUFFLEVBQUU7WUFDVCxNQUFNLEVBQUUsa0JBQWtCO1NBQzNCLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFTSxTQUFTLEtBQVUsQ0FBQztJQUVwQixPQUFPLENBQUMsTUFBZTtRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsR0FBRyxJQUFJLENBQUMsS0FBSztZQUNiLE1BQU0sRUFBRSxNQUFNO1lBQ2QsTUFBTTtTQUNQLENBQUM7SUFDSixDQUFDO0lBRVMsS0FBSyxDQUFDLE1BQWM7UUFDNUIsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtZQUNoQixJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQzFCO2FBQU07WUFDTCxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1NBQzFCO1FBQ0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDN0IsQ0FBQztJQUVTLE1BQU0sS0FBVSxDQUFDO0NBQzVCO0FBQ0QsUUFBUSxDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRTtJQUNqQyxJQUFJLFFBQTJCLENBQUM7SUFDaEMsSUFBSSxPQUFlLENBQUM7SUFDcEIsSUFBSSxPQUFlLENBQUM7SUFDcEIsSUFBSSxxQkFBdUMsQ0FBQztJQUM1QyxJQUFJLElBQWlCLENBQUM7SUFDdEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLE1BQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUN0RSxJQUFJLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztRQUd6QixrQkFBa0IsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFekMsT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7UUFDbkMsT0FBTyxHQUFHLHNCQUFzQixFQUFFLENBQUM7UUFDbkMsUUFBUSxHQUFHLElBQUksaUJBQWlCLENBQzlCLE1BQU0sRUFBRSxFQUNSLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxFQUN2QyxJQUFJLEVBQWUsQ0FDcEIsQ0FBQztRQUNGLFFBQVEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDdEIsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUd0QixxQkFBcUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ25FLENBQUMsQ0FBQyxDQUFDO0lBQ0gsUUFBUSxDQUFDLGVBQWUsRUFBRSxHQUFHLEVBQUU7UUFDN0IsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUNwRCxRQUFRLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO2dCQUNqRCxFQUFFLENBQUMsb0RBQW9ELEVBQUUsR0FBRyxFQUFFO29CQUM1RCxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDekUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUM3QixJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztxQkFDbkU7b0JBQ0QsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtnQkFDaEQsRUFBRSxDQUFDLHdFQUF3RSxFQUFFLEdBQUcsRUFBRTtvQkFDaEYsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3pFLElBQUksQ0FBQyxJQUFJLEVBQUU7d0JBQ1QsTUFBTSxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDO3FCQUNuRTtvQkFDRCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFdkQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3pDLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDO29CQUM3RSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUMsb0JBQW9CLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQzlDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7b0JBQ2hDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6RCxDQUFDLENBQUMsQ0FBQztnQkFDSCxFQUFFLENBQUMsOERBQThELEVBQUUsR0FBRyxFQUFFO29CQUN0RSxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN0RCxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztxQkFDbkU7b0JBQ0QscUJBQXFCLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBRWxDLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRTt3QkFDbkUsTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDaEMsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQzlFLFlBQVksQ0FDYixDQUFDO29CQUNGLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDOUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3ZELENBQUMsQ0FBQyxDQUFDO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILFFBQVEsQ0FBQyxzQ0FBc0MsRUFBRSxHQUFHLEVBQUU7WUFDcEQsRUFBRSxDQUFDLHlEQUF5RCxFQUFFLEdBQUcsRUFBRTtnQkFDakUsTUFBTSxDQUFDLEdBQUcsRUFBRSxDQUNWLFFBQVEsQ0FBQyxhQUFhLENBQ3BCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsRUFBRSxFQUNoRixPQUFPLENBQ1IsQ0FDRixDQUFDLFlBQVksQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO1lBQy9DLENBQUMsQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtnQkFDaEQsSUFBSSxNQUFzQixDQUFDO2dCQUMzQixVQUFVLENBQUMsR0FBRyxFQUFFO29CQUNkLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQztvQkFDdEUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdEQscUJBQXFCLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQ3BDLENBQUMsQ0FBQyxDQUFDO2dCQUNILEVBQUUsQ0FBQyx1REFBdUQsRUFBRSxHQUFHLEVBQUU7b0JBQy9ELE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FDVixRQUFRLENBQUMsYUFBYSxDQUNwQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFDaEYsT0FBTyxDQUNSLENBQ0YsQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLGdFQUFnRSxFQUFFLEdBQUcsRUFBRTtvQkFDeEUsTUFBTSxJQUFJLEdBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDL0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUM7b0JBQ25ELFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDcEUsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLG9CQUFvQixDQUFDO3dCQUN4QyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxJQUFJOzRCQUNQLFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLDhEQUE4RCxFQUFFLEdBQUcsRUFBRTtvQkFDdEUsTUFBTSxJQUFJLEdBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQztvQkFDL0QsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFO3dCQUM3RSxNQUFNLElBQUksS0FBSyxDQUFDLFlBQVksQ0FBQyxDQUFDO29CQUNoQyxDQUFDLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUNwRSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLG9CQUFvQixDQUFDO3dCQUN4QyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFO3dCQUNwQixJQUFJLEVBQUU7NEJBQ0osR0FBRyxJQUFJOzRCQUNQLFNBQVMsRUFBRSxHQUFHO3lCQUNmO3FCQUNGLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDdkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsUUFBUSxDQUFDLHVGQUF1RixFQUFFLEdBQUcsRUFBRTtvQkFDckcsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7d0JBQ3ZCLE1BQU0sSUFBSSxHQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUM7d0JBQy9ELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRTs0QkFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzNCLENBQUMsQ0FBQyxDQUFDO3dCQUNILFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDcEUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDOzRCQUNsQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7NEJBQ2YsTUFBTSxFQUFFO2dDQUNOLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0NBQ3JCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7NkJBQ3RCO3lCQUNGLENBQUMsQ0FBQzt3QkFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekQsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLGFBQWEsRUFBRSxHQUFHLEVBQUU7d0JBQ3ZCLE1BQU0sSUFBSSxHQUFrQixFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLENBQUM7d0JBQy9ELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLFdBQVcsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLEdBQUcsRUFBRTs0QkFDeEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQzNCLENBQUMsQ0FBQyxDQUFDO3dCQUNILFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDcEUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDOzRCQUNsQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7NEJBQ2YsTUFBTSxFQUFFO2dDQUNOLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0NBQ3JCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7NkJBQ3RCO3lCQUNGLENBQUMsQ0FBQzt3QkFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekQsQ0FBQyxDQUFDLENBQUM7b0JBQ0gsSUFBSSxDQUFDLHFCQUFxQixFQUFFLEdBQUcsRUFBRTt3QkFDL0IsTUFBTSxJQUFJLEdBQWtCLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsQ0FBQzt3QkFDL0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxDQUFDLENBQUMsc0JBQXNCLENBQUMsR0FBRyxFQUFFOzRCQUN4RCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7d0JBQ2pCLENBQUMsQ0FBQyxDQUFDO3dCQUNILFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQzt3QkFDcEUsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3dCQUMxQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDOzRCQUNsQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7NEJBQ2YsTUFBTSxFQUFFO2dDQUNOLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7Z0NBQ3JCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7NkJBQ3RCO3lCQUNGLENBQUMsQ0FBQzt3QkFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDekQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0wsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsRUFBRTtZQUNyRCxRQUFRLENBQUMsbUNBQW1DLEVBQUUsR0FBRyxFQUFFO2dCQUNqRCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO29CQUMvQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQ1YsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQ3pFLENBQUMsWUFBWSxDQUFDLDRCQUE0QixDQUFDLENBQUM7b0JBQzdDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO2dCQUN2RCxDQUFDLENBQUMsQ0FBQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsUUFBUSxDQUFDLGtDQUFrQyxFQUFFLEdBQUcsRUFBRTtnQkFDaEQsRUFBRSxDQUFDLHVEQUF1RCxFQUFFLEdBQUcsRUFBRTtvQkFDL0QsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdEQscUJBQXFCLENBQUMsU0FBUyxFQUFFLENBQUM7b0JBQ2xDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FDVixRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FDekUsQ0FBQyxZQUFZLENBQUMseUJBQXlCLENBQUMsQ0FBQztvQkFDMUMsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLENBQUM7Z0JBQ3ZELENBQUMsQ0FBQyxDQUFDO2dCQUNILEVBQUUsQ0FBQyx5RUFBeUUsRUFBRSxHQUFHLEVBQUU7b0JBQ2pGLE1BQU0sRUFBRSxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUN6RSxJQUFJLENBQUMsSUFBSSxFQUFFO3dCQUNULE1BQU0sSUFBSSxLQUFLLENBQUMsZ0RBQWdELENBQUMsQ0FBQztxQkFDbkU7b0JBQ0QsTUFBTSxDQUFDLHFCQUFxQixDQUFDLENBQUMscUJBQXFCLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3ZELE1BQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUMzQyxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDL0QsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUMvQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLDhEQUE4RCxFQUFFLEdBQUcsRUFBRTtvQkFDdEUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDdEQsSUFBSSxDQUFDLElBQUksRUFBRTt3QkFDVCxNQUFNLElBQUksS0FBSyxDQUFDLGdEQUFnRCxDQUFDLENBQUM7cUJBQ25FO29CQUNELHFCQUFxQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNsQyxNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7d0JBQ3JFLE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7b0JBQ2hDLENBQUMsQ0FBQyxDQUFDO29CQUNILE1BQU0sQ0FBQyxHQUFHLEVBQUUsQ0FDVixRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUN4RSxDQUFDLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztvQkFDN0IsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLE9BQU8sQ0FBQyxDQUFDO29CQUMvQyxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztnQkFDdkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLCtDQUErQyxFQUFFLEdBQUcsRUFBRTtvQkFDdkQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3pFLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7b0JBQ3RELHFCQUFxQixDQUFDLFNBQVMsRUFBRSxDQUFDO29CQUNsQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxHQUFHLEVBQUU7d0JBQ3BELElBQUksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUMzQixDQUFDLENBQUMsQ0FBQztvQkFDSCxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsRUFBRSxPQUFPLENBQUMsQ0FBQztvQkFDL0QsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO29CQUMxQyxNQUFNLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzNDLE1BQU0sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDO3dCQUNsQyxNQUFNLEVBQUUsSUFBSSxDQUFDLEVBQUU7d0JBQ2YsTUFBTSxFQUFFOzRCQUNOLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7NEJBQ3JCLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUM7eUJBQ3RCO3FCQUNGLENBQUMsQ0FBQztvQkFDSCxNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDekQsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsUUFBUSxDQUFDLHNDQUFzQyxFQUFFLEdBQUcsRUFBRTtZQUNwRCxFQUFFLENBQUMsdUJBQXVCLEVBQUUsR0FBRyxFQUFFO2dCQUcvQixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxFQUFFLE9BQU8sQ0FBQyxDQUFDLENBQUMsWUFBWSxDQUNwRix1QkFBdUIsQ0FDeEIsQ0FBQztnQkFDRixNQUFNLENBQUMscUJBQXFCLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDLENBQUMsQ0FBQyJ9