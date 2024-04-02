import { PizzaPartyGameState } from '../../types/CoveyTownSocket';
import GameAreaController, { GameEventTypes } from './GameAreaController';

export type PizzaPartyEvents = GameEventTypes & {
  gameChanged: () => void; // TO-DO: Add actual game movement
};

// TO-DO: Add functionality

/**
 * This class is responsible for managing the state of the Pizza Party game, and for sending commands to the server
 */
export default class PizzaPartyAreaController extends GameAreaController<
  PizzaPartyGameState,
  PizzaPartyEvents
> {
  protected _game: PizzaPartyGameState = {
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
  };

  public isActive(): boolean {
    return !this.isEmpty() && this._game.status !== 'WAITING_FOR_PLAYERS';
  }

  get game(): PizzaPartyGameState {
    return this._game;
  }
}
