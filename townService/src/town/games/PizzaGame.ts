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
import pizzaSchema from '../database/pizza/schema';

export default class PizzaPartyGame extends Game<PizzaPartyGameState, PizzaPartyGameMove> {
  public constructor() {
    super({
      status: 'WAITING_FOR_PLAYERS',
      currentScore: 0,
      oven: {
        ovenFull: false,
      },
      currentCustomers: [],
      currentPizza: {
        id: 0,
        toppings: [],
        cooked: false,
        isInOven: false,
      },
      difficulty: 1,
    });

    this.state = {
      ...this.state,
      currentCustomers: [],
    };
  }

  protected generateEmptyCustomer = (): Customer => {
    const customer: Customer = {
      id: nanoid(),
      name: 'Empty',
      timeRemaining: 100000,
      completed: false,
      order: this.generateRandomOrder(),
    };
    return customer;
  };

  public applyMove(move: GameMove<PizzaPartyGameMove>): void {
    console.log('Applying move', move);
    if (this.state.status !== 'IN_PROGRESS') {
      throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
    }
    if (move.move.gamePiece === 'placeTopping') {
      if (move.move.topping === undefined) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      // if (move.move.pizza === undefined) {
      //   throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      // }
      this.state = {
        ...this.state,
        currentPizza: {
          ...this.state.currentPizza,
          toppings: [...this.state.currentPizza.toppings, move.move.topping],
        },
      };
      move.move.topping.appliedOnPizza = true;
    } else if (move.move.gamePiece === 'throwOut') {
      console.log("remove toppings")
      try {
        if(this.state.currentPizza.toppings.length > 0) {
          this.state.currentPizza.toppings.forEach(topping =>
            topping.appliedOnPizza = false
          );
        }
        this.state = {
          ...this.state,
          currentPizza: {
            ...this.state.currentPizza,
            toppings: [],
            cooked: false,
            isInOven: false,
          },
        };
      } catch(e: any) {
        console.log((e as Error).message);
        console.log("hi")
      }
      console.log("end of move")
    } else if (move.move.gamePiece === 'moveToCustomer') {
      if (move.move.customer === undefined) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      if (move.move.pizza === undefined) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }

      const validPizza: boolean = this.sameToppings(
        move.move.pizza?.toppings,
        move.move.customer.order.pizzas[0].toppings,
      );
      if (validPizza) {
        this.state.currentScore += move.move.customer.order.pointValue;
        if (move.move.pizza === this.state.currentPizza) {
          this.resetPizza();
        }
        if (move.move.pizza === this.state.oven.pizza) {
          this.state.oven.pizza = undefined;
          this.state.oven.ovenFull = false;
        }
        const satisfiedCustomerIndex = this.state.currentCustomers.findIndex(
          customer => customer.id === move.move.customer?.id,
        );
        this.state.currentCustomers[satisfiedCustomerIndex] = this.generateEmptyCustomer();
      }
      // TODO: handle customer functionality (how do we give them stuff)
      /**
       * if move.pizza.toppings === customer.order.toppings:
       *  update score
       *  this.ovenFull = false
       *  this.reset(currentPizza)
       * else ()
       */
    } else if (move.move.gamePiece === 'moveToOven') {
      if (!move.move.pizza) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      if (this.state.oven.ovenFull || move.move.pizza?.isInOven) {
        throw new InvalidParametersError(INVALID_MOVE_MESSAGE);
      }
      this.state.oven.pizza = move.move.pizza;
      this.state.oven.ovenFull = true;
    } else if (move.move.gamePiece === 'throwOut') {
      if (move.move.pizza === this.state.currentPizza) {
        this.resetPizza();
      } else if (move.move.pizza === this.state.oven.pizza) {
        this.state.oven.pizza = undefined;
        this.state.oven.ovenFull = false;
      }
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
  public async startGame(player: Player): Promise<PizzaPartyGameState> {
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
        this.generateEmptyCustomer(),
        this.generateEmptyCustomer(),
        this.generateEmptyCustomer(),
        this.generateEmptyCustomer(),
        this.generateEmptyCustomer(),
        this.generateEmptyCustomer(),
      ],
    };
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

  protected sameToppings = (pizzaToppings: Topping[], orderToppings: Topping[]): boolean => {
    const pizzaOptions = pizzaToppings.map(topping => topping.kind);
    const orderOptions = orderToppings.map(topping => topping.kind);

    return (
      pizzaOptions.length === orderOptions.length &&
      pizzaOptions.every(topping => orderOptions.includes(topping)) &&
      orderOptions.every(topping => pizzaOptions.includes(topping))
    );
  };
}
