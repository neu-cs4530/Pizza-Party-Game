import React from 'react';
import Image from 'next/image';
import { Pizza as PizzaType, Topping as ToppingType } from '../../../../types/CoveyTownSocket';
import { useState } from 'react';
import Topping from './Topping';

export type PizzaProps = {
  pizza: PizzaType | undefined;
  toppings: ToppingType[] | undefined;
};

export default function Pizza({ pizza, toppings }: PizzaProps): JSX.Element {
  const [currentPizza, setCurrentPizza] = useState<PizzaType | undefined>(pizza);

  if (!currentPizza) {
    return <div />;
  }
  return (
    <div>
      <Image
        src={'/assets/pizza-party/raw-pizzas/dough.png'}
        alt='Pizza base'
        width={200}
        height={100}
      />
      {toppings.map((topping, index) => (
        <Topping key={index} topping={topping} />
      ))}
    </div>
  );
}
