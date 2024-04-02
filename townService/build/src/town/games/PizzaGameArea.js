import InvalidParametersError, { GAME_ID_MISSMATCH_MESSAGE, GAME_NOT_IN_PROGRESS_MESSAGE, INVALID_COMMAND_MESSAGE, } from '../../lib/InvalidParametersError';
import PizzaPartyGame from './PizzaGame';
import GameArea from './GameArea';
export default class PizzaPartyGameArea extends GameArea {
    getType() {
        return 'PizzaPartyGameArea';
    }
    _stateUpdated(updatedState) {
        if (updatedState.state.status === 'OVER') {
            const gameID = this._game?.id;
            if (gameID && !this._history.find(eachResult => eachResult.gameID === gameID)) {
                const { player } = updatedState.state;
                if (player) {
                    const playerName = this._occupants.find(eachPlayer => eachPlayer.id === player)?.userName || player;
                    this._history.push({
                        gameID,
                        scores: {
                            [playerName]: updatedState.state.winner === player
                                ? this.game?.state.currentScore
                                : 0,
                        },
                    });
                }
            }
        }
        this._emitAreaChanged();
    }
    handleCommand(command, player) {
        if (command.type === 'JoinGame') {
            let game = this._game;
            if (!game || game.state.status === 'OVER') {
                game = new PizzaPartyGame();
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGl6emFHYW1lQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy90b3duL2dhbWVzL1BpenphR2FtZUFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxzQkFBc0IsRUFBRSxFQUM3Qix5QkFBeUIsRUFDekIsNEJBQTRCLEVBQzVCLHVCQUF1QixHQUN4QixNQUFNLGtDQUFrQyxDQUFDO0FBUzFDLE9BQU8sY0FBYyxNQUFNLGFBQWEsQ0FBQztBQUN6QyxPQUFPLFFBQVEsTUFBTSxZQUFZLENBQUM7QUFTbEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxrQkFBbUIsU0FBUSxRQUF3QjtJQUM1RCxPQUFPO1FBQ2YsT0FBTyxvQkFBb0IsQ0FBQztJQUM5QixDQUFDO0lBRU8sYUFBYSxDQUFDLFlBQStDO1FBQ25FLElBQUksWUFBWSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO1lBRXhDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzlCLElBQUksTUFBTSxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxFQUFFO2dCQUM3RSxNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztnQkFDdEMsSUFBSSxNQUFNLEVBQUU7b0JBQ1YsTUFBTSxVQUFVLEdBQ2QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU0sQ0FBQyxFQUFFLFFBQVEsSUFBSSxNQUFNLENBQUM7b0JBQ25GLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO3dCQUNqQixNQUFNO3dCQUNOLE1BQU0sRUFBRTs0QkFDTixDQUFDLFVBQVUsQ0FBQyxFQUNWLFlBQVksQ0FBQyxLQUFLLENBQUMsTUFBTSxLQUFLLE1BQU07Z0NBQ2xDLENBQUMsQ0FBRSxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxZQUF1QjtnQ0FDM0MsQ0FBQyxDQUFDLENBQUM7eUJBQ1I7cUJBQ0YsQ0FBQyxDQUFDO2lCQUNKO2FBQ0Y7U0FDRjtRQUNELElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0lBQzFCLENBQUM7SUF5Qk0sYUFBYSxDQUNsQixPQUFvQixFQUNwQixNQUFjO1FBRWQsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFVBQVUsRUFBRTtZQUMvQixJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3RCLElBQUksQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEtBQUssTUFBTSxFQUFFO2dCQUV6QyxJQUFJLEdBQUcsSUFBSSxjQUFjLEVBQUUsQ0FBQztnQkFDNUIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7YUFDbkI7WUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7WUFDbkMsT0FBTyxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFnRCxDQUFDO1NBQzFFO1FBQ0QsSUFBSSxPQUFPLENBQUMsSUFBSSxLQUFLLFdBQVcsRUFBRTtZQUNoQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxJQUFJLEVBQUU7Z0JBQ1QsTUFBTSxJQUFJLHNCQUFzQixDQUFDLDRCQUE0QixDQUFDLENBQUM7YUFDaEU7WUFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxLQUFLLE9BQU8sQ0FBQyxNQUFNLEVBQUU7Z0JBQ3JDLE1BQU0sSUFBSSxzQkFBc0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO2FBQzdEO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDO1lBQ25DLE9BQU8sU0FBdUQsQ0FBQztTQUNoRTtRQUNELElBQUksT0FBTyxDQUFDLElBQUksS0FBSyxXQUFXLEVBQUU7WUFDaEMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUN4QixJQUFJLENBQUMsSUFBSSxFQUFFO2dCQUNULE1BQU0sSUFBSSxzQkFBc0IsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDO2FBQ2hFO1lBQ0QsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxPQUFPLENBQUMsTUFBTSxFQUFFO2dCQUNyQyxNQUFNLElBQUksc0JBQXNCLENBQUMseUJBQXlCLENBQUMsQ0FBQzthQUM3RDtZQUNELElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDdkIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztZQUNuQyxPQUFPLFNBQXVELENBQUM7U0FDaEU7UUFDRCxNQUFNLElBQUksc0JBQXNCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUM1RCxDQUFDO0NBQ0YifQ==