import React, { useEffect } from 'react';
import Image from 'next/image';
import { Customer as CustomerType, Order as OrderType } from '../../../../types/CoveyTownSocket';
import { useState } from 'react';
import Order from './Order';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';

export type CustomerProps = {
  customer: CustomerType;
  game: PizzaPartyAreaController;
};

export default function Customer({ customer, game }: CustomerProps): JSX.Element {
  const [currentCustomer, setCurrentCustomer] = useState<CustomerType>(customer);
  const [timer, setTimer] = useState<number>(customer.timeRemaining);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (timer > 0) {
        setTimer(timer - 1);
      } else {
        game.endGame();
        clearInterval(intervalId);
      }
    }, 1000);
    return () => clearInterval(intervalId);
  }, [timer]);

  return (
    <div style={{ position: 'relative', top: '-20px' }}>
      <div style={{ position: 'relative', top: '-20px' }}>{timer}</div>
      <div style={{ position: 'relative', top: '-20px' }}>
        <Order order={currentCustomer.order} />
      </div>
      <Image
        src={'/assets/pizza-party/customer.png'}
        alt='Customer'
        width={50}
        height={100}
        unoptimized={true}
      />
    </div>
  );
}
