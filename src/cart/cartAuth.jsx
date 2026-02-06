import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../utils/API_URL";
import { axiosConfig } from "../utils/axiosConfig";
import Comida from "../assets/about.jpg";
import { FiMinus, FiPlus, FiTrash2 } from "react-icons/fi";

const mxn = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n || 0)
  );

export default function CartAuth() {
  const navigate = useNavigate();

  const [data, setData] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // solo para bloquear el item que se está actualizando en DB
  const [updatingId, setUpdatingId] = useState(null);

  const fetchCart = async (aliveRef = { alive: true }) => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get(API_URL.get.fetchCart, axiosConfig());
      if (!aliveRef.alive) return;

      setData({
        items: res.data?.items || [],
        count: Number(res.data?.count || 0),
      });
      console.log("Esta es mi data: ",data);
      
    } catch (e) {
      console.log(e);
      if (!aliveRef.alive) return;
      setError(e?.response?.data?.message || "No se pudo cargar tu carrito.");
    } finally {
      if (aliveRef.alive) setLoading(false);
    }
  };

  useEffect(() => {
    const aliveRef = { alive: true };
    fetchCart(aliveRef);
    return () => {
      aliveRef.alive = false;
    };
  }, []);

  const items = data.items || [];

  const computed = useMemo(() => {
    const subtotal = items.reduce((sum, it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unit_price || 0);
      return sum + q * p;
    }, 0);

    const count = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

    return { subtotal, count };
  }, [items]);

  // ✅ DB: actualizar qty (PATCH)
  const changeQty = async (cartItem, delta) => {
    const current = Number(cartItem.quantity || 1);
    const nextQty = Math.max(1, current + delta);

    setUpdatingId(cartItem.id);

    // Optimista (se siente rápido) pero sigue siendo DB-only porque se sincroniza con API
    setData((prev) => {
      const nextItems = (prev.items || []).map((it) =>
        it.id === cartItem.id ? { ...it, quantity: nextQty } : it
      );
      return {
        ...prev,
        items: nextItems,
        count: nextItems.reduce((s, it) => s + Number(it.quantity || 0), 0),
      };
    });

    try {
      await axios.patch(
        API_URL.patch.cartItemQty(cartItem.id),
        { qty: nextQty },
        axiosConfig()
      );
      // si quieres ultra-seguro:
      // await fetchCart({ alive: true });
    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.message || "No se pudo actualizar la cantidad.");

      // rollback simple: recargar carrito desde DB
      await fetchCart({ alive: true });
    } finally {
      setUpdatingId(null);
    }
  };

  // ✅ DB: eliminar item (DELETE)
  const removeItem = async (cartItemId) => {
    setUpdatingId(cartItemId);

    // Optimista
    setData((prev) => {
      const nextItems = (prev.items || []).filter((it) => it.id !== cartItemId);
      return {
        ...prev,
        items: nextItems,
        count: nextItems.reduce((s, it) => s + Number(it.quantity || 0), 0),
      };
    });

    try {
      await axios.delete(API_URL.del.cartItem(cartItemId), axiosConfig());
      // si quieres ultra-seguro:
      // await fetchCart({ alive: true });
    } catch (e) {
      console.log(e);
      setError(e?.response?.data?.message || "No se pudo quitar el producto.");
      await fetchCart({ alive: true });
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <section className="w-full mx-auto max-w-[1124px] px-6 py-10">
        <p className="font-arch text-black/60">Cargando tu carrito...</p>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <div className="rounded-[26px] border border-black/10 bg-white p-5">
            <div className="h-6 w-44 bg-black/10 rounded-lg animate-pulse" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map((k) => (
                <div key={k} className="rounded-2xl border border-black/10 p-4">
                  <div className="h-4 w-3/5 bg-black/10 rounded animate-pulse" />
                  <div className="mt-3 h-4 w-2/5 bg-black/10 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[26px] border border-black/10 bg-white p-5">
            <div className="h-5 w-36 bg-black/10 rounded animate-pulse" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-full bg-black/10 rounded animate-pulse" />
              <div className="h-4 w-full bg-black/10 rounded animate-pulse" />
              <div className="h-10 w-full bg-black/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full mx-auto max-w-[1124px] px-6 py-10 mt-15">
      {/* Fondo editorial */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[28px] bg-[#fbfaf6] border border-black/5">
        <img
          src={Comida}
          alt=""
          className="absolute left-1/2 top-[-90px] -translate-x-1/2 w-[1250px] max-w-none opacity-[0.55] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/35 to-white/75" />
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 52px), repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 52px)",
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="rounded-[26px] border border-black/10 bg-white/70 px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="font-arch text-xs tracking-[0.28em] text-black/55">
                LINGUINI • ITALIAN STREET FOOD
              </p>

              <h1 className="mt-2 font-arch text-3xl md:text-4xl text-[#111]">
                Tu carrito
                <span className="ml-3 align-middle inline-flex items-center rounded-full border border-black/10 bg-white px-3 py-1 text-sm text-black/60">
                  {computed.count} items
                </span>
              </h1>

              <p className="mt-2 font-arch text-sm text-black/55 max-w-[62ch]">
                Revisa cantidades y continúa a pagar cuando estés lista/o.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/menu"
                className="px-4 py-2 rounded-xl border border-black/10 bg-white/80 font-arch text-sm text-black/70 hover:bg-white hover:border-black/20 transition"
              >
                Seguir comprando
              </Link>
              <button
                type="button"
                onClick={() => navigate("/checkout")}
                disabled={items.length === 0}
                className={[
                  "px-5 py-2 cursor-pointer rounded-xl font-arch text-sm transition",
                  items.length === 0
                    ? "bg-black/10 text-black/40 cursor-not-allowed"
                    : "bg-[#e1ae52] text-white hover:opacity-95",
                ].join(" ")}
              >
                Ir a pagar
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="font-arch text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Layout */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Lista */}
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
                      className="rounded-[22px] border border-black/10 bg-white/80 p-4 hover:border-black/20 transition"
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

                      {/* Controls (DB) */}
                      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="inline-flex items-center rounded-2xl border border-black/10 bg-white overflow-hidden">
                          <button
                            type="button"
                            onClick={() => changeQty(it, -1)}
                            className="px-3 py-2 hover:bg-black/[0.03] transition cursor-pointer"
                            disabled={updatingId === it.id}
                            aria-label="Disminuir"
                          >
                            <FiMinus />
                          </button>

                          <div className="px-4 py-2 font-arch text-sm text-[#111]">
                            {q}
                          </div>

                          <button
                            type="button"
                            onClick={() => changeQty(it, +1)}
                            className="px-3 py-2 hover:bg-black/[0.03] transition cursor-pointer"
                            disabled={updatingId === it.id}
                            aria-label="Aumentar"
                          >
                            <FiPlus />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(it.id)}
                          disabled={updatingId === it.id}
                          className={[
                            "inline-flex cursor-pointer items-center gap-2 px-4 py-2 rounded-xl font-arch text-sm transition",
                            updatingId === it.id
                              ? "bg-black/10 text-black/40 cursor-not-allowed"
                              : "bg-white border border-black/10 text-black/70 hover:border-black/20 hover:bg-black/[0.02]",
                          ].join(" ")}
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

          {/* Resumen */}
          <aside className="lg:sticky lg:top-24 h-fit">
            <div className="rounded-[26px] border border-black/10 bg-white/80 p-5">
              <h3 className="font-arch text-xl text-[#111]">Resumen</h3>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between font-arch text-sm text-black/70">
                  <span>Items</span>
                  <span>{computed.count}</span>
                </div>

                <div className="flex items-center justify-between font-arch text-sm text-black/70">
                  <span>Subtotal</span>
                  <span>{mxn(computed.subtotal)}</span>
                </div>

                <div className="flex items-center justify-between font-arch text-sm text-black/50">
                  <span>Envío</span>
                  <span>Se calcula después</span>
                </div>

                <div className="h-[1px] bg-black/10" />

                <div className="flex items-center justify-between">
                  <span className="font-arch text-sm text-black/70">Total estimado</span>
                  <span className="font-arch text-xl text-[#111]">
                    {mxn(computed.subtotal)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => navigate("/checkout")}
                  disabled={items.length === 0}
                  className={[
                    "mt-2 w-full px-5 py-3 cursor-pointer rounded-2xl font-arch text-sm transition",
                    items.length === 0
                      ? "bg-black/10 text-black/40 cursor-not-allowed"
                      : "bg-[#e1ae52] text-white hover:opacity-95",
                  ].join(" ")}
                >
                  Continuar a pagar
                </button>

                <Link
                  to="/menu"
                  className="block w-full text-center mt-2 px-5 py-3 rounded-2xl border border-black/10 bg-white/80 font-arch text-sm text-black/70 hover:border-black/20 hover:bg-white transition"
                >
                  Seguir comprando
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
