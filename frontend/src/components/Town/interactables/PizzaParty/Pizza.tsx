import Image from 'next/image';
import { Pizza as PizzaType, Topping as ToppingType } from '../../../../types/CoveyTownSocket';
import { useState, useEffect } from 'react';
import Topping from './Topping';
import React from 'react';

export type PizzaProps = {
  pizza: PizzaType | undefined;
  toppings: ToppingType[] | undefined;
};

export default function PizzaSprite({ pizza, toppings }: PizzaProps): JSX.Element {
  const [currentPizza, setCurrentPizza] = useState<PizzaType | undefined>(pizza);
  let currentBase = '/assets/pizza-party/raw-pizzas/dough.png';

  const hasSauce = toppings?.some(topping => topping.kind === 'sauce' && topping.appliedOnPizza);

  const hasCheese = toppings?.some(topping => topping.kind === 'cheese' && topping.appliedOnPizza);

  switch (true) {
    case hasCheese && !hasSauce:
      currentBase = '/assets/pizza-party/raw-pizzas/cheese.png';
      break;
    case hasSauce && !hasCheese:
      currentBase = '/assets/pizza-party/raw-pizzas/sauce.png';
      break;
    case hasSauce && hasCheese:
      currentBase = '/assets/pizza-party/raw-pizzas/cheese-and-sauce.png';
      break;
    default:
      currentBase = '/assets/pizza-party/raw-pizzas/dough.png';
      break;
  }

  console.log('currentPizza' + currentPizza);
  if (pizza?.cooked === true) {
    currentBase = currentBase.replace('raw-pizzas', 'baked-pizzas');
  }

  return (
    <div style={{ position: 'relative', width: '200px', height: '100px' }}>
      <Image src={currentBase} width={200} height={100} />
      {toppings?.map((topping, index) => (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          key={index}>
          <Topping topping={topping} />
        </div>
      ))}
    </div>
  );
}
