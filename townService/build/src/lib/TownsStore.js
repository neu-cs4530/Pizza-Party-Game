import { ITiledMap } from '@jonbell/tiled-map-type-guard';
import * as fs from 'fs/promises';
import { customAlphabet } from 'nanoid';
import Town from '../town/Town';
function passwordMatches(provided, expected) {
    if (provided === expected) {
        return true;
    }
    if (process.env.MASTER_TOWN_PASSWORD && process.env.MASTER_TOWN_PASWORD === provided) {
        return true;
    }
    return false;
}
const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);
export default class TownsStore {
    static _instance;
    _towns = [];
    _emitterFactory;
    static initializeTownsStore(emitterFactory) {
        TownsStore._instance = new TownsStore(emitterFactory);
    }
    static getInstance() {
        if (TownsStore._instance === undefined) {
            throw new Error('TownsStore must be initialized before getInstance is called');
        }
        return TownsStore._instance;
    }
    constructor(emitterFactory) {
        this._emitterFactory = emitterFactory;
    }
    getTownByID(townID) {
        return this._towns.find(town => town.townID === townID);
    }
    getTowns() {
        return this._towns
            .filter(townController => townController.isPubliclyListed)
            .map(townController => ({
            townID: townController.townID,
            friendlyName: townController.friendlyName,
            currentOccupancy: townController.occupancy,
            maximumOccupancy: townController.capacity,
        }));
    }
    async createTown(friendlyName, isPubliclyListed, mapFile = '../frontend/public/assets/tilemaps/indoors.json') {
        if (friendlyName.length === 0) {
            throw new Error('FriendlyName must be specified');
        }
        const townID = process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID();
        const newTown = new Town(friendlyName, isPubliclyListed, townID, this._emitterFactory(townID));
        const data = JSON.parse(await fs.readFile(mapFile, 'utf-8'));
        const map = ITiledMap.parse(data);
        newTown.initializeFromMap(map);
        this._towns.push(newTown);
        return newTown;
    }
    updateTown(townID, townUpdatePassword, friendlyName, makePublic) {
        const existingTown = this.getTownByID(townID);
        if (existingTown && passwordMatches(townUpdatePassword, existingTown.townUpdatePassword)) {
            if (friendlyName !== undefined) {
                if (friendlyName.length === 0) {
                    return false;
                }
                existingTown.friendlyName = friendlyName;
            }
            if (makePublic !== undefined) {
                existingTown.isPubliclyListed = makePublic;
            }
            return true;
        }
        return false;
    }
    deleteTown(townID, townUpdatePassword) {
        const existingTown = this.getTownByID(townID);
        if (existingTown && passwordMatches(townUpdatePassword, existingTown.townUpdatePassword)) {
            this._towns = this._towns.filter(town => town !== existingTown);
            existingTown.disconnectAllPlayers();
            return true;
        }
        return false;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNTdG9yZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvVG93bnNTdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDMUQsT0FBTyxLQUFLLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDbEMsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUN4QyxPQUFPLElBQUksTUFBTSxjQUFjLENBQUM7QUFHaEMsU0FBUyxlQUFlLENBQUMsUUFBZ0IsRUFBRSxRQUFnQjtJQUN6RCxJQUFJLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDekIsT0FBTyxJQUFJLENBQUM7S0FDYjtJQUNELElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFtQixLQUFLLFFBQVEsRUFBRTtRQUNwRixPQUFPLElBQUksQ0FBQztLQUNiO0lBQ0QsT0FBTyxLQUFLLENBQUM7QUFDZixDQUFDO0FBRUQsTUFBTSxjQUFjLEdBQUcsY0FBYyxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQyxDQUFDO0FBUzdELE1BQU0sQ0FBQyxPQUFPLE9BQU8sVUFBVTtJQUNyQixNQUFNLENBQUMsU0FBUyxDQUFhO0lBRTdCLE1BQU0sR0FBVyxFQUFFLENBQUM7SUFFcEIsZUFBZSxDQUFxQjtJQUU1QyxNQUFNLENBQUMsb0JBQW9CLENBQUMsY0FBa0M7UUFDNUQsVUFBVSxDQUFDLFNBQVMsR0FBRyxJQUFJLFVBQVUsQ0FBQyxjQUFjLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBT0QsTUFBTSxDQUFDLFdBQVc7UUFDaEIsSUFBSSxVQUFVLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTtZQUN0QyxNQUFNLElBQUksS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7U0FDaEY7UUFDRCxPQUFPLFVBQVUsQ0FBQyxTQUFTLENB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