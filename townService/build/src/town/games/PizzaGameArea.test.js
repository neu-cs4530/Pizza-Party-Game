import { nanoid } from 'nanoid';
import { mock } from 'jest-mock-extended';
import PizzaPartyGameArea from './PizzaGameArea';
import * as PizzaPartyGameModule from './PizzaGame';
import Game from './Game';
import { createPlayerForTesting } from '../../TestUtils';
import { GAME_ID_MISSMATCH_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, INVALID_COMMAND_MESSAGE, } from '../../lib/InvalidParametersError';
class TestingGame extends Game {
    constructor() {
        super({
            status: 'WAITING_TO_START',
            currentScore: 0,
            ovenFull: false,
            currentCustomers: [],
            currentPizza: {
                id: 0,
                toppings: [],
                cooked: false,
            },
            difficulty: 1,
        });
    }
    applyMove(move) { }
    endGame(winner) {
        this.state = {
            ...this.state,
            status: 'OVER',
            winner,
        };
    }
    startGame(player) { }
    _join(player) {
        this._players.push(player);
    }
    _leave(player) { }
}
describe('ConnectFourGameArea', () => {
    let gameArea;
    let player1;
    let player2;
    let interactableUpdateSpy;
    const gameConstructorSpy = jest.spyOn(PizzaPartyGameModule, 'default');
    let game;
    beforeEach(() => {
        gameConstructorSpy.mockClear();
        game = new TestingGame();
        gameConstructorSpy.mockReturnValue(game);
        player1 = createPlayerForTesting();
        player2 = createPlayerForTesting();
        gameArea = new PizzaPartyGameArea(nanoid(), { x: 0, y: 0, width: 100, height: 100 }, mock());
        gameArea.add(player1);
        game.join(player1);
        gameArea.add(player2);
        interactableUpdateSpy = jest.spyOn(gameArea, '_emitAreaChanged');
    });
    describe('[T3.1] JoinGame command', () => {
        test('when there is no existing game, it should create a new game and call _emitAreaChanged', () => {
            expect(gameArea.game).toBeUndefined();
            const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
            expect(gameArea.game).toBeDefined();
            expect(gameID).toEqual(game.id);
            expect(interactableUpdateSpy).toHaveBeenCalled();
        });
        test('when there is a game that just ended, it should create a new game and call _emitAreaChanged', () => {
            expect(gameArea.game).toBeUndefined();
            gameConstructorSpy.mockClear();
            const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
            expect(gameArea.game).toBeDefined();
            expect(gameID).toEqual(game.id);
            expect(interactableUpdateSpy).toHaveBeenCalled();
            expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
            game.endGame();
            gameConstructorSpy.mockClear();
            const { gameID: newGameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
            expect(gameArea.game).toBeDefined();
            expect(newGameID).toEqual(game.id);
            expect(interactableUpdateSpy).toHaveBeenCalled();
            expect(gameConstructorSpy).toHaveBeenCalledTimes(1);
        });
        describe('when there is a game in progress', () => {
            it('should call join on the game and call _emitAreaChanged', () => {
                const joinSpy = jest.spyOn(game, 'join');
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
                expect(joinSpy).toHaveBeenCalledWith(player1);
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
    describe('[T3.2] StartGame command', () => {
        it('when there is no game, it should throw an error and not call _emitAreaChanged', () => {
            expect(() => gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1)).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
        });
        describe('when there is a game in progress', () => {
            it('should call startGame on the game and call _emitAreaChanged', () => {
                const { gameID } = gameArea.handleCommand({ type: 'JoinGame' }, player1);
                interactableUpdateSpy.mockClear();
                gameArea.handleCommand({ type: 'StartGame', gameID }, player1);
                expect(interactableUpdateSpy).toHaveBeenCalledTimes(1);
            });
            it('should not call _emitAreaChanged if the game throws an error', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                interactableUpdateSpy.mockClear();
                const startSpy = jest.spyOn(game, 'startGame').mockImplementationOnce(() => {
                    throw new Error('Test Error');
                });
                expect(() => gameArea.handleCommand({ type: 'StartGame', gameID: game.id }, player1)).toThrowError('Test Error');
                expect(startSpy).toHaveBeenCalledWith(player1);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
            test('when the game ID mismatches, it should throw an error and not call _emitAreaChanged', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                if (!game) {
                    throw new Error('Game was not created by the first call to join');
                }
                expect(() => gameArea.handleCommand({ type: 'StartGame', gameID: nanoid() }, player1)).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
            });
        });
    });
    describe('[T3.4] LeaveGame command', () => {
        it('should throw an error if there is no game in progress and not call _emitAreaChanged', () => {
            expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1)).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
            expect(interactableUpdateSpy).not.toHaveBeenCalled();
        });
        describe('when there is a game in progress', () => {
            it('should throw an error if the gameID does not match the game and not call _emitAreaChanged', () => {
                gameArea.handleCommand({ type: 'JoinGame' }, player1);
                interactableUpdateSpy.mockClear();
                expect(() => gameArea.handleCommand({ type: 'LeaveGame', gameID: nanoid() }, player1)).toThrowError(GAME_ID_MISSMATCH_MESSAGE);
                expect(interactableUpdateSpy).not.toHaveBeenCalled();
            });
            it('should call leave on the game and call _emitAreaChanged', () => {
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
        });
    });
    test('[T3.5] When given an invalid command it should throw an error', () => {
        expect(() => gameArea.handleCommand({ type: 'InvalidCommand' }, player1)).toThrowError(INVALID_COMMAND_MESSAGE);
        expect(interactableUpdateSpy).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGl6emFHYW1lQXJlYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL3Rvd24vZ2FtZXMvUGl6emFHYW1lQXJlYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFDaEMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBUzFDLE9BQU8sa0JBQWtCLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxLQUFLLG9CQUFvQixNQUFNLGFBQWEsQ0FBQztBQUNwRCxPQUFPLElBQUksTUFBTSxRQUFRLENBQUM7QUFDMUIsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekQsT0FBTyxFQUNMLHlCQUF5QixFQUN6Qiw0QkFBNEIsRUFDNUIsdUJBQXVCLEdBQ3hCLE1BQU0sa0NBQWtDLENBQUM7QUFFMUMsTUFBTSxXQUFZLFNBQVEsSUFBNkM7SUFDckU7UUFDRSxLQUFLLENBQUM7WUFDSixNQUFNLEVBQUUsa0JBQWtCO1lBQzFCLFlBQVksRUFBRSxDQUFDO1lBQ2YsUUFBUSxFQUFFLEtBQUs7WUFDZixnQkFBZ0IsRUFBRSxFQUFFO1lBQ3BCLFlBQVksRUFBRTtnQkFDWixFQUFFLEVBQUUsQ0FBQztnQkFDTCxRQUFRLEVBQUUsRUFBRTtnQkFDWixNQUFNLEVBQUUsS0FBSzthQUNkO1lBQ0QsVUFBVSxFQUFFLENBQUM7U0FDZCxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU0sU0FBUyxDQUFDLElBQWtDLElBQVMsQ0FBQztJQUV0RCxPQUFPLENBQUMsTUFBZTtRQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHO1lBQ1gsR0FBRyxJQUFJLENBQUMsS0FBSztZQUNiLE1BQU0sRUFBRSxNQUFNO1lBQ2QsTUFBTTtTQUNQLENBQUM7SUFDSixDQUFDO0lBRU0sU0FBUyxDQUFDLE1BQWMsSUFBRyxDQUFDO0lBRXpC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