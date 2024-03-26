import { Customer, Order, Pizza, Topping, ToppingOptions } from '../../types/CoveyTownSocket';

const TOPPINGS_LIST: ToppingOptions[] = [
  'pepperoni',
  'mushrooms',
  'anchovies',
  'olives',
  'onions',
  'peppers',
  'sausage',
];

const getRandomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const generateRandomTopping = (): Topping => {
  const toppingKind = TOPPINGS_LIST[Math.floor(Math.random() * TOPPINGS_LIST.length)];
  return {
    id: Math.floor(Math.random() * 1000),
    kind: toppingKind,
    appliedOnPizza: false,
  };
};

export const generateRandomPizza = (): Pizza => {
  const numberOfToppings = getRandomInt(1, 7); // Random number of toppings between 1 and 5
  const toppings: Topping[] = [];
  for (let i = 0; i < numberOfToppings; i++) {
    const randomTopping: Topping = generateRandomTopping();
    toppings.push(randomTopping);
  }
  return {
    id: getRandomInt(0, 1000),
    toppings,
    cooked: false,
  };
};

export const generateRandomOrder = (): Order => {
  const numberOfPizzas = getRandomInt(1, 3);
  const pizzas: Pizza[] = [];
  for (let i = 0; i < numberOfPizzas; i++) {
    const randomPizza: Pizza = generateRandomPizza();
    pizzas.push(randomPizza);
  }
  return {
    pizzas,
    pointValue: getRandomInt(1, 10),
  };
};

export const generateRandomCustomer = (): Customer => {
  const customer: Customer = {
    id: getRandomInt(0, 1000),
    name: 'Customer',
    timeRemaining: 100, // add time difficulty
    completed: false,
    order: generateRandomOrder(),
  };
  return customer;
};
