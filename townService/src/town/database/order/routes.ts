import * as dao from './dao.js';

function OrderRoutes(app: any) {
  const createOrder = async (req: any, res: any) => {
    const order = await dao.createOrder(req.body);
    res.json(order);
  };

  const retrieveAllOrdersByCustomer = async (req: any, res: any) => {
    const orders = await dao.retrieveAllOrdersByCustomer(req.body);
    res.json(orders);
  };

  app.post('/api/order', createOrder);
  app.get('/api/order/:customerId', retrieveAllOrdersByCustomer);
}

export default OrderRoutes;
