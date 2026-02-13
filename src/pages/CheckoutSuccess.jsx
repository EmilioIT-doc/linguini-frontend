import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import { API_URL } from "../utils/API_URL";
import { axiosConfig } from "../utils/axiosConfig";

export default function CheckoutSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const run = async () => {
      const sessionId = params.get("session_id");

      if (!sessionId) {
        await Swal.fire({
          icon: "error",
          title: "Ups",
          text: "No llegó session_id. Intenta de nuevo.",
          confirmButtonText: "Ok",
        });
        navigate("/cart", { replace: true });
        return;
      }

      try {
        // ✅ recomendado: confirmar con backend que está pagado
        const res = await axios.get(
          API_URL.get.verifyCheckoutSession(sessionId),
          axiosConfig()
        );

        const paid = Boolean(res.data?.paid);
        const paymentStatus = res.data?.payment_status;

        if (paid) {
          await Swal.fire({
            icon: "success",
            title: "Pago exitoso ✨",
            text: "Tu pago fue confirmado. ¡Gracias por tu compra!",
            confirmButtonText: "Ver mi pedido",
          });

          // a donde quieres mandarlo después del success:
          navigate("/historial", { replace: true });
        } else {
          await Swal.fire({
            icon: "info",
            title: "Pago en revisión",
            text: `Stripe regresó: ${paymentStatus || "unpaid"}. Si acabas de pagar, refresca en un momento.`,
            confirmButtonText: "Ok",
          });
          navigate("/cart", { replace: true });
        }
      } catch (e) {
        await Swal.fire({
          icon: "warning",
          title: "No pude verificar el pago",
          text:
            e?.response?.data?.message ||
            "Te regresamos al carrito. Si ya pagaste, revisa tu historial.",
          confirmButtonText: "Ok",
        });
        navigate("/cart", { replace: true });
      }
    };

    run();
  }, [navigate, params]);

  return (
    <section className="w-full mx-auto max-w-[900px] px-6 py-10">
      <p className="font-arch text-black/60">Confirmando tu pago...</p>
    </section>
  );
}
