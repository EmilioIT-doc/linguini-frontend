import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./auth/login";
import Home from "./Home";
import NavBar from "./layout/navBar";
import './index.css'
import Order from "./pages/order";
import Menu from "./pages/menu";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />

      <div className="pt-20">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/order" element={<Order />} />
          <Route path="/menu" element={<Menu/>} />
          <Route index element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
