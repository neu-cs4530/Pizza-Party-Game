import * as dao from './dao.js';

function PizzaRoutes(app: any) {
  const createPizza = async (req: any, res: any) => {
    const pizza = await dao.createPizza(req.body);
    res.json(pizza);
  };

  const retrieveAllPizzasByOrder = async (req: any, res: any) => {
    const pizzas = await dao.retrieveAllPizzasByOrder(req.body);
    res.json(pizzas);
  };

  app.post('/api/pizza', createPizza);
  app.get('/api/order/:orderId', retrieveAllPizzasByOrder);
}

export default PizzaRoutes;
