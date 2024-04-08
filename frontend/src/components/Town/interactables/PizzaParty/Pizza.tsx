import React from 'react';
import Image from 'next/image';
import { Pizza as PizzaType } from '../../../../types/CoveyTownSocket';
import * as pizzaBase from '../../../../../public/assets/pizza-party/raw-pizzas/dough.png';
import { useState } from 'react';

export type PizzaProps = {
  pizza: PizzaType | undefined;
};

export default function Pizza({ pizza }: PizzaProps): JSX.Element {
  const [currentPizza, setCurrentPizza] = useState<PizzaType | undefined>(pizza);
  return <Image src={pizzaBase} alt='Pizza base' width={200} height={100} />;
}
