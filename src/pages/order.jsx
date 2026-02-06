import { useState } from "react";

export default function Order() {
  const [open, setOpen] = useState({
    domicilio: false,
    pickUp: false,
  });

  return (
    <section className="py-30 relative w-full overflow-hidden mx-auto max-w-[1124px] px-8">
      <div className="relative z-10 h-full px-4 flex items-center">
        <div className="w-full rounded-[32px] bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_18px_45px_rgba(0,0,0,0.18)] px-8 py-8">
          <h1 className="text-[#111] font-arch text-3xl md:text-5xl leading-tight">
            ¿Cómo prefieres recibir tu pedido?
          </h1>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => setOpen({ pickUp: true, domicilio: false })}
              className={`px-5 py-2 rounded-xl font-arch text-sm cursor-pointer transition ${
                open.pickUp
                  ? "bg-[#e1ae52] text-white"
                  : "bg-black/10 text-black/50 hover:bg-black/15"
              }`}
            >
              Recoger en tienda
            </button>

            <button
              onClick={() => setOpen({ domicilio: true, pickUp: false })}
              className={`px-5 py-2 rounded-xl font-arch text-sm cursor-pointer transition ${
                open.domicilio
                  ? "bg-[#e1ae52] text-white"
                  : "bg-black/10 text-black/50 hover:bg-black/15"
              }`}
            >
              Domicilio
            </button>
          </div>

          {/* ✅ Contenido debajo según selección */}
          <div className="mt-6">
            {open.pickUp && (
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <p className="font-arch text-[#111] text-base">
                  Perfecto 😌 Selecciona la sucursal y la hora para recoger.
                </p>
                {/* aquí puedes meter inputs/selects */}
              </div>
            )}

            {open.domicilio && (
              <div className="rounded-2xl border border-black/10 bg-white p-5">
                <p className="font-arch text-[#111] text-base">
                  Va 👀 Escribe tu dirección para el envío a domicilio.
                </p>
                {/* aquí puedes meter inputs */}
              </div>
            )}

            {!open.pickUp && !open.domicilio && (
              <p className="text-sm font-arch text-black/50">
                Elige una opción para continuar.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
