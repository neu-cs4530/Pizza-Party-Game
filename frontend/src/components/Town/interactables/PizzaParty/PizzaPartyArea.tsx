import React, { useEffect, useState } from 'react';

import { useInteractableAreaController } from '../../../../classes/TownController';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import useTownController from '../../../../hooks/useTownController';
import { GameStatus, InteractableID } from '../../../../types/CoveyTownSocket';
import PizzaPartyGame from './PizzaPartyGame';
import { toast, useToast } from '@chakra-ui/react';
import { createStyles, makeStyles, Theme } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chatWindowContainer: {
      'pointerEvents': 'auto',
      'background': '#FFFFFF',
      'zIndex': 1000,
      'display': 'flex',
      'flexDirection': 'column',
      'borderLeft': '1px solid #E4E7E9',
      [theme.breakpoints.down('sm')]: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        zIndex: 100,
      },
      'position': 'fixed',
      'bottom': 0,
      'left': 0,
      'top': 0,
      'max-width': '250px',
    },
    hide: {
      display: 'none',
    },
  }),
);


export default function PizzaPartyArea({
  interactableID,
}: {
  interactableID: InteractableID;
}): JSX.Element {
  const gameAreaController =
    useInteractableAreaController<PizzaPartyAreaController>(interactableID);
  const classes = useStyles();
  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      parent: 'map-container',
      render: { pixelArt: true, powerPreference: 'high-performance' },
      scale: {
        expandParent: false,
        mode: Phaser.Scale.ScaleModes.WIDTH_CONTROLS_HEIGHT,
        autoRound: true,
      },
      width: 800,
      height: 600,
      fps: { target: 30 },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 }, // Top down game, so no gravity
        },
      },
    }
    const game = new Phaser.Game(config);
    const newGameScene = new PizzaPartyScene(gameAreaController);
    game.scene.add('pizzaPartyGame', newGameScene, true);
    const pauseListener = newGameScene.pause.bind(newGameScene);
    const unPauseListener = newGameScene.resume.bind(newGameScene);
    gameAreaController.addListener('pause', pauseListener);
    gameAreaController.addListener('unPause', unPauseListener);
    const updateGameState = () => {
      setGameStatus(gameAreaController.status || 'WAITING_TO_START');
      setScore(gameAreaController.score);
      setPlayer(gameAreaController.player);
    };
    gameAreaController.addListener('gameUpdated', updateGameState);
    const onGameEnd = () => {
      toast({
        title: 'Game over',
        description: `Your score is ${gameAreaController.score}!`,
        status: 'error',
      });
    };
    gameAreaController.addListener('gameEnd', onGameEnd);
    return () => {
      gameAreaController.removeListener('pause', pauseListener);
      gameAreaController.removeListener('unPause', unPauseListener);
      gameAreaController.removeListener('gameEnd', onGameEnd);
      gameAreaController.removeListener('gameUpdated', updateGameState);
      game.destroy(true);
    };
  }, [gameAreaController]);

  const townController = useTownController();
  const [gameStatus, setGameStatus] = useState<GameStatus>(gameAreaController.status);
  const [score, setScore] = useState<number>(gameAreaController.currentScore);
  const [player, setPlayer] = useState<string | undefined>(gameAreaController.player);
  const toast = useToast();

  useEffect(() => {
    
    return () => {

    };
  }, [townController, gameAreaController, toast]);

  return (
    <div>
      <h1>Pizza Party Game</h1>
      <PizzaPartyGame gameAreaController={gameAreaController} />
    </div>
  );
}
