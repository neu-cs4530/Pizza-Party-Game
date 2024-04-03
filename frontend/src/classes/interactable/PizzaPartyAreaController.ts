import { GameStatus, Pizza, PizzaPartyGameState } from '../../types/CoveyTownSocket';
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

  get pizzaPartyGame(): PizzaPartyGameState {
    return this._game;
  }

  get currentPizza(): Pizza {
    return this._game.currentPizza;
  }

  public isActive(): boolean {
    return !this.isEmpty() && this._game.status !== 'WAITING_FOR_PLAYERS';
  }

    /**
   * Returns true if the current player is a player in this game
   */
    get isPlayer(): boolean {
      return this._model.game?.players.includes(this._townController.ourPlayer.id) || false;
    }

  get game(): PizzaPartyGameState {
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
