import * as dao from './dao.js';

function ToppingRoutes(app: any) {
  const createTopping = async (req: any, res: any) => {
    const topping = await dao.createTopping(req.body);
    res.json(topping);
  };

  const retrieveAllToppingsByPizza = async (req: any, res: any) => {
    const toppings = await dao.retrieveAllToppingsByPizza(req.body);
    res.json(toppings);
  };

  app.post('/api/topping', createTopping);
  app.get('/api/topping/:pizzaId', retrieveAllToppingsByPizza);
}

export default ToppingRoutes;
