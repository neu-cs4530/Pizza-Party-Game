import model from './model';

export const createTopping = (topping: any) => model.create(topping);
export const retrieveAllToppingsByPizza = (pizzaId: any) => model.find({ pizzaId });
