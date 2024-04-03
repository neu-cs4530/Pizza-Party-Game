import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import * as background from '../../../../../public/assets/pizza-party/background.png';
import Pizza from './Pizza';
import CustomerDisplay from './Customer';
import { Customer } from '../../../../types/CoveyTownSocket';

export type PizzaPartyGameProps = {
  gameAreaController: PizzaPartyAreaController;
};

// To-Do: Add controller functionality in here
export default function PizzaPartyGame({ gameAreaController }: PizzaPartyGameProps): JSX.Element {
  const [currentCustomers, setCurrentCustomers] = useState(
    gameAreaController.game.currentCustomers,
  );
  useEffect(() => {
    const addCustomer = (newCustomer: Customer) => {
      setCurrentCustomers(prevCustomers => [...prevCustomers, newCustomer]);
    };
    // Call addCustomer with a new customer here
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
          <div style={{ marginRight: 30 }} key={index}>
            <CustomerDisplay customer={customer} />
          </div>
        ))}
      </div>
    </div>
  );
}
