import _ from 'lodash';
import { GameArea, GameStatus, Pizza, PizzaPartyGameState } from '../../types/CoveyTownSocket';
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
    status: 'WAITING_TO_START',
    currentScore: 0,
    oven: {
      ovenFull: false,
    },
    currentCustomers: undefined, // TODO: Get this from the backend,
    currentPizza: undefined,
    difficulty: 1,
  };

  get currentPizza(): Pizza | undefined {
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

  public async startGame(): Promise<void> {
    const instanceID = this._instanceID;

    if (!instanceID || this._model.game?.state.status !== 'WAITING_TO_START') {
      throw new Error('Game Not startable');
    }
    const response = await this._townController.sendInteractableCommand(this.id, {
      gameID: instanceID,
      type: 'StartGame',
    });
    this._updateFrom(response);
  }

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
      if (!_.isEqual(newGame, this._game)) {
        this._game = newGame.state;
        this.emit('gameChanged');
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
