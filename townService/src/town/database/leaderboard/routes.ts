import * as dao from './dao.js';

function LeaderboardRoutes(app: any) {
  const createLeaderboardEntry = async (req: any, res: any) => {
    const entry = await dao.createLeaderboardEntry(req.body);
    res.json(entry);
  };

  const retrieveAllScores = async (req: any, res: any) => {
    const scores = await dao.retrieveAllScores();
    res.json(scores);
  };

  const retrieveScoresByPlayer = async (req: any, res: any) => {
    const scores = await dao.retrieveScoresByPlayer(req.body);
    res.json(scores);
  };

  app.post('/api/leaderboard', createLeaderboardEntry);
  app.get('/api/leaderboard', retrieveAllScores);
  app.get('/api/leaderboard/:playerId', retrieveScoresByPlayer);
}

export default LeaderboardRoutes;
