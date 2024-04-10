import React, { useEffect, useState } from 'react';
import { retrieveAllLeaderboardData } from './client';
import Image from 'next/image';

export interface Score {
  _id: string;
  playerId: string;
  score: number;
}

export default function LeaderBoard(): JSX.Element {
  const [scores, setScores] = useState<Score[]>(); // TODO - Pull out mock scores

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await retrieveAllLeaderboardData();
        data.sort((a: Score, b: Score) => a.score - b.score);
        setScores(data.slice(0, 10));
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run the effect only once when the component mounts

  return (
    <div>
      <Image
        src={'/assets/pizza-party/leaderboard-background.png'}
        alt='Background Image'
        layout='fill'
        unoptimized={true}
      />
      <div style={{ position: 'absolute', zIndex: 1, left: 225 }}>
        <h1>Leaderboard</h1>
        <ol>
          {scores?.map((score, index) => (
            <li key={index}>
              {score.playerId} - {score.score}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
