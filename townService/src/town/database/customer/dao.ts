import model from './model';

export const createCustomer = (customer: any) => model.create(customer);
export const retrieveAllCustomers = () => model.find();
export const retrieveCustomersByPlayer = (playerId: any) => model.find({ playerId });
