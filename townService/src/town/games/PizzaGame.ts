import { nanoid } from 'nanoid';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
  INVALID_MOVE_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import {
  PizzaPartyGameState,
  PizzaPartyGameMove,
  GameMove,
  Order,
  Pizza,
  Topping,
  ToppingOptions,
  Customer,
} from '../../types/CoveyTownSocket';
import Game from './Game';

export default class PizzaPartyGame extends Game<PizzaPartyGameState, PizzaPartyGameMove> {
  public constructor() {
    super({
      status: 'WAITING_FOR_PLAYERS',
      currentScore: 0,
      oven: {
        ovenFull: false,
      },
      currentCustomers: [undefined, undefined, undefined, undefined, undefined, undefined],
      currentPizza: {
        id: 0,
        toppings: [],
        cooked: false,
        isInOven: false,
      },
      difficulty: 1,
    });
  }

  public async applyMove(move: GameMove<PizzaPartyGameMove>): Promise<void> {
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.move.moveType === 'placeTopping') {
      if (move.move.topping === undefined) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      move.move.pizza?.toppings.push(move.move.topping);
    } else if (move.move.moveType === 'moveToCustomer') {
      if (move.move.customer === undefined) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      // if (!this.state.currentCustomers.includes(move.move.customer)) {
      //   throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      // }
      if (move.move.pizza?.toppings === undefined) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      const validPizza: boolean = this.sameToppings(
        move.move.pizza?.toppings,
        move.move.customer.order.pizzas[0].toppings,
      );
      if (validPizza) {
        this.state.currentScore += 1;
      }
      // TODO: handle customer functionality (how do we give them stuff)
      /**
       * if move.pizza.toppings === customer.order.toppings:
       *  update score
       *  this.ovenFull = false
       *  this.reset(currentPizza)
       * else ()
       */
    } else if (move.move.moveType === 'moveToOven') {
      if (this.state.oven.ovenFull || move.move.pizza?.isInOven) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      this.state.oven.pizza = move.move.pizza;
      this.state.oven.ovenFull = true;
    } else if (move.move.moveType === 'throwOut') {
      this.resetPizza();
    }
    this.checkDifficulty();
  }

  public _join(player: Player): void {
    if (this.state.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error(GAME_FULL_MESSAGE);
    }
    this.state.player = player.id;
    this.state.status = 'WAITING_TO_START';
  }

  /**
   * Sets up the player's departure for the game, which will then be finalized by the leave() method (see Game.ts).
   * This method resets the status to WAITING_FOR_PLAYERS before
   * @param player The player leaving the game.
   */
  public _leave(player: Player): void {
    if (!(player.id === this.state.player)) {
      throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.status === 'IN_PROGRESS') {
      this.state.status = 'OVER';
    } else if (this.state.status === 'WAITING_TO_START') {
      this.state.status = 'WAITING_FOR_PLAYERS';
    }
    this.state.player = undefined;
  }

  /**
   * Starts the game for the given player. This method, unlike in ConnectFourArea, doesn't have an idea of player "readiness",
   * so the game simply starts if the player is in the game or if the game is startable. If this isn't the case, then it throws the respective error.
   *
   * @throws InvalidParametersError if game is not WAITING_TO_START (GAME_NOT_STARTABLE_MESSAGE).
   * @throws InvalidParametersError if the given player is not already in the game. (PLAYER_NOT_IN_GAME_MESSAGE).
   *
   * @param player The player this method starts the game on behalf of.
   */
  public startGame(player: Player): PizzaPartyGameState {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (!this.state.player) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
      currentCustomers: [
        this.generateRandomCustomer(),
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ],
    };
    // console.log(this.state);
    return this.state;
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
    const numberOfToppings = this.getRandomInt(1, 2 * this.state.difficulty + 1);
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
      pointValue: this.state.difficulty,
    };
  };

  protected generateRandomCustomer = (): Customer => {
    const customer: Customer = {
      id: nanoid(),
      name: 'Customer',
      timeRemaining: 100 - 10 * (this.state.difficulty - 1),
      completed: false,
      order: this.generateRandomOrder(),
    };
    return customer;
  };

  protected resetPizza = (): void => {
    this.state = {
      ...this.state,
      currentPizza: {
        id: 0,
        toppings: [],
        cooked: false,
        isInOven: false,
      },
    };
  };

  protected checkDifficulty = (): void => {
    const score: number = this.state.currentScore;
    switch (score) {
      case 10:
        this.state.difficulty = 2;
        break;
      case 20:
        this.state.difficulty = 3;
        break;
      default:
        break;
    }
  };

  protected sameToppings = (pizzaToppings: Topping[], orderToppings: Topping[]): boolean =>
    pizzaToppings.length === orderToppings.length &&
    pizzaToppings.every((topping, idx) => topping === orderToppings[idx]);
}
