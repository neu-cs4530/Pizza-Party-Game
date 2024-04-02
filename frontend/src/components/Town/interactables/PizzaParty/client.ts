import axios from 'axios';

export const BASE_API = process.env.REACT_APP_BASE_API_URL || 'http://localhost:8081';

export const createLeaderboardEntry = async (entry: any) => {
  const response = await axios.post(`${BASE_API}/leaderboard`, entry);
  return response.data;
};

export const retrieveAllLeaderboardData = async () => {
  const response = await axios.get(`${BASE_API}/leaderboard`);
  return response.data;
};

export const retieveScoresByPlayer = async (playerId: any) => {
  const response = await axios.get(`${BASE_API}/leaderboard/${playerId}`);
  return response.data;
};

export const createCustomer = async (customer: any) => {
  const response = await axios.post(`${BASE_API}/customer`, customer);
  return response.data;
};

export const retrieveAllCustomers = async () => {
  const response = await axios.get(`${BASE_API}/customer`);
  return response.data;
};

export const retrieveCustomersByPlayer = async (playerId: any) => {
  const response = await axios.get(`${BASE_API}/customer/${playerId}`);
  return response.data;
};

export const createOrder = async (topping: any) => {
  const response = await axios.post(`${BASE_API}/order`, topping);
  return response.data;
};

export const retrieveOrdersFromCustomer = async (customerId: any) => {
  const response = await axios.get(`${BASE_API}/order/${customerId}`);
  return response.data;
};

export const createPizza = async (pizza: any) => {
  const response = await axios.post(`${BASE_API}/pizza`, pizza);
  return response.data;
};

export const retrievePizzasFromOrder = async (orderId: any) => {
  const response = await axios.get(`${BASE_API}/pizza/${orderId}`);
  return response.data;
};

export const createTopping = async (topping: any) => {
  const response = await axios.post(`${BASE_API}/topping`, topping);
  return response.data;
};

export const retrieveToppingsByPizza = async (pizzaId: any) => {
  const response = await axios.get(`${BASE_API}/topping/${pizzaId}`);
  return response.data;
};
