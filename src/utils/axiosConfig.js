import { store } from "../store/store"; 

export function axiosConfig() {
  const { token, tokenType } = store.getState().auth;

  return {
    headers: token ? { Authorization: `${tokenType || "Bearer"} ${token}` } : {},
    withCredentials: false,
  };
}
