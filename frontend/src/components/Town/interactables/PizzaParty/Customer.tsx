import React from 'react';
import Image from 'next/image';
import { Customer as CustomerType, Order as OrderType } from '../../../../types/CoveyTownSocket';
import * as customerSprite from '../../../../../public/assets/pizza-party/customer.png';
import { useState } from 'react';
import Order from './Order';

export type CustomerProps = {
  customer: CustomerType;
};

const mockOrder: OrderType = {
  pizzas: [
    {
      id: 0,
      toppings: [
        {
          id: 0,
          kind: 'pepperoni',
          appliedOnPizza: false,
        },
        {
          id: 0,
          kind: 'anchovies',
          appliedOnPizza: false,
        },
      ],
      cooked: false,
      isInOven: false,
    },
  ],
};

export default function Customer({ customer }: CustomerProps): JSX.Element {
  const [currentCustomer, setCurrentCustomer] = useState<CustomerType>(customer);
  return (
    <div>
      <Order order={mockOrder} />
      <Image src={customerSprite} alt='Customer' />
      <div style={{ position: 'relative', top: '-10px' }}></div>
    </div>
  );
}
