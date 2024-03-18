import * as dao from './dao.js';

function CustomerRoutes(app: any) {
  const createCustomer = async (req: any, res: any) => {
    const customer = await dao.createCustomer(req.body);
    res.json(customer);
  };

  const retrieveAllCustomers = async (req: any, res: any) => {
    const customers = await dao.retrieveAllCustomers();
    res.json(customers);
  };

  const retrieveCustomersByPlayer = async (req: any, res: any) => {
    const customers = await dao.retrieveCustomersByPlayer(req.body);
    res.json(customers);
  };

  app.post('/api/customer', createCustomer);
  app.get('/api/customer', retrieveAllCustomers);
  app.get('/api/customer/:playerId', retrieveCustomersByPlayer);
}

export default CustomerRoutes;
