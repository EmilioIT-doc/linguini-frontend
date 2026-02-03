import { useState } from "react";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";

const cx = (...c) => c.filter(Boolean).join(" ");

const SocialButtons = () => (
  <div className="w-full flex justify-center gap-3">
    <button
      type="button"
      aria-label="Facebook"
      className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
    >
      <FaFacebookF />
    </button>
    <button
      type="button"
      aria-label="Twitter"
      className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
    >
      <FaTwitter />
    </button>
    <button
      type="button"
      aria-label="LinkedIn"
      className="grid place-items-center w-10 h-10 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
    >
      <FaLinkedinIn />
    </button>
  </div>
);

const RegisterForm = ({ activeView }) => {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const show = activeView === "register";

  const handleRegister = async (e) => {
    console.log("Esto es data: ", form);
    
    e.preventDefault();
    try { 
      await axios.post('/api/register', form); alert('Registered successfully'); 
      return;
    } catch (error) {
      alert(error.response?.data?.message || 'Registration failed');
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
        <input onChange={e => setForm({...form, name: e.target.value})}
          placeholder="Name"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#6b50ff]"
        />
        <input onChange={e => setForm({...form, email: e.target.value})}
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#6b50ff]"
        />
        <input onChange={e => setForm({...form, password: e.target.value})}
          placeholder="Password"
          type="password"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#6b50ff]"
        />
      </div>

      <button
        className="mt-6 w-full rounded-xl bg-[#3c23c9] text-white py-3 font-semibold hover:opacity-95 transition cursor-pointer"
        type="submit"
      >
        SIGN UP
      </button>
    </form>
  );
};

const LoginForm = ({ activeView }) => {
  const show = activeView === "login";

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
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
          placeholder="Email"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#6b50ff]"
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-[#6b50ff]"
        />
      </div>

      <button
        className="mt-6 w-full rounded-xl bg-[#3c23c9] text-white py-3 font-semibold hover:opacity-95 transition cursor-pointer"
        type="submit"
      >
        LOGIN
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
        "rounded-[18px] bg-[linear-gradient(45deg,#5823c9,#6b50ff)]",
        "transition-transform duration-[650ms] ease-in-out",
        overlayOnRight ? "translate-x-full" : "translate-x-0"
      )}
    >
      <div className="relative h-full w-full flex items-center justify-center p-10 text-center text-white">
        {/* register: invita a LOGIN */}
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
            className="px-10 py-3 rounded-full tracking-[1px] border border-white/90 hover:bg-white hover:text-[#3c23c9] transition cursor-pointer"
          >
            LOGIN
          </button>
        </div>

        {/* login: invita a SIGN UP */}
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
            className="px-10 py-3 rounded-full tracking-[1px] border border-white/90 hover:bg-white hover:text-[#3c23c9] transition cursor-pointer"
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
  const [form, setForm] = useState({ name: '', email: '', password: '' });

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
        {/* ✅ SOLO se mueve el overlay */}
        <OverlayPanel activeView={activeView} toggleView={toggleView} />

        {/* ✅ Forms fijos, solo cambian visibilidad */}
        <RegisterForm activeView={activeView} />
        <LoginForm activeView={activeView} />
      </div>
    </div>
  );
}
