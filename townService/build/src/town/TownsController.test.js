import assert from 'assert';
import { mockDeep } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import TownsStore from '../lib/TownsStore';
import { createConversationForTesting, getLastEmittedEvent, extractSessionToken, mockPlayer, isViewingArea, isConversationArea, } from '../TestUtils';
import { TownsController } from './TownsController';
function expectTownListMatches(towns, town) {
    const matching = towns.find(townInfo => townInfo.townID === town.townID);
    if (town.isPubliclyListed) {
        expect(matching).toBeDefined();
        assert(matching);
        expect(matching.friendlyName).toBe(town.friendlyName);
    }
    else {
        expect(matching).toBeUndefined();
    }
}
const broadcastEmitter = jest.fn();
describe('TownsController integration tests', () => {
    let controller;
    const createdTownEmitters = new Map();
    async function createTownForTesting(friendlyNameToUse, isPublic = false) {
        const friendlyName = friendlyNameToUse !== undefined
            ? friendlyNameToUse
            : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
        const ret = await controller.createTown({
            friendlyName,
            isPubliclyListed: isPublic,
            mapFile: 'testData/indoors.json',
        });
        return {
            friendlyName,
            isPubliclyListed: isPublic,
            townID: ret.townID,
            townUpdatePassword: ret.townUpdatePassword,
        };
    }
    function getBroadcastEmitterForTownID(townID) {
        const ret = createdTownEmitters.get(townID);
        if (!ret) {
            throw new Error(`Could not find broadcast emitter for ${townID}`);
        }
        return ret;
    }
    beforeAll(() => {
        process.env.TWILIO_API_AUTH_TOKEN = 'testing';
        process.env.TWILIO_ACCOUNT_SID = 'ACtesting';
        process.env.TWILIO_API_KEY_SID = 'testing';
        process.env.TWILIO_API_KEY_SECRET = 'testing';
    });
    beforeEach(async () => {
        createdTownEmitters.clear();
        broadcastEmitter.mockImplementation((townID) => {
            const mockRoomEmitter = mockDeep();
            createdTownEmitters.set(townID, mockRoomEmitter);
            return mockRoomEmitter;
        });
        TownsStore.initializeTownsStore(broadcastEmitter);
        controller = new TownsController();
    });
    describe('createTown', () => {
        it('Allows for multiple towns with the same friendlyName', async () => {
            const firstTown = await createTownForTesting();
            const secondTown = await createTownForTesting(firstTown.friendlyName);
            expect(firstTown.townID).not.toBe(secondTown.townID);
        });
        it('Prohibits a blank friendlyName', async () => {
            await expect(createTownForTesting('')).rejects.toThrowError();
        });
    });
    describe('listTowns', () => {
        it('Lists public towns, but not private towns', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            const privTown1 = await createTownForTesting(undefined, false);
            const pubTown2 = await createTownForTesting(undefined, true);
            const privTown2 = await createTownForTesting(undefined, false);
            const towns = await controller.listTowns();
            expectTownListMatches(towns, pubTown1);
            expectTownListMatches(towns, pubTown2);
            expectTownListMatches(towns, privTown1);
            expectTownListMatches(towns, privTown2);
        });
        it('Allows for multiple towns with the same friendlyName', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            const privTown1 = await createTownForTesting(pubTown1.friendlyName, false);
            const pubTown2 = await createTownForTesting(pubTown1.friendlyName, true);
            const privTown2 = await createTownForTesting(pubTown1.friendlyName, false);
            const towns = await controller.listTowns();
            expectTownListMatches(towns, pubTown1);
            expectTownListMatches(towns, pubTown2);
            expectTownListMatches(towns, privTown1);
            expectTownListMatches(towns, privTown2);
        });
    });
    describe('deleteTown', () => {
        it('Throws an error if the password is invalid', async () => {
            const { townID } = await createTownForTesting(undefined, true);
            await expect(controller.deleteTown(townID, nanoid())).rejects.toThrowError();
        });
        it('Throws an error if the townID is invalid', async () => {
            const { townUpdatePassword } = await createTownForTesting(undefined, true);
            await expect(controller.deleteTown(nanoid(), townUpdatePassword)).rejects.toThrowError();
        });
        it('Deletes a town if given a valid password and town, no longer allowing it to be joined or listed', async () => {
            const { townID, townUpdatePassword } = await createTownForTesting(undefined, true);
            await controller.deleteTown(townID, townUpdatePassword);
            const { socket } = mockPlayer(townID);
            await controller.joinTown(socket);
            expect(socket.emit).not.toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalled();
            const listedTowns = await controller.listTowns();
            if (listedTowns.find(r => r.townID === townID)) {
                fail('Expected the deleted town to no longer be listed');
            }
        });
        it('Informs all players when a town is destroyed using the broadcast emitter and then disconnects them', async () => {
            const town = await createTownForTesting();
            const players = await Promise.all([...Array(10)].map(async () => {
                const player = mockPlayer(town.townID);
                await controller.joinTown(player.socket);
                return player;
            }));
            const townEmitter = getBroadcastEmitterForTownID(town.townID);
            await controller.deleteTown(town.townID, town.townUpdatePassword);
            getLastEmittedEvent(townEmitter, 'townClosing');
            players.forEach(eachPlayer => expect(eachPlayer.socket.disconnect).toBeCalledWith(true));
        });
    });
    describe('updateTown', () => {
        it('Checks the password before updating any values', async () => {
            const pubTown1 = await createTownForTesting(undefined, true);
            expectTownListMatches(await controller.listTowns(), pubTown1);
            await expect(controller.updateTown(pubTown1.townID, `${pubTown1.townUpdatePassword}*`, {
                friendlyName: 'broken',
                isPubliclyListed: false,
            })).rejects.toThrowError();
            expectTownListMatches(await controller.listTowns(), pubTown1);
        });
        it('Updates the friendlyName and visbility as requested', async () => {
            const pubTown1 = await createTownForTesting(undefined, false);
            expectTownListMatches(await controller.listTowns(), pubTown1);
            await controller.updateTown(pubTown1.townID, pubTown1.townUpdatePassword, {
                friendlyName: 'newName',
                isPubliclyListed: true,
            });
            pubTown1.friendlyName = 'newName';
            pubTown1.isPubliclyListed = true;
            expectTownListMatches(await controller.listTowns(), pubTown1);
        });
        it('Should fail if the townID does not exist', async () => {
            await expect(controller.updateTown(nanoid(), nanoid(), { friendlyName: 'test', isPubliclyListed: true })).rejects.toThrow();
        });
    });
    describe('joinTown', () => {
        it('Disconnects the socket if the town does not exist', async () => {
            await createTownForTesting(undefined, true);
            const { socket } = mockPlayer(nanoid());
            await controller.joinTown(socket);
            expect(socket.emit).not.toHaveBeenCalled();
            expect(socket.disconnect).toHaveBeenCalled();
        });
        it('Admits a user to a valid public or private town and sends back initial data', async () => {
            const joinAndCheckInitialData = async (publiclyListed) => {
                const town = await createTownForTesting(undefined, publiclyListed);
                const player = mockPlayer(town.townID);
                await controller.joinTown(player.socket);
                expect(player.socket.emit).toHaveBeenCalled();
                expect(player.socket.disconnect).not.toHaveBeenCalled();
                const initialData = getLastEmittedEvent(player.socket, 'initialize');
                expect(initialData.friendlyName).toEqual(town.friendlyName);
                expect(initialData.isPubliclyListed).toEqual(publiclyListed);
                expect(initialData.interactables.length).toBeGreaterThan(0);
                expect(initialData.providerVideoToken).toBeDefined();
                expect(initialData.sessionToken).toBeDefined();
                expect(initialData.currentPlayers.length).toBe(1);
                expect(initialData.currentPlayers[0].userName).toEqual(player.userName);
                expect(initialData.currentPlayers[0].id).toEqual(initialData.userID);
            };
            await joinAndCheckInitialData(true);
            await joinAndCheckInitialData(false);
        });
        it('Includes active conversation areas in the initial join data', async () => {
            const town = await createTownForTesting(undefined, true);
            const player = mockPlayer(town.townID);
            await controller.joinTown(player.socket);
            const initialData = getLastEmittedEvent(player.socket, 'initialize');
            const conversationArea = createConversationForTesting({
                boundingBox: { x: 10, y: 10, width: 1, height: 1 },
                conversationID: initialData.interactables.find(eachInteractable => isConversationArea(eachInteractable))?.id,
            });
            await controller.createConversationArea(town.townID, extractSessionToken(player), conversationArea);
            const player2 = mockPlayer(town.townID);
            await controller.joinTown(player2.socket);
            const initialData2 = getLastEmittedEvent(player2.socket, 'initialize');
            const createdArea = initialData2.interactables.find(eachInteractable => eachInteractable.id === conversationArea.id);
            expect(createdArea.topic).toEqual(conversationArea.topic);
            expect(initialData2.interactables.length).toEqual(initialData.interactables.length);
        });
    });
    describe('Interactables', () => {
        let testingTown;
        let player;
        let sessionToken;
        let interactables;
        beforeEach(async () => {
            testingTown = await createTownForTesting(undefined, true);
            player = mockPlayer(testingTown.townID);
            await controller.joinTown(player.socket);
            const initialData = getLastEmittedEvent(player.socket, 'initialize');
            sessionToken = initialData.sessionToken;
            interactables = initialData.interactables;
        });
        describe('Create Conversation Area', () => {
            it('Executes without error when creating a new conversation', async () => {
                await controller.createConversationArea(testingTown.townID, sessionToken, createConversationForTesting({
                    conversationID: interactables.find(isConversationArea)?.id,
                }));
            });
            it('Returns an error message if the town ID is invalid', async () => {
                await expect(controller.createConversationArea(nanoid(), sessionToken, createConversationForTesting())).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a conversation area', async () => {
                const conversationArea = createConversationForTesting();
                const invalidSessionToken = nanoid();
                await expect(controller.createConversationArea(testingTown.townID, invalidSessionToken, conversationArea)).rejects.toThrow();
            });
            it('Returns an error message if addConversation returns false', async () => {
                const conversationArea = createConversationForTesting();
                await expect(controller.createConversationArea(testingTown.townID, sessionToken, conversationArea)).rejects.toThrow();
            });
        });
        describe('[T1] Create Viewing Area', () => {
            it('Executes without error when creating a new viewing area', async () => {
                const viewingArea = interactables.find(isViewingArea);
                if (!viewingArea) {
                    fail('Expected at least one viewing area to be returned in the initial join data');
                }
                else {
                    const newViewingArea = {
                        elapsedTimeSec: 100,
                        id: viewingArea.id,
                        video: nanoid(),
                        isPlaying: true,
                        occupants: [],
                        type: 'ViewingArea',
                    };
                    await controller.createViewingArea(testingTown.townID, sessionToken, newViewingArea);
                    const townEmitter = getBroadcastEmitterForTownID(testingTown.townID);
                    const updateMessage = getLastEmittedEvent(townEmitter, 'interactableUpdate');
                    if (isViewingArea(updateMessage)) {
                        expect(updateMessage).toEqual(newViewingArea);
                    }
                    else {
                        fail('Expected an interactableUpdate to be dispatched with the new viewing area');
                    }
                }
            });
            it('Returns an error message if the town ID is invalid', async () => {
                const viewingArea = interactables.find(isViewingArea);
                const newViewingArea = {
                    elapsedTimeSec: 100,
                    id: viewingArea.id,
                    video: nanoid(),
                    isPlaying: true,
                    occupants: [],
                    type: 'ViewingArea',
                };
                await expect(controller.createViewingArea(nanoid(), sessionToken, newViewingArea)).rejects.toThrow();
            });
            it('Checks for a valid session token before creating a viewing area', async () => {
                const invalidSessionToken = nanoid();
                const viewingArea = interactables.find(isViewingArea);
                const newViewingArea = {
                    elapsedTimeSec: 100,
                    id: viewingArea.id,
                    video: nanoid(),
                    isPlaying: true,
                    occupants: [],
                    type: 'ViewingArea',
                };
                await expect(controller.createViewingArea(testingTown.townID, invalidSessionToken, newViewingArea)).rejects.toThrow();
            });
            it('Returns an error message if addViewingArea returns false', async () => {
                const viewingArea = interactables.find(isViewingArea);
                viewingArea.id = nanoid();
                await expect(controller.createViewingArea(testingTown.townID, sessionToken, viewingArea)).rejects.toThrow();
            });
        });
    });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLnRlc3QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvdG93bi9Ub3duc0NvbnRyb2xsZXIudGVzdC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFpQixRQUFRLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUM3RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sUUFBUSxDQUFDO0FBR2hDLE9BQU8sVUFBVSxNQUFNLG1CQUFtQixDQUFDO0FBQzNDLE9BQU8sRUFDTCw0QkFBNEIsRUFDNUIsbUJBQW1CLEVBQ25CLG1CQUFtQixFQUNuQixVQUFVLEVBQ1YsYUFBYSxFQUNiLGtCQUFrQixHQUVuQixNQUFNLGNBQWMsQ0FBQztBQUN0QixPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFTcEQsU0FBUyxxQkFBcUIsQ0FBQyxLQUFhLEVBQUUsSUFBa0I7SUFDOUQsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEtBQUssSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3pFLElBQUksSUFBSSxDQUFDLGdCQUFnQixFQUFFO1FBQ3pCLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMvQixNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDakIsTUFBTSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3ZEO1NBQU07UUFDTCxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsYUFBYSxFQUFFLENBQUM7S0FDbEM7QUFDSCxDQUFDO0FBRUQsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsRUFBRSxFQUFFLENBQUM7QUFDbkMsUUFBUSxDQUFD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