import { nanoid } from 'nanoid';
import InvalidParametersError from '../lib/InvalidParametersError';
import Player from '../lib/Player';
import TwilioVideo from '../lib/TwilioVideo';
import { isViewingArea } from '../TestUtils';
import { logError } from '../Utils';
import ConversationArea from './ConversationArea';
import GameAreaFactory from './games/GameAreaFactory';
import ViewingArea from './ViewingArea';
export default class Town {
    get capacity() {
        return this._capacity;
    }
    set isPubliclyListed(value) {
        this._isPubliclyListed = value;
        this._broadcastEmitter.emit('townSettingsUpdated', { isPubliclyListed: value });
    }
    get isPubliclyListed() {
        return this._isPubliclyListed;
    }
    get townUpdatePassword() {
        return this._townUpdatePassword;
    }
    get players() {
        return this._players;
    }
    get occupancy() {
        return this.players.length;
    }
    get friendlyName() {
        return this._friendlyName;
    }
    set friendlyName(value) {
        this._friendlyName = value;
        this._broadcastEmitter.emit('townSettingsUpdated', { friendlyName: value });
    }
    get townID() {
        return this._townID;
    }
    get interactables() {
        return this._interactables;
    }
    _players = [];
    _videoClient = TwilioVideo.getInstance();
    _interactables = [];
    _townID;
    _friendlyName;
    _townUpdatePassword;
    _isPubliclyListed;
    _capacity;
    _broadcastEmitter;
    _connectedSockets = new Set();
    _chatMessages = [];
    constructor(friendlyName, isPubliclyListed, townID, broadcastEmitter) {
        this._townID = townID;
        this._capacity = 50;
        this._townUpdatePassword = nanoid(24);
        this._isPubliclyListed = isPubliclyListed;
        this._friendlyName = friendlyName;
        this._broadcastEmitter = broadcastEmitter;
    }
    async addPlayer(userName, socket) {
        const newPlayer = new Player(userName, socket.to(this._townID));
        this._players.push(newPlayer);
        this._connectedSockets.add(socket);
        newPlayer.videoToken = await this._videoClient.getTokenForTown(this._townID, newPlayer.id);
        this._broadcastEmitter.emit('playerJoined', newPlayer.toPlayerModel());
        socket.on('disconnect', () => {
            this._removePlayer(newPlayer);
            this._connectedSockets.delete(socket);
        });
        socket.on('chatMessage', (message) => {
            this._broadcastEmitter.emit('chatMessage', message);
            this._chatMessages.push(message);
            if (this._chatMessages.length > 200) {
                this._chatMessages.shift();
            }
        });
        socket.on('playerMovement', (movementData) => {
            try {
                this._updatePlayerLocation(newPlayer, movementData);
            }
            catch (err) {
                logError(err);
            }
        });
        socket.on('interactableUpdate', (update) => {
            if (isViewingArea(update)) {
                newPlayer.townEmitter.emit('interactableUpdate', update);
                const viewingArea = this._interactables.find(eachInteractable => eachInteractable.id === update.id);
                if (viewingArea) {
                    viewingArea.updateModel(update);
                }
            }
        });
        socket.on('interactableCommand', (command) => {
            const interactable = this._interactables.find(eachInteractable => eachInteractable.id === command.interactableID);
            if (interactable) {
                try {
                    const payload = interactable.handleCommand(command, newPlayer);
                    socket.emit('commandResponse', {
                        commandID: command.commandID,
                        interactableID: command.interactableID,
                        isOK: true,
                        payload,
                    });
                }
                catch (err) {
                    if (err instanceof InvalidParametersError) {
                        socket.emit('commandResponse', {
                            commandID: command.commandID,
                            interactableID: command.interactableID,
                            isOK: false,
                            error: err.message,
                        });
                    }
                    else {
                        logError(err);
                        socket.emit('commandResponse', {
                            commandID: command.commandID,
                            interactableID: command.interactableID,
                            isOK: false,
                            error: 'Unknown error',
                        });
                    }
                }
            }
            else {
                socket.emit('commandResponse', {
                    commandID: command.commandID,
                    interactableID: command.interactableID,
                    isOK: false,
                    error: `No such interactable ${command.interactableID}`,
                });
            }
        });
        return newPlayer;
    }
    _removePlayer(player) {
        if (player.location.interactableID) {
            this._removePlayerFromInteractable(player);
        }
        this._players = this._players.filter(p => p.id !== player.id);
        this._broadcastEmitter.emit('playerDisconnect', player.toPlayerModel());
    }
    _updatePlayerLocation(player, location) {
        const prevInteractable = this._interactables.find(conv => conv.id === player.location.interactableID);
        if (!prevInteractable?.contains(location)) {
            if (prevInteractable) {
                prevInteractable.remove(player);
            }
            const newInteractable = this._interactables.find(eachArea => eachArea.isActive && eachArea.contains(location));
            if (newInteractable) {
                newInteractable.add(player);
            }
            location.interactableID = newInteractable?.id;
        }
        else {
            location.interactableID = prevInteractable.id;
        }
        player.location = location;
        this._broadcastEmitter.emit('playerMoved', player.toPlayerModel());
    }
    _removePlayerFromInteractable(player) {
        const area = this._interactables.find(eachArea => eachArea.id === player.location.interactableID);
        if (area) {
            area.remove(player);
        }
    }
    addConversationArea(conversationArea) {
        const area = this._interactables.find(eachArea => eachArea.id === conversationArea.id);
        if (!area || !conversationArea.topic || area.topic) {
            return false;
        }
        area.topic = conversationArea.topic;
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    addViewingArea(viewingArea) {
        const area = this._interactables.find(eachArea => eachArea.id === viewingArea.id);
        if (!area || !viewingArea.video || area.video) {
            return false;
        }
        area.updateModel(viewingArea);
        area.addPlayersWithinBounds(this._players);
        this._broadcastEmitter.emit('interactableUpdate', area.toModel());
        return true;
    }
    getPlayerBySessionToken(token) {
        return this.players.find(eachPlayer => eachPlayer.sessionToken === token);
    }
    getInteractable(id) {
        const ret = this._interactables.find(eachInteractable => eachInteractable.id === id);
        if (!ret) {
            throw new Error(`No such interactable ${id}`);
        }
        return ret;
    }
    getChatMessages(interactableID) {
        return this._chatMessages.filter(eachMessage => eachMessage.interactableID === interactableID);
    }
    disconnectAllPlayers() {
        this._broadcastEmitter.emit('townClosing');
        this._connectedSockets.forEach(eachSocket => eachSocket.disconnect(true));
    }
    initializeFromMap(map) {
        const objectLayer = map.layers.find(eachLayer => eachLayer.name === 'Objects');
        if (!objectLayer) {
            throw new Error(`Unable to find objects layer in map`);
        }
        const viewingAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'ViewingArea')
            .map(eachViewingAreaObject => ViewingArea.fromMapObject(eachViewingAreaObject, this._broadcastEmitter));
        const conversationAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'ConversationArea')
            .map(eachConvAreaObj => ConversationArea.fromMapObject(eachConvAreaObj, this._broadcastEmitter));
        const gameAreas = objectLayer.objects
            .filter(eachObject => eachObject.type === 'GameArea')
            .map(eachGameAreaObj => GameAreaFactory(eachGameAreaObj, this._broadcastEmitter));
        this._interactables = this._interactables
            .concat(viewingAreas)
            .concat(conversationAreas)
            .concat(gameAreas);
        this._validateInteractables();
    }
    _validateInteractables() {
        const interactableIDs = this._interactables.map(eachInteractable => eachInteractable.id);
        if (interactableIDs.some(item => interactableIDs.indexOf(item) !== interactableIDs.lastIndexOf(item))) {
            throw new Error(`Expected all interactable IDs to be unique, but found duplicate interactable ID in ${interactableIDs}`);
        }
        for (const interactable of this._interactables) {
            for (const otherInteractable of this._interactables) {
                if (interactable !== otherInteractable && interactable.overlaps(otherInteractable)) {
                    throw new Error(`Expected interactables not to overlap, but found overlap between ${interactable.id} and ${otherInteractable.id}`);
                }
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVG93bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy90b3duL1Rvd24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQUVoQyxPQUFPLHNCQUFzQixNQUFNLCtCQUErQixDQUFDO0FBRW5FLE9BQU8sTUFBTSxNQUFNLGVBQWUsQ0FBQztBQUNuQyxPQUFPLFdBQVcsTUFBTSxvQkFBb0IsQ0FBQztBQUM3QyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBYTdDLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDcEMsT0FBTyxnQkFBZ0IsTUFBTSxvQkFBb0IsQ0FBQztBQUNsRCxPQUFPLGVBQWUsTUFBTSx5QkFBeUIsQ0FBQztBQUV0RCxPQUFPLFdBQVcsTUFBTSxlQUFlLENBQUM7QUFNeEMsTUFBTSxDQUFDLE9BQU8sT0FBTyxJQUFJO0lBQ3ZCLElBQUksUUFBUTtRQUNWLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUN4QixDQUFDO0lBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxLQUFjO1FBQ2pDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7UUFDL0IsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxFQUFFLGdCQUFnQixFQUFFLEtBQUssRUFBRSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUVELElBQUksZ0JBQWdCO1FBQ2xCLE9BQU8sSUFBSSxDQUFDLGlCQUFpQixDQUFDO0lBQ2hDLENBQUM7SUFFRCxJQUFJLGtCQUFrQjtRQUNwQixPQUFPLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztJQUNsQyxDQUFDO0lBRUQsSUFBSSxPQUFPO1FBQ1QsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDO0lBQ3ZCLENBQUM7SUFFRCxJQUFJLFNBQVM7UUFDWCxPQUFPLElBQUksQ0FBQyxPQUFPLENB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