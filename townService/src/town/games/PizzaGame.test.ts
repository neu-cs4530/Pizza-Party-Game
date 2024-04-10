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
      it('should throw an error if the game is not in progress', () => {
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToOven',
            },
          }),
        ).toThrowError(GAME_NOT_IN_PROGRESS_MESSAGE);
      });
      it('should throw an error if move is type placeTopping and topping is undefined', () => {
        game.startGame(player1);
        const pizza1 = createPizzaForTesting();
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'placeTopping',
              pizza: pizza1,
              topping: undefined,
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      // it('should throw an error if move is type placeTopping and pizza is undefined', () => {
      //   game.startGame(player1);
      //   expect(() =>
      //     game.applyMove({
      //       gameID: game.id,
      //       playerID: player1.id,
      //       move: {
      //         gamePiece: 'placeTopping',
      //         topping: {
      //           id: 1,
      //           kind: 'olives',
      //           appliedOnPizza: false,
      //         },
      //         pizza: undefined,
      //       },
      //     }),
      //   ).toThrowError(INVALID_MOVE_MESSAGE);
      // });
      it('should throw an error if move is of type moveToCustomer and customer is undefined', () => {
        const pizza1: Pizza = createPizzaForTesting();
        game.startGame(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToCustomer',
              pizza: pizza1,
              customer: undefined,
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('should throw an error if move is of type moveToCustomer and pizza is undefined', () => {
        const pizza1: Pizza = createPizzaForTesting();
        const order1: Order = createOrderForTesting([pizza1]);
        const customer1: Customer = createCustomerForTesting(order1);
        game.startGame(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToCustomer',
              customer: customer1,
              pizza: undefined,
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
<<<<<<< HEAD
=======
      it('should throw an error if move is of type moveToOven and pizza is undefined', () => {
        game.startGame(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToOven',
              pizza: undefined,
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('should throw an error if move is of type moveToOven and oven is full', () => {
        const pizza1 = createPizzaForTesting();
        game.startGame(player1);
        game.state.oven.ovenFull = true;
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToOven',
              pizza: pizza1,
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
      it('should throw an error if move is of type moveToOven and pizza is in oven', () => {
        const pizza1 = createPizzaForTesting();
        game.startGame(player1);
        expect(() =>
          game.applyMove({
            gameID: game.id,
            playerID: player1.id,
            move: {
              gamePiece: 'moveToOven',
              pizza: pizza1,
            },
          }),
        ).toThrowError(INVALID_MOVE_MESSAGE);
      });
>>>>>>> 0da98759276a1d05f44e82ec7bf8d821cba4c094
    });
    describe('when given a placeTopping move', () => {
      it("should reflect in the pizza's topping list (1 topping)", () => {
        const pizza1 = createPizzaForTesting([]);
        game.state.currentPizza = pizza1;
        expect(game.state.currentPizza.toppings.length).toEqual(0);
        game.startGame(player1);
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'placeTopping',
            topping: {
              id: 1,
              kind: 'olives',
              appliedOnPizza: false,
            },
            // pizza: pizza1,
          },
        });
        expect(game.state.currentPizza.toppings.length).toEqual(1);
        expect(game.state.currentPizza.toppings[0].kind).toBe('olives');
      });
      it("should reflect in the pizza's topping list (2 toppings)", () => {
        const pizza1 = createPizzaForTesting([]);
        game.state.currentPizza = pizza1;
        expect(game.state.currentPizza.toppings.length).toEqual(0);
        game.startGame(player1);
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'placeTopping',
            topping: {
              id: 1,
              kind: 'olives',
              appliedOnPizza: false,
            },
            // pizza: pizza1,
          },
        });
        expect(game.state.currentPizza.toppings.length).toEqual(1);
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'placeTopping',
            topping: {
              id: 2,
              kind: 'onions',
              appliedOnPizza: false,
            },
            pizza: pizza1,
          },
        });
        expect(game.state.currentPizza.toppings.length).toEqual(2);
        expect(game.state.currentPizza.toppings[0].kind).toBe('olives');
        expect(game.state.currentPizza.toppings[1].kind).toBe('onions');
      });
    });
    describe('when given a dropPizza move', () => {
      it('should reset the pizza if the pizza is the current pizza', () => {
        const pizza1 = createPizzaForTesting();
        game.startGame(player1);
        const emptyPizza = game.state.currentPizza;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'throwOut',
          },
        });
        expect(
          game.state.currentPizza.toppings.every(topping => topping.appliedOnPizza === false),
        ).toBeTruthy();
      });
    });
    describe('when given a moveToCustomer move', () => {
      it('increases the score by one if the customer order toppings and pizza toppings match', () => {
        const pizza1 = createPizzaForTesting();
        const pizza2 = createPizzaForTesting();
        const order1 = createOrderForTesting([pizza1]);
        const customer1 = createCustomerForTesting(order1);
        game.startGame(player1);
        game.state.currentPizza = pizza2;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToOven',
            pizza: game.state.currentPizza,
          },
        });
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToCustomer',
            pizza: pizza2,
            customer: customer1,
          },
        });
        expect(game.state.currentScore).toBe(1);
      });
      it("doesn't increase the score if the customer order and pizza DON'T match", () => {
        const pizza1 = createPizzaForTesting();
        const pizza2 = createPizzaForTesting(['olives']);
        const order1 = createOrderForTesting([pizza1]);
        const customer1 = createCustomerForTesting(order1);
        game.startGame(player1);
        game.state.currentPizza = pizza2;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToOven',
            pizza: game.state.currentPizza,
          },
        });
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToCustomer',
            pizza: pizza2,
            customer: customer1,
          },
        });

        expect(game.state.currentScore).toBe(0);
      });
      it('sets the customer at the location to a brand new empty customer if their order was fulfilled', () => {
        const pizza1 = createPizzaForTesting();
        const pizza2 = createPizzaForTesting();
        const order1 = createOrderForTesting([pizza1]);
        const customer1 = createCustomerForTesting(order1);
        game.startGame(player1);
        game.state.currentCustomers[0] = customer1;
        expect(game.state.currentCustomers[0].name).toBe('bob');
        game.state.currentPizza = pizza2;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToOven',
            pizza: game.state.currentPizza,
          },
        });
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToCustomer',
            pizza: pizza2,
            customer: customer1,
          },
        });
        expect(game.state.currentCustomers[0].name).toBe('Empty');
      });
      it('sets pizza in oven to undefined and ovenFull to false if the pizza was in the oven', () => {
        const pizza1 = createPizzaForTesting();
        const pizza2 = createPizzaForTesting();
        const order1 = createOrderForTesting([pizza1]);
        const customer1 = createCustomerForTesting(order1);
        game.startGame(player1);
        game.state.currentPizza = pizza2;
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToOven',
            pizza: game.state.currentPizza,
          },
        });
        game.applyMove({
          gameID: game.id,
          playerID: player1.id,
          move: {
            gamePiece: 'moveToCustomer',
            pizza: pizza2,
            customer: customer1,
          },
        });
        expect(game.state.oven.pizza).toBeUndefined();
        expect(game.state.oven.ovenFull).toBeFalsy();
      });
    });
  });
});
