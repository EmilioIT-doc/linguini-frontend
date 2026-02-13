import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";

import { clearAuth } from "../store/authSlice";
import { API_URL } from "../utils/API_URL";
import { axiosConfig } from "../utils/axiosConfig";

const emptyAddress = () => ({
  id: null,
  label: "",
  street: "",
  exterior_number: "",
  interior_number: "",
  neighborhood: "",
  references: "",
});

export default function UserProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // guardamos ids iniciales para detectar deletes
  const initialAddressIdsRef = useRef([]);

  const {
    register,
    control,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      addresses: [],
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses",
    keyName: "__key",
  });

  const fetchUser = async (aliveRef = { alive: true }) => {
    try {
      setLoading(true);

      const res = await axios.get(API_URL.get.user, axiosConfig());
      if (!aliveRef.alive) return;

      const u = res.data;

      // si tu backend ya manda addresses dentro del user:
      const addresses = (u?.addresses || u?.user_addresses || []).map((a) => ({
        id: a.id,
        label: a.label || "",
        street: a.street || "",
        exterior_number: a.exterior_number || "",
        interior_number: a.interior_number || "",
        neighborhood: a.neighborhood || "",
        references: a.references || "",
      }));

      initialAddressIdsRef.current = addresses.map((a) => a.id).filter(Boolean);

      reset({
        name: u?.name || "",
        email: u?.email || "",
        phone: u?.phone || "",
        addresses,
      });
    } catch (err) {
      console.log(err);
      await Swal.fire({
        icon: "error",
        title: "No se pudo cargar tu perfil",
        text: err?.response?.data?.message || "Intenta de nuevo.",
      });
    } finally {
      if (aliveRef.alive) setLoading(false);
    }
  };

  useEffect(() => {
    const aliveRef = { alive: true };
    fetchUser(aliveRef);
    return () => (aliveRef.alive = false);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(API_URL.post.logout, {}, axiosConfig());
      dispatch(clearAuth());
      navigate("/login", { replace: true });
    } catch (err) {
      console.log(err);
      await Swal.fire({
        icon: "error",
        title: "Logout failed",
        text: "Intenta de nuevo.",
      });
    }
  };

  const onSubmit = async (values) => {
    try {
      setSaving(true);

      // 1) Update user (name, phone) - email NO se manda
      await axios.patch(
        API_URL.patch.user,
        { name: values.name, phone: values.phone },
        axiosConfig()
      );

      // 2) Sync addresses
      const current = values.addresses || [];

      const existing = current.filter((a) => a.id);
      const news = current.filter((a) => !a.id);

      const currentIds = existing.map((a) => a.id);
      const deletedIds = (initialAddressIdsRef.current || []).filter(
        (id) => !currentIds.includes(id)
      );

      // update existentes
      await Promise.all(
        existing.map((a) =>
          axios.patch(
            API_URL.patch.userAddress(a.id),
            {
              label: a.label,
              street: a.street,
              exterior_number: a.exterior_number,
              interior_number: a.interior_number || null,
              neighborhood: a.neighborhood,
              references: a.references,
            },
            axiosConfig()
          )
        )
      );

      // crear nuevas
      await Promise.all(
        news.map((a) =>
          axios.post(
            API_URL.post.userAddress,
            {
              label: a.label,
              street: a.street,
              exterior_number: a.exterior_number,
              interior_number: a.interior_number || null,
              neighborhood: a.neighborhood,
              references: a.references,
            },
            axiosConfig()
          )
        )
      );

      // borrar eliminadas
      await Promise.all(
        deletedIds.map((id) =>
          axios.delete(API_URL.del.userAddress(id), axiosConfig())
        )
      );

      await Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        timer: 1200,
        showConfirmButton: false,
      });

      // refrescar para traer ids reales de las direcciones nuevas y resetear snapshot
      await fetchUser({ alive: true });
    } catch (err) {
      console.log(err);
      await Swal.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: err?.response?.data?.message || "Intenta de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="w-full mx-auto max-w-[1124px] px-6 py-10">
        <p className="font-arch text-black/60">Cargando tu perfil...</p>
      </section>
    );
  }

  return (
    <section className="relative w-full mx-auto max-w-[1124px] px-6 py-10 mt-15">
      <div className="relative z-10">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-[26px] border border-black/10 bg-white/70 p-5"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-arch text-xl text-[#111]">Mi perfil</h2>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl border border-black/10 bg-white/80 font-arch text-sm text-black/70 hover:border-black/20 hover:bg-white transition"
            >
              Logout
            </button>
          </div>

          {/* Datos user */}
          <div className="mt-5 rounded-2xl border border-black/10 bg-white/80 p-4">
            <p className="font-arch text-sm text-black/60">Datos</p>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                  placeholder="Nombre"
                  {...register("name", {
                    required: "Nombre obligatorio",
                    maxLength: { value: 120, message: "Máximo 120 caracteres" },
                  })}
                />
                {errors.name && (
                  <p className="mt-1 font-arch text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <input
                  className="w-full rounded-2xl border border-black/10 bg-black/[0.03] p-3 font-arch text-sm text-black/70 cursor-not-allowed"
                  placeholder="Email"
                  disabled
                  {...register("email")}
                />
                <p className="mt-1 font-arch text-xs text-black/45">
                  * El correo no se puede cambiar.
                </p>
              </div>

              <div className="md:col-span-2">
                <input
                  className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                  placeholder="Celular"
                  {...register("phone", {
                    maxLength: { value: 25, message: "Máximo 25 caracteres" },
                  })}
                />
                {errors.phone && (
                  <p className="mt-1 font-arch text-xs text-red-600">
                    {errors.phone.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Direcciones */}
          <div className="mt-4 rounded-2xl border border-black/10 bg-white/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-arch text-sm text-black/60">Direcciones</p>

              <button
                type="button"
                onClick={() => append(emptyAddress())}
                className="px-4 py-2 rounded-xl bg-[#e1ae52] text-white font-arch text-sm hover:opacity-95 transition"
              >
                Agregar dirección
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
                <p className="font-arch text-sm text-black/60">
                  No tienes direcciones guardadas.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {fields.map((addr, idx) => (
                  <div
                    key={addr.__key}
                    className="rounded-[22px] border border-black/10 bg-white p-4 hover:border-black/20 transition"
                  >
                    {/* hidden id */}
                    <input type="hidden" {...register(`addresses.${idx}.id`)} />

                    <div className="flex items-start justify-between gap-3">
                      <p className="font-arch text-base text-[#111]">
                        Dirección #{idx + 1}
                      </p>

                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="px-4 py-2 rounded-xl border border-black/10 bg-white font-arch text-sm text-black/70 hover:border-black/20 hover:bg-black/[0.02] transition"
                      >
                        Quitar
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                          placeholder="Etiqueta (Casa, Trabajo...)"
                          {...register(`addresses.${idx}.label`, {
                            required: "Etiqueta obligatoria",
                            maxLength: { value: 50, message: "Máximo 50" },
                          })}
                        />
                        {errors?.addresses?.[idx]?.label && (
                          <p className="mt-1 font-arch text-xs text-red-600">
                            {errors.addresses[idx].label.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                          placeholder="Calle"
                          {...register(`addresses.${idx}.street`, {
                            required: "Calle obligatoria",
                            maxLength: { value: 150, message: "Máximo 150" },
                          })}
                        />
                        {errors?.addresses?.[idx]?.street && (
                          <p className="mt-1 font-arch text-xs text-red-600">
                            {errors.addresses[idx].street.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                          placeholder="No. exterior"
                          {...register(`addresses.${idx}.exterior_number`, {
                            required: "Exterior obligatorio",
                            maxLength: { value: 20, message: "Máximo 20" },
                          })}
                        />
                        {errors?.addresses?.[idx]?.exterior_number && (
                          <p className="mt-1 font-arch text-xs text-red-600">
                            {errors.addresses[idx].exterior_number.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                          placeholder="No. interior (opcional)"
                          {...register(`addresses.${idx}.interior_number`, {
                            maxLength: { value: 20, message: "Máximo 20" },
                          })}
                        />
                        {errors?.addresses?.[idx]?.interior_number && (
                          <p className="mt-1 font-arch text-xs text-red-600">
                            {errors.addresses[idx].interior_number.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                          placeholder="Colonia"
                          {...register(`addresses.${idx}.neighborhood`, {
                            required: "Colonia obligatoria",
                            maxLength: { value: 120, message: "Máximo 120" },
                          })}
                        />
                        {errors?.addresses?.[idx]?.neighborhood && (
                          <p className="mt-1 font-arch text-xs text-red-600">
                            {errors.addresses[idx].neighborhood.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <input
                          className="w-full rounded-2xl border border-black/10 bg-white p-3 font-arch text-sm"
                          placeholder="Referencias"
                          {...register(`addresses.${idx}.references`, {
                            required: "Referencias obligatorias",
                            maxLength: { value: 255, message: "Máximo 255" },
                          })}
                        />
                        {errors?.addresses?.[idx]?.references && (
                          <p className="mt-1 font-arch text-xs text-red-600">
                            {errors.addresses[idx].references.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Guardar */}
          <button
            type="submit"
            disabled={saving}
            className={[
              "mt-5 w-full px-5 py-3 rounded-2xl font-arch text-sm transition",
              saving
                ? "bg-black/10 text-black/40 cursor-not-allowed"
                : "bg-[#111] text-white hover:opacity-95",
            ].join(" ")}
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>
      </div>
    </section>
  );
}
