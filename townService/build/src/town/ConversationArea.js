import InvalidParametersError from '../lib/InvalidParametersError';
import InteractableArea from './InteractableArea';
export default class ConversationArea extends InteractableArea {
    topic;
    get isActive() {
        return this._occupants.length > 0;
    }
    constructor({ topic, id }, coordinates, townEmitter) {
        super(id, coordinates, townEmitter);
        this.topic = topic;
    }
    remove(player) {
        super.remove(player);
        if (this._occupants.length === 0) {
            this.topic = undefined;
            this._emitAreaChanged();
        }
    }
    toModel() {
        return {
            id: this.id,
            occupants: this.occupantsByID,
            topic: this.topic,
            type: 'ConversationArea',
        };
    }
    static fromMapObject(mapObject, broadcastEmitter) {
        const { name, width, height } = mapObject;
        if (!width || !height) {
            throw new Error(`Malformed viewing area ${name}`);
        }
        const rect = { x: mapObject.x, y: mapObject.y, width, height };
        return new ConversationArea({ id: name, occupants: [] }, rect, broadcastEmitter);
    }
    handleCommand() {
        throw new InvalidParametersError('Unknown command type');
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVyc2F0aW9uQXJlYS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL0NvbnZlcnNhdGlvbkFyZWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxzQkFBc0IsTUFBTSwrQkFBK0IsQ0FBQztBQVNuRSxPQUFPLGdCQUFnQixNQUFNLG9CQUFvQixDQUFDO0FBRWxELE1BQU0sQ0FBQyxPQUFPLE9BQU8sZ0JBQWlCLFNBQVEsZ0JBQWdCO0lBRXJELEtBQUssQ0FBVTtJQUd0QixJQUFXLFFBQVE7UUFDakIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDcEMsQ0FBQztJQVNELFlBQ0UsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUF1QyxFQUNsRCxXQUF3QixFQUN4QixXQUF3QjtRQUV4QixLQUFLLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUNwQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQztJQUNyQixDQUFDO0lBVU0sTUFBTSxDQUFDLE1BQWM7UUFDMUIsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQixJQUFJLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQztZQUN2QixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztTQUN6QjtJQUNILENBQUM7SUFNTSxPQUFPO1FBQ1osT0FBTztZQUNMLEVBQUUsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUNYLFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYTtZQUM3QixLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUs7WUFDakIsSUFBSSxFQUFFLGtCQUFrQjtTQUN6QixDQUFDO0lBQ0osQ0FBQztJQVFNLE1BQU0sQ0FBQyxhQUFhLENBQ3pCLFNBQTBCLEVBQzFCLGdCQUE2QjtRQUU3QixNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBRyxTQUFTLENBQUM7UUFDMUMsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNyQixNQUFNLElBQUksS0FBSyxDQUFDLDBCQUEwQixJQUFJLEVBQUUsQ0FBQyxDQUFDO1NBQ25EO1FBQ0QsTUFBTSxJQUFJLEdBQWdCLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxDQUFDO1FBQzVFLE9BQU8sSUFBSSxnQkFBZ0IsQ0FBQyxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ25GLENBQUM7SUFFTSxhQUFhO1FBR2xCLE1BQU0sSUFBSSxzQkFBc0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0lBQzNELENBQUM7Q0FDRiJ9