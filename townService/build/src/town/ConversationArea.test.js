import { mock, mockClear } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import Player from '../lib/Player';
import { getLastEmittedEvent } from '../TestUtils';
import ConversationArea from './ConversationArea';
describe('ConversationArea', () => {
    const testAreaBox = { x: 100, y: 100, width: 100, height: 100 };
    let testArea;
    const townEmitter = mock();
    const topic = nanoid();
    const id = nanoid();
    let newPlayer;
    beforeEach(() => {
        mockClear(townEmitter);
        testArea = new ConversationArea({ topic, id, occupants: [] }, testAreaBox, townEmitter);
        newPlayer = new Player(nanoid(), mock());
        testArea.add(newPlayer);
    });
    describe('add', () => {
        it('Adds the player to the occupants list and emits an interactableUpdate event', () => {
            expect(testArea.occupantsByID).toEqual([newPlayer.id]);
            const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                topic,
                id,
                occupants: [newPlayer.id],
                type: 'ConversationArea',
            });
        });
        it("Sets the player's conversationLabel and emits an update for their location", () => {
            expect(newPlayer.location.interactableID).toEqual(id);
            const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toEqual(id);
        });
    });
    describe('remove', () => {
        it('Removes the player from the list of occupants and emits an interactableUpdate event', () => {
            const extraPlayer = new Player(nanoid(), mock());
            testArea.add(extraPlayer);
            testArea.remove(newPlayer);
            expect(testArea.occupantsByID).toEqual([extraPlayer.id]);
            const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                topic,
                id,
                occupants: [extraPlayer.id],
                type: 'ConversationArea',
            });
        });
        it("Clears the player's conversationLabel and emits an update for their location", () => {
            testArea.remove(newPlayer);
            expect(newPlayer.location.interactableID).toBeUndefined();
            const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
            expect(lastEmittedMovement.location.interactableID).toBeUndefined();
        });
        it('Clears the topic of the conversation area when the last occupant leaves', () => {
            testArea.remove(newPlayer);
            const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
            expect(lastEmittedUpdate).toEqual({
                topic: undefined,
                id,
                occupants: [],
                type: 'ConversationArea',
            });
            expect(testArea.topic).toBeUndefined();
        });
    });
    test('toModel sets the ID, topic and occupants and sets no other properties', () => {
        const model = testArea.toModel();
        expect(model).toEqual({
            id,
            topic,
            occupants: [newPlayer.id],
            type: 'ConversationArea',
        });
    });
    describe('fromMapObject', () => {
        it('Throws an error if the width or height are missing', () => {
            expect(() => ConversationArea.fromMapObject({ id: 1, name: nanoid(), visible: true, x: 0, y: 0 }, townEmitter)).toThrowError();
        });
        it('Creates a new conversation area using the provided boundingBox and id, with an empty occupants list', () => {
            const x = 30;
            const y = 20;
            const width = 10;
            const height = 20;
            const name = 'name';
            const val = ConversationArea.fromMapObject({ x, y, width, height, name, id: 10, visible: true }, townEmitter);
            expect(val.boundingBox).toEqual({ x, y, width, height });
            expect(val.id).toEqual(name);
            expect(val.topic).toBeUndefined();
            expect(val.occupantsByID).toEqual([]);
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ29udmVyc2F0aW9uQXJlYS50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vQ29udmVyc2F0aW9uQXJlYS50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDckQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUNoQyxPQUFPLE1BQU0sTUFBTSxlQUFlLENBQUM7QUFDbkMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sY0FBYyxDQUFDO0FBRW5ELE9BQU8sZ0JBQWdCLE1BQU0sb0JBQW9CLENBQUM7QUFFbEQsUUFBUSxDQUFDLGtCQUFrQixFQUFFLEdBQUcsRUFBRTtJQUNoQyxNQUFNLFdBQVcsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQztJQUNoRSxJQUFJLFFBQTBCLENBQUM7SUFDL0IsTUFBTSxXQUFXLEdBQUcsSUFBSSxFQUFlLENBQUM7SUFDeEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDdkIsTUFBTSxFQUFFLEdBQUcsTUFBTSxFQUFFLENBQUM7SUFDcEIsSUFBSSxTQUFpQixDQUFDO0lBRXRCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDZCxTQUFTLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDdkIsUUFBUSxHQUFHLElBQUksZ0JBQWdCLENBQUMsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsRUFBRSxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDeEYsU0FBUyxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sRUFBRSxFQUFFLElBQUksRUFBZSxDQUFDLENBQUM7UUFDdEQsUUFBUSxDQUFDLEdBQUcsQ0FB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