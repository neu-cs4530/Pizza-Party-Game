import { Topping } from "../../../../types/CoveyTownSocket";
import { Button } from "@chakra-ui/react";

export type ToppingProps = {
  topping: Topping;
};

export default function Topping({ topping }: ToppingProps): JSX.Element {
  let imageSource = '';
  switch (topping.kind) {
    case 'pepperoni':
      imageSource = '/path/to/pepperoni_image.png';
      break;
    case 'mushrooms':
      imageSource = '/path/to/mushrooms_image.png';
      break;
    case 'anchovies':
      imageSource = '/path/to/anchovies_image.png';
      break;
    case 'olives':
      imageSource = '/path/to/olives_image.png';
      break;
    case 'onions':
      imageSource = '/path/to/onions_image.png';
      break;
    case 'peppers':
      imageSource = '/path/to/peppers_image.png';
      break;
    case 'sausage':
      imageSource = '/path/to/sausage_image.png';
      break;
  }

  return (
    <Button>
      <img src={imageSource} alt={topping} />
    </Button>
  )
}

