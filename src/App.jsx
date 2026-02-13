import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/login";
import Home from "./Home";
import NavBar from "./layout/navBar";
import "./index.css";
import Menu from "./pages/menu";
import Ubication from "./pages/ubication";
import CheckoutSuccess from "../src/pages/CheckoutSuccess";
import CheckoutCancel from "../src/pages/CheckoutCancel";

import RedirectIfAuth from "./auth/RedirectIfAuth";
import RequireAuth from "./auth/RequireAuth";
import UserProfile from "./profileAuth/userProfile";
import CartAuth from "./cart/cartAuth";
import Checkout from "./cart/checkout";
export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="pt-20">
        <Routes>
          {/* Rutas de para stripe de mierda:  */}
          <Route path="/checkout?success" element={<CheckoutSuccess />} />
          <Route path="/checkout?cancel" element={<CheckoutCancel />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/login" element={<RedirectIfAuth> <Login /> </RedirectIfAuth>} />

            <Route path="/ubication" element={<Ubication />} />
            <Route path="/menu" element={<Menu />} />
          
          <Route index element={<Home />} />
          <Route element={<RequireAuth />}>
            <Route path="/profile/:name" element={<UserProfile />} />
            <Route path="/cart_auth" element={<CartAuth/>} />
          </Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}
