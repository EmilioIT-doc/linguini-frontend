import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/login";
import Home from "./Home";
import NavBar from "./layout/navBar";
import "./index.css";
import Order from "./pages/order";
import Menu from "./pages/menu";
import Ubication from "./pages/ubication";

import RedirectIfAuth from "./auth/RedirectIfAuth";
import RequireAuth from "./auth/RequireAuth";
import UserProfile from "./profileAuth/userProfile";
import CartAuth from "./cart/cartAuth";
export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="pt-20">
        <Routes>
          <Route path="/login" element={<RedirectIfAuth> <Login /> </RedirectIfAuth>} />

            <Route path="/ubication" element={<Ubication />} />
            {/* <Route path="/order" element={<Order />} /> */}
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
