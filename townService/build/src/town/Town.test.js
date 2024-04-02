import { mockClear, mockDeep, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TwilioVideo from '../lib/TwilioVideo';
import { expectArraysToContainSameMembers, getEventListener, getLastEmittedEvent, mockPlayer, } from '../TestUtils';
import Town from './Town';
const mockTwilioVideo = mockDeep();
jest.spyOn(TwilioVideo, 'getInstance').mockReturnValue(mockTwilioVideo);
const testingMaps = {
    twoConv: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    overlapping: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 40,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    noObjects: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [],
    },
    duplicateNames: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoConvOneViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 54,
                        name: 'Name3',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 155,
                        y: 566,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
    twoConvTwoViewing: {
        tiledversion: '1.9.0',
        tileheight: 32,
        tilesets: [],
        tilewidth: 32,
        type: 'map',
        layers: [
            {
                id: 4,
                name: 'Objects',
                objects: [
                    {
                        type: 'ConversationArea',
                        height: 237,
                        id: 39,
                        name: 'Name1',
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 40,
                        y: 120,
                    },
                    {
                        type: 'ConversationArea',
                        height: 266,
                        id: 43,
                        name: 'Name2',
                        rotation: 0,
                        visible: true,
                        width: 467,
                        x: 612,
                        y: 120,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 54,
                        name: 'Name3',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 155,
                        y: 566,
                    },
                    {
                        type: 'ViewingArea',
                        height: 237,
                        id: 55,
                        name: 'Name4',
                        properties: [
                            {
                                name: 'video',
                                type: 'string',
                                value: 'someURL',
                            },
                        ],
                        rotation: 0,
                        visible: true,
                        width: 326,
                        x: 600,
                        y: 1200,
                    },
                ],
                opacity: 1,
                type: 'objectgroup',
                visible: true,
                x: 0,
                y: 0,
            },
        ],
    },
};
describe('Town', () => {
    const townEmitter = mockDeep();
    let town;
    let player;
    let playerTestData;
    let playerID;
    beforeEach(async () => {
        town = new Town(nanoid(), false, nanoid(), townEmitter);
        playerTestData = mockPlayer(town.townID);
        player = await town.addPlayer(playerTestData.userName, playerTestData.socket);
        playerTestData.player = player;
        playerID = player.id;
        playerTestData.moveTo(-1, -1);
        mockReset(townEmitter);
    });
    it('constructor should set its properties', () => {
        const townName = `FriendlyNameTest-${nanoid()}`;
        const townID = nanoid();
        const testTown = new Town(townName, true, townID, townEmitter);
        expect(testTown.friendlyName).toBe(townName);
        expect(testTown.townID).toBe(townID);
        expect(testTown.isPubliclyListed).toBe(true);
    });
    describe('addPlayer', () => {
        it('should use the townID and player ID properties when requesting a video token', async () => {
            const newPlayer = mockPlayer(town.townID);
            mockTwilioVideo.getTokenForTown.mockClear();
            const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
            expect(mockTwilioVideo.getTokenForTown).toBeCalledTimes(1);
            expect(mockTwilioVideo.getTokenForTown).toBeCalledWith(town.townID, newPlayerObj.id);
        });
        it('should register callbacks for all client-to-server events', () => {
            const expectedEvents = [
                'disconnect',
                'chatMessage',
                'playerMovement',
                'interactableUpdate',
            ];
            expectedEvents.forEach(eachEvent => expect(getEventListener(playerTestData.socket, eachEvent)).toBeDefined());
        });
        describe('[T1] interactableUpdate callback', () => {
            let interactableUpdateHandler;
            beforeEach(() => {
                town.initializeFromMap(testingMaps.twoConvTwoViewing);
                interactableUpdateHandler = getEventListener(playerTestData.socket, 'interactableUpdate');
            });
            it('Should not throw an error for any interactable area that is not a viewing area', () => {
                expect(() => interactableUpdateHandler({
                    id: 'Name1',
                    topic: nanoid(),
                    occupantsByID: [],
                })).not.toThrowError();
            });
            it('Should not throw an error if there is no such viewing area', () => {
                expect(() => interactableUpdateHandler({
                    id: 'NotActuallyAnInteractable',
                    topic: nanoid(),
                    occupantsByID: [],
                })).not.toThrowError();
            });
            describe('When called passing a valid viewing area', () => {
                let newArea;
                let secondPlayer;
                beforeEach(async () => {
                    newArea = {
                        id: 'Name4',
                        elapsedTimeSec: 0,
                        isPlaying: true,
                        video: nanoid(),
                        occupants: [],
                        type: 'ViewingArea',
                    };
                    expect(town.addViewingArea(newArea)).toBe(true);
                    secondPlayer = mockPlayer(town.townID);
                    mockTwilioVideo.getTokenForTown.mockClear();
                    await town.addPlayer(secondPlayer.userName, secondPlayer.socket);
                    newArea.elapsedTimeSec = 100;
                    newArea.isPlaying = false;
                    mockClear(townEmitter);
                    mockClear(secondPlayer.socket);
                    mockClear(secondPlayer.socketToRoomMock);
                    interactableUpdateHandler(newArea);
                });
                it("Should emit the interactable update to the other players in the town using the player's townEmitter, after the viewing area was successfully created", () => {
                    const updatedArea = town.getInteractable(newArea.id);
                    expect(updatedArea.toModel()).toEqual(newArea);
                });
                it('Should update the model for the viewing area', () => {
                    const lastUpdate = getLastEmittedEvent(playerTestData.socketToRoomMock, 'interactableUpdate');
                    expect(lastUpdate).toEqual(newArea);
                });
                it('Should not emit interactableUpdate events to players directly, or to the whole town', () => {
                    expect(() => getLastEmittedEvent(playerTestData.socket, 'interactableUpdate')).toThrowError();
                    expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
                    expect(() => getLastEmittedEvent(secondPlayer.socket, 'interactableUpdate')).toThrowError();
                    expect(() => getLastEmittedEvent(secondPlayer.socketToRoomMock, 'interactableUpdate')).toThrowError();
                });
            });
        });
    });
    describe('Socket event listeners created in addPlayer', () => {
        describe('on socket disconnect', () => {
            function disconnectPlayer(playerToLeave) {
                const disconnectHandler = getEventListener(playerToLeave.socket, 'disconnect');
                disconnectHandler('unknown');
            }
            it("Invalidates the players's session token", async () => {
                const token = player.sessionToken;
                expect(town.getPlayerBySessionToken(token)).toBe(player);
                disconnectPlayer(playerTestData);
                expect(town.getPlayerBySessionToken(token)).toEqual(undefined);
            });
            it('Informs all other players of the disconnection using the broadcast emitter', () => {
                const playerToLeaveID = player.id;
                disconnectPlayer(playerTestData);
                const callToDisconnect = getLastEmittedEvent(townEmitter, 'playerDisconnect');
                expect(callToDisconnect.id).toEqual(playerToLeaveID);
            });
            it('Removes the player from any active conversation area', () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(45, 122);
                expect(town.addConversationArea({
                    id: 'Name1',
                    topic: 'test',
                    occupants: [],
                    type: 'ConversationArea',
                })).toBeTruthy();
                const convArea = town.getInteractable('Name1');
                expect(convArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(convArea.occupantsByID).toEqual([]);
                expect(town.occupancy).toBe(0);
            });
            it('Removes the player from any active viewing area', () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(156, 567);
                expect(town.addViewingArea({
                    id: 'Name3',
                    isPlaying: true,
                    elapsedTimeSec: 0,
                    video: nanoid(),
                    occupants: [],
                    type: 'ViewingArea',
                })).toBeTruthy();
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.occupantsByID).toEqual([player.id]);
                disconnectPlayer(playerTestData);
                expect(viewingArea.occupantsByID).toEqual([]);
            });
        });
        describe('playerMovement', () => {
            const newLocation = {
                x: 100,
                y: 100,
                rotation: 'back',
                moving: true,
            };
            beforeEach(() => {
                playerTestData.moveTo(newLocation.x, newLocation.y, newLocation.rotation, newLocation.moving);
            });
            it('Emits a playerMoved event', () => {
                const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
                expect(lastEmittedMovement.id).toEqual(playerTestData.player?.id);
                expect(lastEmittedMovement.location).toEqual(newLocation);
            });
            it("Updates the player's location", () => {
                expect(player.location).toEqual(newLocation);
            });
        });
        describe('interactableUpdate', () => {
            let interactableUpdateCallback;
            let update;
            beforeEach(async () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(156, 567);
                interactableUpdateCallback = getEventListener(playerTestData.socket, 'interactableUpdate');
                update = {
                    id: 'Name3',
                    isPlaying: true,
                    elapsedTimeSec: 100,
                    video: nanoid(),
                    occupants: [],
                    type: 'ViewingArea',
                };
                interactableUpdateCallback(update);
            });
            it('forwards updates to others in the town', () => {
                const lastEvent = getLastEmittedEvent(playerTestData.socketToRoomMock, 'interactableUpdate');
                expect(lastEvent).toEqual(update);
            });
            it('does not forward updates to the ENTIRE town', () => {
                expect(() => getLastEmittedEvent(townEmitter, 'interactableUpdate')).toThrowError();
            });
            it('updates the local model for that interactable', () => {
                const interactable = town.getInteractable(update.id);
                expect(interactable?.toModel()).toEqual(update);
            });
        });
        it('Forwards chat messages to all players in the same town', async () => {
            const chatHandler = getEventListener(playerTestData.socket, 'chatMessage');
            const chatMessage = {
                author: player.id,
                body: 'Test message',
                dateCreated: new Date(),
                sid: 'test message id',
            };
            chatHandler(chatMessage);
            const emittedMessage = getLastEmittedEvent(townEmitter, 'chatMessage');
            expect(emittedMessage).toEqual(chatMessage);
        });
    });
    describe('addConversationArea', () => {
        beforeEach(async () => {
            town.initializeFromMap(testingMaps.twoConvOneViewing);
        });
        it('Should return false if no area exists with that ID', () => {
            expect(town.addConversationArea({
                id: nanoid(),
                topic: nanoid(),
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
        });
        it('Should return false if the requested topic is empty', () => {
            expect(town.addConversationArea({
                id: 'Name1',
                topic: '',
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
            expect(town.addConversationArea({
                id: 'Name1',
                topic: undefined,
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
        });
        it('Should return false if the area already has a topic', () => {
            expect(town.addConversationArea({
                id: 'Name1',
                topic: 'new topic',
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(true);
            expect(town.addConversationArea({
                id: 'Name1',
                topic: 'new new topic',
                occupants: [],
                type: 'ConversationArea',
            })).toEqual(false);
        });
        describe('When successful', () => {
            const newTopic = 'new topic';
            beforeEach(() => {
                playerTestData.moveTo(45, 122);
                expect(town.addConversationArea({
                    id: 'Name1',
                    topic: newTopic,
                    occupants: [],
                    type: 'ConversationArea',
                })).toEqual(true);
            });
            it('Should update the local model for that area', () => {
                const convArea = town.getInteractable('Name1');
                expect(convArea.topic).toEqual(newTopic);
            });
            it('Should include any players in that area as occupants', () => {
                const convArea = town.getInteractable('Name1');
                expect(convArea.occupantsByID).toEqual([player.id]);
            });
            it('Should emit an interactableUpdate message', () => {
                const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                expect(lastEmittedUpdate).toEqual({
                    id: 'Name1',
                    topic: newTopic,
                    occupants: [player.id],
                    type: 'ConversationArea',
                });
            });
        });
    });
    describe('[T1] addViewingArea', () => {
        beforeEach(async () => {
            town.initializeFromMap(testingMaps.twoConvOneViewing);
        });
        it('Should return false if no area exists with that ID', () => {
            expect(town.addViewingArea({
                id: nanoid(),
                isPlaying: false,
                elapsedTimeSec: 0,
                video: nanoid(),
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
        });
        it('Should return false if the requested video is empty', () => {
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: '',
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: undefined,
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
        });
        it('Should return false if the area is already active', () => {
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: 'test',
                occupants: [],
                type: 'ViewingArea',
            })).toBe(true);
            expect(town.addViewingArea({
                id: 'Name3',
                isPlaying: false,
                elapsedTimeSec: 0,
                video: 'test2',
                occupants: [],
                type: 'ViewingArea',
            })).toBe(false);
        });
        describe('When successful', () => {
            const newModel = {
                id: 'Name3',
                isPlaying: true,
                elapsedTimeSec: 100,
                video: nanoid(),
                occupants: [playerID],
                type: 'ViewingArea',
            };
            beforeEach(() => {
                playerTestData.moveTo(160, 570);
                expect(town.addViewingArea(newModel)).toBe(true);
                newModel.occupants = [playerID];
            });
            it('Should update the local model for that area', () => {
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.toModel()).toEqual(newModel);
            });
            it('Should emit an interactableUpdate message', () => {
                const lastEmittedUpdate = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                expect(lastEmittedUpdate).toEqual(newModel);
            });
            it('Should include any players in that area as occupants', () => {
                const viewingArea = town.getInteractable('Name3');
                expect(viewingArea.occupantsByID).toEqual([player.id]);
            });
        });
    });
    describe('disconnectAllPlayers', () => {
        beforeEach(() => {
            town.disconnectAllPlayers();
        });
        it('Should emit the townClosing event', () => {
            getLastEmittedEvent(townEmitter, 'townClosing');
        });
        it("Should disconnect each players's socket", () => {
            expect(playerTestData.socket.disconnect).toBeCalledWith(true);
        });
    });
    describe('initializeFromMap', () => {
        const expectInitializingFromMapToThrowError = (map) => {
            expect(() => town.initializeFromMap(map)).toThrowError();
        };
        it('Throws an error if there is no layer called "objects"', async () => {
            expectInitializingFromMapToThrowError(testingMaps.noObjects);
        });
        it('Throws an error if there are duplicate interactable object IDs', async () => {
            expectInitializingFromMapToThrowError(testingMaps.duplicateNames);
        });
        it('Throws an error if there are overlapping objects', async () => {
            expectInitializingFromMapToThrowError(testingMaps.overlapping);
        });
        it('Creates a ConversationArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoConv);
            const conv1 = town.getInteractable('Name1');
            const conv2 = town.getInteractable('Name2');
            expect(conv1.id).toEqual('Name1');
            expect(conv1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(conv2.id).toEqual('Name2');
            expect(conv2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        it('Creates a ViewingArea instance for each region on the map', async () => {
            town.initializeFromMap(testingMaps.twoViewing);
            const viewingArea1 = town.getInteractable('Name1');
            const viewingArea2 = town.getInteractable('Name2');
            expect(viewingArea1.id).toEqual('Name1');
            expect(viewingArea1.boundingBox).toEqual({ x: 40, y: 120, height: 237, width: 326 });
            expect(viewingArea2.id).toEqual('Name2');
            expect(viewingArea2.boundingBox).toEqual({ x: 612, y: 120, height: 266, width: 467 });
            expect(town.interactables.length).toBe(2);
        });
        describe('Updating interactable state in playerMovements', () => {
            beforeEach(async () => {
                town.initializeFromMap(testingMaps.twoConvOneViewing);
                playerTestData.moveTo(51, 121);
                expect(town.addConversationArea({
                    id: 'Name1',
                    topic: 'test',
                    occupants: [],
                    type: 'ViewingArea',
                })).toBe(true);
            });
            it('Adds a player to a new interactable and sets their conversation label, if they move into it', async () => {
                const newPlayer = mockPlayer(town.townID);
                const newPlayerObj = await town.addPlayer(newPlayer.userName, newPlayer.socket);
                newPlayer.moveTo(51, 121);
                expect(newPlayerObj.location.interactableID).toEqual('Name1');
                const lastEmittedMovement = getLastEmittedEvent(townEmitter, 'playerMoved');
                expect(lastEmittedMovement.location.interactableID).toEqual('Name1');
                const occupants = town.getInteractable('Name1').occupantsByID;
                expectArraysToContainSameMembers(occupants, [newPlayerObj.id, player.id]);
            });
            it('Removes a player from their prior interactable and sets their conversation label, if they moved outside of it', () => {
                expect(player.location.interactableID).toEqual('Name1');
                playerTestData.moveTo(0, 0);
                expect(player.location.interactableID).toBeUndefined();
            });
        });
    });
    describe('Updating town settings', () => {
        it('Emits townSettingsUpdated events when friendlyName changes', async () => {
            const newFriendlyName = nanoid();
            town.friendlyName = newFriendlyName;
            expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
                friendlyName: newFriendlyName,
            });
        });
        it('Emits townSettingsUpdated events when isPubliclyListed changes', async () => {
            const expected = !town.isPubliclyListed;
            town.isPubliclyListed = expected;
            expect(townEmitter.emit).toBeCalledWith('townSettingsUpdated', {
                isPubliclyListed: expected,
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bi50ZXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bi50ZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBRWhDLE9BQU8sV0FBVyxNQUFNLG9CQUFvQixDQUFDO0FBQzdDLE9BQU8sRUFFTCxnQ0FBZ0MsRUFDaEMsZ0JBQWdCLEVBQ2hCLG1CQUFtQixFQUVuQixVQUFVLEdBQ1gsTUFBTSxjQUFjLENBQUM7QUFVdEIsT0FBTyxJQUFJLE1BQU0sUUFBUSxDQUFDO0FBRTFCLE1BQU0sZUFBZSxHQUFHLFFBQVEsRUFBZSxDQUFDO0FBQ2hELElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUFFLGFBQWEsQ0FBQyxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUt4RSxNQUFNLFdBQVcsR0FBZ0I7SUFDL0IsT0FBTyxFQUFFO1FBQ1AsWUFBWSxFQUFFLE9BQU87UUFDckIsVUFBVSxFQUFFLEVBQUU7UUFDZCxRQUFRLEVBQUUsRUFBRTtRQUNaLFNBQVMsRUFBRSxFQUFFO1FBQ2IsSUFBSSxFQUFFLEtBQUs7UUFDWCxNQUFNLEVBQUU7WUFDTjtnQkFDRSxFQUFFLEVBQUUsQ0FBQztnQkFDTCxJQUFJLEVBQUUsU0FBUztnQkFDZixPQUFPLEVBQUU7b0JBQ1A7d0JBQ0UsSUFBSSxFQUFFLGtCQUFrQjt3QkFDeEIsTUFBTSxFQUFFLEdBQUc7d0JBQ1gsRUFBRSxFQUFFLEVBQUU7d0JBQ04sSUFBSSxFQUFFLE9BQU87d0JBQ2IsUUFBUSxFQUFFLENBQUM7d0JBQ1gsT0FBTyxFQUFFLElBQUk7d0JBQ2IsS0FBSyxFQUFFLEdBQUc7d0JBQ1YsQ0FBQyxFQUFFLEVBQUU7d0JBQ0wsQ0FBQyxFQUFFLEdBQUc7cUJBQ1A7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