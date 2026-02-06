import { api_url } from "../env.js";

export const API_URL = {
  post: {
    login: `${api_url}/login`,
    register: `${api_url}/register`,
    logout: `${api_url}/logout`,
    //Esto esta en la vista de "/menu" de linguini y es para agregar productos al carrito
    addProductToTable: (productId) => `${api_url}/cart/items/${productId}`,
  },
  get: {
    user: `${api_url}/user`,
    menu: `${api_url}/menu`,
    cartAuth:`${api_url}/cartAuth`,
    fetchCart: `${api_url}/fetchCart`
  },
  del: {
    cartItem: (cartItemId) => `${api_url}/cart/items/${cartItemId}`, // DELETE por cart_item id
  },
};
