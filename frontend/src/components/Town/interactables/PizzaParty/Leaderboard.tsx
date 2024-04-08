import React, { useEffect, useState } from "react";
import { retrieveAllLeaderboardData } from "./client";

export default function LeaderBoard(): JSX.Element {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await retrieveAllLeaderboardData();
        setScores(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      }
    };

    fetchData();

    // Clean-up function to avoid memory leaks if necessary
    return () => {
      // Clean-up logic here if needed
    };
  }, []); // Empty dependency array to run the effect only once when the component mounts

  return (
    <div>
      <h1>Leaderboard</h1>
      <ol>
        {scores.map((score, index) => (
          <li key={index}>
            {score.username} - {score.score}
          </li>
        ))}
      </ol>
    </div>
  );
}
