import InvalidParametersError from '../lib/InvalidParametersError';
import InteractableArea from './InteractableArea';
export default class ViewingArea extends InteractableArea {
    _video;
    _isPlaying;
    _elapsedTimeSec;
    get video() {
        return this._video;
    }
    get elapsedTimeSec() {
        return this._elapsedTimeSec;
    }
    get isPlaying() {
        return this._isPlaying;
    }
    constructor({ id, isPlaying, elapsedTimeSec: progress, video }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this._video = video;
        this._elapsedTimeSec = progress;
        this._isPlaying = isPlaying;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this._video = undefined;
            this._emitAreaChanged();
        }
    }
    updateModel({ isPlaying, elapsedTimeSec: progress, video }) {
        this._video = video;
        this._isPlaying = isPlaying;
        this._elapsedTimeSec = progress;
    }
    toModel() {
        return {
            id: this.id,
            video: this._video,
            isPlaying: this._isPlaying,
            elapsedTimeSec: this._elapsedTimeSec,
            occupants: this.occupantsByID,
            type: 'ViewingArea',
        };
    }
    static fromMapObject(mapObject, townEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new ViewingArea({ isPlaying: false, id: name, elapsedTimeSec: 0, occupants: [] }, rect, townEmitter);
    }
    handleCommand(command) {
        if (command.type === 'ViewingAreaUpdate') {
            const viewingArea = command;
            this.updateModel(viewingArea.update);
            return {};
        }
        throw new InvalidParametersError('Unknown command type');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld2luZ0FyZWEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG93bi9WaWV3aW5nQXJlYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLHNCQUFzQixNQUFNLCtCQUErQixDQUFDO0FBV25FLE9BQU8sZ0JBQWdCLE1BQU0sb0JBQW9CLENBQUM7QUFFbEQsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFZLFNBQVEsZ0JBQWdCO0lBQy9DLE1BQU0sQ0FBVTtJQUVoQixVQUFVLENBQVU7SUFFcEIsZUFBZSxDQUFTO0lBRWhDLElBQVcsS0FBSztRQUNkLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQztJQUNyQixDQUFDO0lBRUQsSUFBVyxjQUFjO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQztJQUM5QixDQUFDO0lBRUQsSUFBVyxTQUFTO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUN6QixDQUFDO0lBU0QsWUFDRSxFQUFFLEVBQUUsRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQWtDLEVBQ2xGLFdBQXdCLEVBQ3hCLFdBQXdCO1FBRXhCLEtBQUssQ0FBQyxFQUFFLEVBQUUsV0FBVyxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBQ3BDLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO1FBQ3BCLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDO1FBQ2hDLElBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0lBQzlCLENBQUM7SUFVTSxNQUFNLENBQUMsTUFBYztRQUMxQixLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JCLElBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLElBQUksQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDO1lBQ3hCLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO1NBQ3pCO0lBQ0gsQ0FBQztJQU9NLFdBQVcsQ0FBQyxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBb0I7UUFDakYsSUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7UUFDcEIsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7UUFDNUIsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUM7SUFDbEMsQ0FBQztJQU1NLE9BQU87UUFDWixPQUFPO1lBQ0wsRUFBRSxFQUFFLElBQUksQ0FBQyxFQUFFO1lBQ1gsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNO1lBQ2xCLFNBQVMsRUFBRSxJQUFJLENBQUMsVUFBVTtZQUMxQixjQUFjLEVBQUUsSUFBSSxDQUFDLGVBQWU7WUFDcEMsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQzdCLElBQUksRUFBRSxhQUFhO1NBQ3BCLENBQUM7SUFDSixDQUFDO0lBUU0sTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUEwQixFQUFFLFdBQXdCO1FBQzlFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFHLFNBQVMsQ0FBQztRQUMxQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsTUFBTSxFQUFFO1lBQ3JCLE1BQU0sSUFBSSxLQUFLLENBQUMsMEJBQTBCLElBQUksRUFBRSxDQUFDLENBQUM7U0FDbkQ7UUFDRCxNQUFNLElBQUksR0FBZ0IsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLENBQUM7UUFDNUUsT0FBTyxJQUFJLFdBQVcsQ0FDcEIsRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxJQUFzQixFQUFFLGNBQWMsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUNsRixJQUFJLEVBQ0osV0FBVyxDQUNaLENBQUM7SUFDSixDQUFDO0lBRU0sYUFBYSxDQUNsQixPQUFvQjtRQUVwQixJQUFJLE9BQU8sQ0FBQyxJQUFJLEtBQUssbUJBQW1CLEVBQUU7WUFDeEMsTUFBTSxXQUFXLEdBQUcsT0FBbUMsQ0FBQztZQUN4RCxJQUFJLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxPQUFPLEVBQWdELENBQUM7U0FDekQ7UUFDRCxNQUFNLElBQUksc0JBQXNCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztJQUMzRCxDQUFDO0NBQ0YifQ==