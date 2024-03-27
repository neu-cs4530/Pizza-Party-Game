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
      <Image src="../../../../../public/assets/pizza-party/background.png" alt='Pizza Party Game' />
    </div>
  );
}
