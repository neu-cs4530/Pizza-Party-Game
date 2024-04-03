import React from 'react';
import Image from 'next/image';
import { Customer as CustomerType } from '../../../../types/CoveyTownSocket';
import * as customerSprite from '../../../../../public/assets/pizza-party/customer.png';
import React from 'react';
import { useState } from 'react';

export type CustomerProps = {
  customer: CustomerType;
};

export default function CustomerDisplay({ customer }: CustomerProps): JSX.Element {
  const [currentCustomer, setCurrentCustomer] = useState<CustomerType>(customer);
  return <Image src={customerSprite} alt='Customer' />;
}
