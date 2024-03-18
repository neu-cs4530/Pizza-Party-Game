import * as dao from './dao.js';

function ToppingRoutes(app: any) {
  const createTopping = async (req: any, res: any) => {
    const topping = await dao.createTopping(req.body);
    res.json(topping);
  };

  const retrieveAllToppingsByPizza = async (req: any, res: any) => {
    const pizzas = await dao.retrieveAllToppingsByPizza(req.body);
    res.json(pizzas);
  };

  app.post('/api/pizza', createTopping);
  app.get('/api/order/:pizzaId', retrieveAllToppingsByPizza);
}

export default ToppingRoutes;
