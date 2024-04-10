import React from 'react';
import Image from 'next/image';
import { Customer as CustomerType, Order as OrderType } from '../../../../types/CoveyTownSocket';
import { useState } from 'react';
import Order from './Order';

export type CustomerProps = {
  customer: CustomerType;
  onClick: () => void;
};

export default function Customer({ customer, onClick }: CustomerProps): JSX.Element {
  return (
    <div>
      <Image
        src={'/assets/pizza-party/customer.png'}
        alt='Customer'
        width={25}
        height={50}
        onClick={onClick}
      />
      <div style={{ position: 'relative', top: '-10px' }}>
        Name: {customer.id}
        <Order order={customer.order} />
      </div>
    </div>
  );
}
