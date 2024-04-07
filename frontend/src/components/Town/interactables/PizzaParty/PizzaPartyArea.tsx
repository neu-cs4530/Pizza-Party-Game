import React, { useEffect, useState } from 'react';

import { useInteractableAreaController } from '../../../../classes/TownController';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import PizzaPartyGame from './PizzaPartyGame';
import { useToast } from '@chakra-ui/react';

export default function PizzaPartyArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<PizzaPartyAreaController>(interactableID);
  const townController = useTownController();
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [joiningGame, setJoiningGame] = useState(false);
  const toast = useToast();

  const [score, setScore] = useState<number>(gameAreaController.game.currentScore);
  const [player, setPlayer] = useState<string | undefined>(gameAreaController.game.player);
  useEffect(() => {
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setScore(gameAreaController.game.currentScore);
      setPlayer(gameAreaController.game.player);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      toast({
        title: 'Game over',
        description: `You lost :(`,
        status: 'error',
      });
    };
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
    };
  }, [townController, gameAreaController, toast]);
  if (gameStatus !== 'IN_PROGRESS') {
    return (
      <div>
        <h1>Pizza Party Game</h1>
        <p>Waiting to start game</p>
        <button
          onClick={async () => {
            setJoiningGame(true);
            try {
              await gameAreaController.joinGame();
              await gameAreaController.startGame();
              console.log('NSFJNDJSNDFNSKNSK');
            } catch (err) {
              toast({
                title: 'Error joining game',
                description: (err as Error).toString(),
                status: 'error',
              });
            }
            setJoiningGame(false);
          }}>
          Start Game
        </button>
      </div>
    );
  }
  return (
    <div>
      <h1>Pizza Party Game</h1>
      <PizzaPartyGame gameAreaController={gameAreaController} />
    </div>
  );
}
