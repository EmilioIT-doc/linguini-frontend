import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { API_URL } from "../utils/API_URL";
import { axiosConfig } from "../utils/axiosConfig";
import { loadStripe } from "@stripe/stripe-js";

const mxn = (n) =>
  new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(
    Number(n || 0)
  );

export default function Checkout() {
  const navigate = useNavigate();

  // ✅ si tienes authSlice con token/user, úsalo
  const token = useSelector((s) => s.auth?.token); // ajusta nombre si se llama distinto
  const reduxUser = useSelector((s) => s.auth?.user); // opcional: si ya guardas user

  const [cart, setCart] = useState({ items: [], count: 0 });
  const [loading, setLoading] = useState(true);

  // ✅ addresses del user (si existe)

  const items = cart.items || [];

  const computed = useMemo(() => {
    const subtotal = items.reduce((sum, it) => {
      const q = Number(it.quantity || 0);
      const p = Number(it.unit_price || 0);
      return sum + q * p;
    }, 0);

    const count = items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

    return { subtotal, count };
  }, [items]);

  const {
    register,
    watch,
    reset,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contact_name: "",
      contact_phone: "",
      contact_email: "",
      fulfillment_type: "delivery",

      delivery_street: "",
      delivery_exterior_number: "",
      delivery_interior_number: "",
      delivery_neighborhood: "",
      delivery_references: "",

      pickup_at: "",
      notes: "",
    },
    mode: "onTouched",
  });

  const fulfillment = watch("fulfillment_type");

  const mapAddresses = (u) => {
    const raw = u?.addresses || u?.user_addresses || [];
    return raw.map((a) => ({
      id: a.id,
      label: a.label ?? "",
      street: a.street ?? "",
      exterior_number: a.exterior_number ?? "",
      interior_number: a.interior_number ?? "",
      neighborhood: a.neighborhood ?? "",
      references: a.references ?? "",
    }));
  };

  const applyAddressToForm = (addr) => {
    setValue("delivery_street", addr?.street || "");
    setValue("delivery_exterior_number", addr?.exterior_number || "");
    setValue("delivery_interior_number", addr?.interior_number || "");
    setValue("delivery_neighborhood", addr?.neighborhood || "");
    setValue("delivery_references", addr?.references || "");
  };

  // ✅ 1) fetch cart from DB (si es auth flow)
  useEffect(() => {
    const aliveRef = { alive: true };

    const fetchCart = async () => {
      try {
        setLoading(true);

        const res = await axios.get(API_URL.get.fetchCart, axiosConfig());
        if (!aliveRef.alive) return;

        const nextCart = {
          items: res.data?.items || [],
          count: Number(res.data?.count || 0),
        };

        setCart(nextCart);

        if ((nextCart.items || []).length === 0) {
          await Swal.fire({
            icon: "info",
            title: "Tu carrito está vacío",
            text: "Agrega productos antes de pagar.",
            confirmButtonText: "Ir al menú",
          });
          navigate("/menu", { replace: true });
        }
      } catch (e) {
        // Si NO está logeado, aquí te va a caer 401 normalmente.
        // Tú dijiste: "si no está logeado no pasa nada", entonces NO lo mandamos a error fuerte.
        const status = e?.response?.status;

        if (status === 401) {
          // ✅ modo invitado: deja cart vacío o carga de donde tú lo tengas (localStorage)
          setCart({ items: [], count: 0 });
        } else {
          await Swal.fire({
            icon: "error",
            title: "No se pudo cargar tu carrito",
            text: e?.response?.data?.message || "Intenta de nuevo.",
          });
          navigate("/cartAuth", { replace: true }); // ajusta ruta
        }
      } finally {
        if (aliveRef.alive) setLoading(false);
      }
    };

    fetchCart();

    return () => {
      aliveRef.alive = false;
    };
  }, [navigate]);

  // ✅ 2) Prefill con el usuario y sus addresses (si está logeado)
  useEffect(() => {
    const aliveRef = { alive: true };

    const prefill = async () => {
      try {
        // Si ya tienes reduxUser completo, puedes usarlo sin pegarle al backend:
        if (reduxUser?.email) {
          const current = getValues();
          reset({
            ...current,
            contact_name: reduxUser?.name || current.contact_name,
            contact_phone: reduxUser?.phone || current.contact_phone,
            contact_email: reduxUser?.email || current.contact_email,
          });

          const addrList = mapAddresses(reduxUser);
          if (addrList.length > 0) {
            applyAddressToForm(addrList[0]);
          }
          return;
        }

        // Si no hay user en redux, intentamos fetch (solo si hay token)
        if (!token) return;

        const res = await axios.get(API_URL.get.user, axiosConfig());
        if (!aliveRef.alive) return;

        const u = res.data;

        const current = getValues();
        reset({
          ...current,
          contact_name: u?.name || current.contact_name,
          contact_phone: u?.phone || current.contact_phone,
          contact_email: u?.email || current.contact_email,
        });

        const addrList = mapAddresses(u);
        if (addrList.length > 0) {
          applyAddressToForm(addrList[0]);
        }
      } catch (e) {
        console.log(e);
      }
    };

    prefill();

    return () => {
      aliveRef.alive = false;
    };
  }, [token, reduxUser, getValues, reset, setValue]);


  if (loading) {
    return (
      <section className="w-full mx-auto max-w-[1124px] px-6 py-10">
        <p className="font-arch text-black/60">Cargando checkout...</p>
      </section>
    );
  }

  const makePayment = async (values) => {
    // values = datos del form (contacto, dirección, etc.) porque ya usas handleSubmit(makePayment)
    const body = {
      ...values,
      products: cart.items,
    };

    const { data } = await axios.post(
      API_URL.post.makePaymentCartAuth,
      body,
      axiosConfig()
    );

    if (!data?.url) throw new Error("Stripe no regresó URL");

    window.location.href = data.url; // ✅ esto es lo que recomienda Stripe ahora
  };


  return (
    <section className="relative w-full mx-auto max-w-[1124px] px-6 py-10 mt-15">
      <div className="relative z-10">
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* FORM */}
          <form onSubmit={handleSubmit(makePayment)}
            className="rounded-[26px] border border-black/10 bg-white/70 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-arch text-xl text-[#111]">Datos del pedido</h2>
              <span className="font-arch text-sm text-black/55">
                {computed.count} items
              </span>
            </div>

            {/* Contacto */}
            <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 p-4">
              <p className="font-arch text-sm text-black/60">Contacto</p>

              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-1">
                  <input
                    className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                    placeholder="Nombre"
                    {...register("contact_name", {
                      required: "Nombre obligatorio",
                      maxLength: { value: 120, message: "Máximo 120 caracteres" },
                    })}
                  />
                  {errors.contact_name && (
                    <p className="mt-1 font-arch text-xs text-red-600">
                      {errors.contact_name.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <input
                    className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                    placeholder="Teléfono"
                    {...register("contact_phone", {
                      required: "Teléfono obligatorio",
                      maxLength: { value: 25, message: "Máximo 25 caracteres" },
                    })}
                  />
                  {errors.contact_phone && (
                    <p className="mt-1 font-arch text-xs text-red-600">
                      {errors.contact_phone.message}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <input
                    className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                    placeholder="Email"
                    {...register("contact_email", {
                      required: "Email obligatorio",
                      maxLength: { value: 190, message: "Máximo 190 caracteres" },
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Email inválido",
                      },
                    })}
                  />
                  {errors.contact_email && (
                    <p className="mt-1 font-arch text-xs text-red-600">
                      {errors.contact_email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fulfillment */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4">
              <p className="font-arch text-sm text-black/60">Entrega</p>

              <div className="mt-3 flex gap-2">
                <label
                  className={[
                    "px-4 py-2 rounded-2xl font-arch text-sm border cursor-pointer transition",
                    fulfillment === "delivery"
                      ? "bg-[#e1ae52] text-white border-transparent"
                      : "bg-white border-black/10 text-black/70 hover:border-black/20",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    value="delivery"
                    className="hidden"
                    {...register("fulfillment_type", { required: true })}
                  />
                  Delivery
                </label>

                <label
                  className={[
                    "px-4 py-2 rounded-2xl font-arch text-sm border cursor-pointer transition",
                    fulfillment === "pickup"
                      ? "bg-[#e1ae52] text-white border-transparent"
                      : "bg-white border-black/10 text-black/70 hover:border-black/20",
                  ].join(" ")}
                >
                  <input
                    type="radio"
                    value="pickup"
                    className="hidden"
                    {...register("fulfillment_type", { required: true })}
                  />
                  Pickup
                </label>
              </div>

              {fulfillment === "delivery" ? (
                <>
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                      <input
                        className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                        placeholder="Calle"
                        {...register("delivery_street", {
                          validate: (v) =>
                            fulfillment !== "delivery" || (v?.trim() ? true : "Calle obligatoria"),
                          maxLength: { value: 150, message: "Máximo 150 caracteres" },
                        })}
                      />
                      {errors.delivery_street && (
                        <p className="mt-1 font-arch text-xs text-red-600">
                          {errors.delivery_street.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <input
                        className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                        placeholder="No. exterior"
                        {...register("delivery_exterior_number", {
                          maxLength: { value: 20, message: "Máximo 20 caracteres" },
                        })}
                      />
                    </div>

                    <div>
                      <input
                        className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                        placeholder="No. interior (opcional)"
                        {...register("delivery_interior_number", {
                          maxLength: { value: 20, message: "Máximo 20 caracteres" },
                        })}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <input
                        className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                        placeholder="Colonia"
                        {...register("delivery_neighborhood", {
                          validate: (v) =>
                            fulfillment !== "delivery" || (v?.trim() ? true : "Colonia obligatoria"),
                          maxLength: { value: 120, message: "Máximo 120 caracteres" },
                        })}
                      />
                      {errors.delivery_neighborhood && (
                        <p className="mt-1 font-arch text-xs text-red-600">
                          {errors.delivery_neighborhood.message}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <input
                        className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                        placeholder="Referencias (opcional)"
                        {...register("delivery_references", {
                          maxLength: { value: 255, message: "Máximo 255 caracteres" },
                        })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="mt-4">
                  <label className="font-arch text-sm text-black/60">
                    ¿Cuándo recoges?
                  </label>
                  <input
                    type="datetime-local"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                    {...register("pickup_at", {
                      validate: (v) =>
                        fulfillment !== "pickup" || (v ? true : "Selecciona fecha/hora"),
                    })}
                  />
                  {errors.pickup_at && (
                    <p className="mt-1 font-arch text-xs text-red-600">
                      {errors.pickup_at.message}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4">
              <p className="font-arch text-sm text-black/60">Notas</p>
              <textarea
                rows={3}
                className="mt-3 w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                placeholder="Notas para el pedido (opcional)"
                {...register("notes")}
              />
            </div>

            <button
              type="submit"
              className={[
                "mt-5 w-full px-5 py-3 cursor-pointer rounded-2xl font-arch text-sm transition",
                items.length === 0
                  ? "bg-black/10 text-black/40 cursor-not-allowed"
                  : "bg-[#e1ae52] text-white hover:opacity-95",
              ].join(" ")}
            >
              {"Continuar pagando"}
            </button>
          </form>

          {/* RESUMEN */}
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
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
