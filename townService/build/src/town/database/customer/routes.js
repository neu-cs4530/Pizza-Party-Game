import * as dao from './dao.js';
function CustomerRoutes(app) {
    const createCustomer = async (req, res) => {
        const customer = await dao.createCustomer(req.body);
        res.json(customer);
    };
    const retrieveAllCustomers = async (req, res) => {
        const customers = await dao.retrieveAllCustomers();
        res.json(customers);
    };
    const retrieveCustomersByPlayer = async (req, res) => {
        const customers = await dao.retrieveCustomersByPlayer(req.body);
        res.json(customers);
    };
    app.post('/api/customer', createCustomer);
    app.get('/api/customer', retrieveAllCustomers);
    app.get('/api/customer/:playerId', retrieveCustomersByPlayer);
}
export default CustomerRoutes;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vc3JjL3Rvd24vZGF0YWJhc2UvY3VzdG9tZXIvcm91dGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sS0FBSyxHQUFHLE1BQU0sVUFBVSxDQUFDO0FBRWhDLFNBQVMsY0FBYyxDQUFDLEdBQVE7SUFDOUIsTUFBTSxjQUFjLEdBQUcsS0FBSyxFQUFFLEdBQVEsRUFBRSxHQUFRLEVBQUUsRUFBRTtRQUNsRCxNQUFNLFFBQVEsR0FBRyxNQUFNLEdBQUcsQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3BELEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDckIsQ0FBQyxDQUFDO0lBRUYsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLEVBQUUsR0FBUSxFQUFFLEdBQVEsRUFBRSxFQUFFO1FBQ3hELE1BQU0sU0FBUyxHQUFHLE1BQU0sR0FBRyxDQUFDLG9CQUFvQixFQUFFLENBQUM7UUFDbkQsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN0QixDQUFDLENBQUM7SUFFRixNQUFNLHlCQUF5QixHQUFHLEtBQUssRUFBRSxHQUFRLEVBQUUsR0FBUSxFQUFFLEVBQUU7UUFDN0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxHQUFHLENBQUMseUJBQXlCLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hFLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEIsQ0FBQyxDQUFDO0lBRUYsR0FBRyxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsY0FBYyxDQUFDLENBQUM7SUFDMUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxlQUFlLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztJQUMvQyxHQUFHLENBQUMsR0FBRyxDQUFDLHlCQUF5QixFQUFFLHlCQUF5QixDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELGVBQWUsY0FBYyxDQUFDIn0=