import model from './model';

export const createPizza = (pizza: any) => model.create(pizza);
export const retrieveAllPizzasByOrder = (orderId: any) => model.find({ orderId });
