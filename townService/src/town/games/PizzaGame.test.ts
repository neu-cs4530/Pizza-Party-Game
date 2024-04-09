import {
  createPlayerForTesting,
  createPizzaForTesting,
  createOrderForTesting,
  createCustomerForTesting,
} from '../../TestUtils';
import {
  GAME_FULL_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  INVALID_MOVE_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { Customer, Order, Pizza } from '../../types/CoveyTownSocket';
import PizzaPartyGame from './PizzaGame';

describe('PizzaPartyGame', () => {
  let game: PizzaPartyGame;

  beforeEach(() => {
    game = new PizzaPartyGame();
  });

  describe('_join', () => {
    it('should throw an error if the game is full', () => {
      const player1 = createPlayerForTesting();
      const player2 = createPlayerForTesting();
      const player3 = createPlayerForTesting();
      game.join(player1);
      expect(() => game.join(player2)).toThrowError(GAME_FULL_MESSAGE);
      expect(() => game.join(player3)).toThrowError(GAME_FULL_MESSAGE);
    });
    it('should join the player into the game', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      expect(game.state.player).toEqual(player1.id);
    });
    it('should change the status to WAITING_TO_START', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      expect(game.state.status).toEqual('WAITING_TO_START');
    });
  });
  describe('_startGame', () => {
    it('should set the game status to IN_PROGRESS', () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      expect(game.state.status).toEqual('WAITING_TO_START');
      game.startGame(player1);
      expect(game.state.status).toEqual('IN_PROGRESS');
    });
    it('should throw an error if the status is not WAITING_TO_START', async () => {
      const player1 = createPlayerForTesting();
      await expect(() => game.startGame(player1)).rejects.toThrowError(GAME_NOT_STARTABLE_MESSAGE);
    });
    it('should throw an error if the player is not in the game', async () => {
      const player1 = createPlayerForTesting();
      game.join(player1);
      game.state.player = undefined;
      await expect(() => game.startGame(player1)).rejects.toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
  });
  describe('_leave', () => {
    it('should throw an error if the player is not in the game', () => {
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
      // TODO weaker test suite only does one of these - above or below
      const player = createPlayerForTesting();
      game.join(player);
      expect(() => game.leave(createPlayerForTesting())).toThrowError(PLAYER_NOT_IN_GAME_MESSAGE);
    });
    describe('when the player is in the game', () => {
      describe('when the game is in progress, it should set the game status to OVER', () => {
        test('when player leaves', () => {
          const player1 = createPlayerForTesting();
          game.join(player1);
          game.startGame(player1);
          expect(game.state.status).toEqual('IN_PROGRESS');
          game.leave(player1);
          expect(game.state.status).toEqual('OVER');
        });
      });
      it('when the game is not in progress, it should set the game status to WAITING_TO_START and remove the player', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(game.state.status).toEqual('WAITING_TO_START');
        game.leave(player1);
        expect(game.state.status).toEqual('WAITING_FOR_PLAYERS');
      });
      it('should remove the player', () => {
        const player1 = createPlayerForTesting();
        game.join(player1);
        expect(game.state.status).toEqual('WAITING_TO_START');
        game.leave(player1);
        expect(game.state.player).toEqual(undefined);
      });
    });
  });
  describe('applyMove', () => {
    let player1: Player;

    beforeEach(() => {
      player1 = createPlayerForTesting();
      game.join(player1);
    });
    describe('when given an invalid move', () => {
      it('should throw an error if the game is not in progress', async () => {
        await expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToOven',
            },
          }),
        ).rejects.toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      it('should throw an error if move is type placeTopping and topping is undefined', async () => {
        game.startGame(player1);
        await expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'placeTopping',
              topping: undefined,
            },
          }),
        ).rejects.toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('should throw an error if move is of type moveToCustomer and customer is undefined', async () => {
        const pizza1: Pizza = createPizzaForTesting();
        game.startGame(player1);
        await expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'placeTopping',
              pizza: pizza1,
              customer: undefined,
            },
          }),
        ).rejects.toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('should throw an error if move is of type moveToCustomer and pizza is undefined', async () => {
        const pizza1: Pizza = createPizzaForTesting();
        const order1: Order = createOrderForTesting([pizza1]);
        const customer1: Customer = createCustomerForTesting(order1);
        game.startGame(player1);
        await expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'placeTopping',
              customer: customer1,
              pizza: undefined,
            },
          }),
        ).rejects.toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('should throw an error if move is of type moveToOven and pizza is undefined', async () => {
        game.startGame(player1);
        await expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToOven',
              pizza: undefined,
            },
          }),
        ).rejects.toThrowError(INVALID_MOVE_MESSAGE);
      });
      // it('should throw an error if move is of type moveToOven and oven is full')
    });
  });
});
