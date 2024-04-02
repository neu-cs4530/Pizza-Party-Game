import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import ViewingArea from './ViewingArea';
describe('ViewingArea', () => {
    const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
    let testArea;
    const townEmitter = mock();
    let newPlayer;
    const id = nanoid();
    const isPlaying = true;
    const elapsedTimeSec = 10;
    const video = nanoid();
    const occupants = [];
    beforeEach(() => {
        mockClear(townEmitter);
        testArea = new ViewingArea({ id, isPlaying, elapsedTimeSec, video, occupants }, testAreaBox, townEmitter);
        newPlayer = new Player(nanoid(), mock());
        testArea.add(newPlayer);
    });
    describe('remove', () => {
        it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
            const extraPlayer = new Player(nanoid(), mock());
            testArea.add(extraPlayer);
            testArea.remove(newPlayer);
            expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
            const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                id,
                isPlaying,
                elapsedTimeSec,
                video,
                occupants: [extraPlayer.id],
                type: 'ViewingArea',
            });
        });
        it("Clears the player's conversationLabel and emits an update for their location", () => {
            testArea.remove(newPlayer);
            expect(newPlayer.location.interactableID).toBeUndefined();
            const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toBeUndefined();
        });
        it('Clears the video property when the last occupant leaves', () => {
            testArea.remove(newPlayer);
            const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                id,
                isPlaying,
                elapsedTimeSec,
                video: undefined,
                occupants: [],
                type: 'ViewingArea',
            });
            expect(testArea.video).toBeUndefined();
        });
    });
    describe('add', () => {
        it('Adds the player to the occupants list', () => {
            expect(testArea.occupantsByID).toEqual([newPlayer.id]);
        });
        it("Sets the player's conversationLabel and emits an update for their location", () => {
            expect(newPlayer.location.interactableID).toEqual(id);
            const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toEqual(id);
        });
    });
    test('toModel sets the ID, video, isPlaying, occupants, and elapsedTimeSec', () => {
        const model = testArea.toModel();
        expect(model).toEqual({
            id,
            video,
            elapsedTimeSec,
            isPlaying,
            occupants: [newPlayer.id],
            type: 'ViewingArea',
        });
    });
    test('updateModel sets video, isPlaying and elapsedTimeSec', () => {
        testArea.updateModel({
            id: 'ignore',
            isPlaying: false,
            elapsedTimeSec: 150,
            video: 'test2',
            occupants: [],
            type: 'ViewingArea',
        });
        expect(testArea.isPlaying).toBe(false);
        expect(testArea.id).toBe(id);
        expect(testArea.elapsedTimeSec).toBe(150);
        expect(testArea.video).toBe('test2');
    });
    describe('fromMapObject', () => {
        it('Throws an error if the width or height are missing', () => {
            expect(() => ViewingArea.fromMapObject({ id: 1, name: nanoid(), visible: true, x: 0, y: 0 }, townEmitter)).toThrowError();
        });
        it('Creates a new viewing area using the provided boundingBox and id, with isPlaying defaulting to false and progress to 0, and emitter', () => {
            const x = 30;
            const y = 20;
            const width = 10;
            const height = 20;
            const name = 'name';
            const val = ViewingArea.fromMapObject({ x, y, width, height, name, id: 10, visible: true }, townEmitter);
            expect(val.boundingBox).toEqual({ x, y, width, height });
            expect(val.id).toEqual(name);
            expect(val.isPlaying).toEqual(false);
            expect(val.elapsedTimeSec).toEqual(0);
            expect(val.video).toBeUndefined();
            expect(val.occupantsByID).toEqual([]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVmlld2luZ0FyZWEudGVzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1ZpZXdpbmdBcmVhLnRlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBQ2hDLE9BQU8sTUFBTSxNQUFNLGVBQWUsQ0FBQztBQUNuQyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFFbkQsT0FBTyxXQUFXLE1BQU0sZUFBZSxDQUFDO0FBRXhDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsR0FBRyxFQUFFO0lBQzNCLE1BQU0sV0FBVyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxDQUFDO0lBQ2hFLElBQUksUUFBcUIsQ0FBQztJQUMxQixNQUFNLFdBQVcsR0FBRyxJQUFJLEVBQWUsQ0FBQztJQUN4QyxJQUFJLFNBQWlCLENBQUM7SUFDdEIsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDcEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQ3ZCLE1BQU0sY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUMxQixNQUFNLEtBQUssR0FBRyxNQUFNLEVBQUUsQ0FBQztJQUN2QixNQUFNLFNBQVMsR0FBZSxFQUFFLENBQUM7SUFFakMsVUFBVSxDQUFDLEdBQUcsRUFBRTtRQUNkLFNBQVMsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUN2QixRQUFRLEdBQUcsSUFBSSxXQUFXLENBQ3hCLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxFQUNuRCxXQUFXLEVBQ1gsV0FBVyxDQUNaLENBQUM7UUFD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