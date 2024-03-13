import { PassThrough } from 'stream';
import InvalidParametersError, {
  GAME_FULL_MESSAGE,
  GAME_NOT_IN_PROGRESS_MESSAGE,
  MOVE_NOT_YOUR_TURN_MESSAGE,
  PLAYER_ALREADY_IN_GAME_MESSAGE,
  PLAYER_NOT_IN_GAME_MESSAGE,
  GAME_NOT_STARTABLE_MESSAGE,
} from '../../lib/InvalidParametersError';
import Player from '../../lib/Player';
import { PizzaPartyGameState, PizzaPartyGameMove, GameMove } from '../../types/CoveyTownSocket';
import Game from './Game';
import { removeThisFunctionCallWhenYouImplementThis } from '../../Utils';

export default class PizzaPartyGame extends Game<PizzaPartyGameState, PizzaPartyGameMove> {
  public constructor() {
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
    });
  }

  public applyMove(move: GameMove<PizzaPartyGameMove>): void {}

  public _join(player: Player): void {
    if (this._players.length === 1) {
      throw new Error(GAME_FULL_MESSAGE);
    }
    if (this._players[0] === player) {
      throw new Error(PLAYER_ALREADY_IN_GAME_MESSAGE);
    }
    if (this.state.status !== 'WAITING_FOR_PLAYERS') {
      throw new Error(GAME_FULL_MESSAGE);
    }
    this.state.player = player.id;
    this.state.status = 'WAITING_TO_START';
  }

  public _leave(player: Player): void {
    if (!this._players.includes(player)) {
      throw new Error(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    if (this.state.status !== 'WAITING_FOR_PLAYERS') {
      this.state.status = 'WAITING_FOR_PLAYERS';
    }
    this.state.player = undefined;
  }

  public startGame(player: Player): void {
    if (this.state.status !== 'WAITING_TO_START') {
      throw new InvalidParametersError(GAME_NOT_STARTABLE_MESSAGE);
    }
    if (this.state.player) {
      throw new InvalidParametersError(PLAYER_NOT_IN_GAME_MESSAGE);
    }
    this.state = {
      ...this.state,
      status: 'IN_PROGRESS',
    };
  }
}
