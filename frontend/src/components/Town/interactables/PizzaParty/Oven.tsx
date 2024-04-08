import { Topping } from "../../../../types/CoveyTownSocket";
import { Button } from "@chakra-ui/react";

export type ToppingProps = {
  topping: Topping;
};

export default function Topping({ topping }: ToppingProps): JSX.Element {

  const onClick = () => {
    console.log('Topping clicked');
    // TODO - Add logic to add on pizza 
  }
  let toppingImage = '';

  switch (topping.kind) {
    case 'pepperoni':
      toppingImage = '/assets/pizza-party/pepperoni.png';
      break;
    case 'mushrooms':
      toppingImage = '/assets/pizza-party/mushrooms.png';
      break;
    case 'anchovies':
      toppingImage = '  /assets/pizza-party/anchovies.png';
      break;
    case 'olives':
      toppingImage = '/assets/pizza-party/olives.png';
      break;
    case 'onions':
      toppingImage = '/assets/pizza-party/onions.png';
      break;
    case 'peppers':
      toppingImage = '/assets/pizza-party/peppers.png';
      break;
    case 'sausage':
      toppingImage = '/assets/pizza-party/sausage.png';
      break;
    default:
      // handle default case here if needed
      break;
  }

  return (
    <Button
      onClick={onClick} // Pass onClick function
      bgImage={`url(${toppingImage})`}
      bgSize="cover"
      bgRepeat="no-repeat"
      width="200px" // Adjust width according to your design
      height="200px" // Adjust height according to your design
      position="relative"
      _hover={{ cursor: 'pointer' }} // Change cursor on hover
    >
    </Button>
  );
}
