import InvalidParametersError, { GAME_ID_MISSMATCH_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, INVALID_COMMAND_MESSAGE, } from '../../lib/InvalidParametersError';
import ConnectFourGame from './ConnectFourGame';
import GameArea from './GameArea';
export default class ConnectFourGameArea extends GameArea {
    getType() {
        return 'ConnectFourArea';
    }
    _stateUpdated(updatedState) {
        if (updatedState.state.status === 'OVER') {
            const gameID = this._game?.id;
            if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
                const { red, yellow } = updatedState.state;
                if (red && yellow) {
                    const redName = this._occupants.find(eachPlayer => eachPlayer.id === red)?.userName || red;
                    const yellowName = this._occupants.find(eachPlayer => eachPlayer.id === yellow)?.userName || yellow;
                    this._history.push({
                        gameID,
                        scores: {
                            [redName]: updatedState.state.winner === red ? 1 : 0,
                            [yellowName]: updatedState.state.winner === yellow ? 1 : 0,
                        },
                    });
                }
            }
        }
        this._emitAreaChanged();
    }
    handleCommand(command, player) {
        if (command.type === 'GameMove') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (this._game?.id !== command.gameID) {
                throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
            }
            if (command.move.gamePiece !== 'Red' && command.move.gamePiece !== 'Yellow') {
                throw new InvalidParametersError('Invalid game piece');
            }
            game.applyMove({
                gameID: command.gameID,
                playerID: player.id,
                move: command.move,
            });
            this._stateUpdated(game.toModel());
            return undefined;
        }
        if (command.type === 'JoinGame') {
            let game = this._game;
            if (!game || game.state.status === 'OVER') {
                game = new ConnectFourGame(this._game);
                this._game = game;
            }
            game.join(player);
            this._stateUpdated(game.toModel());
            return { gameID: game.id };
        }
        if (command.type === 'LeaveGame') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (this._game?.id !== command.gameID) {
                throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
            }
            game.leave(player);
            this._stateUpdated(game.toModel());
            return undefined;
        }
        if (command.type === 'StartGame') {
            const game = this._game;
            if (!game) {
                throw new InvalidParametersError(GAME_NOT_IN_PROGRESS_MESSAGE);
            }
            if (this._game?.id !== command.gameID) {
                throw new InvalidParametersError(GAME_ID_MISSMATCH_MESSAGE);
            }
            game.startGame(player);
            this._stateUpdated(game.toModel());
            return undefined;
        }
        throw new InvalidParametersError(INVALID_COMMAND_MESSAGE);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29ubmVjdEZvdXJHYW1lQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90b3duL2dhbWVzL0Nvbm5lY3RGb3VyR2FtZUFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxzQkFBc0IsRUFBRSxFQUM3Qix5QkFBeUIsRUFDekIsNEJBQTRCLEVBQzVCLHVCQUF1QixHQUN4QixNQUFNLGtDQUFrQyxDQUFDO0FBUzFDLE9BQU8sZUFBZSxNQUFNLG1CQUFtQixDQUFDO0FBQ2hELE9BQU8sUUFBUSxNQUFNLFlBQVksQ0FBQztBQVNsQyxNQUFNLENBQUMsT0FBTyxPQUFPLG1CQUFvQixTQUFRLFFBQXlCO0lBQzlELE9BQU87UUFDZixPQUFPLGlCQUFpQixDQUFDO0lBQzNCLENBQUM7SUFFTyxhQUFhLENBQUMsWUFBZ0Q7UUFDcEUsSUFBSSxZQUFZLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxNQUFNLEVBQUU7WUFFeEMsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDOUIsSUFBSSxNQUFNLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLEVBQUU7Z0JBQzdFLE1BQU0sRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztnQkFDM0MsSUFBSSxHQUFHLElBQUksTUFBTSxFQUFFO29CQUNqQixNQUFNLE9BQU8sR0FDWCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFFLEtBQUssR0FBRyxDQUFDLEVBQUUsUUFBUSxJQUFJLEdBQUcsQ0FBQztvQkFDN0UsTUFBTSxVQUFVLEdBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFD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