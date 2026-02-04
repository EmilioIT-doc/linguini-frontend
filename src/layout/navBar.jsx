import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import LogotypeLinguini from "../assets/LogotypeLinguiniHorizontal.png";
import { BsCart3 } from "react-icons/bs";
import { CiLogin } from "react-icons/ci";
import { FaRegUser } from "react-icons/fa";
import { HiOutlineUserCircle } from "react-icons/hi2";

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const [atTop, setAtTop] = useState(true);

  useEffect(() => {
    const onScroll = () => {
      setAtTop(window.scrollY <= 5); // “reposo” arriba
    };

    onScroll(); // inicial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass = ({ isActive }) =>
    `transition-colors leading-none ${
      isActive ? "text-[#e1ae52]" : "text-[#707070] hover:text-[#e1ae52]"
    }`;

  const iconLinkClass = ({ isActive }) =>
    `transition-colors flex flex-col items-center leading-none ${
      isActive ? "text-[#e1ae52]" : "text-[#707070] hover:text-[#e1ae52]"
    }`;

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={[
          "fixed inset-0 z-40 transition-opacity duration-300 md:hidden",
          open
            ? "opacity-40 bg-black pointer-events-auto"
            : "opacity-0 pointer-events-none",
        ].join(" ")}
      />

      {/* 👇 bg cambia según scroll */}
      <header
        className={[
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          atTop ? "bg-transparent" : "bg-white shadow-md",
          "pt-4",
        ].join(" ")}
      >
        <nav className="mx-auto max-w-[1024px] h-12 md:h-[72px] px-4 flex justify-between items-end">
          {/* Logo */}
          <NavLink to="/">
            <img
              src={LogotypeLinguini}
              alt="Linguini"
              className="w-[250px] cursor-pointer self-end pb-2"
            />
          </NavLink>

          {/* Links principales */}
          <ul className="hidden md:flex items-end gap-10 text-[14px] font-arch pb-2 leading-none">
            <li>
              <NavLink to="/order" className={linkClass}>
                Ordena online
              </NavLink>
            </li>
            <li>
              <NavLink to="/menu" className={linkClass}>
                Menú
              </NavLink>
            </li>
            <li>
              <NavLink to="/promos" className={linkClass}>
                Promos
              </NavLink>
            </li>
            <li>
              <NavLink to="/ubication" className={linkClass}>
                Ubicación
              </NavLink>
            </li>
            <li>
              <NavLink to="/reservar" className={linkClass}>
                Reservar
              </NavLink>
            </li>
          </ul>

          {/* Iconos + texto */}
          <ul className="hidden md:flex items-end gap-6 text-[15px] font-arch pb-2 leading-none">
            <li>
              <NavLink to="/login" className={iconLinkClass}>
                <span className="h-7 flex items-center justify-center">
                  <HiOutlineUserCircle className="text-[35px] pb-2" />
                </span>
              </NavLink>
            </li>

            <li>
              <NavLink to="/cart" className={iconLinkClass}>
                <span className="h-7 flex items-center justify-center">
                  <BsCart3 className="text-[30px] pb-2" />
                </span>
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}
