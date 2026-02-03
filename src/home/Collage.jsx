import MainImage from "../assets/BannerTest.jpg";

export default function Collage() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundImage: `url(${MainImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "clamp(550px, 65vh, 750px)",
      }}
    >
      {/* contenedor general */}
      <div className="relative z-10 mx-auto max-w-[1024px] h-full px-4 flex items-center">
        
        {/* “nube” flotando */}
        <div
          className="
            w-full max-w-[560px]
            rounded-[32px]
            bg-white/80
            backdrop-blur-md
            border border-white/60
            shadow-[0_18px_45px_rgba(0,0,0,0.18)]
            px-8 py-8
          "
        >
          <h1 className="text-[#111] font-arch text-3xl md:text-5xl leading-tight">
            Italian street food
          </h1>

          <p className="text-[#111]/80 font-arch mt-3 text-sm md:text-base">
            Pasta artesanal, promos del día y reservas rápidas. Pide a domicilio o ven
            a disfrutarlo en el lugar.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button className="bg-[#e1ae52] text-white px-5 py-2 rounded-xl font-arch text-sm hover:opacity-90 cursor-pointer">
              Ordena online
            </button>

            <button className="bg-black/10 text-black/50 px-5 py-2 rounded-xl font-arch text-sm cursor-pointer hover:bg-black/15">
              Ver menú
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
