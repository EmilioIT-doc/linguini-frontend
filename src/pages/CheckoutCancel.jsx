import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function CheckoutCancel() {
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      await Swal.fire({
        icon: "info",
        title: "Pago cancelado",
        text: "No se realizó ningún cargo. Puedes intentarlo otra vez cuando gustes.",
        confirmButtonText: "Volver al carrito",
      });

      navigate("/", { replace: true });
    };

    run();
  }, [navigate]);

  return (
    <section className="w-full mx-auto max-w-[900px] px-6 py-10">
      <p className="font-arch text-black/60">Regresando...</p>
    </section>
  );
}
