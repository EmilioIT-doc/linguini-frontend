// src/store/cartSlice.js
import { createSlice } from "@reduxjs/toolkit";

const GUEST_KEY = "guest_cart_items";

const loadGuest = () => {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveGuest = (items) => {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch { }
};

const initialState = {
  guestItems: loadGuest(),
  authItems: [],
  authCount: 0,
};


const upsertItem = (items, payload) => {
  const { product_id, quantity = 1, name, unit_price } = payload;

  const idx = items.findIndex((x) => x.product_id === product_id);
  if (idx >= 0) {
    items[idx].quantity = (Number(items[idx].quantity) || 0) + (Number(quantity) || 0);
  } else {
    items.push({
      product_id,
      name,
      unit_price,
      quantity: Number(quantity) || 1,
    });
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // ✅ Guest
    addGuestItem: (state, action) => {
      upsertItem(state.guestItems, action.payload);
      saveGuest(state.guestItems);
    },
    removeGuestItem: (state, action) => {
      state.guestItems = state.guestItems.filter((x) => x.product_id !== action.payload);
      saveGuest(state.guestItems);
    },
    clearGuestCart: (state) => {
      state.guestItems = [];
      saveGuest([]);
    },

    setGuestItems(state, action) {
      state.guestItems = action.payload || [];
    },
    setAuthCountCart(state, action) {          // ✅ NUEVO
      state.authCount = Number(action.payload || 0);
    },

    // ✅ Auth (DB)
    setAuthCart: (state, action) => {
      state.authItems = action.payload || [];
    },
    addAuthItem: (state, action) => {
      upsertItem(state.authItems, action.payload);
    },
    removeAuthItem: (state, action) => {
      state.authItems = state.authItems.filter((x) => x.product_id !== action.payload);
    },
    clearAuthCart: (state) => {
      state.authItems = [];
    },
    clearCart(state) {
      state.guestItems = [];
    },
    // cartSlice.js (reducers)
    setAuthItems: (state, action) => {
      state.authItems = Array.isArray(action.payload) ? action.payload : [];
    },
    clearAuthItems: (state) => {
      state.authItems = [];
    },

  },
});

export const {
  addGuestItem,
  removeGuestItem,
  clearGuestCart,
  setAuthCart,
  setAuthItems,
  clearAuthItems,
  addAuthItem,
  removeAuthItem,
  clearAuthCart,
  setGuestItems, setAuthCountCart, clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
