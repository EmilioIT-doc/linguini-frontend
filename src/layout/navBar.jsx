import { NavLink } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import LogotypeLinguini from "../assets/LogotypeLinguiniHorizontal.png";
import { BsCart3 } from "react-icons/bs";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { API_URL } from "../utils/API_URL";
import { clearAuth } from "../store/authSlice";
import { axiosConfig } from "../utils/axiosConfig";
import { setAuthCountCart } from "../store/cartSlice";


export default function NavBar() {
  const dispatch = useDispatch();

  const { token, tokenType, name } = useSelector((state) => state.auth);
  const isLogged = !!token;

  // ✅ guest items (para badge cuando NO está logeado)
  const guestItems = useSelector((state) => state.cart.guestItems);

  // ✅ count guest (sumatoria qty)
  const guestCount = useMemo(() => {
    return (guestItems || []).reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  }, [guestItems]);

  // ✅ rutas
  const userTo = isLogged ? `/profile/${encodeURIComponent(name)}` : "/login";
  const cartTo = isLogged ? "/cart_auth" : "/cart";

  const authCartCount = useSelector((state) => state.cart.authCount); // ✅ selector con otro nombre
  // ✅ badge final
  const cartCount = isLogged ? authCartCount : guestCount;

  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);


  useEffect(() => {
    const onScroll = () => setAtTop(window.scrollY <= 5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ✅ fetch SOLO count si está logeado
  useEffect(() => {
    let alive = true;

    const fetchAuthCartCount = async () => {
      if (!isLogged) {
        dispatch(setAuthCountCart(0));
        return;
      }

      try {
        const res = await axios.get(API_URL.get.cartAuth, axiosConfig());
        const count = Number(res.data?.count || 0);
        if (!alive) return;
        dispatch(setAuthCountCart(count)); // ✅
      } catch (e) {
        console.log(e);
        if (e?.response?.status === 401) {
          dispatch(clearAuth());
          dispatch(setAuthCountCart(0));
        }
      }
    };

    fetchAuthCartCount();
    return () => { alive = false; };
  }, [isLogged, token, tokenType, dispatch]);


  const linkClass = ({ isActive }) =>
    `transition-colors leading-none ${isActive ? "text-[#e1ae52]" : "text-[#707070] hover:text-[#e1ae52]"
    }`;

  const iconLinkClass = ({ isActive }) =>
    `transition-colors flex flex-col items-center leading-none ${isActive ? "text-[#e1ae52]" : "text-[#707070] hover:text-[#e1ae52]"
    }`;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 transition-opacity duration-300 md:hidden",
          open ? "opacity-40 bg-black pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      <header
        className={[
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          atTop ? "bg-transparent" : "bg-white shadow-md",
          "pt-4",
        ].join(" ")}
      >
        <nav className="mx-auto max-w-[1024px] h-12 md:h-[72px] px-4 flex justify-between items-end">
          <NavLink to="/">
            <img
              src={LogotypeLinguini}
              alt="Linguini"
              className="w-[250px] cursor-pointer self-end pb-2"
            />
          </NavLink>

          <ul className="hidden md:flex items-end gap-10 text-[14px] font-arch pb-2 leading-none">
            <li><NavLink to="/menu" className={linkClass}>Menú</NavLink></li>
            <li><NavLink to="/promos" className={linkClass}>Promos</NavLink></li>
            <li><NavLink to="/ubication" className={linkClass}>Ubicación</NavLink></li>
            <li><NavLink to="/reservar" className={linkClass}>Reservar</NavLink></li>
          </ul>

          <ul className="hidden md:flex items-end gap-6 text-[15px] font-arch pb-2 leading-none">
            <li>
              <NavLink to={userTo} className={iconLinkClass}>
                <span className="h-7 flex items-center justify-center">
                  <HiOutlineUserCircle className="text-[35px] pb-2" />
                </span>
              </NavLink>
            </li>

            <li>
              <NavLink to={cartTo} className={linkClass}>
                <span className="relative h-7 flex items-center justify-center">
                  <BsCart3 className="text-[30px] pb-2" />

                  {cartCount > 0 && (
                    <span
                      className={[
                        "absolute -top-1 -right-2",
                        "min-w-[18px] h-[18px] px-1",
                        "rounded-full bg-red-500 text-white",
                        "text-[11px] leading-[18px] text-center font-semibold",
                        "shadow-sm",
                      ].join(" ")}
                    >
                      {cartCount > 99 ? "99+" : cartCount}
                    </span>
                  )}
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
