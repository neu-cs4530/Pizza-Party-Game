import { PLAYER_NOT_IN_GAME_MESSAGE, } from '../../lib/InvalidParametersError';
import InteractableArea from '../InteractableArea';
export default class GameArea extends InteractableArea {
    _game;
    _history = [];
    get game() {
        return this._game;
    }
    get history() {
        return this._history;
    }
    toModel() {
        return {
            id: this.id,
            game: this._game?.toModel(),
            history: this._history,
            occupants: this.occupantsByID,
            type: this.getType(),
        };
    }
    get isActive() {
        return true;
    }
    remove(player) {
        if (this._game) {
            try {
                this._game.leave(player);
            }
            catch (e) {
                if (e.message === PLAYER_NOT_IN_GAME_MESSAGE) {
                }
                else {
                    throw e;
                }
            }
        }
        super.remove(player);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiR2FtZUFyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi9zcmMvdG93bi9nYW1lcy9HYW1lQXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUErQixFQUM3QiwwQkFBMEIsR0FDM0IsTUFBTSxrQ0FBa0MsQ0FBQztBQVExQyxPQUFPLGdCQUFnQixNQUFNLHFCQUFxQixDQUFDO0FBT25ELE1BQU0sQ0FBQyxPQUFPLE9BQWdCLFFBRTVCLFNBQVEsZ0JBQWdCO0lBQ2QsS0FBSyxDQUFZO0lBRWpCLFFBQVEsR0FBaUIsRUFBRSxDQUFDO0lBRXRDLElBQVcsSUFBSTtRQUNiLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQsSUFBVyxPQUFPO1FBQ2hCLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUN2QixDQUFDO0lBRU0sT0FBTztRQUNaLE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEVBQUU7WUFDWCxJQUFJLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUU7WUFDM0IsT0FBTyxFQUFFLElBQUksQ0FBQyxRQUFRO1lBQ3RCLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUM3QixJQUFJLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRTtTQUNyQixDQUFDO0lBQ0osQ0FBQztJQUVELElBQVcsUUFBUTtRQUNqQixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFJTSxNQUFNLENBQUMsTUFBYztRQUMxQixJQUFJLElBQUksQ0FBQyxLQUFLLEVBQUU7WUFDZCxJQUFJO2dCQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQzFCO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1YsSUFBSyxDQUE0QixDQUFDLE9BQU8sS0FBSywwQkFBMEIsRUFBRTtpQkFFekU7cUJBQU07b0JBQ0wsTUFBTSxDQUFDLENBQUM7aUJBQ1Q7YUFDRjtTQUNGO1FBQ0QsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUN2QixDQUFDO0NBQ0YifQ==