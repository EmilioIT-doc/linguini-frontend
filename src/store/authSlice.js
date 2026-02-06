import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("access_token") || null,
  tokenType: localStorage.getItem("token_type") || null,
  name: localStorage.getItem("user_name") || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuth: (state, action) => {
      const { access_token, token_type, name } = action.payload;

      state.token = access_token;
      state.tokenType = token_type;
      state.name = name;

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("token_type", token_type);
      localStorage.setItem("user_name", name);
    },
    clearAuth: (state) => {
      state.token = null;
      state.tokenType = null;
      state.name = null;

      localStorage.removeItem("access_token");
      localStorage.removeItem("token_type");
      localStorage.removeItem("user_name");
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
