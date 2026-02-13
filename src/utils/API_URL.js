import { api_url } from "../env.js";

export const API_URL = {
  post: {
    makePaymentCartAuth: `${api_url}/makePaymentCartAuth`,
    login: `${api_url}/login`,
    register: `${api_url}/register`,
    logout: `${api_url}/logout`,
    // carrito
    addProductToTable: (productId) => `${api_url}/cart/items/${productId}`,
    // NUEVO: crear dirección
    userAddress: `${api_url}/user/addresses`,
  },

  get: {
    verifyCheckoutSession: (id) => `${api_url}/stripe/session/${id}`,
    user: `${api_url}/user`,
    menu: `${api_url}/menu`,
    cartAuth: `${api_url}/cartAuth`,
    fetchCart: `${api_url}/fetchCart`,
  },

  patch: {
    cartItemQty: (cartItemId) => `${api_url}/cart/items/${cartItemId}`,
    user: `${api_url}/user`,
    userAddress: (id) => `${api_url}/user/addresses/${id}`,
  },

  del: {
    cartItem: (cartItemId) => `${api_url}/cart/items/${cartItemId}`,
    userAddress: (id) => `${api_url}/user/addresses/${id}`,
  },
};
