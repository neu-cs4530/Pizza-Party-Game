<<<<<<< HEAD
=======
import React from 'react';

import Image from 'next/image';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';

export type PizzaPartyGameProps = {
  gameAreaController: PizzaPartyAreaController;
};

// To-Do: Add controller functionality in here
export default function PizzaPartyGame({ gameAreaController }: PizzaPartyGameProps): JSX.Element {
  return (
    <div>
      <Image src='/assets/pizza-party/background.png' alt='Pizza Party Game' layout='fill' />
    </div>
  );
}
>>>>>>> 2a3f2abd3c6897d7b80d10eb5fefe120aa37a24f
