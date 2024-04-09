import React, { useEffect, useState } from "react";
import { retrieveAllLeaderboardData } from "./client";
import Image from 'next/image';

export interface Score {
  _id: string;
  playerId: string;
  score: number;
}

const mockScores : Score[] = [
  {
    _id: "1",
    playerId: "Player 1",
    score: 100,
  },
  {
    _id: "2",
    playerId: "Player 2",
    score: 200,
  },
  {
    _id: "3",
    playerId: "Player 3",
    score: 300,
  },
  {
    _id: "4",
    playerId: "Player 4",
    score: 400,
  },
  {
    _id: "5",
    playerId: "Player 5",
    score: 500,
  },
  {
    _id: "6",
    playerId: "Player 6",
    score: 600,
  },
  {
    _id: "7",
    playerId: "Player 7",
    score: 700,
  },
  {
    _id: "8",
    playerId: "Player 8",
    score: 800,
  },
  {
    _id: "9",
    playerId: "Player 9",
    score: 900,
  },
  {
    _id: "10",
    playerId: "Player 10",
    score: 1000,
  },
]

export default function LeaderBoard(): JSX.Element {
  const [scores, setScores] = useState<Score[]>(mockScores); // TODO - Pull out mock scores

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

  }, []); // Empty dependency array to run the effect only once when the component mounts

  return (
    <div>
    <Image
      src={'/assets/pizza-party/leaderboard-background.png'}
      alt="Background Image"
      layout="fill"
    />
    <div style={{ position: "absolute", zIndex: 1 ,left: 225}}>
      <h1>Leaderboard</h1>
      <ol>
        {scores.map((score, index) => (
          <li key={index}>
            {score.playerId} - {score.score}
          </li>
        ))}
      </ol>
    </div>
  </div>
  );
}
