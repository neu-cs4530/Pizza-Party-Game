import pizzaPartyImage from '../,./../../../../../public/assets/pizza-party/background.png';
import Image from 'next/image'
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import { useState } from 'react';

export type PizzaPartyGameProps = {
  gameAreaController: PizzaPartyAreaController;
};

// To-Do: Add controller functionality in here
export default function PizzaPartyGame({gameAreaController} : PizzaPartyGameProps) : JSX.Element {
  return(
    <div>
    <Image src={pizzaPartyImage} alt="Pizza Party Game" />
    </div>
  );
}