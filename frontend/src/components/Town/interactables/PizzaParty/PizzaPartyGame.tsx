import React, { useEffect, useState } from 'react';

import Image from 'next/image';
import PizzaPartyAreaController from '../../../../classes/interactable/PizzaPartyAreaController';
import Pizza from './Pizza';
import Customer from './Customer';
import {
  Customer as CustomerType,
  Topping as ToppingType,
} from '../../../../types/CoveyTownSocket';
import Topping from './Topping';
import { ToppingOptions } from '../../../../types/CoveyTownSocket';
import ToppingTray from './ToppingTray';
import Oven from './Oven';
import Trash from './Trash';

export type PizzaPartyGameProps = {
  gameAreaController: PizzaPartyAreaController;
};

const TOPPINGS_LIST: ToppingOptions[] = [
  'pepperoni',
  'mushrooms',
  'anchovies',
  'olives',
  'onions',
  'peppers',
  'sausage',
];

// To-Do: Add controller functionality in here
export default function PizzaPartyGame({ gameAreaController }: PizzaPartyGameProps): JSX.Element {
  const [currentCustomers, setCurrentCustomers] = useState(gameAreaController.currentCustomers);
  const [currentPizza, setCurrentPizza] = useState(gameAreaController.currentPizza);
  const [currentScore, setCurrentScore] = useState(gameAreaController.currentScore);
  const [currentGame, setCurrentGame] = useState(gameAreaController.game);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const index = gameAreaController.findEmptySeat();
      if (
        index !== -1 &&
        index !== undefined &&
        currentCustomers !== undefined &&
        gameAreaController.currentCustomers !== undefined
      ) {
        const newCustomers = [...currentCustomers];
        const customer = gameAreaController.generateRandomCustomer();
        newCustomers[index] = customer;
        gameAreaController.currentCustomers[index] = customer;
        setCurrentCustomers(newCustomers);
        console.log('hello');
        console.log(currentCustomers);
      }
    }, 3000);
    gameAreaController.addListener('customerChanged', setCurrentCustomers);
    gameAreaController.addListener('pizzaChanged', setCurrentPizza);
    gameAreaController.addListener('scoreChanged', setCurrentScore);
    gameAreaController.addListener('gameChanged', setCurrentGame);
    return () => {
      gameAreaController.removeListener('customerChanged', setCurrentCustomers);
      gameAreaController.removeListener('pizzaChanged', setCurrentPizza);
      gameAreaController.removeListener('scoreChanged', setCurrentScore);
      gameAreaController.removeListener('gameChanged', setCurrentGame);
      clearInterval(intervalId);
    };
  }, [currentGame, currentCustomers, currentPizza, gameAreaController]);

  function applyTopping(topp: ToppingOptions): void {
    const top = {
      id: Math.floor(Math.random() * 1000),
      kind: topp,
      appliedOnPizza: false,
    };
    gameAreaController.makeMove({
      topping: top,
      pizza: currentPizza,
      customer: undefined,
      gamePiece: 'placeTopping',
    });
    console.log(currentPizza);
  }

  return (
    <div>
      <div>
        <Image
          src={'/assets/pizza-party/background.png'}
          alt='Pizza Party Game'
          layout='fill'
          style={{ position: 'absolute', top: 0, left: 0 }}
        />
        <div style={{ position: 'absolute', top: 425, left: 55, width: '100%', height: '100%' }}>
          <Pizza pizza={currentPizza} toppings={currentPizza?.toppings} />
        </div>
        <div style={{ display: 'flex', position: 'absolute', left: 7 }}>
          {currentCustomers?.map((customer, index) =>
            customer.name !== 'Empty' ? (
              <div style={{ marginRight: 30 }} key={index}>
                <Customer customer={customer} />
              </div>
            ) : (
              <div style={{ marginRight: 30 }} key={index}></div>
            ),
          )}
        </div>
        <div style={{ position: 'absolute', top: 350, left: 480 }}>
          <Oven />
        </div>
        <div style={{ position: 'absolute', top: 430, left: 410 }}>
          <Trash />
        </div>
        <div style={{ display: 'flex', position: 'absolute', left: 7, top: 350 }}>
          {TOPPINGS_LIST.map((topping, index) => {
            return (
              <div key={index} style={{ marginRight: 30 }} onClick={() => applyTopping(topping)}>
                <ToppingTray topping={topping} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', position: 'absolute', top: 400 }}>
          <ToppingTray topping={'sauce'} />
          <ToppingTray topping={'cheese'} />
        </div>
      </div>
      <div>
        <div>Instructions</div>
        <div></div>
      </div>
    </div>
  );
}
