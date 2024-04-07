import _ from 'lodash';
import {
  Customer,
  GameArea,
  GameStatus,
  Order,
  Pizza,
  PizzaPartyGameState,
  Topping,
  ToppingOptions,
} from '../../types/CoveyTownSocket';
import GameAreaController, { GameEventTypes } from './GameAreaController';
import { nanoid } from 'nanoid';

export type PizzaPartyEvents = GameEventTypes & {
  gameChanged: (currentGame: PizzaPartyGameState) => void;
  pizzaChanged: (currentPizza: Pizza) => void;
  customerChanged: (currentCustomer: Customer[]) => void;
  scoreChanged: (currentScore: number) => void;
};

// TO-DO: Add functionality

/**
 * This class is responsible for managing the state of the Pizza Party game, and for sending commands to the server
 */
export default class PizzaPartyAreaController extends GameAreaController<
  PizzaPartyGameState,
  PizzaPartyEvents
> {
  protected _game: PizzaPartyGameState | undefined = this._model.game?.state;

  get currentPizza(): Pizza | undefined {
    return this._game?.currentPizza;
  }

  get currentScore(): number | undefined {
    return this._game?.currentScore;
  }

  get currentCustomers(): Customer[] | undefined {
    return this._game?.currentCustomers;
  }

  public isActive(): boolean {
    return !this.isEmpty() && this._game?.status !== 'WAITING_FOR_PLAYERS';
  }

  /**
   * Returns true if the current player is a player in this game
   */
  get isPlayer(): boolean {
    return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
  }

  get game(): PizzaPartyGameState | undefined {
    return this._game;
  }

  /**
   * Returns the status of the game.
   * Defaults to 'WAITING_TO_START' if the game is not in progress
   */
  get status(): GameStatus {
    const status = this._model.game?.state.status;
    if (!status) {
      return 'WAITING_TO_START';
    }
    return status;
  }

  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;
    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error('Game Not startable');
    }

    await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });

    console.log(this._game);
  }

  public findEmptySeat(): number | undefined {
    if (this.game !== undefined) {
      const emptyCustomerIndex = this.game.currentCustomers.findIndex(
        customer => customer.name === 'Empty',
      );

      return emptyCustomerIndex;
    }
    return undefined;
  }

  protected TOPPINGS_LIST: ToppingOptions[] = [
    'pepperoni',
    'mushrooms',
    'anchovies',
    'olives',
    'onions',
    'peppers',
    'sausage',
  ];

  protected getRandomInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  protected generateRandomTopping = (): Topping => {
    const toppingKind = this.TOPPINGS_LIST[Math.floor(Math.random() * this.TOPPINGS_LIST.length)];
    return {
      id: Math.floor(Math.random() * 1000),
      kind: toppingKind,
      appliedOnPizza: false,
    };
  };

  protected generateRandomPizza = (): Pizza => {
    // Edited to be variable based on the game's difficulty.
    const numberOfToppings = this.getRandomInt(1, 2 * (this.game?.difficulty ?? 0) + 1);
    const toppings: Topping[] = [];
    for (let i = 0; i < numberOfToppings; i++) {
      const randomTopping: Topping = this.generateRandomTopping();
      toppings.push(randomTopping);
    }
    return {
      id: this.getRandomInt(0, 1000),
      toppings,
      cooked: false,
      isInOven: false,
    };
  };

  protected generateRandomOrder = (): Order => {
    const pizzas: Pizza[] = [];
    const randomPizza: Pizza = this.generateRandomPizza();
    pizzas.push(randomPizza);
    return {
      pizzas,
      pointValue: this.game?.difficulty ?? 0,
    };
  };

  public generateRandomCustomer = (): Customer => {
    const customer: Customer = {
      id: nanoid(),
      name: 'Customer',
      timeRemaining: 100 - 10 * ((this.game?.difficulty ?? 1) - 1),
      completed: false,
      order: this.generateRandomOrder(),
    };
    return customer;
  };

  protected resetPizza = (): void => {
    if (this.game !== undefined) {
      this.game.currentPizza = {
        id: 0,
        toppings: [],
        cooked: false,
        isInOven: false,
      };
    }
  };

  protected checkDifficulty = (): void => {
    if (this.game !== undefined) {
      const score: number = this.game.currentScore;
      switch (score) {
        case 10:
          this.game.difficulty = 2;
          break;
        case 20:
          this.game.difficulty = 3;
          break;
        default:
          break;
      }
    }
  };

  /**
   * Updates the internal state of this ConnectFourAreaController based on the new model.
   *
   * Calls super._updateFrom, which updates the occupants of this game area and other
   * common properties (including this._model)
   *
   * If the board has changed, emits a boardChanged event with the new board.
   * If the board has not changed, does not emit a boardChanged event.
   *
   * If the turn has changed, emits a turnChanged event with the new turn (true if our turn, false otherwise)
   * If the turn has not changed, does not emit a turnChanged event.
   */
  protected _updateFrom(newModel: GameArea<PizzaPartyGameState>): void {
    super._updateFrom(newModel);
    const newGame = newModel.game;
    if (newGame) {
      if (!_.isEqual(newGame.state, this._game)) {
        this._game = newGame.state;
        this.emit('pizzaChanged', newGame.state.currentPizza);
        this.emit('gameChanged', newGame.state);
        this.emit('customerChanged', newGame.state.currentCustomers);
        this.emit('scoreChanged', newGame.state.currentScore);
      }
    }
  }
  /**
   * Sends a request to the server to make a move in the game
   *
   * If the game is not in progress, throws an error NO_GAME_IN_PROGRESS_ERROR
   *
   * @param row Row of the move
   * @param col Column of the move
   */
  // public async makeMove(row: TicTacToeGridPosition, col: TicTacToeGridPosition) {
  //   const instanceID = this._instanceID;
  //   if (!instanceID || this._model.game?.state.status !== 'IN_PROGRESS') {
  //     throw new Error(NO_GAME_IN_PROGRESS_ERROR);
  //   }
  //   await this._townController.sendInteractableCommand(this.id, {
  //     type: 'GameMove',
  //     gameID: instanceID,
  //     move: {
  //       row,
  //       col,
  //       gamePiece: this.gamePiece,
  //     },
  //   });
  // }
}
