import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import * as background from '../../../../../public/assets/pizza-party/background.png';
import Pizza from './Pizza';
import Customer from './Customer';
import { Customer as CustomerType } from '../../../../types/CoveyTownSocket';

export type PizzaPartyGameProps = {
  gameAreaController: PizzaPartyAreaController;
};

// To-Do: Add controller functionality in here
export default function PizzaPartyGame({ gameAreaController }: PizzaPartyGameProps): JSX.Element {
  const [currentCustomers, setCurrentCustomers] = useState(gameAreaController.currentCustomers);
  console.log(currentCustomers);
  const [currentPizza, setCurrentPizza] = useState(gameAreaController.currentPizza);
  const [currentScore, setCurrentScore] = useState(gameAreaController.currentScore);
  const [currentGame, setCurrentGame] = useState(gameAreaController.game);
  useEffect(() => {
    const intervalId = setInterval(() => {
      const index = gameAreaController.findEmptySeat();
      console.log(index);
      if (index !== -1 && index !== undefined && currentCustomers !== undefined) {
        currentCustomers[index] = gameAreaController.generateRandomCustomer();
        console.log('hello');
        console.log(currentCustomers);
      }
    }, 3000);
    gameAreaController.addListener('customerChanged', setCurrentCustomers);
    gameAreaController.addListener('pizzaChanged', setCurrentPizza);
    gameAreaController.addListener('scoreChanged', setCurrentScore);
    gameAreaController.addListener('gameChanged', setCurrentGame);
    return () => {
      gameAreaController.removeListener('customerChanged', setCurrentCustomers);
      gameAreaController.removeListener('pizzaChanged', setCurrentPizza);
      gameAreaController.removeListener('scoreChanged', setCurrentScore);
      gameAreaController.removeListener('gameChanged', setCurrentGame);
      clearInterval(intervalId);
    };
  }, [currentGame, currentCustomers]);

  return (
    <div>
      <Image
        src={background}
        alt='Pizza Party Game'
        layout='fill'
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <div style={{ position: 'absolute', top: 425, left: 55, width: '100%', height: '100%' }}>
        <Pizza pizza={currentPizza} />
      </div>
      <div style={{ display: 'flex', position: 'absolute', left: 7 }}>
        {currentGame?.currentCustomers?.map((customer, index) =>
          customer.name !== 'Empty' ? (
            <div style={{ marginRight: 30 }} key={index}>
              <Customer customer={customer} />
            </div>
          ) : (
            <div style={{ marginRight: 30 }} key={index}></div>
          ),
        )}
      </div>
    </div>
  );
}
