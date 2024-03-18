import model from './model';

export const createOrder = (order: any) => model.create(order);
export const retrieveAllOrdersByCustomer = (customerId: any) => model.find({ customerId });
