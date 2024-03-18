import model from './model';

export const createLeaderboardEntry = (entry: any) => model.create(entry);
export const retrieveAllScores = () => model.find();
export const retrieveScoresByPlayer = (playerId: any) => model.find({ playerId });
