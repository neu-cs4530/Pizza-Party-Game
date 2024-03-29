import { ThisMonthInstance } from 'twilio/lib/rest/api/v2010/account/usage/record/thisMonth';
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
} from '../../types/CoveyTownSocket';
import Game from './Game';

export default class PizzaPartyGame extends Game<PizzaPartyGameState, PizzaPartyGameMove> {
  public constructor() {
    super({
      status: 'WAITING_FOR_PLAYERS',
      currentScore: 0,
      ovenFull: false,
      currentCustomers: [],
      currentPizza: {
        id: 0,
        toppings: [],
        cooked: false,
      },
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
      // TODO: handle customer functionality (how do we give them stuff)
    } else if (move.move.moveType === 'moveToOven') {
      // TODO: figure out oven
    }
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
  public startGame(player: Player): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (!this.state.player) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
    };
  }
}
