import React from 'react';
import Image from 'next/image';
import { Customer as CustomerType, Order as OrderType } from '../../../../types/CoveyTownSocket';
import * as customerSprite from '../../../../../public/assets/pizza-party/customer.png';
import { useState } from 'react';
import Order from './Order';

export type CustomerProps = {
  customer: CustomerType;
};

export default function Customer({ customer }: CustomerProps): JSX.Element {
  const [currentCustomer, setCurrentCustomer] = useState<CustomerType>(customer);
  return (
    <div>
      <Image src={customerSprite} alt='Customer' />
      <div style={{ position: 'relative', top: '-10px' }}>
        <Order order={currentCustomer.order} />
      </div>
    </div>
  );
}