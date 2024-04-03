import { useState } from 'react';
import { Order as OrderType, Pizza, Topping } from '../../../../types/CoveyTownSocket';
import * as speechBubble from '../../../../../public/assets/pizza-party/speech-bubble.png';

export interface OrderProps {
  order: OrderType;
}

const toppingsToString = (toppings: Topping[]): string[] => {
  const toppingsFormatted: string[] = [];
  toppings.forEach(topping => {
    toppingsFormatted.push(topping.kind);
  });
  return toppingsFormatted;
};

const pizzaDisplay = (pizza: Pizza) => {
  const toppingsFormatted = toppingsToString(pizza.toppings);
  return (
    <div>
      <h2>Pizza</h2>
      <p>{toppingsFormatted}</p>
    </div>
  );
};

export default function Order({ order }: OrderProps): JSX.Element {
  const [currentOrder, _] = useState<OrderType>(order);
  return (
    <div
      style={{
        backgroundImage: speechBubble,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundColor: 'white',
        borderRadius: 50,
        textAlign: 'center',
      }}>
      <h1 style={{ fontSize: 'small' }}>Order</h1>
      <div>{order.pizzas.map(pizza => pizzaDisplay(pizza))}</div>
    </div>
  );
}
