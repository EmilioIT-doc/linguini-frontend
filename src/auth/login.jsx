import { useState } from "react";
import axios from "axios";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import { API_URL } from "../utils/API_URL";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAuth } from "../store/authSlice";

const cx = (...c) => c.filter(Boolean).join(" ");

const SocialButtons = () => (
  <div className="w-full flex justify-center gap-3">
    <button type="button" aria-label="Facebook" className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
      <FaFacebookF />
    </button>
    <button type="button" aria-label="Twitter" className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
      <FaTwitter />
    </button>
    <button type="button" aria-label="LinkedIn" className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition">
      <FaLinkedinIn />
    </button>
  </div>
);

const RegisterForm = ({ activeView, toggleView }) => {
  const show = activeView === "register";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(API_URL.post.register, form, {
        headers: { "Content-Type": "application/json" },
      });

      toggleView();
      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleRegister}
      className={cx(
        "absolute inset-y-0 left-0 w-1/2 z-[1]",
        "flex flex-col items-center justify-center px-10 text-center",
        "transition-opacity duration-[450ms] ease-in-out",
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <h2 className="text-2xl font-semibold text-slate-900">Create Account</h2>

      <div className="mt-4">
        <SocialButtons />
      </div>

      <p className="mt-3 text-sm text-slate-500">or use your email for registration</p>

      <div className="mt-5 w-full space-y-3">
        <input
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          placeholder="Name"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#e1ae52]"
        />
        <input
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#e1ae52]"
        />
        <input
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="Password"
          type="password"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#e1ae52]"
        />
      </div>

      <button
        className="mt-6 w-full rounded-xl bg-[#e1ae52] cursor-pointer text-white py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "CREATING..." : "SIGN UP"}
      </button>
    </form>
  );
};

const LoginForm = ({ activeView }) => {
  const show = activeView === "login";
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch(); // ✅ AQUÍ

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(API_URL.post.login, form, {
        headers: { "Content-Type": "application/json" },
      });

      dispatch(
        setAuth({
          access_token: res.data.access_token,
          token_type: res.data.token_type,
          name: res.data.name,
        })
      );

      navigate(`/profile/${encodeURIComponent(res.data.name)}`);

      setForm({ name: "", email: "", password: "" });
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className={cx(
        "absolute inset-y-0 left-1/2 w-1/2 z-[1]",
        "flex flex-col items-center justify-center px-10 text-center",
        "transition-opacity duration-[450ms] ease-in-out",
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      )}
    >
      <h2 className="text-2xl font-semibold text-slate-900">Login</h2>

      <div className="mt-4">
        <SocialButtons />
      </div>

      <p className="mt-3 text-sm text-slate-500">or use your email account</p>

      <div className="mt-5 w-full space-y-3">
        <input
          value={form.email}
          onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#e1ae52]"
        />
        <input
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          placeholder="Password"
          type="password"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#e1ae52]"
        />
      </div>

      <button
        className="mt-6 w-full rounded-xl bg-[#e1ae52] cursor-pointer text-white py-3 font-semibold hover:opacity-95 transition disabled:opacity-60"
        type="submit"
        disabled={loading}
      >
        {loading ? "CREATING..." : "LOGIN"}
      </button>
    </form>
  );
};

const OverlayPanel = ({ activeView, toggleView }) => {
  const overlayOnRight = activeView === "register";

  return (
    <div
      className={cx(
        "absolute inset-y-0 left-0 w-1/2 z-[5]",
        "rounded-[18px] bg-[#3c3c3c]",
        "transition-transform duration-[650ms] ease-in-out",
        overlayOnRight ? "translate-x-full" : "translate-x-0"
      )}
    >
      <div className="relative h-full w-full flex items-center justify-center p-10 text-center text-white">
        <div
          className={cx(
            "absolute inset-0 flex flex-col items-center justify-center gap-4 px-10",
            "transition-opacity duration-300",
            activeView === "register" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <h2 className="text-2xl font-semibold">Welcome back</h2>
          <p className="opacity-85 leading-relaxed max-w-[28ch]">
            Already have an account? Login and continue.
          </p>
          <button
            type="button"
            onClick={toggleView}
            className="px-10 py-3 rounded-full tracking-[1px] border border-white/90 hover:bg-white cursor-pointer hover:text-[#3c3c3c] transition"
          >
            LOGIN
          </button>
        </div>

        <div
          className={cx(
            "absolute inset-0 flex flex-col items-center justify-center gap-4 px-10",
            "transition-opacity duration-300",
            activeView === "login" ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <h2 className="text-2xl font-semibold">Hello there</h2>
          <p className="opacity-85 leading-relaxed max-w-[28ch]">
            New here? Create an account in seconds.
          </p>
          <button
            type="button"
            onClick={toggleView}
            className="px-10 py-3 rounded-full tracking-[1px] border border-white/90 hover:bg-white hover:text-[#3c3c3c] cursor-pointer transition"
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Login() {
  const [activeView, setActiveView] = useState("register");

  const toggleView = () =>
    setActiveView((prev) => (prev === "register" ? "login" : "register"));

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div
        className={cx(
          "relative overflow-hidden",
          "w-[660px] h-[440px] max-w-[95vw]",
          "rounded-[24px] bg-white border-[8px] border-white",
          "shadow-[0_12px_80px_rgba(41,30,113,0.12)]"
        )}
      >
        <OverlayPanel activeView={activeView} toggleView={toggleView} />
        <RegisterForm activeView={activeView} toggleView={toggleView} />
        <LoginForm activeView={activeView} />
      </div>
    </div>
  );
}
