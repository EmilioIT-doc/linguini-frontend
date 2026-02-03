import { useMemo, useState } from "react";
import FirstImage from "../assets/about.jpg";
import SecondImage from "../assets/about.jpg";
import ThirdImage from "../assets/about.jpg";
import Apolo from "../assets/Apolo.png";

export default function Introduction() {
  const steps = useMemo(
    () => [
      {
        label: "Paso 1",
        title: "Elige qué vas a ordenar",
        desc: "Explora el menú y arma tu pedido en segundos.",
        img: FirstImage,
        alt: "Paso 1 - Elegir productos",
      },
      {
        label: "Paso 2",
        title: "Revisa tu carrito y confirma",
        desc: "Ajusta cantidades y confirma tu compra.",
        img: SecondImage,
        alt: "Paso 2 - Carrito",
      },
      {
        label: "Paso 3",
        title: "Espera la confirmación",
        desc: "Aceptamos tu pedido y te avisamos el estatus.",
        img: ThirdImage,
        alt: "Paso 3 - Confirmación",
      },
    ],
    []
  );

  const [step, setStep] = useState(0);

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else setStep(0);
  };

  const back = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  return (
    <section className="relative w-full overflow-hidden pb-15">
      <div className="relative z-10 mx-auto max-w-[1024px] h-full px-4 flex items-center">
        {/* ✅ nube con Apolo adentro */}
        <div
          className="
            relative
            w-full
            rounded-[32px]
            bg-white/80
            backdrop-blur-md
            border border-white/60
            shadow-[0_18px_45px_rgba(0,0,0,0.18)]
            overflow-hidden
          "
        >
          {/* ✅ Apolo de fondo (izquierda) */}
          <img
            src={Apolo}
            alt=""
            className="
              pointer-events-none select-none
              absolute left-[-30px] top-1/2 -translate-y-1/2
              w-[260px] md:w-[320px]
              opacity-10 md:opacity-15
            "
          />

          {/* ✅ Contenido con padding para que no se encime con Apolo */}
          <div className="relative z-10 px-8 py-8 md:pl-[220px]">
            <h1 className="text-[#111] font-arch text-3xl md:text-5xl leading-tight">
              ¿Cómo funciona Linguini Web?
            </h1>

            {/* Carrusel */}
            <div className="mt-5 relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${step * 100}%)` }}
              >
                {steps.map((s, i) => (
                  <div key={s.label} className="w-full shrink-0">
                    <div
                      className={[
                        "transition-opacity duration-500",
                        i === step ? "opacity-100" : "opacity-0",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-6">
                        {/* Texto */}
                        <div className="flex-1">
                          <h2 className="text-[#111] font-arch mt-2 text-xl md:text-2xl leading-snug">
                            {s.title}
                          </h2>
                          <p className="text-[#111]/80 font-arch mt-3 text-sm md:text-base max-w-[420px]">
                            {s.desc}
                          </p>
                        </div>

                        {/* Imagen derecha */}
                        <div className="hidden md:block w-[280px] shrink-0">
                          <img
                            src={s.img}
                            alt={s.alt}
                            className="w-full h-[180px] object-cover rounded-2xl border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                          />
                        </div>
                      </div>

                      {/* Imagen mobile */}
                      <div className="md:hidden mt-4">
                        <img
                          src={s.img}
                          alt={s.alt}
                          className="w-full h-[170px] object-cover rounded-2xl border border-black/10 shadow-[0_10px_30px_rgba(0,0,0,0.12)]"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Controles + dots */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={back}
                className={[
                  "px-5 py-2 rounded-xl font-arch text-sm cursor-pointer",
                  "transition-all duration-300",
                  step === 0
                    ? "opacity-0 pointer-events-none -translate-y-1"
                    : "opacity-100 pointer-events-auto translate-y-0 bg-black/10 text-black/50 hover:bg-black/15",
                ].join(" ")}
              >
                Back
              </button>

              <button
                onClick={next}
                className="bg-black/10 text-black/50 px-5 py-2 rounded-xl font-arch text-sm cursor-pointer hover:bg-black/15"
              >
                {step < steps.length - 1 ? `Step ${step + 1}` : "Reiniciar"}
              </button>

              <div className="ml-auto flex items-center gap-2">
                {steps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setStep(i)}
                    className={[
                      "h-2.5 w-2.5 rounded-full transition-all duration-300",
                      i === step
                        ? "bg-[#e1ae52] w-6"
                        : "bg-black/20 hover:bg-black/30",
                    ].join(" ")}
                    aria-label={`Ir al paso ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
