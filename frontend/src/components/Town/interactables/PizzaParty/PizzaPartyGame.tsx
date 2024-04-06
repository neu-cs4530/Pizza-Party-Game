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
  const [currentGame, setCurrentGame] = useState(
    gameAreaController.game,
  );
  useEffect(() => {
    gameAreaController.addListener('gameChanged', setCurrentGame);
    return () => {
      gameAreaController.removeListener('gameChanged', setCurrentGame);
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
        <Pizza pizza={currentGame.state.currentPizza} />
      </div>
      <div style={{ display: 'flex', position: 'absolute', left: 7 }}>
        {currentGame.state.currentCustomers.map((customer, index) => (
          customer ? (
            <div style={{ marginRight: 30 }} key={index}>
              <Customer customer={customer} />
            </div>
          ) : null
        ))}
      </div>
    </div>
  );
}
