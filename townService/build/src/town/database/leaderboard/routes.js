import * as dao from './dao.js';
function LeaderboardRoutes(app) {
    const createLeaderboardEntry = async (req, res) => {
        const entry = await dao.createLeaderboardEntry(req.body);
        res.json(entry);
    };
    const retrieveAllScores = async (req, res) => {
        const scores = await dao.retrieveAllScores();
        res.json(scores);
    };
    const retrieveScoresByPlayer = async (req, res) => {
        const scores = await dao.retrieveScoresByPlayer(req.body);
        res.json(scores);
    };
    app.post('/api/leaderboard', createLeaderboardEntry);
    app.get('/api/leaderboard', retrieveAllScores);
    app.get('/api/leaderboard/:playerId', retrieveScoresByPlayer);
}
export default LeaderboardRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rvd24vZGF0YWJhc2UvbGVhZGVyYm9hcmQvcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sVUFBVSxDQUFDO0FBRWhDLFNBQVMsaUJBQWlCLENBQUMsR0FBUTtJQUNqQyxNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxHQUFRLEVBQUUsR0FBUSxFQUFFLEVBQUU7UUFDMUQsTUFBTSxLQUFLLEdBQUcsTUFBTSxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pELEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDbEIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLEVBQUUsR0FBUSxFQUFFLEdBQVEsRUFBRSxFQUFFO1FBQ3JELE1BQU0sTUFBTSxHQUFHLE1BQU0sR0FBRyxDQUFDLGlCQUFpQixFQUFFLENBQUM7UUFDN0MsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNuQixDQUFDLENBQUM7SUFFRixNQUFNLHNCQUFzQixHQUFHLEtBQUssRUFBRSxHQUFRLEVBQUUsR0FBUSxFQUFFLEVBQUU7UUFDMUQsTUFBTSxNQUFNLEdBQUcsTUFBTSxHQUFHLENBQUMsc0JBQXNCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzFELEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDbkIsQ0FBQyxDQUFDO0lBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxzQkFBc0IsQ0FBQyxDQUFDO0lBQ3JELEdBQUcsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLEVBQUUsaUJBQWlCLENBQUMsQ0FBQztJQUMvQyxHQUFHLENBQUMsR0FBRyxDQUFDLDRCQUE0QixFQUFFLHNCQUFzQixDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELGVBQWUsaUJBQWlCLENBQUMifQ==