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
  useEffect(() => {
    const addCustomer = (newCustomer: CustomerType) => {
      setCurrentCustomers(prevCustomers => [...prevCustomers, newCustomer]);
    };
    addCustomer(gameAreaController.game.currentCustomers[4]);
  }, []);

  return (
    <div>
      <Image
        src={background}
        alt='Pizza Party Game'
        layout='fill'
        style={{ position: 'absolute', top: 0, left: 0 }}
      />
      <div style={{ position: 'absolute', top: 425, left: 55, width: '100%', height: '100%' }}>
        <Pizza pizza={gameAreaController.currentPizza} />
      </div>
      <div style={{ display: 'flex', position: 'absolute', left: 7 }}>
        {currentCustomers.map((customer, index) => (
          <div style={{ marginRight: 30  }} key={index}>
            <Customer customer={customer} />
          </div>
        ))}
      </div>
    </div>
  );
}
