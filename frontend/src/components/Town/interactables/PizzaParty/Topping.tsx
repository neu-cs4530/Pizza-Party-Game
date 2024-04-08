import { Topping as ToppingType } from "../../../../types/CoveyTownSocket";
import Image from "next/image"

export type ToppingProps = {
  topping: ToppingType;
};

export default function Topping({ topping }: ToppingProps): JSX.Element {
  let imageSource = '';
  switch (topping.kind) {
    case 'pepperoni':
      imageSource = "/assets/pizza-party/pizza-toppings/pepperoni.png";
      break;
    case 'mushrooms':
      imageSource = "/assets/pizza-party/pizza-toppings/mushrooms.png";
      break;
    case 'anchovies':
      imageSource = '/assets/pizza-party/pizza-toppings/anchovies.png';
      break;
    case 'olives':
      imageSource = "/assets/pizza-party/pizza-toppings/olives.png";
      break;
    case 'onions':
      imageSource = '/assets/pizza-party/pizza-toppings/onions.png';
      break;
    case 'peppers':
      imageSource = '/assets/pizza-party/pizza-toppings/peppers.png';
      break;
    case 'sausage':
      imageSource = '/assets/pizza-party/pizza-toppings/sausage.png';
      break;
  }

  return (
    <button
    onClick={() => console.log('Topping clicked')}
    >
      <Image src={imageSource} alt={topping.kind} width={200} height={200} />
    </button>
  )
}

