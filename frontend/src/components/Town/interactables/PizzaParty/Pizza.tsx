import React from 'react';
import Image from 'next/image';
import { Pizza as PizzaType, Topping as ToppingType } from '../../../../types/CoveyTownSocket';
import { useState } from 'react';
import Topping from './Topping';

export type PizzaProps = {
  pizza: PizzaType | undefined;
  toppings: ToppingType[] | undefined;
};

export default function PizzaSprite({ pizza, toppings }: PizzaProps): JSX.Element {
  const [currentPizza, setCurrentPizza] = useState<PizzaType | undefined>(pizza);
  const hasSauce = toppings?.some(topping => topping.kind === 'sauce' && topping.appliedOnPizza);

  const hasCheese = toppings?.some(topping => topping.kind === 'cheese' && topping.appliedOnPizza);
  if (!currentPizza) {
    return <div />;
  }

  return (
    <div style={{ position: 'relative', width: '200px', height: '100px' }}>
      {hasCheese && !hasSauce && (
        <Image src={'/assets/pizza-party/raw-pizzas/cheese.png'} width={200} height={100} />
      )}
      {hasSauce && !hasCheese && (
        <Image src={'/assets/pizza-party/raw-pizzas/sauce.png'} width={200} height={100} />
      )}
      {hasSauce && hasCheese && (
        <Image
          src={'/assets/pizza-party/raw-pizzas/cheese-and-sauce.png'}
          width={200}
          height={100}
        />
      )}
      {!hasSauce && !hasCheese && (
        <Image src={'/assets/pizza-party/raw-pizzas/dough.png'} width={200} height={100} />
      )}
      {toppings?.map((topping, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}>
          <Topping key={index} topping={topping} />
        </div>
      ))}
    </div>
  );
}
