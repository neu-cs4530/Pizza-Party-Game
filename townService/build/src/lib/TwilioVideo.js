import dotenv from 'dotenv';
import Twilio from 'twilio';
import { logError } from '../Utils';
dotenv.config();
const MAX_ALLOWED_SESSION_DURATION = 3600;
const MISSING_TOKEN_NAME = 'missing';
export default class TwilioVideo {
    static _instance;
    _twilioAccountSid;
    _twilioApiKeySID;
    _twilioApiKeySecret;
    constructor(twilioAccountSid, twilioAPIKeySID, twilioAPIKeySecret) {
        this._twilioAccountSid = twilioAccountSid;
        this._twilioApiKeySID = twilioAPIKeySID;
        this._twilioApiKeySecret = twilioAPIKeySecret;
    }
    static getInstance() {
        if (!TwilioVideo._instance) {
            TwilioVideo._instance = new TwilioVideo(process.env.TWILIO_ACCOUNT_SID || MISSING_TOKEN_NAME, process.env.TWILIO_API_KEY_SID || MISSING_TOKEN_NAME, process.env.TWILIO_API_KEY_SECRET || MISSING_TOKEN_NAME);
        }
        return TwilioVideo._instance;
    }
    async getTokenForTown(coveyTownID, clientIdentity) {
        if (this._twilioAccountSid === MISSING_TOKEN_NAME ||
            this._twilioApiKeySID === MISSING_TOKEN_NAME ||
            this._twilioApiKeySecret === MISSING_TOKEN_NAME) {
            logError('Twilio tokens missing. Video chat will be disabled, and viewing areas will not work. Please be sure to configure the variables in the townService .env file as described in the README');
            return MISSING_TOKEN_NAME;
        }
        const token = new Twilio.jwt.AccessToken(this._twilioAccountSid, this._twilioApiKeySID, this._twilioApiKeySecret, {
            ttl: MAX_ALLOWED_SESSION_DURATION,
        });
        token.identity = clientIdentity;
        const videoGrant = new Twilio.jwt.AccessToken.VideoGrant({ room: coveyTownID });
        token.addGrant(videoGrant);
        return token.toJwt();
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiVHdpbGlvVmlkZW8uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL1R3aWxpb1ZpZGVvLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sTUFBTSxNQUFNLFFBQVEsQ0FBQztBQUM1QixPQUFPLE1BQU0sTUFBTSxRQUFRLENBQUM7QUFDNUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUdwQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUM7QUFHaEIsTUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUM7QUFPMUMsTUFBTSxrQkFBa0IsR0FBRyxTQUFTLENBQUM7QUFDckMsTUFBTSxDQUFDLE9BQU8sT0FBTyxXQUFXO0lBQ3RCLE1BQU0sQ0FBQyxTQUFTLENBQWM7SUFFOUIsaUJBQWlCLENBQVM7SUFFMUIsZ0JBQWdCLENBQVM7SUFFekIsbUJBQW1CLENBQVM7SUFFcEMsWUFDRSxnQkFBd0IsRUFDeEIsZUFBdUIsRUFDdkIsa0JBQTBCO1FBRTFCLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxnQkFBZ0IsQ0FBQztRQUMxQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsZUFBZSxDQUFDO1FBQ3hDLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztJQUNoRCxDQUFDO0lBRU0sTUFBTSxDQUFDLFdBQVc7UUFDdkIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUU7WUFDMUIsV0FBVyxDQUFDLFNBQVMsR0FBRyxJQUFJLFdBQVcsQ0FDckMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxrQkFBa0IsRUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsSUFBSSxrQkFBa0IsRUFDcEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsSUFBSSxrQkFBa0IsQ0FDeEQsQ0FBQztTQUNIO1FBQ0QsT0FBTyxXQUFXLENBQUMsU0FBUyxDQUFDO0lBQy9CLENBQUM7SUFFRCxLQUFLLENBQUMsZUFBZSxDQUFDLFdBQW1CLEVBQUUsY0FBc0I7UUFDL0QsSUFDRSxJQUFJLENBQUMsaUJBQWlCLEtBQUssa0JBQWtCO1lBQzdDLElBQUksQ0FBQyxnQkFBZ0IsS0FBSyxrQkFBa0I7WUFDNUMsSUFBSSxDQUFDLG1CQUFtQixLQUFLLGtCQUFrQixFQUMvQztZQUNBLFFBQVEsQ0FDTix3TEFBd0wsQ0FDekwsQ0FBQztZQUNGLE9BQU8sa0JBQWtCLENBQUM7U0FDM0I7UUFDRCxNQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUN0QyxJQUFJLENBQUMsaUJBQWlCLEVBQ3RCLElBQUksQ0FBQyxnQkFBZ0IsRUFDckIsSUFBSSxDQUFDLG1CQUFtQixFQUN4QjtZQUNFLEdBQUcsRUFBRSw0QkFBNEI7U0FDbEMsQ0FDRixDQUFDO1FBQ0YsS0FBSyxDQUFDLFFBQVEsR0FBRyxjQUFjLENBQUM7UUFDaEMsTUFBTSxVQUFVLEdBQUcsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUNoRixLQUFLLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQzNCLE9BQU8sS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ3ZCLENBQUM7Q0FDRiJ9