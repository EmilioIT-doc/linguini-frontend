import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../utils/API_URL";
import { axiosConfig } from "../utils/axiosConfig";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import { setAuthCountCart } from "../store/cartSlice";

const mxn = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n || 0)
  );

export default function CartAuth() {
  const dispatch = useDispatch();

  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [data, setData] = useState({ cart_id: null, items: [], count: 0 });
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    const res = await axios.get(API_URL.get.fetchCart, axiosConfig());
    setData({
      cart_id: res.data?.cart_id ?? null,  // ✅ aquí
      items: res.data?.items || [],
      count: Number(res.data?.count || 0),
    });
    dispatch(setAuthCountCart(count));
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        await fetchCart();
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const items = data.items || [];

  const changeQty = async (cartItem, delta) => {
    const current = Number(cartItem.quantity || 1);
    const nextQty = Math.max(1, current + delta);

    // ✅ update local + count
    setData((prev) => {
      const nextItems = (prev.items || []).map((it) =>
        it.id === cartItem.id ? { ...it, quantity: nextQty } : it
      );

      const nextCount = nextItems.reduce((s, it) => s + Number(it.quantity || 0), 0);
      dispatch(setAuthCountCart(nextCount));

      return { ...prev, items: nextItems, count: nextCount };
    });

    try {
      await axios.patch(
        API_URL.patch.cartItemQty(cartItem.id),
        { qty: nextQty },
        axiosConfig()
      );
    } catch (e) {
      console.log(e);
      await fetchCart();
    }
  };


  const removeItem = async (cartItemId) => {
    setData((prev) => {
      const nextItems = (prev.items || []).filter((it) => it.id !== cartItemId);
      const nextCount = nextItems.reduce((s, it) => s + Number(it.quantity || 0), 0);
      dispatch(setAuthCountCart(nextCount)); // ✅ NAVBAR
      return { ...prev, items: nextItems, count: nextCount };
    });

    try {
      await axios.delete(API_URL.del.cartItem(cartItemId), axiosConfig());
    } catch (e) {
      console.log(e);
      await fetchCart();
    }
  };


  if (loading) return <div>Cargando...</div>;

  return (
    <section className="relative w-full mx-auto max-w-[1124px] px-6 py-10 mt-15">
      <div className="relative z-10">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-[26px] border border-black/10 bg-white/70 p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-arch text-xl text-[#111]">Productos</h2>
              <span className="font-arch text-sm text-black/55">
                {items.length} líneas
              </span>
            </div>

            {items.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-black/10 bg-white/80 p-6 text-center">
                <p className="font-arch text-black/60">Tu carrito está vacío.</p>
                <Link
                  to="/menu"
                  className="inline-flex mt-4 px-5 py-2 rounded-xl bg-[#e1ae52] text-white font-arch text-sm hover:opacity-95 transition"
                >
                  Ver menú
                </Link>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {items.map((it) => {
                  const q = Number(it.quantity || 1);
                  const price = Number(it.unit_price || 0);
                  const lineTotal = q * price;

                  return (
                    <div
                      key={it.id}
                      className="rounded-[22px] border border-black/10 bg-white/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-arch text-lg text-[#111] truncate">
                            {it.name}
                          </p>
                          <p className="mt-1 font-arch text-sm text-black/55">
                            {mxn(price)} c/u
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-arch text-sm text-black/55">Subtotal</p>
                          <p className="font-arch text-lg text-[#111]">
                            {mxn(lineTotal)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="inline-flex items-center rounded-2xl border border-black/10 bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => changeQty(it, -1)}
                            className="px-3 py-2 cursor-pointer"
                          >
                            <FiMinus />
                          </button>

                          <div className="px-4 py-2 font-arch text-sm text-[#111]">
                            {q}
                          </div>

                          <button
                            type="button"
                            onClick={() => changeQty(it, +1)}
                            className="px-3 py-2 cursor-pointer"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl font-arch text-sm"
                        >
                          <FiTrash2 />
                          Quitar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 h-fit">
            <button
              type="button"
              onClick={() => navigate("/checkout", { state: { cart: data, user } })}
              disabled={items.length === 0}
              className="mt-2 w-full px-5 py-3 rounded-2xl font-arch text-sm bg-[#e1ae52] text-white"
            >
              Continuar a pagar
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
