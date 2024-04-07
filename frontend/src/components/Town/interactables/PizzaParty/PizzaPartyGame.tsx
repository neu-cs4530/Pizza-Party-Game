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
  const [currentCustomers, setCurrentCustomers] = useState(
    gameAreaController.game.currentCustomers,
  );
  const [currentPizza, setCurrentPizza] = useState(gameAreaController.game.currentPizza);
  const [currentScore, setCurrentScore] = useState(gameAreaController.game.currentScore);
  useEffect(() => {
    gameAreaController.addListener('gameChanged', setCurrentCustomers);
    gameAreaController.addListener('gameChanged', setCurrentPizza);
    gameAreaController.addListener('gameChanged', setCurrentScore);
    return () => {
      gameAreaController.removeListener('gameChanged', setCurrentCustomers);
      gameAreaController.removeListener('gameChanged', setCurrentPizza);
      gameAreaController.removeListener('gameChanged', setCurrentScore);
    };
  }, [gameAreaController]);

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
        {currentCustomers.map((customer, index) =>
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
