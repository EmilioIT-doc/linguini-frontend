import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { API_URL } from "../../utils/API_URL";
import ManosDeAdan from "../../assets/ManosDeAdan.png";
import { useDispatch, useSelector } from "react-redux";
import { addGuestItem, addAuthItem } from "../../store/cartSlice";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "../../utils/axiosConfig.js";



const mxn = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(n);

// ✅ Lazy load SweetAlert2 (para que no se ponga pesado)
const swal = () => import("sweetalert2").then((m) => m.default);

export default function Menu() {
  const [menuData, setMenuData] = useState([]);
  const [activeKey, setActiveKey] = useState("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [animKey, setAnimKey] = useState(0);

  // ✅ para deshabilitar SOLO el botón del item que se está guardando
  const [savingId, setSavingId] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const token = useSelector((s) => s.auth.token);
  const isLogged = !!token;

  useEffect(() => {
    let alive = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL.get.menu);

        const normalized = (res.data || [])
          .map((cat) => ({
            key: cat.slug,
            title: cat.name,
            sort_order: cat.sort_order ?? 0,
            items: (cat.products || []).map((p) => ({
              id: p.id,
              name: p.name,
              desc: p.description,
              price: Number(p.price),
              image_url: p.image_url ?? null,
            })),
          }))
          .sort((a, b) => a.sort_order - b.sort_order);

        if (!alive) return;

        setMenuData(normalized);
        setActiveKey((prev) => prev || normalized?.[0]?.key || "");
      } catch (err) {
        console.log(err);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchData();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (activeKey) setAnimKey((k) => k + 1);
  }, [activeKey]);

  const activeCat = useMemo(() => {
    return (
      menuData.find((c) => c.key === activeKey) ||
      menuData[0] || { title: "", items: [] }
    );
  }, [menuData, activeKey]);

  const filteredItems = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return activeCat.items;

    return activeCat.items.filter((it) => {
      const text = `${it.name} ${it.desc || ""}`.toLowerCase();
      return text.includes(query);
    });
  }, [q, activeCat]);

  // ✅ Alert de “ir a pagar o seguir”
  const askGoToPay = async () => {
    const Swal = await swal();
    const result = await Swal.fire({
      icon: "success",
      title: "Agregado al carrito",
      text: "¿Quieres ir a pagar o seguir comprando?",
      showCancelButton: true,
      confirmButtonText: "IR A PAGAR",
      cancelButtonText: "SEGUIR COMPRANDO",
      confirmButtonColor: "#e1ae52",
      cancelButtonColor: "#111111",
    });

    if (result.isConfirmed) {
      navigate(isLogged ? "/cart_auth" : "/cart");
    }
  };

  // ✅ Agregar (guest => redux, logged => BD + redux)
  const handleAddToCart = async (it) => {
    const qty = 1;

    // Invitado: solo local (Redux)
    if (!isLogged) {
      dispatch(addGuestItem({
        product_id: it.id,
        name: it.name,
        unit_price: it.price,
        quantity: 1,
      }));


      await askGoToPay();
      return;
    }

    // Logeado: guardar en BD y luego Redux
    try {
      setSavingId(it.id);

      await axios.post(API_URL.post.addProductToTable(it.id), { qty }, axiosConfig());

      dispatch(addAuthItem({
        product_id: it.id,
        name: it.name,
        unit_price: it.price,
        quantity: 1,
      }));


      await askGoToPay();
    } catch (e) {
      console.log(e);
      const msg =
        e?.response?.data?.message || e?.message || "No se pudo agregar el producto.";

      const Swal = await swal();
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
        confirmButtonText: "OK",
        confirmButtonColor: "#111111",
      });
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <section className="w-full mx-auto max-w-[1124px] px-6 py-10">
        <p className="font-arch text-black/60">Cargando menú...</p>
      </section>
    );
  }

  return (
    <section className="relative w-full mx-auto max-w-[1124px] px-6 py-10">
      {/* Animación ligera */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fadeUp { animation: fadeUp 220ms ease-out; }
      `}</style>

      {/* Fondo */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[28px] bg-[#fbfaf6] border border-black/5">
        <img
          src={ManosDeAdan}
          alt=""
          className="absolute left-1/2 top-[-70px] -translate-x-1/2 w-[1250px] max-w-none opacity-[0.55] mix-blend-multiply"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/30 to-white/70" />
        <div
          className="absolute inset-0 opacity-[0.10]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 52px), repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0, rgba(0,0,0,0.05) 1px, transparent 1px, transparent 52px)",
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10">
        {/* Header */}
        <div className="rounded-[26px] border border-black/10 bg-white/70 px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="font-arch text-xs tracking-[0.28em] text-black/55">
                LINGUINI • ITALIAN STREET FOOD
              </p>
              <h1 className="mt-2 font-arch text-3xl md:text-4xl text-[#111]">
                Menú
                <span className="block text-black/55 text-lg md:text-xl mt-1">
                  {activeCat.title}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:block h-[1px] w-24 bg-black/10" />
              <span className="font-arch text-sm text-black/55">
                {filteredItems.length} platillos
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5 flex flex-wrap gap-2">
            {menuData.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setActiveKey(c.key);
                  setQ("");
                }}
                className={[
                  "px-4 py-2 cursor-pointer rounded-xl font-arch text-sm border transition",
                  "active:scale-[0.99]",
                  activeKey === c.key
                    ? "bg-[#e1ae52] text-white border-[#e1ae52]"
                    : "bg-white/80 text-black/70 border-black/10 hover:border-black/20 hover:bg-white",
                ].join(" ")}
              >
                {c.title}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="mt-4">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Buscar dentro de ${activeCat.title}...`}
              className="w-full md:w-[420px] rounded-xl border border-black/10 bg-white/85 px-4 py-3 outline-none focus:border-[#e1ae52]"
            />
          </div>
        </div>

        {/* Lista */}
        <div key={animKey} className="mt-8 fadeUp">
          <div className="flex items-end justify-between gap-4">
            <h2 className="font-arch text-2xl text-[#111]">{activeCat.title}</h2>
            <div className="h-[1px] flex-1 bg-black/10 max-w-[340px] hidden md:block" />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredItems.map((it) => (
              <div
                key={it.id || it.name}
                className="rounded-[20px] bg-white/72 border border-black/10 p-4 transition hover:border-black/20 hover:bg-white/85"
              >
                <div className="flex items-baseline gap-3">
                  <p className="font-arch text-[#111] text-lg">{it.name}</p>
                  <div className="flex-1 border-b border-dotted border-black/20 translate-y-[-2px]" />
                  <p className="font-arch text-black/70 whitespace-nowrap">
                    {mxn(it.price)}
                  </p>
                </div>

                {it.desc && (
                  <p className="mt-2 font-arch text-sm text-black/55 leading-relaxed">
                    {it.desc}
                  </p>
                )}

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleAddToCart(it)}
                    disabled={savingId === it.id}
                    className={[
                      "px-4 py-2 rounded-xl font-arch text-sm transition",
                      savingId === it.id
                        ? "bg-black/10 text-black/40 cursor-not-allowed"
                        : "bg-[#e1ae52] text-white hover:opacity-95 cursor-pointer",
                    ].join(" ")}
                  >
                    {savingId === it.id ? "Agregando..." : "Agregar"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/75 p-5 text-center">
              <p className="font-arch text-black/60">
                No encontré nada con “{q}” en {activeCat.title}.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
