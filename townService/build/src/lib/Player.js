import { nanoid } from 'nanoid';
export default class Player {
    location;
    _id;
    _userName;
    _sessionToken;
    _videoToken;
    townEmitter;
    constructor(userName, townEmitter) {
        this.location = {
            x: 0,
            y: 0,
            moving: false,
            rotation: 'front',
        };
        this._userName = userName;
        this._id = nanoid();
        this._sessionToken = nanoid();
        this.townEmitter = townEmitter;
    }
    get userName() {
        return this._userName;
    }
    get id() {
        return this._id;
    }
    set videoToken(value) {
        this._videoToken = value;
    }
    get videoToken() {
        return this._videoToken;
    }
    get sessionToken() {
        return this._sessionToken;
    }
    toPlayerModel() {
        return {
            id: this._id,
            location: this.location,
            userName: this._userName,
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUGxheWVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9QbGF5ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFFBQVEsQ0FBQztBQU1oQyxNQUFNLENBQUMsT0FBTyxPQUFPLE1BQU07SUFFbEIsUUFBUSxDQUFpQjtJQUdmLEdBQUcsQ0FBUztJQUdaLFNBQVMsQ0FBUztJQUdsQixhQUFhLENBQVM7SUFHL0IsV0FBVyxDQUFVO0lBR2IsV0FBVyxDQUFjO0lBRXpDLFlBQVksUUFBZ0IsRUFBRSxXQUF3QjtRQUNwRCxJQUFJLENBQUMsUUFBUSxHQUFHO1lBQ2QsQ0FBQyxFQUFFLENBQUM7WUFDSixDQUFDLEVBQUUsQ0FBQztZQUNKLE1BQU0sRUFBRSxLQUFLO1lBQ2IsUUFBUSxFQUFFLE9BQU87U0FDbEIsQ0FBQztRQUNGLElBQUksQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO1FBQzFCLElBQUksQ0FBQyxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7UUFDcEIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLEVBQUUsQ0FBQztRQUM5QixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNqQyxDQUFDO0lBRUQsSUFBSSxRQUFRO1FBQ1YsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDO0lBQ3hCLENBQUM7SUFFRCxJQUFJLEVBQUU7UUFDSixPQUFPLElBQUksQ0FBQyxHQUFHLENBQUM7SUFDbEIsQ0FBQztJQUVELElBQUksVUFBVSxDQUFDLEtBQXlCO1FBQ3RDLElBQUksQ0FBQyxXQUFXLEdBQUcsS0FBSyxDQUFDO0lBQzNCLENBQUM7SUFFRCxJQUFJLFVBQVU7UUFDWixPQUFPLElBQUksQ0FBQyxXQUFXLENBQUM7SUFDMUIsQ0FBQztJQUVELElBQUksWUFBWTtRQUNkLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM1QixDQUFDO0lBRUQsYUFBYTtRQUNYLE9BQU87WUFDTCxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUc7WUFDWixRQUFRLEVBQUUsSUFBSSxDQUFDLFFBQVE7WUFDdkIsUUFBUSxFQUFFLElBQUksQ0FBQyxTQUFTO1NBQ3pCLENBQUM7SUFDSixDQUFDO0NBQ0YifQ==