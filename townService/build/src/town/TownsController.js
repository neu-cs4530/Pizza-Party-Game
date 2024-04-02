var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import assert from 'assert';
import { Body, Controller, Delete, Example, Get, Header, Patch, Path, Post, Query, Response, Route, Tags, } from 'tsoa';
import InvalidParametersError from '../lib/InvalidParametersError';
import CoveyTownsStore from '../lib/TownsStore';
let TownsController = class TownsController extends Controller {
    _townsStore = CoveyTownsStore.getInstance();
    async listTowns() {
        return this._townsStore.getTowns();
    }
    async createTown(request) {
        const { townID, townUpdatePassword } = await this._townsStore.createTown(request.friendlyName, request.isPubliclyListed, request.mapFile);
        return {
            townID,
            townUpdatePassword,
        };
    }
    async updateTown(townID, townUpdatePassword, requestBody) {
        const success = this._townsStore.updateTown(townID, townUpdatePassword, requestBody.friendlyName, requestBody.isPubliclyListed);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async deleteTown(townID, townUpdatePassword) {
        const success = this._townsStore.deleteTown(townID, townUpdatePassword);
        if (!success) {
            throw new InvalidParametersError('Invalid password or update values specified');
        }
    }
    async createConversationArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addConversationArea({ ...requestBody, type: 'ConversationArea' });
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async createViewingArea(townID, sessionToken, requestBody) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError('Invalid values specified');
        }
        if (!town?.getPlayerBySessionToken(sessionToken)) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const success = town.addViewingArea({ ...requestBody, type: 'ViewingArea' });
        if (!success) {
            throw new InvalidParametersError('Invalid values specified');
        }
    }
    async getChatMessages(townID, sessionToken, interactableID) {
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const player = town.getPlayerBySessionToken(sessionToken);
        if (!player) {
            throw new InvalidParametersError('Invalid values specified');
        }
        const messages = town.getChatMessages(interactableID);
        return messages;
    }
    async joinTown(socket) {
        const { userName, townID } = socket.handshake.auth;
        const town = this._townsStore.getTownByID(townID);
        if (!town) {
            socket.disconnect(true);
            return;
        }
        socket.join(town.townID);
        const newPlayer = await town.addPlayer(userName, socket);
        assert(newPlayer.videoToken);
        socket.emit('initialize', {
            userID: newPlayer.id,
            sessionToken: newPlayer.sessionToken,
            providerVideoToken: newPlayer.videoToken,
            currentPlayers: town.players.map(eachPlayer => eachPlayer.toPlayerModel()),
            friendlyName: town.friendlyName,
            isPubliclyListed: town.isPubliclyListed,
            interactables: town.interactables.map(eachInteractable => eachInteractable.toModel()),
        });
    }
};
__decorate([
    Get(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "listTowns", null);
__decorate([
    Example({ townID: 'stringID', townUpdatePassword: 'secretPassword' }),
    Post(),
    __param(0, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createTown", null);
__decorate([
    Patch('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "updateTown", null);
__decorate([
    Delete('{townID}'),
    Response(400, 'Invalid password or update values specified'),
    __param(0, Path()),
    __param(1, Header('X-CoveyTown-Password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "deleteTown", null);
__decorate([
    Post('{townID}/conversationArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createConversationArea", null);
__decorate([
    Post('{townID}/viewingArea'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "createViewingArea", null);
__decorate([
    Get('{townID}/chatMessages'),
    Response(400, 'Invalid values specified'),
    __param(0, Path()),
    __param(1, Header('X-Session-Token')),
    __param(2, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TownsController.prototype, "getChatMessages", null);
TownsController = __decorate([
    Route('towns'),
    Tags('towns')
], TownsController);
export { TownsController };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bnNDb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL3Rvd24vVG93bnNDb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLEVBQ0wsSUFBSSxFQUNKLFVBQVUsRUFDVixNQUFNLEVBQ04sT0FBTyxFQUNQLEdBQUcsRUFDSCxNQUFNLEVBQ04sS0FBSyxFQUNMLElBQUksRUFDSixJQUFJLEVBQ0osS0FBSyxFQUNMLFFBQVEsRUFDUixLQUFLLEVBQ0wsSUFBSSxHQUNMLE1BQU0sTUFBTSxDQUFDO0FBR2QsT0FBTyxzQkFBc0IsTUFBTSwrQkFBK0IsQ0FBQztBQUNuRSxPQUFPLGVBQWUsTUFBTSxtQkFBbUIsQ0FBQztBQWdCaEQsSUFBYSxlQUFlLEdBQTVCLE1BQWEsZUFBZ0IsU0FBUSxVQUFVO0lBQ3JDLFdBQVcsR0FBb0IsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBUTlELEtBQUssQ0FBQyxTQUFTO1FBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUNyQyxDQUFDO0lBV00sS0FBSyxDQUFDLFVBQVUsQ0FBUyxPQUF5QjtRQUN2RCxNQUFNLEVBQUUsTUFBTSxFQUFFLGtCQUFrQixFQUFFLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsQ0FDdEUsT0FBTyxDQUFDLFlBQVksRUFDcEIsT0FBTyxDQUFDLGdCQUFnQixFQUN4QixPQUFPLENBQUMsT0FBTyxDQUNoQixDQUFDO1FBQ0YsT0FBTztZQUNMLE1BQU07WUFDTixrQkFBa0I7U0FDbkIsQ0FBQztJQUNKLENBQUM7SUFXTSxLQUFLLENBQUMsVUFBVSxDQUNiLE1BQWMsRUFDVSxrQkFBMEIsRUFDbEQsV0FBK0I7UUFFdkMsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENB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