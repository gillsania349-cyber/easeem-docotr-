"use client";

import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import {
  Bell, Home, Briefcase, Activity, Mail, User, Heart, MessageCircle, Repeat2, Bookmark, Send, X,
  Eye, EyeOff, ArrowRight, ArrowLeft, Check, MessageCircle as WhatsAppIcon,
  ChevronLeft, Camera, CheckCircle2, Clock, Upload, FileText, ShieldCheck, Pencil, Search, Stethoscope,
  Store, MessageSquareText, UserRound, MapPin, ChevronRight,
  Menu, Newspaper, Settings, HelpCircle, Info, LogOut, Globe, Shield, Flag, Building2, Star, Phone,
  Sunrise, Sunset, Moon, Pill, FlaskConical, GraduationCap, Scissors, Wrench, Plus, CalendarDays, Users, History, ChevronDown, SlidersHorizontal, Zap, ArrowUpDown,
  Wallet,
  Brain, Baby, HeartPulse, Bone, Smile, Microscope, Video, BadgeCheck,
  ScanLine, BedDouble, Sparkles, Package, Truck, Tag,
  Siren, TestTube, Navigation, LayoutGrid,
  Minus, Save, ClipboardList,
} from "lucide-react";

// ---------------- Theme ----------------
// Professional palette: one confident brand blue, neutral surfaces,
// green reserved for money/verification, red only for urgency and errors.
const BRAND = "#0B57B7";
const BRAND_DK = "#08428C";
const BRAND_50 = "#EAF2FC";
const CREAM = "#F5F7FA";            // app background
const CARD_BORDER = "#E4E7EC";
const INK = "#101828";
const INK_2 = "#344054";
const SUBTLE = "#667085";
const FAINT = "#98A2B3";
const GREEN = "#12805C";
const GREEN_TINT = "#E7F5EF";
const RED = "#C0362C";
const NAVY = BRAND;                 // legacy name — everything "navy" is now brand blue
const TEAL = "#0E7C86";
const VIOLET = "#5B47C7";
const AMBER = "#B54708";
const TEAL_TINT = "#E6F6F7";
const VIOLET_TINT = "#F1EDFC";
const AMBER_TINT = "#FFF6E8";
const NAVY_TINT = BRAND_50;
const RED_TINT = "#FDECEC";
const STAR = "#F2A20B";
const SOFT_SHADOW = "0 1px 2px rgba(16,24,40,0.04)";
const PAGE_BG = CREAM;
const FONT = '"Figtree", system-ui, -apple-system, "Segoe UI", sans-serif';

const TAKEN_USERNAMES = ["awaiskhan", "doctorpk", "hospitaladmin", "pakmed", "test123", "drsara"];

/** Pakistani mobile only: store as 10 digits after +92 (must start with 3). */
function normalizePkMobile(raw) {
  let d = String(raw || "").replace(/\D/g, "");
  if (d.startsWith("0092")) d = d.slice(4);
  else if (d.startsWith("92") && d.length >= 12) d = d.slice(2);
  if (d.startsWith("0")) d = d.slice(1);
  return d.slice(0, 10);
}

function pkMobileCheck(digits) {
  if (!digits) {
    return { ok: false, tone: "hint", msg: "Pakistan only (+92). Enter 10 digits starting with 3." };
  }
  if (digits[0] !== "3") {
    return { ok: false, tone: "error", msg: "Only Pakistani numbers allowed. Must start with 3 (e.g. 300…)." };
  }
  if (digits.length < 10) {
    const left = 10 - digits.length;
    return { ok: false, tone: "error", msg: `${left} more digit${left === 1 ? "" : "s"} needed · Pakistani mobile only` };
  }
  if (!/^3\d{9}$/.test(digits)) {
    return { ok: false, tone: "error", msg: "Enter a valid Pakistani mobile number" };
  }
  return { ok: true, tone: "ok", msg: "Valid Pakistani WhatsApp number" };
}

/* =========================================================
   AUTH FLOW
   ========================================================= */
function Field({ label, children, hint, className = "" }) {
  return (
    <div className={`mb-5 lg:mb-4 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[14.5px] font-semibold" style={{ color: INK }}>{label}</label>
        {hint}
      </div>
      <div className="mt-2 lg:mt-1.5">{children}</div>
    </div>
  );
}

const AUTH_INPUT = "pm-input w-full h-[52px] lg:h-12 text-[16px] lg:text-[15.5px] rounded-xl px-4 outline-none bg-white transition-shadow";

function StepDots({ total, current }) {
  return (
    <div className="flex gap-1.5 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className="h-1.5 rounded-full flex-1 transition-colors duration-500" style={{ backgroundColor: i <= current ? BRAND : CARD_BORDER }} />
      ))}
    </div>
  );
}

function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full h-[52px] lg:h-12 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 text-white transition-all duration-200 enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed"
      style={{ backgroundColor: BRAND, opacity: disabled ? 0.45 : 1, boxShadow: disabled ? "none" : "0 8px 20px -8px rgba(11,87,183,0.55)" }}
    >
      {children}
    </button>
  );
}

function BackLink({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="mb-5 inline-flex items-center gap-1.5 h-10 -ml-1 px-1 text-[14.5px] font-semibold" style={{ color: SUBTLE }}>
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}

function AuthTitle({ eyebrow, title, sub }) {
  return (
    <div className="mb-7 lg:mb-5">
      {eyebrow && <p className="text-[12.5px] font-bold uppercase tracking-[0.1em]" style={{ color: BRAND }}>{eyebrow}</p>}
      <h1 className="font-extrabold text-[28px] sm:text-[32px] lg:text-[28px] leading-tight tracking-[-0.03em] mt-1.5" style={{ color: INK }}>{title}</h1>
      {sub && <p className="text-[15.5px] mt-2 leading-relaxed" style={{ color: SUBTLE }}>{sub}</p>}
    </div>
  );
}

function PasswordInput({ value, onChange, invalid, placeholder = "••••••••" }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${AUTH_INPUT} pr-12`}
        style={{ color: INK, border: `1.5px solid ${invalid ? RED : CARD_BORDER}` }}
      />
      <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg flex items-center justify-center hover:bg-[#F5F7FA]">
        {show ? <EyeOff className="w-5 h-5" style={{ color: SUBTLE }} /> : <Eye className="w-5 h-5" style={{ color: SUBTLE }} />}
      </button>
    </div>
  );
}

function GoogleIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" />
    </svg>
  );
}

function GoogleButton({ label = "Continue with Google", onSuccess }) {
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  // Prototype: simulates the OAuth round-trip. Swap for a real provider (e.g. NextAuth / Google Identity Services).
  const start = () => {
    if (busy) return;
    setBusy(true);
    timer.current = setTimeout(() => { setBusy(false); onSuccess && onSuccess(); }, 900);
  };
  return (
    <button
      type="button"
      onClick={start}
      disabled={busy}
      className="w-full h-[52px] lg:h-12 rounded-xl font-semibold text-[16px] flex items-center justify-center gap-3 bg-white transition-all duration-200 hover:bg-[#F8FAFC] hover:shadow-sm active:scale-[0.99]"
      style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}
    >
      {busy
        ? <span className="w-[18px] h-[18px] rounded-full border-2 animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
        : <GoogleIcon size={20} />}
      {busy ? "Connecting to Google…" : label}
    </button>
  );
}

function OrDivider({ label = "or" }) {
  return (
    <div className="flex items-center gap-3 my-7 lg:my-5">
      <div className="flex-1 h-px" style={{ backgroundColor: CARD_BORDER }} />
      <span className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: SUBTLE }}>{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: CARD_BORDER }} />
    </div>
  );
}

function AuthModeTabs({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 p-1.5 rounded-2xl mb-8 lg:mb-6" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
      {[["signin", "Sign in"], ["signup", "Create account"]].map(([k, label]) => {
        const on = mode === k;
        return (
          <button key={k} type="button" onClick={() => onChange(k)}
            className="h-12 lg:h-11 rounded-xl text-[15.5px] font-bold transition-all duration-200"
            style={{ backgroundColor: on ? "#fff" : "transparent", color: on ? BRAND : SUBTLE, boxShadow: on ? "0 1px 3px rgba(16,24,40,0.12)" : "none" }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function FieldNote({ tone = "error", children }) {
  return (
    <p className="text-[13px] mt-1.5 font-medium" style={{ color: tone === "ok" ? GREEN : tone === "error" ? RED : SUBTLE }}>{children}</p>
  );
}

function UsernameStep({ data, onChange, onNext, onGoogle }) {
  const [status, setStatus] = useState("idle");
  const [touched, setTouched] = useState({});
  const timeoutRef = useRef(null);
  const username = data.username || "";
  const email = data.email || "";
  const whatsapp = data.whatsapp || "";
  const password = data.password || "";
  const touch = (k) => () => setTouched((t) => ({ ...t, [k]: true }));

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (!username) return setStatus("idle");
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(username)) return setStatus("invalid");
    setStatus("checking");
    timeoutRef.current = setTimeout(() => {
      setStatus(TAKEN_USERNAMES.includes(username.toLowerCase()) ? "taken" : "available");
    }, 700);
    return () => clearTimeout(timeoutRef.current);
  }, [username]);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const phoneDigits = normalizePkMobile(whatsapp);
  const phoneCheck = pkMobileCheck(phoneDigits);
  const rules = { length: password.length >= 8, upper: /[A-Z]/.test(password), number: /[0-9]/.test(password) };
  const pwValid = rules.length && rules.upper && rules.number;
  const canContinue = status === "available" && emailValid && phoneCheck.ok && pwValid;

  // only speak up when something is actually wrong
  const userErr = status === "taken" ? "This username is already taken" : status === "invalid" && touched.username ? "Use 4–20 letters, numbers or _" : "";
  const emailErr = touched.email && email && !emailValid ? "Enter a valid email address" : "";
  const phoneErr = phoneCheck.tone === "error" && (touched.whatsapp || (phoneDigits && phoneDigits[0] !== "3")) ? phoneCheck.msg : "";
  const border = (state) => `1.5px solid ${state === "ok" ? GREEN : state === "error" ? RED : CARD_BORDER}`;

  return (
    <div>
      <AuthTitle title="Create your account" sub="Free for doctors, hospitals and patients." />
      <GoogleButton label="Sign up with Google" onSuccess={onGoogle} />
      <OrDivider label="or" />

      <Field label="Username">
        <div className="relative">
          <input
            value={username}
            onChange={(e) => onChange({ ...data, username: e.target.value.replace(/\s/g, "") })}
            onBlur={touch("username")}
            placeholder="e.g. dr_sara_malik"
            autoComplete="username"
            className={`${AUTH_INPUT} pr-11`}
            style={{ color: INK, border: border(status === "available" ? "ok" : userErr ? "error" : "") }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {status === "checking" && <div className="w-[18px] h-[18px] rounded-full border-2 animate-spin" style={{ borderColor: `${SUBTLE} transparent ${SUBTLE} ${SUBTLE}` }} />}
            {status === "available" && <CheckCircle2 className="w-5 h-5" style={{ color: GREEN }} />}
          </div>
        </div>
        {userErr && <FieldNote>{userErr}</FieldNote>}
      </Field>

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => onChange({ ...data, email: e.target.value })}
          onBlur={touch("email")}
          placeholder="you@example.com"
          autoComplete="email"
          className={AUTH_INPUT}
          style={{ color: INK, border: border(emailErr ? "error" : "") }}
        />
        {emailErr && <FieldNote>{emailErr}</FieldNote>}
      </Field>

      <Field label="WhatsApp number">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-[16px] font-semibold pointer-events-none" style={{ color: INK }}>
            <WhatsAppIcon className="w-[18px] h-[18px]" style={{ color: GREEN }} /> +92
          </span>
          <input
            value={whatsapp}
            onChange={(e) => onChange({ ...data, whatsapp: normalizePkMobile(e.target.value) })}
            onBlur={touch("whatsapp")}
            placeholder="300 1234567"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={10}
            aria-invalid={!!phoneErr}
            className={`${AUTH_INPUT} pl-[86px] pr-11`}
            style={{ color: INK, border: border(phoneCheck.ok ? "ok" : phoneErr ? "error" : "") }}
          />
          {phoneCheck.ok && <CheckCircle2 className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2" style={{ color: GREEN }} />}
        </div>
        {phoneErr && <FieldNote>{phoneErr}</FieldNote>}
      </Field>

      <Field label="Password">
        <PasswordInput value={password} onChange={(v) => onChange({ ...data, password: v, confirmPassword: v })} placeholder="Create a password" />
        <div className="flex items-center gap-3 mt-2 whitespace-nowrap overflow-hidden">
          {[["length", "8+ characters"], ["upper", "1 capital"], ["number", "1 number"]].map(([key, label]) => (
            <span key={key} className="inline-flex items-center gap-1 text-[12.5px] font-medium transition-colors" style={{ color: rules[key] ? GREEN : FAINT }}>
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {label}
            </span>
          ))}
        </div>
      </Field>

      <div className="mt-6">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>Continue <ArrowRight className="w-4 h-4" /></PrimaryButton>
      </div>
    </div>
  );
}

function OtpChannelStep({ email, whatsapp, onChoose, onBack }) {
  const options = [
    {
      key: "whatsapp",
      title: "OTP by WhatsApp",
      sub: `Send code to +92 ${whatsapp}`,
      Icon: WhatsAppIcon,
      tint: GREEN_TINT,
      color: GREEN,
    },
    {
      key: "email",
      title: "OTP by Email",
      sub: `Send code to ${email}`,
      Icon: Mail,
      tint: BRAND_50,
      color: BRAND,
    },
  ];

  return (
    <div>
      <BackLink onClick={onBack} />
      <AuthTitle eyebrow="Choose verification" title="How should we verify you?" sub="Pick WhatsApp or email — we'll show a demo code on the next screen." />
      <div className="space-y-3">
        {options.map((o) => {
          const Icon = o.Icon;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChoose(o.key)}
              className="w-full flex items-center gap-3.5 p-4 rounded-2xl text-left bg-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: `1.5px solid ${CARD_BORDER}` }}
            >
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: o.tint, color: o.color }}>
                <Icon className="w-5 h-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-bold" style={{ color: INK }}>{o.title}</span>
                <span className="block text-[13px] mt-0.5 truncate" style={{ color: SUBTLE }}>{o.sub}</span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0" style={{ color: FAINT }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function OtpStep({ channel, whatsapp, email, onNext, onBack }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);
  const CORRECT = "123456";
  const viaWhatsApp = channel === "whatsapp";
  const destination = viaWhatsApp ? `+92 ${whatsapp}` : email;

  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const updateDigit = (i, val) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError(false);
    if (val && i < 5) inputsRef.current[i + 1]?.focus();
  };
  const handleBackspace = (i, e) => { if (e.key === "Backspace" && !digits[i] && i > 0) inputsRef.current[i - 1]?.focus(); };
  const handlePaste = (e) => {
    const code = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!code) return;
    e.preventDefault();
    setDigits(Array.from({ length: 6 }, (_, i) => code[i] || ""));
    inputsRef.current[Math.min(code.length, 5)]?.focus();
  };
  const verify = () => { digits.join("") === CORRECT ? onNext() : setError(true); };

  return (
    <div>
      <BackLink onClick={onBack} />
      <AuthTitle
        eyebrow="Enter OTP"
        title={viaWhatsApp ? "Verify WhatsApp" : "Verify email"}
        sub={<>Enter the 6-digit code sent to <span className="font-semibold" style={{ color: INK }}>{destination}</span></>}
      />
      <div className="grid grid-cols-6 gap-2 mb-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i} ref={(el) => (inputsRef.current[i] = el)} value={d}
            onChange={(e) => updateDigit(i, e.target.value)} onKeyDown={(e) => handleBackspace(i, e)}
            inputMode="numeric" maxLength={1} aria-label={`Digit ${i + 1}`}
            className="pm-input w-full text-center text-[20px] font-bold rounded-xl outline-none bg-white transition-shadow"
            style={{ height: 52, color: INK, border: `1.5px solid ${error ? RED : d ? BRAND : CARD_BORDER}` }}
          />
        ))}
      </div>
      <div className="mb-4 rounded-xl px-3.5 py-3 text-center" style={{ backgroundColor: BRAND_50, border: `1px solid #B9D3F2` }}>
        <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: BRAND }}>Demo OTP</p>
        <p className="text-[22px] font-extrabold tracking-[0.2em] mt-0.5" style={{ color: INK }}>123456</p>
        <p className="text-[12px] mt-1" style={{ color: SUBTLE }}>Use this code to continue — frontend demo only</p>
      </div>
      {error && <p className="text-[12.5px] mb-3 text-center" style={{ color: RED }}>Incorrect code — enter 123456</p>}
      <p className="text-[13.5px] mb-5" style={{ color: SUBTLE }}>
        Didn't get it?{" "}
        {timer > 0
          ? <>Resend in <span className="font-semibold" style={{ color: INK }}>{timer}s</span></>
          : <button type="button" onClick={() => setTimer(30)} className="font-bold" style={{ color: BRAND }}>Resend code</button>}
      </p>
      <PrimaryButton onClick={verify} disabled={digits.some((d) => !d)}>Verify & go to PakMed <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function SignupDoneStep({ username, channel, onFinish }) {
  const verifiedLabel = channel === "email" ? "Email verified" : "WhatsApp verified";
  return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 auth-pop" style={{ backgroundColor: GREEN_TINT }}>
        <CheckCircle2 className="w-8 h-8" style={{ color: GREEN }} />
      </div>
      <h1 className="font-extrabold text-[28px] leading-tight tracking-[-0.03em]" style={{ color: INK }}>You're all set!</h1>
      <p className="text-[14.5px] mt-2 mb-7 leading-relaxed" style={{ color: SUBTLE }}>
        Welcome to PakMed{username ? <>, <span className="font-semibold" style={{ color: INK }}>@{username}</span></> : ""}. Complete your profile to get verified and start applying.
      </p>
      <div className="rounded-2xl p-4 mb-7 text-left space-y-3" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
        {["Account created", verifiedLabel, "Profile — next step"].map((t, i) => (
          <div key={t} className="flex items-center gap-3 text-[14px] font-semibold" style={{ color: i < 2 ? INK : SUBTLE }}>
            <CheckCircle2 className="w-[18px] h-[18px] shrink-0" style={{ color: i < 2 ? GREEN : FAINT }} /> {t}
          </div>
        ))}
      </div>
      <PrimaryButton onClick={onFinish}>Go to PakMed <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function SignInScreen({ onSignIn, onGoogle }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

  return (
    <div>
      <AuthTitle title="Welcome back" sub="Sign in to apply, message, save and post on PakMed." />
      <GoogleButton onSuccess={onGoogle} />
      <OrDivider label="or sign in with WhatsApp" />
      <Field label="WhatsApp number or username">
        <input
          value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="3001234567 or dr_sara_malik"
          className={AUTH_INPUT} style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}
        />
      </Field>
      <Field label="Password" hint={<button type="button" className="text-[14px] font-semibold" style={{ color: BRAND }}>Forgot password?</button>}>
        <PasswordInput value={password} onChange={setPassword} />
      </Field>
      <label className="flex items-center gap-3 mb-7 cursor-pointer select-none">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-5 h-5 rounded accent-[#0B57B7]" />
        <span className="text-[15px]" style={{ color: INK_2 }}>Keep me signed in</span>
      </label>
      <PrimaryButton onClick={onSignIn}>Sign in <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function AuthScreen({ onAuthenticated, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(0);
  const [account, setAccount] = useState({ username: "", email: "", whatsapp: "", password: "", confirmPassword: "" });
  const [otpChannel, setOtpChannel] = useState("whatsapp");

  const switchMode = (m) => { setMode(m); setStep(0); };
  const showTabs = mode === "signin" || step === 0;
  const username = account.username;
  const finishSignup = () => onAuthenticated(username || "new_user", true, {
    phone: account.whatsapp,
    email: account.email,
    password: account.password,
  });

  return (
    <div>
      {showTabs && <AuthModeTabs mode={mode} onChange={switchMode} />}
      {mode === "signup" && step > 0 && <StepDots total={2} current={step - 1} />}
      <div key={`${mode}-${step}-${otpChannel}`} className="auth-step">
        {mode === "signin" && (
          <SignInScreen
            onSignIn={() => onAuthenticated(username || "dr_awais_khan", false)}
            onGoogle={() => onAuthenticated("google_user", false)}
          />
        )}
        {mode === "signup" && step === 0 && (
          <UsernameStep data={account} onChange={setAccount} onNext={() => setStep(1)} onGoogle={() => onAuthenticated("google_user", true)} />
        )}
        {mode === "signup" && step === 1 && (
          <OtpChannelStep
            email={account.email}
            whatsapp={account.whatsapp}
            onChoose={(ch) => { setOtpChannel(ch); setStep(2); }}
            onBack={() => setStep(0)}
          />
        )}
        {mode === "signup" && step === 2 && (
          <OtpStep
            channel={otpChannel}
            whatsapp={account.whatsapp}
            email={account.email}
            onNext={finishSignup}
            onBack={() => setStep(1)}
          />
        )}
      </div>
      {showTabs && (
        <p className="text-[15px] text-center mt-7 lg:mt-5 leading-relaxed" style={{ color: SUBTLE }}>
          {mode === "signin" ? (
            <>
              Don&apos;t have an account?{" "}
              <button type="button" onClick={() => switchMode("signup")} className="font-bold underline-offset-2 hover:underline" style={{ color: BRAND }}>
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button type="button" onClick={() => switchMode("signin")} className="font-bold underline-offset-2 hover:underline" style={{ color: BRAND }}>
                Sign in
              </button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

function AuthShell({ reason, onHome, onClose, children }) {
  return (
    <div className="flex-1 w-full grid lg:grid-cols-[0.9fr_1.1fr] min-h-screen lg:min-h-0 lg:h-dvh bg-white" style={{ fontFamily: FONT }}>
      <aside className="relative hidden lg:flex flex-col justify-between p-8 xl:p-10 overflow-hidden lg:h-dvh" style={{ backgroundColor: BRAND_DK }}>
        <img src="/images/landing/care.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,66,140,0.25) 0%, rgba(8,66,140,0.75) 50%, rgba(6,38,79,0.97) 100%)" }} />
        <button type="button" onClick={onHome} className="relative flex items-center gap-2 self-start" aria-label="PakMed home">
          <span className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-white">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={BRAND} strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <span className="text-[22px] font-extrabold tracking-[-0.035em] text-white">PakMed</span>
        </button>
        <div className="relative auth-panel-in">
          <h2 className="text-[30px] xl:text-[36px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white max-w-md">
            Pakistan's healthcare network, in one place.
          </h2>
          <ul className="mt-4 xl:mt-5 space-y-2.5">
            {["Thousands of verified doctors & facilities", "Apply to jobs in one tap", "Message employers and doctors directly"].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-[14px] font-medium" style={{ color: "#DCE8F8" }}>
                <CheckCircle2 className="w-[18px] h-[18px] shrink-0" style={{ color: "#7DD3A8" }} /> {t}
              </li>
            ))}
          </ul>
          <figure className="mt-5 xl:mt-6 rounded-2xl p-4 max-w-md" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)" }}>
            <blockquote className="text-[13.5px] leading-relaxed text-white">“I found a locum emergency shift within a day. The whole process was transparent.”</blockquote>
            <figcaption className="flex items-center gap-3 mt-3">
              <img src="/images/landing/avatar-1.jpg" alt="" className="w-8 h-8 rounded-full object-cover" />
              <div>
                <p className="text-[13px] font-bold text-white">Dr. Ayesha Siddiqui</p>
                <p className="text-[11.5px]" style={{ color: "#B8C9E3" }}>Medical Officer, Karachi</p>
              </div>
            </figcaption>
          </figure>
        </div>
        <p className="relative text-[12px]" style={{ color: "#9FB3D1" }}>© {new Date().getFullYear()} PakMed · Healthcare. Connected.</p>
      </aside>

      <main className="auth-scroll flex flex-col min-h-screen lg:min-h-0 lg:h-dvh lg:overflow-y-auto" style={{ background: `linear-gradient(180deg, ${BRAND_50} 0%, #fff 220px)` }}>
        <div className="lg:hidden flex items-center justify-between gap-3 px-5 h-[56px] shrink-0">
          <BrandMark size={30} onClick={onHome} />
          <button type="button" onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center bg-white" style={{ border: `1px solid ${CARD_BORDER}` }} aria-label="Close">
            <X className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>
        <div className="flex-1 flex flex-col px-5 sm:px-8 pt-4 pb-14 lg:py-8">
          {/* my-auto centres when it fits and stays fully reachable when it doesn't */}
          <div className="w-full max-w-[460px] lg:max-w-[540px] mx-auto lg:my-auto">
            <div className="hidden lg:flex justify-center mb-6">
              <BrandMark size={32} onClick={onHome} />
            </div>
            {reason && (
              <div className="lg:hidden mb-5 flex items-center gap-2 text-[13px] font-semibold px-3.5 py-2.5 rounded-xl" style={{ color: BRAND, backgroundColor: "#fff", border: "1px solid #B9D3F2" }}>
                <Info className="w-4 h-4 shrink-0" /> Sign in to {reason}
              </div>
            )}
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

/* =========================================================
   HOME
   ========================================================= */
const TABS = {
  find:     { label: "Find a Job",      sub: "open near you",   color: "#0B57B7", tint: "#EAF2FC", icon: Search },
  consult:  { label: "Find a Doctor",   sub: "doctors listed",  color: "#C0362C", tint: "#FDECEC", icon: Stethoscope },
  post:     { label: "Offer a Job",     sub: "Post free",       color: "#12805C", tint: "#E7F5EF", icon: Briefcase },
  market:   { label: "Buy / Sell",      sub: "listings",        color: "#5B47C7", tint: "#F1EDFC", icon: Store },
  hospital: { label: "Find a Hospital", sub: "facilities near you", color: "#0E7C86", tint: "#E6F6F7", icon: Building2 },
  feeds:    { label: "Our Feeds",       sub: "verified updates", color: "#B54708", tint: "#FFF6E8", icon: Newspaper },
};

const postJobCards = [
  { id: "pj1", eyebrow: "For Hospitals", title: "Post your first job free", body: "New facilities get one free listing this month — reach PMDC-verified doctors across Pakistan within hours.", likes: 84, comments: [
    { id: "pj1-c1", name: "City Heart Clinic", text: "Just posted our first vacancy, easy process.", likes: 4, replies: [
      { id: "pj1-c1-r1", name: "PakMed Support", text: "So glad to hear that! Let us know if you need help reviewing applicants.", likes: 1 },
    ] },
    { id: "pj1-c2", name: "Rehman Medical Centre", text: "How long does the free listing stay active? Couldn't find it in the FAQ.", likes: 9, replies: [
      { id: "pj1-c2-r1", name: "PakMed Support", text: "30 days from posting, or until you close the position.", likes: 6 },
    ] },
    { id: "pj1-c3", name: "Dr. Salman (Clinic Owner)", text: "Posted a part-time GP role last week and got 14 applicants, 9 of them PMDC verified. Solid response for a small clinic in Multan.", likes: 31, replies: [
      { id: "pj1-c3-r1", name: "Noor Diagnostics", text: "That's encouraging, we're in Multan too. Going to try it.", likes: 4 },
    ] },
    { id: "pj1-c4", name: "Al-Shifa Hospital HR", text: "Can we post multiple departments under one listing or does each need its own?", likes: 5, replies: [] },
  ] },
  { id: "pj2", eyebrow: "Product Update", title: "Fill shifts 3x faster", body: "Facilities using instant-apply are matching night and emergency shifts in under 6 hours on average.", likes: 152, comments: [
    { id: "pj2-c1", name: "Aga Care HR", text: "Confirmed, filled 2 night shifts this week.", likes: 9, replies: [] },
    { id: "pj2-c2", name: "Dr. Nadia", text: "As a doctor I appreciate instant-apply, no more waiting days for a callback.", likes: 22, replies: [
      { id: "pj2-c2-r1", name: "PakMed Support", text: "That's exactly what we were going for. Thanks Dr. Nadia!", likes: 3 },
    ] },
  ] },
  { id: "pj3", eyebrow: "Tip", title: "Add a PMDC-verified filter", body: "Listings that require PMDC verification see 40% fewer unqualified applicants.", likes: 61, comments: [
    { id: "pj3-c1", name: "Shifa Wellness", text: "Turned this on and application quality improved noticeably.", likes: 11, replies: [] },
  ] },
];
const findJobCards = [
  { id: "fj1", eyebrow: "Karachi · Locum", title: "Medical Officer — Emergency", body: "Aga Care Hospital · PKR 8,500 / shift · 11:00 PM – 7:00 AM · Starts tonight", likes: 47, comments: [
    { id: "fj1-c1", name: "Dr. Zainab", text: "Applied, hope to hear back soon.", likes: 3, replies: [
      { id: "fj1-c1-r1", name: "Aga Care Hospital", text: "Thanks for applying — we'll respond within 24 hours.", likes: 2 },
      { id: "fj1-c1-r2", name: "Dr. Bilal", text: "Good luck, I worked a shift here last month.", likes: 1 },
    ] },
    { id: "fj1-c2", name: "Dr. Hassan", text: "Is transport provided for the night shift? Coming from Gulshan.", likes: 12, replies: [
      { id: "fj1-c2-r1", name: "Aga Care Hospital", text: "Yes, pick-up and drop is arranged for all night shifts.", likes: 8 },
    ] },
    { id: "fj1-c3", name: "Dr. Ayesha Siddiqui", text: "Rate seems fair for an 8-hour emergency shift honestly. Most places in Karachi are offering 6-7k for the same hours.", likes: 24, replies: [
      { id: "fj1-c3-r1", name: "Dr. Kamran", text: "Agreed, this is above market right now.", likes: 5 },
      { id: "fj1-c3-r2", name: "Dr. Zainab", text: "Depends on patient load though, ER can get rough.", likes: 3 },
      { id: "fj1-c3-r3", name: "Dr. Ayesha Siddiqui", text: "True, but Aga Care runs a well-staffed ER from what I hear.", likes: 2 },
    ] },
    { id: "fj1-c4", name: "Dr. Usman Tariq", text: "Do they require prior emergency experience or are fresh grads considered?", likes: 7, replies: [
      { id: "fj1-c4-r1", name: "Aga Care Hospital", text: "At least 1 year post-house-job experience preferred.", likes: 4 },
    ] },
    { id: "fj1-c5", name: "Dr. Fatima Noor", text: "Payment was on time when I did a locum here in June. Can confirm.", likes: 18, replies: [] },
    { id: "fj1-c6", name: "Dr. Imran", text: "Any chance of recurring weekly shifts or is this one-off?", likes: 4, replies: [] },
  ] },
  { id: "fj2", eyebrow: "Lahore · Part-time", title: "Consultant Cardiologist", body: "City Heart Clinic · PKR 180k / month · Mon, Wed, Fri · 4:00 PM – 9:00 PM", likes: 33, comments: [] },
  { id: "fj3", eyebrow: "Islamabad · Full-time", title: "General Physician", body: "Shifa Wellness · PKR 220k / month · Mon–Fri · Day shift", likes: 58, comments: [{ id: "fj3-c1", name: "Dr. Omar", text: "Great facility, worked here before.", likes: 6, replies: [] }] },
];
const consultDoctorCards = [
  { id: "cd1", eyebrow: "Available now", title: "Dr. Sara Malik", body: "MBBS, FCPS Medicine · Karachi · PMDC verified · 4.8★ · Online consult available", likes: 71, comments: [
    { id: "cd1-c1", name: "Patient", text: "Very thorough consultation, recommended.", likes: 5, replies: [
      { id: "cd1-c1-r1", name: "Dr. Sara Malik", text: "Thank you so much, take care!", likes: 3 },
    ] },
    { id: "cd1-c2", name: "Hina R.", text: "Does she do follow-ups over video or only in person?", likes: 8, replies: [
      { id: "cd1-c2-r1", name: "Dr. Sara Malik", text: "Follow-ups can be done over video within 2 weeks of the first visit.", likes: 6 },
    ] },
    { id: "cd1-c3", name: "Kashif A.", text: "Booked an online slot for my mother, appointment started on time and she explained everything patiently. Worth it.", likes: 27, replies: [
      { id: "cd1-c3-r1", name: "Sana M.", text: "Good to know, punctuality is rare. Booking one now.", likes: 4 },
    ] },
    { id: "cd1-c4", name: "Bilal Ahmed", text: "What's the consultation fee for an online session?", likes: 6, replies: [] },
  ] },
  { id: "cd2", eyebrow: "Cardiology", title: "Dr. Hamza Iqbal", body: "MBBS, Cardiology Fellow · Lahore · PMDC verified · 4.9★ · Evenings only", likes: 39, comments: [
    { id: "cd2-c1", name: "Tariq S.", text: "Excellent with explaining ECG results in plain language.", likes: 14, replies: [] },
  ] },
  { id: "cd3", eyebrow: "Pediatrics", title: "Dr. Noor Fatima", body: "MBBS, FCPS Pediatrics · Islamabad · PMDC verified · 4.7★ · Same-day slots", likes: 26, comments: [
    { id: "cd3-c1", name: "Patient", text: "Great with kids, very patient.", likes: 8, replies: [
      { id: "cd3-c1-r1", name: "Dr. Noor Fatima", text: "Thank you! Hope your little one is feeling better.", likes: 5 },
    ] },
    { id: "cd3-c2", name: "Ammara K.", text: "Same-day slots have been a lifesaver twice now.", likes: 11, replies: [] },
  ] },
];
const dataByTab = { post: postJobCards, find: findJobCards, consult: consultDoctorCards };

/* latest 20 uploads across the platform — each may carry an image or a short (<=15s) video */
const FEED_MEDIA = [
  { kind: "gradient", g: "linear-gradient(160deg,#1B3A6B,#0F2445)" },
  { kind: "gradient", g: "linear-gradient(160deg,#0E7C7B,#0A4746)" },
  { kind: "gradient", g: "linear-gradient(160deg,#B3202C,#6E1119)" },
  { kind: "gradient", g: "linear-gradient(160deg,#6D5BD0,#3B2F7A)" },
  { kind: "gradient", g: "linear-gradient(160deg,#D98324,#8A4F12)" },
  { kind: "gradient", g: "linear-gradient(160deg,#22252B,#101215)" },
];

const POST_IMAGES = {
  fj1: "post-emergency", fj2: "post-cardio", fj3: "post-gp",
  pj1: "post-hiring", pj2: "post-shifts", pj3: "post-verified",
  cd1: "post-sara", cd2: "post-hamza", cd3: "post-noor",
};
const POST_CATEGORY = { fj: "Jobs", pj: "For Hospitals", cd: "Doctors" };

function postAgeHours(t = "") {
  const n = parseFloat(t) || 0;
  if (/d$/.test(t)) return n * 24;
  if (/w$/.test(t)) return n * 168;
  if (/m$/.test(t)) return n / 60;
  return n;
}

const FEED_CARDS = [...findJobCards, ...postJobCards, ...consultDoctorCards]
  .slice(0, 20)
  .map((c, i) => ({
    ...c,
    media: c.media || (POST_IMAGES[c.id] ? { kind: "image", src: `/images/landing/${POST_IMAGES[c.id]}.jpg` } : FEED_MEDIA[i % FEED_MEDIA.length]),
    category: POST_CATEGORY[c.id.slice(0, 2)] || "Updates",
    author: c.author || (c.id.startsWith("fj") ? "PakMed Jobs" : c.id.startsWith("pj") ? "PakMed for Hospitals" : "PakMed Directory"),
    time: c.time || ["2h", "5h", "1d", "2d", "3d"][i % 5],
  }));

const LATEST_POSTS = [...FEED_CARDS].sort((a, b) => postAgeHours(a.time) - postAgeHours(b.time));

const adBanners = [
  {
    id: "ad1", tag: "Sponsored", partner: "Meezan Bank", color: "#0F4D3A",
    title: "Meezan Bank — Doctor Salary Account",
    headline: "A salary account built for doctors",
    body: "Zero-fee account for verified doctors, with instant WhatsApp alerts on every payout.",
    perk: "Zero account fees", cta: "Open an account",
    image: "/images/landing/ad-salary.jpg",
    points: ["No minimum balance for PMDC-verified doctors", "Instant WhatsApp alerts for every locum payout", "Free debit card and online banking"],
  },
  {
    id: "ad2", tag: "Sponsored", partner: "Getz Pharma", color: "#1D3A8A",
    title: "Getz Pharma — Free CME Webinar",
    headline: "Free CME webinar: emergency cardiac care",
    body: "Earn CME credits this weekend in a live session led by senior cardiologists.",
    perk: "Earn CME credits", cta: "Reserve your seat",
    image: "/images/landing/ad-webinar.jpg",
    points: ["Live session this Saturday, 7:00 PM PKT", "CME certificate on completion", "Q&A with senior cardiologists"],
  },
  {
    id: "ad3", tag: "PakMed", partner: "PakMed Premium", color: "#0B57B7",
    title: "Go Premium — Get verified 2x faster",
    headline: "Get verified twice as fast with Premium",
    body: "Skip the queue on document review and appear higher in hospital search results.",
    perk: "Priority verification", cta: "Explore Premium",
    image: "/images/landing/ad-premium.jpg",
    points: ["Documents reviewed within 24 hours", "Priority placement in hospital searches", "Premium badge on your profile"],
  },
  {
    id: "ad4", tag: "Sponsored", partner: "Shifa Labs", color: "#8A1F2B",
    title: "Shifa Labs — Discounted diagnostics",
    headline: "20% off diagnostics for your family",
    body: "PakMed doctors get 20% off panel tests for their own family members this month.",
    perk: "20% off panel tests", cta: "Claim discount",
    image: "/images/landing/ad-diagnostics.jpg",
    points: ["Valid at all Shifa Labs collection centres", "Covers routine and specialised panels", "Offer ends this month"],
  },
];

function cloneComments(comments) {
  return comments.map((c) => ({ ...c, liked: false, replies: (c.replies || []).map((r) => ({ ...r, liked: false })) }));
}

function initState(cards) {
  return Object.fromEntries(cards.map((c) => [c.id, { liked: false, likes: c.likes, saved: false, comments: cloneComments(c.comments) }]));
}

function BrandIcon({ d, viewBox = "0 0 24 24" }) {
  return (
    <svg viewBox={viewBox} className="w-6 h-6" fill="white">
      <path d={d} />
    </svg>
  );
}

const ICON_PATHS = {
  whatsapp:
    "M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.07L2 22l5.25-1.38c1.44.79 3.08 1.24 4.79 1.24h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm5.71 14.02c-.24.68-1.19 1.25-1.94 1.4-.53.11-1.22.2-3.51-.75-2.86-1.19-4.7-4.06-4.84-4.25-.14-.19-1.16-1.54-1.16-2.95 0-1.4.73-2.09.99-2.38.26-.29.56-.36.75-.36.19 0 .38 0 .54.01.17.01.4-.06.63.48.24.56.81 1.95.88 2.09.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.28.71 1.17 1.53 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.6-.07.16-.19.68-.79.86-1.06.18-.27.36-.22.6-.13.24.09 1.53.72 1.79.85.26.13.43.19.5.3.07.11.07.63-.17 1.31z",
  facebook:
    "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103.257.031.58.076.868.13v3.396a8.02 8.02 0 0 0-.653-.036 8.63 8.63 0 0 0-.732-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 1.913-.287 1.754h-3.246v7.98H9.101Z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  instagram:
    "M12 0C8.74 0 8.333.014 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.014 8.333 0 8.74 0 12s.014 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.986 8.74 24 12 24s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.058-1.28.072-1.687.072-4.947s-.014-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.014 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227a3.81 3.81 0 0 1-.899 1.382 3.744 3.744 0 0 1-1.38.896c-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421a3.716 3.716 0 0 1-1.379-.899 3.644 3.644 0 0 1-.9-1.38c-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm7.846-10.405a1.441 1.441 0 1 1-2.883 0 1.441 1.441 0 0 1 2.883 0z",
  tiktok:
    "M16.6 5.82c-1.12-1.08-1.67-2.64-1.75-4.17h-3.9v14.24c0 1.79-1.46 3.25-3.25 3.25a3.25 3.25 0 0 1-1.28-6.24c.44-.19.91-.28 1.38-.28.32 0 .63.04.92.11V8.92a7.09 7.09 0 0 0-.92-.06C3.53 8.86 0 12.39 0 16.72 0 21.06 3.53 24.6 7.86 24.6c4.34 0 7.87-3.53 7.87-7.87V9.85a10.03 10.03 0 0 0 5.87 1.88V7.7c-1.87.02-3.68-.67-5-1.88Z",
};

function ShareSheet({ card, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://pakmed.app/feed/${card.id}`;
  const shareText = card.title;
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const openLink = (url) => {
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      /* no-op in sandboxed preview */
    }
  };

  const copyLink = () => {
    try {
      navigator.clipboard.writeText(shareUrl);
    } catch (e) {
      /* no-op */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const platforms = [
    {
      key: "whatsapp",
      label: "WhatsApp",
      bg: "#25D366",
      icon: <BrandIcon d={ICON_PATHS.whatsapp} />,
      onClick: () => openLink(`https://wa.me/?text=${encodeURIComponent(shareText + " — " + shareUrl)}`),
    },
    {
      key: "facebook",
      label: "Facebook",
      bg: "#1877F2",
      icon: <BrandIcon d={ICON_PATHS.facebook} />,
      onClick: () => openLink(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`),
    },
    {
      key: "x",
      label: "X",
      bg: "#000000",
      icon: <BrandIcon d={ICON_PATHS.x} />,
      onClick: () => openLink(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`),
    },
    {
      key: "instagram",
      label: "Instagram",
      bg: "linear-gradient(135deg, #F58529, #DD2A7B, #8134AF, #515BD4)",
      icon: <BrandIcon d={ICON_PATHS.instagram} />,
      onClick: copyLink,
      note: "Link copied — paste into your Instagram story or DM",
    },
    {
      key: "tiktok",
      label: "TikTok",
      bg: "#000000",
      icon: <BrandIcon d={ICON_PATHS.tiktok} />,
      onClick: copyLink,
      note: "Link copied — paste into your TikTok bio or video",
    },
    {
      key: "copy",
      label: "Copy Link",
      bg: "#EFF2FA",
      icon: <Send className="w-5 h-5" style={{ color: INK, transform: "rotate(-45deg)" }} />,
      onClick: copyLink,
    },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Share">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl flex flex-col auth-step" style={{ boxShadow: "0 30px 80px -20px rgba(16,24,40,0.45)", fontFamily: FONT }}>
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
          <p className="font-extrabold text-[18px]" style={{ color: INK }}>Share</p>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#EEF1F5]" style={{ backgroundColor: CREAM }}>
            <X className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>
        <div className="px-5 pt-2 pb-6">
          <p className="text-[14px] mb-5 line-clamp-2" style={{ color: SUBTLE }}>{card.title}</p>
          <div className="grid grid-cols-3 gap-y-5">
            {platforms.map((p) => (
              <button key={p.key} type="button" onClick={p.onClick} className="flex flex-col items-center gap-2 rounded-2xl py-2 transition-colors hover:bg-[#F5F7FA]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: p.bg, border: p.key === "copy" ? `1px solid ${CARD_BORDER}` : "none" }}>
                  {p.icon}
                </div>
                <span className="text-[11.5px] font-medium" style={{ color: INK }}>{p.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 p-1.5 pl-3.5 rounded-xl" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
            <span className="flex-1 min-w-0 truncate text-[13.5px]" style={{ color: INK_2 }}>{shareUrl}</span>
            <button type="button" onClick={copyLink} className="h-9 px-3.5 rounded-lg text-[13px] font-bold text-white shrink-0" style={{ backgroundColor: copied ? GREEN : BRAND }}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   VERTICAL FEED — full-screen, swipe up/down (Instagram style)
   ========================================================= */
function VerticalFeedScreen({ cards, startIndex = 0, onBack, onTabNav, onReport, reportedIds }) {
  const gate = useContext(AuthGate);
  const scrollRef = useRef(null);
  const [state, setState] = useState(() =>
    Object.fromEntries(cards.map((c) => [c.id, { liked: false, likes: c.likes, saved: false, comments: cloneComments(c.comments) }]))
  );
  const [active, setActive] = useState(startIndex);
  const [commentFor, setCommentFor] = useState(null);
  const [shareFor, setShareFor] = useState(null);
  const [draft, setDraft] = useState("");
  const [expanded, setExpanded] = useState({});
  const swipeX = useRef(null);
  const swipeY = useRef(null);

  const onTouchStart = (e) => { swipeX.current = e.touches[0].clientX; swipeY.current = e.touches[0].clientY; };
  const onTouchEnd = (e) => {
    if (swipeX.current === null) return;
    const dx = e.changedTouches[0].clientX - swipeX.current;
    const dy = e.changedTouches[0].clientY - swipeY.current;
    swipeX.current = null;
    // horizontal swipe (either direction) leaves the feed; vertical is handled by scroll-snap
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) onBack();
  };

  // jump to the tapped card on mount
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = startIndex * el.clientHeight;
  }, [startIndex]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || !el.clientHeight) return;
    const i = Math.round(el.scrollTop / el.clientHeight);
    if (i !== active) setActive(i);
  };

  const toggleLike = (id) => setState((p) => ({ ...p, [id]: { ...p[id], liked: !p[id].liked, likes: p[id].liked ? p[id].likes - 1 : p[id].likes + 1 } }));
  const toggleSave = (id) => setState((p) => ({ ...p, [id]: { ...p[id], saved: !p[id].saved } }));

  const addComment = () => {
    if (!draft.trim() || !commentFor) return;
    setState((p) => ({
      ...p,
      [commentFor]: {
        ...p[commentFor],
        comments: [...p[commentFor].comments, { id: `${commentFor}-n${Date.now()}`, name: "You", text: draft.trim(), likes: 0, liked: false, replies: [] }],
      },
    }));
    setDraft("");
  };

  const toggleCommentLike = (cardId, cid) => setState((p) => ({
    ...p,
    [cardId]: { ...p[cardId], comments: p[cardId].comments.map((c) => (c.id === cid ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 } : c)) },
  }));

  const sheetCard = commentFor ? cards.find((c) => c.id === commentFor) : null;
  const sheetState = commentFor ? state[commentFor] : null;

  return (
    <div className="relative h-full min-h-0" style={{ backgroundColor: "#0B0D10" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>

      {/* floating top tabs — same colours as home, tuned for dark media */}
      <div className="absolute top-0 left-0 right-0 z-30 px-2.5 pt-3 pb-2">
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 flex-1 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {Object.entries(TABS).map(([key, t]) => {
              const Icon = t.icon;
              return (
                <button
                  key={key}
                  onClick={() => onTabNav(key)}
                  className="shrink-0 rounded-full pl-2 pr-3 py-1.5 flex items-center gap-1.5 active:scale-95 transition-transform"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                    boxShadow: "0 2px 10px rgba(0,0,0,.25)",
                  }}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: t.tint }}>
                    <Icon className="w-3 h-3" style={{ color: t.color }} strokeWidth={2.4} />
                  </span>
                  <span className="text-[10.5px] font-bold leading-none whitespace-nowrap" style={{ color: t.color }}>{t.label}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            style={{ background: "rgba(255,255,255,0.92)", boxShadow: "0 2px 10px rgba(0,0,0,.25)" }}
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>
      </div>

      {/* position dots */}
      <div className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-1">
        {cards.slice(0, 20).map((c, i) => (
          <span key={c.id} className="rounded-full transition-all"
            style={{ width: 3, height: i === active ? 14 : 3, backgroundColor: i === active ? "#FFFFFF" : "#FFFFFF55" }} />
        ))}
      </div>

      {/* vertical snap scroller */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full overflow-y-auto"
        style={{ scrollSnapType: "y mandatory", scrollbarWidth: "none", WebkitOverflowScrolling: "touch" }}
      >
        {cards.map((c) => {
          const st = state[c.id];
          return (
            <div key={c.id} className="relative h-full w-full shrink-0" style={{ scrollSnapAlign: "start", scrollSnapStop: "always" }}>
              {/* media */}
              <div className="absolute inset-0" style={{ background: c.media.kind === "gradient" ? c.media.g : "#111" }}>
                {c.media.kind === "image" && <img src={c.media.src} alt="" className="w-full h-full object-cover" />}
                {c.media.kind === "video" && (
                  <video src={c.media.src} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                )}
              </div>

              {/* legibility scrim */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,.45) 0%,rgba(0,0,0,0) 26%,rgba(0,0,0,0) 45%,rgba(0,0,0,.75) 100%)" }} />

              {/* right action rail */}
              <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-5">
                <button onClick={() => gate.require("like posts", () => toggleLike(c.id))} className="flex flex-col items-center gap-1">
                  <Heart className="w-7 h-7" fill={st.liked ? "#DC2626" : "none"} stroke={st.liked ? "#DC2626" : "#fff"} strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-white">{st.likes}</span>
                </button>
                <button onClick={() => setCommentFor(c.id)} className="flex flex-col items-center gap-1">
                  <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-white">
                    {st.comments.reduce((n, x) => n + 1 + x.replies.length, 0)}
                  </span>
                </button>
                <button onClick={() => gate.require("share posts", () => setShareFor(c))} className="flex flex-col items-center gap-1">
                  <Repeat2 className="w-7 h-7 text-white" strokeWidth={2} />
                  <span className="text-[11px] font-semibold text-white">Share</span>
                </button>
                <button onClick={() => gate.require("save posts", () => toggleSave(c.id))}>
                  <Bookmark className="w-7 h-7" fill={st.saved ? "#fff" : "none"} stroke="#fff" strokeWidth={2} />
                </button>
                <ReportButton
                  dark
                  reported={reportedIds && reportedIds.has(c.id)}
                  onClick={() => onReport && onReport({ id: c.id, type: "post", title: c.title, subtitle: c.author })}
                />
              </div>

              {/* bottom content */}
              <div className="absolute left-0 right-14 bottom-0 z-20 px-4 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: "rgba(255,255,255,0.22)" }}>
                    {c.author[0]}
                  </div>
                  <span className="text-[13px] font-semibold text-white">{c.author}</span>
                  <span className="text-[11.5px] text-white/60">· {c.time}</span>
                </div>
                <span className="inline-block text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full mb-2" style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}>
                  {c.eyebrow}
                </span>
                <p className="text-[19px] font-bold leading-snug text-white">{c.title}</p>
                <p className="text-[13.5px] leading-snug text-white/85 mt-1.5">{c.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* comments sheet */}
      {commentFor && sheetState && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCommentFor(null)} />
          <div className="relative w-full bg-white rounded-t-3xl flex flex-col" style={{ height: "72%" }}>
            <div className="flex justify-center pt-2.5 pb-1"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>
            <div className="flex items-center justify-between px-5 pb-3 border-b shrink-0" style={{ borderColor: CARD_BORDER }}>
              <span className="w-8" />
              <p className="font-bold text-[15px]" style={{ color: INK }}>Comments</p>
              <button onClick={() => setCommentFor(null)} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3 flex flex-col gap-4">
              {sheetState.comments.length === 0 && (
                <p className="text-[13px] text-center py-6" style={{ color: SUBTLE }}>No comments yet — be the first.</p>
              )}
              {sheetState.comments.map((cm) => (
                <div key={cm.id}>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ backgroundColor: NAVY }}>{cm.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-semibold" style={{ color: INK }}>
                        {cm.name} <span className="font-normal text-[11.5px]" style={{ color: SUBTLE }}>{cm.time || "2h"}</span>
                      </p>
                      <p className="text-[13.5px]" style={{ color: "#4B4A45" }}>{cm.text}</p>
                    </div>
                    <button onClick={() => gate.require("like comments", () => toggleCommentLike(commentFor, cm.id))} className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                      <Heart className="w-4 h-4" fill={cm.liked ? "#DC2626" : "none"} stroke={cm.liked ? "#DC2626" : SUBTLE} strokeWidth={2} />
                      <span className="text-[10.5px]" style={{ color: SUBTLE }}>{cm.likes > 0 ? cm.likes : ""}</span>
                    </button>
                  </div>
                  {cm.replies.length > 0 && (
                    <button onClick={() => setExpanded((p) => ({ ...p, [cm.id]: !p[cm.id] }))} className="flex items-center gap-2 mt-1.5 ml-[42px]">
                      <span className="w-6 h-px" style={{ backgroundColor: CARD_BORDER }} />
                      <span className="text-[11.5px] font-semibold" style={{ color: SUBTLE }}>
                        {expanded[cm.id] ? "Hide replies" : `View ${cm.replies.length} repl${cm.replies.length > 1 ? "ies" : "y"}`}
                      </span>
                    </button>
                  )}
                  {expanded[cm.id] && (
                    <div className="mt-2.5 ml-[42px] flex flex-col gap-2.5">
                      {cm.replies.map((r) => (
                        <div key={r.id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: NAVY, opacity: .8 }}>{r.name[0]}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold" style={{ color: INK }}>{r.name}</p>
                            <p className="text-[12.5px]" style={{ color: "#4B4A45" }}>{r.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between px-4 pt-2 pb-1 border-t shrink-0" style={{ borderColor: CARD_BORDER }}>
              {["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"].map((em) => (
                <button key={em} onClick={() => { setDraft((d) => d + em); }} className="text-[19px] active:scale-90 transition-transform">{em}</button>
              ))}
            </div>

            <div className="px-4 py-3 border-t flex items-center gap-2.5 shrink-0" style={{ borderColor: CARD_BORDER }}>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && gate.require("comment", addComment)}
                enterKeyHint="send"
                placeholder={`Add a comment on ${sheetCard ? sheetCard.title : ""}`}
                className="flex-1 text-[13.5px] rounded-full px-4 py-2.5 outline-none"
                style={{ backgroundColor: "#EFF2FA" }}
              />
              <button onClick={() => gate.require("comment", addComment)} disabled={!draft.trim()} className="text-[13.5px] font-semibold px-1" style={{ color: NAVY, opacity: draft.trim() ? 1 : 0.35 }}>
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {shareFor && <ShareSheet card={shareFor} onClose={() => setShareFor(null)} />}
    </div>
  );
}

function FeedCarousel({ tabKey, onOpenCard }) {
  const gate = useContext(AuthGate);
  const theme = TABS[tabKey];
  const cards = FEED_CARDS;
  const [index, setIndex] = useState(0);
  const [cardState, setCardState] = useState(() => initState(cards));
  const [commentSheet, setCommentSheet] = useState(null);
  const [commentDraft, setCommentDraft] = useState("");
  const [replyTarget, setReplyTarget] = useState(null); // { commentId, name } | null
  const [expandedReplies, setExpandedReplies] = useState({}); // commentId -> bool
  const [shareOpen, setShareOpen] = useState(false);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const touchStartX = useRef(null);
  const dragOffset = useRef(0);
  const [dragX, setDragX] = useState(0);
  const [lastTab, setLastTab] = useState(tabKey);

  useEffect(() => {
    if (!commentSheet) { setKeyboardInset(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => {
      const inset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardInset(inset);
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, [commentSheet]);

  if (lastTab !== tabKey) {
    setLastTab(tabKey); setIndex(0); setCardState(initState(cards)); setCommentSheet(null); setDragX(0);
  }

  const safeIndex = Math.min(index, cards.length - 1);
  const card = cards[safeIndex] || cards[0];
  const state = cardState[card.id] || { liked: false, likes: card.likes, saved: false, comments: cloneComments(card.comments) };
  const goTo = (i) => { if (i < 0 || i >= cards.length) return; setIndex(i); setDragX(0); };
  const onTouchStart = (e) => (touchStartX.current = e.touches[0].clientX);
  const onTouchMove = (e) => { if (touchStartX.current === null) return; dragOffset.current = e.touches[0].clientX - touchStartX.current; setDragX(dragOffset.current); };
  const onTouchEnd = () => {
    if (Math.abs(dragOffset.current) > 60) goTo(dragOffset.current < 0 ? safeIndex + 1 : safeIndex - 1); else setDragX(0);
    touchStartX.current = null; dragOffset.current = 0;
  };
  const entryFor = (prev, id) => prev[id] || (() => { const c = cards.find((x) => x.id === id); return { liked: false, likes: c ? c.likes : 0, saved: false, comments: cloneComments(c ? c.comments : []) }; })();
  const toggleLike = (id) => setCardState((prev) => { const e = entryFor(prev, id); return { ...prev, [id]: { ...e, liked: !e.liked, likes: e.liked ? e.likes - 1 : e.likes + 1 } }; });
  const toggleSave = (id) => setCardState((prev) => { const e = entryFor(prev, id); return { ...prev, [id]: { ...e, saved: !e.saved } }; });

  const toggleCommentLike = (cardId, commentId, replyId) => {
    setCardState((prev) => {
      const comments = entryFor(prev, cardId).comments.map((c) => {
        if (replyId) {
          if (c.id !== commentId) return c;
          return { ...c, replies: c.replies.map((r) => (r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r)) };
        }
        if (c.id !== commentId) return c;
        return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
      });
      return { ...prev, [cardId]: { ...entryFor(prev, cardId), comments } };
    });
  };

  const addComment = () => {
    if (!commentDraft.trim() || !commentSheet) return;
    setCardState((prev) => {
      const comments = entryFor(prev, commentSheet).comments.map((c) => {
        if (replyTarget && c.id === replyTarget.commentId) {
          return { ...c, replies: [...c.replies, { id: `${c.id}-r${c.replies.length + 1}-${Date.now()}`, name: "You", text: commentDraft.trim(), likes: 0, liked: false }] };
        }
        return c;
      });
      if (!replyTarget) {
        comments.push({ id: `${commentSheet}-c${comments.length + 1}-${Date.now()}`, name: "You", text: commentDraft.trim(), likes: 0, liked: false, replies: [] });
      }
      if (replyTarget) setExpandedReplies((prevEx) => ({ ...prevEx, [replyTarget.commentId]: true }));
      return { ...prev, [commentSheet]: { ...entryFor(prev, commentSheet), comments } };
    });
    setCommentDraft("");
    setReplyTarget(null);
  };

  const quickReact = (emoji) => {
    if (!commentSheet) return;
    setCardState((prev) => ({
      ...prev,
      [commentSheet]: { ...entryFor(prev, commentSheet), comments: [...entryFor(prev, commentSheet).comments, { id: `${commentSheet}-c${entryFor(prev, commentSheet).comments.length + 1}-${Date.now()}`, name: "You", text: emoji, likes: 0, liked: false, replies: [] }] },
    }));
  };

  const sheetCard = commentSheet ? cards.find((c) => c.id === commentSheet) : null;
  const sheetState = commentSheet ? (cardState[commentSheet] || entryFor(cardState, commentSheet)) : null;

  return (
    <div className="px-3 pt-0.5">
      <div className="relative rounded-2xl overflow-hidden select-none bg-white w-full" style={{ aspectRatio: "1 / 1.15", maxHeight: "56vh", border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }} onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
        {/* media background */}
        <div className="absolute inset-0" style={{ background: card.media && card.media.kind === "gradient" ? card.media.g : "#111" }}>
          {card.media && card.media.kind === "image" && <img src={card.media.src} alt="" className="w-full h-full object-cover" />}
          {card.media && card.media.kind === "video" && <video src={card.media.src} className="w-full h-full object-cover" autoPlay muted loop playsInline />}
        </div>
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,rgba(0,0,0,.35) 0%,rgba(0,0,0,0) 35%,rgba(0,0,0,.78) 100%)" }} />

        <div className="absolute inset-0 flex flex-col justify-between p-5 transition-transform pointer-events-none" style={{ transform: `translateX(${dragX * 0.4}px)`, opacity: 1 - Math.min(Math.abs(dragX) / 300, 0.4) }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full" style={{ color: "#fff", background: "rgba(255,255,255,0.22)" }}>{card.eyebrow}</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ color: "#fff", background: "rgba(255,255,255,0.22)" }}>{safeIndex + 1}/{cards.length}</span>
          </div>
          <div>
            <p className="text-[22px] font-bold leading-tight mb-2 text-white">{card.title}</p>
            <p className="text-[13.5px] leading-snug text-white/85">{card.body}</p>
            <p className="text-[11.5px] mt-2 text-white/60">Tap to open · swipe up for more</p>
          </div>
        </div>

        {/* tap centre to open the vertical feed, edges to page through */}
        <button className="absolute left-0 top-0 h-full w-1/5" onClick={() => goTo(safeIndex - 1)} aria-label="Previous card" />
        <button className="absolute inset-y-0 left-1/5 right-1/5" onClick={() => onOpenCard && onOpenCard(safeIndex)} aria-label="Open card" />
        <button className="absolute right-0 top-0 h-full w-1/5" onClick={() => goTo(safeIndex + 1)} aria-label="Next card" />
      </div>
      <div className="flex justify-center gap-1.5 mt-2.5">
        {cards.map((c, i) => <span key={c.id} className="h-1.5 rounded-full transition-all" style={{ width: i === safeIndex ? 16 : 6, backgroundColor: i === safeIndex ? theme.color : "#D3D9EC" }} />)}
      </div>
      <div className="flex items-center justify-between mt-3 px-1">
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1.5" onClick={() => gate.require("like posts", () => toggleLike(card.id))}>
            <Heart className="w-6 h-6" fill={state.liked ? "#DC2626" : "none"} stroke={state.liked ? "#DC2626" : INK} strokeWidth={2} />
            <span className="text-[13px] font-medium" style={{ color: INK }}>{state.likes}</span>
          </button>
          <button className="flex items-center gap-1.5" onClick={() => setCommentSheet(card.id)}>
            <MessageCircle className="w-6 h-6" style={{ color: INK }} strokeWidth={2} />
            <span className="text-[13px] font-medium" style={{ color: INK }}>{state.comments.reduce((sum, c) => sum + 1 + c.replies.length, 0)}</span>
          </button>
          <button className="flex items-center gap-1.5" onClick={() => gate.require("share posts", () => setShareOpen(true))}><Repeat2 className="w-6 h-6" style={{ color: INK }} strokeWidth={2} /><span className="text-[13px] font-medium" style={{ color: INK }}>Share</span></button>
        </div>
        <button onClick={() => gate.require("save posts", () => toggleSave(card.id))}><Bookmark className="w-6 h-6" fill={state.saved ? theme.color : "none"} stroke={state.saved ? theme.color : INK} strokeWidth={2} /></button>
      </div>
      {shareOpen && <ShareSheet card={card} onClose={() => setShareOpen(false)} />}
      {commentSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setCommentSheet(null); setReplyTarget(null); }} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ height: "88vh", transform: `translateY(-${keyboardInset}px)`, transition: "transform 0.15s ease-out" }}>
            <div className="flex justify-center pt-2.5 pb-1">
              <span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} />
            </div>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
              <span className="w-8" /><p className="font-bold text-[15px]" style={{ color: INK }}>Comments</p>
              <button onClick={() => { setCommentSheet(null); setReplyTarget(null); }} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 py-3 flex flex-col gap-4">
              {sheetState.comments.length === 0 && <p className="text-[13px] text-center py-6" style={{ color: SUBTLE }}>No comments yet — be the first.</p>}
              {sheetState.comments.map((c) => {
                const repliesOpen = !!expandedReplies[c.id];
                return (
                  <div key={c.id}>
                    <div className="flex gap-2.5">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ backgroundColor: theme.color }}>{c.name[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12.5px] font-semibold" style={{ color: INK }}>
                          {c.name} <span className="font-normal text-[11.5px]" style={{ color: SUBTLE }}>{c.time || "2h"}</span>
                        </p>
                        <p className="text-[13px]" style={{ color: "#4B4A45" }}>{c.text}</p>
                        <button
                          onClick={() => setReplyTarget({ commentId: c.id, name: c.name })}
                          className="text-[11.5px] font-semibold mt-1"
                          style={{ color: SUBTLE }}
                        >
                          Reply
                        </button>
                      </div>
                      <button onClick={() => gate.require("like comments", () => toggleCommentLike(commentSheet, c.id))} className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                        <Heart className="w-4 h-4" fill={c.liked ? "#DC2626" : "none"} stroke={c.liked ? "#DC2626" : SUBTLE} strokeWidth={2} />
                        <span className="text-[10.5px]" style={{ color: SUBTLE }}>{c.likes > 0 ? c.likes : ""}</span>
                      </button>
                    </div>

                    {c.replies.length > 0 && (
                      <button
                        onClick={() => setExpandedReplies((prev) => ({ ...prev, [c.id]: !prev[c.id] }))}
                        className="flex items-center gap-2 mt-1.5 ml-[42px]"
                      >
                        <span className="w-6 h-px" style={{ backgroundColor: CARD_BORDER }} />
                        <span className="text-[11.5px] font-semibold" style={{ color: SUBTLE }}>
                          {repliesOpen ? "Hide replies" : `View ${c.replies.length} more repl${c.replies.length > 1 ? "ies" : "y"}`}
                        </span>
                      </button>
                    )}

                    {repliesOpen && (
                      <div className="mt-2.5 ml-[42px] flex flex-col gap-2.5">
                        {c.replies.map((r) => (
                          <div key={r.id} className="flex gap-2">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-semibold shrink-0" style={{ backgroundColor: theme.color, opacity: 0.8 }}>{r.name[0]}</div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold" style={{ color: INK }}>{r.name}</p>
                              <p className="text-[12.5px]" style={{ color: "#4B4A45" }}>{r.text}</p>
                              <button onClick={() => setReplyTarget({ commentId: c.id, name: r.name })} className="text-[11px] font-semibold mt-0.5" style={{ color: SUBTLE }}>Reply</button>
                            </div>
                            <button onClick={() => gate.require("like comments", () => toggleCommentLike(commentSheet, c.id, r.id))} className="flex flex-col items-center gap-0.5 shrink-0 pt-0.5">
                              <Heart className="w-3.5 h-3.5" fill={r.liked ? "#DC2626" : "none"} stroke={r.liked ? "#DC2626" : SUBTLE} strokeWidth={2} />
                              <span className="text-[10px]" style={{ color: SUBTLE }}>{r.likes > 0 ? r.likes : ""}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* quick emoji reactions */}
            <div className="flex items-center justify-between px-4 pt-2 pb-1 border-t" style={{ borderColor: CARD_BORDER }}>
              {["❤️", "🙌", "🔥", "👏", "😢", "😍", "😮", "😂"].map((emoji) => (
                <button key={emoji} onClick={() => gate.require("react to posts", () => quickReact(emoji))} className="text-[19px] active:scale-90 transition-transform">{emoji}</button>
              ))}
            </div>

            {replyTarget && (
              <div className="flex items-center justify-between px-4 py-1.5" style={{ backgroundColor: "#F4F6FC" }}>
                <span className="text-[12px]" style={{ color: SUBTLE }}>Replying to <span className="font-semibold" style={{ color: INK }}>{replyTarget.name}</span></span>
                <button onClick={() => setReplyTarget(null)} aria-label="Cancel reply"><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>
              </div>
            )}

            <div className="px-4 py-3 border-t flex items-center gap-2.5" style={{ borderColor: CARD_BORDER }}>
              <input
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && gate.require("comment", addComment)}
                enterKeyHint="send"
                placeholder={replyTarget ? `Reply to ${replyTarget.name}` : `Add a comment on ${sheetCard.title}`}
                className="flex-1 text-[13px] rounded-full px-4 py-2.5 outline-none"
                style={{ backgroundColor: "#EFF2FA" }}
              />
              <button
                type="button"
                onClick={() => gate.require("comment", addComment)}
                disabled={!commentDraft.trim()}
                className="text-[13.5px] font-semibold shrink-0 px-1 transition-opacity"
                style={{ color: theme.color, opacity: commentDraft.trim() ? 1 : 0.35 }}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdBanner({ interval = 5000 }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [openedAd, setOpenedAd] = useState(null);
  const touchX = useRef(null);
  const n = adBanners.length;

  useEffect(() => {
    if (paused || openedAd) return;
    const t = setTimeout(() => setIndex((i) => (i + 1) % n), interval);
    return () => clearTimeout(t);
  }, [index, paused, openedAd, interval, n]);

  useEffect(() => {
    if (!openedAd) return;
    const onKey = (e) => e.key === "Escape" && setOpenedAd(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openedAd]);

  const go = (i) => setIndex((i + n) % n);
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; setPaused(true); };
  const onTouchEnd = (e) => {
    if (touchX.current !== null) {
      const dx = e.changedTouches[0].clientX - touchX.current;
      if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
    }
    touchX.current = null;
    setPaused(false);
  };

  return (
    <div style={{ fontFamily: FONT }}>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-[12px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: BRAND }}>Partners & offers</p>
          <h3 className="text-[22px] sm:text-[26px] font-extrabold tracking-[-0.03em] leading-tight" style={{ color: INK }}>Happenings</h3>
        </div>
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button type="button" onClick={() => go(index - 1)} aria-label="Previous offer"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-shadow hover:shadow-md" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <ChevronLeft className="w-5 h-5" style={{ color: INK }} />
          </button>
          <button type="button" onClick={() => go(index + 1)} aria-label="Next offer"
            className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-shadow hover:shadow-md" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <ChevronRight className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>
      </div>

      <div
        className="relative rounded-3xl overflow-hidden select-none"
        style={{ boxShadow: "0 20px 50px -24px rgba(16,24,40,0.35)" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="flex transition-transform duration-700" style={{ transform: `translateX(-${index * 100}%)`, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}>
          {adBanners.map((ad, i) => (
            <div key={ad.id} className="relative w-full shrink-0 grid md:grid-cols-[1.15fr_1fr] min-h-[300px] md:min-h-[280px]" style={{ backgroundColor: ad.color }} aria-hidden={i !== index}>
              {/* image */}
              <div className="absolute inset-0 md:relative md:order-2">
                <img src={ad.image} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                <div className="absolute inset-0 md:hidden" style={{ background: `linear-gradient(180deg, ${ad.color}99 0%, ${ad.color}F2 55%, ${ad.color} 100%)` }} />
                <div className="hidden md:block absolute inset-y-0 left-0 w-2/3" style={{ background: `linear-gradient(90deg, ${ad.color} 0%, ${ad.color}00 100%)` }} />
              </div>
              {/* content */}
              <div className="relative md:order-1 p-6 sm:p-8 md:p-10 flex flex-col justify-end md:justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full" style={{ color: ad.color, backgroundColor: "#fff" }}>{ad.tag}</span>
                  <span className="text-[12.5px] font-semibold text-white/80">{ad.partner}</span>
                </div>
                <h4 className="text-[22px] sm:text-[28px] font-extrabold leading-[1.15] tracking-[-0.025em] text-white max-w-md">{ad.headline}</h4>
                <p className="text-[14px] sm:text-[15px] mt-2.5 leading-relaxed text-white/80 max-w-md">{ad.body}</p>
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button type="button" onClick={() => setOpenedAd(ad)} tabIndex={i === index ? 0 : -1}
                    className="h-11 px-5 rounded-xl text-[14px] font-bold inline-flex items-center gap-2 bg-white transition-transform hover:-translate-y-0.5"
                    style={{ color: ad.color }}>
                    {ad.cta} <ArrowRight className="w-4 h-4" />
                  </button>
                  <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white/85">
                    <CheckCircle2 className="w-4 h-4" /> {ad.perk}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* progress */}
        <div className="absolute left-6 sm:left-8 md:left-10 right-6 bottom-4 flex gap-1.5 max-w-[220px]">
          {adBanners.map((ad, i) => (
            <button key={ad.id} type="button" onClick={() => go(i)} aria-label={`Show offer ${i + 1}`} className="flex-1 h-1 rounded-full overflow-hidden bg-white/25">
              <span
                key={i === index ? `on-${index}-${paused}` : "off"}
                className={`block h-full bg-white ${i === index && !paused && !openedAd ? "ad-progress" : ""}`}
                style={{ width: i < index ? "100%" : i === index && (paused || openedAd) ? "100%" : i === index ? undefined : "0%", animationDuration: `${interval}ms` }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* offer list */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
        {adBanners.map((ad, i) => {
          const on = i === index;
          return (
            <button key={ad.id} type="button" onClick={() => go(i)}
              className="flex items-center gap-3 p-3 rounded-2xl text-left bg-white transition-all duration-300"
              style={{ border: `1.5px solid ${on ? ad.color : CARD_BORDER}`, boxShadow: on ? "0 8px 24px -14px rgba(16,24,40,0.4)" : SOFT_SHADOW }}>
              <img src={ad.image} alt="" loading="lazy" className="w-11 h-11 rounded-xl object-cover shrink-0" />
              <div className="min-w-0">
                <p className="text-[13px] font-bold truncate" style={{ color: INK }}>{ad.partner}</p>
                <p className="text-[12px] truncate" style={{ color: SUBTLE }}>{ad.perk}</p>
              </div>
            </button>
          );
        })}
      </div>

      {openedAd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-label={openedAd.title}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => setOpenedAd(null)} />
          <div className="relative w-full sm:max-w-[460px] bg-white rounded-t-3xl sm:rounded-3xl overflow-hidden auth-step">
            <div className="relative h-44">
              <img src={openedAd.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 30%, ${openedAd.color}E6 100%)` }} />
              <button type="button" onClick={() => setOpenedAd(null)} aria-label="Close"
                className="absolute right-3 top-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/95">
                <X className="w-5 h-5" style={{ color: INK }} />
              </button>
              <span className="absolute left-5 bottom-4 text-[11px] font-bold uppercase tracking-[0.08em] px-2.5 py-1 rounded-full bg-white" style={{ color: openedAd.color }}>
                {openedAd.tag} · {openedAd.partner}
              </span>
            </div>
            <div className="p-6">
              <p className="font-extrabold text-[21px] leading-tight tracking-[-0.02em]" style={{ color: INK }}>{openedAd.headline}</p>
              <p className="text-[14.5px] leading-relaxed mt-2" style={{ color: INK_2 }}>{openedAd.body}</p>
              <ul className="mt-4 space-y-2">
                {openedAd.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-[14px]" style={{ color: INK_2 }}>
                    <CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-px" style={{ color: GREEN }} /> {pt}
                  </li>
                ))}
              </ul>
              <button type="button" className="w-full mt-6 h-12 rounded-xl font-bold text-[15px] text-white inline-flex items-center justify-center gap-2" style={{ backgroundColor: openedAd.color }}>
                {openedAd.cta} <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-[12px] text-center mt-3" style={{ color: FAINT }}>
                {openedAd.tag === "Sponsored" ? "Sponsored content. PakMed may receive a referral fee." : "A PakMed service."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   MARKET
   ========================================================= */
const PRODUCT_CATEGORIES = [
  {
    name: "Diagnostics & Monitoring",
    items: ["BP Apparatus (Sphygmomanometer)", "Glucometer & Test Strips", "Pulse Oximeter", "Digital Thermometer", "Stethoscope", "ECG Machine", "Patient Monitor", "Nebulizer", "Otoscope / Ophthalmoscope", "Weighing Scale"],
  },
  {
    name: "Imaging Equipment",
    items: ["X-Ray Machine", "Portable X-Ray Unit", "Ultrasound Machine", "Doppler Ultrasound", "CT Scanner", "MRI Machine", "C-Arm Fluoroscopy", "Mammography Unit", "Dental X-Ray"],
  },
  {
    name: "Aesthetic & Dermatology",
    items: ["Hydrafacial Machine", "Laser Hair Removal Device", "Cryotherapy Unit", "Microdermabrasion Machine", "RF Skin Tightening", "LED Therapy Panel", "Dermatoscope"],
  },
  {
    name: "Surgical & Theatre",
    items: ["Operating Table", "Surgical Lights", "Electrosurgical Unit (Cautery)", "Anesthesia Machine", "Ventilator", "Autoclave / Sterilizer", "Suction Machine", "Surgical Instrument Sets"],
  },
  {
    name: "Lab & Pathology",
    items: ["Centrifuge", "Microscope", "Hematology Analyzer", "Chemistry Analyzer", "Incubator", "Lab Refrigerator", "PCR Machine", "Blood Bank Refrigerator"],
  },
  {
    name: "Hospital Furniture & Support",
    items: ["Hospital Bed (Electric/Manual)", "ICU Bed", "Wheelchair", "Stretcher / Trolley", "IV Stand", "Examination Couch", "Oxygen Concentrator", "Oxygen Cylinder"],
  },
];

const ALL_PRODUCTS = PRODUCT_CATEGORIES.flatMap((c) => c.items.map((i) => ({ name: i, category: c.name })));

const SELLERS = [
  { id: "s1", business: "Al-Noor Surgical & Diagnostics", area: "Jail Road", city: "Lahore", price: "PKR 4,500 – 7,200", phone: "0300 8471290", showPhone: true, rating: 4.6, verified: true, note: "Aneroid & digital models, 1-year warranty" },
  { id: "s2", business: "MediTech Instruments", area: "Saddar", city: "Karachi", price: "PKR 3,900 – 6,500", phone: null, showPhone: false, rating: 4.3, verified: true, note: "Bulk orders for clinics, delivery nationwide" },
  { id: "s3", business: "Shifa Medical Supplies", area: "Blue Area", city: "Islamabad", price: "PKR 5,100 – 8,000", phone: "051 2874400", showPhone: true, rating: 4.8, verified: true, note: "Imported German stock, calibration included" },
  { id: "s4", business: "Faisal Medical Store", area: "Susan Road", city: "Faisalabad", price: "PKR 3,400 – 5,800", phone: "0321 6639988", showPhone: true, rating: 4.1, verified: false, note: "Local stock, same-day pickup available" },
  { id: "s5", business: "Rehman BioMedical", area: "University Road", city: "Peshawar", price: "PKR 4,200 – 6,900", phone: null, showPhone: false, rating: 4.4, verified: true, note: "Servicing & repairs offered" },
  { id: "s6", business: "Care Diagnostics Hub", area: "DHA Phase 5", city: "Lahore", price: "PKR 6,000 – 9,500", phone: "0304 7712345", showPhone: true, rating: 4.7, verified: true, note: "Premium range, installation support" },
];

/* =========================================================
   SELLER PANEL
   ========================================================= */
const SELLER_TYPES = ["Surgical Store", "Biomedical Equipment", "Pharmacy", "Distributor", "Importer", "Repair & Servicing", "Other"];
const CONDITIONS = ["New", "Used — Good", "Used — Fair", "Refurbished"];
const DELIVERY_OPTS = ["Pickup only", "Local delivery", "Nationwide courier", "Installation included"];
const STOCK_STATES = ["In stock", "Limited stock", "Made to order", "Out of stock"];

const EMPTY_SELLER = {
  business: "", type: "", city: "", area: "", address: "",
  about: "", hours: "", phone: "", showPhone: true, logo: null, created: false,
};

const EMPTY_LISTING = {
  name: "", category: "", price: "", priceTo: "", condition: "New",
  stock: "In stock", delivery: [], warranty: "", notes: "",
  photos: [], coverIndex: 0, status: "live",
};

const SEED_LISTINGS = [
  {
    id: "L_SEED_1", name: "BP Apparatus (Aneroid)", category: "Diagnostics & Monitoring",
    price: "4,500", priceTo: "7,200", condition: "New", stock: "In stock",
    delivery: ["Nationwide courier", "Local delivery"], warranty: "1 year manufacturer warranty",
    notes: "German-made aneroid sphygmomanometer with adult cuff. Calibration certificate included.",
    photos: [], coverIndex: 0, status: "live", views: 184, enquiries: 7,
    comments: [
      { id: "sc1", name: "Dr. Bilal", text: "Is the warranty on-site or carry-in?", reply: "" },
      { id: "sc2", name: "City Clinic", text: "Do you deliver to Multan?", reply: "Yes, nationwide courier — 2 to 3 days." },
    ],
  },
  {
    id: "L_SEED_2", name: "Portable Ultrasound Machine", category: "Imaging Equipment",
    price: "850,000", priceTo: "", condition: "Refurbished", stock: "Limited stock",
    delivery: ["Pickup only", "Installation included"], warranty: "6 months service warranty",
    notes: "Refurbished portable unit with convex and linear probes. Fully serviced and tested.",
    photos: [], coverIndex: 0, status: "live", views: 96, enquiries: 3,
    comments: [
      { id: "sc3", name: "Shifa Wellness", text: "Which model and year?", reply: "" },
    ],
  },
];

const FREE_LISTINGS_PER_MONTH = 2;
function listingsThisMonth(listings) {
  const now = new Date();
  return (listings || []).filter((l) => {
    if (!l.createdAt || l.postedAs === "business") return false;
    const d = new Date(l.createdAt);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;
}

function SellerPanelScreen({ onBack, onMenu, seller, setSeller, listings, setListings, canSell, onNeedProfile, known = {} }) {
  const [view, setView] = useState(seller.created ? "dash" : "setup");
  const [editing, setEditing] = useState(null);      // listing being created/edited
  const [commentsFor, setCommentsFor] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [toast, setToast] = useState("");
  const [photoErr, setPhotoErr] = useState("");
  const logoRef = useRef(null);
  const galRef = useRef(null);
  const camRef = useRef(null);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };
  const setS = (k, v) => setSeller((p) => ({ ...p, [k]: v }));
  const setL = (k, v) => setEditing((p) => ({ ...p, [k]: v }));
  const toggleL = (k, v) => setEditing((p) => ({ ...p, [k]: p[k].includes(v) ? p[k].filter((x) => x !== v) : [...p[k], v] }));

  const inputCls = "w-full text-[14.5px] rounded-xl px-3.5 py-3 outline-none";
  const inputStyle = { backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` };
  const L = ({ children, req }) => (
    <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>
      {children} {req && <span style={{ color: RED }}>*</span>}
    </p>
  );
  const Pick = ({ options, value, onPick, multi }) => (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = multi ? value.includes(o) : value === o;
        return (
          <button key={o} onClick={() => onPick(o)}
            className="text-[13px] font-semibold px-3.5 py-2.5 rounded-full transition-colors active:scale-95"
            style={{ backgroundColor: on ? NAVY : "white", color: on ? "white" : INK, border: `1.5px solid ${on ? NAVY : CARD_BORDER}` }}>
            {o}
          </button>
        );
      })}
    </div>
  );

  const compress = (file, cb) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200, sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL("image/jpeg", 0.72));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };

  const handleLogo = (e) => {
    const f = e.target.files && e.target.files[0]; e.target.value = "";
    if (f && f.type.startsWith("image/")) compress(f, (d) => setS("logo", d));
  };

  const handleListingPhotos = (e) => {
    const files = Array.from(e.target.files || []); e.target.value = "";
    if (!files.length || !editing) return;
    const room = 5 - editing.photos.length;
    if (room <= 0) { setPhotoErr("Up to 5 photos per listing."); return; }
    setPhotoErr("");
    files.slice(0, room).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      if (f.size > 8 * 1024 * 1024) { setPhotoErr(`"${f.name}" is over 8 MB.`); return; }
      compress(f, (d) => setEditing((p) => (p && p.photos.length < 5 ? { ...p, photos: [...p.photos, d] } : p)));
    });
  };

  // general users get a small monthly allowance; beyond that a Business profile is needed
  const usedThisMonth = listingsThisMonth(listings);
  const freeLeft = Math.max(0, FREE_LISTINGS_PER_MONTH - usedThisMonth);

  const saveListing = () => {
    if (!editing.id && !canSell && freeLeft <= 0) {
      onNeedProfile(() => reallySave(true), {
        business: seller.business, type: seller.type, city: seller.city,
        area: seller.area, address: seller.address, phone: seller.phone,
      });
      return;
    }
    reallySave();
  };

  const reallySave = (asBusiness) => {
    if (editing.id) {
      setListings((prev) => prev.map((l) => (l.id === editing.id ? { ...editing } : l)));
      flash("Listing updated.");
    } else {
      const business = asBusiness === true || canSell;
      setListings((prev) => [{ ...editing, id: `L${Date.now()}`, views: 0, enquiries: 0, comments: [],
        createdAt: Date.now(), postedAs: business ? "business" : "personal" }, ...prev]);
      flash(business ? "Listing published." : `Listing published. ${Math.max(0, freeLeft - 1)} free listing${freeLeft - 1 === 1 ? "" : "s"} left this month.`);
    }
    setEditing(null); setView("dash");
  };

  const listingValid = editing && editing.name && editing.category && editing.price;

  const totals = listings.reduce((a, l) => ({
    views: a.views + (l.views || 0),
    enq: a.enq + (l.enquiries || 0),
    com: a.com + ((l.comments || []).length),
  }), { views: 0, enq: 0, com: 0 });

  /* ---------------- SETUP / PROFILE ---------------- */
  if (view === "setup" || view === "profile") {
    const first = view === "setup";
    const ok = seller.business && seller.type && seller.city;
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader
          title={first ? "Create Seller Profile" : "Seller Profile"}
          subtitle={first ? "One-time setup" : "Edit your business details"}
          onBack={first ? onBack : () => setView("dash")}
          onMenu={onMenu}
        />
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          <input ref={logoRef} type="file" accept="image/*" className="hidden" onChange={handleLogo} />

          <div className="rounded-2xl bg-white p-4 mb-3 flex items-center gap-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#E6EAF3" }}>
              {seller.logo ? <img src={seller.logo} alt="" className="w-full h-full object-cover" /> : <Store className="w-6 h-6" style={{ color: SUBTLE }} />}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: INK }}>Business logo</p>
              <p className="text-[11.5px] mb-1.5" style={{ color: SUBTLE }}>Optional</p>
              <div className="flex gap-2">
                <button onClick={() => logoRef.current?.click()} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: NAVY, color: "white" }}>
                  {seller.logo ? "Replace" : "Add logo"}
                </button>
                {seller.logo && (
                  <button onClick={() => setS("logo", null)} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#EFF2FA", color: INK }}>Remove</button>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <AutoFillAll
              label="Use my business profile"
              pairs={[
                { hint: known.businessName,  current: seller.business, set: (v) => setS("business", v) },
                { hint: known.businessType,  current: seller.type,     set: (v) => setS("type", v) },
                { hint: known.businessCity,  current: seller.city,     set: (v) => setS("city", v) },
                { hint: known.businessArea,  current: seller.area,     set: (v) => setS("area", v) },
                { hint: known.businessAddr,  current: seller.address,  set: (v) => setS("address", v) },
                { hint: known.businessPhone, current: seller.phone,    set: (v) => setS("phone", v) },
                { hint: known.businessHours, current: seller.hours,    set: (v) => setS("hours", v) },
              ]}
            />
            <L req>Business name</L>
            <input value={seller.business} onChange={(e) => setS("business", e.target.value)} placeholder="e.g. Al-Noor Surgical" className={inputCls} style={inputStyle} />
            <AutoFill hint={known.businessName} current={seller.business} onUse={(v) => setS("business", v)} />
            <div className="mt-3"><L req>Business type</L><Pick options={SELLER_TYPES} value={seller.type} onPick={(v) => setS("type", v)} /></div>
            <div className="mt-3"><L req>City</L><Pick options={CITIES} value={seller.city} onPick={(v) => setS("city", v)} /></div>
            <div className="mt-3"><L>Town / road</L>
              <input value={seller.area} onChange={(e) => setS("area", e.target.value)} placeholder="e.g. Jail Road" className={inputCls} style={inputStyle} />
            </div>
            <div className="mt-3"><L>Full address</L>
              <input value={seller.address} onChange={(e) => setS("address", e.target.value)} placeholder="Shop number, plaza, landmark" className={inputCls} style={inputStyle} />
              <AutoFill hint={known.businessAddr} current={seller.address} onUse={(v) => setS("address", v)} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <L>About your business</L>
            <textarea value={seller.about} onChange={(e) => setS("about", e.target.value)} rows={3}
              placeholder="What you sell, brands you carry, years in business…"
              className="w-full text-[14.5px] rounded-xl px-3.5 py-3 outline-none resize-none" style={inputStyle} />
            <div className="mt-3"><L>Opening hours</L>
              <input value={seller.hours} onChange={(e) => setS("hours", e.target.value)} placeholder="e.g. Mon–Sat, 10 AM – 8 PM" className={inputCls} style={inputStyle} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <L>Contact number</L>
            <input value={seller.phone} onChange={(e) => setS("phone", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={inputCls} style={inputStyle} />
            <AutoFill hint={known.businessPhone} current={seller.phone} onUse={(v) => setS("phone", v)} />
            <button onClick={() => setS("showPhone", !seller.showPhone)} className="w-full flex items-center gap-3 mt-3">
              <span className="w-12 h-7 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
                style={{ backgroundColor: seller.showPhone ? GREEN : "#D3D9EC", justifyContent: seller.showPhone ? "flex-end" : "flex-start" }}>
                <span className="w-6 h-6 rounded-full bg-white block" />
              </span>
              <span className="text-[13px] text-left flex-1" style={{ color: "#4B4A45" }}>
                Show my number on listings {!seller.showPhone && <span style={{ color: SUBTLE }}>— buyers message instead</span>}
              </span>
            </button>
          </div>

          <button
            onClick={() => { setS("created", true); setView("dash"); flash(first ? "Seller profile created." : "Profile updated."); }}
            disabled={!ok}
            className="w-full py-3.5 rounded-full font-semibold text-[14px] transition-opacity"
            style={{ backgroundColor: NAVY, color: "white", opacity: ok ? 1 : 0.4 }}
          >
            {first ? "Create profile" : "Save changes"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- LISTING EDITOR ---------------- */
  if (view === "editor" && editing) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader title={editing.id ? "Edit Listing" : "New Listing"} onBack={() => { setEditing(null); setView("dash"); }} onMenu={onMenu} />
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          <input ref={galRef} type="file" accept="image/*" multiple className="hidden" onChange={handleListingPhotos} />
          <input ref={camRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleListingPhotos} />

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <L req>Product name</L>
            <input value={editing.name} onChange={(e) => setL("name", e.target.value)} placeholder="e.g. BP Apparatus (Aneroid)" className={inputCls} style={inputStyle} />
            <div className="mt-3"><L req>Category</L>
              <Pick options={PRODUCT_CATEGORIES.map((c) => c.name)} value={editing.category} onPick={(v) => setL("category", v)} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <L req>Price (PKR)</L>
            <div className="flex gap-2 items-center">
              <input value={editing.price} onChange={(e) => setL("price", e.target.value.replace(/[^0-9,]/g, ""))} placeholder="4,500" inputMode="numeric" className={inputCls} style={inputStyle} />
              <span className="text-[13px] shrink-0" style={{ color: SUBTLE }}>to</span>
              <input value={editing.priceTo} onChange={(e) => setL("priceTo", e.target.value.replace(/[^0-9,]/g, ""))} placeholder="optional" inputMode="numeric" className={inputCls} style={inputStyle} />
            </div>
            <p className="text-[11.5px] mt-1.5" style={{ color: SUBTLE }}>Leave the second box empty for a fixed price.</p>
            <div className="mt-3"><L>Condition</L><Pick options={CONDITIONS} value={editing.condition} onPick={(v) => setL("condition", v)} /></div>
            <div className="mt-3"><L>Stock</L><Pick options={STOCK_STATES} value={editing.stock} onPick={(v) => setL("stock", v)} /></div>
          </div>

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <L>Delivery options</L>
            <Pick options={DELIVERY_OPTS} value={editing.delivery} onPick={(v) => toggleL("delivery", v)} multi />
            <div className="mt-3"><L>Warranty</L>
              <input value={editing.warranty} onChange={(e) => setL("warranty", e.target.value)} placeholder="e.g. 1 year manufacturer warranty" className={inputCls} style={inputStyle} />
            </div>
            <div className="mt-3"><L>Description</L>
              <textarea value={editing.notes} onChange={(e) => setL("notes", e.target.value)} rows={3}
                placeholder="Brand, model, specifications, what's included…"
                className="w-full text-[14.5px] rounded-xl px-3.5 py-3 outline-none resize-none" style={inputStyle} />
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <L>Photos</L>
            <div className="flex gap-2.5 mb-3">
              <button onClick={() => camRef.current?.click()} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1.5" style={{ backgroundColor: NAVY }}>
                <Camera className="w-5 h-5 text-white" /><span className="text-[12.5px] font-semibold text-white">Take Photo</span>
              </button>
              <button onClick={() => galRef.current?.click()} className="flex-1 rounded-xl py-3 flex flex-col items-center gap-1.5" style={{ backgroundColor: "white", border: `1.5px solid ${CARD_BORDER}` }}>
                <Upload className="w-5 h-5" style={{ color: NAVY }} /><span className="text-[12.5px] font-semibold" style={{ color: INK }}>Gallery</span>
              </button>
            </div>
            {photoErr && <p className="text-[12px] mb-2" style={{ color: RED }}>{photoErr}</p>}
            {editing.photos.length > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {editing.photos.map((src, i) => (
                  <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1/1", border: `2px solid ${i === editing.coverIndex ? NAVY : "transparent"}` }}>
                    <button onClick={() => setL("coverIndex", i)} className="w-full h-full"><img src={src} alt="" className="w-full h-full object-cover" /></button>
                    {i === editing.coverIndex && <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: NAVY, color: "white" }}>COVER</span>}
                    <button onClick={() => setEditing((p) => ({ ...p, photos: p.photos.filter((_, x) => x !== i), coverIndex: 0 }))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,.55)" }}>
                      <X className="w-3 h-3 text-white" strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={saveListing} disabled={!listingValid}
            className="w-full py-3.5 rounded-full font-semibold text-[14px] transition-opacity"
            style={{ backgroundColor: NAVY, color: "white", opacity: listingValid ? 1 : 0.4 }}>
            {editing.id ? "Save changes" : "Publish listing"}
          </button>
        </div>
      </div>
    );
  }

  /* ---------------- COMMENTS ---------------- */
  if (view === "comments" && commentsFor) {
    const item = listings.find((l) => l.id === commentsFor) || {};
    const cs = item.comments || [];
    const postReply = (cid) => {
      if (!replyDraft.trim()) return;
      setListings((prev) => prev.map((l) => l.id === commentsFor
        ? { ...l, comments: l.comments.map((c) => (c.id === cid ? { ...c, reply: replyDraft.trim() } : c)) } : l));
      setReplyDraft("");
    };
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader title="Comments" subtitle={item.name} onBack={() => { setCommentsFor(null); setView("dash"); }} onMenu={onMenu} />
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          {cs.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <MessageCircle className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
              <p className="text-[13.5px]" style={{ color: SUBTLE }}>No comments on this listing yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {cs.map((c) => (
                <div key={c.id} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
                  <div className="flex gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ backgroundColor: NAVY }}>{c.name[0]}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold" style={{ color: INK }}>{c.name}</p>
                      <p className="text-[13.5px] mt-0.5" style={{ color: "#4B4A45" }}>{c.text}</p>
                    </div>
                  </div>
                  {c.reply ? (
                    <div className="mt-2.5 ml-[42px] rounded-xl p-2.5" style={{ backgroundColor: "#EAF0F8" }}>
                      <p className="text-[11.5px] font-bold mb-0.5" style={{ color: NAVY }}>Your reply</p>
                      <p className="text-[13px]" style={{ color: "#3A4A66" }}>{c.reply}</p>
                    </div>
                  ) : (
                    <div className="mt-2.5 ml-[42px] flex items-center gap-2">
                      <input value={replyDraft} onChange={(e) => setReplyDraft(e.target.value)} placeholder="Write a reply…"
                        className="flex-1 text-[13px] rounded-full px-3.5 py-2 outline-none" style={{ backgroundColor: "#F4F6FC", border: `1px solid ${CARD_BORDER}` }} />
                      <button onClick={() => postReply(c.id)} className="text-[12.5px] font-semibold px-1" style={{ color: NAVY, opacity: replyDraft.trim() ? 1 : 0.35 }}>Reply</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ---------------- DASHBOARD ---------------- */
  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title={canSell ? "Business Panel" : "Sell on PakMed"} subtitle={canSell ? seller.business : "Personal seller"} onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {toast && (
          <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ backgroundColor: GREEN_TINT }}>
            <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
            <p className="text-[12.5px]" style={{ color: GREEN }}>{toast}</p>
          </div>
        )}

        {/* personal sellers: show the monthly allowance instead of a business card */}
        {!canSell && (
          <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <div className="flex items-center justify-between">
              <p className="text-[14.5px] font-bold" style={{ color: INK }}>Free listings this month</p>
              <p className="text-[14.5px] font-extrabold" style={{ color: freeLeft ? GREEN : RED }}>{freeLeft} of {FREE_LISTINGS_PER_MONTH} left</p>
            </div>
            <div className="flex gap-1.5 mt-2.5">
              {Array.from({ length: FREE_LISTINGS_PER_MONTH }).map((_, n) => (
                <span key={n} className="flex-1 h-2 rounded-full" style={{ backgroundColor: n < usedThisMonth ? BRAND : "#E4E7EC" }} />
              ))}
            </div>
            <p className="text-[12.5px] mt-2.5 leading-snug" style={{ color: SUBTLE }}>
              Anyone can list {FREE_LISTINGS_PER_MONTH} items a month, new or used. To list more, sell new stock regularly, or offer services, create a Business profile.
            </p>
            <button onClick={() => onNeedProfile(null, {})} className="mt-3 w-full h-11 rounded-xl text-[13.5px] font-bold flex items-center justify-center gap-1.5"
              style={{ color: VIOLET, backgroundColor: VIOLET_TINT }}>
              <Store className="w-4 h-4" /> Create a Business profile
            </button>
          </div>
        )}

        {/* business card */}
        {canSell && <button onClick={() => setView("profile")} className="w-full rounded-2xl bg-white p-3.5 flex items-center gap-3 mb-3 text-left active:scale-[0.99] transition-transform" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#E6EAF3" }}>
            {seller.logo ? <img src={seller.logo} alt="" className="w-full h-full object-cover" /> : <Store className="w-5 h-5" style={{ color: SUBTLE }} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[15px] font-semibold truncate" style={{ color: INK }}>{seller.business}</p>
            <p className="text-[12.5px] truncate" style={{ color: SUBTLE }}>{seller.type} · {[seller.area, seller.city].filter(Boolean).join(", ")}</p>
          </div>
          <Pencil className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
        </button>}

        {/* stats */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {[["Listings", listings.length], ["Enquiries", totals.enq], ["Comments", totals.com]].map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white p-3 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[19px] font-bold" style={{ color: NAVY }}>{v}</p>
              <p className="text-[11px] mt-0.5" style={{ color: SUBTLE }}>{k}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => { setEditing({ ...EMPTY_LISTING }); setView("editor"); }}
          className="w-full rounded-2xl p-4 flex items-center gap-3.5 mb-3 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: NAVY }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFFFF22" }}>
            <Upload className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[15px] font-semibold text-white">Add a listing</p>
            <p className="text-[12.5px] mt-0.5 text-white/70">Product, price, photos</p>
          </div>
          <ChevronRight className="w-4 h-4 shrink-0 text-white/60" />
        </button>

        <div className="flex items-center justify-between mt-4 mb-1.5">
          <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Your listings</p>
          <span className="text-[12px]" style={{ color: SUBTLE }}>{listings.filter((l) => l.status === "live").length} live</span>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <Store className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
            <p className="text-[13.5px]" style={{ color: SUBTLE }}>No listings yet. Add your first product above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {listings.map((l) => (
              <div key={l.id} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <div className="flex gap-3">
                  {l.photos && l.photos.length > 0 ? (
                    <img src={l.photos[l.coverIndex] || l.photos[0]} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EFF2FA" }}>
                      <Store className="w-6 h-6" style={{ color: SUBTLE }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: l.status === "live" ? GREEN : l.status === "sold" ? SUBTLE : "#B45309",
                                 backgroundColor: l.status === "live" ? GREEN_TINT : l.status === "sold" ? "#EFF2FA" : "#FDF3E3" }}>
                        {l.status === "live" ? "Live" : l.status === "sold" ? "Sold" : "Hidden"}
                      </span>
                      <span className="text-[10.5px]" style={{ color: SUBTLE }}>{l.stock}</span>
                    </div>
                    <p className="text-[14.5px] font-semibold leading-snug" style={{ color: INK }}>{l.name}</p>
                    <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}>{l.category}</p>
                    <p className="text-[14px] font-bold mt-1" style={{ color: NAVY }}>
                      PKR {l.price}{l.priceTo ? ` – ${l.priceTo}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                  <button onClick={() => { setEditing({ ...l }); setView("editor"); }} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: "#EFF2FA", color: INK }}>
                    Edit
                  </button>
                  <button onClick={() => { setCommentsFor(l.id); setView("comments"); }} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: "#EAF0F8", color: NAVY }}>
                    Comments {(l.comments || []).length > 0 ? `(${l.comments.length})` : ""}
                  </button>
                  <button
                    onClick={() => setListings((prev) => prev.map((x) => x.id === l.id
                      ? { ...x, status: x.status === "live" ? "hidden" : "live" } : x))}
                    className="px-3 py-2 rounded-full text-[12.5px] font-semibold"
                    style={{ backgroundColor: "#EFF2FA", color: INK }}
                  >
                    {l.status === "live" ? "Hide" : "Show"}
                  </button>
                </div>

                <div className="flex gap-1.5 mt-1.5">
                  <button
                    onClick={() => setListings((prev) => prev.map((x) => x.id === l.id ? { ...x, status: "sold" } : x))}
                    className="flex-1 py-2 rounded-full text-[12px] font-semibold" style={{ backgroundColor: "#EFF2FA", color: SUBTLE }}
                  >
                    Mark sold
                  </button>
                  <button
                    onClick={() => setListings((prev) => prev.filter((x) => x.id !== l.id))}
                    className="flex-1 py-2 rounded-full text-[12px] font-semibold" style={{ backgroundColor: "#FBEBEC", color: RED }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-[11.5px] mt-4 leading-snug px-1" style={{ color: SUBTLE }}>
          You can only see view and enquiry counts — never who viewed your listing. Buyer contact
          details appear only after they message you.
        </p>
      </div>
    </div>
  );
}

/* =========================================================
   MARKET HUB — Buy / Sell / Services & Repair
   ========================================================= */
const CONDITION_FILTER = ["All", "New", "Used", "Refurbished"];

const MKT_IMG = "/images/market";
const MARKET_CATS = [
  { key: "diagnostics", label: "Diagnostics & Monitoring", short: "Diagnostics", icon: Activity, img: `${MKT_IMG}/stethoscope.jpg` },
  { key: "imaging", label: "Imaging Equipment", short: "Imaging", icon: ScanLine, img: `${MKT_IMG}/ultrasound.jpg` },
  { key: "surgical", label: "Surgical & Theatre", short: "Surgical & OT", icon: Scissors, img: `${MKT_IMG}/operating-room.jpg` },
  { key: "lab", label: "Lab & Pathology", short: "Lab", icon: Microscope, img: `${MKT_IMG}/microscope.jpg` },
  { key: "furniture", label: "Hospital Furniture & Support", short: "Furniture", icon: BedDouble, img: `${MKT_IMG}/wheelchair.jpg` },
  { key: "aesthetic", label: "Aesthetic & Dermatology", short: "Aesthetic", icon: Sparkles, img: `${MKT_IMG}/hydrafacial.jpg` },
  { key: "supplies", label: "Supplies & Disposables", short: "Supplies", icon: Package, img: `${MKT_IMG}/gloves.jpg` },
];
const marketCatOf = (name = "") => {
  const n = String(name).toLowerCase();
  return MARKET_CATS.find((c) => c.label.toLowerCase() === n)
    || MARKET_CATS.find((c) => n && (n.includes(c.short.toLowerCase().split(" ")[0]) || c.label.toLowerCase().startsWith(n.split(" ")[0])))
    || MARKET_CATS[0];
};

const SEED_MARKET_ITEMS = [
  { id: "mi1", name: "BP Apparatus (Aneroid)", category: "Diagnostics & Monitoring", condition: "New", price: "4,500", seller: "Al-Noor Surgical", city: "Lahore", area: "Jail Road", phone: "0300 8471290", showPhone: true, note: "German-made aneroid sphygmomanometer with adult cuff and calibration certificate.", kind: "product", img: `${MKT_IMG}/bp-apparatus.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "1 year", posted: "2 days ago", verifiedSeller: true },
  { id: "mi2", name: "Portable Ultrasound Machine", category: "Imaging Equipment", condition: "Refurbished", price: "850,000", seller: "MediTech Instruments", city: "Karachi", area: "Saddar", phone: "", showPhone: false, note: "Portable colour Doppler unit with convex and linear probes. Fully serviced and tested.", kind: "product", img: `${MKT_IMG}/ultrasound.jpg`, stock: "Limited stock", delivery: ["Installation included"], warranty: "6 months service", posted: "1 day ago", verifiedSeller: true },
  { id: "mi3", name: "Hydrafacial Machine", category: "Aesthetic & Dermatology", condition: "Used — Good", price: "320,000", seller: "Glow Aesthetics", city: "Lahore", area: "DHA Phase 5", phone: "0304 7712345", showPhone: true, note: "Two years old, all handpieces included. Regularly serviced.", kind: "product", img: `${MKT_IMG}/hydrafacial.jpg`, stock: "In stock", delivery: ["Pickup only"], warranty: "", posted: "4 days ago", verifiedSeller: false },
  { id: "mi4", name: "Hospital Bed (Electric, 3-function)", category: "Hospital Furniture & Support", condition: "New", price: "185,000", seller: "Shifa Medical Supplies", city: "Islamabad", area: "Blue Area", phone: "051 2874400", showPhone: true, note: "Three-function electric bed with side rails, mattress and IV pole.", kind: "product", img: `${MKT_IMG}/hospital-bed.jpg`, stock: "In stock", delivery: ["Local delivery", "Installation included"], warranty: "2 years", posted: "Today", verifiedSeller: true },
  { id: "mi5", name: "Laboratory Centrifuge (8-tube)", category: "Lab & Pathology", condition: "Used — Good", price: "45,000", seller: "Faisal Medical Store", city: "Faisalabad", area: "Susan Road", phone: "0321 6639988", showPhone: true, note: "8-tube benchtop centrifuge in good working condition.", kind: "product", img: `${MKT_IMG}/lab-pipette.jpg`, stock: "In stock", delivery: ["Pickup only", "Nationwide courier"], warranty: "", posted: "1 week ago", verifiedSeller: false },
  { id: "mi6", name: "ECG Machine (12-lead)", category: "Diagnostics & Monitoring", condition: "New", price: "125,000", seller: "Rehman BioMedical", city: "Peshawar", area: "University Road", phone: "", showPhone: false, note: "12-lead interpretive ECG with trolley, cables and thermal paper.", kind: "product", img: `${MKT_IMG}/ecg.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "1 year", posted: "3 days ago", verifiedSeller: true },
  { id: "mi7", name: "Operating Table (Hydraulic)", category: "Surgical & Theatre", condition: "Refurbished", price: "410,000", seller: "Care Diagnostics Hub", city: "Lahore", area: "Model Town", phone: "0333 4455667", showPhone: true, note: "Fully serviced hydraulic OT table, installation included.", kind: "product", img: `${MKT_IMG}/operating-room.jpg`, stock: "Limited stock", delivery: ["Installation included"], warranty: "6 months", posted: "5 days ago", verifiedSeller: true },
  { id: "mi8", name: "Oxygen Concentrator (5 LPM)", category: "Hospital Furniture & Support", condition: "New", price: "95,000", seller: "Al-Noor Surgical", city: "Multan", area: "Bosan Road", phone: "0300 8471290", showPhone: true, note: "Imported 5 LPM concentrator with nebuliser function.", kind: "product", img: `${MKT_IMG}/medical-kit.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "1 year", posted: "2 days ago", verifiedSeller: true },
  { id: "mi9", name: "Patient Monitor (5-parameter)", category: "Diagnostics & Monitoring", condition: "Refurbished", price: "165,000", seller: "Care Diagnostics Hub", city: "Lahore", area: "Model Town", phone: "", showPhone: false, note: "ECG, SpO2, NIBP, temperature and respiration. Battery backup.", kind: "product", img: `${MKT_IMG}/patient-monitor.jpg`, stock: "In stock", delivery: ["Local delivery"], warranty: "6 months", posted: "Yesterday", verifiedSeller: true },
  { id: "mi10", name: "Binocular Microscope", category: "Lab & Pathology", condition: "New", price: "68,000", seller: "Precision Lab Supplies", city: "Islamabad", area: "G-9 Markaz", phone: "", showPhone: false, note: "Clinical binocular microscope with 4 objectives and LED illumination.", kind: "product", img: `${MKT_IMG}/microscope.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "1 year", posted: "3 days ago", verifiedSeller: true },
  { id: "mi11", name: "Foldable Wheelchair", category: "Hospital Furniture & Support", condition: "New", price: "18,500", seller: "Al-Noor Surgical", city: "Lahore", area: "Jail Road", phone: "", showPhone: false, note: "Lightweight foldable wheelchair with removable footrests.", kind: "product", img: `${MKT_IMG}/wheelchair.jpg`, stock: "In stock", delivery: ["Nationwide courier", "Local delivery"], warranty: "6 months", posted: "Today", verifiedSeller: true },
  { id: "mi12", name: "Anesthesia Workstation", category: "Surgical & Theatre", condition: "Refurbished", price: "1,250,000", seller: "MediTech Instruments", city: "Karachi", area: "Saddar", phone: "", showPhone: false, note: "Two-vaporiser anesthesia machine with integrated ventilator. Calibrated.", kind: "product", img: `${MKT_IMG}/anesthesia.jpg`, stock: "Made to order", delivery: ["Installation included"], warranty: "1 year service", posted: "1 week ago", verifiedSeller: true },
  { id: "mi13", name: "Lab Microscope Set (×3)", category: "Lab & Pathology", condition: "Used — Good", price: "120,000", seller: "Faisal Medical Store", city: "Faisalabad", area: "Susan Road", phone: "", showPhone: false, note: "Three teaching microscopes, ideal for colleges and small labs.", kind: "product", img: `${MKT_IMG}/lab-bench.jpg`, stock: "In stock", delivery: ["Pickup only"], warranty: "", posted: "6 days ago", verifiedSeller: false },
  { id: "mi14", name: "Professional Stethoscope", category: "Diagnostics & Monitoring", condition: "New", price: "14,500", seller: "Shifa Medical Supplies", city: "Islamabad", area: "Blue Area", phone: "", showPhone: false, note: "Dual-head cardiology stethoscope with spare ear tips.", kind: "product", img: `${MKT_IMG}/stethoscope.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "2 years", posted: "Yesterday", verifiedSeller: true },
  { id: "mi15", name: "Nitrile Gloves (Box of 100)", category: "Supplies & Disposables", condition: "New", price: "1,450", seller: "MediTech Instruments", city: "Karachi", area: "Saddar", phone: "", showPhone: false, note: "Powder-free nitrile examination gloves. Bulk discounts for clinics.", kind: "product", img: `${MKT_IMG}/gloves.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "", posted: "Today", verifiedSeller: true },
  { id: "mi16", name: "Clinic Starter Kit", category: "Supplies & Disposables", condition: "New", price: "6,800", seller: "Al-Noor Surgical", city: "Multan", area: "Bosan Road", phone: "", showPhone: false, note: "Thermometer, pill organisers, dressings and basic diagnostic tools.", kind: "product", img: `${MKT_IMG}/medical-kit.jpg`, stock: "In stock", delivery: ["Nationwide courier"], warranty: "", posted: "4 days ago", verifiedSeller: true },
];

const SEED_SERVICES = [
  { id: "sv1", name: "Biomedical Equipment Repair", provider: "TechMed Services", city: "Lahore", area: "Jail Road", phone: "0300 1122334", showPhone: true, note: "Ventilators, monitors, infusion pumps. On-site visits.", rating: 4.7, jobs: 210 },
  { id: "sv2", name: "Ultrasound & Imaging Servicing", provider: "ImageCare Technical", city: "Karachi", area: "Saddar", phone: "", showPhone: false, note: "Probe repair, calibration, AMC contracts.", rating: 4.5, jobs: 132 },
  { id: "sv3", name: "Lab Analyzer Calibration", provider: "Precision Lab Services", city: "Islamabad", area: "G-9", phone: "051 4477881", showPhone: true, note: "Hematology and chemistry analyzers.", rating: 4.8, jobs: 96 },
  { id: "sv4", name: "Dental Unit Installation & Repair", provider: "DentTech Care", city: "Faisalabad", area: "Susan Road", phone: "0321 9988776", showPhone: true, note: "Chairs, compressors, autoclaves.", rating: 4.4, jobs: 74 },
  { id: "sv5", name: "Hospital Furniture Maintenance", provider: "FixIt Medical", city: "Peshawar", area: "University Road", phone: "", showPhone: false, note: "Beds, trolleys, OT tables.", rating: 4.2, jobs: 51 },
];

const MKT_CONDITIONS = ["New", "Refurbished", "Used"];
const MKT_PRICE_BANDS = [
  { key: "p1", label: "Under Rs 10k", test: (n) => n < 10000 },
  { key: "p2", label: "Rs 10k – 100k", test: (n) => n >= 10000 && n < 100000 },
  { key: "p3", label: "Rs 100k – 500k", test: (n) => n >= 100000 && n < 500000 },
  { key: "p4", label: "Rs 500k +", test: (n) => n >= 500000 },
];
const MKT_SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
];
const EMPTY_MKT_FILTERS = { category: "", conds: [], prices: [], verified: false, delivery: false, warranty: false };
const mktPrice = (i) => parseFloat(String(i.price || "").replace(/,/g, "")) || 0;
const mktImage = (i) => (i.photos && i.photos.length ? i.photos[i.coverIndex || 0] || i.photos[0] : i.img || marketCatOf(i.category).img);
const mktCondTone = (c = "") => (/^new/i.test(c) ? { color: GREEN, bg: GREEN_TINT } : /refurb/i.test(c) ? { color: BRAND, bg: BRAND_50 } : { color: AMBER, bg: AMBER_TINT });

function MarketItemCard({ item, saved, onOpen, onToggleSave }) {
  const tone = mktCondTone(item.condition);
  return (
    <article role="button" tabIndex={0} onClick={() => onOpen(item)}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(item); } }}
      className="group h-full rounded-2xl bg-white overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
      <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: CREAM }}>
        <img src={mktImage(item)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 text-[11px] font-bold px-2 py-1 rounded-md" style={{ color: tone.color, backgroundColor: "#fff" }}>{item.condition}</span>
        {item.mine
          ? <span className="absolute right-3 top-3 text-[11px] font-bold px-2 py-1 rounded-md text-white" style={{ backgroundColor: VIOLET }}>Your listing</span>
          : (
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSave(item); }} aria-label={saved ? "Remove from saved" : "Save item"}
              className="absolute right-3 top-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/95 transition-transform hover:scale-105">
              <Bookmark className="w-4 h-4" fill={saved ? BRAND : "none"} stroke={saved ? BRAND : INK_2} />
            </button>
          )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[12px] font-semibold" style={{ color: VIOLET }}>{marketCatOf(item.category).short}</p>
        <p className="text-[15.5px] font-bold leading-snug mt-0.5 line-clamp-2 group-hover:text-[#5B47C7] transition-colors" style={{ color: INK }}>{item.name}</p>
        <p className="text-[19px] font-extrabold mt-1.5" style={{ color: INK }}>
          PKR {item.price}{item.priceTo ? <span className="text-[14px]"> – {item.priceTo}</span> : null}
        </p>
        <span className="flex-1" />
        <div className="flex items-center gap-1.5 mt-3 pt-3 text-[12.5px] min-w-0" style={{ color: SUBTLE, borderTop: `1px solid ${CARD_BORDER}` }}>
          <span className="truncate font-semibold" style={{ color: INK_2 }}>{item.seller}</span>
          {item.verifiedSeller && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: GREEN }} />}
          <span className="ml-auto inline-flex items-center gap-1 shrink-0"><MapPin className="w-3.5 h-3.5" />{item.city || "Pakistan"}</span>
        </div>
      </div>
    </article>
  );
}

function MarketItemPage({ item, all, onBack, onOpen, saved, onToggleSave, onMessage, onWhatsApp, onShare, onReport, reported, onEdit }) {
  const [idx, setIdx] = useState(item.coverIndex || 0);
  const trackRef = useRef(null);
  useEffect(() => { setIdx(item.coverIndex || 0); window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const photos = item.photos && item.photos.length ? item.photos : [mktImage(item)];
  const cat = marketCatOf(item.category);
  const tone = mktCondTone(item.condition);
  const similar = all.filter((x) => x.id !== item.id && marketCatOf(x.category).key === cat.key)
    .concat(all.filter((x) => x.id !== item.id && marketCatOf(x.category).key !== cat.key && x.city === item.city))
    .slice(0, 10);
  const specs = [
    ["Category", cat.label],
    ["Condition", item.condition],
    ["Availability", item.stock || "Ask seller"],
    ["Warranty", item.warranty || "No warranty"],
    ["Delivery", (item.delivery && item.delivery.length ? item.delivery.join(", ") : "Ask seller")],
    ["Location", [item.area, item.city].filter(Boolean).join(", ") || "Shared on contact"],
  ];
  const slide = (dir) => { const el = trackRef.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" }); };

  return (
    <div className="w-full min-w-0 page-enter" style={{ fontFamily: FONT }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-7">
        <div className="flex items-center gap-2 text-[13.5px] mb-5" style={{ color: SUBTLE }}>
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl font-semibold bg-white transition-colors hover:bg-[#F5F7FA]" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
            <ChevronLeft className="w-4 h-4" /> Marketplace
          </button>
          <span className="hidden sm:inline">/</span>
          <span className="hidden sm:inline">{cat.label}</span>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 items-start">
          {/* gallery */}
          <div className="min-w-0">
            <div className="rounded-3xl overflow-hidden aspect-[4/3]" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
              <img src={photos[idx] || photos[0]} alt={item.name} className="w-full h-full object-cover" />
            </div>
            {photos.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                {photos.map((src, k) => (
                  <button key={k} type="button" onClick={() => setIdx(k)} className="shrink-0 w-20 h-16 rounded-xl overflow-hidden"
                    style={{ border: `2px solid ${k === idx ? VIOLET : "transparent"}` }}>
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* summary */}
          <div className="min-w-0 lg:sticky lg:top-[88px]">
            <div className="rounded-3xl bg-white p-5 sm:p-6" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 16px 40px -24px rgba(16,24,40,0.3)" }}>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg" style={{ color: tone.color, backgroundColor: tone.bg }}>{item.condition}</span>
                <span className="text-[12px] font-bold px-2.5 py-1 rounded-lg inline-flex items-center gap-1" style={{ color: VIOLET, backgroundColor: VIOLET_TINT }}><cat.icon className="w-3.5 h-3.5" /> {cat.short}</span>
                {item.stock && <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: INK_2, backgroundColor: CREAM }}>{item.stock}</span>}
              </div>
              <h1 className="text-[24px] sm:text-[28px] font-extrabold tracking-[-0.025em] leading-tight mt-3" style={{ color: INK }}>{item.name}</h1>
              <p className="text-[30px] font-extrabold mt-2 leading-none" style={{ color: INK }}>
                PKR {item.price}{item.priceTo ? <span className="text-[20px]"> – {item.priceTo}</span> : null}
              </p>
              {item.posted && <p className="text-[13px] mt-2" style={{ color: FAINT }}>Listed {item.posted}</p>}

              <div className="grid grid-cols-2 gap-2 mt-5">
                {[
                  [Truck, "Delivery", item.delivery && item.delivery.length ? item.delivery[0] : "Ask seller"],
                  [ShieldCheck, "Warranty", item.warranty || "None"],
                ].map(([Icon, k, v]) => (
                  <div key={k} className="rounded-xl p-3" style={{ backgroundColor: CREAM }}>
                    <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] flex items-center gap-1.5" style={{ color: SUBTLE }}><Icon className="w-3.5 h-3.5" /> {k}</p>
                    <p className="text-[14px] font-semibold mt-1 truncate" style={{ color: INK }}>{v}</p>
                  </div>
                ))}
              </div>

              {/* seller */}
              <div className="mt-5 rounded-2xl p-4 flex items-center gap-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-[17px]" style={{ backgroundColor: VIOLET }}>
                  {(item.seller || "?")[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold truncate flex items-center gap-1.5" style={{ color: INK }}>
                    {item.seller} {item.verifiedSeller && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: GREEN }} />}
                  </p>
                  <p className="text-[13px] truncate flex items-center gap-1" style={{ color: SUBTLE }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" /> {[item.area, item.city].filter(Boolean).join(", ") || "Location shared on contact"}
                  </p>
                </div>
              </div>

              {item.mine ? (
                <button type="button" onClick={onEdit} className="w-full h-12 mt-4 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2" style={{ backgroundColor: VIOLET }}>
                  <Pencil className="w-4 h-4" /> Edit listing
                </button>
              ) : (
                <div className="flex gap-2 mt-4">
                  <button type="button" onClick={onMessage}
                    className="flex-1 h-12 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110"
                    style={{ backgroundColor: VIOLET, boxShadow: "0 8px 20px -10px rgba(91,71,199,0.6)" }}>
                    <MessageSquareText className="w-[18px] h-[18px]" /> Message seller
                  </button>
                  {item.showPhone && item.phone && (
                    <button type="button" onClick={onWhatsApp} aria-label="WhatsApp seller"
                      className="h-12 px-4 rounded-xl text-[14.5px] font-bold inline-flex items-center justify-center gap-2" style={{ color: "#128C3E", border: "1.5px solid #1DA851" }}>
                      <WhatsAppGlyph /> <span className="hidden sm:inline">WhatsApp</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex gap-2 mt-2.5">
                {!item.mine && (
                  <button type="button" onClick={onToggleSave} className="flex-1 h-11 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F5F7FA]"
                    style={{ color: saved ? BRAND : INK_2, border: `1px solid ${saved ? "#B9D3F2" : CARD_BORDER}`, backgroundColor: saved ? BRAND_50 : "#fff" }}>
                    <Bookmark className="w-4 h-4" fill={saved ? BRAND : "none"} /> {saved ? "Saved" : "Save"}
                  </button>
                )}
                <button type="button" onClick={onShare} className="flex-1 h-11 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F5F7FA]" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                  <Repeat2 className="w-4 h-4" /> Share
                </button>
                {!item.mine && (
                  <button type="button" onClick={onReport} className="flex-1 h-11 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5 transition-colors hover:bg-[#F5F7FA]"
                    style={{ color: reported ? RED : INK_2, border: `1px solid ${reported ? "#F3B7B2" : CARD_BORDER}`, backgroundColor: reported ? RED_TINT : "#fff" }}>
                    <Flag className="w-4 h-4" /> {reported ? "Reported" : "Report"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 mt-6 items-start">
          <section className="rounded-2xl bg-white p-5 sm:p-6" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <h2 className="text-[17px] font-extrabold mb-3" style={{ color: INK }}>Description</h2>
            <p className="text-[15px] leading-relaxed" style={{ color: INK_2 }}>{item.note || "The seller hasn't added a description yet — message them for details."}</p>
            <h2 className="text-[17px] font-extrabold mt-6 mb-3" style={{ color: INK }}>Specifications</h2>
            <dl className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
              {specs.map(([k, v], i) => (
                <div key={k} className="flex gap-4 px-4 py-3 text-[14px]" style={{ borderTop: i ? `1px solid ${CARD_BORDER}` : "none", backgroundColor: i % 2 ? "#fff" : "#FAFBFC" }}>
                  <dt className="w-32 shrink-0 font-semibold" style={{ color: SUBTLE }}>{k}</dt>
                  <dd className="flex-1 min-w-0 font-semibold" style={{ color: INK }}>{v}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="rounded-2xl p-5 sm:p-6" style={{ backgroundColor: AMBER_TINT }}>
            <h2 className="text-[17px] font-extrabold mb-3 flex items-center gap-2" style={{ color: "#6B4B22" }}><ShieldCheck className="w-5 h-5" style={{ color: AMBER }} /> Buy safely</h2>
            <ul className="space-y-2.5 text-[14.5px]" style={{ color: "#6B4B22" }}>
              {["Inspect the equipment in person or on video before paying.", "Ask for invoices, warranty cards and calibration certificates.", "Never send an advance payment to someone you haven't met.", "Report listings that look suspicious — we review every report."].map((t) => (
                <li key={t} className="flex items-start gap-2.5"><CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: AMBER }} /> {t}</li>
              ))}
            </ul>
          </section>
        </div>

        {similar.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: INK }}>Similar equipment</h2>
                <p className="text-[14px] mt-1" style={{ color: SUBTLE }}>More in {cat.short}{item.city ? ` and around ${item.city}` : ""}</p>
              </div>
              <div className="hidden sm:flex gap-2 shrink-0">
                {[[-1, ChevronLeft, "Previous"], [1, ChevronRight, "Next"]].map(([dir, Icon, label]) => (
                  <button key={label} type="button" onClick={() => slide(dir)} aria-label={label}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-shadow hover:shadow-md" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <Icon className="w-5 h-5" style={{ color: INK }} />
                  </button>
                ))}
              </div>
            </div>
            <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0" style={{ scrollbarWidth: "none" }}>
              {similar.map((x) => (
                <div key={x.id} className="snap-start shrink-0 w-[72%] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-48px)/4)]">
                  <MarketItemCard item={x} saved={false} onOpen={onOpen} onToggleSave={() => {}} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function MarketHubScreen({ initialQuery, onBack, onMenu, onOpenSeller, onSendMessage, onReport, reportedIds, listings, canSell, requireAuth = (r, fn) => fn(), isSaved = () => false, onToggleSave = () => {} }) {
  const [tab, setTab] = useState("buy");          // buy | sell | services
  const [query, setQuery] = useState(initialQuery || "");
  const [qDraft, setQDraft] = useState(initialQuery || "");
  const [location, setLocation] = useState("");
  const [locDraft, setLocDraft] = useState("");
  const [f, setF] = useState(EMPTY_MKT_FILTERS);
  const [sort, setSort] = useState("newest");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgDraft, setMsgDraft] = useState("");
  const [sentTo, setSentTo] = useState({});
  const [openItem, setOpenItem] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!filtersOpen && !msgTarget) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [filtersOpen, msgTarget]);

  const waLink = (phone, item) => {
    const d = String(phone || "").replace(/\D/g, "").replace(/^0/, "");
    const text = `Assalam o Alaikum, I saw your listing "${item.name}" on PakMed. Is it still available?\n— sent via PakMed · pakmed.app`;
    return `https://wa.me/92${d}?text=${encodeURIComponent(text)}`;
  };

  const userListings = (listings || []).filter((l) => l.status === "live").map((l) => ({
    id: l.id, name: l.name, category: l.category, condition: l.condition,
    price: l.price, priceTo: l.priceTo, seller: "Your listing", city: "", area: "", phone: "", showPhone: false,
    note: l.notes || "", kind: "product", mine: true, photos: l.photos, coverIndex: l.coverIndex,
    stock: l.stock, delivery: l.delivery, warranty: l.warranty, posted: "Just now",
  }));
  const allItems = [...userListings, ...SEED_MARKET_ITEMS];

  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  const base = allItems.filter((i) => {
    if (q && ![i.name, i.category, i.seller, i.note].filter(Boolean).some((v) => v.toLowerCase().includes(q))) return false;
    if (loc && ![i.city, i.area].filter(Boolean).some((v) => v.toLowerCase().includes(loc))) return false;
    if (f.conds.length && !f.conds.some((c) => (i.condition || "").toLowerCase().startsWith(c.toLowerCase()))) return false;
    if (f.prices.length && !f.prices.some((k) => MKT_PRICE_BANDS.find((b) => b.key === k).test(mktPrice(i)))) return false;
    if (f.verified && !i.verifiedSeller) return false;
    if (f.delivery && !(i.delivery || []).some((d) => /courier|delivery/i.test(d))) return false;
    if (f.warranty && !i.warranty) return false;
    return true;
  });
  const catCounts = base.reduce((acc, i) => { const k = marketCatOf(i.category).key; acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const items = (f.category ? base.filter((i) => marketCatOf(i.category).key === f.category) : base).slice().sort((a, b) => {
    if (sort === "low") return mktPrice(a) - mktPrice(b);
    if (sort === "high") return mktPrice(b) - mktPrice(a);
    return 0;
  });
  const services = SEED_SERVICES.filter((sv) =>
    (!loc || [sv.city, sv.area].some((v) => v.toLowerCase().includes(loc))) &&
    (!q || [sv.name, sv.provider, sv.note].some((v) => v.toLowerCase().includes(q)))
  );

  const suggestions = tab === "services"
    ? [...new Set(SEED_SERVICES.flatMap((s) => [s.name, s.provider]))]
    : [...new Set([...allItems.map((i) => i.name), ...MARKET_CATS.map((c) => c.label), ...ALL_PRODUCTS.map((p) => p.name)])];
  const cityOptions = [...new Set([...CITIES, ...SEED_MARKET_ITEMS.map((i) => i.city)])].sort();

  const panelCount = f.conds.length + f.prices.length + f.verified + f.delivery + f.warranty;
  const toggle = (key) => (v) => setF((p) => ({ ...p, [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }));
  const chips = [
    query && { label: `“${query}”`, clear: () => { setQuery(""); setQDraft(""); } },
    location && { label: location, icon: MapPin, clear: () => { setLocation(""); setLocDraft(""); } },
    f.category && { label: MARKET_CATS.find((c) => c.key === f.category).short, clear: () => setF((p) => ({ ...p, category: "" })) },
    ...f.conds.map((c) => ({ label: c, clear: () => toggle("conds")(c) })),
    ...f.prices.map((k) => ({ label: MKT_PRICE_BANDS.find((b) => b.key === k).label, clear: () => toggle("prices")(k) })),
    f.verified && { label: "Verified sellers", clear: () => setF((p) => ({ ...p, verified: false })) },
    f.delivery && { label: "Delivery available", clear: () => setF((p) => ({ ...p, delivery: false })) },
    f.warranty && { label: "With warranty", clear: () => setF((p) => ({ ...p, warranty: false })) },
  ].filter(Boolean);
  const clearAll = () => { setQuery(""); setQDraft(""); setLocation(""); setLocDraft(""); setF(EMPTY_MKT_FILTERS); };
  const runSearch = (e) => {
    if (e) e.preventDefault();
    setQuery(qDraft.trim());
    setLocation(locDraft.trim());
    if (tab === "sell") setTab("buy");
    if (resultsRef.current && window.innerWidth < 1024) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const send = () => {
    if (!msgDraft.trim() || !msgTarget) return;
    onSendMessage({ business: msgTarget.seller || msgTarget.provider, product: msgTarget.name, text: msgDraft.trim() });
    setSentTo((p) => ({ ...p, [msgTarget.id]: true }));
    setMsgDraft(""); setMsgTarget(null);
  };
  const contact = (it) => requireAuth("contact this seller", () => setMsgTarget(it));
  const pill = (on, color = VIOLET) => ({ color: on ? "#fff" : INK_2, backgroundColor: on ? color : "#fff", border: `1px solid ${on ? color : CARD_BORDER}` });
  const H = ({ children }) => <p className="text-[12.5px] font-bold uppercase tracking-[0.07em] mb-2.5" style={{ color: SUBTLE }}>{children}</p>;

  const Panel = (
    <div className="pb-4">
      <div className="pt-1">
        <H>Condition</H>
        <div className="flex flex-wrap gap-2">
          {MKT_CONDITIONS.map((c) => (
            <button key={c} type="button" aria-pressed={f.conds.includes(c)} onClick={() => toggle("conds")(c)}
              className="h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors" style={pill(f.conds.includes(c))}>{c}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <H>Price</H>
        <div className="flex flex-wrap gap-2">
          {MKT_PRICE_BANDS.map((b) => (
            <button key={b.key} type="button" aria-pressed={f.prices.includes(b.key)} onClick={() => toggle("prices")(b.key)}
              className="h-9 px-3.5 rounded-full text-[13px] font-semibold transition-colors" style={pill(f.prices.includes(b.key))}>{b.label}</button>
          ))}
        </div>
      </div>
      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <H>More</H>
        <div className="flex flex-wrap gap-2">
          {[["verified", "Verified sellers", BadgeCheck], ["delivery", "Delivery available", Truck], ["warranty", "With warranty", ShieldCheck]].map(([k, label, Icon]) => (
            <button key={k} type="button" aria-pressed={f[k]} onClick={() => setF((p) => ({ ...p, [k]: !p[k] }))}
              className="h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors" style={pill(f[k])}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (openItem) {
    return (
      <>
        <MarketItemPage
          item={openItem}
          all={allItems}
          onBack={() => setOpenItem(null)}
          onOpen={setOpenItem}
          saved={isSaved("market", openItem.id)}
          onToggleSave={() => onToggleSave("market", openItem)}
          onMessage={() => contact(openItem)}
          onWhatsApp={() => requireAuth("contact this seller", () => { try { window.open(waLink(openItem.phone, openItem), "_blank", "noopener"); } catch (e) { /* blocked */ } })}
          onShare={() => requireAuth("share this listing", () => setShareItem(openItem))}
          onReport={() => onReport({ id: openItem.id, type: "listing", title: openItem.name, subtitle: `${openItem.seller} · ${openItem.city}` })}
          reported={reportedIds && reportedIds.has(openItem.id)}
          onEdit={() => { setOpenItem(null); onOpenSeller(); }}
        />
        {shareItem && <ShareSheet card={{ id: shareItem.id, title: `${shareItem.name} — PKR ${shareItem.price}` }} onClose={() => setShareItem(null)} />}
        {msgTarget && <MarketMessageModal target={msgTarget} draft={msgDraft} setDraft={setMsgDraft} onSend={send} onClose={() => setMsgTarget(null)} />}
      </>
    );
  }

  return (
    <div className="w-full min-w-0" style={{ fontFamily: FONT }}>
      {/* hero */}
      <section className="relative z-10" style={{ background: "linear-gradient(135deg, #2E2370 0%, #5B47C7 55%, #0B57B7 100%)" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
          <img src={`${MKT_IMG}/patient-monitor.jpg`} alt="" className="hidden lg:block absolute right-0 top-0 h-full w-[34%] object-cover opacity-25" style={{ maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-5">
            {onBack && (
              <button type="button" onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <p className="text-[13px] font-semibold text-white/80">Home <span className="mx-1 text-white/50">/</span> <span className="text-white">Buy / Sell</span></p>
          </div>
          <h1 className="text-[28px] sm:text-[38px] font-extrabold tracking-[-0.03em] leading-tight text-white">Medical equipment marketplace</h1>
          <p className="text-[14.5px] sm:text-[16px] mt-2 text-white/80">Buy, sell and service equipment from {new Set(SEED_MARKET_ITEMS.map((i) => i.seller)).size}+ trusted suppliers across Pakistan</p>

          <div className="inline-flex p-1 rounded-2xl mt-6 bg-white/12" style={{ backgroundColor: "rgba(255,255,255,0.12)" }} role="tablist">
            {[["buy", "Buy", Store], ["sell", "Sell", Tag], ["services", "Services & repair", Wrench]].map(([k, label, Icon]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
                className="h-10 px-3.5 sm:px-5 rounded-xl text-[14px] font-bold inline-flex items-center gap-2 transition-all"
                style={{ backgroundColor: tab === k ? "#fff" : "transparent", color: tab === k ? VIOLET : "#fff" }}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </div>

          {tab !== "sell" && (
            <form onSubmit={runSearch} className="mt-4 bg-white rounded-2xl p-2 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_auto] gap-2 relative z-20" style={{ boxShadow: "0 20px 40px -20px rgba(0,0,0,0.4)" }}>
              <SearchSuggestInput
                icon={tab === "services" ? Wrench : Search}
                value={qDraft}
                onChange={setQDraft}
                onPick={(v) => { setQDraft(v); setQuery(v); }}
                onClear={() => { setQDraft(""); setQuery(""); }}
                placeholder={tab === "services" ? "Repair, calibration, installation…" : "Equipment, brand or category"}
                suggestions={suggestions}
                srLabel="Search the marketplace"
                className="md:border-r rounded-xl"
                style={{ borderColor: CARD_BORDER }}
              />
              <SearchSuggestInput
                icon={MapPin}
                value={locDraft}
                onChange={setLocDraft}
                onPick={(v) => { setLocDraft(v); setLocation(v); }}
                onClear={() => { setLocDraft(""); setLocation(""); }}
                placeholder="City or area"
                suggestions={cityOptions}
                srLabel="City or area"
                className="rounded-xl"
              />
              <button type="submit" className="h-12 px-7 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110" style={{ backgroundColor: VIOLET }}>
                <Search className="w-4 h-4" /> Search
              </button>
            </form>
          )}
        </div>
      </section>

      <div ref={resultsRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 scroll-mt-20">
        {/* ================= BUY ================= */}
        {tab === "buy" && (
          <>
            {/* categories */}
            <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
              {MARKET_CATS.map((c) => {
                const on = f.category === c.key;
                const n = catCounts[c.key] || 0;
                return (
                  <button key={c.key} type="button" onClick={() => setF((p) => ({ ...p, category: on ? "" : c.key }))}
                    className="group shrink-0 w-[150px] sm:w-[156px] rounded-2xl overflow-hidden text-left bg-white transition-all hover:-translate-y-0.5 hover:shadow-md"
                    style={{ border: `2px solid ${on ? VIOLET : CARD_BORDER}` }}>
                    <div className="relative h-20 overflow-hidden">
                      <img src={c.img} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0" style={{ background: on ? "rgba(91,71,199,0.35)" : "linear-gradient(180deg, transparent 30%, rgba(16,24,40,0.35))" }} />
                      <span className="absolute left-2.5 bottom-2 w-8 h-8 rounded-lg flex items-center justify-center bg-white">
                        <c.icon className="w-4 h-4" style={{ color: VIOLET }} />
                      </span>
                    </div>
                    <div className="px-3 py-2.5">
                      <p className="text-[13.5px] font-bold truncate" style={{ color: on ? VIOLET : INK }}>{c.short}</p>
                      <p className="text-[12px]" style={{ color: SUBTLE }}>{n} {n === 1 ? "item" : "items"}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-[250px_1fr] gap-6 items-start">
              <aside className="hidden lg:block sticky top-[88px] rounded-2xl bg-white px-5 pt-4 pb-1" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <div className="flex items-center justify-between pb-3">
                  <p className="text-[16px] font-extrabold flex items-center gap-2" style={{ color: INK }}><SlidersHorizontal className="w-4 h-4" /> Filters</p>
                  {panelCount > 0 && <button type="button" onClick={() => setF((p) => ({ ...EMPTY_MKT_FILTERS, category: p.category }))} className="text-[13px] font-bold" style={{ color: VIOLET }}>Clear</button>}
                </div>
                {Panel}
              </aside>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <p className="text-[14.5px] mr-auto" style={{ color: SUBTLE }}>
                    <b className="text-[16px]" style={{ color: INK }}>{items.length}</b> {items.length === 1 ? "item" : "items"}
                    {location ? <> in <b style={{ color: INK }}>{location}</b></> : " across Pakistan"}
                  </p>
                  <button type="button" onClick={() => setFiltersOpen(true)}
                    className="lg:hidden h-10 px-3.5 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-2 bg-white" style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                    {panelCount > 0 && <span className="w-5 h-5 rounded-full text-[11px] text-white flex items-center justify-center" style={{ backgroundColor: VIOLET }}>{panelCount}</span>}
                  </button>
                  <Dropdown label="Sort items" icon={ArrowUpDown} value={sort} onChange={setSort} options={MKT_SORTS} />
                </div>

                {chips.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {chips.map((c) => (
                      <span key={c.label} className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full text-[12.5px] font-semibold" style={{ color: VIOLET, backgroundColor: VIOLET_TINT, border: "1px solid #D9D2F7" }}>
                        {c.icon && <c.icon className="w-3.5 h-3.5" />} {c.label}
                        <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                    <button type="button" onClick={clearAll} className="text-[13px] font-bold px-2 h-8" style={{ color: RED }}>Clear all</button>
                  </div>
                )}

                {items.length === 0 ? (
                  <div className="rounded-2xl bg-white px-6 py-14 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: VIOLET_TINT }}>
                      <Store className="w-6 h-6" style={{ color: VIOLET }} />
                    </span>
                    <p className="text-[17px] font-bold" style={{ color: INK }}>Nothing matches your search</p>
                    <p className="text-[14px] mt-1 mb-5" style={{ color: SUBTLE }}>Try another category, a nearby city or fewer filters.</p>
                    <button type="button" onClick={clearAll} className="h-11 px-5 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: VIOLET }}>Clear all filters</button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {items.map((i) => (
                      <MarketItemCard key={i.id} item={i} saved={isSaved("market", i.id)} onOpen={setOpenItem} onToggleSave={(it) => onToggleSave("market", it)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ================= SELL ================= */}
        {tab === "sell" && (
          <div className="space-y-6">
            <div className="rounded-3xl overflow-hidden grid lg:grid-cols-[1.2fr_1fr] bg-white" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <div className="p-6 sm:p-8">
                <p className="text-[12px] font-bold tracking-[0.12em] uppercase" style={{ color: VIOLET }}>Sell on PakMed</p>
                <h2 className="text-[24px] sm:text-[30px] font-extrabold tracking-[-0.03em] leading-tight mt-2" style={{ color: INK }}>Reach clinics and hospitals across Pakistan</h2>
                <p className="text-[15px] mt-2 leading-relaxed" style={{ color: SUBTLE }}>List new, used or refurbished equipment in minutes. Buyers message you directly — no commission on your first {FREE_LISTINGS_PER_MONTH} listings each month.</p>
                <ol className="grid sm:grid-cols-3 gap-3 mt-6">
                  {[["1", "Create your seller profile", Store], ["2", "Add items with photos & price", Upload], ["3", "Get enquiries on PakMed", MessageSquareText]].map(([n, t, Icon]) => (
                    <li key={n} className="rounded-2xl p-4" style={{ backgroundColor: CREAM }}>
                      <span className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: VIOLET_TINT }}><Icon className="w-[18px] h-[18px]" style={{ color: VIOLET }} /></span>
                      <p className="text-[12px] font-bold mt-3" style={{ color: VIOLET }}>Step {n}</p>
                      <p className="text-[14px] font-bold mt-0.5 leading-snug" style={{ color: INK }}>{t}</p>
                    </li>
                  ))}
                </ol>
                <button type="button" onClick={onOpenSeller} className="mt-6 h-12 px-6 rounded-xl text-[15px] font-bold text-white inline-flex items-center gap-2 transition-all hover:brightness-110" style={{ backgroundColor: VIOLET, boxShadow: "0 8px 20px -10px rgba(91,71,199,0.6)" }}>
                  <Plus className="w-4 h-4" /> {canSell ? "List an item" : "Start selling"}
                </button>
              </div>
              <div className="relative min-h-[220px]">
                <img src={`${MKT_IMG}/hospital-bed.jpg`} alt="" className="absolute inset-0 w-full h-full object-cover" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-extrabold" style={{ color: INK }}>Your listings <span style={{ color: FAINT }}>({(listings || []).length})</span></h3>
                {(listings || []).length > 0 && (
                  <button type="button" onClick={onOpenSeller} className="text-[13.5px] font-bold inline-flex items-center gap-1" style={{ color: VIOLET }}>Seller dashboard <ChevronRight className="w-4 h-4" /></button>
                )}
              </div>
              {(listings || []).length === 0 ? (
                <div className="rounded-2xl bg-white px-6 py-12 text-center" style={{ border: `1.5px dashed ${CARD_BORDER}` }}>
                  <Store className="w-9 h-9 mx-auto" style={{ color: FAINT }} />
                  <p className="text-[15px] font-bold mt-3" style={{ color: INK }}>You haven't listed anything yet</p>
                  <p className="text-[14px] mt-1" style={{ color: SUBTLE }}>Your listings will appear here with their views and enquiries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {listings.map((l) => {
                    const live = l.status === "live";
                    return (
                      <button key={l.id} type="button" onClick={onOpenSeller} className="rounded-2xl bg-white overflow-hidden text-left transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ border: `1px solid ${CARD_BORDER}` }}>
                        <div className="relative aspect-[16/9]" style={{ backgroundColor: CREAM }}>
                          <img src={l.photos && l.photos.length ? l.photos[l.coverIndex] || l.photos[0] : marketCatOf(l.category).img} alt="" className="w-full h-full object-cover" />
                          <span className="absolute left-3 top-3 text-[11px] font-bold px-2 py-1 rounded-md" style={{ color: live ? GREEN : SUBTLE, backgroundColor: "#fff" }}>
                            {live ? "Live" : l.status === "sold" ? "Sold" : "Hidden"}
                          </span>
                        </div>
                        <div className="p-4">
                          <p className="text-[15px] font-bold truncate" style={{ color: INK }}>{l.name}</p>
                          <p className="text-[17px] font-extrabold mt-0.5" style={{ color: INK }}>PKR {l.price}</p>
                          <div className="flex items-center gap-4 mt-2 text-[12.5px]" style={{ color: SUBTLE }}>
                            <span className="inline-flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {l.views || 0} views</span>
                            <span className="inline-flex items-center gap-1"><MessageSquareText className="w-3.5 h-3.5" /> {l.enquiries || 0} enquiries</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= SERVICES ================= */}
        {tab === "services" && (
          <>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <p className="text-[14.5px] mr-auto" style={{ color: SUBTLE }}>
                <b className="text-[16px]" style={{ color: INK }}>{services.length}</b> service {services.length === 1 ? "provider" : "providers"}{location ? <> in <b style={{ color: INK }}>{location}</b></> : " across Pakistan"}
              </p>
              {chips.length > 0 && <button type="button" onClick={clearAll} className="text-[13px] font-bold px-2 h-8" style={{ color: RED }}>Clear search</button>}
            </div>
            {services.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-14 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <Wrench className="w-8 h-8 mx-auto" style={{ color: FAINT }} />
                <p className="text-[16px] font-bold mt-3" style={{ color: INK }}>No providers match</p>
                <p className="text-[14px] mt-1" style={{ color: SUBTLE }}>Try another city or a broader search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {services.map((sv) => (
                  <article key={sv.id} className="rounded-2xl bg-white p-5 flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                    <div className="flex items-start gap-3">
                      <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: VIOLET_TINT }}>
                        <Wrench className="w-6 h-6" style={{ color: VIOLET }} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[16px] font-bold leading-snug" style={{ color: INK }}>{sv.name}</p>
                        <p className="text-[13.5px] font-semibold mt-0.5" style={{ color: VIOLET }}>{sv.provider}</p>
                      </div>
                    </div>
                    <p className="text-[14px] mt-3 leading-relaxed flex-1" style={{ color: INK_2 }}>{sv.note}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-[13px]" style={{ color: INK_2 }}>
                      <span className="inline-flex items-center gap-1 font-bold" style={{ color: INK }}><Star className="w-4 h-4" fill={STAR} stroke="none" /> {sv.rating}</span>
                      <span>{sv.jobs} jobs done</span>
                      <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" style={{ color: FAINT }} />{sv.area}, {sv.city}</span>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                      <button type="button" onClick={() => requireAuth("request this service", () => setMsgTarget(sv))}
                        className="flex-1 h-10 rounded-xl text-[13.5px] font-bold inline-flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: sentTo[sv.id] ? GREEN_TINT : VIOLET, color: sentTo[sv.id] ? GREEN : "#fff" }}>
                        {sentTo[sv.id] ? <><Check className="w-4 h-4" /> Request sent</> : <><MessageSquareText className="w-4 h-4" /> Request service</>}
                      </button>
                      {sv.showPhone && sv.phone && (
                        <a href={`tel:${sv.phone.replace(/\s/g, "")}`} aria-label={`Call ${sv.provider}`} className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                          <Phone className="w-4 h-4" style={{ color: INK_2 }} />
                        </a>
                      )}
                      <button type="button" onClick={() => onReport({ id: sv.id, type: "service", title: sv.name, subtitle: sv.provider })} aria-label="Report"
                        className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ border: `1px solid ${CARD_BORDER}`, backgroundColor: reportedIds && reportedIds.has(sv.id) ? RED_TINT : "#fff" }}>
                        <Flag className="w-4 h-4" style={{ color: reportedIds && reportedIds.has(sv.id) ? RED : INK_2 }} />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/45" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] bg-white rounded-t-3xl flex flex-col auth-step">
            <div className="flex items-center justify-between px-5 h-14 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[17px] font-extrabold" style={{ color: INK }}>Filters</p>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
                <X className="w-5 h-5" style={{ color: INK }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pt-4">{Panel}</div>
            <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <button type="button" onClick={() => setFiltersOpen(false)} className="w-full h-12 rounded-xl text-[15px] font-bold text-white" style={{ backgroundColor: VIOLET }}>
                Show {items.length} {items.length === 1 ? "item" : "items"}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareItem && <ShareSheet card={{ id: shareItem.id, title: `${shareItem.name} — PKR ${shareItem.price}` }} onClose={() => setShareItem(null)} />}
      {msgTarget && <MarketMessageModal target={msgTarget} draft={msgDraft} setDraft={setMsgDraft} onSend={send} onClose={() => setMsgTarget(null)} />}
    </div>
  );
}

function MarketMessageModal({ target, draft, setDraft, onSend, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const isService = !!target.provider;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Send a message">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[520px] bg-white rounded-3xl auth-step" style={{ boxShadow: "0 30px 80px -20px rgba(16,24,40,0.45)", fontFamily: FONT }}>
        <div className="flex items-center gap-3 px-6 pt-5 pb-4" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold" style={{ backgroundColor: VIOLET }}>{(target.seller || target.provider || "?")[0]}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[16px] font-extrabold truncate" style={{ color: INK }}>{isService ? "Request service" : "Message seller"}</p>
            <p className="text-[13px] truncate" style={{ color: SUBTLE }}>{target.seller || target.provider} · {target.name}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
            <X className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-2 mb-3">
            {(isService
              ? ["What are your charges for a visit?", "Can you come this week?", "Do you offer an annual contract?"]
              : ["Is this still available?", "What's your best price?", "Can you deliver to my city?"]).map((t) => (
              <button key={t} type="button" onClick={() => setDraft(t)} className="h-8 px-3 rounded-full text-[12.5px] font-semibold" style={{ color: VIOLET, backgroundColor: VIOLET_TINT }}>{t}</button>
            ))}
          </div>
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={4}
            placeholder={isService ? "Describe the equipment and the problem…" : `Is the ${target.name} still available? What's your best price?`}
            className="pm-input w-full text-[15px] rounded-xl px-4 py-3 outline-none resize-none bg-white"
            style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }} />
          <div className="flex gap-2 mt-4">
            <button type="button" onClick={onClose} className="h-11 px-5 rounded-xl text-[14px] font-bold" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>Cancel</button>
            <button type="button" onClick={onSend} disabled={!draft.trim()}
              className="flex-1 h-11 rounded-xl text-[14.5px] font-bold text-white inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed"
              style={{ backgroundColor: VIOLET, opacity: draft.trim() ? 1 : 0.45 }}>
              <Send className="w-4 h-4" /> Send message
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessagesScreen({ threads, onBack }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Messages" onBack={onBack} />
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {threads.length === 0 ? (
          <div className="rounded-xl bg-white p-6 text-center mt-2" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <MessageSquareText className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
            <p className="text-[13px]" style={{ color: SUBTLE }}>No messages yet. Message a seller from the Market tab to start a conversation.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5 mt-1">
            {threads.map((t, i) => (
              <div key={i} className="rounded-xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ backgroundColor: NAVY }}>
                    {t.business[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13.5px] font-semibold leading-tight" style={{ color: INK }}>{t.business}</p>
                    <p className="text-[11px] mt-0.5" style={{ color: SUBTLE }}>Re: {t.product}</p>
                    <p className="text-[12.5px] mt-1.5" style={{ color: "#4B4A45" }}>{t.text}</p>
                    <p className="text-[10.5px] mt-1.5" style={{ color: SUBTLE }}>Sent · awaiting reply</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlaceholderScreen({ title, onBack }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title={title} onBack={onBack} />
      <div className="flex-1 flex items-center justify-center px-8">
        <p className="text-[13px] text-center" style={{ color: SUBTLE }}>{title} screen coming next.</p>
      </div>
    </div>
  );
}

function Glyph({ icon, size = 18, color = "currentColor", style }) {
  if (!icon) return null;
  if (typeof icon === "string") return <span style={{ fontSize: size, lineHeight: 1, ...style }}>{icon}</span>;
  const I = icon;
  return <I style={{ width: size, height: size, color, flexShrink: 0, ...style }} strokeWidth={2} />;
}
// small inline icon that sits on a text line
function IconText({ icon: I, children, color = SUBTLE, size = 13 }) {
  return (
    <span className="inline-flex items-center gap-1 min-w-0">
      <I style={{ width: size, height: size, color, flexShrink: 0 }} strokeWidth={2} />
      <span className="truncate">{children}</span>
    </span>
  );
}

const HomeNav = createContext(null);
// requireAuth(reason, fn): runs fn if signed in, otherwise opens sign-in and runs fn afterwards
const AuthGate = createContext({ authed: true, require: (reason, fn) => fn && fn() });

function ScreenHeader({ title, subtitle, onBack, onMenu, right }) {
  const goHome = useContext(HomeNav);
  const iconBtn = "w-10 h-10 rounded-xl flex items-center justify-center bg-white shrink-0 transition-colors hover:bg-[#F5F7FA]";
  return (
    <div className="px-4 sm:px-6 pt-4 pb-3.5 flex items-center gap-2.5 shrink-0 bg-white" style={{ borderBottom: `1px solid ${CARD_BORDER}`, fontFamily: FONT }}>
      {onBack && (
        <button onClick={onBack} className={iconBtn} style={{ border: `1px solid ${CARD_BORDER}` }} aria-label="Back">
          <ChevronLeft className="w-5 h-5" style={{ color: INK }} />
        </button>
      )}
      {goHome && (
        <button onClick={goHome} className={iconBtn} style={{ border: `1px solid ${CARD_BORDER}` }} aria-label="Home">
          <Home className="w-[17px] h-[17px]" style={{ color: INK }} />
        </button>
      )}
      <div className="min-w-0 flex-1 ml-1">
        <p className="font-extrabold text-[19px] sm:text-[21px] leading-tight truncate" style={{ color: INK, letterSpacing: "-0.025em" }}>{title}</p>
        {subtitle && <p className="text-[12.5px] sm:text-[13px] mt-0.5 truncate" style={{ color: SUBTLE }}>{subtitle}</p>}
      </div>
      {right}
      {onMenu && (
        <button onClick={onMenu} className={iconBtn} style={{ border: `1px solid ${CARD_BORDER}` }} aria-label="Open menu">
          <Menu className="w-5 h-5" style={{ color: INK }} />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE SYSTEM — 4 profile types + completion gating
   ========================================================= */
const EMPTY_EDU_ROW  = { degree: "", institute: "", year: "" };
const EMPTY_POST_ROW = { role: "", place: "", period: "" };

const EMPTY_PROFILES = {
  general: {
    fullName: "", jobTitle: "", city: "", area: "", phone: "", email: "",
    about: "", photo: null,
  },
  doctor: {
    fullName: "", pmdc: "", specialty: "", subSpecialty: "",
    city: "", area: "", clinic: "", fee: "", availability: "",
    education: [{ ...EMPTY_EDU_ROW }],
    postings: [{ ...EMPTY_POST_ROW }],
    registrations: [], about: "", photo: null,
    listOnDirectory: false, openToJobs: true,
    practices: [], showContact: true,
  },
  employer: {
    facilityName: "", facilityType: "", city: "", area: "", address: "",
    contactPerson: "", phone: "", about: "", photos: [], logo: null,
  },
  seller: {
    business: "", type: "", city: "", area: "", address: "",
    phone: "", showPhone: true, hours: "", about: "", logo: null,
  },
};

const PROFILE_META = {
  general: {
    key: "general", label: "General Profile", icon: UserRound, color: NAVY, tint: NAVY_TINT,
    blurb: "Your basic identity on PakMed. Comes by default.",
    required: ["fullName", "jobTitle", "city", "phone"],
    optional: ["area", "email", "about", "photo"],
  },
  doctor: {
    key: "doctor", label: "Doctor Profile", icon: Stethoscope, color: "#B3202C", tint: RED_TINT,
    blurb: "To appear on the doctor directory or apply for jobs as a doctor.",
    required: ["fullName", "pmdc", "specialty", "city", "education", "postings"],
    optional: ["subSpecialty", "area", "clinic", "fee", "availability", "about", "photo"],
  },
  employer: {
    key: "employer", label: "Employer Profile", icon: Briefcase, color: TEAL, tint: TEAL_TINT,
    blurb: "For hospitals, clinics and facilities that want to post jobs.",
    required: ["facilityName", "facilityType", "city", "address", "contactPerson", "phone"],
    optional: ["area", "about", "photos", "logo"],
  },
  seller: {
    key: "seller", label: "Business / Seller Profile", icon: Store, color: VIOLET, tint: VIOLET_TINT,
    blurb: "To sell or service biomedical equipment on the Market.",
    required: ["business", "type", "city", "address", "phone"],
    optional: ["area", "hours", "about", "logo"],
  },
};

const GATE_THRESHOLD = 70;

function fieldFilled(v) {
  if (v === null || v === undefined) return false;
  if (Array.isArray(v)) {
    if (v.length === 0) return false;
    return v.some((row) => (typeof row === "string" ? row.trim() : Object.values(row).some((x) => String(x || "").trim())));
  }
  if (typeof v === "boolean") return v;
  return String(v).trim().length > 0;
}

function profileCompletion(type, data) {
  const meta = PROFILE_META[type];
  if (!meta || !data) return 0;
  // required fields carry 80% of the score, optional the remaining 20%
  const req = meta.required, opt = meta.optional || [];
  const reqDone = req.filter((f) => fieldFilled(data[f])).length;
  const optDone = opt.filter((f) => fieldFilled(data[f])).length;
  const reqScore = req.length ? (reqDone / req.length) * 80 : 80;
  const optScore = opt.length ? (optDone / opt.length) * 20 : 20;
  return Math.round(reqScore + optScore);
}

/* ---------- completion ring ---------- */
function CompletionRing({ value, size = 46, stroke = 4, color = NAVY, label }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E3E8F2" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .4s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: size * 0.26, fontWeight: 800, color }}>{label !== undefined ? label : `${pct}`}</span>
      </div>
    </div>
  );
}

/* ---------- gate shown when a profile isn't complete enough ---------- */
function ProfileGate({ type, completion, onOpenProfile, action }) {
  const meta = PROFILE_META[type];
  const Icon = meta.icon;
  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
      <div className="rounded-2xl p-5 mt-2 text-center" style={{ backgroundColor: "white", border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
        <div className="flex justify-center mb-3">
          <CompletionRing value={completion} size={72} stroke={6} color={meta.color} />
        </div>
        <p className="text-[16px] font-bold" style={{ color: INK }}>Complete your {meta.label}</p>
        <p className="text-[13.5px] mt-1.5 leading-snug" style={{ color: SUBTLE }}>
          {action} needs your {meta.label} at {GATE_THRESHOLD}% or more. You're at <strong style={{ color: meta.color }}>{completion}%</strong>.
        </p>

        <div className="h-2 rounded-full overflow-hidden mt-4" style={{ backgroundColor: "#E3E8F2" }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, backgroundColor: meta.color }} />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[11px]" style={{ color: SUBTLE }}>0%</span>
          <span className="text-[11px] font-bold" style={{ color: meta.color }}>{GATE_THRESHOLD}% needed</span>
          <span className="text-[11px]" style={{ color: SUBTLE }}>100%</span>
        </div>

        <button
          onClick={onOpenProfile}
          className="w-full mt-4 py-3.5 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2"
          style={{ backgroundColor: meta.color, color: "white" }}
        >
          <Icon className="w-4 h-4" /> Complete profile
        </button>
      </div>

      <div className="rounded-2xl p-4 mt-3" style={{ backgroundColor: meta.tint }}>
        <p className="text-[12.5px] font-bold mb-1.5" style={{ color: meta.color }}>Still available to you</p>
        <p className="text-[12.5px] leading-relaxed" style={{ color: "#42506B" }}>
          News feed · Doctor directory · CV builder · Job post card maker — all open without any profile.
        </p>
      </div>
    </div>
  );
}

/* ---------- profile editor (all four types) ---------- */
const MED_DEGREES = ["MBBS", "BDS", "FCPS", "MRCP", "MRCS", "MD", "MS", "MCPS", "Diploma", "PhD", "Other"];
const REGISTRATIONS = ["PMDC registered", "PNC registered", "Pharmacy Council", "Allied Health Council"];

const PF_INPUT_CLS = "w-full text-[14.5px] rounded-xl px-3.5 py-3 outline-none";
const PF_INPUT_STYLE = { backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` };

function PFLabel({ children, req, color }) {
  return (
    <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>
      {children} {req && <span style={{ color }}>*</span>}
    </p>
  );
}

function PFCard({ children }) {
  return (
    <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
      {children}
    </div>
  );
}

function PFPick({ options, value, onPick, multi, color }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => {
        const on = multi ? (value || []).includes(o) : value === o;
        return (
          <button key={o} onClick={() => onPick(o)}
            className="text-[13px] font-semibold px-3.5 py-2.5 rounded-full transition-colors active:scale-95"
            style={{ backgroundColor: on ? color : "white", color: on ? "white" : INK, border: `1.5px solid ${on ? color : CARD_BORDER}` }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}

const PREVIEW_LABELS = {
  general:  [["fullName","Name"],["jobTitle","Job title"],["city","City"],["area","Area"],["phone","WhatsApp"],["email","Email"]],
  doctor:   [["fullName","Name"],["pmdc","PMDC number"],["specialty","Speciality"],["subSpecialty","Focus"],["city","City"],["area","Area"],["clinic","Practice"],["fee","Consultation fee"],["availability","Availability"]],
  employer: [["facilityName","Facility"],["facilityType","Type"],["city","City"],["area","Area"],["address","Address"],["contactPerson","Contact person"],["phone","Contact number"],["services","Services"]],
  seller:   [["business","Business"],["type","Type"],["city","City"],["area","Area"],["address","Address"],["phone","Contact number"],["hours","Opening hours"]],
};

function ProfilePreview({ type, data }) {
  const meta = PROFILE_META[type];
  const Icon = meta.icon;
  const img = data.photo || data.logo;
  const head = data.fullName || data.facilityName || data.business || "Your name";
  const sub = type === "doctor" ? data.specialty : type === "employer" ? data.facilityType : type === "seller" ? data.type : data.jobTitle;
  const rows = (PREVIEW_LABELS[type] || []).filter(([k]) => fieldFilled(data[k]));
  return (
    <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
      <div className="h-16" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}CC)` }} />
      <div className="px-4 pb-4">
        <div className="w-16 h-16 -mt-8 rounded-2xl overflow-hidden flex items-center justify-center bg-white" style={{ border: "3px solid #fff", boxShadow: "0 2px 8px rgba(16,24,40,.12)" }}>
          {img ? <img src={img} alt="" className="w-full h-full object-cover" /> : <Icon className="w-7 h-7" style={{ color: meta.color }} />}
        </div>
        <p className="text-[18px] font-extrabold mt-2" style={{ color: INK, letterSpacing: "-0.02em" }}>{head}</p>
        {sub && <p className="text-[13px] font-semibold" style={{ color: meta.color }}>{sub}</p>}

        <div className="mt-3 rounded-xl" style={{ border: `1px solid ${CARD_BORDER}` }}>
          {rows.map(([k, label], i) => (
            <div key={k} className="flex gap-3 px-3 py-2.5" style={{ borderTop: i ? `1px solid ${CARD_BORDER}` : "none" }}>
              <span className="text-[12.5px] w-[38%] shrink-0" style={{ color: SUBTLE }}>{label}</span>
              <span className="text-[13px] font-semibold flex-1 min-w-0 break-words" style={{ color: INK }}>{String(data[k])}</span>
            </div>
          ))}
        </div>

        {type === "doctor" && (data.education || []).some((e) => e.degree || e.institute) && (
          <>
            <p className="text-[13.5px] font-bold mt-3.5 mb-1.5" style={{ color: INK }}>Education</p>
            {data.education.filter((e) => e.degree || e.institute).map((e, i) => (
              <p key={i} className="text-[12.5px]" style={{ color: INK_2 }}>{[e.degree, e.institute, e.year].filter(Boolean).join(" · ")}</p>
            ))}
          </>
        )}
        {type === "doctor" && (data.postings || []).some((e) => e.role || e.place) && (
          <>
            <p className="text-[13.5px] font-bold mt-3 mb-1.5" style={{ color: INK }}>Clinical experience</p>
            {data.postings.filter((e) => e.role || e.place).map((e, i) => (
              <p key={i} className="text-[12.5px]" style={{ color: INK_2 }}>{[e.role, e.place, e.period].filter(Boolean).join(" · ")}</p>
            ))}
          </>
        )}
        {data.about && (
          <>
            <p className="text-[13.5px] font-bold mt-3 mb-1" style={{ color: INK }}>About</p>
            <p className="text-[13px] leading-relaxed" style={{ color: INK_2 }}>{data.about}</p>
          </>
        )}
      </div>
    </div>
  );
}

function ChangeNumberSheet({ current, onVerified, onClose }) {
  const [step, setStep] = useState("number");   // number | code | done
  const [num, setNum] = useState("");
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const digits = num.replace(/\D/g, "");
  const validNum = /^03\d{9}$/.test(digits) && digits !== String(current || "").replace(/\D/g, "");
  const send = () => { if (validNum) { setErr(""); setStep("code"); } };
  const verify = () => {
    if (code === "123456") { onVerified(num.trim()); setStep("done"); }
    else setErr("That code isn't right. Check the WhatsApp message and try again.");
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl px-5 pt-4 pb-6" style={{ fontFamily: FONT }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[16px] font-bold" style={{ color: INK }}>Change WhatsApp number</p>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>

        {step === "number" && (
          <>
            <p className="text-[13px] leading-snug mb-3" style={{ color: SUBTLE }}>
              Your WhatsApp number is how you sign in. We'll send a code to the new number to confirm it's yours.
            </p>
            <div className="rounded-xl px-3 py-2.5 mb-3 flex items-center gap-2" style={{ backgroundColor: CREAM }}>
              <span className="text-[12.5px]" style={{ color: SUBTLE }}>Current</span>
              <span className="text-[13.5px] font-semibold flex-1" style={{ color: INK }}>{current}</span>
              <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: GREEN }}><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
            </div>
            <PFLabel req color={BRAND}>New WhatsApp number</PFLabel>
            <input value={num} onChange={(e) => setNum(e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
            {num && !validNum && <p className="text-[12px] mt-1.5" style={{ color: RED }}>Enter an 11-digit mobile number starting with 03, different from your current one.</p>}
            <button onClick={send} disabled={!validNum} className="w-full mt-4 h-12 rounded-xl text-[14.5px] font-bold text-white transition-opacity"
              style={{ backgroundColor: BRAND, opacity: validNum ? 1 : 0.4 }}>Send code on WhatsApp</button>
          </>
        )}

        {step === "code" && (
          <>
            <p className="text-[13px] leading-snug mb-3" style={{ color: SUBTLE }}>
              Enter the 6-digit code sent to <b style={{ color: INK }}>{num}</b> on WhatsApp.
            </p>
            <input value={code} onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setErr(""); }}
              placeholder="••••••" inputMode="numeric" className={PF_INPUT_CLS + " text-center tracking-[0.5em] text-[20px] font-bold"} style={PF_INPUT_STYLE} />
            {err && <p className="text-[12px] mt-1.5" style={{ color: RED }}>{err}</p>}
            <p className="text-[11.5px] mt-2" style={{ color: FAINT }}>Demo code: 123456</p>
            <button onClick={verify} disabled={code.length !== 6} className="w-full mt-4 h-12 rounded-xl text-[14.5px] font-bold text-white transition-opacity"
              style={{ backgroundColor: BRAND, opacity: code.length === 6 ? 1 : 0.4 }}>Verify and change</button>
            <button onClick={() => { setStep("number"); setCode(""); }} className="w-full mt-2 h-10 text-[13px] font-semibold" style={{ color: BRAND }}>Use a different number</button>
          </>
        )}

        {step === "done" && (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: GREEN_TINT }}>
              <Check className="w-7 h-7" strokeWidth={3} style={{ color: GREEN }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color: INK }}>Number changed</p>
            <p className="text-[13px] mt-1 leading-snug" style={{ color: SUBTLE }}>
              You'll sign in with {num} from now on. We've sent a notice to your old number in case this wasn't you.
            </p>
            <button onClick={onClose} className="mt-5 px-6 h-11 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>Done</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileEditorScreen({ type, data, onChange, onBack, onMenu, known = {}, saved, onSave, verifiedPhone, onPhoneChanged }) {
  const meta = PROFILE_META[type];
  const Icon = meta.icon;
  const pct = profileCompletion(type, data);
  const unlocked = pct >= GATE_THRESHOLD;
  const photoRef = useRef(null);
  const galRef = useRef(null);

  const set = (k, v) => onChange({ ...data, [k]: v });
  const setRow = (key, i, f, v) => set(key, data[key].map((r, idx) => (idx === i ? { ...r, [f]: v } : r)));
  const addRow = (key, empty) => set(key, [...data[key], { ...empty }]);
  const delRow = (key, i) => set(key, data[key].length > 1 ? data[key].filter((_, x) => x !== i) : data[key]);
  const toggleArr = (k, v) => set(k, (data[k] || []).includes(v) ? data[k].filter((x) => x !== v) : [...(data[k] || []), v]);

  const compress = (file, cb) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1000, sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL("image/jpeg", 0.72));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };
  const pickPhoto = (e, key) => {
    const f = e.target.files && e.target.files[0]; e.target.value = "";
    if (f && f.type.startsWith("image/")) compress(f, (d) => set(key, d));
  };
  const pickGallery = (e) => {
    const files = Array.from(e.target.files || []); e.target.value = "";
    const room = 6 - (data.photos || []).length;
    files.slice(0, Math.max(0, room)).forEach((f) => {
      if (!f.type.startsWith("image/")) return;
      compress(f, (d) => onChange((prev) => ({ ...prev, photos: [...(prev.photos || []), d] })));
    });
  };

  const [view, setView] = useState("edit");   // edit | preview | done
  const [changingPhone, setChangingPhone] = useState(false);
  const isLive = !!saved;
  const dirty = isLive && JSON.stringify(saved) !== JSON.stringify(data);

  const inputCls = PF_INPUT_CLS;
  const inputStyle = PF_INPUT_STYLE;
  const L = ({ children, req }) => <PFLabel req={req} color={meta.color}>{children}</PFLabel>;
  const Card = PFCard;
  const Pick = (props) => <PFPick {...props} color={meta.color} />;

  if (view === "done") {
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader title={meta.label} onBack={onBack} onMenu={onMenu} />
        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: GREEN_TINT }}>
            <Check className="w-8 h-8" strokeWidth={3} style={{ color: GREEN }} />
          </div>
          <p className="text-[19px] font-extrabold" style={{ color: INK }}>Profile saved</p>
          <p className="text-[13.5px] mt-1.5 leading-snug max-w-[290px]" style={{ color: SUBTLE }}>
            {pct >= GATE_THRESHOLD
              ? (type === "employer" ? "Your facility is now listed in Find a Hospital, and you can offer jobs."
                : type === "doctor" ? "You can now apply for jobs and appear in Find a Doctor if you chose to be listed."
                : type === "seller" ? "You can now list items and services on the Market."
                : "You can now apply for jobs.")
              : `Saved. Reach ${GATE_THRESHOLD}% to unlock full access.`}
          </p>
          <button onClick={onBack} className="mt-5 px-6 h-12 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>Done</button>
          <button onClick={() => setView("edit")} className="mt-2 px-6 h-11 text-[13.5px] font-semibold" style={{ color: BRAND }}>Keep editing</button>
        </div>
      </div>
    );
  }

  if (view === "preview") {
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader title="Preview" subtitle="This is how others will see you" onBack={() => setView("edit")} onMenu={onMenu} />
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          <ProfilePreview type={type} data={data} />
          {pct < GATE_THRESHOLD && (
            <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: AMBER_TINT }}>
              <p className="text-[12.5px] leading-snug" style={{ color: AMBER }}>
                This profile is at {pct}%. You can save it now, but it needs {GATE_THRESHOLD}% to unlock full access.
              </p>
            </div>
          )}
        </div>
        <div className="px-3 py-3 shrink-0 flex gap-2 bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          <button onClick={() => setView("edit")} className="px-5 h-12 rounded-xl text-[14px] font-bold" style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}>Edit</button>
          <button onClick={() => { onSave(data); setView("done"); }} className="flex-1 h-12 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>
            Save profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader
        title={meta.label}
        subtitle={unlocked ? "Unlocked" : `${GATE_THRESHOLD - pct}% to unlock`}
        onBack={onBack}
        onMenu={onMenu}
        right={<CompletionRing value={pct} size={40} stroke={4} color={meta.color} />}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">

        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={(e) => pickPhoto(e, type === "employer" || type === "seller" ? "logo" : "photo")} />
        <input ref={galRef} type="file" accept="image/*" multiple className="hidden" onChange={pickGallery} />

        {/* photo / logo */}
        <Card>
          <div className="flex items-center gap-3.5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: meta.tint }}>
              {(data.photo || data.logo)
                ? <img src={data.photo || data.logo} alt="" className="w-full h-full object-cover" />
                : <Icon className="w-6 h-6" style={{ color: meta.color }} />}
            </div>
            <div className="flex-1">
              <p className="text-[13px] font-semibold" style={{ color: INK }}>
                {type === "employer" || type === "seller" ? "Logo" : "Profile photo"}
              </p>
              <p className="text-[11.5px] mb-1.5" style={{ color: SUBTLE }}>Optional</p>
              <button onClick={() => photoRef.current?.click()} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: meta.color, color: "white" }}>
                {(data.photo || data.logo) ? "Replace" : "Add"}
              </button>
            </div>
          </div>
        </Card>

        {/* ---------- GENERAL ---------- */}
        {type === "general" && (
          <>
            <Card>
              <L req>Full name</L>
              <input value={data.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Your full name" className={inputCls} style={inputStyle} />
              <div className="mt-3"><L req>Job title</L>
                <Pick options={JOB_TITLES.filter((t) => t !== "Other")} value={data.jobTitle} onPick={(v) => set("jobTitle", v)} />
                <input value={JOB_TITLES.includes(data.jobTitle) ? "" : data.jobTitle} onChange={(e) => set("jobTitle", e.target.value)}
                  placeholder="Or type your own job title" className={inputCls + " mt-2"} style={inputStyle} />
              </div>
              <div className="mt-3"><L req>City</L><Pick options={CITIES} value={data.city} onPick={(v) => set("city", v)} /></div>
              <div className="mt-3"><L>Town / road</L>
                <input value={data.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Susan Road" className={inputCls} style={inputStyle} />
              </div>
            </Card>
            <Card>
              <L req>WhatsApp number</L>
              {verifiedPhone ? (
                <div className="flex items-center gap-2 rounded-xl px-3.5 py-3" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
                  <span className="text-[14.5px] font-semibold flex-1" style={{ color: INK }}>{verifiedPhone}</span>
                  <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: GREEN }}><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>
                  <button onClick={() => setChangingPhone(true)} className="text-[12.5px] font-bold ml-1" style={{ color: BRAND }}>Change</button>
                </div>
              ) : (
                <input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={inputCls} style={inputStyle} />
              )}
              <div className="mt-3"><L>Email</L>
                <input value={data.email} onChange={(e) => set("email", e.target.value)} placeholder="you@example.com" className={inputCls} style={inputStyle} />
              </div>
            </Card>
          </>
        )}

        {/* ---------- DOCTOR ---------- */}
        {type === "doctor" && (
          <>
            <Card>
              <L req>Full name</L>
              <input value={data.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Dr. Full Name" className={inputCls} style={inputStyle} />
              <AutoFill hint={known.fullName} current={data.fullName} onUse={(v) => set("fullName", v)} />
              <div className="mt-3"><L req>PMDC registration number</L>
                <input value={data.pmdc} onChange={(e) => set("pmdc", e.target.value)} placeholder="PMC-00000-X" className={inputCls} style={inputStyle} />
              </div>
              <div className="mt-3"><L>Council registration</L>
                <Pick options={REGISTRATIONS} value={data.registrations} onPick={(v) => toggleArr("registrations", v)} multi />
              </div>
            </Card>

            <Card>
              <L req>Speciality</L>
              <Pick options={DOCTOR_SPECIALTIES} value={data.specialty} onPick={(v) => set("specialty", v)} />
              <div className="mt-3"><L>Sub-speciality / focus</L>
                <input value={data.subSpecialty} onChange={(e) => set("subSpecialty", e.target.value)} placeholder="e.g. Interventional Cardiology" className={inputCls} style={inputStyle} />
              </div>
            </Card>

            {/* education */}
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Education <span style={{ color: meta.color }}>*</span></p>
              <span className="text-[11px]" style={{ color: SUBTLE }}>Medical college onwards</span>
            </div>
            <Card>
              {data.education.map((e, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < data.education.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11.5px] font-semibold" style={{ color: SUBTLE }}>
                      {i === 0 ? "Primary medical degree" : `Qualification ${i + 1}`}
                    </span>
                    {data.education.length > 1 && <button onClick={() => delRow("education", i)}><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>}
                  </div>
                  <Pick options={MED_DEGREES} value={e.degree} onPick={(v) => setRow("education", i, "degree", v)} />
                  <input value={e.institute} onChange={(ev) => setRow("education", i, "institute", ev.target.value)}
                    placeholder="College or university" className={inputCls + " mt-2"} style={inputStyle} />
                  <input value={e.year} onChange={(ev) => setRow("education", i, "year", ev.target.value)}
                    placeholder="Year completed" inputMode="numeric" className={inputCls + " mt-2"} style={inputStyle} />
                </div>
              ))}
              <button onClick={() => addRow("education", EMPTY_EDU_ROW)} className="text-[13px] font-semibold" style={{ color: meta.color }}>+ Add qualification</button>
            </Card>

            {/* clinical postings */}
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Clinical experience <span style={{ color: meta.color }}>*</span></p>
              <span className="text-[11px]" style={{ color: SUBTLE }}>Most recent first</span>
            </div>
            <Card>
              {data.postings.map((e, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < data.postings.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11.5px] font-semibold" style={{ color: SUBTLE }}>Posting {i + 1}</span>
                    {data.postings.length > 1 && <button onClick={() => delRow("postings", i)}><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>}
                  </div>
                  <input value={e.role} onChange={(ev) => setRow("postings", i, "role", ev.target.value)} placeholder="Role — e.g. House Officer, Medical Officer" className={inputCls} style={inputStyle} />
                  <input value={e.place} onChange={(ev) => setRow("postings", i, "place", ev.target.value)} placeholder="Hospital / department" className={inputCls + " mt-2"} style={inputStyle} />
                  <input value={e.period} onChange={(ev) => setRow("postings", i, "period", ev.target.value)} placeholder="Period — e.g. 2022 – present" className={inputCls + " mt-2"} style={inputStyle} />
                </div>
              ))}
              <button onClick={() => addRow("postings", EMPTY_POST_ROW)} className="text-[13px] font-semibold" style={{ color: meta.color }}>+ Add posting</button>
            </Card>

            <Card>
              <L req>City</L><Pick options={CITIES} value={data.city} onPick={(v) => set("city", v)} />
              <div className="mt-3"><L>Town / road</L>
                <input value={data.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Jail Road" className={inputCls} style={inputStyle} />
              </div>
              <div className="mt-3"><L>Clinic or hospital</L>
                <input value={data.clinic} onChange={(e) => set("clinic", e.target.value)} placeholder="Where you practise" className={inputCls} style={inputStyle} />
              </div>
              <div className="flex gap-2.5 mt-3">
                <div className="flex-1"><L>Consultation fee</L>
                  <input value={data.fee} onChange={(e) => set("fee", e.target.value.replace(/[^0-9,]/g, ""))} placeholder="PKR 1,500" inputMode="numeric" className={inputCls} style={inputStyle} />
                </div>
                <div className="flex-1"><L>Availability</L>
                  <input value={data.availability} onChange={(e) => set("availability", e.target.value)} placeholder="e.g. Evenings" className={inputCls} style={inputStyle} />
                </div>
              </div>
            </Card>

            <Card>
              <p className="text-[14px] font-bold mb-2.5" style={{ color: INK, letterSpacing: "-0.01em" }}>Visibility</p>
              {[["listOnDirectory", "List me on the doctor directory", "Patients can find and book you"],
                ["openToJobs", "Open to job offers", "Employers can see you when you apply"]].map(([k, label, sub]) => (
                <button key={k} onClick={() => set(k, !data[k])} className="w-full flex items-center gap-3 py-2.5">
                  <span className="w-12 h-7 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
                    style={{ backgroundColor: data[k] ? GREEN : "#D3D9EC", justifyContent: data[k] ? "flex-end" : "flex-start" }}>
                    <span className="w-6 h-6 rounded-full bg-white block" />
                  </span>
                  <span className="flex-1 text-left">
                    <span className="block text-[13.5px] font-medium" style={{ color: INK }}>{label}</span>
                    <span className="block text-[11.5px]" style={{ color: SUBTLE }}>{sub}</span>
                  </span>
                </button>
              ))}
            </Card>
          </>
        )}

        {/* ---------- EMPLOYER ---------- */}
        {type === "employer" && (
          <>
            <Card>
              <L req>Facility name</L>
              <input value={data.facilityName} onChange={(e) => set("facilityName", e.target.value)} placeholder="e.g. Aga Care Hospital" className={inputCls} style={inputStyle} />
              <div className="mt-3"><L req>Facility type</L>
                <Pick options={FACILITY_TYPES.map((f) => f.label)} value={data.facilityType} onPick={(v) => set("facilityType", v)} />
              </div>
            </Card>
            <Card>
              <L req>City</L><Pick options={CITIES} value={data.city} onPick={(v) => set("city", v)} />
              <div className="mt-3"><L>Town / road</L>
                <input value={data.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Jail Road" className={inputCls} style={inputStyle} />
              </div>
              <div className="mt-3"><L req>Full address</L>
                <input value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Building, road, landmark" className={inputCls} style={inputStyle} />
              </div>
            </Card>
            <Card>
              <L req>Contact person</L>
              <input value={data.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Name or department (e.g. HR)" className={inputCls} style={inputStyle} />
              <AutoFill hint={known.fullName} current={data.contactPerson} onUse={(v) => set("contactPerson", v)} />
              <div className="mt-3"><L req>Contact number</L>
                <input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={inputCls} style={inputStyle} />
              </div>
            </Card>
            <Card>
              <L>Photos of the facility</L>
              <button onClick={() => galRef.current?.click()} className="w-full rounded-xl py-3 flex items-center justify-center gap-2 mb-2.5" style={{ backgroundColor: meta.tint }}>
                <Camera className="w-5 h-5" style={{ color: meta.color }} />
                <span className="text-[13px] font-semibold" style={{ color: meta.color }}>Add photos</span>
              </button>
              {(data.photos || []).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {data.photos.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => set("photos", data.photos.filter((_, x) => x !== i))}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,.55)" }}>
                        <X className="w-3 h-3 text-white" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}

        {/* ---------- SELLER ---------- */}
        {type === "seller" && (
          <>
            <Card>
              <L req>Business name</L>
              <input value={data.business} onChange={(e) => set("business", e.target.value)} placeholder="e.g. Al-Noor Surgical" className={inputCls} style={inputStyle} />
              <div className="mt-3"><L req>Business type</L>
                <Pick options={SELLER_TYPES} value={data.type} onPick={(v) => set("type", v)} />
              </div>
            </Card>
            <Card>
              <L req>City</L><Pick options={CITIES} value={data.city} onPick={(v) => set("city", v)} />
              <div className="mt-3"><L>Town / road</L>
                <input value={data.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Jail Road" className={inputCls} style={inputStyle} />
              </div>
              <div className="mt-3"><L req>Full address</L>
                <input value={data.address} onChange={(e) => set("address", e.target.value)} placeholder="Shop number, plaza, landmark" className={inputCls} style={inputStyle} />
              </div>
            </Card>
            <Card>
              <L req>Contact number</L>
              <input value={data.phone} onChange={(e) => set("phone", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={inputCls} style={inputStyle} />
              <button onClick={() => set("showPhone", !data.showPhone)} className="w-full flex items-center gap-3 mt-3">
                <span className="w-12 h-7 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
                  style={{ backgroundColor: data.showPhone ? GREEN : "#D3D9EC", justifyContent: data.showPhone ? "flex-end" : "flex-start" }}>
                  <span className="w-6 h-6 rounded-full bg-white block" />
                </span>
                <span className="text-[13px] text-left flex-1" style={{ color: "#4B4A45" }}>Show my number on listings</span>
              </button>
              <div className="mt-3"><L>Opening hours</L>
                <input value={data.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Mon–Sat, 10 AM – 8 PM" className={inputCls} style={inputStyle} />
              </div>
            </Card>
          </>
        )}

        {/* about — every profile */}
        <Card>
          <L>About</L>
          <textarea value={data.about} onChange={(e) => set("about", e.target.value)} rows={4}
            placeholder="Describe yourself or your business in a few lines. Optional."
            className="w-full text-[14.5px] rounded-xl px-3.5 py-3 outline-none resize-none" style={inputStyle} />
        </Card>

        <p className="text-[12px] text-center px-4" style={{ color: SUBTLE }}>
          {!isLive ? "Draft — kept safe as you type, but not live until you save."
            : dirty ? "You have unsaved changes. Your live profile hasn't changed yet."
            : "Live — this is what others see."}
        </p>
      </div>

      {changingPhone && (
        <ChangeNumberSheet current={verifiedPhone} onClose={() => setChangingPhone(false)}
          onVerified={(n) => { onPhoneChanged && onPhoneChanged(n); onChange({ ...data, phone: n }); }} />
      )}

      <div className="px-3 py-3 shrink-0 bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <button onClick={() => setView("preview")} className="w-full h-12 rounded-xl text-[14.5px] font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: BRAND }}>
          Review &amp; save <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function ProfileHubScreen({ onBack, onMenu, profiles, onOpenProfile, username, onOpenPanel, savedProfiles = {} }) {
  const order = ["general", "doctor", "employer", "seller"];
  const scores = Object.fromEntries(order.map((k) => [k, profileCompletion(k, profiles[k])]));
  // what's actually live = the saved version
  const liveScores = Object.fromEntries(order.map((k) => [k, savedProfiles[k] ? profileCompletion(k, savedProfiles[k]) : 0]));
  const name = profiles.general.fullName || "Your name";
  const overall = scores.general;

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Profile" subtitle="Choose what you're here to do" onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">

        {/* identity */}
        <div className="rounded-2xl p-4 flex items-center gap-3.5 mb-3" style={{ background: "linear-gradient(135deg,#1B3A6B,#2C5490)", boxShadow: SOFT_SHADOW }}>
          <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#FFFFFF22" }}>
            {profiles.general.photo
              ? <img src={profiles.general.photo} alt="" className="w-full h-full object-cover" />
              : <UserRound className="w-6 h-6 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[16px] text-white truncate">{name}</p>
            <p className="text-[12.5px] text-white/70 truncate">@{username}</p>
            <p className="text-[11.5px] text-white/60 mt-0.5">Verified on WhatsApp</p>
          </div>
          <CompletionRing value={overall} size={48} stroke={4.5} color="#8FB4E8" />
        </div>

        {/* always-free note */}
        <div className="rounded-2xl p-3.5 mb-4" style={{ backgroundColor: TEAL_TINT }}>
          <p className="text-[12.5px] font-bold mb-1" style={{ color: TEAL }}>Open to everyone, no profile needed</p>
          <p className="text-[12.5px] leading-relaxed" style={{ color: "#3C5C5B" }}>
            News feed · Doctor directory · CV builder · Job post card maker
          </p>
        </div>

        <p className="text-[14px] font-bold mb-2" style={{ color: INK, letterSpacing: "-0.01em" }}>Your profiles</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
          {order.map((k) => {
            const meta = PROFILE_META[k];
            const Icon = meta.icon;
            const pct = scores[k];
            const unlocked = liveScores[k] >= GATE_THRESHOLD;
            const hasDraft = !savedProfiles[k] ? pct > 0 : JSON.stringify(savedProfiles[k]) !== JSON.stringify(profiles[k]);
            return (
              <button
                key={k}
                onClick={() => onOpenProfile(k)}
                className="w-full rounded-2xl bg-white p-4 flex items-center gap-3.5 text-left active:scale-[0.99] transition-transform"
                style={{ border: `1px solid ${unlocked ? meta.color + "55" : CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: meta.tint }}>
                  <Icon className="w-5 h-5" style={{ color: meta.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[14.5px] font-semibold" style={{ color: INK }}>{meta.label}</p>
                    {k === "general" && (
                      <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ color: NAVY, backgroundColor: NAVY_TINT }}>DEFAULT</span>
                    )}
                  </div>
                  <p className="text-[11.5px] mt-0.5 leading-snug" style={{ color: SUBTLE }}>{meta.blurb}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ color: unlocked ? GREEN : SUBTLE, backgroundColor: unlocked ? GREEN_TINT : "#EFF2FA" }}
                    >
                      {unlocked ? (hasDraft ? "Live · unsaved changes" : "Live") : hasDraft ? (pct >= GATE_THRESHOLD ? "Draft · save to go live" : `Draft · ${GATE_THRESHOLD - pct}% to unlock`) : `${GATE_THRESHOLD - pct}% to unlock`}
                    </span>
                  </div>
                </div>
                <CompletionRing value={pct} size={44} stroke={4} color={meta.color} />
              </button>
            );
          })}
        </div>

        {/* unlocked panels */}
        {(liveScores.doctor >= GATE_THRESHOLD || liveScores.employer >= GATE_THRESHOLD || liveScores.seller >= GATE_THRESHOLD) && (
          <>
            <p className="text-[14px] font-bold mb-2 mt-4" style={{ color: INK, letterSpacing: "-0.01em" }}>Your panels</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
              {[
                liveScores.doctor >= GATE_THRESHOLD && { key: "physicianPanel", label: "Physician Panel", sub: "Practice locations, timings and fees", icon: Stethoscope, color: "#B3202C", tint: RED_TINT },
                liveScores.employer >= GATE_THRESHOLD && { key: "employerPanel", label: "Employer Panel", sub: "Your job posts, stats and institute profile", icon: Briefcase, color: TEAL, tint: TEAL_TINT },
                liveScores.seller >= GATE_THRESHOLD && { key: "seller", label: "Business Panel", sub: "Manage your listings and enquiries", icon: Store, color: VIOLET, tint: VIOLET_TINT },
              ].filter(Boolean).map((pn) => (
                <button key={pn.key} onClick={() => onOpenPanel(pn.key)}
                  className="w-full rounded-2xl bg-white p-3.5 flex items-center gap-3.5 text-left active:scale-[0.99] transition-transform"
                  style={{ border: `1px solid ${pn.color}44`, boxShadow: SOFT_SHADOW }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: pn.tint }}>
                    <pn.icon className="w-5 h-5" style={{ color: pn.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14.5px] font-semibold" style={{ color: INK }}>{pn.label}</p>
                    <p className="text-[11.5px] mt-0.5" style={{ color: SUBTLE }}>{pn.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
                </button>
              ))}
            </div>
          </>
        )}

        <div className="rounded-2xl p-4 mt-4" style={{ backgroundColor: AMBER_TINT }}>
          <p className="text-[12.5px] font-bold mb-1.5" style={{ color: AMBER }}>What {GATE_THRESHOLD}% unlocks</p>
          <div className="flex flex-col gap-1">
            <p className="text-[12.5px]" style={{ color: "#6B4B22" }}>• Employer Profile → post jobs</p>
            <p className="text-[12.5px]" style={{ color: "#6B4B22" }}>• Doctor or General Profile → apply for jobs</p>
            <p className="text-[12.5px]" style={{ color: "#6B4B22" }}>• Business Profile → sell on the Market</p>
          </div>
        </div>
      </div>
    </div>
  );
}


/* ---------- CV TEMPLATES ---------- */
const CV_TEMPLATES = [
  // ---- classic single column ----
  { id: "t1",  name: "Classic Serif",   family: "single",  accent: "#1B3A6B", font: "Georgia, 'Times New Roman', serif", align: "left", rule: "solid", caps: false, photo: false },
  { id: "t2",  name: "Clean Slate",     family: "single",  accent: "#14161A", font: "system-ui, -apple-system, sans-serif", align: "left", rule: "hair", caps: true, photo: false },
  { id: "t3",  name: "Navy Rule",       family: "single",  accent: "#1B3A6B", font: "system-ui, sans-serif", align: "left", rule: "thick", caps: true, photo: false },
  { id: "t4",  name: "Centered Formal", family: "single",  accent: "#2E2E2E", font: "Georgia, serif", align: "center", rule: "double", caps: false, photo: false },
  { id: "t5",  name: "Editorial",       family: "single",  accent: "#0F4C3A", font: "Georgia, serif", align: "left", rule: "hair", caps: false, photo: false },
  { id: "t6",  name: "Accent Bar",      family: "single",  accent: "#B3202C", font: "system-ui, sans-serif", align: "left", rule: "bar", caps: true, photo: false },
  { id: "t7",  name: "Monoline",        family: "single",  accent: "#3A3A3A", font: "'Courier New', monospace", align: "left", rule: "hair", caps: true, photo: false },

  // ---- coloured sidebar with photo ----
  { id: "t8",  name: "Navy Sidebar",    family: "sidebar", accent: "#1B3A6B", sidebarBg: "#1B3A6B", sidebarText: "#FFFFFF", font: "system-ui, sans-serif", rule: "hair", caps: true, photo: true },
  { id: "t9",  name: "Forest Sidebar",  family: "sidebar", accent: "#1F5130", sidebarBg: "#1F5130", sidebarText: "#FFFFFF", font: "system-ui, sans-serif", rule: "hair", caps: false, photo: true },
  { id: "t10", name: "Charcoal Sidebar",family: "sidebar", accent: "#14161A", sidebarBg: "#1F2226", sidebarText: "#FFFFFF", font: "Helvetica, Arial, sans-serif", rule: "none", caps: true, photo: true },
  { id: "t11", name: "Soft Grey Panel", family: "sidebar", accent: "#2E3440", sidebarBg: "#EEF0F3", sidebarText: "#2E3440", font: "system-ui, sans-serif", rule: "hair", caps: false, photo: true },

  // ---- date-column timeline ----
  { id: "t12", name: "Timeline Navy",   family: "datecol", accent: "#1B3A6B", font: "system-ui, sans-serif", rule: "hair", caps: false, photo: false },
  { id: "t13", name: "Timeline Serif",  family: "datecol", accent: "#2E2E2E", font: "Georgia, serif", rule: "hair", caps: false, photo: false },

  // ---- header card ----
  { id: "t14", name: "Header Card",     family: "headcard", accent: "#1B3A6B", cardBg: "#1B3A6B", font: "system-ui, sans-serif", rule: "hair", caps: true, photo: true },
  { id: "t15", name: "Header Card Red", family: "headcard", accent: "#B3202C", cardBg: "#B3202C", font: "system-ui, sans-serif", rule: "hair", caps: true, photo: true },
];

const EMPTY_EDU  = { degree: "", institute: "", year: "", detail: "" };
const EMPTY_EXP  = { title: "", org: "", period: "", detail: "" };
const EMPTY_RES  = { title: "", journal: "", year: "" };
const EMPTY_ACH  = { title: "", year: "" };

const SKILL_OPTIONS = [
  "ACLS", "BLS", "PALS", "ATLS", "Emergency Triage", "Ventilator Management",
  "Central Line Insertion", "Intubation", "Ultrasound (POCUS)", "ECG Interpretation",
  "Wound Management", "Suturing", "Patient Counselling", "EMR / HMIS", "Research & Audit",
  "Infection Control", "Team Leadership", "Teaching & Supervision",
];

function cvCompletion(cv) {
  const checks = [
    cv.fullName, cv.yearOfBirth, cv.phone, cv.email, cv.city, cv.title, cv.about,
    cv.education.some((e) => e.degree && e.institute) ? "y" : "",
    cv.experience.some((e) => e.title && e.org) ? "y" : "",
    cv.skills.length ? "y" : "",
    cv.research.some((r) => r.title) ? "y" : "",
    cv.achievements.some((a) => a.title) ? "y" : "",
  ];
  const done = checks.filter((c) => String(c).trim()).length;
  return Math.round((done / checks.length) * 100);
}

/* ---------- RENDERED CV (used for preview + print) ---------- */
function CVDocument({ cv, tpl, scale = 1 }) {
  const A = tpl.accent;
  const S = (n) => n * scale;

  const Sec = ({ children, color }) => (
    <p style={{
      fontSize: S(10.5), fontWeight: 700,
      letterSpacing: tpl.caps ? "0.09em" : "0.02em",
      textTransform: tpl.caps ? "uppercase" : "none",
      color: color || A, marginBottom: S(5),
      borderBottom: tpl.rule === "hair" ? `1px solid ${(color || A)}33` : tpl.rule === "solid" ? `1px solid ${color || A}` : tpl.rule === "thick" ? `2px solid ${color || A}` : tpl.rule === "double" ? `3px double ${color || A}` : "none",
      paddingBottom: tpl.rule === "none" ? 0 : S(3),
      paddingLeft: tpl.rule === "bar" ? S(7) : 0,
      borderLeft: tpl.rule === "bar" ? `3px solid ${color || A}` : "none",
    }}>{children}</p>
  );

  const eduList = cv.education.filter((e) => e.degree || e.institute);
  const expList = cv.experience.filter((e) => e.title || e.org);
  const resList = cv.research.filter((r) => r.title);
  const achList = cv.achievements.filter((a) => a.title);

  const Photo = ({ size, round = true }) => (
    cv.photo ? (
      <img src={cv.photo} alt="" style={{ width: S(size), height: S(size), objectFit: "cover", borderRadius: round ? "50%" : S(4), display: "block" }} />
    ) : (
      <div style={{ width: S(size), height: S(size), borderRadius: round ? "50%" : S(4), background: "#D8DCE6", display: "flex", alignItems: "center", justifyContent: "center", color: "#8A90A0", fontSize: S(size * 0.34), fontWeight: 700 }}>
        {(cv.fullName || "?").replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
    )
  );

  const contactLine = [cv.yearOfBirth && `b. ${cv.yearOfBirth}`, cv.phone, cv.email, cv.city].filter(Boolean);

  /* ---- shared blocks ---- */
  const AboutBlock = cv.about ? (
    <div style={{ marginBottom: S(11) }}>
      <Sec>About</Sec>
      <p style={{ fontSize: S(10), color: "#333", lineHeight: 1.55 }}>{cv.about}</p>
    </div>
  ) : null;

  const EduBlock = eduList.length ? (
    <div style={{ marginBottom: S(11) }}>
      <Sec>Education</Sec>
      {eduList.map((e, i) => (
        <div key={i} style={{ marginBottom: S(6) }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: S(8) }}>
            <p style={{ fontSize: S(10.5), fontWeight: 700, color: "#1a1a1a" }}>{e.degree}</p>
            <p style={{ fontSize: S(9.5), color: "#777", whiteSpace: "nowrap" }}>{e.year}</p>
          </div>
          <p style={{ fontSize: S(10), color: "#555" }}>{e.institute}</p>
          {e.detail && <p style={{ fontSize: S(9.5), color: "#777", marginTop: S(1) }}>{e.detail}</p>}
        </div>
      ))}
    </div>
  ) : null;

  const ExpBlock = expList.length ? (
    <div style={{ marginBottom: S(11) }}>
      <Sec>Work Experience</Sec>
      {expList.map((e, i) => (
        <div key={i} style={{ marginBottom: S(6) }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: S(8) }}>
            <p style={{ fontSize: S(10.5), fontWeight: 700, color: "#1a1a1a" }}>{e.title}</p>
            <p style={{ fontSize: S(9.5), color: "#777", whiteSpace: "nowrap" }}>{e.period}</p>
          </div>
          <p style={{ fontSize: S(10), color: "#555" }}>{e.org}</p>
          {e.detail && <p style={{ fontSize: S(9.5), color: "#777", marginTop: S(1), lineHeight: 1.5 }}>{e.detail}</p>}
        </div>
      ))}
    </div>
  ) : null;

  const ResBlock = resList.length ? (
    <div style={{ marginBottom: S(11) }}>
      <Sec>Research & Publications</Sec>
      {resList.map((r, i) => (
        <p key={i} style={{ fontSize: S(10), color: "#333", marginBottom: S(3), lineHeight: 1.5 }}>
          {r.title}{r.journal ? `, ${r.journal}` : ""}{r.year ? ` (${r.year})` : ""}
        </p>
      ))}
    </div>
  ) : null;

  const AchBlock = achList.length ? (
    <div style={{ marginBottom: S(11) }}>
      <Sec>Achievements</Sec>
      {achList.map((a, i) => (
        <p key={i} style={{ fontSize: S(10), color: "#333", marginBottom: S(3) }}>
          {a.title}{a.year ? ` — ${a.year}` : ""}
        </p>
      ))}
    </div>
  ) : null;

  const SkillsInline = cv.skills.length ? (
    <div style={{ marginBottom: S(11) }}>
      <Sec>Skills</Sec>
      <p style={{ fontSize: S(10), color: "#333", lineHeight: 1.6 }}>{cv.skills.join("  ·  ")}</p>
    </div>
  ) : null;

  /* ================= FAMILY: SIDEBAR ================= */
  if (tpl.family === "sidebar") {
    const onDark = tpl.sidebarText === "#FFFFFF";
    const sideLabel = { fontSize: S(10), fontWeight: 700, textTransform: tpl.caps ? "uppercase" : "none", letterSpacing: "0.07em", color: tpl.sidebarText, marginBottom: S(4), marginTop: S(10), borderBottom: `1px solid ${onDark ? "#FFFFFF44" : A + "33"}`, paddingBottom: S(2.5) };
    const sideText = { fontSize: S(9), color: onDark ? "#FFFFFFCC" : "#4A5060", lineHeight: 1.5, marginBottom: S(2) };
    return (
      <div style={{ fontFamily: tpl.font, background: "white", color: "#222", display: "flex", minHeight: S(300) }}>
        <div style={{ width: "33%", background: tpl.sidebarBg, padding: S(14), color: tpl.sidebarText }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: S(8) }}><Photo size={62} /></div>
          <p style={{ fontSize: S(13), fontWeight: 700, textAlign: "center", lineHeight: 1.2, color: tpl.sidebarText }}>{cv.fullName || "Your Name"}</p>
          {cv.title && <p style={{ fontSize: S(9), textAlign: "center", color: onDark ? "#FFFFFFAA" : "#5A6070", marginTop: S(2) }}>{cv.title}</p>}
          <p style={sideLabel}>Contact</p>
          {cv.phone && <p style={sideText}>{cv.phone}</p>}
          {cv.email && <p style={{ ...sideText, wordBreak: "break-all" }}>{cv.email}</p>}
          {cv.city && <p style={sideText}>{cv.city}</p>}
          {cv.yearOfBirth && <p style={sideText}>Born {cv.yearOfBirth}</p>}
          {cv.pmdc && <p style={sideText}>PMDC {cv.pmdc}</p>}
          {cv.skills.length > 0 && (
            <>
              <p style={sideLabel}>Skills</p>
              {cv.skills.map((s, i) => <p key={i} style={sideText}>· {s}</p>)}
            </>
          )}
        </div>
        <div style={{ flex: 1, padding: S(16) }}>
          {AboutBlock}{ExpBlock}{EduBlock}{ResBlock}{AchBlock}
        </div>
      </div>
    );
  }

  /* ================= FAMILY: DATE COLUMN ================= */
  if (tpl.family === "datecol") {
    const Row = ({ date, title, sub, detail }) => (
      <div style={{ display: "flex", gap: S(10), marginBottom: S(7) }}>
        <p style={{ width: "26%", fontSize: S(9), color: "#888", flexShrink: 0, lineHeight: 1.4 }}>{date}</p>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: S(10.5), fontWeight: 700, color: "#1a1a1a" }}>{title}</p>
          <p style={{ fontSize: S(10), color: "#555" }}>{sub}</p>
          {detail && <p style={{ fontSize: S(9.5), color: "#777", marginTop: S(1.5), lineHeight: 1.5 }}>· {detail}</p>}
        </div>
      </div>
    );
    return (
      <div style={{ fontFamily: tpl.font, background: "white", padding: S(22), color: "#222" }}>
        <p style={{ fontSize: S(22), fontWeight: 700, color: A, lineHeight: 1.1 }}>{cv.fullName || "Your Name"}</p>
        {cv.title && <p style={{ fontSize: S(11), color: "#555", marginTop: S(2) }}>{cv.title}</p>}
        <p style={{ fontSize: S(9.5), color: "#666", marginTop: S(5), lineHeight: 1.5 }}>{contactLine.join("  ·  ")}</p>
        {cv.pmdc && <p style={{ fontSize: S(9.5), color: "#666" }}>PMDC: {cv.pmdc}</p>}
        <div style={{ height: 1, background: A + "33", margin: `${S(12)}px 0` }} />
        {cv.about && (
          <div style={{ marginBottom: S(12) }}>
            <Sec>Profile</Sec>
            <p style={{ fontSize: S(10), color: "#333", lineHeight: 1.55 }}>{cv.about}</p>
          </div>
        )}
        {expList.length > 0 && (
          <div style={{ marginBottom: S(12) }}>
            <Sec>Career</Sec>
            {expList.map((e, i) => <Row key={i} date={e.period} title={e.title} sub={e.org} detail={e.detail} />)}
          </div>
        )}
        {eduList.length > 0 && (
          <div style={{ marginBottom: S(12) }}>
            <Sec>Education</Sec>
            {eduList.map((e, i) => <Row key={i} date={e.year} title={e.degree} sub={e.institute} detail={e.detail} />)}
          </div>
        )}
        {SkillsInline}
        {resList.length > 0 && (
          <div style={{ marginBottom: S(12) }}>
            <Sec>Research</Sec>
            {resList.map((r, i) => <Row key={i} date={r.year} title={r.title} sub={r.journal} />)}
          </div>
        )}
        {achList.length > 0 && (
          <div>
            <Sec>Achievements</Sec>
            {achList.map((a, i) => <Row key={i} date={a.year} title={a.title} sub="" />)}
          </div>
        )}
      </div>
    );
  }

  /* ================= FAMILY: HEADER CARD ================= */
  if (tpl.family === "headcard") {
    return (
      <div style={{ fontFamily: tpl.font, background: "white", color: "#222" }}>
        <div style={{ background: tpl.cardBg, padding: S(16), display: "flex", alignItems: "center", gap: S(12) }}>
          <Photo size={58} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: S(18), fontWeight: 700, color: "white", lineHeight: 1.15 }}>{cv.fullName || "Your Name"}</p>
            {cv.title && <p style={{ fontSize: S(10), color: "#FFFFFFCC", marginTop: S(2) }}>{cv.title}</p>}
            <p style={{ fontSize: S(8.5), color: "#FFFFFFAA", marginTop: S(4), lineHeight: 1.5 }}>{contactLine.join("  ·  ")}</p>
            {cv.pmdc && <p style={{ fontSize: S(8.5), color: "#FFFFFFAA" }}>PMDC: {cv.pmdc}</p>}
          </div>
        </div>
        <div style={{ padding: S(18) }}>
          {AboutBlock}
          <div style={{ display: "flex", gap: S(14) }}>
            <div style={{ flex: 1.35 }}>{ExpBlock}{EduBlock}</div>
            <div style={{ flex: 1 }}>{SkillsInline}{ResBlock}{AchBlock}</div>
          </div>
        </div>
      </div>
    );
  }

  /* ================= FAMILY: SINGLE ================= */
  return (
    <div style={{ fontFamily: tpl.font, background: "white", padding: S(22), color: "#222" }}>
      <div style={{ textAlign: tpl.align, marginBottom: S(12) }}>
        <p style={{ fontSize: S(20), fontWeight: 700, color: A, lineHeight: 1.15 }}>{cv.fullName || "Your Name"}</p>
        {cv.title && <p style={{ fontSize: S(11), color: "#444", marginTop: S(2) }}>{cv.title}</p>}
        <p style={{ fontSize: S(9.5), color: "#666", marginTop: S(4), lineHeight: 1.5 }}>{contactLine.join("  ·  ")}</p>
        {cv.pmdc && <p style={{ fontSize: S(9.5), color: "#666", marginTop: S(1) }}>PMDC: {cv.pmdc}</p>}
      </div>
      {AboutBlock}{EduBlock}{ExpBlock}{SkillsInline}{ResBlock}{AchBlock}
    </div>
  );
}

const CV_INPUT_STYLE = { backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` };

/* =========================================================
   AUTOFILL — reuse anything the user already told us
   ========================================================= */
function firstFilled(...vals) {
  for (const v of vals) if (v !== undefined && v !== null && String(v).trim()) return String(v).trim();
  return "";
}

/* Builds a map of canonical fields -> { value, from } from everything
   the user has already entered anywhere in the app. Nothing is ever
   written automatically; these are offered as one-tap suggestions. */
function buildKnown(profiles = {}, cvDoc = {}) {
  const g = profiles.general || {};
  const d = profiles.doctor || {};
  const e = profiles.employer || {};
  const sl = profiles.seller || {};
  const cv = (cvDoc && cvDoc.cv) || {};

  const pick = (label, ...pairs) => {
    for (const [val, from] of pairs) {
      if (val !== undefined && val !== null && String(val).trim()) return { value: String(val).trim(), from };
    }
    return null;
  };

  return {
    fullName:      pick("name",  [g.fullName, "General profile"], [d.fullName, "Doctor profile"], [cv.fullName, "your CV"]),
    phone:         pick("phone", [g.phone, "General profile"], [cv.phone, "your CV"], [d.phone, "Doctor profile"]),
    email:         pick("email", [g.email, "General profile"], [cv.email, "your CV"]),
    city:          pick("city",  [g.city, "General profile"], [d.city, "Doctor profile"], [cv.city, "your CV"]),
    area:          pick("area",  [g.area, "General profile"], [d.area, "Doctor profile"]),
    jobTitle:      pick("title", [g.jobTitle, "General profile"], [cv.title, "your CV"]),
    pmdc:          pick("pmdc",  [d.pmdc, "Doctor profile"], [cv.pmdc, "your CV"]),
    specialty:     pick("speciality", [d.specialty, "Doctor profile"]),
    about:         pick("about", [g.about, "General profile"], [cv.about, "your CV"], [d.about, "Doctor profile"]),
    photo:         pick("photo", [g.photo, "General profile"], [d.photo, "Doctor profile"], [cv.photo, "your CV"]),

    facilityName:  pick("facility", [e.facilityName, "Employer profile"]),
    facilityType:  pick("facility type", [e.facilityType, "Employer profile"]),
    facilityCity:  pick("city", [e.city, "Employer profile"], [g.city, "General profile"]),
    facilityArea:  pick("area", [e.area, "Employer profile"], [g.area, "General profile"]),
    contactPerson: pick("contact", [e.contactPerson, "Employer profile"], [g.fullName, "General profile"]),
    facilityPhone: pick("phone", [e.phone, "Employer profile"], [g.phone, "General profile"]),

    businessName:  pick("business", [sl.business, "Business profile"]),
    businessType:  pick("business type", [sl.type, "Business profile"]),
    businessCity:  pick("city", [sl.city, "Business profile"], [g.city, "General profile"]),
    businessArea:  pick("area", [sl.area, "Business profile"], [g.area, "General profile"]),
    businessAddr:  pick("address", [sl.address, "Business profile"]),
    businessPhone: pick("phone", [sl.phone, "Business profile"], [g.phone, "General profile"]),
    businessHours: pick("hours", [sl.hours, "Business profile"]),
  };
}

/* one-tap suggestion shown under an empty field */
function AutoFill({ hint, current, onUse }) {
  if (!hint || !hint.value) return null;
  if (String(current || "").trim()) return null;
  return (
    <button
      onClick={() => onUse(hint.value)}
      className="mt-1.5 w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left active:scale-[0.98] transition-transform"
      style={{ backgroundColor: TEAL_TINT, border: `1px dashed ${TEAL}66` }}
    >
      <span className="text-[13px] font-bold shrink-0" style={{ color: TEAL }}>+</span>
      <span className="text-[12.5px] flex-1 min-w-0 truncate" style={{ color: "#3C5C5B" }}>
        Use <strong>{hint.value}</strong>
      </span>
      <span className="text-[10.5px] shrink-0" style={{ color: TEAL }}>from {hint.from}</span>
    </button>
  );
}

/* fill-everything banner shown at the top of a form */
function AutoFillAll({ pairs, onApply, label = "Use my saved details" }) {
  const usable = pairs.filter((p) => p.hint && p.hint.value && !String(p.current || "").trim());
  if (usable.length === 0) return null;
  const sources = [...new Set(usable.map((p) => p.hint.from))];
  return (
    <button
      onClick={() => usable.forEach((p) => p.set(p.hint.value))}
      className="w-full rounded-2xl p-3.5 flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform"
      style={{ backgroundColor: TEAL_TINT, border: `1.5px dashed ${TEAL}66` }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "white" }}>
        <Check className="w-4 h-4" strokeWidth={3} style={{ color: TEAL }} />
      </div>
      <div className="flex-1 text-left min-w-0">
        <p className="text-[13.5px] font-semibold" style={{ color: TEAL }}>{label}</p>
        <p className="text-[11.5px] mt-0.5 truncate" style={{ color: "#3C5C5B" }}>
          Fill {usable.length} field{usable.length > 1 ? "s" : ""} from {sources.join(" and ")}
        </p>
      </div>
      <span className="text-[11.5px] font-bold shrink-0" style={{ color: TEAL }}>Fill</span>
    </button>
  );
}

function CVField({ label, value, onChange, ph, rows, req, hint }) {
  return (
    <div className="mb-3">
      <label className="text-[13px] font-semibold" style={{ color: INK_2 }}>
        {label} {req && <span style={{ color: RED }}>*</span>}
      </label>
      {rows ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={rows}
          className="w-full mt-1 text-[14.5px] rounded-xl px-3.5 py-2.5 outline-none resize-none" style={CV_INPUT_STYLE} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph}
          className="w-full mt-1 text-[14.5px] rounded-xl px-3.5 py-2.5 outline-none" style={CV_INPUT_STYLE} />
      )}
      <AutoFill hint={hint} current={value} onUse={onChange} />
    </div>
  );
}

function CVRowInput({ value, onChange, ph, rows }) {
  return rows ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph} rows={rows}
      className="w-full text-[12.5px] rounded-lg px-3 py-2 outline-none resize-none mb-1.5" style={CV_INPUT_STYLE} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={ph}
      className="w-full text-[12.5px] rounded-lg px-3 py-2 outline-none mb-1.5" style={CV_INPUT_STYLE} />
  );
}

/* ---------- CV SCREEN ---------- */
function CVScreen({ onBack, cvDoc, setCvDoc, known = {} }) {
  const [mode, setMode] = useState(null);        // null | upload | create
  const [step, setStep] = useState("form");      // form | template | preview
  const [uploadError, setUploadError] = useState("");
  const [downloadNote, setDownloadNote] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const printRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const photoInputRef = useRef(null);

  const { uploaded, savedInApp, tplId, cv } = cvDoc;
  const publicCV = !!cvDoc.publicCV;
  const setPublicCV = (v) => setCvDoc((p) => ({ ...p, publicCV: v }));
  const setUploaded = (v) => setCvDoc((p) => ({ ...p, uploaded: v }));
  const setSavedInApp = (v) => setCvDoc((p) => ({ ...p, savedInApp: v }));
  const setTplId = (v) => setCvDoc((p) => ({ ...p, tplId: v }));
  const setCv = (updater) => setCvDoc((p) => ({ ...p, cv: typeof updater === "function" ? updater(p.cv) : updater }));

  const handlePhotoPick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setCv((c) => ({ ...c, photo: reader.result }));
    reader.readAsDataURL(f);
    setSavedInApp(false);
  };

  const handleFilePick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const okTypes = [".pdf", ".doc", ".docx"];
    const isImage = f.type.startsWith("image/");
    const nameOk = okTypes.some((t) => f.name.toLowerCase().endsWith(t));
    if (!nameOk && !isImage) {
      setUploadError("Unsupported file type. Please choose a PDF, DOC or DOCX file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setUploadError("File is larger than 5 MB. Please compress it and try again.");
      return;
    }
    setUploadError("");
    const kb = f.size / 1024;
    setUploaded({ name: f.name, size: kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB` });
  };

  const tpl = CV_TEMPLATES.find((t) => t.id === tplId);
  const completion = cvCompletion(cv);
  const set = (k, v) => { setCv((p) => ({ ...p, [k]: v })); setSavedInApp(false); };
  const setRow = (key, i, field, v) => set(key, cv[key].map((r, idx) => (idx === i ? { ...r, [field]: v } : r)));
  const addRow = (key, empty) => set(key, [...cv[key], { ...empty }]);
  const delRow = (key, i) => set(key, cv[key].length > 1 ? cv[key].filter((_, idx) => idx !== i) : cv[key]);
  const toggleSkill = (s) => set("skills", cv.skills.includes(s) ? cv.skills.filter((x) => x !== s) : [...cv.skills, s]);

  const downloadPdf = () => {
    const html = printRef.current ? printRef.current.innerHTML : "";
    if (!html) return;
    const w = window.open("", "_blank");
    if (!w) {
      setDownloadNote("Pop-ups are blocked. Allow pop-ups for this site, then tap Download again.");
      return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8">
      <title>${(cv.fullName || "CV").replace(/[<>]/g, "")} — CV</title>
      <style>
        @page { size: A4; margin: 12mm; }
        html,body { margin:0; padding:0; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        img { max-width:100%; }
      </style></head><body>${html}</body></html>`);
    w.document.close();
    setDownloadNote("Print dialog opened — choose \u201cSave as PDF\u201d as the destination.");
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
  };

  const hasActiveCV = !!(uploaded || savedInApp);

  const headerTitle =
    mode === "upload" ? "Upload CV"
    : mode === "active" ? "Active CV"
    : mode === "create" ? (step === "form" ? "Create CV" : step === "template" ? "Choose Layout" : "Preview")
    : "CV / Resume";

  const headerBack = () => {
    setConfirmRemove(false);
    if (mode === "create" && step === "preview") return setStep("template");
    if (mode === "create" && step === "template") return setStep("form");
    if (mode) return setMode(null);
    onBack();
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader
        title={headerTitle}
        subtitle={mode === "create" && step === "form" ? `${completion}% complete` : undefined}
        onBack={headerBack}
        right={mode === "create" && step === "form" ? <CompletionRing value={completion} size={40} stroke={4} color={BRAND} /> : null}
      />

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 pb-4">
        {!mode && (
          <>
            <button onClick={() => setMode("upload")} className="w-full rounded-2xl bg-white p-4 flex items-center gap-3.5 mb-2.5 active:scale-[0.98] transition-transform" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF0F8" }}><Upload className="w-5 h-5" style={{ color: NAVY }} /></div>
              <div className="flex-1 text-left"><p className="text-[15px] font-semibold" style={{ color: INK }}>Upload</p><p className="text-[12.5px] mt-0.5" style={{ color: SUBTLE }}>Already have a CV? Upload a PDF or Word file</p></div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
            </button>
            <button onClick={() => { setMode("create"); setStep("form"); }} className="w-full rounded-2xl bg-white p-4 flex items-center gap-3.5 active:scale-[0.98] transition-transform" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF0F8" }}><Pencil className="w-5 h-5" style={{ color: NAVY }} /></div>
              <div className="flex-1 text-left"><p className="text-[15px] font-semibold" style={{ color: INK }}>Create</p><p className="text-[12.5px] mt-0.5" style={{ color: SUBTLE }}>Build a PakMed CV — choose a layout and download</p></div>
              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
            </button>

            {/* ---- Active CV dock tab ---- */}
            <button
              onClick={() => hasActiveCV && setMode("active")}
              className="w-full rounded-2xl bg-white p-4 flex items-center gap-3.5 mt-2.5 active:scale-[0.98] transition-transform text-left"
              style={{ border: `1.5px solid ${hasActiveCV ? GREEN : "#E9C4C7"}` }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: hasActiveCV ? GREEN_TINT : "#FBEBEC" }}>
                {hasActiveCV
                  ? <Check className="w-6 h-6" strokeWidth={3.2} style={{ color: GREEN }} />
                  : <X className="w-6 h-6" strokeWidth={3.2} style={{ color: RED }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-semibold" style={{ color: INK }}>Active CV</p>
                <p className="text-[11.5px] mt-0.5 truncate" style={{ color: hasActiveCV ? SUBTLE : RED }}>
                  {hasActiveCV
                    ? (uploaded ? `${uploaded.name} · ${uploaded.size}` : `${cv.fullName} — ${tpl.name} layout`)
                    : "No CV in your dock — upload or create one"}
                </p>
              </div>
              {hasActiveCV && <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />}
            </button>
          </>
        )}

        {shareOpen && (
          <ShareSheet card={{ id: "cv", title: `${cv.fullName} — CV` }} onClose={() => setShareOpen(false)} />
        )}

        {/* ---- active CV viewer ---- */}
        {mode === "active" && (
          <>
            <div className="rounded-2xl bg-white p-4 flex items-center gap-3 mb-3" style={{ border: `1.5px solid ${GREEN}` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GREEN_TINT }}>
                <Check className="w-5 h-5" strokeWidth={3.2} style={{ color: GREEN }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-semibold truncate" style={{ color: INK }}>
                  {uploaded ? uploaded.name : `${cv.fullName} — PakMed CV`}
                </p>
                <p className="text-[11.5px]" style={{ color: SUBTLE }}>
                  {uploaded ? `Uploaded file · ${uploaded.size}` : `Built in app · ${tpl.name} layout`}
                </p>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>Active</span>
            </div>

            {uploaded ? (
              <div className="rounded-2xl bg-white p-8 flex flex-col items-center text-center mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <FileText className="w-10 h-10 mb-3" style={{ color: NAVY }} />
                <p className="text-[13px] font-semibold" style={{ color: INK }}>{uploaded.name}</p>
                <p className="text-[11.5px] mt-1" style={{ color: SUBTLE }}>
                  Uploaded documents are stored as-is and sent with your applications.
                </p>
              </div>
            ) : (
              <>
                <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Preview</p>
                <div className="rounded-xl overflow-hidden mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                  <div ref={printRef}>
                    <CVDocument cv={cv} tpl={tpl} scale={1} />
                  </div>
                </div>
                <div className="flex gap-2.5 mb-2.5">
                  <button onClick={() => { setMode("create"); setStep("form"); }} className="flex-1 py-3 rounded-full font-semibold text-[13px] flex items-center justify-center gap-1.5" style={{ backgroundColor: "#EFF2FA", color: INK }}>
                    <Pencil className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={downloadPdf} className="flex-1 py-3 rounded-full font-semibold text-[13px] flex items-center justify-center gap-1.5" style={{ backgroundColor: "white", color: NAVY, border: `1.5px solid ${NAVY}` }}>
                    <Upload className="w-4 h-4" style={{ transform: "rotate(180deg)" }} /> Download
                  </button>
                </div>
                {downloadNote && (
                  <p className="text-[11.5px] text-center mb-2.5 px-2 py-2 rounded-xl" style={{ color: NAVY, backgroundColor: "#EAF0F8" }}>{downloadNote}</p>
                )}
              </>
            )}

            {!confirmRemove ? (
              <button
                onClick={() => setConfirmRemove(true)}
                className="w-full py-3 rounded-full font-semibold text-[13px] flex items-center justify-center gap-1.5"
                style={{ backgroundColor: "#FBEBEC", color: RED }}
              >
                <X className="w-4 h-4" /> Remove from dock
              </button>
            ) : (
              <div className="rounded-2xl p-4" style={{ backgroundColor: "#FBEBEC" }}>
                <p className="text-[12.5px] font-semibold mb-1" style={{ color: RED }}>Remove this CV?</p>
                <p className="text-[11.5px] mb-3" style={{ color: "#8A4045" }}>
                  It will no longer attach to your applications. {uploaded ? "You'll need to upload the file again." : "Your saved details stay in the form so you can re-save anytime."}
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmRemove(false)} className="flex-1 py-2.5 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: "white", color: INK }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => { setUploaded(null); setSavedInApp(false); setConfirmRemove(false); setDownloadNote(""); setMode(null); }}
                    className="flex-1 py-2.5 rounded-full text-[12.5px] font-semibold"
                    style={{ backgroundColor: RED, color: "white" }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ---- upload ---- */}
        {mode === "upload" && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={handleFilePick}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFilePick}
            />

            <div className="rounded-2xl bg-white p-6 flex flex-col items-center text-center mb-3" style={{ border: `1.5px dashed ${CARD_BORDER}` }}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3" style={{ backgroundColor: "#EAF0F8" }}><Upload className="w-6 h-6" style={{ color: NAVY }} /></div>
              <p className="text-[15px] font-semibold" style={{ color: INK }}>Upload your CV</p>
              <p className="text-[12px] mt-1" style={{ color: SUBTLE }}>PDF, DOC or DOCX · Max 5 MB</p>
            </div>

            <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Choose source</p>
            <div className="rounded-2xl bg-white overflow-hidden mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
              {[
                { icon: FileText, label: "Files", sub: "iCloud Drive, On My iPhone, Google Drive, Downloads", act: () => fileInputRef.current?.click() },
                { icon: Camera,   label: "Scan a document", sub: "Use your camera to capture a printed CV", act: () => cameraInputRef.current?.click() },
                { icon: Upload,   label: "Browse device", sub: "Desktop, Documents or any local folder", act: () => fileInputRef.current?.click() },
              ].map((o, i, arr) => (
                <div key={o.label}>
                  <button onClick={o.act} className="w-full flex items-center gap-3 p-3.5 text-left active:opacity-70">
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#EAF0F8" }}>
                      <o.icon className="w-4 h-4" style={{ color: NAVY }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13.5px] font-semibold" style={{ color: INK }}>{o.label}</p>
                      <p className="text-[11px] mt-0.5 truncate" style={{ color: SUBTLE }}>{o.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
                  </button>
                  {i < arr.length - 1 && <div className="h-px ml-[62px]" style={{ backgroundColor: CARD_BORDER }} />}
                </div>
              ))}
            </div>

            {uploadError && (
              <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ backgroundColor: "#FBEBEC" }}>
                <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: RED }} />
                <p className="text-[12px]" style={{ color: RED }}>{uploadError}</p>
              </div>
            )}

            {uploaded && (
              <div className="rounded-2xl bg-white p-4 flex items-center gap-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <FileText className="w-5 h-5 shrink-0" style={{ color: NAVY }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold truncate" style={{ color: INK }}>{uploaded.name}</p>
                  <p className="text-[11px]" style={{ color: SUBTLE }}>{uploaded.size} · uploaded just now</p>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full mr-1" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>Active</span>
                <button onClick={() => setUploaded(null)} aria-label="Remove"><X className="w-4 h-4" style={{ color: SUBTLE }} /></button>
              </div>
            )}

            <p className="text-[11px] leading-snug mt-3 px-1" style={{ color: SUBTLE }}>
              Your CV is only shared with hospitals you apply to. You can replace or remove it at any time.
            </p>
          </>
        )}

        {/* ---- create: form ---- */}
        {mode === "create" && step === "form" && (
          <>

            {/* 01 personal */}
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>01 · Personal Details</p>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <input ref={photoInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoPick} />
              <div className="flex items-center gap-3.5 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: "#E6EAF3" }}>
                  {cv.photo
                    ? <img src={cv.photo} alt="" className="w-full h-full object-cover" />
                    : <Camera className="w-5 h-5" style={{ color: SUBTLE }} />}
                </div>
                <div className="flex-1">
                  <p className="text-[12.5px] font-semibold" style={{ color: INK }}>Profile photo</p>
                  <p className="text-[11px] mb-1.5" style={{ color: SUBTLE }}>Optional — used by photo layouts</p>
                  <div className="flex gap-2">
                    <button onClick={() => photoInputRef.current?.click()} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: NAVY, color: "white" }}>
                      {cv.photo ? "Replace" : "Add photo"}
                    </button>
                    {cv.photo && (
                      <button onClick={() => setCv((c) => ({ ...c, photo: null }))} className="text-[11.5px] font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: "#EFF2FA", color: INK }}>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <AutoFillAll
                pairs={[
                  { hint: known.fullName, current: cv.fullName, set: (v) => set("fullName", v) },
                  { hint: known.phone,    current: cv.phone,    set: (v) => set("phone", v) },
                  { hint: known.email,    current: cv.email,    set: (v) => set("email", v) },
                  { hint: known.city,     current: cv.city,     set: (v) => set("city", v) },
                  { hint: known.jobTitle, current: cv.title,    set: (v) => set("title", v) },
                  { hint: known.pmdc,     current: cv.pmdc,     set: (v) => set("pmdc", v) },
                  { hint: known.about,    current: cv.about,    set: (v) => set("about", v) },
                ]}
              />
              <CVField label="Full name" value={cv.fullName} onChange={(v) => set("fullName", v)} ph="Dr. Full Name" req hint={known.fullName} />
              <CVField label="Year of birth" value={cv.yearOfBirth} onChange={(v) => set("yearOfBirth", v)} ph="e.g. 1996" req />
              <CVField label="Contact number" value={cv.phone} onChange={(v) => set("phone", v)} ph="03XX XXXXXXX" req hint={known.phone} />
              <CVField label="Email" value={cv.email} onChange={(v) => set("email", v)} ph="you@example.com" hint={known.email} />
              <CVField label="City" value={cv.city} onChange={(v) => set("city", v)} ph="e.g. Karachi" hint={known.city} />
              <CVField label="Professional title" value={cv.title} onChange={(v) => set("title", v)} ph="e.g. Medical Officer — Emergency" hint={known.jobTitle} />
              <CVField label="PMDC registration" value={cv.pmdc} onChange={(v) => set("pmdc", v)} ph="PMC-00000-X" hint={known.pmdc} />
            </div>

            {/* 02 about */}
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>02 · About Myself</p>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <CVField label="Description" value={cv.about} onChange={(v) => set("about", v)} ph="Two or three lines about your practice, focus areas and what you're looking for..." rows={4} req hint={known.about} />
            </div>

            {/* 03 education */}
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>03 · Education <span style={{ color: RED }}>*</span></p>
              <span className="text-[10.5px]" style={{ color: SUBTLE }}>Most recent first</span>
            </div>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              {cv.education.map((e, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < cv.education.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: SUBTLE }}>Entry {i + 1}</span>
                    {cv.education.length > 1 && <button onClick={() => delRow("education", i)}><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>}
                  </div>
                  <CVRowInput value={e.degree} onChange={(v) => setRow("education", i, "degree", v)} ph="Degree — e.g. MBBS" />
                  <CVRowInput value={e.institute} onChange={(v) => setRow("education", i, "institute", v)} ph="Institute — e.g. Dow Medical College" />
                  <CVRowInput value={e.year} onChange={(v) => setRow("education", i, "year", v)} ph="Year — e.g. 2019" />
                  <CVRowInput value={e.detail} onChange={(v) => setRow("education", i, "detail", v)} ph="Optional detail — distinction, grade, thesis" />
                </div>
              ))}
              <button onClick={() => addRow("education", EMPTY_EDU)} className="text-[12.5px] font-semibold" style={{ color: NAVY }}>+ Add education</button>
            </div>

            {/* 04 experience */}
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>04 · Work Experience <span style={{ color: RED }}>*</span></p>
              <span className="text-[10.5px]" style={{ color: SUBTLE }}>Most recent first</span>
            </div>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              {cv.experience.map((e, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < cv.experience.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: SUBTLE }}>Entry {i + 1}</span>
                    {cv.experience.length > 1 && <button onClick={() => delRow("experience", i)}><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>}
                  </div>
                  <CVRowInput value={e.title} onChange={(v) => setRow("experience", i, "title", v)} ph="Job title — e.g. Medical Officer" />
                  <CVRowInput value={e.org} onChange={(v) => setRow("experience", i, "org", v)} ph="Organization / institute" />
                  <CVRowInput value={e.period} onChange={(v) => setRow("experience", i, "period", v)} ph="Period served — e.g. 2021 – present" />
                  <CVRowInput value={e.detail} onChange={(v) => setRow("experience", i, "detail", v)} ph="Key responsibilities (optional)" rows={2} />
                </div>
              ))}
              <button onClick={() => addRow("experience", EMPTY_EXP)} className="text-[12.5px] font-semibold" style={{ color: NAVY }}>+ Add experience</button>
            </div>

            {/* 05 skills */}
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>05 · Skills</p>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[11.5px] mb-2.5" style={{ color: SUBTLE }}>Tap to select — {cv.skills.length} chosen</p>
              <div className="flex flex-wrap gap-1.5">
                {SKILL_OPTIONS.map((s) => {
                  const on = cv.skills.includes(s);
                  return (
                    <button key={s} onClick={() => toggleSkill(s)} className="text-[11px] font-medium px-2.5 py-1.5 rounded-full transition-colors"
                      style={{ backgroundColor: on ? NAVY : "white", color: on ? "white" : INK, border: `1px solid ${on ? NAVY : CARD_BORDER}` }}>
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 06 research */}
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>06 · Research & Publications</p>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              {cv.research.map((r, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < cv.research.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: SUBTLE }}>Entry {i + 1}</span>
                    {cv.research.length > 1 && <button onClick={() => delRow("research", i)}><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>}
                  </div>
                  <CVRowInput value={r.title} onChange={(v) => setRow("research", i, "title", v)} ph="Paper / study title" />
                  <CVRowInput value={r.journal} onChange={(v) => setRow("research", i, "journal", v)} ph="Journal or conference" />
                  <CVRowInput value={r.year} onChange={(v) => setRow("research", i, "year", v)} ph="Year" />
                </div>
              ))}
              <button onClick={() => addRow("research", EMPTY_RES)} className="text-[12.5px] font-semibold" style={{ color: NAVY }}>+ Add research</button>
            </div>

            {/* 07 achievements */}
            <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>07 · Achievements</p>
            <div className="rounded-2xl bg-white p-4 mb-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              {cv.achievements.map((a, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < cv.achievements.length - 1 ? `1px solid ${CARD_BORDER}` : "none" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold" style={{ color: SUBTLE }}>Entry {i + 1}</span>
                    {cv.achievements.length > 1 && <button onClick={() => delRow("achievements", i)}><X className="w-3.5 h-3.5" style={{ color: SUBTLE }} /></button>}
                  </div>
                  <CVRowInput value={a.title} onChange={(v) => setRow("achievements", i, "title", v)} ph="Award, honour or distinction" />
                  <CVRowInput value={a.year} onChange={(v) => setRow("achievements", i, "year", v)} ph="Year" />
                </div>
              ))}
              <button onClick={() => addRow("achievements", EMPTY_ACH)} className="text-[12.5px] font-semibold" style={{ color: NAVY }}>+ Add achievement</button>
            </div>

            <button onClick={() => setStep("template")} className="w-full py-3.5 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2" style={{ backgroundColor: NAVY, color: "white" }}>
              Choose layout <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center mt-2" style={{ color: SUBTLE }}><span style={{ color: RED }}>*</span> marks key details hospitals look for first</p>
          </>
        )}

        {/* ---- create: templates ---- */}
        {mode === "create" && step === "template" && (
          <>
            <p className="text-[12.5px] mb-3" style={{ color: SUBTLE }}>Pick a layout — all are sober, minimal and print-ready.</p>
            <div className="grid grid-cols-2 gap-2.5">
              {CV_TEMPLATES.map((t) => {
                const on = t.id === tplId;
                return (
                  <button key={t.id} onClick={() => setTplId(t.id)} className="rounded-xl overflow-hidden text-left active:scale-[0.97] transition-transform"
                    style={{ border: `2px solid ${on ? t.accent : CARD_BORDER}`, backgroundColor: "white" }}>
                    <div style={{ height: 132, overflow: "hidden", position: "relative", background: "white", width: "100%" }}>
                      <div style={{ transform: "scale(0.36)", transformOrigin: "top left", width: 470, height: 380, pointerEvents: "none", position: "absolute", top: 0, left: 0 }}>
                        <CVDocument cv={cv} tpl={t} scale={1} />
                      </div>
                    </div>
                    <div className="px-2.5 py-2 flex items-center justify-between" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                      <span className="text-[11.5px] font-semibold" style={{ color: INK }}>{t.name}</span>
                      {on && <Check className="w-3.5 h-3.5" style={{ color: t.accent }} />}
                    </div>
                  </button>
                );
              })}
            </div>
            <button onClick={() => setStep("preview")} className="w-full mt-4 py-3.5 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2" style={{ backgroundColor: NAVY, color: "white" }}>
              Preview CV <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* ---- create: preview ---- */}
        {mode === "create" && step === "preview" && (
          <>
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>{tpl.name}</p>
              <button onClick={() => setStep("template")} className="text-[11.5px] font-semibold" style={{ color: NAVY }}>Change layout</button>
            </div>
            <div className="rounded-xl overflow-hidden mb-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <div ref={printRef}>
                <CVDocument cv={cv} tpl={tpl} scale={1} />
              </div>
            </div>
            <button onClick={() => setStep("form")} className="w-full py-3 rounded-full font-semibold text-[13px] flex items-center justify-center gap-1.5 mb-3" style={{ backgroundColor: "#EFF2FA", color: INK }}>
              <ArrowLeft className="w-4 h-4" /> Back to edit
            </button>

            {/* auto-save confirmation */}
            <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ backgroundColor: GREEN_TINT }}>
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
              <p className="text-[12px] leading-snug" style={{ color: GREEN }}>
                Saved automatically to your CV dock as <strong>{tpl.name}</strong>. Choose any of the options below as well.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>What next?</p>
              <div className="rounded-xl p-2.5 mb-1.5 flex items-start gap-2" style={{ backgroundColor: GREEN_TINT }}>
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                <p className="text-[11.5px] leading-snug" style={{ color: GREEN }}>
                  Saved to your job posts automatically. Choose any option below as well.
                </p>
              </div>

              <button onClick={downloadPdf} className="w-full flex items-center gap-3 py-3 active:opacity-70">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: NAVY_TINT }}>
                  <Upload className="w-5 h-5" style={{ color: NAVY, transform: "rotate(180deg)" }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14.5px] font-semibold" style={{ color: INK }}>Download</p>
                  <p className="text-[11.5px]" style={{ color: SUBTLE }}>Save a PDF copy to your device</p>
                </div>
              </button>

              <div className="h-px ml-[52px]" style={{ backgroundColor: CARD_BORDER }} />

              <button onClick={() => setShareOpen(true)} className="w-full flex items-center gap-3 py-3 active:opacity-70">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: VIOLET_TINT }}>
                  <Repeat2 className="w-5 h-5" style={{ color: VIOLET }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14.5px] font-semibold" style={{ color: INK }}>Share</p>
                  <p className="text-[11.5px]" style={{ color: SUBTLE }}>WhatsApp, Facebook, Instagram, TikTok</p>
                </div>
              </button>

              <div className="h-px ml-[52px]" style={{ backgroundColor: CARD_BORDER }} />

              <button onClick={() => setPublicCV(!publicCV)} className="w-full flex items-center gap-3 py-3 active:opacity-70">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: publicCV ? GREEN_TINT : TEAL_TINT }}>
                  {publicCV ? <Check className="w-5 h-5" strokeWidth={3} style={{ color: GREEN }} /> : <Eye className="w-5 h-5" style={{ color: TEAL }} />}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14.5px] font-semibold" style={{ color: INK }}>
                    {publicCV ? "Available to employers ✓" : "Make available to employers"}
                  </p>
                  <p className="text-[11.5px]" style={{ color: SUBTLE }}>
                    {publicCV ? "You appear in the employers' Available list" : "Let hospitals find you without applying"}
                  </p>
                </div>
                <span className="w-12 h-7 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
                  style={{ backgroundColor: publicCV ? GREEN : "#D3D9EC", justifyContent: publicCV ? "flex-end" : "flex-start" }}>
                  <span className="w-6 h-6 rounded-full bg-white block" />
                </span>
              </button>
            </div>

            {downloadNote && (
              <p className="text-[11.5px] text-center mt-2 px-2 py-2 rounded-xl" style={{ color: NAVY, backgroundColor: NAVY_TINT }}>{downloadNote}</p>
            )}

            {publicCV && (
              <div className="rounded-xl p-3 mt-2.5" style={{ backgroundColor: TEAL_TINT }}>
                <p className="text-[12px] leading-snug" style={{ color: "#3C5C5B" }}>
                  Employers can now see your name, title, city and CV in their <strong>Available</strong> list.
                  Your phone number stays hidden until you reply to them.
                </p>
              </div>
            )}

            <p className="text-[11px] text-center mt-2.5 leading-snug" style={{ color: SUBTLE }}>
              Download opens your device's print dialog — choose "Save as PDF".
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   POST A JOB — funnel
   ========================================================= */
const FACILITY_TYPES = [
  { key: "hospital",  label: "Hospital",            icon: Building2 },
  { key: "clinic",    label: "Clinic",              icon: Stethoscope },
  { key: "pharmacy",  label: "Pharmacy",            icon: Pill },
  { key: "lab",       label: "Diagnostic Lab",      icon: FlaskConical },
  { key: "college",   label: "Medical / Diploma College", icon: GraduationCap },
  { key: "surgical",  label: "Surgical Store",      icon: Scissors },
  { key: "biomedical",label: "Biomedical Equipment",icon: Wrench },
  { key: "other",     label: "Other",               icon: Plus },
];

const JOB_TITLES = [
  "Doctor", "Consultant", "Dentist", "Pharmacist", "Nurse", "LHV",
  "Operation Theatre Assistant", "Demonstrator", "Manager", "Receptionist",
  "Lab Technician", "Physiotherapist", "Medical Officer", "House Officer", "Other",
];

const SHIFTS = [
  { key: "morning", label: "Morning", icon: Sunrise, sub: "8 AM – 2 PM" },
  { key: "evening", label: "Evening", icon: Sunset,  sub: "2 PM – 8 PM" },
  { key: "night",   label: "Night",   icon: Moon,    sub: "8 PM – 8 AM" },
  { key: "oncall",  label: "On Call", icon: Phone, sub: "As needed" },
];

const PAY_UNITS = [
  { key: "month", label: "Per Month" },
  { key: "shift", label: "Per Shift" },
  { key: "visit", label: "Per Visit" },
  { key: "hour",  label: "Per Hour" },
  { key: "day",   label: "Per Day" },
];

const CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta",
  "Hyderabad", "Sialkot", "Gujranwala", "Bahawalpur", "Sukkur", "Larkana", "Nawabshah", "Mirpur Khas",
  "Abbottabad", "Mardan", "Mingora", "Kohat", "Dera Ismail Khan", "Mansehra", "Swat",
  "Rahim Yar Khan", "Sahiwal", "Okara", "Sheikhupura", "Gujrat", "Jhelum", "Sargodha", "Jhang",
  "Dera Ghazi Khan", "Kasur", "Vehari", "Wah Cantonment", "Muzaffarabad", "Mirpur", "Gilgit", "Skardu",
  "Gwadar", "Turbat", "Chitral", "Attock", "Chakwal", "Mianwali", "Khuzdar",
];

const COMMON_REQUIREMENTS = [
  "PMDC / PNC registered", "Fresh graduates welcome", "1+ year experience",
  "3+ years experience", "Male candidates", "Female candidates",
  "Local residents preferred", "Own transport", "Computer literate", "Urdu & English",
];

const CARD_TEMPLATES = [
  { id: "c1", name: "Navy",     bg: "linear-gradient(160deg,#1B3A6B,#0F2445)", fg: "#FFFFFF", chip: "#FFFFFF26", accent: "#8FB4E8" },
  { id: "c2", name: "Emerald",  bg: "linear-gradient(160deg,#1F5130,#0E2C1B)", fg: "#FFFFFF", chip: "#FFFFFF26", accent: "#8FD9AC" },
  { id: "c3", name: "Crimson",  bg: "linear-gradient(160deg,#B3202C,#6E1119)", fg: "#FFFFFF", chip: "#FFFFFF26", accent: "#F5A9AF" },
  { id: "c4", name: "Clean",    bg: "#FFFFFF",                                  fg: "#14161A", chip: "#EFF2FA", accent: "#1B3A6B", bordered: true },
  { id: "c5", name: "Sand",     bg: "linear-gradient(160deg,#F3EADA,#E4D5BC)", fg: "#3A2E1B", chip: "#00000012", accent: "#8A6A32" },
  { id: "c6", name: "Charcoal", bg: "linear-gradient(160deg,#22252B,#101215)", fg: "#FFFFFF", chip: "#FFFFFF1A", accent: "#E8A93D" },
];

const EMPTY_JOB = {
  facilityName: "", facilityType: "", facilityTypeLabel: "", city: "", area: "",
  jobTitle: "",
  shifts: [], startDate: "",
  payAmount: "", payUnit: "month", payUnitLabel: "Per Month",
  requirements: [], notes: "",
  contactName: "", contactNumber: "", showNumber: true,
  photos: [], coverIndex: 0,
  templateId: "c1",
};

/* ---------- the shareable post card ---------- */
function JobPostCard({ job, tpl, scale = 1 }) {
  const S = (n) => n * scale;
  const title = job.jobTitle || "Position";
  const shiftLabels = job.shifts;
  const unit = job.payUnitLabel || PAY_UNITS.find((u) => u.key === job.payUnit)?.label || "";
  const facType = FACILITY_TYPES.find((f) => f.label === job.facilityTypeLabel);

  return (
    <div style={{
      background: tpl.bg, color: tpl.fg, padding: S(20), borderRadius: S(16),
      border: tpl.bordered ? `1.5px solid #DDE1F0` : "none",
      fontFamily: "system-ui, -apple-system, sans-serif", aspectRatio: "4 / 5",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
    }}>
      <div>
        <p style={{ fontSize: S(10), fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: tpl.accent }}>
          We are hiring
        </p>
        <p style={{ fontSize: S(26), fontWeight: 800, lineHeight: 1.1, marginTop: S(6) }}>{title}</p>

        {job.photos && job.photos.length > 0 && (
          <div style={{ marginTop: S(10), borderRadius: S(10), overflow: "hidden", height: S(96) }}>
            <img src={job.photos[job.coverIndex] || job.photos[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          </div>
        )}

        {shiftLabels.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: S(5), marginTop: S(10) }}>
            {shiftLabels.map((l) => (
              <span key={l} style={{ fontSize: S(10.5), fontWeight: 600, padding: `${S(4)}px ${S(9)}px`, borderRadius: 999, background: tpl.chip }}>{l}</span>
            ))}
          </div>
        )}

        {job.payAmount && (
          <div style={{ marginTop: S(14) }}>
            <p style={{ fontSize: S(22), fontWeight: 800, color: tpl.accent, lineHeight: 1.1 }}>PKR {job.payAmount}</p>
            <p style={{ fontSize: S(11), opacity: 0.75 }}>{unit}</p>
          </div>
        )}

        {job.requirements.length > 0 && (
          <div style={{ marginTop: S(12) }}>
            {job.requirements.slice(0, 4).map((r) => (
              <p key={r} style={{ fontSize: S(11), opacity: 0.85, marginBottom: S(3) }}>• {r}</p>
            ))}
          </div>
        )}
      </div>

      <div style={{ borderTop: `1px solid ${tpl.fg}22`, paddingTop: S(12) }}>
        <p style={{ fontSize: S(14), fontWeight: 700, lineHeight: 1.2 }}>
          {facType && <Glyph icon={facType.icon} size={S(13)} color={tpl.accent} style={{ display: "inline-block", verticalAlign: "-2px", marginRight: S(5) }} />}{job.facilityName || "Your facility"}
        </p>
        <p style={{ fontSize: S(11), opacity: 0.75, marginTop: S(2) }}>
          {[job.area, job.city].filter(Boolean).join(", ") || "Location"}
        </p>
        {job.showNumber && job.contactNumber && (
          <p style={{ fontSize: S(11.5), fontWeight: 600, marginTop: S(6), color: tpl.accent }}><IconText icon={Phone} color={tpl.accent} size={S(12)}>{job.contactNumber}</IconText></p>
        )}
        {job.startDate && <p style={{ fontSize: S(10.5), opacity: 0.6, marginTop: S(4) }}>Starts {job.startDate}</p>}
        <p style={{ fontSize: S(9), opacity: 0.45, marginTop: S(8), letterSpacing: "0.08em" }}>POSTED VIA PAKMED</p>
      </div>
    </div>
  );
}

/* ---------- share sheet for a job card ---------- */
function JobShareSheet({ job, onClose, onShared }) {
  const [copied, setCopied] = useState(false);
  const title = job.jobTitle;
  const text = `We are hiring: ${title} at ${job.facilityName}, ${job.city}. PKR ${job.payAmount} ${job.payUnitLabel || ""}. Apply on PakMed.`;
  const url = `https://pakmed.app/job/${job.id || "new"}`;
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const open = (u) => { try { window.open(u, "_blank", "noopener"); } catch (e) {} onShared && onShared(); };
  const copy = () => {
    try { navigator.clipboard.writeText(`${text} ${url}`); } catch (e) {}
    setCopied(true); onShared && onShared();
    setTimeout(() => setCopied(false), 1800);
  };

  const opts = [
    { key: "wa", label: "WhatsApp", bg: "#25D366", icon: <BrandIcon d={ICON_PATHS.whatsapp} />, act: () => open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`) },
    { key: "fb", label: "Facebook", bg: "#1877F2", icon: <BrandIcon d={ICON_PATHS.facebook} />, act: () => open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`) },
    { key: "x",  label: "X",        bg: "#000000", icon: <BrandIcon d={ICON_PATHS.x} />,        act: () => open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`) },
    { key: "ig", label: "Instagram",bg: "linear-gradient(135deg,#F58529,#DD2A7B,#8134AF,#515BD4)", icon: <BrandIcon d={ICON_PATHS.instagram} />, act: copy },
    { key: "tt", label: "TikTok",   bg: "#000000", icon: <BrandIcon d={ICON_PATHS.tiktok} />,   act: copy },
    { key: "cp", label: "Copy Text",bg: "#EFF2FA", icon: <FileText className="w-5 h-5" style={{ color: INK }} />, act: copy },
  ];

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Share job post">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[420px] bg-white rounded-3xl flex flex-col auth-step" style={{ boxShadow: "0 30px 80px -20px rgba(16,24,40,0.45)", fontFamily: FONT }}>
        <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-1">
          <p className="font-extrabold text-[18px]" style={{ color: INK }}>Share job post</p>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-[#EEF1F5]" style={{ backgroundColor: CREAM }}>
            <X className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>
        <div className="px-5 pt-2 pb-6">
          <p className="text-[14px] mb-5 line-clamp-2" style={{ color: SUBTLE }}>{title} · {job.facilityName}</p>
          <div className="grid grid-cols-3 gap-y-5">
            {opts.map((o) => (
              <button key={o.key} type="button" onClick={o.act} className="flex flex-col items-center gap-2 rounded-2xl py-2 transition-colors hover:bg-[#F5F7FA]">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: o.bg, border: o.key === "cp" ? `1px solid ${CARD_BORDER}` : "none" }}>
                  {o.icon}
                </div>
                <span className="text-[11.5px] font-medium" style={{ color: INK }}>{o.label}</span>
              </button>
            ))}
          </div>
          <div className="mt-5 flex items-center gap-2 p-1.5 pl-3.5 rounded-xl" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
            <span className="flex-1 min-w-0 truncate text-[13.5px]" style={{ color: INK_2 }}>{url}</span>
            <button type="button" onClick={copy} className="h-9 px-3.5 rounded-lg text-[13px] font-bold text-white shrink-0" style={{ backgroundColor: copied ? GREEN : BRAND }}>
              {copied ? "Copied" : "Copy link"}
            </button>
          </div>
          <p className="text-[11px] text-center mt-3 leading-snug" style={{ color: SUBTLE }}>
            To post the card as an image, take a screenshot of the preview — image export comes in the full app.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- searchable option picker (module-level so inputs keep focus) ---------- */
function SearchPicker({
  query, onQuery, options, selected, onSelect, multi = false,
  placeholder = "Search or type your own…", onAddCustom, renderOption,
}) {
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((o) => (o.label || o).toLowerCase().includes(q)) : options;
  const exact = options.some((o) => (o.label || o).toLowerCase() === q);
  const isOn = (val) => (multi ? selected.includes(val) : selected === val);

  return (
    <>
      <div className="relative mb-2.5">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: SUBTLE }} />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full text-[14.5px] rounded-xl pl-10 pr-3.5 py-3 outline-none"
          style={{ backgroundColor: "white", color: INK, border: `1px solid ${CARD_BORDER}` }}
        />
        {query && (
          <button onClick={() => onQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Clear">
            <X className="w-4 h-4" style={{ color: SUBTLE }} />
          </button>
        )}
      </div>

      {q && !exact && (
        <button
          onClick={() => { onAddCustom(query.trim()); onQuery(""); }}
          className="w-full flex items-center gap-2.5 rounded-xl px-3.5 py-3 mb-2.5 active:scale-[0.98] transition-transform"
          style={{ backgroundColor: GREEN_TINT, border: `1.5px dashed ${GREEN}` }}
        >
          <span className="text-[18px] font-bold" style={{ color: GREEN }}>+</span>
          <span className="text-[13.5px] font-semibold text-left" style={{ color: GREEN }}>
            Add "{query.trim()}"
          </span>
        </button>
      )}

      {filtered.length === 0 && !q && (
        <p className="text-[13px] text-center py-4" style={{ color: SUBTLE }}>No options yet — type above to add one.</p>
      )}

      {renderOption ? renderOption(filtered, isOn, onSelect) : (
        <div className="flex flex-wrap gap-1.5">
          {filtered.map((o) => {
            const val = o.label || o;
            return (
              <button
                key={val}
                onClick={() => onSelect(val)}
                className="text-[13px] font-semibold px-3.5 py-2.5 rounded-full transition-colors active:scale-95"
                style={{
                  backgroundColor: isOn(val) ? NAVY : "white",
                  color: isOn(val) ? "white" : INK,
                  border: `1.5px solid ${isOn(val) ? NAVY : CARD_BORDER}`,
                }}
              >
                <span className="inline-flex items-center gap-1.5">{o.icon && <Glyph icon={o.icon} size={15} />}{val}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ---------- the job-posting wizard ---------- */
const POST_STEPS = [
  { key: "facility", label: "Facility", hint: "Where is the job?", icon: Building2 },
  { key: "role", label: "Role & type", hint: "Who are you hiring?", icon: Briefcase },
  { key: "pay", label: "Schedule & pay", hint: "Shifts and salary", icon: Wallet },
  { key: "reqs", label: "Requirements & documents", hint: "What applicants need", icon: ClipboardList },
  { key: "contact", label: "Contact & photos", hint: "How to reach you", icon: Phone },
  { key: "review", label: "Review & publish", hint: "Check and go live", icon: CheckCircle2 },
];
const START_OPTIONS = ["Immediately", "Within 2 weeks", "Next month"];
const NEW_JOB = () => ({
  ...EMPTY_JOB, id: `job-${Date.now()}`, jobType: "Full-time", openings: 1, urgent: false,
  specialty: "", documents: null, deadline: "", status: "saved",
});

function PostJobScreen({ onBack, onMenu, postedJobs, onPublish, canPost, onNeedProfile, known = {} }) {
  const [view, setView] = useState("list");   // list | editor
  const [step, setStep] = useState(0);
  const [job, setJob] = useState(NEW_JOB);
  const [shareJob, setShareJob] = useState(null);
  const [toast, setToast] = useState("");
  const [cardNote, setCardNote] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [reqDraft, setReqDraft] = useState("");
  const [docDraft, setDocDraft] = useState("");
  const [cityDraft, setCityDraft] = useState("");
  const [photoError, setPhotoError] = useState("");
  const cardRef = useRef(null);
  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const toastRef = useRef(null);
  const MAX_PHOTOS = 6;

  useEffect(() => () => clearTimeout(toastRef.current), []);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [view, step]);

  const set = (k, v) => setJob((p) => ({ ...p, [k]: v }));
  const toggleIn = (k, v) => setJob((p) => ({ ...p, [k]: (p[k] || []).includes(v) ? p[k].filter((x) => x !== v) : [...(p[k] || []), v] }));
  const flash = (m) => { setToast(m); clearTimeout(toastRef.current); toastRef.current = setTimeout(() => setToast(""), 3200); };
  const tpl = CARD_TEMPLATES.find((t) => t.id === job.templateId) || CARD_TEMPLATES[0];

  const kind = jobRoleKind(job.jobTitle);
  const docs = Array.isArray(job.documents) ? job.documents : jobDocumentsFor({ ...job, documents: null });
  const setDocs = (next) => set("documents", next);
  const suggestedReqs = [...new Set([...(ROLE_REQUIREMENTS[kind] || []), ...COMMON_REQUIREMENTS])];
  const unitLabel = job.payUnitLabel || "Per Month";

  const valid = {
    facility: !!(job.facilityTypeLabel && job.facilityName.trim() && job.city),
    role: !!(job.jobTitle && job.jobType),
    pay: job.shifts.length > 0 && !!job.payAmount,
    reqs: docs.some((d) => d.required),
    contact: true,
    review: true,
  };
  const doneCount = ["facility", "role", "pay", "reqs"].filter((k) => valid[k]).length;
  const ready = valid.facility && valid.role && valid.pay;
  const cur = POST_STEPS[step];

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_PHOTOS - job.photos.length;
    if (room <= 0) { setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`); return; }
    setPhotoError(files.length > room ? `Only ${room} more photo${room > 1 ? "s" : ""} could be added.` : "");
    files.slice(0, room).forEach((f) => {
      if (!f.type.startsWith("image/")) { setPhotoError("Only image files can be added."); return; }
      if (f.size > 8 * 1024 * 1024) { setPhotoError(`"${f.name}" is over 8 MB.`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const max = 1200;
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const cv = document.createElement("canvas");
          cv.width = Math.round(img.width * scale);
          cv.height = Math.round(img.height * scale);
          cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
          const data = cv.toDataURL("image/jpeg", 0.72);
          setJob((prev) => (prev.photos.length >= MAX_PHOTOS ? prev : { ...prev, photos: [...prev.photos, data] }));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(f);
    });
  };
  const removePhoto = (i) => setJob((prev) => {
    const photos = prev.photos.filter((_, idx) => idx !== i);
    const coverIndex = prev.coverIndex >= photos.length ? 0 : (i < prev.coverIndex ? prev.coverIndex - 1 : prev.coverIndex);
    return { ...prev, photos, coverIndex };
  });

  const record = (status) => ({
    ...job,
    documents: docs,
    posted: status === "posted" ? "Just now" : job.posted || "Draft",
    applicants: job.applicants || 0,
    status,
  });
  const saveDraft = () => { onPublish(record(job.status === "posted" ? "posted" : "saved")); flash("Draft saved to your job posts."); };
  const publish = () => {
    const go = () => { onPublish(record("posted")); setView("list"); flash(`“${job.jobTitle}” is live on PakMed.`); };
    if (canPost) go();
    else onNeedProfile(go, {
      facilityName: job.facilityName, facilityType: job.facilityTypeLabel,
      city: job.city, address: job.area, area: job.area,
      contactPerson: job.contactName, phone: job.contactNumber,
    });
  };
  const startNew = () => { setJob(NEW_JOB()); setStep(0); setCustomTitle(""); setView("editor"); };
  const editJob = (j) => { setJob({ ...NEW_JOB(), ...j }); setStep(0); setView("editor"); };

  const downloadCard = () => {
    const html = cardRef.current ? cardRef.current.innerHTML : "";
    if (!html) return;
    const w = window.open("", "_blank");
    if (!w) { setCardNote("Pop-ups are blocked. Allow pop-ups, then try again."); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Job Card</title>
      <style>@page{size:A5;margin:8mm}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{display:flex;align-items:center;justify-content:center}.wrap{width:340px}</style></head><body><div class="wrap">${html}</div></body></html>`);
    w.document.close();
    setCardNote("Print dialog opened — choose “Save as PDF” or your printer.");
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) { /* closed */ } }, 400);
  };
  const writeDescription = () => {
    const shifts = job.shifts.join(", ").toLowerCase();
    set("notes", [
      `${job.facilityName || "Our facility"} is looking for ${job.openings > 1 ? `${job.openings} ` : "a "}${job.jobTitle || "healthcare professional"}${job.openings > 1 ? "s" : ""}${job.specialty ? ` (${job.specialty})` : ""} to join our team in ${[job.area, job.city].filter(Boolean).join(", ") || "Pakistan"}.`,
      `This is a ${job.jobType.toLowerCase()} position${shifts ? ` covering ${shifts} shifts` : ""}, paying PKR ${job.payAmount || "—"} ${unitLabel.toLowerCase()}.`,
      "You will work with a supportive clinical team, follow facility protocols and maintain accurate patient records.",
    ].join(" "));
  };

  /* ---------- small building blocks ---------- */
  const Label = ({ children, opt, help }) => (
    <div className="mb-2.5">
      <p className="text-[15px] font-bold" style={{ color: INK }}>{children}{opt && <span className="text-[13px] font-medium ml-1" style={{ color: FAINT }}>(optional)</span>}</p>
      {help && <p className="text-[13px] mt-0.5" style={{ color: SUBTLE }}>{help}</p>}
    </div>
  );
  const inputCls = "pm-input w-full h-12 text-[15px] rounded-xl px-4 outline-none bg-white";
  const inputStyle = { color: INK, border: `1.5px solid ${CARD_BORDER}` };
  const Chip = ({ on, onClick, children, icon: Icon }) => (
    <button type="button" onClick={onClick} aria-pressed={on}
      className="h-10 px-4 rounded-full text-[14px] font-semibold inline-flex items-center gap-1.5 transition-colors"
      style={{ color: on ? "#fff" : INK_2, backgroundColor: on ? BRAND : "#fff", border: `1.5px solid ${on ? BRAND : CARD_BORDER}` }}>
      {Icon && <Icon className="w-4 h-4" />}{children}{on && <Check className="w-3.5 h-3.5" strokeWidth={3} />}
    </button>
  );
  const Toggle = ({ on, onClick, title, sub, icon: Icon, color = BRAND }) => (
    <button type="button" onClick={onClick} aria-pressed={on}
      className="w-full rounded-2xl p-4 flex items-center gap-3 text-left transition-colors"
      style={{ border: `1.5px solid ${on ? color : CARD_BORDER}`, backgroundColor: on ? `${color}10` : "#fff" }}>
      {Icon && <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: on ? "#fff" : CREAM }}><Icon className="w-5 h-5" style={{ color: on ? color : INK_2 }} /></span>}
      <span className="flex-1 min-w-0">
        <span className="block text-[14.5px] font-bold" style={{ color: INK }}>{title}</span>
        {sub && <span className="block text-[12.5px] mt-0.5" style={{ color: SUBTLE }}>{sub}</span>}
      </span>
      <span className="w-11 h-6 rounded-full flex items-center px-0.5 shrink-0 transition-colors" style={{ backgroundColor: on ? color : "#D0D5DD", justifyContent: on ? "flex-end" : "flex-start" }}>
        <span className="w-5 h-5 rounded-full bg-white block shadow-sm" />
      </span>
    </button>
  );

  /* ================= DASHBOARD ================= */
  if (view === "list") {
    const live = postedJobs.filter((j) => j.status === "posted");
    const drafts = postedJobs.filter((j) => j.status !== "posted");
    const applicantsTotal = postedJobs.reduce((n, j) => n + (j.applicants || 0), 0);
    return (
      <div className="w-full min-w-0" style={{ fontFamily: FONT }}>
        <section className="relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0B4D33 0%, #12805C 55%, #0B57B7 100%)" }}>
          <div className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
          <img src="/images/landing/offer-job.jpg" alt="" className="hidden lg:block absolute right-0 top-0 h-full w-[36%] object-cover opacity-25" style={{ maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
            <div className="flex items-center gap-2 mb-5">
              {onBack && (
                <button type="button" onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors">
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
              )}
              <p className="text-[13px] font-semibold text-white/80">Home <span className="mx-1 text-white/50">/</span> <span className="text-white">Offer a Job</span></p>
            </div>
            <div className="flex flex-col lg:flex-row lg:items-end gap-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-[28px] sm:text-[38px] font-extrabold tracking-[-0.03em] leading-tight text-white">Hire verified healthcare staff</h1>
                <p className="text-[14.5px] sm:text-[16px] mt-2 text-white/85 max-w-xl">Post a job in about two minutes. Choose the documents applicants must upload, and review CVs from PMDC-registered professionals.</p>
                <button type="button" onClick={startNew} className="mt-6 h-12 px-6 rounded-xl text-[15px] font-bold inline-flex items-center gap-2 bg-white transition-transform hover:-translate-y-0.5" style={{ color: GREEN }}>
                  <Plus className="w-5 h-5" /> Post a new job
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2.5 lg:w-[380px]">
                {[["Live jobs", live.length, Briefcase], ["Drafts", drafts.length, Pencil], ["Applicants", applicantsTotal, Users]].map(([l, n, Icon]) => (
                  <div key={l} className="rounded-2xl p-3.5" style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <Icon className="w-5 h-5 text-white/80" />
                    <p className="text-[26px] font-extrabold leading-none mt-2 text-white">{n}</p>
                    <p className="text-[12.5px] font-semibold mt-1 text-white/75">{l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {toast && (
            <div className="rounded-2xl p-4 mb-5 flex items-center gap-3 auth-step" style={{ backgroundColor: GREEN_TINT, border: "1px solid #C7E8D9" }}>
              <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: GREEN }} />
              <p className="text-[14.5px] font-semibold" style={{ color: GREEN }}>{toast}</p>
            </div>
          )}

          {postedJobs.length === 0 ? (
            <div className="rounded-3xl bg-white p-6 sm:p-10" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <div className="text-center max-w-lg mx-auto">
                <span className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: GREEN_TINT }}><Briefcase className="w-8 h-8" style={{ color: GREEN }} /></span>
                <h2 className="text-[22px] font-extrabold mt-4" style={{ color: INK }}>You haven't posted a job yet</h2>
                <p className="text-[15px] mt-1.5" style={{ color: SUBTLE }}>Here's how hiring on PakMed works.</p>
              </div>
              <ol className="grid md:grid-cols-3 gap-4 mt-8">
                {[
                  ["Describe the role", "Facility, role, shifts and salary — with smart suggestions.", Briefcase],
                  ["Choose required documents", "CV, CNIC, degree, PMDC/PNC and more — applicants upload them when they apply.", ClipboardList],
                  ["Review applicants", "Shortlist candidates and message them directly.", Users],
                ].map(([t, d, Icon], i) => (
                  <li key={t} className="rounded-2xl p-5" style={{ backgroundColor: CREAM }}>
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center bg-white"><Icon className="w-5 h-5" style={{ color: GREEN }} /></span>
                    <p className="text-[12px] font-bold mt-3" style={{ color: GREEN }}>Step {i + 1}</p>
                    <p className="text-[15.5px] font-bold mt-0.5" style={{ color: INK }}>{t}</p>
                    <p className="text-[13.5px] mt-1 leading-relaxed" style={{ color: SUBTLE }}>{d}</p>
                  </li>
                ))}
              </ol>
              <div className="text-center mt-8">
                <button type="button" onClick={startNew} className="h-12 px-6 rounded-xl text-[15px] font-bold text-white inline-flex items-center gap-2" style={{ backgroundColor: GREEN }}>
                  <Plus className="w-5 h-5" /> Post your first job
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[20px] font-extrabold" style={{ color: INK }}>Your job posts <span style={{ color: FAINT }}>({postedJobs.length})</span></h2>
                <button type="button" onClick={startNew} className="h-10 px-4 rounded-xl text-[13.5px] font-bold text-white inline-flex items-center gap-1.5" style={{ backgroundColor: GREEN }}>
                  <Plus className="w-4 h-4" /> New job
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {postedJobs.map((j) => {
                  const isLive = j.status === "posted";
                  const vis = jobRoleVisual(j.jobTitle);
                  return (
                    <article key={j.id} className="rounded-2xl bg-white p-5 flex flex-col transition-all hover:-translate-y-0.5 hover:shadow-lg" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                      <div className="flex items-start gap-3">
                        <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: vis.tint }}><vis.Icon className="w-6 h-6" style={{ color: vis.color }} /></span>
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ color: isLive ? GREEN : AMBER, backgroundColor: isLive ? GREEN_TINT : AMBER_TINT }}>{isLive ? "Live" : "Draft"}</span>
                          <p className="text-[16px] font-bold leading-snug mt-1.5 truncate" style={{ color: INK }}>{j.jobTitle || "Untitled job"}</p>
                          <p className="text-[13px] truncate" style={{ color: SUBTLE }}>{[j.facilityName, j.city].filter(Boolean).join(" · ") || "Facility not set"}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {j.jobType && <span className="text-[11.5px] font-bold px-2 py-1 rounded-md" style={{ color: BRAND, backgroundColor: BRAND_50 }}>{j.jobType}</span>}
                        {(j.shifts || []).slice(0, 2).map((s) => <span key={s} className="text-[11.5px] font-semibold px-2 py-1 rounded-md" style={{ color: INK_2, backgroundColor: CREAM }}>{s}</span>)}
                        {Array.isArray(j.documents) && <span className="text-[11.5px] font-semibold px-2 py-1 rounded-md inline-flex items-center gap-1" style={{ color: INK_2, backgroundColor: CREAM }}><FileText className="w-3 h-3" /> {j.documents.filter((d) => d.required).length} docs</span>}
                      </div>
                      <div className="flex items-end justify-between gap-3 mt-4 pt-3.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                        <div>
                          <p className="text-[17px] font-extrabold leading-none" style={{ color: GREEN }}>{j.payAmount ? `PKR ${j.payAmount}` : "Salary not set"}</p>
                          <p className="text-[12px] mt-1.5" style={{ color: FAINT }}>{isLive ? `${j.applicants || 0} applicants · ${j.posted}` : "Not published yet"}</p>
                        </div>
                        <div className="flex gap-1.5">
                          {isLive && (
                            <button type="button" onClick={() => setShareJob(j)} aria-label="Share job" className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]" style={{ border: `1px solid ${CARD_BORDER}` }}>
                              <Repeat2 className="w-4 h-4" style={{ color: INK_2 }} />
                            </button>
                          )}
                          <button type="button" onClick={() => editJob(j)} className="h-9 px-3.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-1.5" style={{ color: isLive ? INK_2 : "#fff", backgroundColor: isLive ? "#fff" : GREEN, border: `1px solid ${isLive ? CARD_BORDER : GREEN}` }}>
                            <Pencil className="w-3.5 h-3.5" /> {isLive ? "Edit" : "Continue"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </div>
        {shareJob && <JobShareSheet job={shareJob} onClose={() => setShareJob(null)} />}
      </div>
    );
  }

  /* ================= EDITOR ================= */
  const Preview = (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
        <p className="text-[12px] font-bold uppercase tracking-[0.07em] mb-3" style={{ color: SUBTLE }}>How applicants see it</p>
        {(() => {
          const vis = jobRoleVisual(job.jobTitle);
          return (
            <div className="rounded-xl p-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-start gap-3">
                <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: vis.tint }}><vis.Icon className="w-5 h-5" style={{ color: vis.color }} /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-bold leading-snug truncate" style={{ color: job.jobTitle ? INK : FAINT }}>{job.jobTitle || "Job title"}{job.specialty ? ` · ${job.specialty}` : ""}</p>
                  <p className="text-[12.5px] truncate" style={{ color: SUBTLE }}>{job.facilityName || "Facility name"}</p>
                </div>
                {job.urgent && <span className="text-[10.5px] font-bold px-1.5 py-0.5 rounded-full shrink-0" style={{ color: RED, backgroundColor: RED_TINT }}>Urgent</span>}
              </div>
              <p className="text-[12.5px] mt-2.5 flex items-center gap-1" style={{ color: INK_2 }}><MapPin className="w-3.5 h-3.5" style={{ color: FAINT }} />{[job.area, job.city].filter(Boolean).join(", ") || "Location"}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md" style={{ color: BRAND, backgroundColor: BRAND_50 }}>{job.jobType}</span>
                {job.shifts.map((s) => <span key={s} className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: INK_2, backgroundColor: CREAM }}>{s}</span>)}
              </div>
              <p className="text-[16px] font-extrabold mt-3" style={{ color: job.payAmount ? GREEN : FAINT }}>
                {job.payAmount ? `PKR ${job.payAmount}` : "PKR —"} <span className="text-[11.5px] font-semibold" style={{ color: SUBTLE }}>/ {unitLabel.replace(/^Per /i, "").toLowerCase()}</span>
              </p>
            </div>
          );
        })()}
      </div>
      <div className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
        <p className="text-[12px] font-bold uppercase tracking-[0.07em] mb-3" style={{ color: SUBTLE }}>Applicants will upload</p>
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="flex items-start gap-2 text-[13.5px]" style={{ color: INK_2 }}>
              <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: d.required ? BRAND : FAINT }} />
              <span>{d.label}{!d.required && <span style={{ color: FAINT }}> (optional)</span>}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl p-4" style={{ backgroundColor: ready ? GREEN_TINT : CREAM }}>
        <p className="text-[13.5px] font-bold" style={{ color: ready ? GREEN : INK }}>{ready ? "Ready to publish" : `${doneCount} of 4 key sections complete`}</p>
        <div className="h-1.5 rounded-full overflow-hidden mt-2 bg-white">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(doneCount / 4) * 100}%`, backgroundColor: ready ? GREEN : BRAND }} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full min-w-0" style={{ fontFamily: FONT }}>
      {/* editor top bar */}
      <div className="bg-white" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <button type="button" onClick={() => setView("list")} aria-label="Back to job posts" className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-[#F5F7FA]" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <ChevronLeft className="w-5 h-5" style={{ color: INK }} />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-[18px] sm:text-[20px] font-extrabold leading-tight truncate" style={{ color: INK }}>{postedJobs.some((j) => j.id === job.id) ? "Edit job post" : "Post a new job"}</p>
            <p className="text-[13px]" style={{ color: SUBTLE }}>Step {step + 1} of {POST_STEPS.length} · {cur.label}</p>
          </div>
          <button type="button" onClick={saveDraft} className="h-10 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5 shrink-0 transition-colors hover:bg-[#F5F7FA]" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save draft</span>
          </button>
        </div>
        <div className="lg:hidden h-1" style={{ backgroundColor: CREAM }}>
          <div className="h-full transition-all duration-500" style={{ width: `${((step + 1) / POST_STEPS.length) * 100}%`, backgroundColor: GREEN }} />
        </div>
      </div>

      {toast && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="rounded-xl p-3 flex items-center gap-2.5 auth-step" style={{ backgroundColor: GREEN_TINT }}>
            <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
            <p className="text-[13.5px] font-semibold" style={{ color: GREEN }}>{toast}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 grid lg:grid-cols-[220px_1fr_320px] gap-6 items-start">
        {/* stepper */}
        <nav className="hidden lg:block sticky top-[88px]" aria-label="Steps">
          <ol className="space-y-1">
            {POST_STEPS.map((s, i) => {
              const on = i === step;
              const ok = i < step && valid[s.key];
              return (
                <li key={s.key}>
                  <button type="button" onClick={() => setStep(i)}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors hover:bg-white"
                    style={{ backgroundColor: on ? "#fff" : "transparent", boxShadow: on ? `inset 0 0 0 1.5px ${GREEN}` : "none" }}>
                    <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold"
                      style={{ backgroundColor: on ? GREEN : ok ? GREEN_TINT : "#fff", color: on ? "#fff" : ok ? GREEN : SUBTLE, border: on || (ok) ? "none" : `1px solid ${CARD_BORDER}` }}>
                      {ok ? <Check className="w-4 h-4" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-bold leading-tight" style={{ color: on ? INK : INK_2 }}>{s.label}</span>
                      <span className="block text-[11.5px]" style={{ color: FAINT }}>{s.hint}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* form */}
        <div className="min-w-0">
          <div className="rounded-3xl bg-white p-5 sm:p-7 auth-step" key={step} style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GREEN_TINT }}><cur.icon className="w-5 h-5" style={{ color: GREEN }} /></span>
              <div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: INK }}>{cur.label}</h2>
                <p className="text-[13.5px]" style={{ color: SUBTLE }}>{cur.hint}</p>
              </div>
            </div>

            {/* 1 FACILITY */}
            {cur.key === "facility" && (
              <div className="space-y-6">
                <div>
                  <Label>Type of facility</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FACILITY_TYPES.map((t) => {
                      const on = job.facilityTypeLabel === t.label;
                      return (
                        <button key={t.key} type="button" onClick={() => setJob((p) => ({ ...p, facilityTypeLabel: t.label, facilityType: t.key }))} aria-pressed={on}
                          className="rounded-xl p-3 flex flex-col items-start gap-2 text-left transition-colors min-h-[84px]"
                          style={{ border: `1.5px solid ${on ? GREEN : CARD_BORDER}`, backgroundColor: on ? GREEN_TINT : "#fff" }}>
                          <t.icon className="w-5 h-5" style={{ color: on ? GREEN : INK_2 }} />
                          <span className="text-[13px] font-bold leading-tight" style={{ color: on ? GREEN : INK }}>{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Facility name</Label>
                  <input value={job.facilityName} onChange={(e) => set("facilityName", e.target.value)} placeholder="e.g. Aga Care Hospital" className={inputCls} style={inputStyle} />
                  <AutoFill hint={known.facilityName} current={job.facilityName} onUse={(v) => set("facilityName", v)} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>City</Label>
                    <div className="rounded-xl bg-white" style={{ border: `1.5px solid ${job.city ? GREEN : CARD_BORDER}` }}>
                      <SearchSuggestInput
                        icon={MapPin}
                        value={cityDraft || job.city}
                        onChange={(v) => { setCityDraft(v); set("city", ""); }}
                        onPick={(v) => { setCityDraft(""); set("city", v); }}
                        onClear={() => { setCityDraft(""); set("city", ""); }}
                        placeholder="Search a city"
                        suggestions={CITIES}
                        srLabel="City"
                      />
                    </div>
                    {cityDraft && !job.city && (
                      <button type="button" onClick={() => { set("city", cityDraft.trim()); setCityDraft(""); }} className="mt-2 text-[13px] font-bold" style={{ color: GREEN }}>Use “{cityDraft.trim()}”</button>
                    )}
                  </div>
                  <div>
                    <Label opt>Area or road</Label>
                    <input value={job.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Gulshan-e-Iqbal" className={inputCls} style={inputStyle} />
                    <AutoFill hint={known.facilityArea} current={job.area} onUse={(v) => set("area", v)} />
                  </div>
                </div>
              </div>
            )}

            {/* 2 ROLE */}
            {cur.key === "role" && (
              <div className="space-y-6">
                <div>
                  <Label>Job title</Label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TITLES.filter((t) => t !== "Other").map((t) => (
                      <Chip key={t} on={job.jobTitle === t} onClick={() => { set("jobTitle", t); setCustomTitle(""); set("documents", null); }}>{t}</Chip>
                    ))}
                  </div>
                  <input value={customTitle || (!JOB_TITLES.includes(job.jobTitle) ? job.jobTitle : "")}
                    onChange={(e) => { setCustomTitle(e.target.value); set("jobTitle", e.target.value); }}
                    placeholder="Or type another title, e.g. Anesthesia Technician" className={`${inputCls} mt-3`} style={inputStyle} />
                </div>
                {["doctor", "consultant", "house", "dentist"].includes(kind) && (
                  <div>
                    <Label opt help="Helps the right specialists find your post">Specialty</Label>
                    <div className="flex flex-wrap gap-2">
                      {DOCTOR_SPECIALTIES.slice(0, 10).map((sp) => (
                        <Chip key={sp} on={job.specialty === sp} onClick={() => set("specialty", job.specialty === sp ? "" : sp)}>{sp}</Chip>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Job type</Label>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map((t) => <Chip key={t} on={job.jobType === t} onClick={() => set("jobType", t)}>{t}</Chip>)}
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4 items-start">
                  <div>
                    <Label>Number of openings</Label>
                    <div className="inline-flex items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${CARD_BORDER}` }}>
                      <button type="button" onClick={() => set("openings", Math.max(1, (job.openings || 1) - 1))} aria-label="Fewer" className="w-12 h-12 flex items-center justify-center hover:bg-[#F5F7FA]"><Minus className="w-4 h-4" style={{ color: INK }} /></button>
                      <span className="w-14 text-center text-[17px] font-extrabold" style={{ color: INK }}>{job.openings || 1}</span>
                      <button type="button" onClick={() => set("openings", Math.min(50, (job.openings || 1) + 1))} aria-label="More" className="w-12 h-12 flex items-center justify-center hover:bg-[#F5F7FA]"><Plus className="w-4 h-4" style={{ color: INK }} /></button>
                    </div>
                  </div>
                  <Toggle on={job.urgent} onClick={() => set("urgent", !job.urgent)} title="Urgent hiring" sub="Shows an Urgent badge and appears in the urgent filter" icon={Zap} color={RED} />
                </div>
              </div>
            )}

            {/* 3 PAY */}
            {cur.key === "pay" && (
              <div className="space-y-6">
                <div>
                  <Label help="Choose one or more">Shifts</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {SHIFTS.map((sh) => {
                      const on = job.shifts.includes(sh.label);
                      return (
                        <button key={sh.key} type="button" onClick={() => toggleIn("shifts", sh.label)} aria-pressed={on}
                          className="rounded-xl p-3 flex flex-col items-start gap-1.5 text-left transition-colors"
                          style={{ border: `1.5px solid ${on ? GREEN : CARD_BORDER}`, backgroundColor: on ? GREEN_TINT : "#fff" }}>
                          <sh.icon className="w-5 h-5" style={{ color: on ? GREEN : INK_2 }} />
                          <span className="text-[14px] font-bold" style={{ color: on ? GREEN : INK }}>{sh.label}</span>
                          <span className="text-[12px]" style={{ color: SUBTLE }}>{sh.sub}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <Label>Start date</Label>
                  <div className="flex flex-wrap gap-2">
                    {START_OPTIONS.map((o) => <Chip key={o} on={job.startDate === o} onClick={() => set("startDate", o)}>{o}</Chip>)}
                  </div>
                  <input value={START_OPTIONS.includes(job.startDate) ? "" : job.startDate} onChange={(e) => set("startDate", e.target.value)}
                    placeholder="Or type a date, e.g. 1 November" className={`${inputCls} mt-3`} style={inputStyle} />
                </div>
                <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-start">
                  <div>
                    <Label>Salary</Label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold" style={{ color: SUBTLE }}>PKR</span>
                      <input value={job.payAmount} onChange={(e) => set("payAmount", e.target.value.replace(/[^0-9,]/g, ""))}
                        placeholder="e.g. 150,000" inputMode="numeric" className={`${inputCls} pl-14 text-[17px] font-bold`} style={inputStyle} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Paid</Label>
                  <div className="flex flex-wrap gap-2">
                    {PAY_UNITS.map((u) => <Chip key={u.key} on={unitLabel === u.label} onClick={() => setJob((p) => ({ ...p, payUnit: u.key, payUnitLabel: u.label }))}>{u.label}</Chip>)}
                  </div>
                  <p className="text-[13px] mt-3 flex items-start gap-2" style={{ color: SUBTLE }}><Info className="w-4 h-4 shrink-0 mt-0.5" /> Posts that show a salary get far more applications than ones that say "negotiable".</p>
                </div>
              </div>
            )}

            {/* 4 REQUIREMENTS & DOCUMENTS */}
            {cur.key === "reqs" && (
              <div className="space-y-7">
                <div>
                  <Label help={job.jobTitle ? `Suggested for ${job.jobTitle} — tap to add or remove` : "Tap to add or remove"}>Requirements</Label>
                  <div className="flex flex-wrap gap-2">
                    {[...new Set([...suggestedReqs, ...job.requirements])].map((r) => (
                      <Chip key={r} on={job.requirements.includes(r)} onClick={() => toggleIn("requirements", r)}>{r}</Chip>
                    ))}
                  </div>
                  <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); const v = reqDraft.trim(); if (v && !job.requirements.includes(v)) set("requirements", [...job.requirements, v]); setReqDraft(""); }}>
                    <input value={reqDraft} onChange={(e) => setReqDraft(e.target.value)} placeholder="Add your own requirement" className={inputCls} style={inputStyle} />
                    <button type="submit" disabled={!reqDraft.trim()} className="h-12 px-4 rounded-xl text-[14px] font-bold text-white shrink-0 disabled:opacity-40" style={{ backgroundColor: GREEN }}>Add</button>
                  </form>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-3 mb-2.5">
                    <div>
                      <p className="text-[15px] font-bold" style={{ color: INK }}>Documents applicants must submit</p>
                      <p className="text-[13px] mt-0.5" style={{ color: SUBTLE }}>Applicants upload these when they tap Apply. Mark each as required or optional.</p>
                    </div>
                    {Array.isArray(job.documents) && (
                      <button type="button" onClick={() => set("documents", null)} className="text-[13px] font-bold shrink-0" style={{ color: GREEN }}>Reset to suggested</button>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {docs.map((d) => (
                      <li key={d.id} className="flex items-center gap-3 rounded-xl px-3.5 py-2.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: d.required ? BRAND_50 : CREAM }}>
                          <FileText className="w-[18px] h-[18px]" style={{ color: d.required ? BRAND : SUBTLE }} />
                        </span>
                        <span className="flex-1 min-w-0 text-[14.5px] font-semibold truncate" style={{ color: INK }}>{d.label}</span>
                        <div className="inline-flex p-0.5 rounded-lg shrink-0" style={{ backgroundColor: CREAM }}>
                          {[[true, "Required"], [false, "Optional"]].map(([val, label]) => (
                            <button key={label} type="button" onClick={() => setDocs(docs.map((x) => (x.id === d.id ? { ...x, required: val } : x)))}
                              className="h-8 px-2.5 rounded-md text-[12px] font-bold transition-all"
                              style={{ backgroundColor: d.required === val ? "#fff" : "transparent", color: d.required === val ? (val ? BRAND : INK_2) : FAINT, boxShadow: d.required === val ? "0 1px 2px rgba(16,24,40,0.12)" : "none" }}>
                              <span className="hidden sm:inline">{label}</span><span className="sm:hidden">{val ? "Req." : "Opt."}</span>
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={() => setDocs(docs.filter((x) => x.id !== d.id))} aria-label={`Remove ${d.label}`} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 hover:bg-[#F5F7FA]">
                          <X className="w-4 h-4" style={{ color: SUBTLE }} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <form className="flex gap-2 mt-3" onSubmit={(e) => { e.preventDefault(); const v = docDraft.trim(); if (v) setDocs([...docs, { id: `doc-${Date.now()}`, label: v, required: true }]); setDocDraft(""); }}>
                    <input value={docDraft} onChange={(e) => setDocDraft(e.target.value)} placeholder="Add a document, e.g. BLS / ACLS certificate" className={inputCls} style={inputStyle} />
                    <button type="submit" disabled={!docDraft.trim()} className="h-12 px-4 rounded-xl text-[14px] font-bold text-white shrink-0 disabled:opacity-40" style={{ backgroundColor: GREEN }}>Add</button>
                  </form>
                  {!valid.reqs && <p className="text-[13px] mt-2 font-semibold" style={{ color: RED }}>Mark at least one document as required.</p>}
                </div>

                <div>
                  <div className="flex items-end justify-between gap-3 mb-2.5">
                    <p className="text-[15px] font-bold" style={{ color: INK }}>Job description <span className="text-[13px] font-medium" style={{ color: FAINT }}>(optional)</span></p>
                    <button type="button" onClick={writeDescription} className="h-8 px-3 rounded-lg text-[12.5px] font-bold inline-flex items-center gap-1.5" style={{ color: VIOLET, backgroundColor: VIOLET_TINT }}>
                      <Sparkles className="w-3.5 h-3.5" /> Write it for me
                    </button>
                  </div>
                  <textarea value={job.notes} onChange={(e) => set("notes", e.target.value)} rows={4}
                    placeholder="Duties, department, team size, benefits…" className="pm-input w-full text-[15px] rounded-xl px-4 py-3 outline-none resize-none bg-white" style={inputStyle} />
                </div>
              </div>
            )}

            {/* 5 CONTACT & PHOTOS */}
            {cur.key === "contact" && (
              <div className="space-y-6">
                <AutoFillAll
                  label="Use my contact details"
                  pairs={[
                    { hint: known.contactPerson, current: job.contactName, set: (v) => set("contactName", v) },
                    { hint: known.facilityPhone, current: job.contactNumber, set: (v) => set("contactNumber", v) },
                  ]}
                />
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Contact person</Label>
                    <input value={job.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Name or department" className={inputCls} style={inputStyle} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <input value={job.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={inputCls} style={inputStyle} />
                  </div>
                </div>
                <Toggle on={job.showNumber} onClick={() => set("showNumber", !job.showNumber)} title="Show my number on the post" sub="Otherwise applicants contact you through PakMed messages" icon={Phone} color={GREEN} />
                <div className="sm:w-1/2">
                  <Label opt>Apply before</Label>
                  <input type="date" value={job.deadline} onChange={(e) => set("deadline", e.target.value)} className={inputCls} style={inputStyle} />
                </div>

                <div>
                  <Label opt help={`Your facility, department or team — up to ${MAX_PHOTOS} photos`}>Photos</Label>
                  <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
                  <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotos} />
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {job.photos.map((src, i) => (
                      <div key={i} className="relative rounded-xl overflow-hidden aspect-square" style={{ border: `2px solid ${i === job.coverIndex ? GREEN : "transparent"}` }}>
                        <button type="button" onClick={() => set("coverIndex", i)} className="w-full h-full" aria-label="Use as cover"><img src={src} alt="" className="w-full h-full object-cover" /></button>
                        {i === job.coverIndex && <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: GREEN }}>COVER</span>}
                        <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo" className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,.55)" }}>
                          <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </button>
                      </div>
                    ))}
                    {job.photos.length < MAX_PHOTOS && (
                      <>
                        <button type="button" onClick={() => galleryRef.current?.click()} className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-[#F5F7FA]" style={{ border: `1.5px dashed ${CARD_BORDER}` }}>
                          <Upload className="w-5 h-5" style={{ color: GREEN }} /><span className="text-[12px] font-semibold" style={{ color: INK_2 }}>Upload</span>
                        </button>
                        <button type="button" onClick={() => cameraRef.current?.click()} className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors hover:bg-[#F5F7FA] sm:hidden" style={{ border: `1.5px dashed ${CARD_BORDER}` }}>
                          <Camera className="w-5 h-5" style={{ color: GREEN }} /><span className="text-[12px] font-semibold" style={{ color: INK_2 }}>Camera</span>
                        </button>
                      </>
                    )}
                  </div>
                  {photoError && <p className="text-[13px] mt-2 font-semibold" style={{ color: RED }}>{photoError}</p>}
                  <p className="text-[12.5px] mt-2" style={{ color: FAINT }}>Avoid photos showing patients or confidential records.</p>
                </div>
              </div>
            )}

            {/* 6 REVIEW */}
            {cur.key === "review" && (
              <div className="space-y-5">
                {!ready && (
                  <div className="rounded-xl p-3.5 flex items-start gap-2.5" style={{ backgroundColor: AMBER_TINT }}>
                    <Info className="w-5 h-5 shrink-0" style={{ color: AMBER }} />
                    <p className="text-[14px]" style={{ color: "#6B4B22" }}>A few details are missing. Complete <b>{["facility", "role", "pay"].filter((k) => !valid[k]).map((k) => POST_STEPS.find((s) => s.key === k).label).join(", ")}</b> to publish.</p>
                  </div>
                )}
                {[
                  { k: "facility", rows: [["Facility", `${job.facilityName || "—"}${job.facilityTypeLabel ? ` · ${job.facilityTypeLabel}` : ""}`], ["Location", [job.area, job.city].filter(Boolean).join(", ") || "—"]] },
                  { k: "role", rows: [["Role", `${job.jobTitle || "—"}${job.specialty ? ` · ${job.specialty}` : ""}`], ["Type", `${job.jobType}${job.openings > 1 ? ` · ${job.openings} openings` : ""}${job.urgent ? " · Urgent" : ""}`]] },
                  { k: "pay", rows: [["Shifts", job.shifts.join(", ") || "—"], ["Salary", job.payAmount ? `PKR ${job.payAmount} ${unitLabel.toLowerCase()}` : "—"], ["Starts", job.startDate || "Flexible"]] },
                  { k: "reqs", rows: [["Requirements", job.requirements.join(", ") || "None added"], ["Documents", `${docs.filter((d) => d.required).length} required · ${docs.filter((d) => !d.required).length} optional`]] },
                  { k: "contact", rows: [["Contact", [job.contactName, job.showNumber ? job.contactNumber : ""].filter(Boolean).join(" · ") || "Via PakMed messages"], ["Photos", job.photos.length ? `${job.photos.length} added` : "None"]] },
                ].map((sec) => {
                  const idx = POST_STEPS.findIndex((s) => s.key === sec.k);
                  const ok = valid[sec.k];
                  return (
                    <div key={sec.k} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${ok ? CARD_BORDER : "#F3B7B2"}` }}>
                      <div className="flex items-center justify-between px-4 py-2.5" style={{ backgroundColor: ok ? CREAM : RED_TINT }}>
                        <p className="text-[13.5px] font-bold flex items-center gap-2" style={{ color: ok ? INK : RED }}>
                          {ok ? <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} /> : <Info className="w-4 h-4" />} {POST_STEPS[idx].label}
                        </p>
                        <button type="button" onClick={() => setStep(idx)} className="text-[13px] font-bold" style={{ color: BRAND }}>Edit</button>
                      </div>
                      <dl>
                        {sec.rows.map(([k, v]) => (
                          <div key={k} className="flex gap-4 px-4 py-2.5 text-[14px]" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                            <dt className="w-28 shrink-0 font-semibold" style={{ color: SUBTLE }}>{k}</dt>
                            <dd className="flex-1 min-w-0" style={{ color: INK }}>{v}</dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  );
                })}

                <div className="rounded-2xl p-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
                  <p className="text-[15px] font-bold mb-3" style={{ color: INK }}>Shareable job poster</p>
                  <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
                    {CARD_TEMPLATES.map((t) => (
                      <button key={t.id} type="button" onClick={() => set("templateId", t.id)}
                        className="shrink-0 h-9 px-3.5 rounded-lg text-[12.5px] font-bold"
                        style={{ background: t.bordered ? "#fff" : t.bg, color: t.bordered ? INK : t.fg, border: `2px solid ${job.templateId === t.id ? GREEN : CARD_BORDER}` }}>
                        {t.name}
                      </button>
                    ))}
                  </div>
                  <div className="max-w-[320px] mx-auto" ref={cardRef}><JobPostCard job={job} tpl={tpl} scale={1} /></div>
                  <div className="flex gap-2 mt-4 justify-center">
                    <button type="button" onClick={() => setShareJob(job)} className="h-10 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}><Repeat2 className="w-4 h-4" /> Share</button>
                    <button type="button" onClick={downloadCard} className="h-10 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}><Upload className="w-4 h-4 rotate-180" /> Download</button>
                  </div>
                  {cardNote && <p className="text-[12.5px] text-center mt-2.5" style={{ color: BRAND }}>{cardNote}</p>}
                </div>
              </div>
            )}

            {/* footer nav */}
            <div className="flex items-center gap-2 mt-8 pt-5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="h-12 px-5 rounded-xl text-[14.5px] font-bold inline-flex items-center gap-1.5" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              <span className="flex-1" />
              {cur.key !== "review" ? (
                <button type="button" onClick={() => setStep(step + 1)} disabled={!valid[cur.key]}
                  className="h-12 px-6 rounded-xl text-[15px] font-bold text-white inline-flex items-center gap-2 transition-all enabled:hover:brightness-110 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GREEN, opacity: valid[cur.key] ? 1 : 0.45 }}>
                  {step === POST_STEPS.length - 2 ? "Review" : "Continue"} <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button type="button" onClick={publish} disabled={!ready}
                  className="h-12 px-6 rounded-xl text-[15px] font-bold text-white inline-flex items-center gap-2 transition-all enabled:hover:brightness-110 disabled:cursor-not-allowed"
                  style={{ backgroundColor: GREEN, opacity: ready ? 1 : 0.45, boxShadow: ready ? "0 8px 20px -10px rgba(18,128,92,0.6)" : "none" }}>
                  <Send className="w-4 h-4" /> {job.status === "posted" ? "Update job" : "Publish job"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* live preview */}
        <aside className="hidden lg:block sticky top-[88px]">{Preview}</aside>
      </div>

      {shareJob && <JobShareSheet job={shareJob} onClose={() => setShareJob(null)} />}
    </div>
  );
}

/* =========================================================
   SEED DATA — jobs & doctors
   ========================================================= */
const SEED_JOBS = [
  { id: "sj1", jobTitle: "Doctor", facilityName: "Aga Care Hospital", facilityTypeLabel: "Hospital", city: "Karachi", area: "Gulshan-e-Iqbal", shifts: ["Night"], payAmount: "8,500", payUnitLabel: "Per Shift", requirements: ["PMDC / PNC registered", "1+ year experience"], contactName: "HR Department", contactNumber: "0300 8471290", showNumber: true, startDate: "Immediately", templateId: "c1", status: "posted", posted: "2 hours ago", applicants: 6, photos: [], coverIndex: 0 },
  { id: "sj2", jobTitle: "Consultant", facilityName: "City Heart Clinic", facilityTypeLabel: "Clinic", city: "Lahore", area: "Jail Road", shifts: ["Evening"], payAmount: "180,000", payUnitLabel: "Per Month", requirements: ["FCPS / MRCP", "3+ years experience"], contactName: "Dr. Kamran", contactNumber: "", showNumber: false, startDate: "1 September", templateId: "c2", status: "posted", posted: "Yesterday", applicants: 3, photos: [], coverIndex: 0 },
  { id: "sj3", jobTitle: "Nurse", facilityName: "Shifa Wellness", facilityTypeLabel: "Hospital", city: "Islamabad", area: "Blue Area", shifts: ["Morning", "Evening"], payAmount: "55,000", payUnitLabel: "Per Month", requirements: ["PMDC / PNC registered", "Female candidates"], contactName: "Nursing Office", contactNumber: "051 2874400", showNumber: true, startDate: "Immediately", templateId: "c3", status: "posted", posted: "3 days ago", applicants: 14, photos: [], coverIndex: 0 },
  { id: "sj4", jobTitle: "Pharmacist", facilityName: "Al-Noor Pharmacy", facilityTypeLabel: "Pharmacy", city: "Faisalabad", area: "Susan Road", shifts: ["Evening"], payAmount: "45,000", payUnitLabel: "Per Month", requirements: ["Fresh graduates welcome"], contactName: "Store Manager", contactNumber: "0321 6639988", showNumber: true, startDate: "Immediately", templateId: "c5", status: "posted", posted: "5 days ago", applicants: 9, photos: [], coverIndex: 0 },
  { id: "sj5", jobTitle: "Medical Officer", facilityName: "Rehman Medical Centre", facilityTypeLabel: "Hospital", city: "Peshawar", area: "University Road", shifts: ["Morning"], payAmount: "95,000", payUnitLabel: "Per Month", requirements: ["PMDC / PNC registered", "Own transport"], contactName: "HR", contactNumber: "", showNumber: false, startDate: "15 September", templateId: "c1", status: "posted", posted: "1 week ago", applicants: 21, photos: [], coverIndex: 0 },
  { id: "sj6", jobTitle: "Receptionist", facilityName: "Smile Dental Clinic", facilityTypeLabel: "Clinic", city: "Karachi", area: "DHA Phase 5", shifts: ["Morning"], payAmount: "35,000", payUnitLabel: "Per Month", requirements: ["Computer literate", "Urdu & English"], contactName: "Reception", contactNumber: "0304 7712345", showNumber: true, startDate: "Immediately", templateId: "c4", status: "posted", posted: "2 days ago", applicants: 31, photos: [], coverIndex: 0 },
  { id: "sj7", jobTitle: "Lab Technician", facilityName: "Chughtai Lab", facilityTypeLabel: "Diagnostic Lab", city: "Lahore", area: "Model Town", shifts: ["Night"], payAmount: "2,200", payUnitLabel: "Per Shift", requirements: ["1+ year experience"], contactName: "Lab Supervisor", contactNumber: "042 111 456 789", showNumber: true, startDate: "Immediately", templateId: "c6", status: "posted", posted: "4 days ago", applicants: 7, photos: [], coverIndex: 0 },
  { id: "sj8", jobTitle: "Demonstrator", facilityName: "Punjab Medical College", facilityTypeLabel: "Medical / Diploma College", city: "Faisalabad", area: "Jail Road", shifts: ["Morning"], payAmount: "85,000", payUnitLabel: "Per Month", requirements: ["3+ years experience"], contactName: "Principal Office", contactNumber: "", showNumber: false, startDate: "1 October", templateId: "c2", status: "posted", posted: "6 days ago", applicants: 4, photos: [], coverIndex: 0 },
  { id: "sj9", jobTitle: "Operation Theatre Assistant", facilityName: "Ittefaq Hospital", facilityTypeLabel: "Hospital", city: "Lahore", area: "Model Town", shifts: ["Morning", "Night"], payAmount: "40,000", payUnitLabel: "Per Month", requirements: ["Male candidates", "1+ year experience"], contactName: "OT Incharge", contactNumber: "0333 4455667", showNumber: true, startDate: "Immediately", templateId: "c1", status: "posted", posted: "Today", applicants: 2, photos: [], coverIndex: 0 },
  { id: "sj10", jobTitle: "Dentist", facilityName: "Bright Smile Dental", facilityTypeLabel: "Clinic", city: "Islamabad", area: "F-10 Markaz", shifts: ["Evening"], payAmount: "1,500", payUnitLabel: "Per Visit", requirements: ["PMDC / PNC registered"], contactName: "Dr. Ayesha", contactNumber: "0345 1122334", showNumber: true, startDate: "Immediately", templateId: "c4", status: "posted", posted: "Today", applicants: 1, photos: [], coverIndex: 0 },
];

/* ---------- extra sample listings (frontend-only demo data) ---------- */
const sj = (id, jobTitle, facilityName, facilityTypeLabel, city, area, shifts, payAmount, payUnitLabel, jobType, requirements, posted, applicants, extra = {}) => ({
  id, jobTitle, facilityName, facilityTypeLabel, city, area, shifts, payAmount, payUnitLabel, jobType, requirements, posted, applicants,
  contactName: "HR Department", contactNumber: "", showNumber: false, startDate: "Immediately",
  templateId: ["c1", "c2", "c3", "c4", "c5", "c6"][id.length % 6], status: "posted", photos: [], coverIndex: 0, ...extra,
});

const MORE_SEED_JOBS = [
  // Karachi
  sj("xk1", "Medical Officer", "Seaview Medical Centre", "Hospital", "Karachi", "Clifton Block 5", ["Night"], "9,000", "Per Shift", "Locum", ["PMDC / PNC registered", "1+ year experience"], "3 hours ago", 11, { urgent: true }),
  sj("xk2", "Consultant", "Crescent Women's Hospital", "Hospital", "Karachi", "Gulshan-e-Iqbal Block 13", ["Morning"], "350,000", "Per Month", "Full-time", ["FCPS Gynae", "3+ years experience", "Female candidates"], "1 day ago", 5, { specialty: "Gynecology" }),
  sj("xk3", "Nurse", "Korangi Community Hospital", "Hospital", "Karachi", "Korangi Industrial Area", ["Night"], "60,000", "Per Month", "Full-time", ["PMDC / PNC registered", "1+ year experience"], "5 hours ago", 18),
  sj("xk4", "Pharmacist", "Saddar Family Pharmacy", "Pharmacy", "Karachi", "Saddar", ["Evening"], "70,000", "Per Month", "Full-time", ["Pharmacy Council registered", "Fresh graduates welcome"], "2 days ago", 23),
  sj("xk5", "Physiotherapist", "Karsaz Rehab Centre", "Clinic", "Karachi", "Shahrah-e-Faisal", ["Evening"], "2,000", "Per Visit", "Part-time", ["DPT", "Female candidates"], "4 days ago", 6),
  // Lahore
  sj("xl1", "House Officer", "Johar Town Medical Complex", "Hospital", "Lahore", "Johar Town", ["Morning", "Night"], "75,000", "Per Month", "Internship", ["Fresh graduates welcome", "PMDC / PNC registered"], "6 hours ago", 42),
  sj("xl2", "Consultant", "Gulberg Heart & Vascular", "Hospital", "Lahore", "Gulberg III", ["Evening"], "400,000", "Per Month", "Full-time", ["FCPS Cardiology", "3+ years experience"], "2 days ago", 4, { specialty: "Cardiology" }),
  sj("xl3", "Dentist", "Model Town Dental Studio", "Clinic", "Lahore", "Model Town", ["Evening"], "120,000", "Per Month", "Full-time", ["BDS", "PMDC / PNC registered"], "Yesterday", 12),
  sj("xl4", "Lab Technician", "Ravi Diagnostics", "Diagnostic Lab", "Lahore", "Shahdara", ["Morning"], "48,000", "Per Month", "Full-time", ["1+ year experience", "Computer literate"], "3 days ago", 15),
  sj("xl5", "Medical Officer", "DHA Emergency Clinic", "Clinic", "Lahore", "DHA Phase 6", ["Night"], "7,500", "Per Shift", "Locum", ["PMDC / PNC registered"], "Today", 9, { urgent: true }),
  // Islamabad
  sj("xi1", "Medical Officer", "Margalla Medical Centre", "Hospital", "Islamabad", "F-8 Markaz", ["Morning"], "160,000", "Per Month", "Full-time", ["PMDC / PNC registered", "1+ year experience"], "1 day ago", 27),
  sj("xi2", "Radiographer", "Capital Diagnostics", "Diagnostic Lab", "Islamabad", "G-9 Markaz", ["Evening"], "65,000", "Per Month", "Full-time", ["Diploma in Radiography"], "4 days ago", 8),
  sj("xi3", "Physiotherapist", "Blue Area Physio Clinic", "Clinic", "Islamabad", "Blue Area", ["Morning"], "90,000", "Per Month", "Contract", ["DPT", "1+ year experience"], "1 week ago", 13),
  sj("xi4", "Receptionist", "Sector E-11 Family Clinic", "Clinic", "Islamabad", "E-11/2", ["Morning"], "38,000", "Per Month", "Full-time", ["Urdu & English", "Computer literate"], "2 days ago", 34),
  // Rawalpindi
  sj("xr1", "Doctor", "Saddar Medical Complex", "Hospital", "Rawalpindi", "Saddar", ["Evening"], "6,500", "Per Shift", "Locum", ["PMDC / PNC registered"], "Today", 7, { urgent: true }),
  sj("xr2", "Nurse", "Bahria Care Hospital", "Hospital", "Rawalpindi", "Bahria Town Phase 7", ["Morning", "Evening"], "58,000", "Per Month", "Full-time", ["PMDC / PNC registered", "Female candidates"], "3 days ago", 19),
  sj("xr3", "Pharmacist", "Satellite Town Pharmacy", "Pharmacy", "Rawalpindi", "Satellite Town", ["Morning"], "62,000", "Per Month", "Full-time", ["Pharmacy Council registered"], "5 days ago", 10),
  // Faisalabad
  sj("xf1", "Medical Officer", "Lyallpur General Hospital", "Hospital", "Faisalabad", "Peoples Colony", ["Night"], "130,000", "Per Month", "Full-time", ["PMDC / PNC registered", "Own transport"], "2 days ago", 16),
  sj("xf2", "Operation Theatre Assistant", "Canal Road Surgical", "Hospital", "Faisalabad", "Canal Road", ["Morning"], "38,000", "Per Month", "Full-time", ["1+ year experience"], "6 days ago", 5),
  sj("xf3", "Lab Technician", "D Ground Diagnostics", "Diagnostic Lab", "Faisalabad", "D Ground", ["Evening"], "1,800", "Per Shift", "Part-time", ["Fresh graduates welcome"], "Yesterday", 3),
  // Multan
  sj("xm1", "Consultant", "Multan Kidney Centre", "Hospital", "Multan", "Bosan Road", ["Morning"], "300,000", "Per Month", "Full-time", ["FCPS Nephrology", "3+ years experience"], "4 days ago", 2, { specialty: "Nephrology" }),
  sj("xm2", "Nurse", "Cantt Children's Hospital", "Hospital", "Multan", "Multan Cantt", ["Night"], "52,000", "Per Month", "Full-time", ["PMDC / PNC registered"], "Today", 8),
  sj("xm3", "Medical Officer", "Shah Rukn-e-Alam Clinic", "Clinic", "Multan", "Shah Rukn-e-Alam Colony", ["Evening"], "5,500", "Per Shift", "Locum", ["PMDC / PNC registered"], "2 days ago", 6),
  // Peshawar
  sj("xp1", "Medical Officer", "Khyber Valley Hospital", "Hospital", "Peshawar", "Hayatabad Phase 3", ["Morning"], "140,000", "Per Month", "Full-time", ["PMDC / PNC registered", "Local residents preferred"], "1 day ago", 22),
  sj("xp2", "Lab Technician", "Hayatabad Medical Lab", "Diagnostic Lab", "Peshawar", "Hayatabad Phase 5", ["Night"], "45,000", "Per Month", "Full-time", ["1+ year experience"], "3 days ago", 9),
  sj("xp3", "Demonstrator", "Frontier College of Nursing", "Medical / Diploma College", "Peshawar", "University Town", ["Morning"], "80,000", "Per Month", "Contract", ["MSc Nursing", "3+ years experience"], "1 week ago", 4),
  // Quetta
  sj("xq1", "Doctor", "Bolan Care Hospital", "Hospital", "Quetta", "Jinnah Road", ["Morning"], "150,000", "Per Month", "Full-time", ["PMDC / PNC registered", "Local residents preferred"], "2 days ago", 6),
  sj("xq2", "Pharmacist", "Quetta Cantt Pharmacy", "Pharmacy", "Quetta", "Quetta Cantt", ["Evening"], "60,000", "Per Month", "Full-time", ["Pharmacy Council registered"], "5 days ago", 3),
  sj("xq3", "LHV", "Satellite Town Maternity Home", "Clinic", "Quetta", "Satellite Town", ["Morning"], "40,000", "Per Month", "Full-time", ["LHV diploma", "Female candidates"], "Today", 2, { urgent: true }),
  // Hyderabad
  sj("xh1", "Medical Officer", "Latifabad Medical Centre", "Hospital", "Hyderabad", "Latifabad Unit 7", ["Night"], "6,000", "Per Shift", "Locum", ["PMDC / PNC registered"], "Yesterday", 5),
  sj("xh2", "Consultant", "Qasimabad Children's Clinic", "Clinic", "Hyderabad", "Qasimabad", ["Evening"], "3,000", "Per Visit", "Part-time", ["FCPS Pediatrics"], "3 days ago", 3, { specialty: "Pediatrics" }),
  sj("xh3", "Receptionist", "Auto Bhan Diagnostics", "Diagnostic Lab", "Hyderabad", "Auto Bhan Road", ["Morning"], "32,000", "Per Month", "Full-time", ["Urdu & English"], "6 days ago", 17),
  // Sialkot
  sj("xs1", "Consultant", "Sialkot Eye Clinic", "Clinic", "Sialkot", "Paris Road", ["Evening"], "250,000", "Per Month", "Full-time", ["FCPS Ophthalmology"], "4 days ago", 3, { specialty: "Ophthalmology" }),
  sj("xs2", "Nurse", "Cantt Women's Hospital", "Hospital", "Sialkot", "Sialkot Cantt", ["Morning", "Night"], "50,000", "Per Month", "Full-time", ["PMDC / PNC registered", "Female candidates"], "Yesterday", 11),
  // Gujranwala
  sj("xg1", "Medical Officer", "GT Road Medical Centre", "Hospital", "Gujranwala", "GT Road", ["Night"], "110,000", "Per Month", "Full-time", ["PMDC / PNC registered"], "2 days ago", 14),
  sj("xg2", "Dentist", "Gujranwala Dental Care", "Clinic", "Gujranwala", "Satellite Town", ["Evening"], "1,200", "Per Visit", "Part-time", ["BDS"], "5 days ago", 4),
  // Bahawalpur
  sj("xb1", "Doctor", "Cholistan Health Centre", "Hospital", "Bahawalpur", "Model Town A", ["Morning"], "135,000", "Per Month", "Contract", ["PMDC / PNC registered", "Own transport"], "3 days ago", 7),
  sj("xb2", "Lab Technician", "Bahawalpur City Lab", "Diagnostic Lab", "Bahawalpur", "Circular Road", ["Evening"], "42,000", "Per Month", "Full-time", ["Fresh graduates welcome"], "1 week ago", 5),
];

SEED_JOBS.push(...MORE_SEED_JOBS);

function jobRoleVisual(title = "") {
  const t = String(title).toLowerCase();
  if (t.includes("nurse")) return { Icon: Heart, tint: RED_TINT, color: RED };
  if (t.includes("pharmacist") || t.includes("pharmacy")) return { Icon: Pill, tint: GREEN_TINT, color: GREEN };
  if (t.includes("receptionist") || t.includes("front desk")) return { Icon: Phone, tint: AMBER_TINT, color: AMBER };
  if (t.includes("consultant")) return { Icon: GraduationCap, tint: VIOLET_TINT, color: VIOLET };
  if (t.includes("lab") || t.includes("technician")) return { Icon: FlaskConical, tint: TEAL_TINT, color: TEAL };
  if (t.includes("dentist") || t.includes("dental")) return { Icon: Scissors, tint: AMBER_TINT, color: AMBER };
  if (t.includes("demonstrator") || t.includes("lecturer") || t.includes("professor")) return { Icon: GraduationCap, tint: VIOLET_TINT, color: VIOLET };
  if (t.includes("theatre") || t.includes("operation") || t.includes("surgeon")) return { Icon: Activity, tint: RED_TINT, color: RED };
  if (t.includes("medical officer")) return { Icon: FileText, tint: TEAL_TINT, color: TEAL };
  if (t.includes("doctor") || t.includes("physician") || t.includes("mo ")) return { Icon: Stethoscope, tint: BRAND_50, color: BRAND };
  return { Icon: Briefcase, tint: BRAND_50, color: BRAND };
}

const DOCTOR_SPECIALTIES = [
  "General Physician", "Surgery", "Dermatology", "ENT", "Cardiology", "Pediatrics",
  "Gynecology", "Orthopedics", "Neurology", "Psychiatry", "Ophthalmology", "Dentistry",
  "Urology", "Gastroenterology", "Pulmonology", "Nephrology", "Endocrinology", "Oncology",
];

const DOCTORS = [
  { id: "d1", name: "Dr. Sara Malik", specialty: "General Physician", qual: "MBBS, FCPS Medicine", city: "Karachi", area: "Gulshan-e-Iqbal", clinic: "Aga Care Clinic", fee: "1,500", rating: 4.8, reviews: 214, exp: "9 yrs", verified: true, online: true, phone: "0300 1112233", showPhone: true, slots: "Today 4:00 PM" },
  { id: "d2", name: "Dr. Hamza Iqbal", specialty: "Cardiology", qual: "MBBS, FCPS Cardiology", city: "Lahore", area: "Jail Road", clinic: "City Heart Clinic", fee: "3,000", rating: 4.9, reviews: 402, exp: "14 yrs", verified: true, online: true, phone: "0321 4455667", showPhone: true, slots: "Tomorrow 6:00 PM" },
  { id: "d3", name: "Dr. Noor Fatima", specialty: "Pediatrics", qual: "MBBS, FCPS Pediatrics", city: "Islamabad", area: "F-10 Markaz", clinic: "Kids Care Centre", fee: "2,000", rating: 4.7, reviews: 158, exp: "7 yrs", verified: true, online: false, phone: "0333 7788990", showPhone: false, slots: "Today 5:30 PM" },
  { id: "d4", name: "Dr. Bilal Ahmed", specialty: "Dermatology", qual: "MBBS, MCPS Dermatology", city: "Lahore", area: "DHA Phase 4", clinic: "Skin & Laser Clinic", fee: "2,500", rating: 4.6, reviews: 97, exp: "6 yrs", verified: true, online: true, phone: "0345 2233445", showPhone: true, slots: "Today 7:00 PM" },
  { id: "d5", name: "Dr. Ayesha Siddiqui", specialty: "Gynecology", qual: "MBBS, FCPS Gynae", city: "Karachi", area: "DHA Phase 5", clinic: "Mother & Child Clinic", fee: "2,500", rating: 4.9, reviews: 331, exp: "12 yrs", verified: true, online: false, phone: "0301 9988776", showPhone: false, slots: "Tomorrow 11:00 AM" },
  { id: "d6", name: "Dr. Kamran Rashid", specialty: "Orthopedics", qual: "MBBS, FCPS Orthopedics", city: "Faisalabad", area: "Susan Road", clinic: "Bone & Joint Centre", fee: "2,000", rating: 4.5, reviews: 76, exp: "10 yrs", verified: true, online: false, phone: "0322 6677889", showPhone: true, slots: "Today 6:00 PM" },
  { id: "d7", name: "Dr. Usman Tariq", specialty: "ENT", qual: "MBBS, FCPS ENT", city: "Karachi", area: "Gulshan-e-Iqbal", clinic: "ENT Care Centre", fee: "1,800", rating: 4.4, reviews: 63, exp: "5 yrs", verified: false, online: true, phone: "0302 5544332", showPhone: true, slots: "Today 8:00 PM" },
  { id: "d8", name: "Dr. Zainab Khan", specialty: "Psychiatry", qual: "MBBS, MRCPsych", city: "Islamabad", area: "Blue Area", clinic: "Mind Wellness Clinic", fee: "3,500", rating: 4.8, reviews: 142, exp: "11 yrs", verified: true, online: true, phone: "0346 1122990", showPhone: false, slots: "Tomorrow 3:00 PM" },
  { id: "d9", name: "Dr. Omar Sheikh", specialty: "Surgery", qual: "MBBS, FCPS Surgery", city: "Lahore", area: "Model Town", clinic: "Ittefaq Surgical", fee: "3,000", rating: 4.7, reviews: 188, exp: "13 yrs", verified: true, online: false, phone: "0300 7766554", showPhone: true, slots: "Today 2:00 PM" },
  { id: "d10", name: "Dr. Hina Riaz", specialty: "Dentistry", qual: "BDS, FCPS Dentistry", city: "Peshawar", area: "University Road", clinic: "Bright Smile Dental", fee: "1,200", rating: 4.6, reviews: 88, exp: "8 yrs", verified: true, online: false, phone: "0315 3344556", showPhone: true, slots: "Today 5:00 PM" },
  { id: "d11", name: "Dr. Faisal Mehmood", specialty: "Neurology", qual: "MBBS, FCPS Neurology", city: "Karachi", area: "Clifton", clinic: "Neuro Care Centre", fee: "4,000", rating: 4.9, reviews: 276, exp: "16 yrs", verified: true, online: true, phone: "0333 2211009", showPhone: false, slots: "Tomorrow 10:00 AM" },
  { id: "d12", name: "Dr. Sana Yousaf", specialty: "General Physician", qual: "MBBS", city: "Multan", area: "Bosan Road", clinic: "Family Health Clinic", fee: "1,000", rating: 4.3, reviews: 41, exp: "4 yrs", verified: true, online: true, phone: "0306 8899001", showPhone: true, slots: "Today 4:30 PM" },
];

/* ---------- shared filter bar bits ---------- */
function FilterPill({ label, value, onClear, onClick }) {
  const active = !!value;
  return (
    <button
      onClick={active ? onClear : onClick}
      className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
      style={{
        backgroundColor: active ? NAVY : "white",
        color: active ? "white" : INK,
        border: `1.5px solid ${active ? NAVY : CARD_BORDER}`,
      }}
    >
      {active ? value : label}
      {active ? <X className="w-3.5 h-3.5" strokeWidth={3} /> : <ChevronRight className="w-3.5 h-3.5 rotate-90" />}
    </button>
  );
}

function FilterSheet({ title, options, selected, onSelect, onClose, allowFree, freeLabel }) {
  const [q, setQ] = useState("");
  const filtered = q.trim() ? options.filter((o) => o.toLowerCase().includes(q.trim().toLowerCase())) : options;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "76vh" }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b shrink-0" style={{ borderColor: CARD_BORDER }}>
          <span className="w-8" />
          <p className="font-bold text-[15px]" style={{ color: INK }}>{title}</p>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>

        <div className="px-4 py-3 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: SUBTLE }} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={allowFree ? (freeLabel || "Search or type…") : "Search…"}
              className="w-full text-[14.5px] rounded-xl pl-10 pr-3.5 py-3 outline-none"
              style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }}
            />
          </div>
          {allowFree && q.trim() && !options.some((o) => o.toLowerCase() === q.trim().toLowerCase()) && (
            <button
              onClick={() => { onSelect(q.trim()); onClose(); }}
              className="w-full mt-2.5 rounded-xl px-3.5 py-3 text-left active:scale-[0.98] transition-transform"
              style={{ backgroundColor: GREEN_TINT, border: `1.5px dashed ${GREEN}` }}
            >
              <span className="text-[13.5px] font-semibold" style={{ color: GREEN }}>Search for "{q.trim()}"</span>
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          {selected && (
            <button
              onClick={() => { onSelect(""); onClose(); }}
              className="w-full text-left px-3.5 py-3 rounded-xl mb-1.5 text-[13.5px] font-semibold"
              style={{ backgroundColor: "#FBEBEC", color: RED }}
            >
              Clear selection
            </button>
          )}
          {filtered.length === 0 && (
            <p className="text-[13px] text-center py-6" style={{ color: SUBTLE }}>No matches. Try a different spelling.</p>
          )}
          {filtered.map((o) => (
            <button
              key={o}
              onClick={() => { onSelect(o); onClose(); }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-left active:opacity-70"
              style={{ backgroundColor: selected === o ? "#EAF0F8" : "transparent" }}
            >
              <span className="text-[14.5px]" style={{ color: INK, fontWeight: selected === o ? 700 : 400 }}>{o}</span>
              {selected === o && <Check className="w-4 h-4" strokeWidth={3} style={{ color: NAVY }} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIND A JOB
   ========================================================= */
/* ---------- branded dropdowns (replace native selects) ---------- */
function useClickOutside(ref, onOutside, active) {
  useEffect(() => {
    if (!active) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onOutside(); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [ref, onOutside, active]);
}

function Dropdown({ value, options, onChange, icon: Icon, label, align = "right", size = "md", className = "" }) {
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const rootRef = useRef(null);
  const listRef = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(rootRef, close, open);

  const current = options.find((o) => o.value === value) || options[0];
  const openMenu = () => { setHi(Math.max(0, options.findIndex((o) => o.value === value))); setOpen(true); };
  const pick = (o) => { onChange(o.value); setOpen(false); };

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[hi];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [hi, open]);

  const onKeyDown = (e) => {
    if (!open && ["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) { e.preventDefault(); openMenu(); return; }
    if (!open) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHi((i) => Math.min(options.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === "Home") { e.preventDefault(); setHi(0); }
    else if (e.key === "End") { e.preventDefault(); setHi(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(options[hi]); }
    else if (e.key === "Escape" || e.key === "Tab") setOpen(false);
  };

  const h = size === "sm" ? "h-9" : "h-10";
  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label}
        className={`${h} w-full pl-3 pr-2.5 rounded-xl inline-flex items-center gap-2 bg-white text-[13.5px] font-semibold transition-all`}
        style={{
          color: INK,
          border: `1px solid ${open ? BRAND : CARD_BORDER}`,
          boxShadow: open ? "0 0 0 4px rgba(11,87,183,0.12)" : "none",
        }}
      >
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: open ? BRAND : SUBTLE }} />}
        <span className="truncate flex-1 text-left">{current && current.label}</span>
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: open ? BRAND : SUBTLE, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={label}
          className={`dropdown-pop absolute z-50 mt-2 min-w-full w-max max-w-[280px] max-h-72 overflow-y-auto p-1.5 rounded-xl bg-white ${align === "left" ? "left-0" : "right-0"}`}
          style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 16px 40px -12px rgba(16,24,40,0.25)" }}
        >
          {options.map((o, i) => {
            const selected = o.value === value;
            const active = i === hi;
            return (
              <li
                key={o.value}
                role="option"
                aria-selected={selected}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                className="flex items-center gap-2.5 h-10 px-3 rounded-lg cursor-pointer text-[14px] transition-colors"
                style={{
                  color: selected ? BRAND : INK,
                  fontWeight: selected ? 700 : 500,
                  backgroundColor: active ? (selected ? BRAND_50 : CREAM) : selected ? BRAND_50 : "transparent",
                }}
              >
                <span className="flex-1 whitespace-nowrap">{o.label}</span>
                {selected && <Check className="w-4 h-4 shrink-0" style={{ color: BRAND }} />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const JOB_SHIFT_LABELS = ["Morning", "Evening", "Night", "On Call"];
const JOB_FACILITY_LABELS = ["Hospital", "Clinic", "Diagnostic Lab", "Pharmacy", "Medical / Diploma College"];
const JOB_POSTED_WINDOWS = [
  { key: "any", label: "Any time", hours: Infinity },
  { key: "24h", label: "Last 24 hours", hours: 24 },
  { key: "3d", label: "Last 3 days", hours: 72 },
  { key: "7d", label: "Last 7 days", hours: 168 },
];
const JOB_SORTS = [
  { key: "newest", label: "Newest first" },
  { key: "pay", label: "Highest pay" },
  { key: "applicants", label: "Fewest applicants" },
];
const JOB_PAGE_SIZE = 12;

function jobTypeOf(j) {
  const raw = j.jobType || "";
  if (raw && raw !== "Locum") return raw;
  const unit = (j.payUnitLabel || "").toLowerCase();
  if (raw === "Locum" || unit.includes("shift") || unit.includes("visit") || unit.includes("hour")) return "Part-time";
  return "Full-time";
}

function jobPostedHours(posted = "") {
  const p = String(posted).toLowerCase();
  if (!p || p.includes("just") || p === "today") return p === "today" ? 6 : 0;
  if (p.includes("yesterday")) return 30;
  const n = parseFloat(p) || 1;
  if (p.includes("min")) return n / 60;
  if (p.includes("hour")) return n;
  if (p.includes("day")) return n * 24;
  if (p.includes("week")) return n * 168;
  if (p.includes("month")) return n * 720;
  return 9999;
}

// rough monthly equivalent so different pay units can be compared
function jobMonthlyPay(j) {
  const amt = parseFloat(String(j.payAmount || "").replace(/,/g, "")) || 0;
  const unit = (j.payUnitLabel || "").toLowerCase();
  if (unit.includes("shift")) return amt * 22;
  if (unit.includes("day")) return amt * 26;
  if (unit.includes("hour")) return amt * 8 * 26;
  if (unit.includes("visit")) return amt * 40;
  return amt;
}

function JobFilterGroup({ title, options, selected, onToggle, counts, labels, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const activeCount = (selected || []).length;
  return (
    <div className="py-1" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 min-h-[44px] text-left"
        aria-expanded={open}
      >
        <p className="flex-1 text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: INK }}>{title}</p>
        {activeCount > 0 && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: BRAND, backgroundColor: BRAND_50 }}>{activeCount}</span>
        )}
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: SUBTLE, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && (
        <div className="space-y-1 pb-3">
          {options.map((o) => {
            const on = selected.includes(o);
            const n = counts ? counts[o] || 0 : null;
            return (
              <label key={o} className="flex items-center gap-2.5 min-h-[36px] px-2 -mx-2 rounded-lg cursor-pointer hover:bg-[#F5F7FA]">
                <input type="checkbox" checked={on} onChange={() => onToggle(o)} className="w-4 h-4 rounded accent-[#0B57B7] shrink-0" />
                <span className="flex-1 text-[14px]" style={{ color: on ? INK : INK_2, fontWeight: on ? 600 : 500 }}>{labels ? labels[o] : o}</span>
                {n !== null && <span className="text-[12px] font-semibold" style={{ color: FAINT }}>{n}</span>}
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

function JobFilterSection({ title, defaultOpen = false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="py-1" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 min-h-[44px] text-left"
        aria-expanded={open}
      >
        <p className="flex-1 text-[13px] font-bold uppercase tracking-[0.06em]" style={{ color: INK }}>{title}</p>
        {badge > 0 && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: BRAND, backgroundColor: BRAND_50 }}>{badge}</span>
        )}
        <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: SUBTLE, transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      {open && <div className="pb-3">{children}</div>}
    </div>
  );
}

function JobFiltersPanel({ f, setF, counts }) {
  const toggle = (key) => (v) => setF((prev) => ({ ...prev, [key]: prev[key].includes(v) ? prev[key].filter((x) => x !== v) : [...prev[key], v] }));
  const moreBadge = (f.urgentOnly ? 1 : 0) + (f.freshers ? 1 : 0) + (f.pmdc ? 1 : 0);
  return (
    <div>
      <JobFilterGroup title="Job type" options={JOB_TYPES} selected={f.types} onToggle={toggle("types")} counts={counts.types} defaultOpen />
      <JobFilterGroup title="Shift" options={JOB_SHIFT_LABELS} selected={f.shifts} onToggle={toggle("shifts")} counts={counts.shifts} defaultOpen />
      <JobFilterGroup title="Facility" options={JOB_FACILITY_LABELS} selected={f.facilities} onToggle={toggle("facilities")} counts={counts.facilities} defaultOpen={false} />
      <JobFilterSection title="Date posted" defaultOpen={false} badge={f.posted !== "any" ? 1 : 0}>
        <div className="space-y-1">
          {JOB_POSTED_WINDOWS.map((w) => (
            <label key={w.key} className="flex items-center gap-2.5 min-h-[36px] px-2 -mx-2 rounded-lg cursor-pointer hover:bg-[#F5F7FA]">
              <input type="radio" name="job-posted" checked={f.posted === w.key} onChange={() => setF((p) => ({ ...p, posted: w.key }))} className="w-4 h-4 accent-[#0B57B7] shrink-0" />
              <span className="text-[14px]" style={{ color: f.posted === w.key ? INK : INK_2, fontWeight: f.posted === w.key ? 600 : 500 }}>{w.label}</span>
            </label>
          ))}
        </div>
      </JobFilterSection>
      <JobFilterSection title="More filters" defaultOpen={false} badge={moreBadge}>
        <div className="space-y-1">
          {[["urgentOnly", "Urgent hiring only"], ["freshers", "Fresh graduates welcome"], ["pmdc", "PMDC / PNC registration"]].map(([k, label]) => (
            <label key={k} className="flex items-center justify-between gap-3 min-h-[40px] cursor-pointer">
              <span className="text-[14px] font-medium" style={{ color: INK_2 }}>{label}</span>
              <button type="button" role="switch" aria-checked={f[k]} onClick={() => setF((p) => ({ ...p, [k]: !p[k] }))}
                className="w-10 h-6 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
                style={{ backgroundColor: f[k] ? BRAND : "#D0D5DD", justifyContent: f[k] ? "flex-end" : "flex-start" }}>
                <span className="w-5 h-5 rounded-full bg-white block shadow-sm" />
              </button>
            </label>
          ))}
        </div>
      </JobFilterSection>
    </div>
  );
}

const EMPTY_JOB_FILTERS = { types: [], shifts: [], facilities: [], posted: "any", urgentOnly: false, freshers: false, pmdc: false };

function filterSuggestions(list, query, limit = 8) {
  const q = String(query || "").trim().toLowerCase();
  const ranked = list.filter(Boolean);
  if (!q) return ranked.slice(0, limit);
  const starts = [];
  const contains = [];
  ranked.forEach((item) => {
    const s = String(item).toLowerCase();
    if (s.startsWith(q)) starts.push(item);
    else if (s.includes(q)) contains.push(item);
  });
  return [...starts, ...contains].slice(0, limit);
}

function SearchSuggestInput({
  icon: Icon,
  value,
  onChange,
  onPick,
  onClear,
  placeholder,
  suggestions,
  srLabel,
  className = "",
  style,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const matches = filterSuggestions(suggestions, value, 8);
  const show = open && matches.length > 0;

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={wrapRef} className={`relative ${className}`} style={style}>
      <label className="flex items-center gap-3 h-12 px-3 rounded-xl">
        <Icon className="w-5 h-5 shrink-0" style={{ color: BRAND }} />
        <span className="sr-only">{srLabel}</span>
        <input
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && show && matches[0]) {
              e.preventDefault();
              onPick(matches[0]);
              setOpen(false);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
          style={{ color: INK }}
        />
        {value && (
          <button type="button" onClick={() => { onClear(); setOpen(false); }} aria-label={`Clear ${srLabel}`}>
            <X className="w-4 h-4" style={{ color: FAINT }} />
          </button>
        )}
      </label>
      {show && (
        <ul
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-64 overflow-y-auto rounded-xl bg-white py-1.5"
          style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 16px 36px -14px rgba(16,24,40,0.28)" }}
          role="listbox"
        >
          {matches.map((item) => (
            <li key={item}>
              <button
                type="button"
                role="option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onPick(item); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-left text-[14px] font-semibold hover:bg-[#EAF2FC]"
                style={{ color: INK }}
              >
                <Icon className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                <span className="truncate">{item}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FindJobScreen({ initialQuery, userCity, onBack, onMenu, postedJobs, onReport, reportedIds, jobSocial, onToggleLike, onToggleFav, onAddComment, onContact, onApply, hasApplied }) {
  const gate = useContext(AuthGate);
  const authed = gate.authed;

  // committed search (what the results use) vs. what's typed in the two boxes
  const [keyword, setKeyword] = useState(initialQuery || "");
  const [location, setLocation] = useState(initialQuery ? "" : (userCity || ""));
  const [kwDraft, setKwDraft] = useState(initialQuery || "");
  const [locDraft, setLocDraft] = useState(initialQuery ? "" : (userCity || ""));
  const [typeTab, setTypeTab] = useState("All");
  const [f, setF] = useState(EMPTY_JOB_FILTERS);
  const [sort, setSort] = useState("newest");
  const [limit, setLimit] = useState(JOB_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openJob, setOpenJob] = useState(null);
  const [shareJob, setShareJob] = useState(null);
  const resultsRef = useRef(null);

  const all = [...postedJobs.filter((j) => j.status === "posted"), ...SEED_JOBS];
  const cityOptions = [...new Set([...CITIES, ...all.map((j) => j.city), ...all.map((j) => j.area).filter(Boolean)])].filter(Boolean).sort();
  const titleOptions = [...new Set([
    ...JOB_TITLES.filter((t) => t !== "Other"),
    ...all.map((j) => j.jobTitle),
    ...all.map((j) => j.facilityName),
    ...all.map((j) => j.facilityTypeLabel),
  ])].filter(Boolean).sort();
  const cityCounts = all.reduce((acc, j) => ({ ...acc, [j.city]: (acc[j.city] || 0) + 1 }), {});

  useEffect(() => { setLimit(JOB_PAGE_SIZE); }, [keyword, location, typeTab, f, sort]);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [filtersOpen]);

  const kw = keyword.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  const postedLimit = (JOB_POSTED_WINDOWS.find((w) => w.key === f.posted) || JOB_POSTED_WINDOWS[0]).hours;

  // everything except the job-type tab, so tab counts stay meaningful
  const base = all.filter((j) => {
    const reqs = (j.requirements || []).join(" ").toLowerCase();
    if (kw && ![j.jobTitle, j.facilityName, j.facilityTypeLabel, j.specialty, ...(j.requirements || [])]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(kw))) return false;
    if (loc && ![j.city, j.area].filter(Boolean).some((v) => String(v).toLowerCase().includes(loc))) return false;
    if (f.types.length && !f.types.includes(jobTypeOf(j))) return false;
    if (f.shifts.length && !(j.shifts || []).some((s) => f.shifts.includes(s))) return false;
    if (f.facilities.length && !f.facilities.includes(j.facilityTypeLabel)) return false;
    if (jobPostedHours(j.posted) > postedLimit) return false;
    if (f.urgentOnly && !j.urgent) return false;
    if (f.freshers && !reqs.includes("fresh")) return false;
    if (f.pmdc && !reqs.includes("pmdc")) return false;
    return true;
  });
  const results = (typeTab === "All" ? base : base.filter((j) => jobTypeOf(j) === typeTab)).slice().sort((a, b) => {
    if (sort === "pay") return jobMonthlyPay(b) - jobMonthlyPay(a);
    if (sort === "applicants") return (a.applicants || 0) - (b.applicants || 0);
    return jobPostedHours(a.posted) - jobPostedHours(b.posted);
  });
  const shown = results.slice(0, limit);

  const countBy = (fn) => base.reduce((acc, j) => { [].concat(fn(j)).forEach((k) => { acc[k] = (acc[k] || 0) + 1; }); return acc; }, {});
  const counts = { types: countBy(jobTypeOf), shifts: countBy((j) => j.shifts || []), facilities: countBy((j) => j.facilityTypeLabel) };
  const tabCounts = countBy(jobTypeOf);

  const activeChips = [
    keyword && { label: `“${keyword}”`, clear: () => { setKeyword(""); setKwDraft(""); } },
    location && { label: location, icon: MapPin, clear: () => { setLocation(""); setLocDraft(""); } },
    ...f.types.map((v) => ({ label: v, clear: () => setF((p) => ({ ...p, types: p.types.filter((x) => x !== v) })) })),
    ...f.shifts.map((v) => ({ label: v, clear: () => setF((p) => ({ ...p, shifts: p.shifts.filter((x) => x !== v) })) })),
    ...f.facilities.map((v) => ({ label: v, clear: () => setF((p) => ({ ...p, facilities: p.facilities.filter((x) => x !== v) })) })),
    f.posted !== "any" && { label: JOB_POSTED_WINDOWS.find((w) => w.key === f.posted).label, clear: () => setF((p) => ({ ...p, posted: "any" })) },
    f.urgentOnly && { label: "Urgent", clear: () => setF((p) => ({ ...p, urgentOnly: false })) },
    f.freshers && { label: "Freshers welcome", clear: () => setF((p) => ({ ...p, freshers: false })) },
    f.pmdc && { label: "PMDC / PNC", clear: () => setF((p) => ({ ...p, pmdc: false })) },
  ].filter(Boolean);
  const panelFilterCount = f.types.length + f.shifts.length + f.facilities.length + (f.posted !== "any") + f.urgentOnly + f.freshers + f.pmdc;

  const clearAll = () => {
    setKeyword(""); setKwDraft(""); setLocation(""); setLocDraft(""); setTypeTab("All"); setF(EMPTY_JOB_FILTERS);
  };
  const runSearch = (e) => {
    if (e) e.preventDefault();
    setKeyword(kwDraft.trim());
    setLocation(locDraft.trim());
    if (resultsRef.current && window.innerWidth < 1024) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pickKeyword = (v) => { setKwDraft(v); setKeyword(v); };
  const pickLocation = (v) => { setLocDraft(v); setLocation(v); };
  const open = (j) => gate.require("see the employer and apply", () => setOpenJob(j));

  return (
    <div className="w-full min-w-0" style={{ fontFamily: FONT }}>
      {/* search hero */}
      <section className="relative z-10" style={{ background: `linear-gradient(135deg, ${BRAND_DK} 0%, ${BRAND} 70%, #2F7BDA 100%)` }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-5">
            {onBack && (
              <button type="button" onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <p className="text-[13px] font-semibold text-white/80">Home <span className="mx-1 text-white/50">/</span> <span className="text-white">Find a Job</span></p>
          </div>
          <h1 className="text-[28px] sm:text-[38px] font-extrabold tracking-[-0.03em] leading-tight text-white">Find your next healthcare job</h1>
          <p className="text-[14.5px] sm:text-[16px] mt-2 text-white/80">{all.length} openings across {Object.keys(cityCounts).length} cities in Pakistan</p>

          <form onSubmit={runSearch} className="mt-6 bg-white rounded-2xl p-2 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_auto] gap-2 relative z-20" style={{ boxShadow: "0 20px 40px -20px rgba(0,0,0,0.4)" }}>
            <SearchSuggestInput
              icon={Briefcase}
              value={kwDraft}
              onChange={setKwDraft}
              onPick={pickKeyword}
              onClear={() => { setKwDraft(""); setKeyword(""); }}
              placeholder="Job title, specialty or hospital"
              suggestions={titleOptions}
              srLabel="Job title or keyword"
              className="md:border-r rounded-xl"
              style={{ borderColor: CARD_BORDER }}
            />
            <SearchSuggestInput
              icon={MapPin}
              value={locDraft}
              onChange={setLocDraft}
              onPick={pickLocation}
              onClear={() => { setLocDraft(""); setLocation(""); }}
              placeholder="City or area in Pakistan"
              suggestions={cityOptions}
              srLabel="City or area"
              className="rounded-xl"
            />
            <button type="submit" className="h-12 px-7 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110" style={{ backgroundColor: BRAND }}>
              <Search className="w-4 h-4" /> Search jobs
            </button>
          </form>
        </div>
      </section>

      <div ref={resultsRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 scroll-mt-20">
        {/* job type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }} role="tablist" aria-label="Job type">
          {["All", ...JOB_TYPES].map((t) => {
            const on = typeTab === t;
            const n = t === "All" ? base.length : tabCounts[t] || 0;
            return (
              <button key={t} type="button" role="tab" aria-selected={on} onClick={() => setTypeTab(t)}
                className="shrink-0 h-10 px-4 rounded-xl text-[14px] font-bold inline-flex items-center gap-2 transition-all"
                style={{ backgroundColor: on ? INK : "#fff", color: on ? "#fff" : INK_2, border: `1px solid ${on ? INK : CARD_BORDER}` }}>
                {t}
                <span className="text-[11.5px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: on ? "rgba(255,255,255,0.18)" : CREAM, color: on ? "#fff" : SUBTLE }}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[264px_1fr] gap-6 items-start">
          {/* sidebar filters (desktop) */}
          <aside className="hidden lg:block sticky top-[88px] rounded-2xl bg-white px-5 pt-4 pb-1" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <div className="flex items-center justify-between pb-3">
              <p className="text-[16px] font-extrabold flex items-center gap-2" style={{ color: INK }}><SlidersHorizontal className="w-4 h-4" /> Filters</p>
              {panelFilterCount > 0 && (
                <button type="button" onClick={() => setF(EMPTY_JOB_FILTERS)} className="text-[13px] font-bold" style={{ color: BRAND }}>Clear</button>
              )}
            </div>
            <JobFiltersPanel f={f} setF={setF} counts={counts} />
          </aside>

          <div className="min-w-0">
            {/* toolbar */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-[14.5px] mr-auto" style={{ color: SUBTLE }}>
                <b className="text-[16px]" style={{ color: INK }}>{results.length}</b> {results.length === 1 ? "job" : "jobs"}
                {location ? <> in <b style={{ color: INK }}>{location}</b></> : " across Pakistan"}
              </p>
              <button type="button" onClick={() => setFiltersOpen(true)}
                className="lg:hidden h-10 px-3.5 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-2 bg-white"
                style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {panelFilterCount > 0 && <span className="w-5 h-5 rounded-full text-[11px] text-white flex items-center justify-center" style={{ backgroundColor: BRAND }}>{panelFilterCount}</span>}
              </button>
              <Dropdown
                label="Sort jobs"
                icon={ArrowUpDown}
                value={sort}
                onChange={setSort}
                options={JOB_SORTS.map((o) => ({ value: o.key, label: o.label }))}
              />
            </div>

            {activeChips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeChips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full text-[12.5px] font-semibold" style={{ color: BRAND_DK, backgroundColor: BRAND_50, border: "1px solid #B9D3F2" }}>
                    {c.icon && <c.icon className="w-3.5 h-3.5" />} {c.label}
                    <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <button type="button" onClick={clearAll} className="text-[13px] font-bold px-2 h-8" style={{ color: RED }}>Clear all</button>
              </div>
            )}

            {!authed && (
              <div className="rounded-2xl p-3.5 mb-4 flex items-center gap-3" style={{ backgroundColor: "#fff", border: "1px solid #B9D3F2" }}>
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_50 }}>
                  <ShieldCheck className="w-[18px] h-[18px]" style={{ color: BRAND }} />
                </span>
                <p className="text-[13.5px] flex-1 leading-snug" style={{ color: INK_2 }}>Sign in to see employer names, exact locations and contact details, and to apply.</p>
                <button type="button" onClick={() => gate.require("see full job details", null)} className="h-9 px-3.5 rounded-lg text-[13px] font-bold text-white shrink-0" style={{ backgroundColor: BRAND }}>Sign in</button>
              </div>
            )}

            {results.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-14 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND_50 }}>
                  <Search className="w-6 h-6" style={{ color: BRAND }} />
                </span>
                <p className="text-[17px] font-bold" style={{ color: INK }}>No jobs match your search</p>
                <p className="text-[14px] mt-1 mb-5" style={{ color: SUBTLE }}>Try a nearby city, a broader job title, or fewer filters.</p>
                <button type="button" onClick={clearAll} className="h-11 px-5 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {shown.map((j) => {
                    const vis = jobRoleVisual(j.jobTitle);
                    const social = jobSocial[j.id] || {};
                    const type = jobTypeOf(j);
                    const applied = hasApplied ? hasApplied(j.id) : false;
                    return (
                      <article
                        key={j.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => open(j)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(j); } }}
                        className="group rounded-2xl bg-white p-4 sm:p-5 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: vis.tint }}>
                            <vis.Icon className="w-[22px] h-[22px]" style={{ color: vis.color }} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start gap-2">
                              <p className="text-[16px] font-bold leading-snug flex-1 min-w-0 group-hover:text-[#0B57B7] transition-colors" style={{ color: INK }}>
                                {j.jobTitle}{j.specialty ? <span className="font-semibold" style={{ color: SUBTLE }}> · {j.specialty}</span> : null}
                              </p>
                              {j.urgent && (
                                <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: RED, backgroundColor: RED_TINT }}>
                                  <Zap className="w-3 h-3" /> Urgent
                                </span>
                              )}
                            </div>
                            <p className="text-[13.5px] mt-0.5 truncate" style={{ color: authed ? INK_2 : SUBTLE, fontWeight: authed ? 600 : 500 }}>
                              {authed ? j.facilityName : `${j.facilityTypeLabel || "Facility"} · employer shown after sign in`}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 text-[13px]" style={{ color: INK_2 }}>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" style={{ color: FAINT }} />{authed ? [j.area, j.city].filter(Boolean).join(", ") : j.city}</span>
                          <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" style={{ color: FAINT }} />{(j.shifts || []).join(", ") || "Flexible"}</span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="text-[11.5px] font-bold px-2 py-1 rounded-md" style={{ color: BRAND, backgroundColor: BRAND_50 }}>{type}</span>
                          {(j.requirements || []).slice(0, 2).map((rq) => (
                            <span key={rq} className="text-[11.5px] font-semibold px-2 py-1 rounded-md" style={{ color: INK_2, backgroundColor: CREAM }}>{rq}</span>
                          ))}
                        </div>

                        <div className="flex items-end justify-between gap-3 mt-4 pt-3.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                          <div className="min-w-0">
                            <p className="text-[17px] font-extrabold leading-none" style={{ color: GREEN }}>
                              PKR {j.payAmount}
                              <span className="text-[12px] font-semibold ml-1" style={{ color: SUBTLE }}>/ {(j.payUnitLabel || "").replace(/^Per /i, "").toLowerCase() || "month"}</span>
                            </p>
                            <p className="text-[12px] mt-1.5" style={{ color: FAINT }}>
                              {j.posted}{typeof j.applicants === "number" ? ` · ${j.applicants} applied` : ""}{applied ? " · You applied" : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleFav(j.id); }}
                              aria-label={social.favourite ? "Remove from saved" : "Save job"}
                              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]"
                              style={{ border: `1px solid ${social.favourite ? "#B9D3F2" : CARD_BORDER}`, backgroundColor: social.favourite ? BRAND_50 : "#fff" }}>
                              <Bookmark className="w-4 h-4" fill={social.favourite ? BRAND : "none"} stroke={social.favourite ? BRAND : SUBTLE} />
                            </button>
                            <button type="button" onClick={(e) => { e.stopPropagation(); gate.require("share this job", () => setShareJob(j)); }}
                              aria-label="Share job"
                              className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]"
                              style={{ border: `1px solid ${CARD_BORDER}` }}>
                              <Repeat2 className="w-4 h-4" style={{ color: SUBTLE }} />
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {results.length > shown.length && (
                  <div className="text-center mt-6">
                    <button type="button" onClick={() => setLimit((l) => l + JOB_PAGE_SIZE)}
                      className="h-11 px-6 rounded-xl text-[14px] font-bold bg-white transition-shadow hover:shadow-md" style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}>
                      Show more jobs ({results.length - shown.length} left)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* mobile filter sheet */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/45" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] bg-white rounded-t-3xl flex flex-col auth-step">
            <div className="flex items-center justify-between px-5 h-14 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[17px] font-extrabold" style={{ color: INK }}>Filters</p>
              <div className="flex items-center gap-2">
                {panelFilterCount > 0 && <button type="button" onClick={() => setF(EMPTY_JOB_FILTERS)} className="text-[13.5px] font-bold px-2" style={{ color: BRAND }}>Clear</button>}
                <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
                  <X className="w-5 h-5" style={{ color: INK }} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 -mt-px">
              <JobFiltersPanel f={f} setF={setF} counts={counts} />
            </div>
            <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <button type="button" onClick={() => setFiltersOpen(false)} className="w-full h-12 rounded-xl text-[15px] font-bold text-white" style={{ backgroundColor: BRAND }}>
                Show {results.length} {results.length === 1 ? "job" : "jobs"}
              </button>
            </div>
          </div>
        </div>
      )}

      {shareJob && <JobShareSheet job={shareJob} onClose={() => setShareJob(null)} />}

      {openJob && (
        <JobDetailSheet
          job={openJob}
          onClose={() => setOpenJob(null)}
          onReport={onReport}
          reported={reportedIds.has(openJob.id)}
          social={jobSocial[openJob.id]}
          onToggleLike={onToggleLike}
          onToggleFav={onToggleFav}
          onAddComment={onAddComment}
          onContact={onContact}
          onApply={onApply}
          hasApplied={hasApplied ? hasApplied(openJob.id) : false}
        />
      )}
    </div>
  );
}

/* ---------- role-based requirements & application documents ---------- */
function jobRoleKind(title = "") {
  const t = String(title).toLowerCase();
  if (t.includes("consultant")) return "consultant";
  if (t.includes("house officer")) return "house";
  if (t.includes("doctor") || t.includes("medical officer") || t.includes("physician")) return "doctor";
  if (t.includes("dentist")) return "dentist";
  if (t.includes("nurse") || t.includes("lhv")) return "nurse";
  if (t.includes("pharmac")) return "pharmacist";
  if (t.includes("lab") || t.includes("technician")) return "lab";
  if (t.includes("radiograph")) return "radiographer";
  if (t.includes("physio")) return "physio";
  if (t.includes("theatre") || t.includes("operation")) return "ot";
  if (t.includes("demonstrator") || t.includes("lecturer")) return "academic";
  return "admin";
}

const ROLE_REQUIREMENTS = {
  consultant: ["MBBS from a PMDC-recognised institution", "FCPS / MCPS or equivalent postgraduate degree", "Valid PMDC registration"],
  doctor: ["MBBS from a PMDC-recognised institution", "Valid PMDC registration", "House job completed"],
  house: ["MBBS (final results awaited or completed)", "Provisional PMDC registration"],
  dentist: ["BDS from a PMDC-recognised institution", "Valid PMDC registration"],
  nurse: ["Diploma / BSc in Nursing", "Valid PNC registration"],
  pharmacist: ["Pharm-D degree", "Pharmacy Council registration"],
  lab: ["Diploma / BS in Medical Lab Technology", "Knowledge of lab safety & sample handling"],
  radiographer: ["Diploma / BS in Radiography or Medical Imaging"],
  physio: ["Doctor of Physical Therapy (DPT)"],
  ot: ["OT Technician diploma", "Knowledge of sterilisation & theatre protocols"],
  academic: ["Relevant postgraduate degree", "Teaching or demonstration experience"],
  admin: ["Intermediate or above", "Computer skills (MS Office)"],
};

function jobRequirementsFor(job) {
  const own = job.requirements || [];
  const ownText = own.join(" ").toLowerCase();
  const covers = (r) => ["pmdc", "pnc", "pharmacy council", "fcps", "bds", "dpt"].some((k) => r.toLowerCase().includes(k) && ownText.includes(k));
  const extra = (ROLE_REQUIREMENTS[jobRoleKind(job.jobTitle)] || []).filter((r) => !covers(r));
  const all = [...own, ...extra, "Valid CNIC", "Good communication in Urdu & English"];
  const seen = new Set();
  return all.filter((r) => {
    const k = r.toLowerCase().replace(/[^a-z]/g, "").slice(0, 14);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function jobDocumentsFor(job) {
  if (Array.isArray(job.documents) && job.documents.length) return job.documents;
  const kind = jobRoleKind(job.jobTitle);
  const reqText = (job.requirements || []).join(" ").toLowerCase();
  const degree = {
    consultant: "MBBS & postgraduate degree (FCPS / MCPS)", doctor: "MBBS degree", house: "MBBS degree / result card",
    dentist: "BDS degree", nurse: "Nursing diploma / degree", pharmacist: "Pharm-D degree", lab: "MLT diploma / degree",
    radiographer: "Radiography diploma / degree", physio: "DPT degree", ot: "OT technician diploma", academic: "Highest degree", admin: "Highest education certificate",
  }[kind];
  const registration = {
    consultant: "PMDC registration certificate", doctor: "PMDC registration certificate", house: "PMDC provisional registration",
    dentist: "PMDC registration certificate", nurse: "PNC registration certificate", pharmacist: "Pharmacy Council registration",
  }[kind];
  const docs = [
    { id: "cv", label: "Updated CV / Resume", required: true },
    { id: "cnic", label: "CNIC (front & back)", required: true },
    { id: "degree", label: degree, required: true },
  ];
  if (registration) docs.push({ id: "reg", label: registration, required: true });
  if (kind === "doctor") docs.push({ id: "house", label: "House job completion certificate", required: true });
  docs.push({ id: "exp", label: "Experience letter(s)", required: /experience/.test(reqText) && !/fresh/.test(reqText) });
  if (/local/.test(reqText)) docs.push({ id: "domicile", label: "Domicile certificate", required: false });
  docs.push({ id: "photo", label: "Passport-size photograph", required: false });
  return docs;
}

function fmtBytes(n) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

const APPLY_MAX_BYTES = 5 * 1024 * 1024;

/* ---------- application drafts (kept in this browser so people can finish later) ---------- */
const applyDraftKey = (id) => `pakmed-apply-draft-${id}`;
function loadApplyDraft(id) {
  try { const raw = window.localStorage.getItem(applyDraftKey(id)); return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
}
function saveApplyDraft(id, draft) {
  try { window.localStorage.setItem(applyDraftKey(id), JSON.stringify({ ...draft, savedAt: Date.now() })); } catch (_) { /* storage unavailable */ }
}
function clearApplyDraft(id) {
  try { window.localStorage.removeItem(applyDraftKey(id)); } catch (_) { /* storage unavailable */ }
}

/* read-only list shown inside the job details */
function ApplyDocsChecklist({ job, hasApplied, draft, onApply }) {
  const docs = jobDocumentsFor(job);
  const files = (draft && draft.files) || {};
  const required = docs.filter((d) => d.required);
  const inDraft = required.filter((d) => files[d.id]).length;
  const started = Object.keys(files).length > 0;

  return (
    <section className="mt-7">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[16.5px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>Documents you'll need</h3>
        {!hasApplied && started && (
          <span className="text-[12.5px] font-bold px-2.5 py-1 rounded-full" style={{ color: AMBER, backgroundColor: AMBER_TINT }}>
            Draft · {inDraft}/{required.length} ready
          </span>
        )}
      </div>
      <div className="rounded-2xl p-4" style={{ backgroundColor: CREAM }}>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5">
          {docs.map((d) => {
            const have = !!files[d.id];
            return (
              <li key={d.id} className="flex items-start gap-2.5 text-[14.5px]" style={{ color: INK_2 }}>
                {have
                  ? <CheckCircle2 className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: GREEN }} />
                  : <FileText className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: d.required ? BRAND : FAINT }} />}
                <span>
                  {d.label}
                  {!d.required && <span style={{ color: FAINT }}> (optional)</span>}
                </span>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-4 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          <p className="flex-1 text-[13px] leading-snug" style={{ color: SUBTLE }}>
            {hasApplied ? "You've already applied to this job." : "PDF, JPG or PNG · max 5 MB each. Tap Apply now below to upload them — you can save and finish later."}
          </p>
        </div>
      </div>
    </section>
  );
}

/* the upload form that opens from "Apply now" */
function ApplyFormModal({ job, onClose, onSubmit, onDraftChange }) {
  const docs = jobDocumentsFor(job);
  const initial = loadApplyDraft(job.id) || {};
  const [files, setFiles] = useState(initial.files || {});
  const [note, setNote] = useState(initial.note || "");
  const [confirm, setConfirm] = useState(!!initial.confirm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const flashRef = useRef(null);
  const firstRun = useRef(true);

  const required = docs.filter((d) => d.required);
  const ready = required.every((d) => files[d.id]);
  const doneCount = required.filter((d) => files[d.id]).length;
  const hasProgress = Object.keys(files).length > 0 || note.trim().length > 0;

  // auto-save the draft on every change
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    if (done) return;
    const d = { files, note, confirm };
    if (Object.keys(files).length || note.trim()) saveApplyDraft(job.id, d); else clearApplyDraft(job.id);
    onDraftChange && onDraftChange(loadApplyDraft(job.id));
    setSavedFlash(true);
    clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => setSavedFlash(false), 1400);
  }, [files, note, confirm]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(flashRef.current), []);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && !submitting && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose, submitting]);

  const pick = (id) => (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > APPLY_MAX_BYTES) { setErrors((p) => ({ ...p, [id]: "File is larger than 5 MB" })); return; }
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name)) { setErrors((p) => ({ ...p, [id]: "Use a PDF, JPG or PNG file" })); return; }
    setErrors((p) => ({ ...p, [id]: "" }));
    setFiles((p) => ({ ...p, [id]: { name: f.name, size: f.size } }));
  };
  const remove = (id) => setFiles((p) => { const n = { ...p }; delete n[id]; return n; });

  const submit = () => {
    if (!ready || !confirm || submitting) return;
    setSubmitting(true);
    setTimeout(() => {
      clearApplyDraft(job.id);
      onDraftChange && onDraftChange(null);
      setSubmitting(false);
      setDone(true);
      onSubmit({ files, note });
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={`Apply for ${job.jobTitle}`}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={() => !submitting && onClose()} />
      <div className="relative w-full sm:max-w-[720px] h-[94dvh] sm:h-auto sm:max-h-[90dvh] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col overflow-hidden auth-step"
        style={{ boxShadow: "0 30px 80px -20px rgba(16,24,40,0.45)", fontFamily: FONT }}>

        {/* header */}
        <div className="px-5 sm:px-7 pt-5 pb-4 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: done ? GREEN_TINT : BRAND_50 }}>
              {done ? <CheckCircle2 className="w-6 h-6" style={{ color: GREEN }} /> : <Upload className="w-5 h-5" style={{ color: BRAND }} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[18px] font-extrabold leading-tight" style={{ color: INK }}>{done ? "Application submitted" : "Apply for this job"}</p>
              <p className="text-[13.5px] mt-0.5 truncate" style={{ color: SUBTLE }}>{job.jobTitle} · {job.facilityName}, {job.city}</p>
            </div>
            <button type="button" onClick={onClose} disabled={submitting} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[#EEF1F5]" style={{ backgroundColor: CREAM }}>
              <X className="w-5 h-5" style={{ color: INK }} />
            </button>
          </div>
          {!done && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[12.5px] font-semibold mb-1.5">
                <span style={{ color: doneCount === required.length ? GREEN : INK_2 }}>{doneCount} of {required.length} required documents</span>
                <span className="inline-flex items-center gap-1 transition-opacity" style={{ color: GREEN, opacity: savedFlash ? 1 : 0 }}>
                  <Check className="w-3.5 h-3.5" strokeWidth={3} /> Draft saved
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: CREAM }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(doneCount / Math.max(1, required.length)) * 100}%`, backgroundColor: doneCount === required.length ? GREEN : BRAND }} />
              </div>
            </div>
          )}
        </div>

        {done ? (
          <div className="flex-1 overflow-y-auto px-5 sm:px-7 py-8 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 auth-pop" style={{ backgroundColor: GREEN_TINT }}>
              <CheckCircle2 className="w-8 h-8" style={{ color: GREEN }} />
            </div>
            <p className="text-[20px] font-extrabold" style={{ color: INK }}>You're in the running!</p>
            <p className="text-[14.5px] mt-2 max-w-md mx-auto leading-relaxed" style={{ color: SUBTLE }}>
              {job.facilityName} has your documents. You'll get a message when they view or shortlist your application — track it any time in My profile.
            </p>
            <button type="button" onClick={onClose} className="mt-6 h-11 px-7 rounded-xl text-[14.5px] font-bold text-white" style={{ backgroundColor: BRAND }}>Done</button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-5">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {docs.map((d) => {
                  const f = files[d.id];
                  const err = errors[d.id];
                  return (
                    <li key={d.id} className="rounded-2xl p-3.5 flex flex-col gap-2.5" style={{ border: `1.5px solid ${err ? RED : f ? "#C7E8D9" : CARD_BORDER}`, backgroundColor: f ? "#F6FBF8" : "#fff" }}>
                      <div className="flex items-start gap-3">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: f ? GREEN_TINT : CREAM }}>
                          {f ? <CheckCircle2 className="w-5 h-5" style={{ color: GREEN }} /> : <FileText className="w-5 h-5" style={{ color: SUBTLE }} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14.5px] font-semibold leading-snug" style={{ color: INK }}>
                            {d.label} {d.required ? <span style={{ color: RED }}>*</span> : <span className="text-[12px] font-medium" style={{ color: FAINT }}>(optional)</span>}
                          </p>
                          <p className="text-[12.5px] truncate mt-0.5" style={{ color: err ? RED : f ? GREEN : SUBTLE }}>
                            {err || (f ? `${f.name} · ${fmtBytes(f.size)}` : "PDF, JPG or PNG · max 5 MB")}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <label className="flex-1 h-9 rounded-lg text-[13px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          style={{ color: f ? INK_2 : BRAND, backgroundColor: f ? CREAM : BRAND_50 }}>
                          <Upload className="w-4 h-4" /> {f ? "Replace file" : "Choose file"}
                          <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="sr-only" onChange={pick(d.id)} />
                        </label>
                        {f && (
                          <button type="button" onClick={() => remove(d.id)} aria-label={`Remove ${d.label}`} className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 hover:bg-[#F5F7FA]" style={{ border: `1px solid ${CARD_BORDER}` }}>
                            <X className="w-4 h-4" style={{ color: SUBTLE }} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              <label className="block mt-5">
                <span className="text-[14.5px] font-bold" style={{ color: INK }}>Note to employer <span className="font-medium" style={{ color: FAINT }}>(optional)</span></span>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} maxLength={500}
                  placeholder={`Briefly tell ${job.facilityName} why you're a good fit…`}
                  className="pm-input mt-2 w-full text-[15px] rounded-xl px-4 py-3 outline-none resize-none bg-white"
                  style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }} />
              </label>

              <label className="flex items-start gap-3 mt-4 cursor-pointer select-none">
                <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} className="w-5 h-5 mt-0.5 rounded accent-[#0B57B7] shrink-0" />
                <span className="text-[14px] leading-snug" style={{ color: INK_2 }}>I confirm these documents are genuine and belong to me.</span>
              </label>
            </div>

            <div className="px-5 sm:px-7 py-4 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center gap-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}`, backgroundColor: "#FCFCFD" }}>
              <p className="flex-1 text-[12.5px] leading-snug" style={{ color: SUBTLE }}>
                {ready && confirm ? "Everything's ready to send." : !ready ? `Upload ${required.length - doneCount} more required ${required.length - doneCount === 1 ? "document" : "documents"} to submit.` : "Tick the confirmation to submit."}
              </p>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={onClose} disabled={submitting}
                  className="flex-1 sm:flex-none h-11 px-4 rounded-xl text-[14px] font-bold" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                  {hasProgress ? "Save & finish later" : "Cancel"}
                </button>
                <button type="button" onClick={submit} disabled={!ready || !confirm || submitting}
                  className="flex-1 sm:flex-none h-11 px-6 rounded-xl text-[14.5px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all enabled:hover:brightness-110 disabled:cursor-not-allowed"
                  style={{ backgroundColor: BRAND, opacity: ready && confirm ? 1 : 0.45 }}>
                  {submitting
                    ? <><span className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: "#fff transparent #fff #fff" }} /> Submitting…</>
                    : <>Submit application <ArrowRight className="w-4 h-4" /></>}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function JobDetailSheet({ job, onClose, onReport, reported, social, onToggleLike, onToggleFav, onAddComment, onContact, onApply, hasApplied }) {
  const gate = useContext(AuthGate);
  const [tab, setTab] = useState("details");   // details | comments
  const [draft, setDraft] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgDraft, setMsgDraft] = useState("");
  const [sent, setSent] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);
  const [showPoster, setShowPoster] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [applyDraft, setApplyDraft] = useState(() => loadApplyDraft(job.id));
  const goToApply = () => gate.require("apply for this job", () => setApplyOpen(true));

  const st = social || { liked: false, likes: 0, favourite: false, comments: [] };
  const tpl = CARD_TEMPLATES.find((t) => t.id === job.templateId) || CARD_TEMPLATES[0];
  const photos = job.photos || [];

  const sendMessage = () => {
    if (!msgDraft.trim()) return;
    onContact({ jobId: job.id, business: job.facilityName, product: job.jobTitle, text: msgDraft.trim() });
    setSent(true); setMsgDraft("");
    setTimeout(() => setMsgOpen(false), 900);
  };

  const post = () => {
    if (!draft.trim()) return;
    onAddComment(job.id, draft.trim());
    setDraft("");
  };

  const Action = ({ icon: Icon, label, count, active, activeColor, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center gap-1 flex-1 py-1 active:scale-95 transition-transform">
      <Icon
        className="w-[22px] h-[22px]"
        strokeWidth={2}
        fill={active ? (activeColor || NAVY) : "none"}
        stroke={active ? (activeColor || NAVY) : INK}
      />
      <span className="text-[10.5px] font-medium" style={{ color: active ? (activeColor || NAVY) : SUBTLE }}>
        {count !== undefined ? count : label}
      </span>
    </button>
  );

  const vis = jobRoleVisual(job.jobTitle);
  const type = jobTypeOf(job);
  const location = [job.area, job.city].filter(Boolean).join(", ");
  const unit = (job.payUnitLabel || "Per Month").replace(/^Per /i, "").toLowerCase();
  const shiftText = (job.shifts || []).join(", ");
  const summary = job.notes || [
    `${job.facilityName || "This facility"} is hiring a ${job.jobTitle}${shiftText ? ` for ${shiftText.toLowerCase()} shifts` : ""}${location ? ` in ${location}` : ""}.`,
    `This is a ${type.toLowerCase()} role paying PKR ${job.payAmount} per ${unit}.`,
    job.startDate ? (String(job.startDate).toLowerCase() === "immediately" ? "The position starts immediately." : `The position starts ${job.startDate}.`) : "",
  ].filter(Boolean).join(" ");
  const facts = [
    { icon: Wallet, label: "Salary", value: `PKR ${job.payAmount}`, sub: `per ${unit}`, strong: true },
    { icon: Briefcase, label: "Job type", value: type },
    { icon: Clock, label: "Shift", value: shiftText || "Flexible" },
    { icon: CalendarDays, label: "Start date", value: job.startDate || "Flexible" },
    { icon: MapPin, label: "City", value: job.city || "—", sub: job.area },
    { icon: Users, label: "Applicants", value: typeof job.applicants === "number" ? `${job.applicants} applied` : "Be the first" },
  ];
  const Block = ({ title, children }) => (
    <section className="mt-7">
      <h3 className="text-[16.5px] font-extrabold tracking-[-0.01em] mb-3" style={{ color: INK }}>{title}</h3>
      {children}
    </section>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6" role="dialog" aria-modal="true" aria-label={job.jobTitle}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full sm:max-w-[660px] bg-white rounded-t-3xl sm:rounded-3xl flex flex-col h-[92dvh] sm:h-[88dvh] overflow-hidden auth-step" style={{ fontFamily: FONT, boxShadow: "0 30px 80px -20px rgba(16,24,40,0.45)" }}>

        <div className="sm:hidden flex justify-center pt-2.5 shrink-0"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>

        {/* header: tabs + close */}
        <div className="flex items-center gap-3 px-4 sm:px-6 pt-3 sm:pt-4 pb-3 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <div className="inline-flex p-1 rounded-xl" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
            {[["details", "Job details"], ["comments", `Questions${st.comments.length ? ` (${st.comments.length})` : ""}`]].map(([k, label]) => (
              <button key={k} type="button" onClick={() => setTab(k)}
                className="h-9 px-4 rounded-lg text-[13.5px] font-bold transition-all"
                style={{ backgroundColor: tab === k ? "#fff" : "transparent", color: tab === k ? BRAND : SUBTLE, boxShadow: tab === k ? "0 1px 3px rgba(16,24,40,0.12)" : "none" }}>
                {label}
              </button>
            ))}
          </div>
          <span className="flex-1" />
          <button type="button" onClick={onClose} aria-label="Close" className="w-10 h-10 rounded-full flex items-center justify-center transition-colors hover:bg-[#EEF1F5]" style={{ backgroundColor: CREAM }}>
            <X className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>

        {/* ---------- DETAILS ---------- */}
        {tab === "details" && (
          <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 pt-5 pb-7">
            {/* title */}
            <div className="flex items-start gap-4">
              <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: vis.tint }}>
                <vis.Icon className="w-7 h-7" style={{ color: vis.color }} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="text-[22px] sm:text-[26px] font-extrabold leading-tight tracking-[-0.025em]" style={{ color: INK }}>
                  {job.jobTitle}{job.specialty ? <span style={{ color: SUBTLE }}> · {job.specialty}</span> : null}
                </h2>
                <p className="text-[15.5px] font-semibold mt-1" style={{ color: INK_2 }}>{job.facilityName}</p>
                {location && (
                  <p className="text-[14px] mt-1 flex items-center gap-1.5" style={{ color: SUBTLE }}>
                    <MapPin className="w-4 h-4 shrink-0" /> {location}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-[12.5px] font-bold px-2.5 py-1 rounded-lg" style={{ color: BRAND, backgroundColor: BRAND_50 }}>{type}</span>
              {job.urgent && (
                <span className="inline-flex items-center gap-1 text-[12.5px] font-bold px-2.5 py-1 rounded-lg" style={{ color: RED, backgroundColor: RED_TINT }}>
                  <Zap className="w-3.5 h-3.5" /> Urgent hiring
                </span>
              )}
              {job.facilityTypeLabel && <span className="text-[12.5px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: INK_2, backgroundColor: CREAM }}>{job.facilityTypeLabel}</span>}
              {job.posted && (
                <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: INK_2, backgroundColor: CREAM }}>
                  <History className="w-3.5 h-3.5" /> Posted {job.posted}
                </span>
              )}
              {hasApplied && (
                <span className="inline-flex items-center gap-1 text-[12.5px] font-bold px-2.5 py-1 rounded-lg" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>
                  <Check className="w-3.5 h-3.5" strokeWidth={3} /> You applied
                </span>
              )}
            </div>

            {/* key facts */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-6">
              {facts.map((f) => (
                <div key={f.label} className="rounded-2xl p-3.5" style={{ backgroundColor: f.strong ? GREEN_TINT : CREAM }}>
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] flex items-center gap-1.5" style={{ color: f.strong ? GREEN : SUBTLE }}>
                    <f.icon className="w-3.5 h-3.5" /> {f.label}
                  </p>
                  <p className="text-[16px] font-bold mt-1.5 leading-snug" style={{ color: f.strong ? GREEN : INK }}>{f.value}</p>
                  {f.sub && <p className="text-[12.5px] mt-0.5 truncate" style={{ color: SUBTLE }}>{f.sub}</p>}
                </div>
              ))}
            </div>

            <Block title="About this role">
              <p className="text-[15px] leading-relaxed" style={{ color: INK_2 }}>{summary}</p>
            </Block>

            {jobRequirementsFor(job).length > 0 && (
              <Block title="Requirements">
                <ul className="space-y-2.5">
                  {jobRequirementsFor(job).map((r) => (
                    <li key={r} className="flex items-start gap-2.5 text-[15px]" style={{ color: INK_2 }}>
                      <CheckCircle2 className="w-5 h-5 shrink-0 mt-px" style={{ color: GREEN }} /> {r}
                    </li>
                  ))}
                </ul>
              </Block>
            )}

            <Block title="Employer & contact">
              <div className="rounded-2xl p-4 flex items-center gap-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <span className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-[17px] font-extrabold" style={{ backgroundColor: BRAND_50, color: BRAND }}>
                  {(job.facilityName || "?")[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[15.5px] font-bold truncate" style={{ color: INK }}>{job.facilityName}</p>
                  <p className="text-[13.5px] truncate" style={{ color: SUBTLE }}>{[job.facilityTypeLabel, job.city].filter(Boolean).join(" · ")}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                <div className="rounded-2xl p-3.5" style={{ backgroundColor: CREAM }}>
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.06em]" style={{ color: SUBTLE }}>Contact person</p>
                  <p className="text-[15px] font-semibold mt-1" style={{ color: INK }}>{job.contactName || "HR Department"}</p>
                </div>
                <div className="rounded-2xl p-3.5" style={{ backgroundColor: CREAM }}>
                  <p className="text-[11.5px] font-bold uppercase tracking-[0.06em]" style={{ color: SUBTLE }}>Phone</p>
                  {job.showNumber && job.contactNumber ? (
                    <a href={`tel:${job.contactNumber.replace(/\s/g, "")}`} className="text-[15px] font-semibold mt-1 inline-flex items-center gap-1.5" style={{ color: BRAND }}>
                      <Phone className="w-4 h-4" /> {job.contactNumber}
                    </a>
                  ) : (
                    <p className="text-[15px] font-semibold mt-1" style={{ color: INK }}>Message via PakMed</p>
                  )}
                </div>
              </div>
            </Block>

            {photos.length > 0 ? (
              <Block title="Photos">
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3", border: `1px solid ${CARD_BORDER}` }}>
                  <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-2 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {photos.map((src, i) => (
                      <button key={i} type="button" onClick={() => setPhotoIdx(i)} className="shrink-0 rounded-lg overflow-hidden"
                        style={{ width: 60, height: 60, border: `2px solid ${i === photoIdx ? BRAND : "transparent"}` }}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </Block>
            ) : (
              <div className="mt-7">
                <button type="button" onClick={() => setShowPoster((v) => !v)}
                  className="w-full h-12 rounded-xl text-[14.5px] font-bold inline-flex items-center justify-center gap-2 transition-colors hover:bg-[#F5F7FA]"
                  style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                  <Eye className="w-4 h-4" /> {showPoster ? "Hide job poster" : "View job poster"}
                </button>
                {showPoster && (
                  <div className="mt-3 rounded-2xl overflow-hidden max-w-[360px] mx-auto auth-step" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <JobPostCard job={job} tpl={tpl} scale={1} />
                  </div>
                )}
              </div>
            )}

            <div className="rounded-2xl p-4 mt-6 flex items-start gap-3" style={{ backgroundColor: AMBER_TINT }}>
              <ShieldCheck className="w-5 h-5 shrink-0 mt-px" style={{ color: AMBER }} />
              <p className="text-[13.5px] leading-relaxed" style={{ color: "#6B4B22" }}>
                <strong>Stay safe:</strong> PakMed jobs never require an upfront payment. Report any post that asks for money.
              </p>
            </div>
            <ApplyDocsChecklist job={job} hasApplied={hasApplied} draft={applyDraft} onApply={goToApply} />
            <button type="button"
              onClick={() => onReport && onReport({ id: job.id, type: "job", title: job.jobTitle, subtitle: `${job.facilityName} · ${job.city}` })}
              className="sm:hidden mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: reported ? RED : SUBTLE }}>
              <Flag className="w-4 h-4" /> {reported ? "Reported" : "Report this job"}
            </button>
          </div>
        )}

        {/* ---------- COMMENTS ---------- */}
        {tab === "comments" && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-3 flex flex-col gap-3.5">
              {st.comments.length === 0 && (
                <p className="text-[13px] text-center py-8" style={{ color: SUBTLE }}>
                  No questions yet. Ask about timings, duties or the location.
                </p>
              )}
              {st.comments.map((c) => (
                <div key={c.id} className="flex gap-2.5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-semibold shrink-0" style={{ backgroundColor: NAVY }}>{c.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-semibold" style={{ color: INK }}>
                      {c.name} <span className="font-normal text-[11.5px]" style={{ color: SUBTLE }}>{c.time}</span>
                    </p>
                    <p className="text-[13.5px]" style={{ color: "#4B4A45" }}>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t flex items-center gap-2.5 shrink-0" style={{ borderColor: CARD_BORDER }}>
              <input
                value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && gate.require("comment", post)}
                enterKeyHint="send" placeholder="Ask a question about this job"
                className="flex-1 text-[13.5px] rounded-full px-4 py-2.5 outline-none" style={{ backgroundColor: "#EFF2FA" }}
              />
              <button onClick={() => gate.require("comment", post)} disabled={!draft.trim()} className="text-[13.5px] font-semibold px-1" style={{ color: NAVY, opacity: draft.trim() ? 1 : 0.35 }}>Post</button>
            </div>
          </>
        )}

        {/* ---------- ACTION BAR ---------- */}
        {tab === "details" && (
          <div className="shrink-0 px-4 sm:px-6 py-3 flex items-center gap-2" style={{ borderTop: `1px solid ${CARD_BORDER}`, backgroundColor: "#fff" }}>
            {[
              { icon: Heart, label: st.liked ? "Unlike" : "Like", active: st.liked, color: RED, count: st.likes || null, run: () => gate.require("like jobs", () => onToggleLike(job.id)) },
              { icon: Bookmark, label: st.favourite ? "Saved" : "Save", active: st.favourite, color: BRAND, run: () => onToggleFav(job.id) },
              { icon: Repeat2, label: "Share", run: () => gate.require("share this job", () => setShareOpen(true)) },
              { icon: Flag, label: reported ? "Reported" : "Report", active: reported, color: RED, run: () => onReport && onReport({ id: job.id, type: "job", title: job.jobTitle, subtitle: `${job.facilityName} · ${job.city}` }) },
            ].map((a) => (
              <button key={a.label} type="button" onClick={a.run} aria-label={a.label} title={a.label}
                className={`${a.icon === Flag ? "hidden sm:inline-flex" : "inline-flex"} h-11 min-w-11 px-2.5 rounded-xl items-center justify-center gap-1.5 shrink-0 transition-colors hover:bg-[#F5F7FA]`}
                style={{ border: `1px solid ${a.active ? a.color + "55" : CARD_BORDER}`, backgroundColor: a.active ? (a.color === RED ? RED_TINT : BRAND_50) : "#fff" }}>
                <a.icon className="w-[18px] h-[18px]" fill={a.active ? a.color : "none"} stroke={a.active ? a.color : INK_2} />
                {a.count ? <span className="text-[12.5px] font-semibold" style={{ color: a.active ? a.color : SUBTLE }}>{a.count}</span> : null}
              </button>
            ))}
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => { if (!hasApplied) goToApply(); }}
              disabled={hasApplied}
              className="h-11 px-4 sm:px-6 rounded-xl text-[14.5px] font-bold inline-flex items-center justify-center gap-2 shrink-0 transition-all enabled:hover:brightness-110"
              style={{ backgroundColor: hasApplied ? GREEN_TINT : BRAND, color: hasApplied ? GREEN : "#fff", boxShadow: hasApplied ? "none" : "0 8px 20px -10px rgba(11,87,183,0.6)" }}
            >
              {hasApplied
                ? <><Check className="w-4 h-4" strokeWidth={3} /> Applied</>
                : applyDraft && applyDraft.files && Object.keys(applyDraft.files).length
                  ? <><Upload className="w-4 h-4" /> Continue<span className="hidden sm:inline"> application</span></>
                  : <><FileText className="w-4 h-4" /> Apply now</>}
            </button>
          </div>
        )}
      </div>

      {shareOpen && <JobShareSheet job={job} onClose={() => setShareOpen(false)} />}
      {applyOpen && (
        <ApplyFormModal
          job={job}
          onClose={() => { setApplyOpen(false); setApplyDraft(loadApplyDraft(job.id)); }}
          onDraftChange={setApplyDraft}
          onSubmit={() => onApply(job)}
        />
      )}

      {/* contact composer */}
      {msgOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMsgOpen(false)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
              <span className="w-8" />
              <p className="font-bold text-[15px]" style={{ color: INK }}>Contact employer</p>
              <button onClick={() => setMsgOpen(false)} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
            </div>
            <div className="p-5">
              {sent ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: GREEN_TINT }}>
                    <Check className="w-7 h-7" strokeWidth={3} style={{ color: GREEN }} />
                  </div>
                  <p className="text-[15px] font-bold" style={{ color: INK }}>Message sent</p>
                  <p className="text-[13px] mt-1" style={{ color: SUBTLE }}>It's in the employer's inbox. Replies arrive in your Messages.</p>
                </div>
              ) : (
                <>
                  <p className="text-[13.5px] font-semibold" style={{ color: INK }}>{job.facilityName}</p>
                  <p className="text-[11.5px] mb-3" style={{ color: SUBTLE }}>Re: {job.jobTitle}</p>
                  <textarea
                    value={msgDraft} onChange={(e) => setMsgDraft(e.target.value)} rows={4}
                    placeholder={`Assalam o Alaikum, I'm interested in the ${job.jobTitle} position. Is it still open?`}
                    className="w-full text-[14px] rounded-xl px-3.5 py-3 outline-none resize-none"
                    style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }}
                  />
                  <button
                    onClick={sendMessage} disabled={!msgDraft.trim()}
                    className="w-full mt-3 py-3.5 rounded-full font-semibold text-[14px] transition-opacity"
                    style={{ backgroundColor: NAVY, color: "white", opacity: msgDraft.trim() ? 1 : 0.4 }}
                  >
                    Send message
                  </button>
                  <p className="text-[11.5px] text-center mt-2.5" style={{ color: SUBTLE }}>
                    Your CV is attached automatically if you have one saved.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   CONSULT A DOCTOR
   ========================================================= */
/* ---------- doctor contact helpers ---------- */
function initialsOf(name) {
  return String(name || "?").replace(/^Dr\.?\s*/i, "").split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}
function doctorWaLink(d) {
  const digits = String(d.phone || "").replace(/\D/g, "").replace(/^0/, "");
  const first = String(d.name || "").replace(/^Dr\.?\s*/i, "").split(" ")[0];
  const text = `Assalam o Alaikum Dr. ${first}, I found you on PakMed and would like to ask about a consultation.\n— sent via PakMed · pakmed.app`;
  return `https://wa.me/92${digits}?text=${encodeURIComponent(text)}`;
}
function WhatsAppGlyph({ size = 17, color = "#1DA851" }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} fill={color}><path d={ICON_PATHS.whatsapp} /></svg>;
}

/* in-app message to a doctor — signed-out visitors leave a name and WhatsApp number so the doctor can reply */
function DoctorMessageSheet({ doctor: d, authed, defaults = {}, onSend, onClose }) {
  const [name, setName] = useState(defaults.name || "");
  const [phone, setPhone] = useState(defaults.phone || "");
  const [msg, setMsg] = useState("");
  const [sent, setSent] = useState(false);
  const ok = msg.trim() && (authed || (name.trim() && phone.replace(/\D/g, "").length >= 10));
  const send = () => {
    if (!ok) return;
    onSend({ business: d.name, product: "Consultation enquiry", text: msg.trim(), from: authed ? null : { name: name.trim(), phone: phone.trim() } });
    setSent(true);
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl" style={{ fontFamily: FONT }}>
        <div className="flex items-center justify-between px-5 pt-4 pb-3" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[12px] font-bold shrink-0" style={{ backgroundColor: BRAND }}>{initialsOf(d.name)}</div>
            <div className="min-w-0">
              <p className="text-[14.5px] font-bold truncate" style={{ color: INK }}>{d.name}</p>
              <p className="text-[12px] truncate" style={{ color: SUBTLE }}>{d.specialty}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>
        {sent ? (
          <div className="px-5 py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: GREEN_TINT }}>
              <Check className="w-7 h-7" strokeWidth={3} style={{ color: GREEN }} />
            </div>
            <p className="text-[16px] font-bold" style={{ color: INK }}>Message sent</p>
            <p className="text-[13px] mt-1 leading-snug" style={{ color: SUBTLE }}>
              {authed ? "The doctor's reply will appear in your Messages." : `The doctor can reply to you on WhatsApp at ${phone}.`}
            </p>
            <button onClick={onClose} className="mt-5 px-6 h-11 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>Done</button>
          </div>
        ) : (
          <div className="px-5 pt-4 pb-5">
            {!authed && (
              <>
                <p className="text-[12.5px] mb-3 leading-snug" style={{ color: SUBTLE }}>
                  You're not signed in. Leave your name and WhatsApp number so the doctor can reply.
                </p>
                <PFLabel req color={BRAND}>Your name</PFLabel>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
                <div className="mt-3"><PFLabel req color={BRAND}>WhatsApp number</PFLabel>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
                </div>
                <div className="h-3" />
              </>
            )}
            <PFLabel req color={BRAND}>Message</PFLabel>
            <textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={4}
              placeholder="Briefly describe what you'd like to ask the doctor"
              className="w-full text-[14.5px] rounded-xl px-3.5 py-3 outline-none resize-none" style={PF_INPUT_STYLE} />
            <button onClick={send} disabled={!ok} className="w-full mt-3 h-12 rounded-xl text-[14.5px] font-bold text-white transition-opacity"
              style={{ backgroundColor: BRAND, opacity: ok ? 1 : 0.4 }}>Send message</button>
            <p className="text-[11.5px] text-center mt-2.5" style={{ color: SUBTLE }}>Don't share medical emergencies here — call 1122.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- extra sample doctors (frontend-only demo data) ---------- */
const dr = (id, name, specialty, qual, city, area, clinic, fee, rating, reviews, exp, online, slots, extra = {}) => ({
  id, name, specialty, qual, city, area, clinic, fee, rating, reviews, exp, verified: true, online, phone: "", showPhone: false, slots, ...extra,
});
const MORE_DOCTORS = [
  dr("d13", "Dr. Mehwish Anwar", "Gynecology", "MBBS, FCPS Gynae", "Lahore", "Gulberg III", "Gulberg Women's Clinic", "2,500", 4.8, 265, "11 yrs", true, "Today 5:00 PM"),
  dr("d14", "Dr. Adnan Qureshi", "General Physician", "MBBS, MCPS Family Medicine", "Rawalpindi", "Saddar", "Saddar Family Clinic", "1,200", 4.5, 118, "8 yrs", true, "Today 6:30 PM"),
  dr("d15", "Dr. Rabia Saleem", "Dermatology", "MBBS, FCPS Dermatology", "Islamabad", "F-7 Markaz", "Clear Skin Clinic", "3,000", 4.9, 312, "10 yrs", true, "Tomorrow 12:00 PM"),
  dr("d16", "Dr. Junaid Akhtar", "Orthopedics", "MBBS, FCPS Ortho", "Karachi", "PECHS", "Spine & Joint Clinic", "3,500", 4.7, 201, "15 yrs", false, "Tomorrow 5:00 PM"),
  dr("d17", "Dr. Sadia Batool", "Pediatrics", "MBBS, DCH, FCPS Peds", "Multan", "Cantt", "Little Stars Clinic", "1,800", 4.8, 174, "9 yrs", true, "Today 3:30 PM"),
  dr("d18", "Dr. Waqas Butt", "Cardiology", "MBBS, FCPS Cardiology", "Faisalabad", "Peoples Colony", "Heart Care Centre", "3,000", 4.6, 132, "12 yrs", false, "Today 7:30 PM"),
  dr("d19", "Dr. Nida Farooq", "Psychiatry", "MBBS, FCPS Psychiatry", "Lahore", "DHA Phase 5", "Calm Minds Clinic", "4,000", 4.9, 221, "13 yrs", true, "Tomorrow 4:00 PM"),
  dr("d20", "Dr. Imtiaz Khattak", "ENT", "MBBS, FCPS ENT", "Peshawar", "Hayatabad Phase 3", "Khyber ENT Clinic", "1,500", 4.5, 89, "9 yrs", false, "Today 5:30 PM"),
  dr("d21", "Dr. Farah Naz", "Ophthalmology", "MBBS, FCPS Eye", "Hyderabad", "Latifabad", "Vision Eye Clinic", "2,000", 4.7, 140, "10 yrs", false, "Tomorrow 11:00 AM"),
  dr("d22", "Dr. Shahid Baloch", "General Physician", "MBBS", "Quetta", "Jinnah Road", "City Medical Centre", "1,000", 4.4, 66, "6 yrs", true, "Today 4:00 PM"),
  dr("d23", "Dr. Asma Javed", "Endocrinology", "MBBS, FCPS Medicine, Endo Fellowship", "Karachi", "Clifton Block 5", "Diabetes & Thyroid Centre", "3,500", 4.8, 189, "12 yrs", true, "Tomorrow 2:00 PM"),
  dr("d24", "Dr. Hamid Raza", "Urology", "MBBS, FCPS Urology", "Lahore", "Johar Town", "Kidney & Stone Clinic", "3,000", 4.6, 97, "14 yrs", false, "Today 8:00 PM"),
  dr("d25", "Dr. Kiran Shahzad", "Gastroenterology", "MBBS, FCPS Gastro", "Islamabad", "G-9 Markaz", "Gut Health Clinic", "3,000", 4.7, 120, "9 yrs", true, "Tomorrow 6:00 PM"),
  dr("d26", "Dr. Tariq Mehmood", "Pulmonology", "MBBS, FCPS Pulmonology", "Sialkot", "Paris Road", "Chest & Asthma Clinic", "2,000", 4.5, 73, "11 yrs", false, "Today 6:00 PM"),
  dr("d27", "Dr. Uzma Riaz", "Nephrology", "MBBS, FCPS Nephrology", "Gujranwala", "Satellite Town", "Renal Care Clinic", "2,500", 4.6, 58, "10 yrs", false, "Tomorrow 10:30 AM"),
  dr("d28", "Dr. Bilal Siddiqui", "Neurology", "MBBS, FCPS Neurology", "Rawalpindi", "Bahria Town Phase 7", "Brain & Nerve Clinic", "3,500", 4.8, 144, "13 yrs", true, "Tomorrow 5:30 PM"),
  dr("d29", "Dr. Saima Ashraf", "Dentistry", "BDS, MCPS", "Lahore", "Model Town", "Smile Studio Dental", "1,500", 4.7, 210, "8 yrs", false, "Today 4:30 PM"),
  dr("d30", "Dr. Fahad Iqbal", "Surgery", "MBBS, FCPS Surgery", "Bahawalpur", "Model Town A", "Cholistan Surgical", "2,000", 4.5, 61, "12 yrs", false, "Tomorrow 9:00 AM"),
  dr("d31", "Dr. Ammara Khalid", "Oncology", "MBBS, FCPS Oncology", "Karachi", "Gulshan-e-Iqbal", "Hope Cancer Clinic", "4,000", 4.9, 133, "16 yrs", true, "Tomorrow 3:00 PM"),
  dr("d32", "Dr. Naveed Anjum", "General Physician", "MBBS, FCPS Medicine", "Faisalabad", "D Ground", "Lyallpur Family Clinic", "1,500", 4.6, 156, "10 yrs", true, "Today 7:00 PM"),
  dr("d33", "Dr. Hira Qamar", "Gynecology", "MBBS, MCPS Gynae", "Peshawar", "University Town", "Mother Care Clinic", "2,000", 4.7, 102, "7 yrs", true, "Today 2:30 PM"),
  dr("d34", "Dr. Owais Rana", "Dermatology", "MBBS, Dip Derm", "Multan", "Bosan Road", "Skin First Clinic", "1,800", 4.4, 48, "5 yrs", true, "Tomorrow 1:00 PM"),
];
DOCTORS.push(...MORE_DOCTORS);

const DOC_FEE_BANDS = [
  { key: "lt1500", label: "Under PKR 1,500", test: (f) => f < 1500 },
  { key: "1500-3000", label: "PKR 1,500 – 3,000", test: (f) => f >= 1500 && f <= 3000 },
  { key: "gt3000", label: "Above PKR 3,000", test: (f) => f > 3000 },
];
const DOC_SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "fee", label: "Lowest fee" },
  { value: "exp", label: "Most experienced" },
];
const DOC_PAGE_SIZE = 12;
const EMPTY_DOC_FILTERS = { category: "", specialties: [], fees: [], today: false, online: false, verified: false, rating45: false, exp10: false };
const DOC_CATEGORIES = [
  { key: "general", label: "General & Family", icon: Stethoscope, specs: ["General Physician"] },
  { key: "women", label: "Women & Children", icon: Baby, specs: ["Gynecology", "Pediatrics"] },
  { key: "heart", label: "Heart & Lungs", icon: HeartPulse, specs: ["Cardiology", "Pulmonology"] },
  { key: "brain", label: "Brain & Mind", icon: Brain, specs: ["Neurology", "Psychiatry"] },
  { key: "senses", label: "Skin, Eye & ENT", icon: Eye, specs: ["Dermatology", "Ophthalmology", "ENT"] },
  { key: "surgery", label: "Surgery & Bones", icon: Bone, specs: ["Surgery", "Orthopedics", "Urology"] },
  { key: "internal", label: "Internal Medicine", icon: Microscope, specs: ["Gastroenterology", "Nephrology", "Endocrinology", "Oncology"] },
  { key: "dental", label: "Dental", icon: Smile, specs: ["Dentistry"] },
];
const docCategoryOf = (spec) => (DOC_CATEGORIES.find((c) => c.specs.includes(spec)) || {}).key || "";
const docFee = (d) => parseFloat(String(d.fee || "").replace(/,/g, "")) || 0;
const docExp = (d) => parseFloat(d.exp) || 0;
const DOC_COLORS = [BRAND, "#0E7C86", "#5B47C7", "#C0362C", "#12805C", "#B54708"];

/* ---------- doctor profile page ---------- */
const SPEC_SERVICES = {
  "General Physician": ["Fever, flu & infections", "Diabetes & blood pressure", "Routine health check-ups", "Vaccination advice"],
  Cardiology: ["Chest pain & palpitations", "ECG & echo review", "Hypertension management", "Heart failure follow-up"],
  Pediatrics: ["Newborn & child check-ups", "Vaccination schedule", "Growth & nutrition", "Fever & infections in children"],
  Gynecology: ["Pregnancy care", "Menstrual problems", "PCOS management", "Family planning"],
  Dermatology: ["Acne & scars", "Eczema & psoriasis", "Hair loss", "Skin allergies"],
  Orthopedics: ["Joint & back pain", "Fractures & sports injuries", "Arthritis care", "Post-surgery rehab"],
  ENT: ["Ear infections & hearing", "Sinusitis", "Tonsils & throat", "Allergic rhinitis"],
  Psychiatry: ["Anxiety & depression", "Sleep problems", "Stress management", "Counselling & therapy"],
  Neurology: ["Headache & migraine", "Epilepsy", "Stroke follow-up", "Nerve pain"],
  Surgery: ["General surgery consults", "Hernia & gallbladder", "Wound care", "Pre-operative assessment"],
  Dentistry: ["Check-ups & cleaning", "Fillings & root canal", "Braces consults", "Tooth extraction"],
  Ophthalmology: ["Eye check-ups", "Cataract consults", "Glasses & lenses", "Eye infections"],
  Urology: ["Kidney stones", "Urinary problems", "Prostate care", "Men's health"],
  Gastroenterology: ["Acidity & ulcers", "IBS", "Liver problems", "Endoscopy consults"],
  Pulmonology: ["Asthma & COPD", "Chronic cough", "Breathing problems", "Sleep apnea"],
  Nephrology: ["Chronic kidney disease", "Dialysis care", "Kidney function review", "Hypertension"],
  Endocrinology: ["Diabetes care", "Thyroid disorders", "Hormonal imbalance", "Weight management"],
  Oncology: ["Cancer screening", "Chemotherapy planning", "Second opinions", "Follow-up care"],
};
const SAMPLE_REVIEWERS = ["Ayesha K.", "Usman R.", "Sana M.", "Bilal A.", "Hina S.", "Kamran T.", "Maria N.", "Faisal Z."];
const SAMPLE_REVIEW_TEXT = [
  "Listened patiently and explained everything clearly. Highly recommended.",
  "On time, professional and very caring. The clinic was clean and well managed.",
  "Got the right diagnosis after visiting two other doctors. Thank you!",
  "Very friendly with my family and gave practical advice. Will visit again.",
  "Online consultation was smooth and the prescription arrived on WhatsApp.",
];

function docReviews(d) {
  const seed = parseInt(String(d.id).replace(/\D/g, ""), 10) || 1;
  return [0, 1, 2].map((i) => ({
    name: SAMPLE_REVIEWERS[(seed + i * 3) % SAMPLE_REVIEWERS.length],
    text: SAMPLE_REVIEW_TEXT[(seed + i) % SAMPLE_REVIEW_TEXT.length],
    rating: i === 2 && d.rating < 4.7 ? 4 : 5,
    when: ["2 days ago", "1 week ago", "3 weeks ago"][i],
  }));
}

function DoctorMiniCard({ d, onOpen }) {
  const bg = DOC_COLORS[parseInt(String(d.id).replace(/\D/g, ""), 10) % DOC_COLORS.length];
  return (
    <button type="button" onClick={() => onOpen(d)}
      className="group w-full h-full rounded-2xl bg-white p-4 text-left flex flex-col transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
      <div className="flex items-center gap-3">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-extrabold text-[16px]" style={{ backgroundColor: bg }}>{initialsOf(d.name)}</span>
        <div className="min-w-0">
          <p className="text-[15px] font-bold truncate group-hover:text-[#0B57B7] transition-colors" style={{ color: INK }}>{d.name}</p>
          <p className="text-[13px] font-semibold truncate" style={{ color: BRAND }}>{d.specialty}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3 text-[12.5px]" style={{ color: INK_2 }}>
        <span className="inline-flex items-center gap-1 font-bold" style={{ color: INK }}><Star className="w-3.5 h-3.5" fill={STAR} stroke="none" /> {d.rating}</span>
        <span>{d.exp}</span>
        <span className="truncate">{d.city}</span>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <span className="text-[14.5px] font-extrabold" style={{ color: GREEN }}>PKR {d.fee}</span>
        <span className="text-[12.5px] font-bold inline-flex items-center gap-1" style={{ color: BRAND }}>View <ArrowRight className="w-3.5 h-3.5" /></span>
      </div>
    </button>
  );
}

function DoctorProfilePage({ doctor: d, onBack, onOpenDoctor, saved, onToggleSave, onMessage, onReport, reported }) {
  const [shareOpen, setShareOpen] = useState(false);
  const trackRef = useRef(null);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [d.id]);

  const bg = DOC_COLORS[parseInt(String(d.id).replace(/\D/g, ""), 10) % DOC_COLORS.length];
  const today = /^today/i.test(d.slots || "");
  const services = SPEC_SERVICES[d.specialty] || ["Consultations", "Follow-up visits", "Second opinions", "Health advice"];
  const quals = String(d.qual || "").split(",").map((q) => q.trim()).filter(Boolean);
  const reviews = docReviews(d);
  const others = DOCTORS
    .filter((x) => x.id !== d.id)
    .map((x) => ({ x, score: (x.specialty === d.specialty ? 3 : 0) + (x.city === d.city ? 2 : 0) + x.rating / 5 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((r) => r.x);
  const slide = (dir) => { const el = trackRef.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" }); };

  const Card = ({ title, children, className = "" }) => (
    <section className={`rounded-2xl bg-white p-5 sm:p-6 ${className}`} style={{ border: `1px solid ${CARD_BORDER}` }}>
      {title && <h2 className="text-[17px] font-extrabold tracking-[-0.01em] mb-4" style={{ color: INK }}>{title}</h2>}
      {children}
    </section>
  );

  return (
    <div className="w-full min-w-0 page-enter" style={{ fontFamily: FONT }}>
      {/* banner */}
      <section style={{ background: "linear-gradient(135deg, #0B3F86 0%, #0B57B7 55%, #0E7C86 100%)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-5 pb-20 sm:pb-24">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[13.5px] font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All doctors
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16 sm:-mt-20 pb-12">
        {/* identity card */}
        <div className="rounded-3xl bg-white p-5 sm:p-7" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 20px 50px -24px rgba(16,24,40,0.3)" }}>
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <span className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center shrink-0 text-white font-extrabold text-[34px]" style={{ backgroundColor: bg, boxShadow: "0 12px 24px -12px rgba(16,24,40,0.4)" }}>
              {initialsOf(d.name)}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[26px] sm:text-[32px] font-extrabold tracking-[-0.03em] leading-tight flex items-center gap-2 flex-wrap" style={{ color: INK }}>
                {d.name}
                {d.verified && (
                  <span className="inline-flex items-center gap-1 text-[12.5px] font-bold px-2.5 py-1 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>
                    <BadgeCheck className="w-4 h-4" /> PMDC verified
                  </span>
                )}
              </h1>
              <p className="text-[16px] font-bold mt-1" style={{ color: BRAND }}>{d.specialty}</p>
              <p className="text-[14px] mt-0.5" style={{ color: SUBTLE }}>{d.qual}</p>
              <p className="text-[14px] mt-1.5 inline-flex items-center gap-1.5" style={{ color: INK_2 }}>
                <MapPin className="w-4 h-4" style={{ color: FAINT }} /> {d.clinic} · {d.area}, {d.city}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={onToggleSave} aria-label={saved ? "Remove from saved" : "Save doctor"}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]"
                style={{ border: `1px solid ${saved ? "#B9D3F2" : CARD_BORDER}`, backgroundColor: saved ? BRAND_50 : "#fff" }}>
                <Bookmark className="w-[18px] h-[18px]" fill={saved ? BRAND : "none"} stroke={saved ? BRAND : INK_2} />
              </button>
              <button type="button" onClick={() => setShareOpen(true)} aria-label="Share"
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <Repeat2 className="w-[18px] h-[18px]" style={{ color: INK_2 }} />
              </button>
              <button type="button" onClick={onReport} aria-label={reported ? "Reported" : "Report"}
                className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]"
                style={{ border: `1px solid ${reported ? "#F3B7B2" : CARD_BORDER}`, backgroundColor: reported ? RED_TINT : "#fff" }}>
                <Flag className="w-[18px] h-[18px]" style={{ color: reported ? RED : INK_2 }} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            {[
              { icon: Star, label: "Rating", value: `${d.rating} ★`, sub: `${d.reviews} reviews` },
              { icon: Briefcase, label: "Experience", value: d.exp, sub: "in practice" },
              { icon: Wallet, label: "Fee", value: `PKR ${d.fee}`, sub: "per visit", green: true },
              { icon: CalendarDays, label: "Next slot", value: d.slots, sub: d.online ? "Clinic & online" : "In clinic", green: today },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-3.5" style={{ backgroundColor: s.green ? GREEN_TINT : CREAM }}>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] flex items-center gap-1.5" style={{ color: s.green ? GREEN : SUBTLE }}>
                  <s.icon className="w-3.5 h-3.5" /> {s.label}
                </p>
                <p className="text-[16px] font-bold mt-1.5 leading-snug" style={{ color: s.green ? GREEN : INK }}>{s.value}</p>
                <p className="text-[12.5px]" style={{ color: SUBTLE }}>{s.sub}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-5 items-start">
          <div className="space-y-5 min-w-0">
            <Card title="About">
              <p className="text-[15px] leading-relaxed" style={{ color: INK_2 }}>
                {d.name} is a {d.verified ? "PMDC-verified " : ""}{d.specialty.toLowerCase()} specialist with {d.exp} of experience, practising at {d.clinic} in {d.area}, {d.city}.
                {d.online ? " Available for both in-clinic visits and online video consultations." : " Available for in-clinic consultations."}
              </p>
            </Card>

            <Card title="Areas of focus">
              <div className="grid sm:grid-cols-2 gap-2.5">
                {services.map((sv) => (
                  <div key={sv} className="flex items-center gap-2.5 text-[14.5px] rounded-xl px-3.5 py-3" style={{ backgroundColor: CREAM, color: INK_2 }}>
                    <CheckCircle2 className="w-[18px] h-[18px] shrink-0" style={{ color: GREEN }} /> {sv}
                  </div>
                ))}
              </div>
            </Card>

            <Card title="Qualifications">
              <ul className="space-y-3">
                {quals.map((q) => (
                  <li key={q} className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_50 }}>
                      <GraduationCap className="w-5 h-5" style={{ color: BRAND }} />
                    </span>
                    <span className="text-[15px] font-semibold" style={{ color: INK }}>{q}</span>
                  </li>
                ))}
                {d.verified && (
                  <li className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GREEN_TINT }}>
                      <ShieldCheck className="w-5 h-5" style={{ color: GREEN }} />
                    </span>
                    <span className="text-[15px] font-semibold" style={{ color: INK }}>PMDC registration verified by PakMed</span>
                  </li>
                )}
              </ul>
            </Card>

            <Card title={`Patient reviews (${d.reviews})`}>
              <div className="flex items-center gap-4 mb-5">
                <p className="text-[40px] font-extrabold leading-none" style={{ color: INK }}>{d.rating}</p>
                <div>
                  <div className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4" fill={i < Math.round(d.rating) ? STAR : "none"} stroke={STAR} />)}</div>
                  <p className="text-[13px] mt-1" style={{ color: SUBTLE }}>Based on {d.reviews} verified patient reviews</p>
                </div>
              </div>
              <ul className="space-y-3">
                {reviews.map((r, i) => (
                  <li key={i} className="rounded-xl p-4" style={{ backgroundColor: CREAM }}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[14px] font-bold" style={{ color: INK }}>{r.name}</p>
                      <p className="text-[12px]" style={{ color: FAINT }}>{r.when}</p>
                    </div>
                    <div className="flex gap-0.5 mt-1">{[0, 1, 2, 3, 4].map((k) => <Star key={k} className="w-3.5 h-3.5" fill={k < r.rating ? STAR : "none"} stroke={STAR} />)}</div>
                    <p className="text-[14px] mt-2 leading-relaxed" style={{ color: INK_2 }}>{r.text}</p>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          {/* booking card */}
          <aside className="lg:sticky lg:top-[88px] space-y-4">
            <Card>
              <p className="text-[12px] font-bold uppercase tracking-[0.06em]" style={{ color: SUBTLE }}>Consultation fee</p>
              <p className="text-[28px] font-extrabold leading-tight" style={{ color: GREEN }}>PKR {d.fee}</p>
              <div className="mt-4 space-y-3 text-[14px]" style={{ color: INK_2 }}>
                <p className="flex items-start gap-2.5"><Building2 className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: BRAND }} /><span><b style={{ color: INK }}>{d.clinic}</b><br />{d.area}, {d.city}</span></p>
                <p className="flex items-center gap-2.5"><CalendarDays className="w-[18px] h-[18px] shrink-0" style={{ color: today ? GREEN : BRAND }} /><span style={{ color: today ? GREEN : INK_2, fontWeight: today ? 700 : 500 }}>Next available: {d.slots}</span></p>
                {d.online && <p className="flex items-center gap-2.5"><Video className="w-[18px] h-[18px] shrink-0" style={{ color: BRAND }} /> Online consultation available</p>}
              </div>
              <button type="button" onClick={onMessage}
                className="w-full h-12 mt-5 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{ backgroundColor: BRAND, boxShadow: "0 8px 20px -10px rgba(11,87,183,0.6)" }}>
                <MessageSquareText className="w-[18px] h-[18px]" /> Message doctor
              </button>
              {d.showPhone && d.phone && (
                <a href={doctorWaLink(d)} target="_blank" rel="noopener noreferrer"
                  className="w-full h-12 mt-2.5 rounded-xl text-[15px] font-bold inline-flex items-center justify-center gap-2"
                  style={{ color: "#128C3E", border: "1.5px solid #1DA851" }}>
                  <WhatsAppGlyph /> WhatsApp
                </a>
              )}
              <p className="text-[12.5px] mt-3 text-center" style={{ color: FAINT }}>Your details are shared only with this doctor.</p>
            </Card>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: AMBER_TINT }}>
              <ShieldCheck className="w-5 h-5 shrink-0 mt-px" style={{ color: AMBER }} />
              <p className="text-[13px] leading-relaxed" style={{ color: "#6B4B22" }}>In an emergency, call <b>1122</b> or go to the nearest hospital.</p>
            </div>
          </aside>
        </div>

        {/* other doctors */}
        {others.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: INK }}>Other doctors you may like</h2>
                <p className="text-[14px] mt-1" style={{ color: SUBTLE }}>Similar speciality or in {d.city}</p>
              </div>
              <div className="hidden sm:flex gap-2 shrink-0">
                {[[-1, ChevronLeft, "Previous"], [1, ChevronRight, "Next"]].map(([dir, Icon, label]) => (
                  <button key={label} type="button" onClick={() => slide(dir)} aria-label={label}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-shadow hover:shadow-md" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <Icon className="w-5 h-5" style={{ color: INK }} />
                  </button>
                ))}
              </div>
            </div>
            <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0" style={{ scrollbarWidth: "none" }}>
              {others.map((x) => (
                <div key={x.id} className="snap-start shrink-0 w-[75%] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-48px)/4)]">
                  <DoctorMiniCard d={x} onOpen={onOpenDoctor} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {shareOpen && <ShareSheet card={{ id: d.id, title: `${d.name} — ${d.specialty}, ${d.city}` }} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function ConsultDoctorScreen({ initialQuery, userCity, onBack, onMenu, onReport, reportedIds, isSaved = () => false, onToggleSave = () => {}, onMessage = () => {}, guestDefaults = {} }) {
  const gate = useContext(AuthGate);
  const [query, setQuery] = useState(initialQuery || "");
  const [location, setLocation] = useState(initialQuery ? "" : (userCity || ""));
  const [qDraft, setQDraft] = useState(initialQuery || "");
  const [locDraft, setLocDraft] = useState(initialQuery ? "" : (userCity || ""));
  const [f, setF] = useState(EMPTY_DOC_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [limit, setLimit] = useState(DOC_PAGE_SIZE);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openDoc, setOpenDoc] = useState(null);
  const [msgDoc, setMsgDoc] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => { setLimit(DOC_PAGE_SIZE); }, [query, location, f, sort]);
  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [filtersOpen]);

  const cityOptions = [...new Set([...CITIES, ...DOCTORS.map((d) => d.city), ...DOCTORS.map((d) => d.area)])].filter(Boolean).sort();
  const nameOptions = [...new Set([...DOCTOR_SPECIALTIES, ...DOCTORS.map((d) => d.name)])].sort();
  const cityCounts = DOCTORS.reduce((acc, d) => ({ ...acc, [d.city]: (acc[d.city] || 0) + 1 }), {});

  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  const base = DOCTORS.filter((d) => {
    if (q && ![d.name, d.specialty, d.qual, d.clinic].some((v) => String(v || "").toLowerCase().includes(q))) return false;
    if (loc && ![d.city, d.area].some((v) => String(v || "").toLowerCase().includes(loc))) return false;
    if (f.fees.length && !f.fees.some((k) => DOC_FEE_BANDS.find((b) => b.key === k).test(docFee(d)))) return false;
    if (f.today && !/^today/i.test(d.slots || "")) return false;
    if (f.online && !d.online) return false;
    if (f.verified && !d.verified) return false;
    if (f.rating45 && d.rating < 4.5) return false;
    if (f.exp10 && docExp(d) < 10) return false;
    return true;
  });
  const activeCat = DOC_CATEGORIES.find((c) => c.key === f.category);
  const inScope = f.specialties.length
    ? base.filter((d) => f.specialties.includes(d.specialty))
    : activeCat ? base.filter((d) => activeCat.specs.includes(d.specialty)) : base;
  const results = inScope.slice().sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating || b.reviews - a.reviews;
    if (sort === "fee") return docFee(a) - docFee(b);
    if (sort === "exp") return docExp(b) - docExp(a);
    return (b.rating * Math.log10(b.reviews + 10)) - (a.rating * Math.log10(a.reviews + 10));
  });
  const shown = results.slice(0, limit);
  const specCounts = base.reduce((acc, d) => ({ ...acc, [d.specialty]: (acc[d.specialty] || 0) + 1 }), {});
  const topSpecs = Object.entries(specCounts).sort((a, b) => b[1] - a[1]).map(([k]) => k);

  const toggle = (key) => (v) => setF((p) => ({ ...p, [key]: p[key].includes(v) ? p[key].filter((x) => x !== v) : [...p[key], v] }));
  const panelCount = (f.category && !f.specialties.length ? 1 : 0) + f.specialties.length + f.fees.length + f.today + f.online + f.verified + f.rating45 + f.exp10;
  const chips = [
    query && { label: `“${query}”`, clear: () => { setQuery(""); setQDraft(""); } },
    location && { label: location, icon: MapPin, clear: () => { setLocation(""); setLocDraft(""); } },
    activeCat && !f.specialties.length && { label: activeCat.label, clear: () => setF((p) => ({ ...p, category: "" })) },
    ...f.specialties.map((v) => ({ label: v, clear: () => toggle("specialties")(v) })),
    ...f.fees.map((k) => ({ label: DOC_FEE_BANDS.find((b) => b.key === k).label, clear: () => toggle("fees")(k) })),
    f.today && { label: "Available today", clear: () => setF((p) => ({ ...p, today: false })) },
    f.online && { label: "Online consult", clear: () => setF((p) => ({ ...p, online: false })) },
    f.verified && { label: "PMDC verified", clear: () => setF((p) => ({ ...p, verified: false })) },
    f.rating45 && { label: "4.5★ & above", clear: () => setF((p) => ({ ...p, rating45: false })) },
    f.exp10 && { label: "10+ yrs experience", clear: () => setF((p) => ({ ...p, exp10: false })) },
  ].filter(Boolean);
  const clearAll = () => { setQuery(""); setQDraft(""); setLocation(""); setLocDraft(""); setF(EMPTY_DOC_FILTERS); };
  const runSearch = (e) => {
    if (e) e.preventDefault();
    setQuery(qDraft.trim());
    setLocation(locDraft.trim());
    if (resultsRef.current && window.innerWidth < 1024) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pickCity = (c) => { const next = location === c ? "" : c; setLocation(next); setLocDraft(next); };
  const pickSpec = (s) => setF((p) => {
    const off = p.specialties.length === 1 && p.specialties[0] === s;
    return { ...p, specialties: off ? [] : [s], category: off ? p.category : docCategoryOf(s) };
  });
  const pickCategory = (key) => setF((p) => ({ ...p, category: p.category === key ? "" : key, specialties: [] }));
  const catCount = (c) => base.filter((d) => c.specs.includes(d.specialty)).length;

  const quick = [
    ["today", "Available today", CalendarDays],
    ["online", "Online consult", Video],
    ["verified", "PMDC verified", BadgeCheck],
    ["rating45", "4.5★ & above", Star],
    ["exp10", "10+ yrs exp.", Briefcase],
  ];
  const pill = (on) => ({
    color: on ? "#fff" : INK_2,
    backgroundColor: on ? BRAND : "#fff",
    border: `1px solid ${on ? BRAND : CARD_BORDER}`,
  });
  const H = ({ children }) => <p className="text-[12.5px] font-bold uppercase tracking-[0.07em] mb-2.5" style={{ color: SUBTLE }}>{children}</p>;
  const Panel = (
    <div className="pb-4">
      <div className="pt-1">
        <H>Quick filters</H>
        <div className="flex flex-wrap gap-2">
          {quick.map(([k, label, Icon]) => (
            <button key={k} type="button" aria-pressed={f[k]} onClick={() => setF((p) => ({ ...p, [k]: !p[k] }))}
              className="h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
              style={pill(f[k])}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <H>Category</H>
        <div className="space-y-1">
          {DOC_CATEGORIES.map((c) => {
            const on = f.category === c.key;
            const n = catCount(c);
            return (
              <button key={c.key} type="button" onClick={() => pickCategory(c.key)} disabled={!n && !on} aria-pressed={on}
                className="w-full h-11 px-2 rounded-xl flex items-center gap-2.5 text-left transition-colors disabled:opacity-40 hover:bg-[#F5F7FA]"
                style={{ backgroundColor: on ? BRAND_50 : "transparent", boxShadow: on ? "inset 0 0 0 1.5px #B9D3F2" : "none" }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: on ? "#fff" : CREAM }}>
                  <c.icon className="w-4 h-4" style={{ color: on ? BRAND : INK_2 }} />
                </span>
                <span className="flex-1 min-w-0 truncate text-[13.5px] font-semibold" style={{ color: on ? BRAND : INK }}>{c.label}</span>
                <span className="text-[11.5px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ color: on ? BRAND : SUBTLE, backgroundColor: on ? "#fff" : CREAM }}>{n}</span>
              </button>
            );
          })}
        </div>

        {activeCat && (
          <div className="mt-3 rounded-xl p-3 auth-step" style={{ backgroundColor: CREAM }}>
            <p className="text-[12.5px] font-semibold mb-2" style={{ color: INK_2 }}>Speciality in {activeCat.label}</p>
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setF((p) => ({ ...p, specialties: [] }))}
                className="h-8 px-3 rounded-full text-[12.5px] font-semibold" style={pill(!f.specialties.length)}>
                All
              </button>
              {activeCat.specs.map((sp) => (
                <button key={sp} type="button" onClick={() => toggle("specialties")(sp)} disabled={!specCounts[sp] && !f.specialties.includes(sp)}
                  className="h-8 px-3 rounded-full text-[12.5px] font-semibold disabled:opacity-40" style={pill(f.specialties.includes(sp))}>
                  {sp} <span style={{ opacity: 0.7 }}>{specCounts[sp] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <H>Consultation fee</H>
        <div className="flex flex-wrap gap-2">
          {DOC_FEE_BANDS.map((b) => (
            <button key={b.key} type="button" aria-pressed={f.fees.includes(b.key)} onClick={() => toggle("fees")(b.key)}
              className="h-9 px-3 rounded-full text-[13px] font-semibold transition-colors" style={pill(f.fees.includes(b.key))}>
              {b.label.replace("PKR ", "Rs ")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (openDoc) {
    return (
      <>
        <DoctorProfilePage
          doctor={openDoc}
          onBack={() => setOpenDoc(null)}
          onOpenDoctor={setOpenDoc}
          saved={isSaved("doctor", openDoc.id)}
          onToggleSave={() => onToggleSave("doctor", openDoc)}
          onMessage={() => setMsgDoc(openDoc)}
          onReport={() => gate.require("report this", () => onReport({ id: openDoc.id, type: "doctor", title: openDoc.name, subtitle: `${openDoc.specialty} · ${openDoc.city}` }))}
          reported={reportedIds.has(openDoc.id)}
        />
        {msgDoc && (
          <DoctorMessageSheet doctor={msgDoc} authed={gate.authed} defaults={guestDefaults}
            onSend={onMessage} onClose={() => setMsgDoc(null)} />
        )}
      </>
    );
  }

  return (
    <div className="w-full min-w-0" style={{ fontFamily: FONT }}>
      {/* search hero */}
      <section className="relative z-10" style={{ background: "linear-gradient(135deg, #0B3F86 0%, #0B57B7 55%, #0E7C86 100%)" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
          <img src="/images/landing/find-doctor.jpg" alt="" className="hidden lg:block absolute right-0 top-0 h-full w-[34%] object-cover opacity-25" style={{ maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-5">
            {onBack && (
              <button type="button" onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <p className="text-[13px] font-semibold text-white/80">Home <span className="mx-1 text-white/50">/</span> <span className="text-white">Find a Doctor</span></p>
          </div>
          <h1 className="text-[28px] sm:text-[38px] font-extrabold tracking-[-0.03em] leading-tight text-white">Find and consult verified doctors</h1>
          <p className="text-[14.5px] sm:text-[16px] mt-2 text-white/80">{DOCTORS.length} PMDC-registered doctors across {Object.keys(cityCounts).length} cities · in-clinic and online</p>

          <form onSubmit={runSearch} className="mt-6 bg-white rounded-2xl p-2 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_auto] gap-2 relative z-20" style={{ boxShadow: "0 20px 40px -20px rgba(0,0,0,0.4)" }}>
            <SearchSuggestInput
              icon={Stethoscope}
              value={qDraft}
              onChange={setQDraft}
              onPick={(v) => { setQDraft(v); setQuery(v); }}
              onClear={() => { setQDraft(""); setQuery(""); }}
              placeholder="Doctor name or speciality"
              suggestions={nameOptions}
              srLabel="Doctor name or speciality"
              className="md:border-r rounded-xl"
              style={{ borderColor: CARD_BORDER }}
            />
            <SearchSuggestInput
              icon={MapPin}
              value={locDraft}
              onChange={setLocDraft}
              onPick={(v) => { setLocDraft(v); setLocation(v); }}
              onClear={() => { setLocDraft(""); setLocation(""); }}
              placeholder="City or area"
              suggestions={cityOptions}
              srLabel="City or area"
              className="rounded-xl"
            />
            <button type="submit" className="h-12 px-7 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110" style={{ backgroundColor: BRAND }}>
              <Search className="w-4 h-4" /> Find doctors
            </button>
          </form>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ scrollbarWidth: "none" }}>
            {CITIES.filter((c) => cityCounts[c]).map((c) => {
              const on = location.toLowerCase() === c.toLowerCase();
              return (
                <button key={c} type="button" onClick={() => pickCity(c)}
                  className="shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: on ? "#fff" : "rgba(255,255,255,0.14)", color: on ? BRAND : "#fff", border: `1px solid ${on ? "#fff" : "rgba(255,255,255,0.25)"}` }}>
                  {c} <span className="text-[11.5px]" style={{ opacity: 0.7 }}>{cityCounts[c]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div ref={resultsRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 scroll-mt-20">
        {/* speciality quick picks */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }}>
          <button type="button" onClick={() => setF((p) => ({ ...p, specialties: [], category: "" }))}
            className="shrink-0 h-10 px-4 rounded-xl text-[14px] font-bold inline-flex items-center gap-2"
            style={{ backgroundColor: !f.specialties.length ? INK : "#fff", color: !f.specialties.length ? "#fff" : INK_2, border: `1px solid ${!f.specialties.length ? INK : CARD_BORDER}` }}>
            All <span className="text-[11.5px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: !f.specialties.length ? "rgba(255,255,255,0.18)" : CREAM, color: !f.specialties.length ? "#fff" : SUBTLE }}>{base.length}</span>
          </button>
          {topSpecs.slice(0, 10).map((s) => {
            const on = f.specialties.length === 1 && f.specialties[0] === s;
            return (
              <button key={s} type="button" onClick={() => pickSpec(s)}
                className="shrink-0 h-10 px-4 rounded-xl text-[14px] font-bold inline-flex items-center gap-2 transition-all"
                style={{ backgroundColor: on ? INK : "#fff", color: on ? "#fff" : INK_2, border: `1px solid ${on ? INK : CARD_BORDER}` }}>
                {s} <span className="text-[11.5px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: on ? "rgba(255,255,255,0.18)" : CREAM, color: on ? "#fff" : SUBTLE }}>{specCounts[s]}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[264px_1fr] gap-6 items-start">
          <aside className="hidden lg:block sticky top-[88px] rounded-2xl bg-white px-5 pt-4 pb-1 max-h-[calc(100dvh-110px)] overflow-y-auto auth-scroll" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <div className="flex items-center justify-between pb-3">
              <p className="text-[16px] font-extrabold flex items-center gap-2" style={{ color: INK }}><SlidersHorizontal className="w-4 h-4" /> Filters</p>
              {panelCount > 0 && <button type="button" onClick={() => setF(EMPTY_DOC_FILTERS)} className="text-[13px] font-bold" style={{ color: BRAND }}>Clear</button>}
            </div>
            {Panel}
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-[14.5px] mr-auto" style={{ color: SUBTLE }}>
                <b className="text-[16px]" style={{ color: INK }}>{results.length}</b> {results.length === 1 ? "doctor" : "doctors"}
                {location ? <> in <b style={{ color: INK }}>{location}</b></> : " across Pakistan"}
              </p>
              <button type="button" onClick={() => setFiltersOpen(true)}
                className="lg:hidden h-10 px-3.5 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-2 bg-white"
                style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {panelCount > 0 && <span className="w-5 h-5 rounded-full text-[11px] text-white flex items-center justify-center" style={{ backgroundColor: BRAND }}>{panelCount}</span>}
              </button>
              <Dropdown label="Sort doctors" icon={ArrowUpDown} value={sort} onChange={setSort} options={DOC_SORTS} />
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {chips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full text-[12.5px] font-semibold" style={{ color: BRAND_DK, backgroundColor: BRAND_50, border: "1px solid #B9D3F2" }}>
                    {c.icon && <c.icon className="w-3.5 h-3.5" />} {c.label}
                    <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <button type="button" onClick={clearAll} className="text-[13px] font-bold px-2 h-8" style={{ color: RED }}>Clear all</button>
              </div>
            )}

            {results.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-14 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: BRAND_50 }}>
                  <Stethoscope className="w-6 h-6" style={{ color: BRAND }} />
                </span>
                <p className="text-[17px] font-bold" style={{ color: INK }}>No doctors match your search</p>
                <p className="text-[14px] mt-1 mb-5" style={{ color: SUBTLE }}>Try a nearby city, another speciality, or fewer filters.</p>
                <button type="button" onClick={clearAll} className="h-11 px-5 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>Clear all filters</button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {shown.map((d) => {
                    const saved = isSaved("doctor", d.id);
                    const today = /^today/i.test(d.slots || "");
                    const avatarBg = DOC_COLORS[parseInt(String(d.id).replace(/\D/g, ""), 10) % DOC_COLORS.length];
                    return (
                      <article key={d.id} role="button" tabIndex={0}
                        onClick={() => setOpenDoc(d)}
                        onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); setOpenDoc(d); } }}
                        className="group rounded-2xl bg-white p-4 sm:p-5 flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                        style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                        <div className="flex items-start gap-3.5">
                          <span className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white font-extrabold text-[18px]" style={{ backgroundColor: avatarBg }}>
                            {initialsOf(d.name)}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[16px] font-bold leading-snug flex items-center gap-1.5 group-hover:text-[#0B57B7] transition-colors" style={{ color: INK }}>
                              <span className="truncate">{d.name}</span>
                              {d.verified && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />}
                            </p>
                            <p className="text-[14px] font-semibold mt-0.5" style={{ color: BRAND }}>{d.specialty}</p>
                            <p className="text-[12.5px] mt-0.5 truncate" style={{ color: SUBTLE }}>{d.qual}</p>
                          </div>
                          <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSave("doctor", d); }}
                            aria-label={saved ? "Remove from saved" : "Save doctor"}
                            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-[#F5F7FA]"
                            style={{ border: `1px solid ${saved ? "#B9D3F2" : CARD_BORDER}`, backgroundColor: saved ? BRAND_50 : "#fff" }}>
                            <Bookmark className="w-4 h-4" fill={saved ? BRAND : "none"} stroke={saved ? BRAND : SUBTLE} />
                          </button>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3.5 text-[13px]" style={{ color: INK_2 }}>
                          <span className="inline-flex items-center gap-1 font-bold" style={{ color: INK }}>
                            <Star className="w-4 h-4" fill={STAR} stroke="none" /> {d.rating}
                            <span className="font-medium" style={{ color: SUBTLE }}>({d.reviews})</span>
                          </span>
                          <span className="inline-flex items-center gap-1.5"><Briefcase className="w-4 h-4" style={{ color: FAINT }} />{d.exp}</span>
                          <span className="inline-flex items-center gap-1.5 min-w-0"><MapPin className="w-4 h-4 shrink-0" style={{ color: FAINT }} /><span className="truncate">{d.area}, {d.city}</span></span>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3">
                          <span className="text-[11.5px] font-bold px-2 py-1 rounded-md inline-flex items-center gap-1" style={{ color: today ? GREEN : INK_2, backgroundColor: today ? GREEN_TINT : CREAM }}>
                            <CalendarDays className="w-3.5 h-3.5" /> {d.slots}
                          </span>
                          {d.online && <span className="text-[11.5px] font-bold px-2 py-1 rounded-md" style={{ color: BRAND, backgroundColor: BRAND_50 }}>Online consult</span>}
                          <span className="text-[11.5px] font-semibold px-2 py-1 rounded-md truncate max-w-[200px]" style={{ color: INK_2, backgroundColor: CREAM }}>{d.clinic}</span>
                        </div>

                        <div className="flex items-center justify-between gap-3 mt-4 pt-3.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                          <div>
                            <p className="text-[11.5px] font-semibold uppercase tracking-[0.06em]" style={{ color: SUBTLE }}>Fee</p>
                            <p className="text-[17px] font-extrabold leading-tight" style={{ color: GREEN }}>PKR {d.fee}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {d.showPhone && d.phone && (
                              <a href={doctorWaLink(d)} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                                aria-label={`WhatsApp ${d.name}`}
                                className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ border: "1.5px solid #1DA851" }}>
                                <WhatsAppGlyph />
                              </a>
                            )}
                            <button type="button" onClick={(e) => { e.stopPropagation(); setMsgDoc(d); }}
                              className="h-10 px-4 rounded-xl text-[13.5px] font-bold text-white inline-flex items-center gap-1.5 transition-all hover:brightness-110"
                              style={{ backgroundColor: BRAND }}>
                              <MessageSquareText className="w-4 h-4" /> Consult
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
                {results.length > shown.length && (
                  <div className="text-center mt-6">
                    <button type="button" onClick={() => setLimit((l) => l + DOC_PAGE_SIZE)}
                      className="h-11 px-6 rounded-xl text-[14px] font-bold bg-white transition-shadow hover:shadow-md" style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}>
                      Show more doctors ({results.length - shown.length} left)
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/45" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] bg-white rounded-t-3xl flex flex-col auth-step">
            <div className="flex items-center justify-between px-5 h-14 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[17px] font-extrabold" style={{ color: INK }}>Filters</p>
              <div className="flex items-center gap-2">
                {panelCount > 0 && <button type="button" onClick={() => setF(EMPTY_DOC_FILTERS)} className="text-[13.5px] font-bold px-2" style={{ color: BRAND }}>Clear</button>}
                <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
                  <X className="w-5 h-5" style={{ color: INK }} />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 -mt-px">{Panel}</div>
            <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <button type="button" onClick={() => setFiltersOpen(false)} className="w-full h-12 rounded-xl text-[15px] font-bold text-white" style={{ backgroundColor: BRAND }}>
                Show {results.length} {results.length === 1 ? "doctor" : "doctors"}
              </button>
            </div>
          </div>
        </div>
      )}

      {msgDoc && (
        <DoctorMessageSheet doctor={msgDoc} authed={gate.authed} defaults={guestDefaults}
          onSend={onMessage} onClose={() => setMsgDoc(null)} />
      )}
    </div>
  );
}

function DoctorDetailSheet({ doctor: d, onClose, onReport, reported, saved, onToggleSave, onMessage }) {
  const gate = useContext(AuthGate);
  const [shareOpen, setShareOpen] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col overflow-hidden" style={{ height: "90%", fontFamily: FONT }}>
        <div className="flex-1 min-h-0 overflow-y-auto" style={{ backgroundColor: CREAM }}>
          {/* cover + identity */}
          <div className="bg-white" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
            <div className="relative h-20" style={{ background: `linear-gradient(135deg, ${BRAND}, #0A3F86)` }}>
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => gate.require("share this profile", () => setShareOpen(true))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,.18)" }} aria-label="Share">
                  <Upload className="w-4 h-4 text-white" />
                </button>
                <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,.18)" }} aria-label="Close">
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="px-4 pb-4 -mt-9">
              <div className="w-[76px] h-[76px] rounded-full flex items-center justify-center text-white font-bold text-[24px]"
                style={{ backgroundColor: BRAND, border: "4px solid #fff" }}>
                {initialsOf(d.name)}
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <p className="text-[20px] font-extrabold" style={{ color: INK, letterSpacing: "-0.025em" }}>{d.name}</p>
                {d.verified && <CheckCircle2 className="w-[18px] h-[18px] shrink-0" style={{ color: GREEN }} />}
              </div>
              <p className="text-[13.5px] font-semibold" style={{ color: BRAND }}>{d.specialty}</p>
              <p className="text-[12.5px] mt-0.5" style={{ color: SUBTLE }}>{d.qual}</p>

              <div className="grid grid-cols-3 mt-3.5 rounded-xl" style={{ border: `1px solid ${CARD_BORDER}` }}>
                {[[d.exp, "Experience"], [`${d.rating} ★`, `${d.reviews} reviews`], [`PKR ${d.fee}`, "Per visit"]].map(([v, k], n) => (
                  <div key={k} className="py-2.5 px-1 text-center" style={{ borderLeft: n ? `1px solid ${CARD_BORDER}` : "none" }}>
                    <p className="text-[15px] font-extrabold" style={{ color: INK, letterSpacing: "-0.02em" }}>{v}</p>
                    <p className="text-[11px]" style={{ color: SUBTLE }}>{k}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* practice */}
          <div className="bg-white mt-2.5 px-4 py-3.5" style={{ borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}` }}>
            <p className="text-[14px] font-bold mb-2.5" style={{ color: INK }}>Practice location</p>
            <div className="rounded-xl p-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[14px] font-bold" style={{ color: INK }}>{d.clinic}</p>
              <p className="text-[12.5px] mt-0.5 flex items-center gap-1" style={{ color: SUBTLE }}><MapPin className="w-3.5 h-3.5" /> {d.area}, {d.city}</p>
              <div className="flex items-center justify-between mt-2.5 pt-2.5" style={{ borderTop: `1px dashed ${CARD_BORDER}` }}>
                <span className="text-[12.5px] flex items-center gap-1.5" style={{ color: INK_2 }}><Clock className="w-3.5 h-3.5" style={{ color: SUBTLE }} /> {d.slots ? `Available ${d.slots.split(" ")[0].toLowerCase()}` : "Timings on request"}</span>
                <b className="text-[14px]" style={{ color: INK }}>PKR {d.fee}</b>
              </div>
            </div>
            {d.online && (
              <p className="text-[12.5px] mt-2.5 flex items-center gap-1.5" style={{ color: GREEN }}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Also takes online consultations
              </p>
            )}
          </div>

          {/* contact */}
          <div className="bg-white mt-2.5 px-4 py-3.5" style={{ borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}` }}>
            <p className="text-[14px] font-bold mb-1.5" style={{ color: INK }}>Contact</p>
            {d.showPhone && d.phone ? (
              <p className="text-[13px] flex items-center gap-2" style={{ color: INK_2 }}><Phone className="w-4 h-4" style={{ color: SUBTLE }} /> {d.phone}</p>
            ) : (
              <p className="text-[12.5px] leading-snug" style={{ color: SUBTLE }}>This doctor keeps their number private. Send a message through PakMed instead.</p>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-4">
            <p className="text-[11.5px]" style={{ color: SUBTLE }}>WhatsApp messages include "sent via PakMed".</p>
            {onReport && (
              <button onClick={() => gate.require("report this", () => onReport({ id: d.id, type: "doctor", title: d.name, subtitle: `${d.specialty} · ${d.city}` }))}
                className="text-[12px] font-semibold flex items-center gap-1" style={{ color: reported ? RED : SUBTLE }}>
                <Flag className="w-3.5 h-3.5" fill={reported ? RED : "none"} /> {reported ? "Reported" : "Report"}
              </button>
            )}
          </div>
        </div>

        {/* sticky actions */}
        <div className="px-4 py-3 shrink-0 flex gap-2 items-center bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          {onToggleSave && <SaveButton saved={saved} onClick={onToggleSave} size={48} />}
          <button onClick={onMessage} className="flex-1 h-12 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-1.5" style={{ backgroundColor: BRAND }}>
            <MessageSquareText className="w-4 h-4" /> Message
          </button>
          {d.showPhone && d.phone && (
            <a href={doctorWaLink(d)} target="_blank" rel="noopener noreferrer"
              className="flex-1 h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-1.5"
              style={{ color: "#128C3E", border: "1.5px solid #1DA851" }}>
              <WhatsAppGlyph /> WhatsApp
            </a>
          )}
        </div>
      </div>

      {shareOpen && <ShareSheet card={{ id: d.id, title: `${d.name} — ${d.specialty}, ${d.city}` }} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

/* =========================================================
   REPORTING & MODERATION
   ========================================================= */
const REPORT_REASONS = {
  job: [
    "Asks for money or a registration fee",
    "Fake or non-existent employer",
    "Salary or details are misleading",
    "Duplicate or spam posting",
    "Offensive or discriminatory wording",
    "Contact details don't work",
  ],
  listing: [
    "Counterfeit or fake product",
    "Price is misleading",
    "Seller asks for advance payment off-platform",
    "Item is not as described",
    "Duplicate or spam listing",
    "Prohibited item",
  ],
  doctor: [
    "Not a real doctor / fake credentials",
    "PMDC number looks invalid",
    "Impersonating someone else",
    "Misleading qualifications or fees",
    "Clinic address is wrong",
  ],
  service: [
    "Fake or non-existent business",
    "Asks for advance payment",
    "Service not as described",
    "Unqualified for the work offered",
    "Duplicate or spam listing",
  ],
  cv: [
    "Fake qualifications or PMDC number",
    "Impersonating someone else",
    "Contains offensive content",
    "Not a real person",
  ],
  post: [
    "Scam or misleading content",
    "Offensive or harmful content",
    "Spam",
    "Wrong or dangerous medical information",
  ],
};

const REPORT_TYPE_LABEL = {
  job: "job post", listing: "market listing", doctor: "doctor profile",
  service: "service offering", cv: "CV", post: "post",
};

/* tiny flag button — sits bottom-right of any card */
function SaveButton({ saved, onClick, size = 28 }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="rounded-full flex items-center justify-center active:scale-90 transition-transform shrink-0"
      style={{ width: size, height: size, backgroundColor: saved ? BRAND_50 : "#F2F4F7", border: `1px solid ${saved ? "#B9D3F2" : CARD_BORDER}` }}
      aria-label={saved ? "Remove from saved" : "Save"}
    >
      <Bookmark className="w-3.5 h-3.5" strokeWidth={2.2} fill={saved ? BRAND : "none"} stroke={saved ? BRAND : SUBTLE} />
    </button>
  );
}

function ReportButton({ onClick, dark, reported }) {
  const gate = useContext(AuthGate);
  return (
    <button
      onClick={(e) => { e.stopPropagation(); gate.require("report this", onClick); }}
      className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      style={{
        backgroundColor: reported ? (dark ? "rgba(220,38,38,.25)" : RED_TINT) : (dark ? "rgba(255,255,255,.16)" : "#F1F3F9"),
        border: `1px solid ${reported ? RED + "55" : (dark ? "rgba(255,255,255,.2)" : CARD_BORDER)}`,
      }}
      aria-label={reported ? "Reported" : "Report this"}
      title={reported ? "Already reported" : "Report"}
    >
      <Flag
        className="w-3.5 h-3.5"
        strokeWidth={2.2}
        fill={reported ? RED : "none"}
        stroke={reported ? RED : (dark ? "#FFFFFFAA" : SUBTLE)}
      />
    </button>
  );
}

/* report bottom sheet */
function ReportSheet({ target, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [done, setDone] = useState(false);
  const reasons = REPORT_REASONS[target.type] || REPORT_REASONS.post;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    onSubmit({ reason, details: details.trim() });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6" role="dialog" aria-modal="true" aria-label="Report">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[760px] max-h-[92dvh] bg-white rounded-3xl flex flex-col overflow-hidden auth-step"
        style={{ boxShadow: "0 30px 80px -20px rgba(16,24,40,0.45)", fontFamily: FONT }}>
        {/* header */}
        <div className="flex items-center gap-3 px-5 sm:px-7 pt-5 pb-4 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: done ? GREEN_TINT : RED_TINT }}>
            {done ? <Check className="w-5 h-5" strokeWidth={3} style={{ color: GREEN }} /> : <Flag className="w-5 h-5" style={{ color: RED }} />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-extrabold text-[18px] leading-tight" style={{ color: INK }}>{done ? "Report sent" : `Report this ${REPORT_TYPE_LABEL[target.type] || "post"}`}</p>
            <p className="text-[13.5px] truncate" style={{ color: SUBTLE }}>
              <span className="font-semibold" style={{ color: INK_2 }}>{target.title}</span>{target.subtitle ? ` · ${target.subtitle}` : ""}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-colors hover:bg-[#EEF1F5]" style={{ backgroundColor: CREAM }}>
            <X className="w-5 h-5" style={{ color: INK }} />
          </button>
        </div>

        {done ? (
          <div className="px-5 sm:px-7 py-7 grid sm:grid-cols-[1fr_1fr] gap-4 items-start">
            <div>
              <p className="text-[17px] font-extrabold" style={{ color: INK }}>Thanks for telling us</p>
              <p className="text-[14.5px] mt-1.5 leading-relaxed" style={{ color: SUBTLE }}>
                Our team will review this {REPORT_TYPE_LABEL[target.type]}. We never share who reported it.
              </p>
            </div>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: AMBER_TINT }}>
              <ShieldCheck className="w-5 h-5 shrink-0 mt-px" style={{ color: AMBER }} />
              <p className="text-[13.5px] leading-relaxed" style={{ color: "#6B4B22" }}>
                <strong>Stay safe:</strong> PakMed jobs never require an upfront payment. Never send money to secure a position or reserve an item.
              </p>
            </div>
            <div className="sm:col-span-2 flex justify-end">
              <button type="button" onClick={onClose} className="h-11 px-7 rounded-xl font-bold text-[14.5px] text-white" style={{ backgroundColor: BRAND }}>Done</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-5 sm:px-7 py-5">
              <p className="text-[14.5px] font-bold mb-3" style={{ color: INK }}>Why are you reporting this?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reasons.map((r) => {
                  const on = reason === r;
                  return (
                    <button key={r} type="button" onClick={() => setReason(r)} aria-pressed={on}
                      className="w-full flex items-center gap-3 px-4 min-h-[52px] py-2.5 rounded-xl text-left transition-colors"
                      style={{ backgroundColor: on ? RED_TINT : "#fff", border: `1.5px solid ${on ? RED : CARD_BORDER}` }}>
                      <span className="w-[18px] h-[18px] rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${on ? RED : "#C7CDDD"}` }}>
                        {on && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RED }} />}
                      </span>
                      <span className="text-[14.5px] leading-snug" style={{ color: INK, fontWeight: on ? 600 : 500 }}>{r}</span>
                    </button>
                  );
                })}
              </div>

              <label className="block mt-5">
                <span className="text-[14.5px] font-bold" style={{ color: INK }}>Anything else? <span className="font-medium" style={{ color: FAINT }}>(optional)</span></span>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={2}
                  placeholder="Add any detail that helps us check this"
                  className="pm-input mt-2 w-full text-[15px] rounded-xl px-4 py-3 outline-none resize-none bg-white"
                  style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}
                />
              </label>
            </div>

            <div className="px-5 sm:px-7 py-4 shrink-0 flex flex-col-reverse sm:flex-row sm:items-center gap-3" style={{ borderTop: `1px solid ${CARD_BORDER}`, backgroundColor: "#FCFCFD" }}>
              <p className="flex-1 text-[12.5px] leading-snug flex items-start gap-2" style={{ color: SUBTLE }}>
                <ShieldCheck className="w-4 h-4 shrink-0 mt-px" />
                Reports are confidential. False reports may affect your own account.
              </p>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={onClose} className="flex-1 sm:flex-none h-11 px-5 rounded-xl font-bold text-[14.5px]" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                  Cancel
                </button>
                <button type="button" onClick={submit} disabled={!reason}
                  className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-bold text-[14.5px] text-white transition-opacity disabled:cursor-not-allowed"
                  style={{ backgroundColor: RED, opacity: reason ? 1 : 0.45 }}>
                  Submit report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- admin moderation queue ---------- */
const REPORT_STATUS = {
  pending:   { label: "Pending",   color: AMBER, tint: AMBER_TINT },
  reviewing: { label: "Reviewing", color: NAVY,  tint: NAVY_TINT },
  removed:   { label: "Removed",   color: RED,   tint: RED_TINT },
  dismissed: { label: "Dismissed", color: GREEN, tint: GREEN_TINT },
};

function ModerationScreen({ reports, setReports, onBack, onMenu }) {
  const [filter, setFilter] = useState("pending");
  const [open, setOpen] = useState(null);

  // group reports by the item they point at
  const grouped = Object.values(
    reports.reduce((acc, r) => {
      const k = r.targetId;
      if (!acc[k]) acc[k] = { ...r, count: 0, reasons: [], ids: [] };
      acc[k].count += 1;
      acc[k].reasons.push(r.reason);
      acc[k].ids.push(r.id);
      if (r.status !== "pending") acc[k].status = r.status;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count);

  const shown = filter === "all" ? grouped : grouped.filter((g) => g.status === filter);
  const counts = {
    pending: grouped.filter((g) => g.status === "pending").length,
    reviewing: grouped.filter((g) => g.status === "reviewing").length,
    all: grouped.length,
  };

  const setStatus = (ids, status) => {
    setReports((prev) => prev.map((r) => (ids.includes(r.id) ? { ...r, status } : r)));
    setOpen(null);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Moderation" subtitle="Reported content queue" onBack={onBack} onMenu={onMenu} />

      <div className="px-3 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[["pending", `Pending (${counts.pending})`], ["reviewing", `Reviewing (${counts.reviewing})`], ["removed", "Removed"], ["dismissed", "Dismissed"], ["all", `All (${counts.all})`]].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              className="shrink-0 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
              style={{ backgroundColor: filter === k ? NAVY : "white", color: filter === k ? "white" : INK, border: `1.5px solid ${filter === k ? NAVY : CARD_BORDER}` }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {grouped.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-center mt-1" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
            <ShieldCheck className="w-9 h-9 mx-auto mb-2" style={{ color: GREEN }} />
            <p className="text-[14px] font-semibold" style={{ color: INK }}>Nothing reported</p>
            <p className="text-[12.5px] mt-1" style={{ color: SUBTLE }}>Flagged jobs, listings, profiles and posts will appear here.</p>
          </div>
        )}

        {shown.length === 0 && grouped.length > 0 && (
          <p className="text-[13px] text-center py-6" style={{ color: SUBTLE }}>Nothing in this queue.</p>
        )}

        <div className="flex flex-col gap-2.5">
          {shown.map((g) => {
            const st = REPORT_STATUS[g.status] || REPORT_STATUS.pending;
            const urgent = g.count >= 3;
            return (
              <button key={g.targetId} onClick={() => setOpen(g)}
                className="rounded-2xl bg-white p-3.5 text-left active:scale-[0.99] transition-transform"
                style={{ border: `1px solid ${urgent ? RED + "55" : CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: st.tint }}>
                    <Flag className="w-4 h-4" style={{ color: st.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, backgroundColor: st.tint }}>{st.label}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: SUBTLE, backgroundColor: "#EFF2FA" }}>{REPORT_TYPE_LABEL[g.type]}</span>
                      {urgent && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: RED, backgroundColor: RED_TINT }}>{g.count} reports</span>}
                    </div>
                    <p className="text-[14px] font-semibold leading-snug" style={{ color: INK }}>{g.title}</p>
                    {g.subtitle && <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}>{g.subtitle}</p>}
                    <p className="text-[12.5px] mt-1.5" style={{ color: "#4B4A45" }}>“{g.reasons[0]}”</p>
                    {g.count > 1 && <p className="text-[11.5px] mt-0.5" style={{ color: SUBTLE }}>+{g.count - 1} more report{g.count > 2 ? "s" : ""}</p>}
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: SUBTLE }} />
                </div>
              </button>
            );
          })}
        </div>

        {grouped.length > 0 && (
          <p className="text-[11.5px] mt-4 leading-snug px-1" style={{ color: SUBTLE }}>
            Items with 3 or more reports are highlighted. In the live app these are auto-hidden pending review.
          </p>
        )}
      </div>

      {/* action sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(null)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl">
            <div className="flex justify-center pt-2.5 pb-1"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>
            <div className="px-5 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
              <p className="font-bold text-[15px]" style={{ color: INK }}>{open.title}</p>
              <p className="text-[12px] mt-0.5" style={{ color: SUBTLE }}>{open.count} report{open.count > 1 ? "s" : ""} · {REPORT_TYPE_LABEL[open.type]}</p>
            </div>

            <div className="px-5 py-3 max-h-40 overflow-y-auto">
              <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Reasons given</p>
              {open.reasons.map((r, i) => (
                <p key={i} className="text-[13px] mb-1" style={{ color: "#4B4A45" }}>• {r}</p>
              ))}
            </div>

            <div className="px-4 pb-4 flex flex-col gap-2">
              <button onClick={() => setStatus(open.ids, "reviewing")} className="w-full py-3 rounded-full font-semibold text-[13.5px]" style={{ backgroundColor: NAVY_TINT, color: NAVY }}>
                Mark as reviewing
              </button>
              <button onClick={() => setStatus(open.ids, "removed")} className="w-full py-3 rounded-full font-semibold text-[13.5px]" style={{ backgroundColor: RED, color: "white" }}>
                Remove content
              </button>
              <button onClick={() => setStatus(open.ids, "dismissed")} className="w-full py-3 rounded-full font-semibold text-[13.5px]" style={{ backgroundColor: "#EFF2FA", color: INK }}>
                Dismiss — no violation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MyJobsScreen({ onBack, onMenu, postedJobs, jobSocial, onOpenJob, onToggleFav, applicants }) {
  const [shareJob, setShareJob] = useState(null);
  const [tab, setTab] = useState("saved");
  const all = [...postedJobs.filter((j) => j.status === "posted"), ...SEED_JOBS];
  const favs = all.filter((j) => jobSocial[j.id] && jobSocial[j.id].favourite);
  const mineApps = (applicants || []).filter((a) => a.id.startsWith("me-"));
  const appliedJobs = mineApps.map((a) => ({ app: a, job: all.find((j) => j.id === a.jobId) })).filter((x) => x.job);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="My Jobs" subtitle="Saved and applied" onBack={onBack} onMenu={onMenu} />

      <div className="px-3 pb-2 shrink-0 flex gap-2">
        {[["saved", `Saved (${favs.length})`], ["applied", `Applied (${appliedJobs.length})`]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
            style={{ backgroundColor: tab === k ? NAVY : "white", color: tab === k ? "white" : INK, border: `1.5px solid ${tab === k ? NAVY : CARD_BORDER}` }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {tab === "applied" && (
          appliedJobs.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center mt-1" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <FileText className="w-9 h-9 mx-auto mb-2" style={{ color: SUBTLE }} />
              <p className="text-[14px] font-semibold" style={{ color: INK }}>No applications yet</p>
              <p className="text-[12.5px] mt-1" style={{ color: SUBTLE }}>Jobs you apply to will show here with their status.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {appliedJobs.map(({ app, job }) => {
                const seekerStatus =
                  app.status === "shortlisted" ? { label: "Shortlisted", color: GREEN, tint: GREEN_TINT, note: "The employer shortlisted you." }
                  : app.status === "rejected" ? { label: "Not selected", color: SUBTLE, tint: "#EFF2FA", note: "The employer moved on with others." }
                  : app.status === "viewed" ? { label: "Viewed", color: NAVY, tint: NAVY_TINT, note: "The employer opened your CV." }
                  : { label: "Applied", color: AMBER, tint: AMBER_TINT, note: "Waiting for the employer to review." };
                return (
                  <button key={app.id} onClick={() => onOpenJob(job)} className="rounded-2xl bg-white p-3.5 text-left active:scale-[0.99] transition-transform" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: seekerStatus.color, backgroundColor: seekerStatus.tint }}>{seekerStatus.label}</span>
                    <p className="text-[15.5px] font-bold mt-1.5" style={{ color: INK }}>{job.jobTitle}</p>
                    <p className="text-[12.5px] mt-0.5" style={{ color: SUBTLE }}>{job.facilityName} · {job.city}</p>
                    <p className="text-[14px] font-bold mt-1" style={{ color: NAVY }}>PKR {job.payAmount} <span className="text-[11px] font-medium" style={{ color: SUBTLE }}>{job.payUnitLabel}</span></p>
                    <p className="text-[12px] mt-1.5" style={{ color: SUBTLE }}>{seekerStatus.note} · applied {app.at}</p>
                  </button>
                );
              })}
            </div>
          )
        )}

        {tab === "saved" && (favs.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center mt-1" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
            <Bookmark className="w-9 h-9 mx-auto mb-2" style={{ color: SUBTLE }} />
            <p className="text-[14px] font-semibold" style={{ color: INK }}>No saved jobs yet</p>
            <p className="text-[12.5px] mt-1" style={{ color: SUBTLE }}>Tap the bookmark on any job to keep it here.</p>
          </div>
        ) : (
          <>
            <p className="text-[14px] font-bold mb-2" style={{ color: INK, letterSpacing: "-0.01em" }}>{favs.length} saved</p>
            <div className="flex flex-col gap-2.5">
              {favs.map((j) => (
                <button key={j.id} onClick={() => onOpenJob(j)} className="rounded-2xl bg-white p-3 text-left active:scale-[0.99] transition-transform" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                  <div className="flex gap-3">
                    <div className="shrink-0 rounded-xl overflow-hidden relative" style={{ width: 72, height: 90, border: `1px solid ${CARD_BORDER}` }}>
                      {j.photos && j.photos.length > 0 ? (
                        <img src={j.photos[j.coverIndex] || j.photos[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ transform: "scale(0.26)", transformOrigin: "top left", width: 277, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
                          <JobPostCard job={j} tpl={CARD_TEMPLATES.find((t) => t.id === j.templateId) || CARD_TEMPLATES[0]} scale={1} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15.5px] font-bold leading-snug" style={{ color: INK }}>{j.jobTitle}</p>
                      <p className="text-[16px] font-bold mt-1" style={{ color: NAVY }}>
                        PKR {j.payAmount}<span className="text-[11.5px] font-medium ml-1" style={{ color: SUBTLE }}>{j.payUnitLabel}</span>
                      </p>
                      <p className="text-[12px] mt-1 truncate" style={{ color: SUBTLE }}>{j.facilityName}</p>
                      <p className="text-[11.5px] mt-0.5 truncate" style={{ color: SUBTLE }}><IconText icon={MapPin}>{[j.area, j.city].filter(Boolean).join(", ")}</IconText></p>
                    </div>
                    <div className="flex flex-col gap-1.5 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleFav(j.id); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: NAVY_TINT, border: `1px solid ${NAVY}55` }}
                        aria-label="Remove from favourites"
                      >
                        <Bookmark className="w-3.5 h-3.5" strokeWidth={2.2} fill={NAVY} stroke={NAVY} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setShareJob(j); }}
                        className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                        style={{ backgroundColor: "#F1F3F9", border: `1px solid ${CARD_BORDER}` }}
                        aria-label="Share job"
                      >
                        <Repeat2 className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: SUBTLE }} />
                      </button>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ))}
      </div>
      {shareJob && <JobShareSheet job={shareJob} onClose={() => setShareJob(null)} />}
    </div>
  );
}

/* =========================================================
   ROLE PANELS — appear once the matching profile is complete
   ========================================================= */
const SEED_CANDIDATES = [
  { id: "cand1", name: "Dr. Hassan Raza", title: "Medical Officer", specialty: "Emergency Medicine", city: "Karachi", area: "Gulshan-e-Iqbal", exp: "4 yrs", pmdc: "PMC-33120-K", verified: true, about: "Emergency MO with ER and ICU rotations. Available for locum and night shifts.", added: "2 days ago" },
  { id: "cand2", name: "Sana Iqbal", title: "Staff Nurse", specialty: "Nursing", city: "Lahore", area: "Model Town", exp: "6 yrs", pmdc: "PNC-88231", verified: true, about: "Registered nurse, surgical ward and post-op care. Open to full-time.", added: "4 days ago" },
  { id: "cand3", name: "Dr. Areeba Khan", title: "Dentist", specialty: "Dentistry", city: "Islamabad", area: "F-10 Markaz", exp: "3 yrs", pmdc: "PMC-51204-I", verified: true, about: "BDS with restorative and cosmetic experience. Looking for part-time clinic hours.", added: "1 week ago" },
  { id: "cand4", name: "Bilal Ahmed", title: "Lab Technician", specialty: "Pathology", city: "Faisalabad", area: "Susan Road", exp: "5 yrs", pmdc: "AHC-20918", verified: false, about: "Hematology and chemistry analyzers, night shift experience.", added: "1 week ago" },
  { id: "cand5", name: "Dr. Usman Javed", title: "Consultant", specialty: "Cardiology", city: "Lahore", area: "Jail Road", exp: "11 yrs", pmdc: "PMC-19073-L", verified: true, about: "FCPS Cardiology. Available for evening OPD sessions two days a week.", added: "3 days ago" },
  { id: "cand6", name: "Ayesha Noor", title: "Receptionist", specialty: "Administration", city: "Karachi", area: "DHA Phase 5", exp: "2 yrs", pmdc: "", verified: false, about: "Front desk and appointment scheduling, fluent Urdu and English.", added: "5 days ago" },
];

const EMPTY_PRACTICE = { place: "", address: "", city: "", days: [], from: "", to: "", fee: "", type: "Clinic" };
const PRACTICE_TYPES = ["Clinic", "Hospital OPD", "Online only", "Home visit"];
const WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/* ---------- 01 PHYSICIAN PANEL ---------- */
function PhysicianPanelScreen({ onBack, onMenu, profile, onChange }) {
  const [view, setView] = useState("dash");
  const [editing, setEditing] = useState(null);
  const [idx, setIdx] = useState(-1);
  const C = "#B3202C";
  const practices = profile.practices || [];

  const setP = (k, v) => onChange({ ...profile, [k]: v });
  const setE = (k, v) => setEditing((p) => ({ ...p, [k]: v }));
  const toggleDay = (d) => setEditing((p) => ({ ...p, days: p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d] }));

  const save = () => {
    const next = idx >= 0 ? practices.map((p, i) => (i === idx ? editing : p)) : [...practices, editing];
    setP("practices", next);
    setEditing(null); setIdx(-1); setView("dash");
  };
  const remove = (i) => setP("practices", practices.filter((_, x) => x !== i));

  const valid = editing && editing.place && editing.city;

  if (view === "edit" && editing) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader title={idx >= 0 ? "Edit Practice" : "Add Practice"} onBack={() => { setEditing(null); setView("dash"); }} onMenu={onMenu} />
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          <PFCard>
            <PFLabel req color={C}>Place of practice</PFLabel>
            <input value={editing.place} onChange={(e) => setE("place", e.target.value)} placeholder="e.g. Aga Care Clinic" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
            <div className="mt-3"><PFLabel color={C}>Type</PFLabel>
              <PFPick options={PRACTICE_TYPES} value={editing.type} onPick={(v) => setE("type", v)} color={C} />
            </div>
          </PFCard>

          <PFCard>
            <PFLabel req color={C}>City</PFLabel>
            <PFPick options={CITIES} value={editing.city} onPick={(v) => setE("city", v)} color={C} />
            <div className="mt-3"><PFLabel color={C}>Address / road</PFLabel>
              <input value={editing.address} onChange={(e) => setE("address", e.target.value)} placeholder="Clinic address" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
            </div>
          </PFCard>

          <PFCard>
            <PFLabel color={C}>Days available</PFLabel>
            <PFPick options={WEEK} value={editing.days} onPick={toggleDay} multi color={C} />
            <div className="flex gap-2.5 mt-3">
              <div className="flex-1"><PFLabel color={C}>From</PFLabel>
                <input value={editing.from} onChange={(e) => setE("from", e.target.value)} placeholder="5:00 PM" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
              </div>
              <div className="flex-1"><PFLabel color={C}>To</PFLabel>
                <input value={editing.to} onChange={(e) => setE("to", e.target.value)} placeholder="9:00 PM" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
              </div>
            </div>
            <div className="mt-3"><PFLabel color={C}>Consultation fee (PKR)</PFLabel>
              <input value={editing.fee} onChange={(e) => setE("fee", e.target.value.replace(/[^0-9,]/g, ""))} placeholder="1,500" inputMode="numeric" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
            </div>
          </PFCard>

          <button onClick={save} disabled={!valid} className="w-full py-3.5 rounded-full font-semibold text-[14px] transition-opacity"
            style={{ backgroundColor: C, color: "white", opacity: valid ? 1 : 0.4 }}>
            {idx >= 0 ? "Save changes" : "Add practice"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Physician Panel" subtitle={profile.fullName || "Manage your practice"} onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">

        {/* directory status */}
        <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: profile.listOnDirectory ? GREEN_TINT : "#F1F3F9" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: profile.listOnDirectory ? "#FFFFFF" : "#E3E8F2" }}>
              <Stethoscope className="w-5 h-5" style={{ color: profile.listOnDirectory ? GREEN : SUBTLE }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold" style={{ color: profile.listOnDirectory ? GREEN : INK }}>
                {profile.listOnDirectory ? "Listed on the directory" : "Not listed yet"}
              </p>
              <p className="text-[12px] mt-0.5" style={{ color: profile.listOnDirectory ? "#2F6B45" : SUBTLE }}>
                {profile.listOnDirectory ? "Patients can find and book you" : "Turn on to appear in Consult a Doctor"}
              </p>
            </div>
            <button onClick={() => setP("listOnDirectory", !profile.listOnDirectory)}>
              <span className="w-12 h-7 rounded-full flex items-center px-0.5 transition-colors"
                style={{ backgroundColor: profile.listOnDirectory ? GREEN : "#D3D9EC", justifyContent: profile.listOnDirectory ? "flex-end" : "flex-start" }}>
                <span className="w-6 h-6 rounded-full bg-white block" />
              </span>
            </button>
          </div>
        </div>

        {/* how you appear */}
        <p className="text-[14px] font-bold mb-2" style={{ color: INK, letterSpacing: "-0.01em" }}>How patients see you</p>
        <div className="rounded-2xl bg-white p-3.5 mb-3" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
          <div className="flex items-start gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden flex items-center justify-center shrink-0" style={{ backgroundColor: C }}>
              {profile.photo ? <img src={profile.photo} alt="" className="w-full h-full object-cover" />
                : <span className="text-white font-bold text-[15px]">{(profile.fullName || "Dr").replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[15px] font-semibold" style={{ color: INK }}>{profile.fullName || "Your name"}</p>
              <p className="text-[12.5px]" style={{ color: C }}>{profile.specialty || "Speciality"}</p>
              <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}>
                {practices[0] ? `${practices[0].place}, ${practices[0].city}` : "Add a practice location"}
              </p>
              {practices[0] && practices[0].fee && (
                <p className="text-[13px] font-bold mt-1" style={{ color: INK }}>PKR {practices[0].fee} <span className="text-[11px] font-medium" style={{ color: SUBTLE }}>per visit</span></p>
              )}
            </div>
          </div>
        </div>

        {/* contact consent */}
        <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
          <PFLabel color={C}>Contact number</PFLabel>
          <input value={profile.phone || ""} onChange={(e) => setP("phone", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={PF_INPUT_CLS} style={PF_INPUT_STYLE} />
          <button onClick={() => setP("showContact", !profile.showContact)} className="w-full flex items-center gap-3 mt-3">
            <span className="w-12 h-7 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
              style={{ backgroundColor: profile.showContact ? GREEN : "#D3D9EC", justifyContent: profile.showContact ? "flex-end" : "flex-start" }}>
              <span className="w-6 h-6 rounded-full bg-white block" />
            </span>
            <span className="flex-1 text-left">
              <span className="block text-[13.5px] font-medium" style={{ color: INK }}>Show my number to patients</span>
              <span className="block text-[11.5px]" style={{ color: SUBTLE }}>
                {profile.showContact ? "Visible on your directory profile" : "Patients book through PakMed instead"}
              </span>
            </span>
          </button>
        </div>

        {/* practices */}
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Places of practice</p>
          <span className="text-[12px]" style={{ color: SUBTLE }}>{practices.length}</span>
        </div>

        <button onClick={() => { setEditing({ ...EMPTY_PRACTICE }); setIdx(-1); setView("edit"); }}
          className="w-full rounded-2xl p-3.5 flex items-center gap-3 mb-2.5 active:scale-[0.98] transition-transform" style={{ backgroundColor: C }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFFFF22" }}>
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14.5px] font-semibold text-white">Add a practice location</p>
            <p className="text-[12px] mt-0.5 text-white/70">Clinic, timings and fee</p>
          </div>
          <ChevronRight className="w-4 h-4 text-white/60" />
        </button>

        {practices.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <p className="text-[13.5px]" style={{ color: SUBTLE }}>No practice locations yet. Patients need these to find and book you.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {practices.map((pr, i) => (
              <div key={i} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                <div className="flex items-start gap-2.5">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: C, backgroundColor: RED_TINT }}>{pr.type}</span>
                    <p className="text-[14.5px] font-semibold mt-1.5" style={{ color: INK }}>{pr.place}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: SUBTLE }}><IconText icon={MapPin}>{[pr.address, pr.city].filter(Boolean).join(", ")}</IconText></p>
                    {pr.days.length > 0 && <p className="text-[12px] mt-0.5" style={{ color: SUBTLE }}><IconText icon={CalendarDays}>{pr.days.join(", ")}{pr.from ? ` · ${pr.from} – ${pr.to}` : ""}</IconText></p>}
                    {pr.fee && <p className="text-[13.5px] font-bold mt-1" style={{ color: INK }}>PKR {pr.fee}</p>}
                  </div>
                </div>
                <div className="flex gap-1.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                  <button onClick={() => { setEditing({ ...pr }); setIdx(i); setView("edit"); }} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: "#EFF2FA", color: INK }}>Edit</button>
                  <button onClick={() => remove(i)} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: RED_TINT, color: RED }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- 02 EMPLOYER PANEL ---------- */
function EmployerPanelScreen({ onBack, onMenu, profile, onChange, postedJobs, jobSocial, reports, onOpenJob, onNewJob, candidates, onContactCandidate, applicants, onOpenApplicants }) {
  const [tab, setTab] = useState("jobs");
  const C = TEAL;
  const galRef = useRef(null);

  const mine = postedJobs;
  const reportCount = (id) => reports.filter((r) => r.targetId === id).length;
  const appCount = (id) => (applicants || []).filter((a) => a.jobId === id).length;
  const newCount = (id) => (applicants || []).filter((a) => a.jobId === id && a.status === "new").length;
  const totals = mine.reduce((a, j) => {
    const s = jobSocial[j.id] || {};
    return {
      likes: a.likes + (s.likes || 0),
      comments: a.comments + ((s.comments || []).length),
      applicants: a.applicants + appCount(j.id),
      reports: a.reports + reportCount(j.id),
    };
  }, { likes: 0, comments: 0, applicants: 0, reports: 0 });

  const compress = (file, cb) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1200, sc = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * sc); cv.height = Math.round(img.height * sc);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cb(cv.toDataURL("image/jpeg", 0.72));
      };
      img.src = r.result;
    };
    r.readAsDataURL(file);
  };
  const addPhotos = (e) => {
    const files = Array.from(e.target.files || []); e.target.value = "";
    files.slice(0, 8 - (profile.photos || []).length).forEach((f) => {
      if (f.type.startsWith("image/")) compress(f, (d) => onChange((prev) => ({ ...prev, photos: [...(prev.photos || []), d] })));
    });
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Employer Panel" subtitle={profile.facilityName || "Manage your hiring"} onBack={onBack} onMenu={onMenu} />

      <div className="px-3 pb-2 shrink-0 flex gap-2">
        {[["jobs", "Posted jobs"], ["available", `Available (${candidates.length})`], ["institute", "Institute profile"]].map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
            style={{ backgroundColor: tab === k ? C : "white", color: tab === k ? "white" : INK, border: `1.5px solid ${tab === k ? C : CARD_BORDER}` }}>
            {l}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {tab === "jobs" && (
          <>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[["Posts", mine.length], ["Applied", totals.applicants], ["Likes", totals.likes], ["Reports", totals.reports]].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white p-2.5 text-center" style={{ border: `1px solid ${k === "Reports" && v > 0 ? RED + "55" : CARD_BORDER}` }}>
                  <p className="text-[17px] font-bold" style={{ color: k === "Reports" && v > 0 ? RED : C }}>{v}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: SUBTLE }}>{k}</p>
                </div>
              ))}
            </div>

            <button onClick={onNewJob} className="w-full rounded-2xl p-3.5 flex items-center gap-3 mb-3 active:scale-[0.98] transition-transform" style={{ backgroundColor: C }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFFFF22" }}>
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[14.5px] font-semibold text-white">Post a new job</p>
                <p className="text-[12px] mt-0.5 text-white/70">Takes about 2 minutes</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>

            {mine.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
                <p className="text-[13.5px]" style={{ color: SUBTLE }}>No jobs posted yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {mine.map((j) => {
                  const s = jobSocial[j.id] || { likes: 0, comments: [] };
                  const rc = reportCount(j.id);
                  return (
                    <button key={j.id} onClick={() => onOpenJob(j)} className="rounded-2xl bg-white p-3 text-left active:scale-[0.99] transition-transform" style={{ border: `1px solid ${rc > 0 ? RED + "55" : CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                      <div className="flex gap-3">
                        <div className="shrink-0 rounded-xl overflow-hidden relative" style={{ width: 60, height: 75, border: `1px solid ${CARD_BORDER}` }}>
                          {j.photos && j.photos.length > 0 ? (
                            <img src={j.photos[j.coverIndex] || j.photos[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div style={{ transform: "scale(0.216)", transformOrigin: "top left", width: 277, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
                              <JobPostCard job={j} tpl={CARD_TEMPLATES.find((t) => t.id === j.templateId) || CARD_TEMPLATES[0]} scale={1} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                              style={{ color: j.status === "posted" ? GREEN : SUBTLE, backgroundColor: j.status === "posted" ? GREEN_TINT : "#EFF2FA" }}>
                              {j.status === "posted" ? "Live" : "Saved"}
                            </span>
                            {rc > 0 && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: RED, backgroundColor: RED_TINT }}>{rc} report{rc > 1 ? "s" : ""}</span>}
                          </div>
                          <p className="text-[14.5px] font-semibold leading-snug truncate" style={{ color: INK }}>{j.jobTitle}</p>
                          <p className="text-[13px] font-bold mt-0.5" style={{ color: C }}>PKR {j.payAmount} <span className="text-[10.5px] font-medium" style={{ color: SUBTLE }}>{j.payUnitLabel}</span></p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="flex items-center gap-1 text-[11.5px]" style={{ color: SUBTLE }}><Heart className="w-3.5 h-3.5" /> {s.likes || 0}</span>
                            <span className="flex items-center gap-1 text-[11.5px]" style={{ color: SUBTLE }}><MessageCircle className="w-3.5 h-3.5" /> {(s.comments || []).length}</span>
                            <span className="flex items-center gap-1 text-[11.5px]" style={{ color: SUBTLE }}><UserRound className="w-3.5 h-3.5" /> {appCount(j.id)}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: SUBTLE }} />
                      </div>
                      <div
                        onClick={(e) => { e.stopPropagation(); onOpenApplicants(j); }}
                        className="mt-2.5 pt-2.5 flex items-center justify-between active:opacity-70"
                        style={{ borderTop: `1px solid ${CARD_BORDER}` }}
                      >
                        <span className="text-[12.5px] font-semibold" style={{ color: C }}>
                          {appCount(j.id) === 0 ? "No applicants yet" : `View ${appCount(j.id)} applicant${appCount(j.id) > 1 ? "s" : ""}`}
                        </span>
                        {newCount(j.id) > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: "white", backgroundColor: C }}>{newCount(j.id)} new</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "available" && (
          <>
            <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: AMBER_TINT }}>
              <p className="text-[12.5px] font-bold mb-1" style={{ color: AMBER }}>About this list</p>
              <p className="text-[12.5px] leading-relaxed" style={{ color: "#6B4B22" }}>
                These are people who have made their CV public. It is not everyone looking for work —
                <strong> for the widest pool of candidates, post your job.</strong>
              </p>
              <button onClick={onNewJob} className="w-full mt-2.5 py-2.5 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: AMBER, color: "white" }}>
                Post a job
              </button>
            </div>

            {candidates.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <UserRound className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
                <p className="text-[13.5px]" style={{ color: SUBTLE }}>Nobody has made their CV public yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {candidates.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[14px]" style={{ backgroundColor: C }}>
                        {c.name.replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[15px] font-semibold truncate" style={{ color: INK }}>{c.name}</p>
                          {c.verified && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: GREEN }} />}
                        </div>
                        <p className="text-[12.5px]" style={{ color: C }}>{c.title}{c.specialty ? ` · ${c.specialty}` : ""}</p>
                        <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}><IconText icon={MapPin}>{[c.area, c.city].filter(Boolean).join(", ")} · {c.exp}</IconText></p>
                        {c.pmdc && <p className="text-[11.5px] mt-0.5" style={{ color: SUBTLE }}>Reg: {c.pmdc}</p>}
                      </div>
                    </div>
                    {c.about && <p className="text-[12.5px] mt-2.5 leading-snug" style={{ color: "#4B4A45" }}>{c.about}</p>}
                    <div className="flex items-center gap-1.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                      <span className="text-[11px] flex-1" style={{ color: SUBTLE }}>Available since {c.added}</span>
                      <button onClick={() => onContactCandidate(c)} className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold flex items-center gap-1.5" style={{ backgroundColor: C, color: "white" }}>
                        <MessageSquareText className="w-3.5 h-3.5" /> Contact
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[11.5px] mt-3 leading-snug px-1" style={{ color: SUBTLE }}>
              Contact details stay private until the candidate replies to your message.
            </p>
          </>
        )}

        {tab === "institute" && (
          <>
            <input ref={galRef} type="file" accept="image/*" multiple className="hidden" onChange={addPhotos} />

            <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <div className="flex items-center gap-3.5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: TEAL_TINT }}>
                  {profile.logo ? <img src={profile.logo} alt="" className="w-full h-full object-cover" /> : <Briefcase className="w-6 h-6" style={{ color: C }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold truncate" style={{ color: INK }}>{profile.facilityName || "Your facility"}</p>
                  <p className="text-[12.5px]" style={{ color: C }}>{profile.facilityType}</p>
                  <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}><IconText icon={MapPin}>{[profile.area, profile.city].filter(Boolean).join(", ")}</IconText></p>
                </div>
              </div>
              {profile.about && <p className="text-[13px] mt-3 leading-relaxed" style={{ color: "#4B4A45" }}>{profile.about}</p>}
            </div>

            <div className="rounded-2xl bg-white p-4 mb-3" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <PFLabel color={C}>Services offered</PFLabel>
              <input
                value={profile.services || ""}
                onChange={(e) => onChange({ ...profile, services: e.target.value })}
                placeholder="e.g. Emergency, OPD, Surgery, Radiology"
                className={PF_INPUT_CLS} style={PF_INPUT_STYLE}
              />
              <p className="text-[11.5px] mt-1.5" style={{ color: SUBTLE }}>Separate with commas. Shown on your public profile.</p>
            </div>

            <div className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <div className="flex items-center justify-between mb-2">
                <PFLabel color={C}>Photos</PFLabel>
                <span className="text-[11.5px]" style={{ color: SUBTLE }}>{(profile.photos || []).length} / 8</span>
              </div>
              <button onClick={() => galRef.current?.click()} className="w-full rounded-xl py-3 flex items-center justify-center gap-2 mb-2.5" style={{ backgroundColor: TEAL_TINT }}>
                <Camera className="w-5 h-5" style={{ color: C }} />
                <span className="text-[13px] font-semibold" style={{ color: C }}>Add photos</span>
              </button>
              {(profile.photos || []).length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {profile.photos.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1/1" }}>
                      <img src={src} alt="" className="w-full h-full object-cover" />
                      <button onClick={() => onChange({ ...profile, photos: profile.photos.filter((_, x) => x !== i) })}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,.55)" }}>
                        <X className="w-3 h-3 text-white" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   APPLICANTS — employer's view of who applied
   ========================================================= */
const APP_STATUS = {
  new:         { label: "New",         color: NAVY,  tint: NAVY_TINT },
  viewed:      { label: "Viewed",      color: SUBTLE, tint: "#EFF2FA" },
  shortlisted: { label: "Shortlisted", color: GREEN, tint: GREEN_TINT },
  rejected:    { label: "Rejected",    color: RED,   tint: RED_TINT },
};

const SEED_APPLICANTS = [
  { id: "ap1", jobId: "sj1", name: "Dr. Hassan Raza", title: "Medical Officer", city: "Karachi", area: "Gulshan-e-Iqbal", exp: "4 yrs", pmdc: "PMC-33120-K", verified: true, status: "new", at: "2 hours ago", note: "Emergency MO with ER and ICU rotations. Available for night shifts.", cvText: true },
  { id: "ap2", jobId: "sj1", name: "Dr. Fatima Noor", title: "Medical Officer", city: "Karachi", area: "Clifton", exp: "2 yrs", pmdc: "PMC-47881-K", verified: true, status: "new", at: "5 hours ago", note: "House job completed at Civil Hospital. Keen on emergency medicine.", cvText: true },
  { id: "ap3", jobId: "sj1", name: "Dr. Imran Shah", title: "Medical Officer", city: "Karachi", area: "Malir", exp: "6 yrs", pmdc: "PMC-20114-K", verified: false, status: "shortlisted", at: "Yesterday", note: "Six years across ER and general medicine. Own transport.", cvText: true },
  { id: "ap4", jobId: "sj3", name: "Sana Iqbal", title: "Staff Nurse", city: "Islamabad", area: "G-9", exp: "6 yrs", pmdc: "PNC-88231", verified: true, status: "new", at: "1 day ago", note: "Surgical ward and post-op care.", cvText: true },
  { id: "ap5", jobId: "sj1", name: "Dr. Adeel Tariq", title: "Medical Officer", city: "Hyderabad", area: "Latifabad", exp: "1 yr", pmdc: "", verified: false, status: "rejected", at: "2 days ago", note: "Recently completed house job.", cvText: false },
];

function ApplicantsScreen({ job, applicants, onBack, onMenu, onSetStatus, onMessage, onViewCV, onReport, reportedIds }) {
  const [tab, setTab] = useState("all");
  const mine = applicants.filter((a) => a.jobId === job.id);

  const counts = {
    all: mine.length,
    new: mine.filter((a) => a.status === "new").length,
    shortlisted: mine.filter((a) => a.status === "shortlisted").length,
    rejected: mine.filter((a) => a.status === "rejected").length,
  };
  const shown = tab === "all" ? mine : mine.filter((a) => a.status === tab);

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Applicants" subtitle={job.jobTitle} onBack={onBack} onMenu={onMenu} />

      <div className="px-3 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[["all", `All (${counts.all})`], ["new", `New (${counts.new})`], ["shortlisted", `Shortlisted (${counts.shortlisted})`], ["rejected", `Rejected (${counts.rejected})`]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)}
              className="shrink-0 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
              style={{ backgroundColor: tab === k ? TEAL : "white", color: tab === k ? "white" : INK, border: `1.5px solid ${tab === k ? TEAL : CARD_BORDER}` }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {mine.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center mt-1" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
            <UserRound className="w-9 h-9 mx-auto mb-2" style={{ color: SUBTLE }} />
            <p className="text-[14px] font-semibold" style={{ color: INK }}>No applicants yet</p>
            <p className="text-[12.5px] mt-1 leading-snug" style={{ color: SUBTLE }}>
              Share your job card on WhatsApp to reach more people, or browse the Available list.
            </p>
          </div>
        ) : shown.length === 0 ? (
          <p className="text-[13px] text-center py-8" style={{ color: SUBTLE }}>Nobody in this list yet.</p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {shown.map((a) => {
              const st = APP_STATUS[a.status];
              return (
                <div key={a.id} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[14px]" style={{ backgroundColor: TEAL }}>
                      {a.name.replace(/^Dr\.?\s*/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: st.color, backgroundColor: st.tint }}>{st.label}</span>
                        {a.verified
                          ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>Verified</span>
                          : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: AMBER, backgroundColor: AMBER_TINT }}>Unverified</span>}
                      </div>
                      <p className="text-[15px] font-semibold truncate" style={{ color: INK }}>{a.name}</p>
                      <p className="text-[12.5px]" style={{ color: TEAL }}>{a.title} · {a.exp}</p>
                      <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}><IconText icon={MapPin}>{[a.area, a.city].filter(Boolean).join(", ")}</IconText></p>
                      {a.pmdc && <p className="text-[11.5px] mt-0.5" style={{ color: SUBTLE }}>Reg: {a.pmdc}</p>}
                    </div>
                    <ReportButton
                      reported={reportedIds.has(a.id)}
                      onClick={() => onReport({ id: a.id, type: "cv", title: a.name, subtitle: `${a.title} · ${a.city}` })}
                    />
                  </div>

                  {a.note && <p className="text-[12.5px] mt-2.5 leading-snug" style={{ color: "#4B4A45" }}>{a.note}</p>}
                  <p className="text-[11px] mt-1.5" style={{ color: SUBTLE }}>Applied {a.at}</p>

                  <div className="flex gap-1.5 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                    <button
                      onClick={() => { onSetStatus(a.id, a.status === "new" ? "viewed" : a.status); onViewCV(a); }}
                      className="flex-1 py-2 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                      style={{ backgroundColor: NAVY_TINT, color: NAVY }}
                    >
                      <FileText className="w-3.5 h-3.5" /> View CV
                    </button>
                    <button onClick={() => onMessage(a)} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5" style={{ backgroundColor: "#EFF2FA", color: INK }}>
                      <MessageSquareText className="w-3.5 h-3.5" /> Message
                    </button>
                  </div>

                  <div className="flex gap-1.5 mt-1.5">
                    <button
                      onClick={() => onSetStatus(a.id, a.status === "shortlisted" ? "viewed" : "shortlisted")}
                      className="flex-1 py-2 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: a.status === "shortlisted" ? GREEN : GREEN_TINT, color: a.status === "shortlisted" ? "white" : GREEN }}
                    >
                      {a.status === "shortlisted" ? "✓ Shortlisted" : "Shortlist"}
                    </button>
                    <button
                      onClick={() => onSetStatus(a.id, a.status === "rejected" ? "viewed" : "rejected")}
                      className="flex-1 py-2 rounded-full text-[12px] font-semibold"
                      style={{ backgroundColor: a.status === "rejected" ? RED : RED_TINT, color: a.status === "rejected" ? "white" : RED }}
                    >
                      {a.status === "rejected" ? "✕ Rejected" : "Reject"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <p className="text-[11.5px] mt-4 leading-snug px-1" style={{ color: SUBTLE }}>
          Applicants only see whether you shortlisted them. Rejections are shown as "not selected" without a reason.
        </p>
      </div>
    </div>
  );
}

/* ---------- read-only CV viewer for employers ---------- */
function ApplicantCVSheet({ applicant, cvDoc, onClose }) {
  const tpl = CV_TEMPLATES.find((t) => t.id === (cvDoc ? cvDoc.tplId : "t1")) || CV_TEMPLATES[0];
  const useOwn = applicant.id === "me" && cvDoc && cvDoc.savedInApp;
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ height: "88%" }}>
        <div className="flex justify-center pt-2.5 pb-1 shrink-0"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>
        <div className="flex items-center justify-between px-5 pb-3 border-b shrink-0" style={{ borderColor: CARD_BORDER }}>
          <span className="w-8" />
          <p className="font-bold text-[15px]" style={{ color: INK }}>{applicant.name}</p>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>
        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4">
          {useOwn ? (
            <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <CVDocument cv={cvDoc.cv} tpl={tpl} scale={1} />
            </div>
          ) : applicant.cvText ? (
            <div className="rounded-xl p-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[19px] font-bold" style={{ color: INK }}>{applicant.name}</p>
              <p className="text-[13px] mt-0.5" style={{ color: TEAL }}>{applicant.title}</p>
              <p className="text-[12.5px] mt-1" style={{ color: SUBTLE }}>
                {[applicant.area, applicant.city].filter(Boolean).join(", ")}{applicant.pmdc ? ` · ${applicant.pmdc}` : ""}
              </p>
              <div className="h-px my-3" style={{ backgroundColor: CARD_BORDER }} />
              <p className="text-[13px] font-semibold mb-1" style={{ color: INK_2 }}>About</p>
              <p className="text-[13px] leading-relaxed mb-3" style={{ color: "#4B4A45" }}>{applicant.note}</p>
              <p className="text-[13px] font-semibold mb-1" style={{ color: INK_2 }}>Experience</p>
              <p className="text-[13px] mb-3" style={{ color: "#4B4A45" }}>{applicant.exp} in clinical practice</p>
              <p className="text-[13px] font-semibold mb-1" style={{ color: INK_2 }}>Verification</p>
              <p className="text-[13px]" style={{ color: applicant.verified ? GREEN : AMBER }}>
                {applicant.verified ? "Documents checked by PakMed" : "Not yet verified — ask for documents directly"}
              </p>
            </div>
          ) : (
            <div className="rounded-xl p-6 text-center" style={{ border: `1px dashed ${CARD_BORDER}` }}>
              <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
              <p className="text-[13.5px]" style={{ color: SUBTLE }}>This applicant hasn't attached a CV. You can message them to ask for one.</p>
            </div>
          )}
          <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: AMBER_TINT }}>
            <p className="text-[12px] leading-snug" style={{ color: "#6B4B22" }}>
              PakMed does not guarantee credentials. Always verify documents directly before hiring.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ONBOARDING INTENT + JUST-IN-TIME PROFILE DETAILS
   ========================================================= */
const JOB_SEEKER_CATEGORIES = [
  { key: "doctors",  label: "Doctors & Physicians",      sub: "MBBS, FCPS, consultants, medical officers" },
  { key: "nursing",  label: "Nursing & Midwifery",       sub: "Staff nurses, LHVs, midwives, ward incharge" },
  { key: "allied",   label: "Allied Health Professionals", sub: "Physiotherapy, OT assistants, technicians" },
  { key: "pharmacy", label: "Pharmacy",                  sub: "Pharmacists, dispensers, store staff" },
  { key: "lab",      label: "Laboratory & Diagnostics",  sub: "Lab technologists, radiographers, phlebotomists" },
];

const EMPLOYER_CATEGORIES = [
  { key: "medical",  label: "Medical",                    sub: "Doctors, consultants, medical officers" },
  { key: "nursing",  label: "Nursing & Patient Care",     sub: "Nurses, attendants, ward staff" },
  { key: "allied",   label: "Allied Health & Diagnostics", sub: "Technicians, radiographers, physiotherapists" },
  { key: "pharmacy", label: "Pharmacy",                   sub: "Pharmacists and dispensing staff" },
  { key: "admin",    label: "Administration & Support",   sub: "Reception, records, management, support" },
];

const INTENTS = [
  {
    key: "look", profile: null, icon: Newspaper, color: NAVY, tint: NAVY_TINT,
    title: "Visitor",
    sub: "News, doctors around, jobs, market and beyond.",
  },
  {
    key: "find", profile: "doctor", icon: Search, color: TEAL, tint: TEAL_TINT,
    title: "Looking for a Job",
    sub: "Find permanent, locum and part-time roles at verified facilities near you.",
    categories: JOB_SEEKER_CATEGORIES,
    catTitle: "What kind of work?",
  },
  {
    key: "hire", profile: "employer", icon: Briefcase, color: "#B3202C", tint: RED_TINT,
    title: "Looking to Hire",
    sub: "Post a vacancy and reach qualified healthcare staff across Pakistan.",
    categories: EMPLOYER_CATEGORIES,
    catTitle: "Who are you hiring?",
  },
  {
    key: "sell", profile: "seller", icon: Store, color: VIOLET, tint: VIOLET_TINT,
    title: "Healthcare Market",
    sub: "A reliable place to buy or sell biomedical products, services, new and used equipment and supplies.",
  },
];

function IntentScreen({ onChoose, name }) {
  const [step, setStep] = useState(null);   // an intent with categories

  if (step) {
    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="px-4 pt-5 pb-3 shrink-0 flex items-center gap-3">
          <button onClick={() => setStep(null)} className="w-9 h-9 rounded-full flex items-center justify-center bg-white shrink-0" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <ChevronLeft className="w-5 h-5" style={{ color: INK }} />
          </button>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold" style={{ color: step.color }}>{step.title}</p>
            <p className="font-bold text-[19px] leading-tight" style={{ color: INK }}>{step.catTitle}</p>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
          <div className="flex flex-col gap-2">
            {step.categories.map((c) => (
              <button
                key={c.key}
                onClick={() => onChoose(step, c)}
                className="w-full rounded-2xl bg-white px-4 py-3.5 flex items-center gap-3 text-left active:scale-[0.98] transition-transform"
                style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
              >
                <span className="w-1.5 h-9 rounded-full shrink-0" style={{ backgroundColor: step.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold" style={{ color: INK }}>{c.label}</p>
                  <p className="text-[12px] mt-0.5 leading-snug" style={{ color: SUBTLE }}>{c.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
              </button>
            ))}
          </div>
          <button onClick={() => onChoose(step, null)} className="w-full mt-3 py-3 rounded-full text-[13px] font-semibold" style={{ backgroundColor: "#EFF2FA", color: SUBTLE }}>
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-5 pt-8 pb-5 shrink-0">
        <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Welcome{name ? `, ${name.split(" ")[0]}` : ""}</p>
        <p className="font-bold text-[26px] leading-tight mt-1" style={{ color: INK }}>What brings you<br />to PakMed?</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
        <div className="flex flex-col gap-3">
          {INTENTS.map((it) => (
            <button
              key={it.key}
              onClick={() => (it.categories ? setStep(it) : onChoose(it, null))}
              className="w-full rounded-3xl overflow-hidden text-left active:scale-[0.98] transition-transform"
              style={{ backgroundColor: "white", border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
            >
              <div className="flex items-stretch">
                <span className="w-1.5 shrink-0" style={{ backgroundColor: it.color }} />
                <div className="flex-1 min-w-0 p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: it.tint }}>
                    <it.icon className="w-6 h-6" style={{ color: it.color }} strokeWidth={1.9} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold leading-tight" style={{ color: INK }}>{it.title}</p>
                    <p className="text-[12.5px] mt-1 leading-snug" style={{ color: SUBTLE }}>{it.sub}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />
                </div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-[11.5px] text-center mt-5 leading-snug px-2" style={{ color: SUBTLE }}>
          News, the doctor directory, the CV builder and the job card maker stay free for everyone.
        </p>
      </div>
    </div>
  );
}

/* ---- the "one more step" sheet: only the fields still missing ---- */
const QUICK_HINT_MAP = {
  general:  { fullName: "fullName", jobTitle: "jobTitle", city: "city", phone: "phone" },
  doctor:   { fullName: "fullName", pmdc: "pmdc", specialty: "specialty", city: "city" },
  employer: { facilityName: "facilityName", facilityType: "facilityType", city: "facilityCity", address: "businessAddr", contactPerson: "fullName", phone: "phone" },
  seller:   { business: "businessName", type: "businessType", city: "businessCity", address: "businessAddr", phone: "phone" },
};

const QUICK_FIELDS = {
  general: [
    { k: "fullName", label: "Your full name", ph: "Full name" },
    { k: "jobTitle", label: "Your job title", ph: "e.g. Medical Officer", options: () => JOB_TITLES.filter((t) => t !== "Other") },
    { k: "city", label: "Your city", ph: "City", options: () => CITIES },
    { k: "phone", label: "WhatsApp number", ph: "03XX XXXXXXX", tel: true },
  ],
  doctor: [
    { k: "fullName", label: "Your full name", ph: "Dr. Full Name" },
    { k: "pmdc", label: "PMDC number", ph: "PMC-00000-X" },
    { k: "specialty", label: "Speciality", ph: "Speciality", options: () => DOCTOR_SPECIALTIES },
    { k: "city", label: "Your city", ph: "City", options: () => CITIES },
  ],
  employer: [
    { k: "facilityName", label: "Facility name", ph: "e.g. Aga Care Hospital" },
    { k: "facilityType", label: "Facility type", ph: "Type", options: () => FACILITY_TYPES.map((f) => f.label) },
    { k: "city", label: "City", ph: "City", options: () => CITIES },
    { k: "address", label: "Address", ph: "Road, area, landmark" },
    { k: "contactPerson", label: "Contact person", ph: "Name or department" },
    { k: "phone", label: "Contact number", ph: "03XX XXXXXXX", tel: true },
  ],
  seller: [
    { k: "business", label: "Business name", ph: "e.g. Al-Noor Surgical" },
    { k: "type", label: "Business type", ph: "Type", options: () => SELLER_TYPES },
    { k: "city", label: "City", ph: "City", options: () => CITIES },
    { k: "address", label: "Address", ph: "Shop, plaza, landmark" },
    { k: "phone", label: "Contact number", ph: "03XX XXXXXXX", tel: true },
  ],
};

function QuickDetailsSheet({ type, profile, onChange, onClose, onDone, actionLabel, known = {}, seed = {} }) {
  const meta = PROFILE_META[type];
  const fields = QUICK_FIELDS[type] || [];
  const missing = fields.filter((f) => !fieldFilled(profile[f.k]) && !fieldFilled(seed[f.k]));
  const [local, setLocal] = useState(() => Object.fromEntries(fields.map((f) => [f.k, profile[f.k] || seed[f.k] || ""])));

  const merged = { ...profile, ...local };
  const pct = profileCompletion(type, merged);
  const ready = missing.every((f) => String(local[f.k] || "").trim());

  const finish = () => {
    onChange(merged);
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "88vh" }}>
        <div className="flex justify-center pt-2.5 pb-1 shrink-0"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>

        <div className="px-5 pb-3 border-b shrink-0" style={{ borderColor: CARD_BORDER }}>
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <p className="text-[13px] font-semibold" style={{ color: meta.color }}>One more step</p>
              <p className="font-bold text-[17px] leading-tight mt-0.5" style={{ color: INK }}>Quick details about you</p>
            </div>
            <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
          </div>
          <p className="text-[12.5px] mt-1.5 leading-snug" style={{ color: SUBTLE }}>
            {missing.length === 0
              ? "Everything's already filled — just confirm to continue."
              : `${missing.length} quick ${missing.length === 1 ? "answer" : "answers"} and you're done. This is what ${actionLabel} needs.`}
          </p>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
          {fields.map((f) => {
            const already = fieldFilled(profile[f.k]);
            return (
              <div key={f.k} className="mb-3.5">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>{f.label}</p>
                  {already && <Check className="w-3.5 h-3.5" strokeWidth={3} style={{ color: GREEN }} />}
                </div>
                {f.options ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {f.options().slice(0, 10).map((o) => (
                        <button key={o} onClick={() => setLocal((p) => ({ ...p, [f.k]: o }))}
                          className="text-[12.5px] font-semibold px-3 py-2 rounded-full transition-colors"
                          style={{
                            backgroundColor: local[f.k] === o ? meta.color : "white",
                            color: local[f.k] === o ? "white" : INK,
                            border: `1.5px solid ${local[f.k] === o ? meta.color : CARD_BORDER}`,
                          }}>
                          {o}
                        </button>
                      ))}
                    </div>
                    <input
                      value={f.options().includes(local[f.k]) ? "" : (local[f.k] || "")}
                      onChange={(e) => setLocal((p) => ({ ...p, [f.k]: e.target.value }))}
                      placeholder="Or type your own"
                      className="w-full mt-2 text-[14px] rounded-xl px-3.5 py-2.5 outline-none"
                      style={PF_INPUT_STYLE}
                    />
                  </>
                ) : (
                  <>
                    <input
                      value={local[f.k] || ""}
                      onChange={(e) => setLocal((p) => ({ ...p, [f.k]: e.target.value }))}
                      placeholder={f.ph}
                      inputMode={f.tel ? "tel" : "text"}
                      className={PF_INPUT_CLS}
                      style={PF_INPUT_STYLE}
                    />
                    <AutoFill
                      hint={known[QUICK_HINT_MAP[type] && QUICK_HINT_MAP[type][f.k]]}
                      current={local[f.k]}
                      onUse={(v) => setLocal((p) => ({ ...p, [f.k]: v }))}
                    />
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: CARD_BORDER }}>
          <div className="flex items-center gap-2.5 mb-2.5">
            <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#E3E8F2" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
            </div>
            <span className="text-[12px] font-bold shrink-0" style={{ color: meta.color }}>{pct}%</span>
          </div>
          <button
            onClick={finish}
            disabled={!ready || pct < GATE_THRESHOLD}
            className="w-full py-3.5 rounded-full font-semibold text-[14.5px] transition-opacity"
            style={{ backgroundColor: meta.color, color: "white", opacity: ready && pct >= GATE_THRESHOLD ? 1 : 0.4 }}
          >
            {pct < GATE_THRESHOLD && ready ? `Add a little more (${GATE_THRESHOLD - pct}% to go)` : `Save & ${actionLabel}`}
          </button>
          <p className="text-[11px] text-center mt-2" style={{ color: SUBTLE }}>
            Saved to your {meta.label}. You can edit it any time.
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   FIND A HOSPITAL — public directory, auto-filled from Employer profiles at 70%
   ========================================================= */
const SEED_FACILITIES = [
  { id: "f1", name: "Allied Hospital", type: "Hospital", city: "Faisalabad", area: "Jail Road", address: "Jail Road, near Govt College", phone: "041 9210080", services: ["Emergency", "OPD", "Surgery", "Radiology", "ICU"], hours: "24 hours", verified: true, hiring: 4, rating: 4.4, reviews: 512 },
  { id: "f2", name: "Noor Diagnostic Centre", type: "Diagnostic Lab", city: "Faisalabad", area: "Susan Road", address: "Plaza 12, Susan Road", phone: "0321 6639900", services: ["Blood tests", "Ultrasound", "X-Ray"], hours: "8 am – 10 pm", verified: true, hiring: 1, rating: 4.6, reviews: 188 },
  { id: "f3", name: "City Heart Clinic", type: "Clinic", city: "Lahore", area: "Jail Road", address: "45-B Jail Road", phone: "042 3577 1100", services: ["Cardiology", "ECG", "Echo"], hours: "Mon – Sat, 9 am – 9 pm", verified: true, hiring: 2, rating: 4.8, reviews: 402 },
  { id: "f4", name: "Aga Care Hospital", type: "Hospital", city: "Karachi", area: "Gulshan-e-Iqbal", address: "Block 13-D, Gulshan-e-Iqbal", phone: "021 3480 2200", services: ["Emergency", "Maternity", "Paediatrics", "OPD"], hours: "24 hours", verified: true, hiring: 3, rating: 4.5, reviews: 731 },
  { id: "f5", name: "Al-Shifa Pharmacy", type: "Pharmacy", city: "Faisalabad", area: "D Ground", address: "Shop 3, D Ground", phone: "0300 1234567", services: ["Medicines", "Home delivery"], hours: "24 hours", verified: false, hiring: 0, rating: 4.2, reviews: 64 },
  { id: "f6", name: "Shifa Wellness", type: "Hospital", city: "Islamabad", area: "Blue Area", address: "Jinnah Avenue, Blue Area", phone: "051 2874400", services: ["OPD", "Surgery", "Physiotherapy"], hours: "8 am – 11 pm", verified: true, hiring: 1, rating: 4.6, reviews: 297 },
  { id: "f7", name: "Bright Smile Dental", type: "Clinic", city: "Multan", area: "Bosan Road", address: "Bosan Road, near Chungi 9", phone: "", services: ["Dentistry", "Orthodontics"], hours: "Mon – Sat, 4 – 10 pm", verified: false, hiring: 0, rating: 4.3, reviews: 52 },
  { id: "f8", name: "Margalla Medical Centre", type: "Hospital", city: "Islamabad", area: "F-8 Markaz", address: "F-8 Markaz, Islamabad", phone: "", services: ["Emergency", "OPD", "Surgery", "Radiology", "ICU", "Maternity"], hours: "24 hours", verified: true, rating: 4.7, reviews: 618 },
  { id: "f9", name: "Seaview Medical Centre", type: "Hospital", city: "Karachi", area: "Clifton Block 5", address: "Block 5, Clifton", phone: "", services: ["Emergency", "OPD", "Cardiology", "ICU"], hours: "24 hours", verified: true, rating: 4.6, reviews: 455 },
  { id: "f10", name: "Johar Town Medical Complex", type: "Hospital", city: "Lahore", area: "Johar Town", address: "Main Boulevard, Johar Town", phone: "", services: ["Emergency", "OPD", "Surgery", "Paediatrics"], hours: "24 hours", verified: true, rating: 4.5, reviews: 389 },
  { id: "f11", name: "Capital Diagnostics", type: "Diagnostic Lab", city: "Islamabad", area: "G-9 Markaz", address: "G-9 Markaz, Islamabad", phone: "", services: ["Blood tests", "X-Ray", "CT Scan", "MRI"], hours: "7 am – 11 pm", verified: true, rating: 4.7, reviews: 266 },
  { id: "f12", name: "Saddar Family Pharmacy", type: "Pharmacy", city: "Karachi", area: "Saddar", address: "Abdullah Haroon Road, Saddar", phone: "", services: ["Medicines", "Home delivery", "BP check"], hours: "24 hours", verified: true, rating: 4.4, reviews: 141 },
  { id: "f13", name: "Khyber Valley Hospital", type: "Hospital", city: "Peshawar", area: "Hayatabad Phase 3", address: "Phase 3, Hayatabad", phone: "", services: ["Emergency", "OPD", "Surgery", "Orthopaedics"], hours: "24 hours", verified: true, rating: 4.5, reviews: 322 },
  { id: "f14", name: "Bolan Care Hospital", type: "Hospital", city: "Quetta", area: "Jinnah Road", address: "Jinnah Road, Quetta", phone: "", services: ["Emergency", "OPD", "Maternity"], hours: "24 hours", verified: true, rating: 4.3, reviews: 174 },
  { id: "f15", name: "Latifabad Medical Centre", type: "Hospital", city: "Hyderabad", area: "Latifabad Unit 7", address: "Unit 7, Latifabad", phone: "", services: ["Emergency", "OPD", "Paediatrics"], hours: "24 hours", verified: false, rating: 4.1, reviews: 98 },
  { id: "f16", name: "Multan Kidney Centre", type: "Hospital", city: "Multan", area: "Bosan Road", address: "Bosan Road, Multan", phone: "", services: ["Nephrology", "Dialysis", "OPD"], hours: "8 am – 10 pm", verified: true, rating: 4.7, reviews: 213 },
  { id: "f17", name: "Hayatabad Medical Lab", type: "Diagnostic Lab", city: "Peshawar", area: "Hayatabad Phase 5", address: "Phase 5, Hayatabad", phone: "", services: ["Blood tests", "Ultrasound"], hours: "24 hours", verified: true, rating: 4.4, reviews: 120 },
  { id: "f18", name: "Gulberg Heart & Vascular", type: "Hospital", city: "Lahore", area: "Gulberg III", address: "Main Boulevard, Gulberg III", phone: "", services: ["Cardiology", "ECG", "Echo", "ICU"], hours: "24 hours", verified: true, rating: 4.8, reviews: 344 },
  { id: "f19", name: "Model Town Dental Studio", type: "Clinic", city: "Lahore", area: "Model Town", address: "Block J, Model Town", phone: "", services: ["Dentistry", "Orthodontics", "Implants"], hours: "Mon – Sat, 2 – 10 pm", verified: true, rating: 4.7, reviews: 158 },
  { id: "f20", name: "Sialkot Eye Clinic", type: "Clinic", city: "Sialkot", area: "Paris Road", address: "Paris Road, Sialkot", phone: "", services: ["Ophthalmology", "Cataract surgery"], hours: "Mon – Sat, 10 am – 8 pm", verified: true, rating: 4.6, reviews: 87 },
  { id: "f21", name: "Satellite Town Pharmacy", type: "Pharmacy", city: "Rawalpindi", area: "Satellite Town", address: "Commercial Market, Satellite Town", phone: "", services: ["Medicines", "Home delivery"], hours: "8 am – 2 am", verified: false, rating: 4.2, reviews: 73 },
  { id: "f22", name: "Lyallpur General Hospital", type: "Hospital", city: "Faisalabad", area: "Peoples Colony", address: "Peoples Colony No. 1", phone: "", services: ["Emergency", "OPD", "Surgery", "Radiology"], hours: "24 hours", verified: true, rating: 4.4, reviews: 266 },
  { id: "f23", name: "Cholistan Health Centre", type: "Hospital", city: "Bahawalpur", area: "Model Town A", address: "Model Town A, Bahawalpur", phone: "", services: ["OPD", "Maternity", "Blood tests"], hours: "8 am – 8 pm", verified: true, rating: 4.3, reviews: 91 },
  { id: "f24", name: "Korangi Community Hospital", type: "Hospital", city: "Karachi", area: "Korangi Industrial Area", address: "Sector 23, Korangi", phone: "", services: ["Emergency", "OPD", "Maternity"], hours: "24 hours", verified: true, rating: 4.2, reviews: 204 },
];

const FACILITY_KINDS = ["All", "Hospital", "Clinic", "Diagnostic Lab", "Pharmacy"];
const FAC_TYPES = [
  { key: "Hospital", label: "Hospitals", icon: Building2 },
  { key: "Clinic", label: "Clinics", icon: Stethoscope },
  { key: "Diagnostic Lab", label: "Diagnostic labs", icon: FlaskConical },
  { key: "Pharmacy", label: "Pharmacies", icon: Pill },
];
const FAC_IMGS = {
  Hospital: ["/images/facility/hospital.jpg", "/images/facility/ward.jpg", "/images/facility/operating-room.jpg"],
  Clinic: ["/images/facility/clinic.jpg"],
  "Diagnostic Lab": ["/images/facility/lab.jpg"],
  Pharmacy: ["/images/facility/pharmacy.jpg", "/images/facility/pharmacy-shelves.jpg"],
};
const facImage = (f) => {
  if (f.photos && f.photos.length) return f.photos[0];
  const list = FAC_IMGS[f.type] || FAC_IMGS.Hospital;
  return list[(parseInt(String(f.id).replace(/\D/g, ""), 10) || 0) % list.length];
};
const facIs24 = (f) => /24/.test(f.hours || "");
const serviceIcon = (sv = "") => {
  const s = sv.toLowerCase();
  if (s.includes("emergency")) return Siren;
  if (s.includes("icu") || s.includes("cardio") || s.includes("ecg") || s.includes("echo")) return HeartPulse;
  if (s.includes("surgery") || s.includes("ortho")) return Scissors;
  if (s.includes("ray") || s.includes("ct") || s.includes("mri") || s.includes("ultra") || s.includes("radio")) return ScanLine;
  if (s.includes("matern") || s.includes("paedi") || s.includes("pedia")) return Baby;
  if (s.includes("medicine") || s.includes("pharm")) return Pill;
  if (s.includes("blood") || s.includes("lab") || s.includes("dialysis") || s.includes("nephro")) return TestTube;
  if (s.includes("dent") || s.includes("ortho") || s.includes("implant")) return Smile;
  if (s.includes("eye") || s.includes("ophthal") || s.includes("cataract")) return Eye;
  if (s.includes("physio")) return Activity;
  if (s.includes("delivery")) return Truck;
  return Stethoscope;
};
const FAC_SORTS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "name", label: "Name A–Z" },
];
const EMPTY_FAC_FILTERS = { type: "", services: [], open24: false, verified: false, hiring: false };

function FacilityCard({ f, saved, jobs, onOpen, onToggleSave }) {
  return (
    <article role="button" tabIndex={0} onClick={() => onOpen(f)}
      onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); onOpen(f); } }}
      className="group h-full rounded-2xl bg-white overflow-hidden flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
      <div className="relative h-36 overflow-hidden" style={{ backgroundColor: CREAM }}>
        <img src={facImage(f)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(16,24,40,0) 40%, rgba(16,24,40,0.55) 100%)" }} />
        <span className="absolute left-3 top-3 text-[11px] font-bold px-2 py-1 rounded-md" style={{ color: TEAL, backgroundColor: "#fff" }}>{f.type}</span>
        {f.mine
          ? <span className="absolute right-3 top-3 text-[11px] font-bold px-2 py-1 rounded-md text-white" style={{ backgroundColor: BRAND }}>Yours</span>
          : (
            <button type="button" onClick={(e) => { e.stopPropagation(); onToggleSave(f); }} aria-label={saved ? "Remove from saved" : "Save"}
              className="absolute right-3 top-3 w-9 h-9 rounded-full flex items-center justify-center bg-white/95 transition-transform hover:scale-105">
              <Bookmark className="w-4 h-4" fill={saved ? BRAND : "none"} stroke={saved ? BRAND : INK_2} />
            </button>
          )}
        {facIs24(f) && (
          <span className="absolute left-3 bottom-3 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-md" style={{ color: "#fff", backgroundColor: "rgba(18,128,92,0.92)" }}>
            <Clock className="w-3 h-3" /> Open 24 hours
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[16px] font-bold leading-snug flex items-center gap-1.5 group-hover:text-[#0E7C86] transition-colors" style={{ color: INK }}>
          <span className="truncate">{f.name}</span>
          {f.verified && <BadgeCheck className="w-4 h-4 shrink-0" style={{ color: GREEN }} />}
        </p>
        <p className="text-[13px] mt-1 flex items-center gap-1.5 truncate" style={{ color: SUBTLE }}>
          <MapPin className="w-3.5 h-3.5 shrink-0" /> {[f.area, f.city].filter(Boolean).join(", ")}
        </p>
        {f.rating && (
          <p className="text-[13px] mt-1.5 inline-flex items-center gap-1" style={{ color: INK_2 }}>
            <Star className="w-3.5 h-3.5" fill={STAR} stroke="none" /> <b style={{ color: INK }}>{f.rating}</b> <span style={{ color: SUBTLE }}>({f.reviews} reviews)</span>
          </p>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(f.services || []).slice(0, 3).map((sv) => (
            <span key={sv} className="text-[11.5px] font-semibold px-2 py-1 rounded-md" style={{ color: TEAL, backgroundColor: TEAL_TINT }}>{sv}</span>
          ))}
          {(f.services || []).length > 3 && <span className="text-[11.5px] font-semibold px-2 py-1 rounded-md" style={{ color: SUBTLE, backgroundColor: CREAM }}>+{f.services.length - 3}</span>}
        </div>
        <span className="flex-1" />
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 text-[12.5px]" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          {jobs > 0
            ? <span className="inline-flex items-center gap-1 font-bold" style={{ color: GREEN }}><Briefcase className="w-3.5 h-3.5" /> Hiring · {jobs} {jobs === 1 ? "job" : "jobs"}</span>
            : <span style={{ color: FAINT }}>{f.hours || "Hours on request"}</span>}
          <span className="font-bold inline-flex items-center gap-1" style={{ color: TEAL }}>View <ArrowRight className="w-3.5 h-3.5" /></span>
        </div>
      </div>
    </article>
  );
}

function FacilityPage({ f, all, jobs, onBack, onOpen, saved, onToggleSave, onMessage, onOpenJobs, jobsCount }) {
  const [shareOpen, setShareOpen] = useState(false);
  const trackRef = useRef(null);
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: "instant" }); }, [f.id]);
  const doctorsHere = DOCTORS.filter((d) => d.clinic === f.name || (d.city === f.city && (f.services || []).some((s) => d.specialty.toLowerCase().startsWith(s.toLowerCase().slice(0, 5))))).slice(0, 4);
  const nearby = all.filter((x) => x.id !== f.id).sort((a, b) => (b.city === f.city) - (a.city === f.city) || (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${f.name}, ${f.address || f.area || ""}, ${f.city}`)}`;
  const slide = (dir) => { const el = trackRef.current; if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" }); };
  const Card = ({ title, children }) => (
    <section className="rounded-2xl bg-white p-5 sm:p-6" style={{ border: `1px solid ${CARD_BORDER}` }}>
      {title && <h2 className="text-[17px] font-extrabold tracking-[-0.01em] mb-4" style={{ color: INK }}>{title}</h2>}
      {children}
    </section>
  );

  return (
    <div className="w-full min-w-0 page-enter" style={{ fontFamily: FONT }}>
      <section className="relative h-[220px] sm:h-[280px] overflow-hidden" style={{ backgroundColor: "#0A5A61" }}>
        <img src={facImage(f)} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(10,90,97,0.35) 0%, rgba(6,38,79,0.85) 100%)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-5">
          <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[13.5px] font-semibold text-white bg-white/15 hover:bg-white/25 backdrop-blur transition-colors">
            <ChevronLeft className="w-4 h-4" /> All facilities
          </button>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-20 sm:-mt-24 pb-12 relative">
        <div className="rounded-3xl bg-white p-5 sm:p-7" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 20px 50px -24px rgba(16,24,40,0.3)" }}>
          <div className="flex flex-col md:flex-row md:items-center gap-5">
            <span className="w-20 h-20 rounded-3xl flex items-center justify-center shrink-0" style={{ backgroundColor: TEAL_TINT }}>
              {(() => { const T = (FAC_TYPES.find((t) => t.key === f.type) || FAC_TYPES[0]).icon; return <T className="w-10 h-10" style={{ color: TEAL }} />; })()}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-[24px] sm:text-[30px] font-extrabold tracking-[-0.03em] leading-tight flex items-center gap-2 flex-wrap" style={{ color: INK }}>
                {f.name}
                {f.verified
                  ? <span className="inline-flex items-center gap-1 text-[12.5px] font-bold px-2.5 py-1 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}><BadgeCheck className="w-4 h-4" /> Verified</span>
                  : <span className="text-[12px] font-bold px-2.5 py-1 rounded-full" style={{ color: AMBER, backgroundColor: AMBER_TINT }}>Not yet verified</span>}
              </h1>
              <p className="text-[15.5px] font-bold mt-1" style={{ color: TEAL }}>{f.type}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-[14px]" style={{ color: INK_2 }}>
                <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" style={{ color: FAINT }} />{f.address || [f.area, f.city].filter(Boolean).join(", ")}{f.address ? `, ${f.city}` : ""}</span>
                {f.rating && <span className="inline-flex items-center gap-1"><Star className="w-4 h-4" fill={STAR} stroke="none" /><b style={{ color: INK }}>{f.rating}</b> <span style={{ color: SUBTLE }}>({f.reviews})</span></span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              {!f.mine && (
                <button type="button" onClick={onToggleSave} aria-label={saved ? "Remove from saved" : "Save"}
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]"
                  style={{ border: `1px solid ${saved ? "#B9D3F2" : CARD_BORDER}`, backgroundColor: saved ? BRAND_50 : "#fff" }}>
                  <Bookmark className="w-[18px] h-[18px]" fill={saved ? BRAND : "none"} stroke={saved ? BRAND : INK_2} />
                </button>
              )}
              <button type="button" onClick={() => setShareOpen(true)} aria-label="Share" className="w-11 h-11 rounded-xl flex items-center justify-center transition-colors hover:bg-[#F5F7FA]" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <Repeat2 className="w-[18px] h-[18px]" style={{ color: INK_2 }} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-6">
            {[
              { icon: Clock, label: "Hours", value: f.hours || "On request", green: facIs24(f) },
              { icon: Stethoscope, label: "Services", value: `${(f.services || []).length} listed` },
              { icon: Briefcase, label: "Open jobs", value: jobsCount ? `${jobsCount} hiring` : "None right now", green: jobsCount > 0 },
              { icon: Star, label: "Rating", value: f.rating ? `${f.rating} / 5` : "New" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl p-3.5" style={{ backgroundColor: s.green ? GREEN_TINT : CREAM }}>
                <p className="text-[11.5px] font-bold uppercase tracking-[0.06em] flex items-center gap-1.5" style={{ color: s.green ? GREEN : SUBTLE }}><s.icon className="w-3.5 h-3.5" /> {s.label}</p>
                <p className="text-[15px] font-bold mt-1.5 leading-snug" style={{ color: s.green ? GREEN : INK }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-5 mt-5 items-start">
          <div className="space-y-5 min-w-0">
            <Card title="About">
              <p className="text-[15px] leading-relaxed" style={{ color: INK_2 }}>
                {f.name} is a {f.verified ? "PakMed-verified " : ""}{f.type.toLowerCase()} in {f.area ? `${f.area}, ` : ""}{f.city}
                {(f.services || []).length ? `, offering ${f.services.slice(0, 3).join(", ").toLowerCase()}${f.services.length > 3 ? " and more" : ""}` : ""}.
                {facIs24(f) ? " Open 24 hours, 7 days a week." : f.hours ? ` Opening hours: ${f.hours}.` : ""}
              </p>
            </Card>

            {(f.services || []).length > 0 && (
              <Card title="Services & departments">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {f.services.map((sv) => {
                    const I = serviceIcon(sv);
                    return (
                      <div key={sv} className="flex items-center gap-3 rounded-xl px-3.5 py-3" style={{ backgroundColor: CREAM }}>
                        <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-white"><I className="w-[18px] h-[18px]" style={{ color: TEAL }} /></span>
                        <span className="text-[14.5px] font-semibold" style={{ color: INK }}>{sv}</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            <Card title={`Open jobs here${jobsCount ? ` (${jobsCount})` : ""}`}>
              {jobs.length === 0 ? (
                <p className="text-[14.5px]" style={{ color: SUBTLE }}>No open positions right now. Save this facility to hear when they're hiring.</p>
              ) : (
                <ul className="space-y-2.5">
                  {jobs.slice(0, 4).map((j) => {
                    const vis = jobRoleVisual(j.jobTitle);
                    return (
                      <li key={j.id}>
                        <button type="button" onClick={onOpenJobs} className="w-full flex items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-[#F5F7FA]" style={{ border: `1px solid ${CARD_BORDER}` }}>
                          <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: vis.tint }}><vis.Icon className="w-5 h-5" style={{ color: vis.color }} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[14.5px] font-bold truncate" style={{ color: INK }}>{j.jobTitle}</span>
                            <span className="block text-[12.5px] truncate" style={{ color: SUBTLE }}>{jobTypeOf(j)} · {(j.shifts || []).join(", ")} · {j.posted}</span>
                          </span>
                          <span className="text-[14px] font-extrabold shrink-0" style={{ color: GREEN }}>PKR {j.payAmount}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
              {jobs.length > 0 && (
                <button type="button" onClick={onOpenJobs} className="mt-4 h-10 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5" style={{ color: BRAND, backgroundColor: BRAND_50 }}>
                  See all jobs at {f.name} <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </Card>

            {doctorsHere.length > 0 && (
              <Card title="Doctors nearby">
                <div className="grid sm:grid-cols-2 gap-3">
                  {doctorsHere.map((d) => (
                    <div key={d.id} className="flex items-center gap-3 rounded-xl p-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                      <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold text-[14px]" style={{ backgroundColor: BRAND }}>{initialsOf(d.name)}</span>
                      <span className="min-w-0">
                        <span className="block text-[14px] font-bold truncate" style={{ color: INK }}>{d.name}</span>
                        <span className="block text-[12.5px] truncate" style={{ color: SUBTLE }}>{d.specialty} · PKR {d.fee}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          <aside className="lg:sticky lg:top-[88px] space-y-4">
            <section className="rounded-2xl bg-white p-5" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[16px] font-extrabold" style={{ color: INK }}>Contact & location</p>
              <div className="mt-4 space-y-3 text-[14px]" style={{ color: INK_2 }}>
                <p className="flex items-start gap-2.5"><MapPin className="w-[18px] h-[18px] shrink-0 mt-0.5" style={{ color: TEAL }} />{f.address || f.area}, {f.city}</p>
                <p className="flex items-center gap-2.5"><Clock className="w-[18px] h-[18px] shrink-0" style={{ color: TEAL }} />{f.hours || "Hours on request"}</p>
                {f.phone && <p className="flex items-center gap-2.5"><Phone className="w-[18px] h-[18px] shrink-0" style={{ color: TEAL }} />{f.phone}</p>}
              </div>
              <button type="button" onClick={onMessage}
                className="w-full h-12 mt-5 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110"
                style={{ backgroundColor: TEAL, boxShadow: "0 8px 20px -10px rgba(14,124,134,0.6)" }}>
                <MessageSquareText className="w-[18px] h-[18px]" /> Send an enquiry
              </button>
              <div className="flex gap-2 mt-2.5">
                {f.phone && (
                  <a href={`tel:${f.phone.replace(/\s/g, "")}`} className="flex-1 h-11 rounded-xl text-[14px] font-bold inline-flex items-center justify-center gap-1.5" style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                    <Phone className="w-4 h-4" /> Call
                  </a>
                )}
                <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="flex-1 h-11 rounded-xl text-[14px] font-bold inline-flex items-center justify-center gap-1.5" style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                  <Navigation className="w-4 h-4" /> Directions
                </a>
              </div>
            </section>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ backgroundColor: RED_TINT }}>
              <Siren className="w-5 h-5 shrink-0 mt-px" style={{ color: RED }} />
              <p className="text-[13px] leading-relaxed" style={{ color: "#7A2A24" }}>In a medical emergency, call <b>1122</b> or go straight to the nearest emergency department.</p>
            </div>
          </aside>
        </div>

        {nearby.length > 0 && (
          <section className="mt-10">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <h2 className="text-[22px] font-extrabold tracking-[-0.02em]" style={{ color: INK }}>Other facilities nearby</h2>
                <p className="text-[14px] mt-1" style={{ color: SUBTLE }}>In and around {f.city}</p>
              </div>
              <div className="hidden sm:flex gap-2 shrink-0">
                {[[-1, ChevronLeft, "Previous"], [1, ChevronRight, "Next"]].map(([dir, Icon, label]) => (
                  <button key={label} type="button" onClick={() => slide(dir)} aria-label={label}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-shadow hover:shadow-md" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <Icon className="w-5 h-5" style={{ color: INK }} />
                  </button>
                ))}
              </div>
            </div>
            <div ref={trackRef} className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0" style={{ scrollbarWidth: "none" }}>
              {nearby.map((x) => (
                <div key={x.id} className="snap-start shrink-0 w-[78%] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]">
                  <FacilityCard f={x} saved={false} jobs={0} onOpen={onOpen} onToggleSave={() => {}} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {shareOpen && <ShareSheet card={{ id: f.id, title: `${f.name} — ${f.type}, ${f.city}` }} onClose={() => setShareOpen(false)} />}
    </div>
  );
}

function FindHospitalScreen({ initialQuery, onBack, onMenu, userCity, employer, employerUnlocked, postedJobs, onOpenHiring, onMessage, isSaved = () => false, onToggleSave = () => {} }) {
  const [query, setQuery] = useState(initialQuery || "");
  const [qDraft, setQDraft] = useState(initialQuery || "");
  const [location, setLocation] = useState(initialQuery ? "" : (userCity || ""));
  const [locDraft, setLocDraft] = useState(initialQuery ? "" : (userCity || ""));
  const [f, setF] = useState(EMPTY_FAC_FILTERS);
  const [sort, setSort] = useState("recommended");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [open, setOpen] = useState(null);
  const resultsRef = useRef(null);

  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [filtersOpen]);

  // the user's own facility joins the directory automatically once the Employer profile is complete
  const own = employerUnlocked && employer.facilityName ? [{
    id: "own", name: employer.facilityName, type: employer.facilityType || "Hospital",
    city: employer.city, area: employer.area, address: employer.address, phone: employer.phone,
    services: (employer.services || "").split(",").map((x) => x.trim()).filter(Boolean),
    hours: "", verified: false, mine: true, photos: employer.photos || [],
  }] : [];
  const all = [...own, ...SEED_FACILITIES];
  const allJobs = [...(postedJobs || []).filter((j) => j.status === "posted"), ...SEED_JOBS];
  const jobsAt = (fac) => allJobs.filter((j) => (j.facilityName || "").toLowerCase() === (fac.name || "").toLowerCase());
  const hiringCount = (fac) => jobsAt(fac).length || fac.hiring || 0;

  const q = query.trim().toLowerCase();
  const loc = location.trim().toLowerCase();
  const base = all.filter((x) => {
    if (q && ![x.name, x.type, x.area, ...(x.services || [])].filter(Boolean).some((v) => v.toLowerCase().includes(q))) return false;
    if (f.services.length && !f.services.every((s) => (x.services || []).includes(s))) return false;
    if (f.open24 && !facIs24(x)) return false;
    if (f.verified && !x.verified) return false;
    if (f.hiring && !hiringCount(x)) return false;
    return true;
  });
  const inLoc = loc ? base.filter((x) => [x.city, x.area].filter(Boolean).some((v) => v.toLowerCase().includes(loc))) : base;
  const fellBack = loc && inLoc.length === 0 && location === userCity && !q;
  const scoped = fellBack ? base : inLoc;
  const typeCounts = scoped.reduce((acc, x) => ({ ...acc, [x.type]: (acc[x.type] || 0) + 1 }), {});
  const list = (f.type ? scoped.filter((x) => x.type === f.type) : scoped).slice().sort((a, b) => {
    if (sort === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sort === "name") return a.name.localeCompare(b.name);
    return (b.mine ? 1 : 0) - (a.mine ? 1 : 0) || (b.verified ? 1 : 0) - (a.verified ? 1 : 0) || (b.rating || 0) * Math.log10((b.reviews || 0) + 10) - (a.rating || 0) * Math.log10((a.reviews || 0) + 10);
  });

  const serviceCounts = {};
  all.forEach((x) => (x.services || []).forEach((s) => { serviceCounts[s] = (serviceCounts[s] || 0) + 1; }));
  const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([s]) => s);
  const cityCounts = all.reduce((acc, x) => ({ ...acc, [x.city]: (acc[x.city] || 0) + 1 }), {});
  const cityOptions = [...new Set([...CITIES, ...all.map((x) => x.city).filter(Boolean)])].sort();
  const nameOptions = [...new Set([...all.map((x) => x.name), ...topServices, ...FAC_TYPES.map((t) => t.key)])];

  const panelCount = f.services.length + f.open24 + f.verified + f.hiring;
  const toggleSvc = (s) => setF((p) => ({ ...p, services: p.services.includes(s) ? p.services.filter((x) => x !== s) : [...p.services, s] }));
  const chips = [
    query && { label: `“${query}”`, clear: () => { setQuery(""); setQDraft(""); } },
    location && { label: location, icon: MapPin, clear: () => { setLocation(""); setLocDraft(""); } },
    f.type && { label: f.type, clear: () => setF((p) => ({ ...p, type: "" })) },
    ...f.services.map((s) => ({ label: s, clear: () => toggleSvc(s) })),
    f.open24 && { label: "Open 24 hours", clear: () => setF((p) => ({ ...p, open24: false })) },
    f.verified && { label: "Verified", clear: () => setF((p) => ({ ...p, verified: false })) },
    f.hiring && { label: "Hiring now", clear: () => setF((p) => ({ ...p, hiring: false })) },
  ].filter(Boolean);
  const clearAll = () => { setQuery(""); setQDraft(""); setLocation(""); setLocDraft(""); setF(EMPTY_FAC_FILTERS); };
  const runSearch = (e) => {
    if (e) e.preventDefault();
    setQuery(qDraft.trim());
    setLocation(locDraft.trim());
    if (resultsRef.current && window.innerWidth < 1024) resultsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const pickCity = (c) => { const next = location === c ? "" : c; setLocation(next); setLocDraft(next); };
  const pill = (on) => ({ color: on ? "#fff" : INK_2, backgroundColor: on ? TEAL : "#fff", border: `1px solid ${on ? TEAL : CARD_BORDER}` });
  const H = ({ children }) => <p className="text-[12.5px] font-bold uppercase tracking-[0.07em] mb-2.5" style={{ color: SUBTLE }}>{children}</p>;

  const Panel = (
    <div className="pb-4">
      <div className="pt-1">
        <H>Quick filters</H>
        <div className="flex flex-wrap gap-2">
          {[["open24", "Open 24 hours", Clock], ["verified", "Verified", BadgeCheck], ["hiring", "Hiring now", Briefcase]].map(([k, label, Icon]) => (
            <button key={k} type="button" aria-pressed={f[k]} onClick={() => setF((p) => ({ ...p, [k]: !p[k] }))}
              className="h-9 px-3 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors" style={pill(f[k])}>
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <H>Facility type</H>
        <div className="space-y-1">
          {FAC_TYPES.map((t) => {
            const on = f.type === t.key;
            const n = typeCounts[t.key] || 0;
            return (
              <button key={t.key} type="button" onClick={() => setF((p) => ({ ...p, type: on ? "" : t.key }))} aria-pressed={on}
                className="w-full h-11 px-2 rounded-xl flex items-center gap-2.5 text-left transition-colors hover:bg-[#F5F7FA]"
                style={{ backgroundColor: on ? TEAL_TINT : "transparent", boxShadow: on ? "inset 0 0 0 1.5px #9FD8DC" : "none" }}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: on ? "#fff" : CREAM }}><t.icon className="w-4 h-4" style={{ color: on ? TEAL : INK_2 }} /></span>
                <span className="flex-1 min-w-0 truncate text-[13.5px] font-semibold" style={{ color: on ? TEAL : INK }}>{t.label}</span>
                <span className="text-[11.5px] font-bold px-1.5 py-0.5 rounded-md shrink-0" style={{ color: on ? TEAL : SUBTLE, backgroundColor: on ? "#fff" : CREAM }}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <H>Services</H>
        <div className="flex flex-wrap gap-2">
          {topServices.map((s) => (
            <button key={s} type="button" aria-pressed={f.services.includes(s)} onClick={() => toggleSvc(s)}
              className="h-8 px-3 rounded-full text-[12.5px] font-semibold transition-colors" style={pill(f.services.includes(s))}>{s}</button>
          ))}
        </div>
      </div>
    </div>
  );

  if (open) {
    const jobs = jobsAt(open);
    return (
      <FacilityPage
        f={open}
        all={all}
        jobs={jobs}
        jobsCount={jobs.length || open.hiring || 0}
        onBack={() => setOpen(null)}
        onOpen={setOpen}
        saved={isSaved("hospital", open.id)}
        onToggleSave={() => onToggleSave("hospital", open)}
        onMessage={() => onMessage(open)}
        onOpenJobs={() => onOpenHiring(jobs.length ? open : null)}
      />
    );
  }

  return (
    <div className="w-full min-w-0" style={{ fontFamily: FONT }}>
      <section className="relative z-10" style={{ background: "linear-gradient(135deg, #064E55 0%, #0E7C86 55%, #0B57B7 100%)" }}>
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.07)" }} />
          <img src="/images/facility/hospital.jpg" alt="" className="hidden lg:block absolute right-0 top-0 h-full w-[38%] object-cover opacity-30" style={{ maskImage: "linear-gradient(90deg, transparent, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent, #000 60%)" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-8 sm:pt-8 sm:pb-10">
          <div className="flex items-center gap-2 mb-5">
            {onBack && (
              <button type="button" onClick={onBack} aria-label="Back" className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors">
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
            )}
            <p className="text-[13px] font-semibold text-white/80">Home <span className="mx-1 text-white/50">/</span> <span className="text-white">Find a Hospital</span></p>
          </div>
          <h1 className="text-[28px] sm:text-[38px] font-extrabold tracking-[-0.03em] leading-tight text-white">Find hospitals, clinics, labs & pharmacies</h1>
          <p className="text-[14.5px] sm:text-[16px] mt-2 text-white/80">{all.length} healthcare facilities across {Object.keys(cityCounts).length} cities · opening hours, services and contact</p>

          <form onSubmit={runSearch} className="mt-6 bg-white rounded-2xl p-2 grid grid-cols-1 md:grid-cols-[1.3fr_1fr_auto] gap-2 relative z-20" style={{ boxShadow: "0 20px 40px -20px rgba(0,0,0,0.4)" }}>
            <SearchSuggestInput
              icon={Building2}
              value={qDraft}
              onChange={setQDraft}
              onPick={(v) => { setQDraft(v); setQuery(v); }}
              onClear={() => { setQDraft(""); setQuery(""); }}
              placeholder="Name or service (e.g. Emergency, MRI)"
              suggestions={nameOptions}
              srLabel="Facility name or service"
              className="md:border-r rounded-xl"
              style={{ borderColor: CARD_BORDER }}
            />
            <SearchSuggestInput
              icon={MapPin}
              value={locDraft}
              onChange={setLocDraft}
              onPick={(v) => { setLocDraft(v); setLocation(v); }}
              onClear={() => { setLocDraft(""); setLocation(""); }}
              placeholder="City or area"
              suggestions={cityOptions}
              srLabel="City or area"
              className="rounded-xl"
            />
            <button type="submit" className="h-12 px-7 rounded-xl text-[15px] font-bold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-110" style={{ backgroundColor: TEAL }}>
              <Search className="w-4 h-4" /> Search
            </button>
          </form>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap" style={{ scrollbarWidth: "none" }}>
            {CITIES.filter((c) => cityCounts[c]).map((c) => {
              const on = location.toLowerCase() === c.toLowerCase();
              return (
                <button key={c} type="button" onClick={() => pickCity(c)}
                  className="shrink-0 h-9 px-3.5 rounded-full text-[13px] font-semibold inline-flex items-center gap-1.5 transition-colors"
                  style={{ backgroundColor: on ? "#fff" : "rgba(255,255,255,0.14)", color: on ? TEAL : "#fff", border: `1px solid ${on ? "#fff" : "rgba(255,255,255,0.25)"}` }}>
                  {c} <span className="text-[11.5px]" style={{ opacity: 0.7 }}>{cityCounts[c]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <div ref={resultsRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 scroll-mt-20">
        {/* type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: "none" }} role="tablist">
          {[{ key: "", label: "All", icon: LayoutGrid }, ...FAC_TYPES].map((t) => {
            const on = f.type === t.key;
            const n = t.key ? typeCounts[t.key] || 0 : scoped.length;
            return (
              <button key={t.label} type="button" role="tab" aria-selected={on} onClick={() => setF((p) => ({ ...p, type: t.key }))}
                className="shrink-0 h-10 px-4 rounded-xl text-[14px] font-bold inline-flex items-center gap-2 transition-all"
                style={{ backgroundColor: on ? INK : "#fff", color: on ? "#fff" : INK_2, border: `1px solid ${on ? INK : CARD_BORDER}` }}>
                <t.icon className="w-4 h-4" /> {t.label}
                <span className="text-[11.5px] font-bold px-1.5 py-0.5 rounded-md" style={{ backgroundColor: on ? "rgba(255,255,255,0.18)" : CREAM, color: on ? "#fff" : SUBTLE }}>{n}</span>
              </button>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-[250px_1fr] gap-6 items-start">
          <aside className="hidden lg:block sticky top-[88px] rounded-2xl bg-white px-5 pt-4 pb-1 max-h-[calc(100dvh-110px)] overflow-y-auto auth-scroll" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <div className="flex items-center justify-between pb-3">
              <p className="text-[16px] font-extrabold flex items-center gap-2" style={{ color: INK }}><SlidersHorizontal className="w-4 h-4" /> Filters</p>
              {panelCount > 0 && <button type="button" onClick={() => setF((p) => ({ ...EMPTY_FAC_FILTERS, type: p.type }))} className="text-[13px] font-bold" style={{ color: TEAL }}>Clear</button>}
            </div>
            {Panel}
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <p className="text-[14.5px] mr-auto" style={{ color: SUBTLE }}>
                {fellBack
                  ? <>Nothing in <b style={{ color: INK }}>{location}</b> yet — showing all of Pakistan</>
                  : <><b className="text-[16px]" style={{ color: INK }}>{list.length}</b> {list.length === 1 ? "facility" : "facilities"}{location ? <> in <b style={{ color: INK }}>{location}</b></> : " across Pakistan"}</>}
              </p>
              <button type="button" onClick={() => setFiltersOpen(true)}
                className="lg:hidden h-10 px-3.5 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-2 bg-white" style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {panelCount > 0 && <span className="w-5 h-5 rounded-full text-[11px] text-white flex items-center justify-center" style={{ backgroundColor: TEAL }}>{panelCount}</span>}
              </button>
              <Dropdown label="Sort facilities" icon={ArrowUpDown} value={sort} onChange={setSort} options={FAC_SORTS} />
            </div>

            {chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {chips.map((c) => (
                  <span key={c.label} className="inline-flex items-center gap-1.5 h-8 pl-3 pr-1.5 rounded-full text-[12.5px] font-semibold" style={{ color: TEAL, backgroundColor: TEAL_TINT, border: "1px solid #B5E0E3" }}>
                    {c.icon && <c.icon className="w-3.5 h-3.5" />} {c.label}
                    <button type="button" onClick={c.clear} aria-label={`Remove ${c.label}`} className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                <button type="button" onClick={clearAll} className="text-[13px] font-bold px-2 h-8" style={{ color: RED }}>Clear all</button>
              </div>
            )}

            {list.length === 0 ? (
              <div className="rounded-2xl bg-white px-6 py-14 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <span className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: TEAL_TINT }}>
                  <Building2 className="w-6 h-6" style={{ color: TEAL }} />
                </span>
                <p className="text-[17px] font-bold" style={{ color: INK }}>No facilities match</p>
                <p className="text-[14px] mt-1 mb-5" style={{ color: SUBTLE }}>Try another city, facility type or fewer filters.</p>
                <button type="button" onClick={clearAll} className="h-11 px-5 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: TEAL }}>Clear all filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {list.map((x) => (
                  <FacilityCard key={x.id} f={x} saved={isSaved("hospital", x.id)} jobs={hiringCount(x)} onOpen={setOpen} onToggleSave={(it) => onToggleSave("hospital", it)} />
                ))}
              </div>
            )}

            <p className="text-[12.5px] mt-6 leading-relaxed flex items-start gap-2" style={{ color: SUBTLE }}>
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              Facilities appear here automatically when they complete an Employer profile. "Not yet verified" means PakMed hasn't checked their documents.
            </p>
          </div>
        </div>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
          <div className="absolute inset-0 bg-black/45" onClick={() => setFiltersOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[88dvh] bg-white rounded-t-3xl flex flex-col auth-step">
            <div className="flex items-center justify-between px-5 h-14 shrink-0" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[17px] font-extrabold" style={{ color: INK }}>Filters</p>
              <button type="button" onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: CREAM }}>
                <X className="w-5 h-5" style={{ color: INK }} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pt-4">{Panel}</div>
            <div className="p-4 shrink-0" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <button type="button" onClick={() => setFiltersOpen(false)} className="w-full h-12 rounded-xl text-[15px] font-bold text-white" style={{ backgroundColor: TEAL }}>
                Show {list.length} {list.length === 1 ? "facility" : "facilities"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* =========================================================
   GLOBAL SEARCH — one query across doctors, hospitals, jobs and market
   ========================================================= */
function SearchResultsScreen({ query, onBack, onMenu, authed, userCity, postedJobs, listings, facilities, onSeeAll, onOpenSection }) {
  const [q, setQ] = useState(query || "");
  const [submitted, setSubmitted] = useState(!!(query && query.trim()));
  const t = q.trim().toLowerCase();
  const has = (...vals) => !t || vals.filter(Boolean).some((v) => String(v).toLowerCase().includes(t));
  // nearest city first, then everything else in original (newest-first) order
  const cityFirst = (arr, cityOf) => !userCity ? arr
    : [...arr.filter((x) => cityOf(x) === userCity), ...arr.filter((x) => cityOf(x) !== userCity)];

  const doctors = cityFirst(DOCTORS.filter((d) => has(d.name, d.specialty, d.qual, d.city, d.area, d.clinic)), (d) => d.city);
  const places = cityFirst(facilities.filter((f) => has(f.name, f.type, f.city, f.area, ...(f.services || []))), (f) => f.city);
  const jobs = cityFirst([...postedJobs.filter((j) => j.status === "posted"), ...SEED_JOBS]
    .filter((j) => has(j.jobTitle, j.city, j.facilityTypeLabel, ...(j.requirements || []), authed ? j.facilityName : null, authed ? j.area : null)), (j) => j.city);
  const items = cityFirst([
    ...(listings || []).filter((l) => l.status === "live").map((l) => ({ id: l.id, name: l.name, price: l.price, condition: l.condition, seller: "Your listing", city: "" })),
    ...SEED_MARKET_ITEMS,
    ...SEED_SERVICES.map((sv) => ({ id: sv.id, name: sv.name, price: null, condition: "Service", seller: sv.provider, city: sv.city })),
  ].filter((i) => has(i.name, i.seller, i.city, i.condition)), (i) => i.city);

  const total = doctors.length + places.length + jobs.length + items.length;

  // live suggestions: a single mixed list, best few of each kind interleaved
  const live = !t ? [] : [
    ...doctors.slice(0, 2).map((d) => ({ k: "consult", id: d.id, icon: Stethoscope, tint: RED_TINT, color: RED, title: d.name, sub: `Doctor · ${d.specialty} · ${d.city}`, q: d.name })),
    ...places.slice(0, 2).map((p) => ({ k: "hospital", id: p.id, icon: Building2, tint: TEAL_TINT, color: TEAL, title: p.name, sub: `${p.type} · ${p.city}`, q: p.name })),
    ...jobs.slice(0, 2).map((jb) => ({ k: "findjob", id: jb.id, icon: Briefcase, tint: BRAND_50, color: BRAND, title: jb.jobTitle, sub: `Job · ${jb.city} · PKR ${jb.payAmount}`, q: jb.jobTitle })),
    ...items.slice(0, 2).map((it) => ({ k: "market", id: it.id, icon: Store, tint: VIOLET_TINT, color: VIOLET, title: it.name, sub: `Market · ${it.condition}${it.city ? ` · ${it.city}` : ""}`, q: it.name })),
  ];
  const per = submitted ? 5 : 3;

  const Group = ({ title, count, section, children }) => count === 0 ? null : (
    <div className="mt-4">
      <div className="flex items-baseline justify-between px-4 pb-2">
        <p className="text-[15px] font-bold" style={{ color: INK, letterSpacing: "-0.015em" }}>{title} <span className="font-medium" style={{ color: SUBTLE }}>· {count}</span></p>
        {count > per && <button onClick={() => onSeeAll(section, q.trim())} className="text-[13px] font-semibold" style={{ color: BRAND }}>See all</button>}
      </div>
      <div className="bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}` }}>{children}</div>
    </div>
  );
  const Row = ({ first, icon: Icon, tint, color, title, sub, right, onClick }) => (
    <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 text-left" style={{ borderTop: first ? "none" : `1px solid ${CARD_BORDER}` }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
        <Icon className="w-[18px] h-[18px]" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold truncate" style={{ color: INK }}>{title}</p>
        <p className="text-[12px] truncate" style={{ color: SUBTLE }}>{sub}</p>
      </div>
      {right && <span className="text-[12.5px] font-bold shrink-0" style={{ color: INK }}>{right}</span>}
    </button>
  );

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title="Search" subtitle={t ? `${total} results` : "Jobs, doctors, hospitals, equipment"} onBack={onBack} onMenu={onMenu} />
      <div className="px-4 pb-1 shrink-0">
        <div className="flex items-center gap-2 rounded-xl pl-3 pr-2 bg-white" style={{ height: 46, border: `1px solid ${CARD_BORDER}` }}>
          <Search className="w-[18px] h-[18px] shrink-0" style={{ color: FAINT }} />
          <input autoFocus value={q}
            onChange={(e) => { setQ(e.target.value); setSubmitted(false); }}
            onKeyDown={(e) => { if (e.key === "Enter" && q.trim()) { setSubmitted(true); e.target.blur(); } }}
            enterKeyHint="search"
            placeholder="Search everything"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px]" style={{ color: INK }} />
          {q && <button onClick={() => { setQ(""); setSubmitted(false); }}><X className="w-4 h-4" style={{ color: FAINT }} /></button>}
          {q.trim() && !submitted && (
            <button onClick={() => setSubmitted(true)} className="text-[12.5px] font-bold px-3 h-8 rounded-lg text-white shrink-0" style={{ backgroundColor: BRAND }}>Search</button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-5">
        {t && !submitted && live.length > 0 && (
          <div className="mt-2 bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}` }}>
            {live.map((x, n) => (
              <Row key={x.k + x.id} first={!n} icon={x.icon} tint={x.tint} color={x.color} title={x.title} sub={x.sub}
                onClick={() => onSeeAll(x.k, x.q)} />
            ))}
            <button onClick={() => setSubmitted(true)} className="w-full flex items-center gap-2 px-4 py-3 text-left" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <Search className="w-4 h-4" style={{ color: BRAND }} />
              <span className="text-[13.5px] font-semibold" style={{ color: BRAND }}>See all {total} results for "{q.trim()}"</span>
            </button>
          </div>
        )}

        {t && total === 0 && (
          <div className="text-center px-8 pt-12">
            <Search className="w-10 h-10 mx-auto" style={{ color: FAINT }} />
            <p className="text-[15px] font-bold mt-3" style={{ color: INK }}>No results for "{q.trim()}"</p>
            <p className="text-[13px] mt-1" style={{ color: SUBTLE }}>Try a shorter word, a city, or a speciality.</p>
          </div>
        )}

        {submitted && <>
        <Group title="Doctors" count={doctors.length} section="consult">
          {doctors.slice(0, per).map((d, i) => (
            <Row key={d.id} first={!i} icon={Stethoscope} tint={RED_TINT} color={RED}
              title={d.name} sub={`${d.specialty} · ${d.area}, ${d.city}`} right={`PKR ${d.fee}`} onClick={() => onSeeAll("consult", d.name)} />
          ))}
        </Group>

        <Group title="Hospitals & clinics" count={places.length} section="hospital">
          {places.slice(0, per).map((f, i) => (
            <Row key={f.id} first={!i} icon={Building2} tint={TEAL_TINT} color={TEAL}
              title={f.name} sub={`${f.type} · ${[f.area, f.city].filter(Boolean).join(", ")}${f.hiring ? " · hiring" : ""}`} onClick={() => onSeeAll("hospital", f.name)} />
          ))}
        </Group>

        <Group title="Jobs" count={jobs.length} section="findjob">
          {jobs.slice(0, per).map((j, i) => (
            <Row key={j.id} first={!i} icon={Briefcase} tint={BRAND_50} color={BRAND}
              title={j.jobTitle}
              sub={authed ? `${j.facilityName} · ${j.city}` : `${j.city} · employer shown after sign in`}
              right={`PKR ${j.payAmount}`} onClick={() => onSeeAll("findjob", j.jobTitle)} />
          ))}
        </Group>

        <Group title="Buy / Sell" count={items.length} section="market">
          {items.slice(0, per).map((it, i) => (
            <Row key={it.id} first={!i} icon={Store} tint={VIOLET_TINT} color={VIOLET}
              title={it.name} sub={`${it.condition} · ${it.seller}${it.city ? `, ${it.city}` : ""}`}
              right={it.price ? `PKR ${it.price}` : null} onClick={() => onSeeAll("market", it.name)} />
          ))}
        </Group>
        </>}

        {!t && (
          <div className="px-4 pt-4">
            <p className="text-[13px] font-semibold mb-2" style={{ color: SUBTLE }}>Try searching for</p>
            <div className="flex flex-wrap gap-1.5">
              {["Cardiologist", "Medical Officer", "Ultrasound", "Nurse", "Lahore", "Pharmacy"].map((x) => (
                <button key={x} onClick={() => { setQ(x); setSubmitted(true); }} className="text-[12.5px] font-semibold px-3 py-1.5 rounded-full bg-white"
                  style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>{x}</button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   SAVED — everything the user has bookmarked, across the platform
   ========================================================= */
function SavedScreen({ onBack, onMenu, savedJobs, savedItems, onToggleJob, onToggleSave, onOpen }) {
  const [filter, setFilter] = useState("all");
  const doctors = Object.values(savedItems.doctor || {});
  const hospitals = Object.values(savedItems.hospital || {});
  const market = Object.values(savedItems.market || {});
  const counts = { all: savedJobs.length + doctors.length + hospitals.length + market.length,
                   jobs: savedJobs.length, doctors: doctors.length, hospitals: hospitals.length, market: market.length };
  const show = (k) => filter === "all" || filter === k;

  const Section = ({ title, n, children }) => n === 0 ? null : (
    <div className="mt-3">
      {filter === "all" && <p className="px-4 pb-1.5 text-[13px] font-bold" style={{ color: SUBTLE }}>{title} · {n}</p>}
      <div className="bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}` }}>{children}</div>
    </div>
  );
  const Item = ({ first, icon: Icon, tint, color, title, sub, right, onOpenIt, onRemove }) => (
    <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: first ? "none" : `1px solid ${CARD_BORDER}` }}>
      <button onClick={onOpenIt} className="flex items-center gap-3 flex-1 min-w-0 text-left">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
          <Icon className="w-[18px] h-[18px]" style={{ color }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold truncate" style={{ color: INK }}>{title}</p>
          <p className="text-[12px] truncate" style={{ color: SUBTLE }}>{sub}</p>
        </div>
        {right && <span className="text-[12.5px] font-bold shrink-0" style={{ color: INK }}>{right}</span>}
      </button>
      <SaveButton saved onClick={onRemove} />
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title="Saved" subtitle={`${counts.all} saved`} onBack={onBack} onMenu={onMenu} />
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
          {[["all", "All"], ["jobs", "Jobs"], ["doctors", "Doctors"], ["hospitals", "Find Hospital"], ["market", "Buy / Sell"]].map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[12.5px] font-semibold"
              style={{ backgroundColor: filter === k ? BRAND_50 : "#fff", color: filter === k ? BRAND : INK_2, border: `1px solid ${filter === k ? "#B9D3F2" : CARD_BORDER}` }}>
              {l}{counts[k] ? ` · ${counts[k]}` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-5">
        {(filter === "all" ? counts.all : counts[filter]) === 0 && (
          <div className="text-center px-8 pt-14">
            <Bookmark className="w-10 h-10 mx-auto" style={{ color: FAINT }} />
            <p className="text-[15px] font-bold mt-3" style={{ color: INK }}>Nothing saved yet</p>
            <p className="text-[13px] mt-1 leading-snug" style={{ color: SUBTLE }}>
              Tap the bookmark on any job, doctor, hospital or listing to keep it here.
            </p>
          </div>
        )}

        {show("jobs") && (
          <Section title="Jobs" n={savedJobs.length}>
            {savedJobs.map((j, i) => (
              <Item key={j.id} first={!i} icon={Briefcase} tint={BRAND_50} color={BRAND}
                title={j.jobTitle} sub={`${j.facilityName} · ${j.city}`} right={`PKR ${j.payAmount}`}
                onOpenIt={() => onOpen("findjob", j.jobTitle)} onRemove={() => onToggleJob(j.id)} />
            ))}
          </Section>
        )}
        {show("doctors") && (
          <Section title="Doctors" n={doctors.length}>
            {doctors.map((d, i) => (
              <Item key={d.id} first={!i} icon={Stethoscope} tint={RED_TINT} color={RED}
                title={d.name} sub={`${d.specialty} · ${d.city}`} right={d.fee ? `PKR ${d.fee}` : null}
                onOpenIt={() => onOpen("consult", d.name)} onRemove={() => onToggleSave("doctor", d)} />
            ))}
          </Section>
        )}
        {show("hospitals") && (
          <Section title="Hospitals & clinics" n={hospitals.length}>
            {hospitals.map((f, i) => (
              <Item key={f.id} first={!i} icon={Building2} tint={TEAL_TINT} color={TEAL}
                title={f.name} sub={`${f.type} · ${[f.area, f.city].filter(Boolean).join(", ")}`}
                onOpenIt={() => onOpen("hospital", f.name)} onRemove={() => onToggleSave("hospital", f)} />
            ))}
          </Section>
        )}
        {show("market") && (
          <Section title="Buy / Sell" n={market.length}>
            {market.map((it, i) => (
              <Item key={it.id} first={!i} icon={Store} tint={VIOLET_TINT} color={VIOLET}
                title={it.name} sub={`${it.condition || ""}${it.seller ? ` · ${it.seller}` : ""}`} right={it.price ? `PKR ${it.price}` : null}
                onOpenIt={() => onOpen("market", it.name)} onRemove={() => onToggleSave("market", it)} />
            ))}
          </Section>
        )}
      </div>
    </div>
  );
}

/* ---------- Profile tab: account overview ---------- */
function AccountScreen({
  onBack, onMenu, authed, onSignIn, username, general = {}, doctor = {}, pctGeneral = 0, pctDoctor = 0,
  cvReady, verifiedPhone, profilesLive = 0, savedJobs = [], savedItems = {}, applications = [], allJobs = [],
  messagesCount = 0, onNavigate, onOpenSaved, onToggleJob, onToggleSave, onSignOut,
}) {
  const [savedTab, setSavedTab] = useState("jobs");

  if (!authed) {
    return (
      <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
        <ScreenHeader title="My profile" onBack={onBack} onMenu={onMenu} />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16">
          <span className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: BRAND_50 }}>
            <UserRound className="w-8 h-8" style={{ color: BRAND }} />
          </span>
          <p className="text-[19px] font-extrabold" style={{ color: INK }}>Sign in to see your profile</p>
          <p className="text-[14.5px] mt-1.5 max-w-sm" style={{ color: SUBTLE }}>Your saved jobs, applications, CV and verification all live here.</p>
          <button type="button" onClick={onSignIn} className="mt-6 h-12 px-6 rounded-xl text-[15px] font-bold text-white" style={{ backgroundColor: BRAND }}>Sign in</button>
        </div>
      </div>
    );
  }

  const name = general.fullName || doctor.fullName || username || "Your name";
  const initials = name.replace(/^Dr\.?\s*/i, "").split(/[\s_]+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "U";
  const title = general.jobTitle || doctor.specialty || "Add your job title";
  const city = [general.area, general.city || doctor.city].filter(Boolean).join(", ");
  const photo = general.photo || doctor.photo;

  const checklist = [
    { label: "Basic profile", done: pctGeneral >= GATE_THRESHOLD, go: "profiles" },
    { label: "Professional details", done: pctDoctor >= GATE_THRESHOLD, go: "profiles" },
    { label: "CV uploaded", done: !!cvReady, go: "cv" },
    { label: "WhatsApp verified", done: !!verifiedPhone, go: "profileDetail" },
  ];
  const completion = Math.round((checklist.filter((c) => c.done).length / checklist.length) * 100);

  const doctors = Object.values(savedItems.doctor || {});
  const hospitals = Object.values(savedItems.hospital || {});
  const market = Object.values(savedItems.market || {});
  const savedTotal = savedJobs.length + doctors.length + hospitals.length + market.length;
  const savedTabs = [
    ["jobs", "Jobs", savedJobs.length],
    ["doctors", "Doctors", doctors.length],
    ["hospitals", "Hospitals", hospitals.length],
    ["market", "Market", market.length],
  ];
  const savedRows = {
    jobs: savedJobs.map((j) => ({ id: j.id, icon: Briefcase, tint: BRAND_50, color: BRAND, title: j.jobTitle, sub: `${j.facilityName} · ${j.city}`, right: `PKR ${j.payAmount}`, open: () => onOpenSaved("findjob", j.jobTitle), remove: () => onToggleJob(j.id) })),
    doctors: doctors.map((d) => ({ id: d.id, icon: Stethoscope, tint: RED_TINT, color: RED, title: d.name, sub: `${d.specialty} · ${d.city}`, right: d.fee ? `PKR ${d.fee}` : "", open: () => onOpenSaved("consult", d.name), remove: () => onToggleSave("doctor", d) })),
    hospitals: hospitals.map((f) => ({ id: f.id, icon: Building2, tint: TEAL_TINT, color: TEAL, title: f.name, sub: `${f.type} · ${[f.area, f.city].filter(Boolean).join(", ")}`, right: "", open: () => onOpenSaved("hospital", f.name), remove: () => onToggleSave("hospital", f) })),
    market: market.map((it) => ({ id: it.id, icon: Store, tint: VIOLET_TINT, color: VIOLET, title: it.name, sub: it.seller || it.condition || "", right: it.price ? `PKR ${it.price}` : "", open: () => onOpenSaved("market", it.name), remove: () => onToggleSave("market", it) })),
  };
  const rows = savedRows[savedTab] || [];

  const apps = applications.map((a) => ({ ...a, job: allJobs.find((j) => j.id === a.jobId) })).filter((a) => a.job);

  const Card = ({ children, className = "" }) => (
    <div className={`rounded-2xl bg-white ${className}`} style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>{children}</div>
  );
  const CardHead = ({ title, action, onAction }) => (
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3">
      <p className="text-[16px] font-extrabold tracking-[-0.01em]" style={{ color: INK }}>{title}</p>
      {action && <button type="button" onClick={onAction} className="text-[13.5px] font-bold inline-flex items-center gap-1" style={{ color: BRAND }}>{action} <ChevronRight className="w-4 h-4" /></button>}
    </div>
  );

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title="My profile" subtitle="Your account, saved items and applications" onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5 space-y-4" style={{ backgroundColor: CREAM }}>

        {/* identity */}
        <Card className="overflow-hidden">
          <div className="h-24 sm:h-28" style={{ background: `linear-gradient(120deg, ${BRAND_DK}, ${BRAND} 60%, #2F7BDA)` }} />
          <div className="px-5 pb-5 -mt-10">
            <div className="flex items-end justify-between gap-3 flex-wrap">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-[26px] font-extrabold text-white overflow-hidden shrink-0" style={{ backgroundColor: BRAND, border: "4px solid #fff", boxShadow: "0 8px 20px -10px rgba(16,24,40,0.4)" }}>
                {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initials}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => onNavigate("profiles")} className="h-10 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5 bg-white" style={{ color: INK, border: `1px solid ${CARD_BORDER}` }}>
                  <Pencil className="w-4 h-4" /> Edit profile
                </button>
                <button type="button" onClick={() => onNavigate("cv")} className="h-10 px-4 rounded-xl text-[13.5px] font-bold inline-flex items-center gap-1.5 text-white" style={{ backgroundColor: BRAND }}>
                  <FileText className="w-4 h-4" /> My CV
                </button>
              </div>
            </div>
            <p className="text-[22px] font-extrabold tracking-[-0.02em] mt-3" style={{ color: INK }}>{name}</p>
            <p className="text-[14.5px] mt-0.5" style={{ color: INK_2 }}>{title}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[13.5px]" style={{ color: SUBTLE }}>
              <span>@{username}</span>
              {city && <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4" /> {city}</span>}
              <span className="inline-flex items-center gap-1 font-semibold" style={{ color: verifiedPhone ? GREEN : AMBER }}>
                {verifiedPhone ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />} {verifiedPhone ? "Verified" : "Not verified yet"}
              </span>
            </div>
          </div>
        </Card>

        {/* stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: Bookmark, label: "Saved", value: savedTotal, go: () => onNavigate("saved") },
            { icon: Briefcase, label: "Applications", value: apps.length, go: () => onNavigate("findjob") },
            { icon: MessageSquareText, label: "Messages", value: messagesCount, go: () => onNavigate("messages") },
            { icon: UserRound, label: "Profiles live", value: profilesLive, go: () => onNavigate("profiles") },
          ].map((s) => (
            <button key={s.label} type="button" onClick={s.go} className="rounded-2xl bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <s.icon className="w-5 h-5" style={{ color: BRAND }} />
              <p className="text-[24px] font-extrabold mt-2 leading-none" style={{ color: INK }}>{s.value}</p>
              <p className="text-[13px] font-semibold mt-1" style={{ color: SUBTLE }}>{s.label}</p>
            </button>
          ))}
        </div>

        {/* completion */}
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <CompletionRing value={completion} size={60} stroke={5} color={completion === 100 ? GREEN : BRAND} />
            <div className="min-w-0">
              <p className="text-[16px] font-extrabold" style={{ color: INK }}>Profile strength: {completion}%</p>
              <p className="text-[13.5px] mt-0.5" style={{ color: SUBTLE }}>
                {completion === 100 ? "Great — employers can see your full profile." : "Complete these to get noticed by hospitals."}
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2 mt-4">
            {checklist.map((c) => (
              <button key={c.label} type="button" onClick={() => onNavigate(c.go)}
                className="flex items-center gap-2.5 h-12 px-3.5 rounded-xl text-left transition-colors hover:bg-[#F5F7FA]"
                style={{ border: `1px solid ${CARD_BORDER}` }}>
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: c.done ? GREEN : FAINT }} />
                <span className="flex-1 text-[14px] font-semibold" style={{ color: c.done ? INK : INK_2 }}>{c.label}</span>
                {!c.done && <span className="text-[12.5px] font-bold" style={{ color: BRAND }}>Add</span>}
              </button>
            ))}
          </div>
        </Card>

        {/* saved */}
        <Card>
          <CardHead title={`Saved (${savedTotal})`} action="View all" onAction={() => onNavigate("saved")} />
          <div className="flex gap-1.5 px-5 pb-3 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
            {savedTabs.map(([k, l, n]) => {
              const on = savedTab === k;
              return (
                <button key={k} type="button" onClick={() => setSavedTab(k)}
                  className="shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold transition-colors"
                  style={{ backgroundColor: on ? BRAND : CREAM, color: on ? "#fff" : INK_2, border: `1px solid ${on ? BRAND : CARD_BORDER}` }}>
                  {l} {n > 0 && <span style={{ opacity: 0.75 }}>· {n}</span>}
                </button>
              );
            })}
          </div>
          {rows.length === 0 ? (
            <div className="px-5 pb-6 pt-2 text-center">
              <Bookmark className="w-8 h-8 mx-auto" style={{ color: FAINT }} />
              <p className="text-[14.5px] font-bold mt-2" style={{ color: INK }}>Nothing saved here yet</p>
              <p className="text-[13.5px] mt-0.5" style={{ color: SUBTLE }}>Tap the bookmark on any {savedTab === "jobs" ? "job" : savedTab === "doctors" ? "doctor" : savedTab === "hospitals" ? "hospital" : "listing"} to keep it here.</p>
            </div>
          ) : (
            <ul>
              {rows.slice(0, 5).map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                  <button type="button" onClick={r.open} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: r.tint }}>
                      <r.icon className="w-5 h-5" style={{ color: r.color }} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14.5px] font-bold truncate" style={{ color: INK }}>{r.title}</span>
                      <span className="block text-[13px] truncate" style={{ color: SUBTLE }}>{r.sub}</span>
                    </span>
                    {r.right && <span className="hidden sm:block text-[13.5px] font-bold shrink-0" style={{ color: GREEN }}>{r.right}</span>}
                  </button>
                  <button type="button" onClick={r.remove} aria-label="Remove from saved" className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 hover:bg-[#F5F7FA]">
                    <Bookmark className="w-[18px] h-[18px]" fill={BRAND} stroke={BRAND} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* applications */}
        <Card>
          <CardHead title={`My applications (${apps.length})`} action={apps.length ? "Find more jobs" : null} onAction={() => onNavigate("findjob")} />
          {apps.length === 0 ? (
            <div className="px-5 pb-6 pt-1 text-center">
              <Briefcase className="w-8 h-8 mx-auto" style={{ color: FAINT }} />
              <p className="text-[14.5px] font-bold mt-2" style={{ color: INK }}>No applications yet</p>
              <p className="text-[13.5px] mt-0.5 mb-4" style={{ color: SUBTLE }}>Apply to jobs with your CV in one tap.</p>
              <button type="button" onClick={() => onNavigate("findjob")} className="h-10 px-5 rounded-xl text-[13.5px] font-bold text-white" style={{ backgroundColor: BRAND }}>Browse jobs</button>
            </div>
          ) : (
            <ul>
              {apps.slice(0, 5).map((a) => {
                const stt = APP_STATUS[a.status] || APP_STATUS.new;
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_50 }}>
                      <Briefcase className="w-5 h-5" style={{ color: BRAND }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-bold truncate" style={{ color: INK }}>{a.job.jobTitle}</p>
                      <p className="text-[13px] truncate" style={{ color: SUBTLE }}>{a.job.facilityName} · {a.job.city} · {a.at}</p>
                    </div>
                    <span className="text-[12px] font-bold px-2.5 py-1 rounded-full shrink-0" style={{ color: stt.color, backgroundColor: stt.tint }}>{stt.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* account details */}
        <Card>
          <CardHead title="Account details" action="Edit" onAction={() => onNavigate("profiles")} />
          <dl>
            {[
              ["Full name", general.fullName || doctor.fullName],
              ["Username", `@${username}`],
              ["WhatsApp", verifiedPhone ? `+92 ${verifiedPhone}` : general.phone],
              ["Email", general.email],
              ["City", general.city || doctor.city],
              ["PMDC number", doctor.pmdc],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center gap-4 px-5 py-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <dt className="w-32 shrink-0 text-[13.5px] font-semibold" style={{ color: SUBTLE }}>{k}</dt>
                <dd className="flex-1 min-w-0 text-[14.5px] font-semibold truncate" style={{ color: v ? INK : FAINT }}>{v || "Not added"}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { icon: UserRound, label: "Profiles", go: "profiles" },
            { icon: FileText, label: "CV / Resume", go: "cv" },
            { icon: ShieldCheck, label: "Verification", go: "profileDetail" },
            { icon: Settings, label: "Settings", go: "settings" },
            { icon: HelpCircle, label: "Help & support", go: "help" },
            { icon: Info, label: "About PakMed", go: "about" },
          ].map((l) => (
            <button key={l.label} type="button" onClick={() => onNavigate(l.go)}
              className="rounded-2xl bg-white p-4 flex items-center gap-3 text-left transition-colors hover:bg-[#FAFBFC]" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND_50 }}>
                <l.icon className="w-5 h-5" style={{ color: BRAND }} />
              </span>
              <span className="text-[14px] font-bold" style={{ color: INK }}>{l.label}</span>
            </button>
          ))}
        </div>

        {onSignOut && (
          <button type="button" onClick={onSignOut} className="w-full h-12 rounded-xl text-[14.5px] font-bold inline-flex items-center justify-center gap-2 bg-white transition-colors hover:bg-[#FFF5F5]" style={{ color: RED, border: `1px solid ${CARD_BORDER}` }}>
            <LogOut className="w-[18px] h-[18px]" /> Sign out
          </button>
        )}
      </div>
    </div>
  );
}

/* ---------- Profile tab: choose Profiles or CV ---------- */
function ProfileChooserScreen({ onBack, onMenu, onProfiles, onCV, profilesNote, cvNote }) {
  const Opt = ({ icon: Icon, tint, color, title, sub, note, onClick }) => (
    <button onClick={onClick} className="w-full rounded-2xl bg-white p-4 flex items-center gap-3.5 text-left active:scale-[0.99] transition-transform"
      style={{ border: `1px solid ${CARD_BORDER}` }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0" style={{ backgroundColor: tint }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[16px] font-bold" style={{ color: INK, letterSpacing: "-0.015em" }}>{title}</p>
        <p className="text-[12.5px] mt-0.5 leading-snug" style={{ color: SUBTLE }}>{sub}</p>
        {note && <p className="text-[11.5px] font-semibold mt-1.5" style={{ color }}>{note}</p>}
      </div>
      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: FAINT }} />
    </button>
  );
  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title="Profile & CV" subtitle="Build your presence on PakMed" onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-5 pt-1 flex flex-col gap-2.5">
        <Opt icon={UserRound} tint={BRAND_50} color={BRAND} title="Profiles"
          sub="General, Doctor, Employer and Business profiles — each unlocks part of PakMed."
          note={profilesNote} onClick={onProfiles} />
        <Opt icon={FileText} tint={GREEN_TINT} color={GREEN} title="CV / Resume"
          sub="Build, upload or download your CV, and make it available to employers."
          note={cvNote} onClick={onCV} />
      </div>
    </div>
  );
}

function NewsScreen({ onBack, onMenu }) {
  const all = [...findJobCards, ...postJobCards, ...consultDoctorCards];
  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="News" subtitle="Updates across PakMed" onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        <div className="flex flex-col gap-2.5 mt-1">
          {all.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-4" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full" style={{ color: NAVY, backgroundColor: "#EAF0F8" }}>
                {c.eyebrow}
              </span>
              <p className="text-[14.5px] font-bold mt-2 leading-snug" style={{ color: INK }}>{c.title}</p>
              <p className="text-[12.5px] mt-1 leading-snug" style={{ color: "#4B4A45" }}>{c.body}</p>
              <div className="flex items-center gap-4 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <span className="flex items-center gap-1 text-[11.5px]" style={{ color: SUBTLE }}>
                  <Heart className="w-3.5 h-3.5" /> {c.likes}
                </span>
                <span className="flex items-center gap-1 text-[11.5px]" style={{ color: SUBTLE }}>
                  <MessageCircle className="w-3.5 h-3.5" /> {c.comments.length}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SimpleInfoScreen({ title, lines, onBack, onMenu }) {
  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title={title} onBack={onBack} onMenu={onMenu} />
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 py-5">
        <div className="rounded-2xl p-5 sm:p-6 auth-step" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
          <span className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: BRAND_50 }}>
            <Info className="w-5 h-5" style={{ color: BRAND }} />
          </span>
          {lines.map((l, i) => (
            <p key={i} className="text-[14.5px] leading-relaxed mb-3 last:mb-0" style={{ color: INK_2 }}>{l}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

function NavDrawer({ open, onClose, onNavigate, username, cvDoc, unreadCount, pendingReports, panels }) {
  const hasCV = !!(cvDoc && (cvDoc.uploaded || cvDoc.savedInApp));

  const panelItems = [];
  if (panels.doctor)   panelItems.push({ key: "physicianPanel", icon: Stethoscope, label: "Physician Panel" });
  if (panels.employer) panelItems.push({ key: "employerPanel",  icon: Briefcase,   label: "Employer Panel" });
  if (panels.seller)   panelItems.push({ key: "seller",         icon: Store,       label: "Business Panel" });

  const groups = [
    ...(panelItems.length ? [{ label: "Your panels", items: panelItems }] : []),
    {
      label: "Browse",
      items: [
        { key: "home",     icon: Home,              label: "Home" },
        { key: "news",     icon: Newspaper,         label: "News" },
        { key: "postjob",  icon: Briefcase,         label: "Post a Job" },
        { key: "findjob",  icon: Search,            label: "Find a Job" },
        { key: "consult",  icon: Stethoscope,       label: "Find a Doctor" },
        { key: "market",   icon: Store,             label: "Buy / Sell" },
        { key: "hospital", icon: Building2,         label: "Find Hospital" },
        { key: "updates",  icon: Newspaper,         label: "Our Feeds" },
        { key: "myjobs",   icon: Bookmark,          label: "My Jobs" },
        { key: "messages", icon: MessageSquareText, label: "Messages", badge: unreadCount },
      ],
    },
    {
      label: "Your account",
      items: [
        { key: "profileDetail", icon: UserRound, label: "Profile" },
        { key: "cv",            icon: FileText,  label: "CV / Resume", tag: hasCV ? "Active" : "Missing", tagOk: hasCV },
        { key: "verification",  icon: Shield,    label: "Verification" },
        { key: "moderation",    icon: Flag,      label: "Reported Content", badge: pendingReports },
      ],
    },
    {
      label: "App",
      items: [
        { key: "settings", icon: Settings,   label: "Settings" },
        { key: "language", icon: Globe,      label: "Language" },
        { key: "help",     icon: HelpCircle, label: "Help & Support" },
        { key: "about",    icon: Info,       label: "About PakMed" },
        { key: "privacy",  icon: Shield,     label: "Privacy Policy", href: "/privacy" },
        { key: "terms",    icon: FileText,   label: "Terms of Use", href: "/terms" },
      ],
    },
  ];

  return (
    <>
      {/* scrim */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-200"
        style={{
          backgroundColor: "rgba(0,0,0,0.45)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      {/* drawer */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col transition-transform duration-250 ease-out"
        style={{
          width: "78%",
          maxWidth: 300,
          backgroundColor: "#14161A",
          transform: open ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        {/* header */}
        <div className="px-4 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid #2A2E36" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[13px] font-bold tracking-widest uppercase text-white/60">Navigation</p>
            <button onClick={onClose} aria-label="Close menu"><X className="w-5 h-5 text-white/60" /></button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0" style={{ backgroundColor: NAVY }}>
              AK
            </div>
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-white truncate">Dr. Awais Khan</p>
              <p className="text-[11.5px] text-white/50 truncate">@{username}</p>
            </div>
          </div>
        </div>

        {/* links */}
        <div className="flex-1 min-h-0 overflow-y-auto py-2">
          {groups.map((g) => (
            <div key={g.label} className="mb-1">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-white/35 px-4 pt-3 pb-1.5">{g.label}</p>
              {g.items.map((it) => (
                <button
                  key={it.key}
                  onClick={() => {
                    if (it.href) {
                      onClose();
                      window.location.href = it.href;
                      return;
                    }
                    onNavigate(it.key);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3.5 px-4 py-3 active:bg-white/10 transition-colors"
                >
                  <it.icon className="w-5 h-5 shrink-0 text-white/75" strokeWidth={1.9} />
                  <span className="flex-1 text-left text-[15px] text-white/90">{it.label}</span>
                  {it.badge > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: RED, color: "white" }}>
                      {it.badge}
                    </span>
                  )}
                  {it.tag && (
                    <span
                      className="text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full"
                      style={{ color: it.tagOk ? "#7BE0A6" : "#FF9AA2", backgroundColor: it.tagOk ? "#7BE0A622" : "#FF9AA222" }}
                    >
                      {it.tag}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 shrink-0 text-white/30" />
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="px-4 py-3 shrink-0" style={{ borderTop: "1px solid #2A2E36" }}>
          <button
            onClick={() => { onNavigate("signout"); onClose(); }}
            className="w-full flex items-center gap-3 py-2.5 active:opacity-70"
          >
            <LogOut className="w-5 h-5 shrink-0" style={{ color: "#FF9AA2" }} strokeWidth={1.9} />
            <span className="text-[14px] font-medium" style={{ color: "#FF9AA2" }}>Sign out</span>
          </button>
          <p className="text-[10px] text-white/30 mt-1">PakMed · Prototype v0.9</p>
        </div>
      </div>
    </>
  );
}

function BottomNav({ activeTab, onNavigate }) {
  return (
    <div className="px-1 pt-0 pb-2 flex items-stretch justify-between bg-white shrink-0" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
      {[
        { key: "home", icon: Home, label: "Home" },
        { key: "market", icon: Store, label: "Buy / Sell" },
        { key: "messages", icon: MessageSquareText, label: "Messages" },
        { key: "saved", icon: Bookmark, label: "Saved" },
        { key: "profile", icon: UserRound, label: "Profile" },
      ].map(({ key, icon: Icon, label }) => {
        const active = activeTab === key;
        return (
          <button key={key} onClick={() => onNavigate(key)} className="flex-1 flex flex-col items-center gap-1 pt-2.5 pb-1 relative">
            {active && <span className="absolute top-0 left-2 right-2 h-[3px] rounded-full" style={{ backgroundColor: NAVY }} />}
            <Icon className="w-6 h-6" style={{ color: active ? NAVY : "#5F6470" }} strokeWidth={2} fill={active ? NAVY : "none"} />
            <span className="text-[10.5px]" style={{ color: active ? NAVY : "#5F6470", fontWeight: active ? 700 : 500 }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

function BrandMark({ size = 30, onClick }) {
  const inner = (
    <>
      <div className="flex items-center justify-center shrink-0"
        style={{ width: size, height: size, borderRadius: size * 0.3, backgroundColor: BRAND }}>
        <svg viewBox="0 0 24 24" width={size * 0.56} height={size * 0.56} fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <span className="font-extrabold leading-none" style={{ fontSize: size * 0.63, letterSpacing: "-0.035em", color: INK }}>
        Pak<span style={{ color: BRAND }}>Med</span>
      </span>
    </>
  );
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className="flex items-center gap-2" aria-label="PakMed home">
        {inner}
      </button>
    );
  }
  return <div className="flex items-center gap-2">{inner}</div>;
}

function SiteHeader({
  activeTab,
  onHome,
  onTabNav,
  onMenu,
  authed,
  onSignIn,
  onSignUp,
  onOpenProfile,
  onOpenAccount,
  onSignOut,
  userInitials,
  username,
  userEmail,
  userPhone,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setProfileOpen(false); }, [activeTab]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onDoc = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setProfileOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [profileOpen]);

  const links = [
    { id: "home", label: "Home", run: onHome },
    { id: "find", label: "Find a Job", run: () => onTabNav("find") },
    { id: "consult", label: "Find a Doctor", run: () => onTabNav("consult") },
    { id: "post", label: "Offer a Job", run: () => onTabNav("post") },
    { id: "market", label: "Buy / Sell", run: () => onTabNav("market") },
    { id: "hospital", label: "Find Hospital", run: () => onTabNav("hospital") },
    { id: "feeds", label: "Our Feeds", run: () => onTabNav("feeds") },
  ];
  const activeLink =
    activeTab === "home" ? "home"
    : activeTab === "findjob" ? "find"
    : activeTab === "consult" ? "consult"
    : activeTab === "postjob" ? "post"
    : activeTab === "market" ? "market"
    : activeTab === "hospital" ? "hospital"
    : activeTab === "updates" || activeTab === "feed" || activeTab === "news" ? "feeds"
    : "";
  const go = (fn) => () => { setMobileOpen(false); fn && fn(); };

  return (
    <header
      className="sticky top-0 z-40 transition-shadow duration-300"
      style={{
        fontFamily: FONT,
        backgroundColor: "rgba(255,255,255,0.92)",
        backdropFilter: "saturate(180%) blur(12px)",
        WebkitBackdropFilter: "saturate(180%) blur(12px)",
        borderBottom: `1px solid ${scrolled || mobileOpen ? CARD_BORDER : "transparent"}`,
        boxShadow: scrolled ? "0 4px 20px -10px rgba(16,24,40,0.15)" : "none",
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-6 h-[68px]">
          <BrandMark size={32} onClick={onHome} />

          <nav className="hidden lg:flex items-center gap-1 min-w-0" aria-label="Main">
            {links.map((l) => {
              const on = activeLink === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={l.run}
                  className="nav-link relative px-3 py-2 text-[14px] whitespace-nowrap transition-colors hover:text-[#0B57B7]"
                  style={{ color: on ? BRAND : INK_2, fontWeight: on ? 700 : 550 }}
                  aria-current={on ? "page" : undefined}
                >
                  {l.label}
                  <span
                    className="absolute left-3 right-3 -bottom-[3px] h-[2.5px] rounded-full transition-transform duration-300 origin-center"
                    style={{ backgroundColor: BRAND, transform: on ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            {authed ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-2 h-10 pl-1.5 pr-2.5 rounded-full transition-colors hover:bg-[#EAF2FC]"
                  style={{ border: `1px solid ${profileOpen ? "#B9D3F2" : CARD_BORDER}` }}
                  aria-label="Profile menu"
                  aria-expanded={profileOpen}
                >
                  <span className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ backgroundColor: BRAND }}>
                    {userInitials || "U"}
                  </span>
                  <span className="hidden sm:block text-[13.5px] font-bold max-w-[110px] truncate" style={{ color: INK }}>
                    {username ? `@${username}` : "Profile"}
                  </span>
                  <ChevronDown className="w-4 h-4 transition-transform" style={{ color: SUBTLE, transform: profileOpen ? "rotate(180deg)" : "none" }} />
                </button>
                {profileOpen && (
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] w-[280px] rounded-2xl bg-white overflow-hidden z-50"
                    style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 16px 40px -12px rgba(16,24,40,0.28)" }}
                  >
                    <div className="px-4 py-3.5" style={{ backgroundColor: BRAND_50 }}>
                      <div className="flex items-center gap-3">
                        <span className="w-11 h-11 rounded-full flex items-center justify-center text-[14px] font-bold text-white shrink-0" style={{ backgroundColor: BRAND }}>
                          {userInitials || "U"}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[14.5px] font-bold truncate" style={{ color: INK }}>{username ? `@${username}` : "Your profile"}</p>
                          {userEmail && <p className="text-[12.5px] truncate" style={{ color: SUBTLE }}>{userEmail}</p>}
                          {userPhone && <p className="text-[12px] truncate" style={{ color: FAINT }}>+92 {userPhone}</p>}
                        </div>
                      </div>
                    </div>
                    <div className="py-1.5">
                      <button
                        type="button"
                        onClick={() => { setProfileOpen(false); onOpenProfile && onOpenProfile(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F5F7FA]"
                      >
                        <UserRound className="w-[18px] h-[18px]" style={{ color: BRAND }} />
                        <span className="text-[14px] font-semibold" style={{ color: INK }}>Profile hub</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setProfileOpen(false); onOpenAccount && onOpenAccount(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#F5F7FA]"
                      >
                        <Settings className="w-[18px] h-[18px]" style={{ color: BRAND }} />
                        <span className="text-[14px] font-semibold" style={{ color: INK }}>Profile details</span>
                      </button>
                    </div>
                    <div className="py-1.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                      <button
                        type="button"
                        onClick={() => { setProfileOpen(false); onSignOut && onSignOut(); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-[#FDECEC]"
                      >
                        <LogOut className="w-[18px] h-[18px]" style={{ color: RED }} />
                        <span className="text-[14px] font-semibold" style={{ color: RED }}>Log out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button type="button" onClick={onSignIn}
                  className="hidden sm:inline-flex items-center h-10 px-4 rounded-xl text-[14px] font-bold transition-colors hover:bg-[#EAF2FC]"
                  style={{ color: INK }}>
                  Sign in
                </button>
                <button type="button" onClick={onSignIn}
                  className="sm:hidden inline-flex items-center h-10 px-4 rounded-xl text-[14px] font-bold text-white"
                  style={{ backgroundColor: BRAND }}>
                  Sign in
                </button>
                <button type="button" onClick={onSignUp}
                  className="hidden sm:inline-flex items-center h-10 px-5 rounded-xl text-[14px] font-bold text-white transition-all hover:brightness-110"
                  style={{ backgroundColor: BRAND, boxShadow: "0 6px 16px -6px rgba(11,87,183,0.55)" }}>
                  Get started
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ border: `1px solid ${CARD_BORDER}`, backgroundColor: mobileOpen ? BRAND_50 : "#fff" }}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" style={{ color: INK }} /> : <Menu className="w-5 h-5" style={{ color: INK }} />}
            </button>
          </div>
        </div>
      </div>

      {/* mobile menu */}
      <div className="lg:hidden grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: mobileOpen ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 pb-4 pt-1" aria-label="Mobile">
            {links.map((l) => {
              const on = activeLink === l.id;
              return (
                <button key={l.id} type="button" onClick={go(l.run)}
                  className="w-full flex items-center justify-between h-12 px-3 rounded-xl text-[15px] text-left"
                  style={{ color: on ? BRAND : INK, fontWeight: on ? 700 : 600, backgroundColor: on ? BRAND_50 : "transparent" }}>
                  {l.label}
                  <ChevronRight className="w-4 h-4" style={{ color: on ? BRAND : FAINT }} />
                </button>
              );
            })}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <button type="button" onClick={go(onMenu)} className="h-11 rounded-xl text-[14px] font-bold" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                More options
              </button>
              {authed ? (
                <button type="button" onClick={go(onOpenProfile)} className="h-11 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>
                  My profile
                </button>
              ) : (
                <button type="button" onClick={go(onSignUp)} className="h-11 rounded-xl text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>
                  Create account
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}

const LANDING_IMG = "/images/landing";

const HERO_SLIDES = [
  { src: `${LANDING_IMG}/hero-4.jpg`, alt: "Smiling doctor in scrubs with a stethoscope" },
  { src: `${LANDING_IMG}/hero-3.jpg`, alt: "Female doctor in a white coat with a stethoscope" },
];

function HeroSlideshow({ interval = 3500 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = HERO_SLIDES.length;

  useEffect(() => {
    if (paused || len < 2) return undefined;
    const t = setInterval(() => {
      setActive((i) => (i + 1) % len);
    }, interval);
    return () => clearInterval(t);
  }, [paused, interval, len]);

  return (
    <div
      className="relative w-full aspect-[4/4.4] rounded-[28px] overflow-hidden"
      style={{ boxShadow: "0 30px 60px -20px rgba(11,87,183,0.35)", backgroundColor: BRAND_50 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {HERO_SLIDES.map((s, i) => (
        <img
          key={s.src}
          src={s.src}
          alt={s.alt}
          fetchPriority={i === 0 ? "high" : undefined}
          loading={i === 0 ? "eager" : "eager"}
          decoding="async"
          aria-hidden={i !== active}
          className={`hero-slide absolute inset-0 w-full h-full object-cover ${i === active ? "is-active" : ""}`}
          style={{ zIndex: i === active ? 2 : 1 }}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none z-[3]" style={{ background: "linear-gradient(180deg, transparent, rgba(16,24,40,0.35))" }} />
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[4]">
        {HERO_SLIDES.map((s, i) => (
          <button
            key={s.src}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            className="h-1.5 rounded-full transition-all duration-500"
            style={{ width: i === active ? 22 : 8, backgroundColor: i === active ? "#fff" : "rgba(255,255,255,0.55)" }}
          />
        ))}
      </div>
    </div>
  );
}

const SERVICE_IMAGES = {
  find: `${LANDING_IMG}/find-job.jpg`,
  consult: `${LANDING_IMG}/find-doctor.jpg`,
  post: `${LANDING_IMG}/offer-job.jpg`,
  market: `${LANDING_IMG}/market.jpg`,
  hospital: `${LANDING_IMG}/hospital.jpg`,
  feeds: `${LANDING_IMG}/post-verified.jpg`,
};

const SERVICE_BLURBS = {
  find: "Permanent, locum, part-time and emergency roles at verified facilities.",
  consult: "PMDC-verified doctors by specialty, city and availability.",
  post: "Hire doctors, nurses and allied staff — your first listing is free.",
  market: "New and refurbished biomedical equipment from trusted sellers.",
  hospital: "Hospitals, clinics, labs and pharmacies near you.",
  feeds: "Browse verified news and updates posted by the PakMed team.",
};

const HOW_IT_WORKS = {
  professionals: [
    { icon: UserRound, title: "Create your profile", body: "Add your qualifications, specialty and PMDC / PNC registration once." },
    { icon: ShieldCheck, title: "Get verified", body: "Our team reviews your documents so employers know you're genuine." },
    { icon: Briefcase, title: "Apply in one tap", body: "Send your CV to matching roles and track every application." },
  ],
  facilities: [
    { icon: Building2, title: "Register your facility", body: "Hospitals, clinics, labs and pharmacies set up in minutes." },
    { icon: Plus, title: "Post a job", body: "Choose shift, salary and requirements — publish instantly." },
    { icon: Users, title: "Hire verified staff", body: "Review applicants, view CVs and message candidates directly." },
  ],
};

const WHY_PAKMED = [
  { icon: ShieldCheck, title: "Verified professionals", body: "Doctors and staff are checked against PMDC, PNC and council records." },
  { icon: MessageSquareText, title: "Direct messaging", body: "Talk to employers, doctors and sellers without middlemen." },
  { icon: MapPin, title: "City-first results", body: "Opportunities and services nearest to you, across every major city." },
  { icon: Flag, title: "Safe & moderated", body: "Report anything suspicious — our team reviews every report." },
];

const TESTIMONIALS = [
  { name: "Dr. Ayesha Siddiqui", role: "Medical Officer, Karachi", img: "avatar-1", text: "I found a locum emergency shift within a day. Payment was on time and the whole process was transparent." },
  { name: "Dr. Bilal Ahmed", role: "Medical Director, Rehman Medical Centre, Multan", img: "avatar-2", text: "Our first free listing brought in fourteen applicants — most of them already verified. Hiring has never been this quick." },
  { name: "Hina R.", role: "Patient, Lahore", img: "avatar-3", text: "Booked a verified paediatrician for my son the same afternoon. Clear fees, clear timings, no guesswork." },
  { name: "Dr. Sara Malik", role: "Consultant Cardiologist, Islamabad", img: "avatar-1", text: "PakMed cut our hiring cycle from weeks to days. The applicant quality is consistently high." },
  { name: "Nurse Fatima Noor", role: "ICU Nurse, Faisalabad", img: "avatar-3", text: "I applied to three night shifts on my phone and got two responses the same evening. Simple and fair." },
  { name: "Kamran Hussain", role: "Pharmacy Owner, Peshawar", img: "avatar-2", text: "We filled a pharmacist role in under a week. Clear salaries and shifts meant fewer mismatched applications." },
];

const HOME_FAQS = [
  { q: "Is PakMed free to use?", a: "Browsing jobs, doctors, hospitals and the market is completely free. Creating a profile and applying for jobs is free too. Facilities get their first job listing free each month." },
  { q: "How does doctor verification work?", a: "Upload your PMDC (or PNC / council) registration, CNIC and degree. Our team cross-checks the documents and adds a verified badge to your profile, usually within 24–48 hours." },
  { q: "Do I need an account to browse?", a: "No. You can explore everything freely. We only ask you to sign in when you want to apply, message, save or post." },
  { q: "How do hospitals post a job?", a: "Sign in, complete a short employer profile, then use “Offer a Job” to choose the role, shift, salary and requirements. Your listing goes live immediately." },
  { q: "Can I buy or sell medical equipment?", a: "Yes. The Market lets verified sellers list new, used and refurbished biomedical equipment, and buyers can message sellers directly." },
  { q: "Is my personal information safe?", a: "Employer names and contact details are only shown to signed-in users, and you control what appears on your public profile. You can report any suspicious listing at any time." },
];

const POPULAR_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta"];

function SectionHeading({ eyebrow, title, sub, center, action }) {
  return (
    <div data-reveal className={`flex ${center ? "flex-col items-center text-center" : "items-end justify-between"} gap-4 mb-6 sm:mb-8`}>
      <div className={center ? "max-w-2xl" : "min-w-0"}>
        {eyebrow && (
          <p className="text-[12px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: BRAND }}>{eyebrow}</p>
        )}
        <h2 className="text-[24px] sm:text-[30px] font-extrabold tracking-[-0.03em] leading-tight" style={{ color: INK }}>{title}</h2>
        {sub && <p className="text-[14.5px] sm:text-[15.5px] mt-2 leading-relaxed" style={{ color: SUBTLE }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div className="rounded-2xl bg-white transition-colors duration-300" style={{ border: `1px solid ${open ? "#B9D3F2" : CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="w-full flex items-center gap-4 px-5 py-4 text-left">
        <span className="flex-1 text-[15px] sm:text-[16px] font-bold" style={{ color: INK }}>{q}</span>
        <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200"
          style={{ backgroundColor: open ? BRAND : BRAND_50, transform: open ? "rotate(180deg)" : "none" }}>
          <ChevronDown className="w-4 h-4" style={{ color: open ? "#fff" : BRAND }} />
        </span>
      </button>
      <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: open ? "1fr" : "0fr" }}>
        <div className="overflow-hidden">
          <p className="px-5 pb-5 text-[14.5px] leading-relaxed" style={{ color: SUBTLE }}>{a}</p>
        </div>
      </div>
    </div>
  );
}

function SiteFooter({ onTabNav, onNavigate, onHome }) {
  const cols = [
    {
      title: "For Professionals",
      links: [
        { label: "Find a Job", run: () => onTabNav("find") },
        { label: "Build your CV", run: () => onNavigate && onNavigate("cv") },
        { label: "Get verified", run: () => onNavigate && onNavigate("profileDetail") },
        { label: "Saved jobs", run: () => onNavigate && onNavigate("saved") },
      ],
    },
    {
      title: "For Facilities",
      links: [
        { label: "Offer a Job", run: () => onTabNav("post") },
        { label: "Find a Hospital", run: () => onTabNav("hospital") },
        { label: "Sell equipment", run: () => onTabNav("market") },
      ],
    },
    {
      title: "For Patients",
      links: [
        { label: "Find a Doctor", run: () => onTabNav("consult") },
        { label: "Hospitals & labs", run: () => onTabNav("hospital") },
        { label: "Medical news", run: () => onNavigate && onNavigate("news") },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About PakMed", run: () => onNavigate && onNavigate("about") },
        { label: "Help & Support", run: () => onNavigate && onNavigate("help") },
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Use", href: "/terms" },
      ],
    },
  ];

  return (
    <footer style={{ backgroundColor: "#0B1A33", fontFamily: FONT }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-6 gap-y-10">
          <div className="col-span-2">
            <button type="button" onClick={onHome} className="flex items-center gap-2" aria-label="PakMed home">
              <span className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ backgroundColor: BRAND }}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
              </span>
              <span className="text-[22px] font-extrabold tracking-[-0.035em] text-white">Pak<span style={{ color: "#7DB3F5" }}>Med</span></span>
            </button>
            <p className="text-[14px] leading-relaxed mt-4 max-w-xs" style={{ color: "#A9B4C7" }}>
              Pakistan's healthcare network — connecting verified doctors, hospitals, patients and suppliers in one trusted place.
            </p>
            <div className="mt-5 space-y-2.5">
              <a href="mailto:support@pakmed.pk" className="flex items-center gap-2.5 text-[13.5px] hover:text-white" style={{ color: "#C9D2E0" }}>
                <Mail className="w-4 h-4 shrink-0" style={{ color: "#7DB3F5" }} /> support@pakmed.pk
              </a>
              <a href="tel:+92211234567" className="flex items-center gap-2.5 text-[13.5px] hover:text-white" style={{ color: "#C9D2E0" }}>
                <Phone className="w-4 h-4 shrink-0" style={{ color: "#7DB3F5" }} /> +92 21 1234 567
              </a>
              <p className="flex items-center gap-2.5 text-[13.5px]" style={{ color: "#C9D2E0" }}>
                <MapPin className="w-4 h-4 shrink-0" style={{ color: "#7DB3F5" }} /> Karachi · Lahore · Islamabad
              </p>
            </div>
          </div>
          {cols.map((c) => (
            <div key={c.title} className="min-w-0">
              <p className="text-[13px] font-bold uppercase tracking-[0.08em] mb-4 text-white">{c.title}</p>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    {l.href ? (
                      <a href={l.href} className="text-[14px] transition-colors hover:text-white" style={{ color: "#A9B4C7" }}>
                        {l.label}
                      </a>
                    ) : (
                      <button type="button" onClick={l.run} className="text-[14px] text-left transition-colors hover:text-white" style={{ color: "#A9B4C7" }}>
                        {l.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <p className="text-[13px]" style={{ color: "#8592A8" }}>© {new Date().getFullYear()} PakMed. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px]" style={{ color: "#8592A8" }}>
            <a href="/privacy" className="hover:text-white">Privacy Policy</a>
            <a href="/terms" className="hover:text-white">Terms of Use</a>
            <button type="button" onClick={() => onNavigate && onNavigate("help")} className="hover:text-white">Contact</button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function PostTile({ card, onOpen }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group w-full h-full text-left rounded-2xl overflow-hidden bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
    >
      <div className="relative aspect-[4/3] overflow-hidden" style={{ background: card.media.kind === "gradient" ? card.media.g : CARD_BORDER }}>
        {card.media.kind === "image" && (
          <img src={card.media.src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
        <span className="absolute left-3 top-3 text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/95" style={{ color: BRAND }}>
          {card.eyebrow}
        </span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-[12px] mb-1.5 truncate" style={{ color: FAINT }}>
          <span className="font-semibold" style={{ color: SUBTLE }}>{card.author}</span> · {card.time} ago
        </p>
        <p className="text-[15.5px] font-bold leading-snug line-clamp-2" style={{ color: INK, letterSpacing: "-0.01em" }}>{card.title}</p>
        <p className="text-[13px] mt-1.5 leading-relaxed line-clamp-2 flex-1" style={{ color: SUBTLE }}>{card.body}</p>
        <div className="flex items-center gap-4 mt-4 pt-3 text-[12.5px]" style={{ color: SUBTLE, borderTop: `1px solid ${CARD_BORDER}` }}>
          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {card.likes}</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {card.comments.length}</span>
          <span className="ml-auto flex items-center gap-1 font-bold" style={{ color: BRAND }}>
            Read <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </button>
  );
}

function TestimonialsCarousel() {
  const trackRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false, lastX: 0, lastT: 0, v: 0 });
  const settleRef = useRef(null);
  const [edge, setEdge] = useState({ prev: false, next: true });
  const [dragging, setDragging] = useState(false);
  const [settling, setSettling] = useState(false);
  useEffect(() => () => clearTimeout(settleRef.current), []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () => setEdge({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const cardStep = () => {
    const el = trackRef.current;
    if (!el) return 320;
    const card = el.querySelector("[data-carousel-card]");
    if (!card) return Math.max(el.clientWidth * 0.34, 280);
    const style = window.getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
    return card.getBoundingClientRect().width + gap;
  };

  const slide = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * cardStep(), behavior: "smooth" });
  };

  // mouse drag only — touch uses native swipe scrolling
  const onPointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    clearTimeout(settleRef.current);
    const now = performance.now();
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false, lastX: e.clientX, lastT: now, v: 0 };
    setDragging(true);
    setSettling(true);
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    const now = performance.now();
    const dt = Math.max(1, now - d.lastT);
    d.v = 0.8 * ((e.clientX - d.lastX) / dt) + 0.2 * d.v; // smoothed px/ms
    d.lastX = e.clientX;
    d.lastT = now;
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e) => {
    const d = dragRef.current;
    const el = trackRef.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    if (!el) return;
    try { el.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    // glide with a bit of momentum, then settle on the nearest card
    const step = cardStep();
    const max = el.scrollWidth - el.clientWidth;
    const projected = el.scrollLeft - d.v * 220;
    const target = Math.max(0, Math.min(max, Math.round(projected / step) * step));
    el.scrollTo({ left: target, behavior: "smooth" });
    settleRef.current = setTimeout(() => setSettling(false), 550);
  };

  const arrowBtn = (dir, enabled, Icon, label) => (
    <button
      type="button"
      onClick={() => slide(dir)}
      disabled={!enabled}
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-all duration-200 enabled:hover:shadow-md disabled:opacity-40"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <Icon className="w-5 h-5" style={{ color: INK }} />
    </button>
  );

  return (
    <div>
      <SectionHeading
        center
        eyebrow="Testimonials"
        title="Loved by doctors, hospitals and patients"
        sub="Drag or use the arrows to read more reviews."
        action={
          <div className="flex items-center gap-2 shrink-0">
            {arrowBtn(-1, edge.prev, ChevronLeft, "Previous reviews")}
            {arrowBtn(1, edge.next, ChevronRight, "Next reviews")}
          </div>
        }
      />
      <div
        ref={trackRef}
        data-reveal
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDragStart={(e) => e.preventDefault()}
        className={`flex gap-4 overflow-x-auto pb-3 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 select-none ${settling ? "" : "snap-x snap-mandatory"} ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-x pan-y", overscrollBehaviorX: "contain" }}
      >
        {TESTIMONIALS.map((t) => (
          <figure
            key={`${t.name}-${t.role}`}
            data-carousel-card
            className="snap-start shrink-0 w-[85%] sm:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)] rounded-2xl p-6 bg-white flex flex-col"
            style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
          >
            <div className="flex gap-0.5 mb-3">
              {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4" style={{ color: STAR }} fill={STAR} />)}
            </div>
            <blockquote className="text-[15px] leading-relaxed flex-1" style={{ color: INK_2 }}>“{t.text}”</blockquote>
            <figcaption className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <img src={`${LANDING_IMG}/${t.img}.jpg`} alt={t.name} loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-cover shrink-0 pointer-events-none" style={{ border: `2px solid ${BRAND_50}` }} />
              <div className="min-w-0">
                <p className="text-[14px] font-bold truncate" style={{ color: INK }}>{t.name}</p>
                <p className="text-[12.5px] truncate" style={{ color: SUBTLE }}>{t.role}</p>
              </div>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function LatestPostsCarousel({ onOpenCard, onSeeMore }) {
  const trackRef = useRef(null);
  const dragRef = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [edge, setEdge] = useState({ prev: false, next: true });
  const [dragging, setDragging] = useState(false);
  const posts = LATEST_POSTS;

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const update = () => setEdge({
      prev: el.scrollLeft > 4,
      next: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [posts.length]);

  const cardStep = () => {
    const el = trackRef.current;
    if (!el) return 280;
    const card = el.querySelector("[data-carousel-card]");
    if (!card) return Math.max(el.clientWidth * 0.22, 220);
    const style = window.getComputedStyle(el);
    const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
    return card.getBoundingClientRect().width + gap;
  };

  const slide = (dir) => {
    const el = trackRef.current;
    if (el) el.scrollBy({ left: dir * cardStep(), behavior: "smooth" });
  };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const el = trackRef.current;
    if (!el) return;
    dragRef.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    setDragging(true);
    try { el.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    const el = trackRef.current;
    if (!d.active || !el) return;
    const dx = e.clientX - d.startX;
    if (Math.abs(dx) > 4) d.moved = true;
    el.scrollLeft = d.startScroll - dx;
  };

  const endDrag = (e) => {
    const d = dragRef.current;
    const el = trackRef.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    if (el) {
      try { el.releasePointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    }
  };

  const arrowBtn = (dir, enabled, Icon, label) => (
    <button
      type="button"
      onClick={() => slide(dir)}
      disabled={!enabled}
      aria-label={label}
      className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-all duration-200 enabled:hover:shadow-md disabled:opacity-40"
      style={{ border: `1px solid ${CARD_BORDER}` }}
    >
      <Icon className="w-5 h-5" style={{ color: INK }} />
    </button>
  );

  return (
    <div>
      <SectionHeading
        eyebrow="News & updates"
        title="Latest on PakMed"
        sub="Verified updates from the PakMed team. Drag or use arrows to browse."
        action={
          <div className="hidden sm:flex items-center gap-2 shrink-0">
            {arrowBtn(-1, edge.prev, ChevronLeft, "Previous posts")}
            {arrowBtn(1, edge.next, ChevronRight, "Next posts")}
            <button type="button" onClick={onSeeMore} className="ml-1 h-10 px-4 rounded-xl text-[14px] font-bold inline-flex items-center gap-1.5" style={{ color: BRAND, backgroundColor: BRAND_50 }}>
              See more <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        }
      />
      <div
        ref={trackRef}
        data-reveal
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className={`flex gap-4 overflow-x-auto snap-x snap-mandatory pb-3 -mx-4 px-4 scroll-px-4 sm:mx-0 sm:px-0 sm:scroll-px-0 select-none ${dragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={{ scrollbarWidth: "none", WebkitOverflowScrolling: "touch", touchAction: "pan-y" }}
      >
        {posts.map((c) => (
          <div
            key={c.id}
            data-carousel-card
            className="snap-start shrink-0 w-[78%] sm:w-[calc((100%-16px)/2)] md:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] xl:w-[calc((100%-48px)/4)]"
          >
            <PostTile
              card={c}
              onOpen={() => {
                if (dragRef.current.moved) return;
                onOpenCard(FEED_CARDS.indexOf(c));
              }}
            />
          </div>
        ))}
      </div>
      <button type="button" onClick={onSeeMore} className="sm:hidden mt-3 w-full h-12 rounded-xl text-[14px] font-bold inline-flex items-center justify-center gap-1.5" style={{ color: BRAND, backgroundColor: BRAND_50 }}>
        See all updates <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

function UpdatePost({ card, isNew, onOpen, focused }) {
  const gate = useContext(AuthGate);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <article id={`post-${card.id}`} className={`rounded-2xl overflow-hidden bg-white scroll-mt-24 transition-shadow duration-700 ${focused ? "post-focus" : ""}`}
      style={{ border: `1px solid ${focused ? BRAND : CARD_BORDER}`, boxShadow: focused ? "0 0 0 4px rgba(11,87,183,0.18), 0 12px 30px -12px rgba(11,87,183,0.35)" : SOFT_SHADOW }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: BRAND }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-bold truncate flex items-center gap-1" style={{ color: INK }}>
            {card.author} <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: BRAND }} />
          </p>
          <p className="text-[12px]" style={{ color: FAINT }}>{card.time} ago · {card.category}</p>
        </div>
        {isNew && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>New</span>
        )}
      </div>

      <button type="button" onClick={onOpen} className="group block w-full text-left">
        <div className="relative aspect-[16/10] overflow-hidden" style={{ background: card.media.kind === "gradient" ? card.media.g : CARD_BORDER }}>
          {card.media.kind === "image" && (
            <img src={card.media.src} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          )}
          <span className="absolute left-3 top-3 text-[10.5px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-white/95" style={{ color: BRAND }}>
            {card.eyebrow}
          </span>
        </div>
        <div className="px-4 pt-3.5">
          <p className="text-[17px] font-extrabold leading-snug tracking-[-0.01em]" style={{ color: INK }}>{card.title}</p>
          <p className="text-[14px] mt-1.5 leading-relaxed" style={{ color: INK_2 }}>{card.body}</p>
        </div>
      </button>

      <div className="flex items-center gap-1 px-2 py-2 mt-2" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
        <button type="button" onClick={() => gate.require("like posts", () => setLiked((v) => !v))}
          className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#F5F7FA]" style={{ color: liked ? RED : SUBTLE }}>
          <Heart className="w-[18px] h-[18px]" fill={liked ? RED : "none"} /> {card.likes + (liked ? 1 : 0)}
        </button>
        <button type="button" onClick={onOpen} className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#F5F7FA]" style={{ color: SUBTLE }}>
          <MessageCircle className="w-[18px] h-[18px]" /> {card.comments.length}
        </button>
        <button type="button" onClick={() => setShareOpen(true)} className="flex items-center gap-1.5 h-9 px-2.5 rounded-lg text-[13px] font-semibold hover:bg-[#F5F7FA]" style={{ color: SUBTLE }}>
          <Repeat2 className="w-[18px] h-[18px]" /> Share
        </button>
        <button type="button" onClick={() => gate.require("save posts", () => setSaved((v) => !v))} aria-label="Save post"
          className="ml-auto w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F5F7FA]">
          <Bookmark className="w-[18px] h-[18px]" style={{ color: saved ? BRAND : SUBTLE }} fill={saved ? BRAND : "none"} />
        </button>
      </div>
      {shareOpen && <ShareSheet card={card} onClose={() => setShareOpen(false)} />}
    </article>
  );
}

const UPDATE_CATEGORIES = ["All", "Jobs", "For Hospitals", "Doctors"];

function UpdatesScreen({ onBack, onMenu, onOpenCard, focusId }) {
  const [focused, setFocused] = useState(focusId || null);
  useEffect(() => {
    if (!focusId) return;
    const t1 = setTimeout(() => {
      const el = document.getElementById(`post-${focusId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 180);
    const t2 = setTimeout(() => setFocused(null), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [focusId]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const [sort, setSort] = useState("latest");

  const needle = q.trim().toLowerCase();
  const filtered = LATEST_POSTS.filter((c) =>
    (cat === "All" || c.category === cat) &&
    (!needle || `${c.title} ${c.body} ${c.eyebrow} ${c.author}`.toLowerCase().includes(needle))
  );
  const list = sort === "popular" ? [...filtered].sort((a, b) => b.likes - a.likes) : filtered;

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title="Latest on PakMed" subtitle="Verified updates from the PakMed team" onBack={onBack} onMenu={onMenu} />
      <div className="px-4 pt-3 pb-4 bg-white" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
        <label className="flex items-center gap-2.5 h-12 px-3.5 rounded-xl" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
          <Search className="w-[18px] h-[18px] shrink-0" style={{ color: FAINT }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search updates, jobs, doctors…"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
            style={{ color: INK }}
          />
          {q && (
            <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: CARD_BORDER }}>
              <X className="w-3.5 h-3.5" style={{ color: INK_2 }} />
            </button>
          )}
        </label>
        <div className="flex items-center gap-2 mt-3">
          <div className="flex gap-1.5 overflow-x-auto flex-1 min-w-0" style={{ scrollbarWidth: "none" }}>
            {UPDATE_CATEGORIES.map((c) => {
              const on = cat === c;
              return (
                <button key={c} type="button" onClick={() => setCat(c)}
                  className="h-9 px-3.5 rounded-full text-[13px] whitespace-nowrap shrink-0 transition-colors"
                  style={{ fontWeight: on ? 700 : 550, color: on ? "#fff" : INK_2, backgroundColor: on ? BRAND : CREAM, border: `1px solid ${on ? BRAND : CARD_BORDER}` }}>
                  {c}
                </button>
              );
            })}
          </div>
          <Dropdown
            label="Sort updates"
            size="sm"
            className="shrink-0"
            value={sort}
            onChange={setSort}
            options={[{ value: "latest", label: "Latest" }, { value: "popular", label: "Most liked" }]}
          />
        </div>
      </div>

      <div className="flex-1 px-4 py-4" style={{ backgroundColor: CREAM }}>
        <p className="text-[12.5px] font-semibold mb-3" style={{ color: SUBTLE }}>
          {list.length} {list.length === 1 ? "update" : "updates"}{needle ? ` for “${q.trim()}”` : ""}
        </p>
        {list.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-12 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <Search className="w-8 h-8 mx-auto mb-3" style={{ color: FAINT }} />
            <p className="text-[15px] font-bold" style={{ color: INK }}>No updates found</p>
            <p className="text-[13.5px] mt-1" style={{ color: SUBTLE }}>Try a different keyword or category.</p>
          </div>
        ) : (
          <div key={`${cat}-${sort}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 fade-list">
            {list.map((c, i) => (
              <UpdatePost
                key={c.id}
                card={c}
                isNew={sort === "latest" && i === 0 && postAgeHours(c.time) < 24}
                focused={focused === c.id}
                onOpen={() => onOpenCard(FEED_CARDS.indexOf(c))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- site-wide search with typo-tolerant suggestions ---------- */
function normText(s) {
  return String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

// Damerau–Levenshtein with an early exit once the distance passes `max`
function editDistance(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const rows = [];
  for (let i = 0; i <= a.length; i++) {
    rows[i] = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      if (i === 0) { rows[i][j] = j; continue; }
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, rows[i - 2][j - 2] + 1);
      rows[i][j] = v;
      if (v < rowMin) rowMin = v;
    }
    if (i > 0 && rowMin > max) return max + 1;
  }
  return rows[a.length][b.length];
}

function fuzzyScore(query, text) {
  const q = normText(query);
  const t = normText(text);
  if (!q || !t) return 0;
  if (t === q) return 100;
  if (t.startsWith(q)) return 92;
  if (t.includes(q)) return 84;
  const qWords = q.split(" ");
  const tWords = t.split(" ");
  let total = 0;
  for (const qw of qWords) {
    let best = 0;
    for (const tw of tWords) {
      if (tw.startsWith(qw)) { best = 1; break; }
      const allow = qw.length <= 2 ? 0 : qw.length <= 4 ? 1 : qw.length <= 7 ? 2 : 3;
      if (!allow) continue;
      const d = Math.min(editDistance(qw, tw, allow), editDistance(qw, tw.slice(0, qw.length), allow));
      if (d <= allow) best = Math.max(best, 1 - (d / (allow + 1)) * 0.6);
    }
    if (!best) return 0;
    total += best;
  }
  return Math.round(40 + 35 * (total / qWords.length));
}

const SEARCH_PAGES = [
  { label: "Find a Job", sub: "Browse healthcare jobs", keywords: "jobs job vacancy vacancies career hiring work employment naukri locum", icon: Search, color: BRAND, tint: BRAND_50, go: { section: "findjob" } },
  { label: "Find a Doctor", sub: "Verified doctors near you", keywords: "doctor doctors consult appointment physician specialist daktar", icon: Stethoscope, color: "#C0362C", tint: "#FDECEC", go: { section: "consult" } },
  { label: "Offer a Job", sub: "Post a vacancy for free", keywords: "post job hire hiring recruit employer vacancy staff", icon: Briefcase, color: "#12805C", tint: "#E7F5EF", go: { section: "postjob" } },
  { label: "Buy / Sell", sub: "Medical equipment market", keywords: "market buy sell equipment machine instruments surgical shop", icon: Store, color: "#5B47C7", tint: "#F1EDFC", go: { section: "market" } },
  { label: "Find a Hospital", sub: "Hospitals, clinics, labs and pharmacies", keywords: "hospital hospitals clinic lab laboratory pharmacy facility", icon: Building2, color: "#0E7C86", tint: "#E6F6F7", go: { section: "hospital" } },
  { label: "Our Feeds", sub: "News and updates from PakMed", keywords: "feed feeds news updates posts latest", icon: Newspaper, color: "#B54708", tint: "#FFF6E8", go: { section: "updates" } },
];

function buildSearchIndex() {
  const out = SEARCH_PAGES.map((p) => ({ ...p, type: "Page" }));
  const jobCounts = {};
  SEED_JOBS.forEach((j) => { jobCounts[j.jobTitle] = (jobCounts[j.jobTitle] || 0) + 1; });
  Object.entries(jobCounts).forEach(([t, n]) => out.push({
    type: "Job", label: `${t} jobs`, sub: `${n} open ${n === 1 ? "position" : "positions"}`, keywords: t,
    icon: Briefcase, color: BRAND, tint: BRAND_50, go: { section: "findjob", q: t },
  }));
  const specCounts = {};
  DOCTORS.forEach((d) => { specCounts[d.specialty] = (specCounts[d.specialty] || 0) + 1; });
  Object.entries(specCounts).forEach(([s, n]) => out.push({
    type: "Speciality", label: s, sub: `${n} ${n === 1 ? "doctor" : "doctors"}`, keywords: `${s} specialist`,
    icon: Stethoscope, color: "#C0362C", tint: "#FDECEC", go: { section: "consult", q: s },
  }));
  DOCTORS.forEach((d) => out.push({
    type: "Doctor", label: d.name, sub: `${d.specialty} · ${d.city}`, keywords: `${d.name} ${d.clinic}`,
    icon: UserRound, color: "#C0362C", tint: "#FDECEC", go: { section: "consult", q: d.name },
  }));
  SEED_FACILITIES.forEach((f) => out.push({
    type: "Hospital", label: f.name, sub: `${f.type} · ${f.city}`, keywords: `${f.name} ${f.type}`,
    icon: Building2, color: "#0E7C86", tint: "#E6F6F7", go: { section: "hospital", q: f.name },
  }));
  SEED_MARKET_ITEMS.forEach((m) => out.push({
    type: "Equipment", label: m.name, sub: `${m.condition || ""}${m.price ? ` · PKR ${m.price}` : ""}`, keywords: `${m.name} ${m.category || ""}`,
    icon: Store, color: "#5B47C7", tint: "#F1EDFC", go: { section: "market", q: m.name },
  }));
  return out;
}

function searchSite(index, query, limit = 8) {
  const q = normText(query);
  if (!q) return [];
  const scored = index
    .map((it) => ({ it, score: Math.max(fuzzyScore(q, it.label), Math.round(fuzzyScore(q, it.keywords) * 0.9)) + (it.type === "Page" ? 3 : 0) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score);
  const seen = new Set();
  const out = [];
  for (const r of scored) {
    const key = `${r.it.type}|${r.it.label}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(r.it);
    if (out.length >= limit) break;
  }
  return out;
}

function SiteSearch({ city, onGo, onSearchAll }) {
  const index = useRef(null);
  if (!index.current) index.current = buildSearchIndex();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const rootRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [open]);

  const results = q.trim() ? searchSite(index.current, q) : index.current.filter((it) => it.type === "Page");
  useEffect(() => { setHi(0); }, [q]);

  const go = (it) => { setOpen(false); setQ(""); onGo(it.go); };
  const submit = (e) => {
    if (e) e.preventDefault();
    if (results[hi] && q.trim()) return go(results[hi]);
    if (q.trim()) { setOpen(false); onSearchAll(q.trim()); return; }
    setOpen(true);
    inputRef.current && inputRef.current.focus();
  };
  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((i) => Math.min(results.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHi((i) => Math.max(0, i - 1)); }
    else if (e.key === "Escape") setOpen(false);
  };

  const highlight = (text) => {
    const nq = q.trim().toLowerCase();
    const i = nq ? text.toLowerCase().indexOf(nq) : -1;
    if (i < 0) return text;
    return <>{text.slice(0, i)}<b style={{ color: BRAND }}>{text.slice(i, i + nq.length)}</b>{text.slice(i + nq.length)}</>;
  };

  return (
    <div ref={rootRef} className="relative z-30 max-w-xl mb-6">
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 p-2 rounded-2xl bg-white" style={{ border: `1px solid ${open ? "#B9D3F2" : CARD_BORDER}`, boxShadow: "0 12px 32px -12px rgba(16,24,40,0.18)" }}>
        <label className="flex-1 min-w-0 flex items-center gap-3 h-12 px-3 rounded-xl">
          <Search className="w-5 h-5 shrink-0" style={{ color: open ? BRAND : FAINT }} />
          <span className="sr-only">Search PakMed</span>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            placeholder="Search jobs, doctors, hospitals…"
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            className="flex-1 min-w-0 bg-transparent outline-none text-[15px]"
            style={{ color: INK }}
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); inputRef.current && inputRef.current.focus(); }} aria-label="Clear search">
              <X className="w-4 h-4" style={{ color: FAINT }} />
            </button>
          )}
        </label>
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 h-12 px-3 rounded-xl text-[14px] font-semibold flex-1 sm:flex-none" style={{ color: INK_2, backgroundColor: CREAM }}>
            <MapPin className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
            <span className="truncate">{city || "Pakistan"}</span>
          </span>
          <button type="submit" className="h-12 px-5 rounded-xl text-[15px] font-bold text-white shrink-0" style={{ backgroundColor: BRAND }}>
            Search
          </button>
        </div>
      </form>

      {open && (
        <div className="dropdown-pop absolute left-0 right-0 top-full mt-2 rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 24px 50px -16px rgba(16,24,40,0.3)" }}>
          <p className="px-4 pt-3 pb-1.5 text-[11.5px] font-bold uppercase tracking-[0.08em]" style={{ color: FAINT }}>
            {q.trim() ? (results.length ? "Suggestions" : "No matches") : "Explore PakMed"}
          </p>
          {results.length === 0 ? (
            <div className="px-4 pb-4">
              <p className="text-[14px]" style={{ color: SUBTLE }}>Nothing found for “{q.trim()}”. Try another spelling or a broader word.</p>
              <button type="button" onClick={() => { setOpen(false); onSearchAll(q.trim()); }} className="mt-3 h-10 px-4 rounded-xl text-[13.5px] font-bold" style={{ color: BRAND, backgroundColor: BRAND_50 }}>
                Search everything for “{q.trim()}”
              </button>
            </div>
          ) : (
            <ul role="listbox" className="max-h-[360px] overflow-y-auto px-1.5 pb-1.5">
              {results.map((it, i) => (
                <li key={`${it.type}-${it.label}`} role="option" aria-selected={i === hi}
                  onMouseEnter={() => setHi(i)}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => go(it)}
                  className="flex items-center gap-3 px-2.5 py-2 rounded-xl cursor-pointer transition-colors"
                  style={{ backgroundColor: i === hi ? CREAM : "transparent" }}>
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: it.tint }}>
                    <it.icon className="w-5 h-5" style={{ color: it.color }} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[14.5px] font-semibold truncate" style={{ color: INK }}>{highlight(it.label)}</span>
                    <span className="block text-[12.5px] truncate" style={{ color: SUBTLE }}>{it.sub}</span>
                  </span>
                  <span className="hidden sm:inline text-[11px] font-bold px-2 py-0.5 rounded-md shrink-0" style={{ color: it.color, backgroundColor: it.tint }}>{it.type}</span>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{ color: i === hi ? BRAND : FAINT }} />
                </li>
              ))}
            </ul>
          )}
          {q.trim() && results.length > 0 && (
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen(false); onSearchAll(q.trim()); }}
              className="w-full flex items-center justify-between px-4 h-11 text-[13.5px] font-bold" style={{ color: BRAND, borderTop: `1px solid ${CARD_BORDER}` }}>
              See all results for “{q.trim()}” <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function HomeScreen({ onTabNav, onOpenCard, authed, city, counts = {}, nearJobs = [], onOpenJob, onSearch, onNavigate, onHome, onSeeAllPosts, onGo }) {
  const countFor = (k) => (counts[k] !== undefined ? counts[k] : "");
  const [audience, setAudience] = useState("professionals");
  const [openFaq, setOpenFaq] = useState(0);
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const els = Array.from(root.querySelectorAll("[data-reveal]"));
    const reveal = (el) => {
      el.classList.remove("reveal-pending");
      el.classList.add("is-visible");
    };

    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(reveal);
      return undefined;
    }

    // Enable hide-until-visible only after mount, then reveal in-view items immediately
    els.forEach((el) => {
      if (!el.classList.contains("is-visible")) el.classList.add("reveal-pending");
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            reveal(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px 15% 0px", threshold: 0.01 }
    );

    els.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120) reveal(el);
      else io.observe(el);
    });

    // Safety net: never leave sections blank
    const fallback = window.setTimeout(() => {
      els.forEach((el) => {
        if (!el.classList.contains("is-visible")) reveal(el);
      });
    }, 1200);

    return () => {
      window.clearTimeout(fallback);
      io.disconnect();
    };
  }, [nearJobs.length]);

  const stats = [
    { value: `${countFor("find") || 0}+`, label: "Open jobs", sub: "Updated daily", go: "find", icon: Briefcase, color: BRAND, tint: BRAND_50 },
    { value: `${countFor("consult") || 0}+`, label: "Verified doctors", sub: "PMDC registered", go: "consult", icon: Stethoscope, color: "#C0362C", tint: "#FDECEC" },
    { value: `${CITIES.length}`, label: "Cities covered", sub: "Across Pakistan", go: "hospital", icon: MapPin, color: "#0E7C86", tint: "#E6F6F7" },
    { value: `${countFor("market") || 0}+`, label: "Equipment listings", sub: "From trusted sellers", go: "market", icon: Store, color: "#5B47C7", tint: "#F1EDFC" },
  ];

  return (
    <div ref={rootRef} className="w-full min-w-0" style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section
        className="relative z-20 overflow-x-clip"
        style={{ background: `linear-gradient(135deg, ${BRAND_50} 0%, #fff 48%, ${CREAM} 100%)`, borderBottom: `1px solid ${CARD_BORDER}` }}
      >
        <div
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: `radial-gradient(circle at 90% 10%, ${BRAND}1F 0%, transparent 42%), radial-gradient(circle at 0% 100%, ${TEAL}14 0%, transparent 40%)` }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-12 items-center">
          <div className="min-w-0 hero-stagger">
            <span className="inline-flex items-center gap-2 text-[12px] font-bold px-3 py-1.5 rounded-full mb-5 bg-white"
              style={{ color: BRAND, border: `1px solid #B9D3F2` }}>
              <ShieldCheck className="w-3.5 h-3.5" /> Pakistan's trusted healthcare network
            </span>
            <h1 className="text-[36px] sm:text-[48px] lg:text-[56px] font-extrabold leading-[1.05] tracking-[-0.04em] mb-4" style={{ color: INK }}>
              Healthcare careers & care, <span style={{ color: BRAND }}>connected.</span>
            </h1>
            <p className="text-[15.5px] sm:text-[17px] leading-relaxed max-w-xl mb-7" style={{ color: SUBTLE }}>
              Find jobs, verified doctors, hospitals and medical equipment across Pakistan. Browse freely — sign in only when you want to apply, message, save or post.
            </p>

            <SiteSearch city={city} onGo={(g) => (onGo ? onGo(g) : onSearch && onSearch(g.q || ""))} onSearchAll={(q) => onSearch && onSearch(q)} />

            <div className="flex flex-wrap gap-3 mb-8">
              <button type="button" onClick={() => onTabNav("find")} className="h-12 px-6 rounded-xl text-[15px] font-bold text-white flex items-center gap-2 transition-colors hover:opacity-95" style={{ backgroundColor: INK }}>
                Find a Job <ArrowRight className="w-4 h-4" />
              </button>
              <button type="button" onClick={() => onTabNav("consult")} className="h-12 px-6 rounded-xl text-[15px] font-bold bg-white" style={{ color: BRAND, border: `1.5px solid ${BRAND}` }}>
                Find a Doctor
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {["PMDC-verified doctors", "Free to browse", "Direct messaging"].map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-[13.5px] font-semibold" style={{ color: INK_2 }}>
                  <CheckCircle2 className="w-4 h-4" style={{ color: GREEN }} /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none hero-media">
            <div className="absolute -inset-3 sm:-inset-4 rounded-[36px] rotate-2 pointer-events-none" style={{ backgroundColor: BRAND, opacity: 0.12 }} />
            <HeroSlideshow />
            <div
              className="absolute left-3 bottom-14 sm:left-4 sm:bottom-16 z-20 bg-white rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center gap-2.5 sm:gap-3 max-w-[calc(100%-1.5rem)]"
              style={{ boxShadow: "0 16px 40px -12px rgba(16,24,40,0.35)" }}
            >
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GREEN_TINT }}>
                <ShieldCheck className="w-5 h-5" style={{ color: GREEN }} />
              </span>
              <div className="min-w-0">
                <p className="text-[13px] sm:text-[14px] font-extrabold leading-tight" style={{ color: INK }}>PMDC Verified</p>
                <p className="text-[11px] sm:text-[12px]" style={{ color: SUBTLE }}>Checked by our team</p>
              </div>
            </div>
            <div
              className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 bg-white rounded-2xl px-3.5 py-2.5 sm:px-4 sm:py-3"
              style={{ boxShadow: "0 16px 40px -12px rgba(16,24,40,0.35)" }}
            >
              <div className="flex items-center gap-1 mb-0.5">
                {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-3.5 h-3.5" style={{ color: STAR }} fill={STAR} />)}
              </div>
              <p className="text-[12px] sm:text-[12.5px] font-semibold" style={{ color: INK_2 }}>Trusted by facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        <div data-reveal className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map((s) => (
            <button type="button" key={s.label} onClick={() => onTabNav(s.go)} aria-label={`${s.label} — open`}
              className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0B57B7]"
              style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 4px 16px -10px rgba(16,24,40,0.18)" }}>
              <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: s.color }} />
              <span className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105" style={{ backgroundColor: s.tint }}>
                <s.icon className="w-5 h-5 sm:w-7 sm:h-7" style={{ color: s.color }} strokeWidth={2} />
              </span>
              <div className="min-w-0">
                <p className="text-[22px] sm:text-[30px] font-extrabold leading-none tracking-[-0.03em]" style={{ color: INK }}>{s.value}</p>
                <p className="text-[13px] sm:text-[14.5px] font-bold mt-1.5 truncate" style={{ color: INK_2 }}>{s.label}</p>
                <p className="hidden sm:block text-[12.5px] mt-0.5 truncate" style={{ color: SUBTLE }}>{s.sub}</p>
              </div>
              <ArrowRight className="hidden sm:block w-4 h-4 ml-auto shrink-0 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" style={{ color: s.color }} />
            </button>
          ))}
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Services */}
        <section className="pt-16 sm:pt-20">
          <SectionHeading eyebrow="Our services" title="Everything healthcare, in one place" sub="Six services built for doctors, facilities, patients and suppliers — start with any one." />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {Object.entries(TABS).map(([key, t], i) => {
              const Icon = t.icon;
              const n = countFor(key);
              return (
                <div key={key} data-reveal className="min-w-0" style={{ transitionDelay: `${(i % 3) * 90}ms` }}>
                <button
                  type="button"
                  onClick={() => onTabNav(key)}
                  className="group w-full h-full min-w-0 rounded-2xl overflow-hidden text-left bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
                >
                  <div className="relative h-40 sm:h-44 overflow-hidden">
                    <img src={SERVICE_IMAGES[key]} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 40%, rgba(16,24,40,0.45) 100%)" }} />
                    <span className="absolute left-4 bottom-4 w-11 h-11 rounded-xl flex items-center justify-center bg-white" style={{ boxShadow: "0 6px 16px rgba(0,0,0,0.15)" }}>
                      <Icon className="w-5 h-5" style={{ color: t.color }} strokeWidth={2.2} />
                    </span>
                    {n !== "" && (
                      <span className="absolute right-3 top-3 text-[12px] font-bold px-2.5 py-1 rounded-full bg-white/95" style={{ color: t.color }}>
                        {n} {t.sub}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-[18px] font-extrabold tracking-[-0.02em]" style={{ color: INK }}>{t.label}</p>
                    <p className="text-[14px] mt-1.5 leading-relaxed flex-1" style={{ color: SUBTLE }}>{SERVICE_BLURBS[key]}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[14px] font-bold" style={{ color: t.color }}>
                      Explore <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Jobs near you */}
        {nearJobs.length > 0 && (
          <section className="pt-16 sm:pt-20">
            <SectionHeading
              eyebrow="Hiring now"
              title="Jobs near you"
              sub="City-first openings for doctors, nurses and allied health roles."
              action={
                <button type="button" onClick={() => onTabNav("find")} className="hidden sm:inline-flex items-center gap-1.5 h-10 px-4 rounded-xl text-[14px] font-bold shrink-0" style={{ color: BRAND, backgroundColor: BRAND_50 }}>
                  See all jobs <ArrowRight className="w-4 h-4" />
                </button>
              }
            />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {nearJobs.slice(0, 6).map((j, i) => {
                const role = jobRoleVisual(j.jobTitle);
                const RoleIcon = role.Icon;
                return (
                <div key={j.id} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <button
                  type="button"
                  onClick={() => onOpenJob && onOpenJob(j)}
                  className="w-full h-full flex gap-3 p-4 sm:p-5 text-left rounded-2xl bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: role.tint, color: role.color }}>
                    <RoleIcon className="w-5 h-5" strokeWidth={2.1} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15.5px] font-bold truncate" style={{ color: INK, letterSpacing: "-0.01em" }}>{j.jobTitle}</p>
                    <p className="text-[13px] mt-0.5 truncate" style={{ color: INK_2 }}>
                      {authed ? `${j.facilityName} · ${j.city}` : `${j.city} · employer shown after sign in`}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      <span className="text-[11.5px] font-semibold px-2 py-0.5 rounded-md" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>
                        PKR {j.payAmount} {j.payUnitLabel ? `/ ${j.payUnitLabel.replace(/^Per /i, "").toLowerCase()}` : ""}
                      </span>
                      {(j.shifts || []).slice(0, 2).map((sh) => (
                        <span key={sh} className="text-[11.5px] font-semibold px-2 py-0.5 rounded-md" style={{ color: INK_2, backgroundColor: CREAM }}>{sh}</span>
                      ))}
                    </div>
                    <p className="text-[11.5px] mt-2.5" style={{ color: FAINT }}>{j.posted}{typeof j.applicants === "number" ? ` · ${j.applicants} applied` : ""}</p>
                  </div>
                </button>
                </div>
              );
              })}
            </div>
            <button type="button" onClick={() => onTabNav("find")} className="sm:hidden mt-4 w-full h-12 rounded-xl text-[14px] font-bold" style={{ color: BRAND, backgroundColor: BRAND_50 }}>
              See all jobs
            </button>
          </section>
        )}

        {/* How it works */}
        <section className="pt-16 sm:pt-20">
          <div data-reveal className="rounded-3xl overflow-hidden grid lg:grid-cols-2 bg-white" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
            <div className="p-6 sm:p-10">
              <p className="text-[12px] font-bold tracking-[0.12em] uppercase mb-2" style={{ color: BRAND }}>How it works</p>
              <h2 className="text-[24px] sm:text-[30px] font-extrabold tracking-[-0.03em] leading-tight mb-5" style={{ color: INK }}>Get started in three simple steps</h2>
              <div className="inline-flex p-1 rounded-xl mb-7" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
                {[["professionals", "For professionals"], ["facilities", "For facilities"]].map(([k, label]) => (
                  <button key={k} type="button" onClick={() => setAudience(k)}
                    className="h-10 px-4 rounded-lg text-[13.5px] font-bold transition-colors"
                    style={{ backgroundColor: audience === k ? "#fff" : "transparent", color: audience === k ? BRAND : SUBTLE, boxShadow: audience === k ? "0 1px 3px rgba(16,24,40,0.1)" : "none" }}>
                    {label}
                  </button>
                ))}
              </div>
              <ol key={audience} className="space-y-5 fade-swap">
                {HOW_IT_WORKS[audience].map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <li key={s.title} className="flex gap-4">
                      <div className="relative shrink-0">
                        <span className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: BRAND_50 }}>
                          <Icon className="w-5 h-5" style={{ color: BRAND }} />
                        </span>
                        <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-[11px] font-extrabold text-white flex items-center justify-center" style={{ backgroundColor: BRAND }}>{i + 1}</span>
                      </div>
                      <div className="min-w-0 pt-0.5">
                        <p className="text-[16px] font-bold" style={{ color: INK }}>{s.title}</p>
                        <p className="text-[14px] mt-1 leading-relaxed" style={{ color: SUBTLE }}>{s.body}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              <button type="button" onClick={() => onTabNav(audience === "facilities" ? "post" : "find")}
                className="mt-8 h-12 px-6 rounded-xl text-[15px] font-bold text-white inline-flex items-center gap-2" style={{ backgroundColor: BRAND }}>
                {audience === "facilities" ? "Post a job free" : "Browse jobs"} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="relative min-h-[260px] lg:min-h-0">
              <img src={`${LANDING_IMG}/app-mobile.jpg`} alt="Pakistani doctor with a stethoscope" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 50%, ${BRAND_DK}CC 100%)` }} />
              <div className="absolute left-5 right-5 bottom-5 sm:left-8 sm:bottom-8 text-white">
                <p className="text-[20px] sm:text-[24px] font-extrabold tracking-[-0.02em]">Your career, in your pocket.</p>
                <p className="text-[14px] mt-1 opacity-90">Apply, message and track applications from any device.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Why PakMed */}
        <section className="pt-16 sm:pt-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div data-reveal className="relative order-2 lg:order-1 reveal-left">
              <img src={`${LANDING_IMG}/care.jpg`} alt="Female doctors at a clinic" loading="lazy" decoding="async" className="w-full aspect-[4/3] object-cover rounded-3xl" />
              <div className="absolute -bottom-5 right-4 sm:right-8 bg-white rounded-2xl p-4 flex items-center gap-3 max-w-[260px]" style={{ boxShadow: "0 16px 40px -12px rgba(16,24,40,0.25)" }}>
                <img src={`${LANDING_IMG}/doctor-portrait.jpg`} alt="" loading="lazy" className="w-11 h-11 rounded-full object-cover shrink-0" />
                <div className="min-w-0">
                  <p className="text-[13.5px] font-bold truncate" style={{ color: INK }}>Same-day appointments</p>
                  <p className="text-[12px]" style={{ color: SUBTLE }}>with verified specialists</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <SectionHeading eyebrow="Why PakMed" title="Built on trust, designed for Pakistan" sub="We verify every professional and moderate every listing, so you can focus on care — not paperwork." />
              <div className="grid sm:grid-cols-2 gap-4">
                {WHY_PAKMED.map((f, i) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} data-reveal className="rounded-2xl p-5 bg-white" style={{ border: `1px solid ${CARD_BORDER}`, transitionDelay: `${i * 80}ms` }}>
                      <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: BRAND_50 }}>
                        <Icon className="w-5 h-5" style={{ color: BRAND }} />
                      </span>
                      <p className="text-[15px] font-bold" style={{ color: INK }}>{f.title}</p>
                      <p className="text-[13.5px] mt-1 leading-relaxed" style={{ color: SUBTLE }}>{f.body}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="pt-20">
          <SectionHeading center eyebrow="Across Pakistan" title="Popular cities" sub="Explore jobs, doctors and hospitals in your city." />
          <div data-reveal className="flex flex-wrap justify-center gap-2.5">
            {POPULAR_CITIES.map((c) => (
              <button key={c} type="button" onClick={() => onSearch && onSearch(c)}
                className="inline-flex items-center gap-2 h-11 px-5 rounded-full text-[14px] font-semibold bg-white transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0B57B7] hover:shadow-md"
                style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
                <MapPin className="w-4 h-4" style={{ color: BRAND }} /> {c}
              </button>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="pt-16 sm:pt-20">
          <TestimonialsCarousel />
        </section>

        {/* Latest */}
        <section className="pt-16 sm:pt-20">
          <LatestPostsCarousel onOpenCard={onOpenCard} onSeeMore={onSeeAllPosts} />
          <div data-reveal className="mt-10">
            <AdBanner />
          </div>
        </section>

        {/* FAQ */}
        <section className="pt-16 sm:pt-20">
          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12">
            <div>
              <SectionHeading eyebrow="FAQ" title="Frequently asked questions" sub="Everything you need to know about using PakMed." />
              <div data-reveal className="rounded-2xl p-5 hidden lg:block" style={{ backgroundColor: BRAND_50 }}>
                <p className="text-[15px] font-bold" style={{ color: INK }}>Still have questions?</p>
                <p className="text-[13.5px] mt-1 mb-4" style={{ color: SUBTLE }}>Our support team is happy to help.</p>
                <button type="button" onClick={() => onNavigate && onNavigate("help")} className="h-10 px-4 rounded-xl text-[13.5px] font-bold text-white inline-flex items-center gap-2" style={{ backgroundColor: BRAND }}>
                  <HelpCircle className="w-4 h-4" /> Contact support
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {HOME_FAQS.map((f, i) => (
                <div key={f.q} data-reveal style={{ transitionDelay: `${i * 60}ms` }}>
                  <FaqItem q={f.q} a={f.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-20">
          <div data-reveal className="relative rounded-3xl overflow-hidden px-6 py-10 sm:px-12 sm:py-14 reveal-scale" style={{ background: `linear-gradient(120deg, ${BRAND_DK} 0%, ${BRAND} 60%, #2F7BDA 100%)` }}>
            <div className="pointer-events-none absolute -right-20 -top-20 w-72 h-72 rounded-full float-slow" style={{ backgroundColor: "rgba(255,255,255,0.08)" }} />
            <div className="pointer-events-none absolute right-24 -bottom-28 w-64 h-64 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.06)" }} />
            <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-xl">
                <h2 className="text-[26px] sm:text-[34px] font-extrabold tracking-[-0.03em] leading-tight text-white">Ready to join Pakistan's healthcare network?</h2>
                <p className="text-[15px] sm:text-[16px] mt-2" style={{ color: "#D6E6FB" }}>Create your free profile today and get discovered by top hospitals and patients.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <button type="button" onClick={() => onTabNav("find")} className="h-12 px-6 rounded-xl text-[15px] font-bold bg-white" style={{ color: BRAND }}>
                  I'm a professional
                </button>
                <button type="button" onClick={() => onTabNav("post")} className="h-12 px-6 rounded-xl text-[15px] font-bold text-white" style={{ border: "1.5px solid rgba(255,255,255,0.6)" }}>
                  I'm hiring
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter onTabNav={onTabNav} onNavigate={onNavigate} onHome={onHome} />
    </div>
  );
}

/* =========================================================
   PROFILE
   ========================================================= */
const initialDocs = [
  { id: "pmdc", label: "PMDC Registration Certificate", required: true, status: "verified" },
  { id: "cnic", label: "CNIC (front & back)", required: true, status: "verified" },
  { id: "degree", label: "MBBS / Degree Certificate", required: true, status: "pending" },
  { id: "reference1", label: "Reference Letter #1", required: false, status: "missing" },
  { id: "reference2", label: "Reference Letter #2", required: false, status: "missing" },
];

function StatusPill({ status }) {
  if (status === "verified") return <span className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}><CheckCircle2 className="w-3.5 h-3.5" /> Verified</span>;
  if (status === "pending") return <span className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-full" style={{ color: AMBER, backgroundColor: AMBER_TINT }}><Clock className="w-3.5 h-3.5" /> In review</span>;
  return <span className="flex items-center gap-1 text-[11.5px] font-bold px-2.5 py-1 rounded-full" style={{ color: SUBTLE, backgroundColor: "#EFF2FA" }}><Upload className="w-3.5 h-3.5" /> Add</span>;
}

function UsernameField({ initialUsername }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialUsername);
  const [saved, setSaved] = useState(initialUsername);
  const [status, setStatus] = useState("idle");
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!editing) return;
    clearTimeout(timeoutRef.current);
    if (value === saved) return setStatus("idle");
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) return setStatus("invalid");
    setStatus("checking");
    timeoutRef.current = setTimeout(() => setStatus(TAKEN_USERNAMES.includes(value.toLowerCase()) ? "taken" : "available"), 600);
    return () => clearTimeout(timeoutRef.current);
  }, [value, editing, saved]);

  const canSave = value === saved || status === "available";

  return (
    <div className="mt-3 rounded-2xl p-4 bg-white" style={{ border: `1px solid ${CARD_BORDER}` }}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-[13px] font-semibold" style={{ color: INK_2 }}>Username</label>
        {!editing && <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-[12px] font-semibold" style={{ color: GREEN }}><Pencil className="w-3.5 h-3.5" /> Change</button>}
      </div>
      {!editing ? (
        <p className="text-[15px] font-semibold" style={{ color: INK }}>@{saved}</p>
      ) : (
        <>
          <div className="relative mt-1">
            <input value={value} onChange={(e) => setValue(e.target.value.replace(/\s/g, ""))} className="w-full text-[14px] rounded-xl px-3.5 py-2.5 pr-10 outline-none"
              style={{ backgroundColor: "#F4F6FC", color: INK, border: `1.5px solid ${status === "available" ? GREEN : status === "taken" || status === "invalid" ? RED : CARD_BORDER}` }} />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
              {status === "checking" && <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${SUBTLE} transparent ${SUBTLE} ${SUBTLE}` }} />}
              {status === "available" && <Check className="w-4 h-4" style={{ color: GREEN }} />}
              {(status === "taken" || status === "invalid") && <X className="w-4 h-4" style={{ color: RED }} />}
            </div>
          </div>
          <p className="text-[11.5px] mt-1.5" style={{ color: status === "available" ? GREEN : status === "taken" || status === "invalid" ? RED : SUBTLE }}>
            {status === "checking" && "Checking availability..."}
            {status === "available" && "Username is available"}
            {status === "taken" && "That username is already taken"}
            {status === "invalid" && "4-20 characters, letters/numbers/underscore only"}
            {status === "idle" && "Enter a new username"}
          </p>
          <div className="flex gap-2 mt-3">
            <button onClick={() => { setEditing(false); setValue(saved); setStatus("idle"); }} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold" style={{ backgroundColor: "#EFF2FA", color: INK }}>Cancel</button>
            <button onClick={() => { if (!canSave) return; setSaved(value); setEditing(false); setStatus("idle"); }} disabled={!canSave} className="flex-1 py-2 rounded-full text-[12.5px] font-semibold transition-opacity" style={{ backgroundColor: INK, color: "white", opacity: canSave ? 1 : 0.4 }}>Save</button>
          </div>
        </>
      )}
    </div>
  );
}

function ProfileScreen({ username, onBack }) {
  const [docs, setDocs] = useState(initialDocs);
  const [pmdcNumber, setPmdcNumber] = useState("PMC-45872-K");
  const [specialty, setSpecialty] = useState("Emergency Medicine");
  const [experience, setExperience] = useState("4");

  const requiredDocs = docs.filter((d) => d.required);
  const verifiedRequired = requiredDocs.filter((d) => d.status === "verified").length;
  const totalItems = docs.length + 2;
  const completedItems = docs.filter((d) => d.status !== "missing").length + (pmdcNumber ? 1 : 0) + (specialty ? 1 : 0);
  const completion = Math.round((completedItems / totalItems) * 100);
  const overallStatus = verifiedRequired === requiredDocs.length ? "verified" : docs.some((d) => d.status === "pending") ? "pending" : "missing";
  const uploadDoc = (id) => setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, status: d.status === "missing" ? "pending" : d.status } : d)));

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-4 sm:px-8 pt-6 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center bg-white" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <ChevronLeft className="w-5 h-5" style={{ color: INK }} />
        </button>
        <p className="font-bold text-[17px]" style={{ color: INK }}>Profile & Verification</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 pt-2 pb-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-6 items-start">
        <div>
        <div className="rounded-2xl p-4 bg-white flex items-center gap-3.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl font-bold" style={{ backgroundColor: INK }}>AK</div>
            <button className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-white flex items-center justify-center" style={{ border: `1px solid ${CARD_BORDER}` }}><Camera className="w-3 h-3" style={{ color: INK }} /></button>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[16px]" style={{ color: INK }}>Dr. Awais Khan</p>
            <p className="text-[12.5px]" style={{ color: SUBTLE }}>{specialty} · {experience} yrs experience</p>
            <div className="mt-1.5"><StatusPill status={overallStatus} /></div>
          </div>
        </div>

        <UsernameField initialUsername={username} />

        <div className="mt-3 rounded-2xl p-4 bg-white" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Profile completion</p>
            <p className="text-[13px] font-bold" style={{ color: INK }}>{completion}%</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: "#EFF2FA" }}><div className="h-full rounded-full transition-all" style={{ width: `${completion}%`, backgroundColor: GREEN }} /></div>
          <p className="text-[13px] mt-2 leading-snug" style={{ color: "#4B4A45" }}>{completion < 100 ? "Complete verification to appear higher in hospital search results." : "Your profile is fully verified and visible to all hospitals."}</p>
        </div>

        </div>
        <div>
        <p className="text-[14px] font-bold mt-4 lg:mt-0 mb-1.5" style={{ color: INK, letterSpacing: "-0.01em" }}>Registration details</p>
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <div className="px-4 py-3">
            <label className="text-[13px] font-semibold" style={{ color: INK_2 }}>PMDC Registration Number</label>
            <input value={pmdcNumber} onChange={(e) => setPmdcNumber(e.target.value)} className="w-full mt-1 text-[15px] rounded-xl px-3.5 py-2.5 outline-none" style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }} />
          </div>
          <div className="h-px" style={{ backgroundColor: CARD_BORDER }} />
          <div className="px-4 py-3">
            <label className="text-[13px] font-semibold" style={{ color: INK_2 }}>Specialty</label>
            <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="w-full mt-1 text-[15px] rounded-xl px-3.5 py-2.5 outline-none" style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }} />
          </div>
          <div className="h-px" style={{ backgroundColor: CARD_BORDER }} />
          <div className="px-4 py-3">
            <label className="text-[13px] font-semibold" style={{ color: INK_2 }}>Years of experience</label>
            <input value={experience} onChange={(e) => setExperience(e.target.value.replace(/[^0-9]/g, ""))} className="w-full mt-1 text-[15px] rounded-xl px-3.5 py-2.5 outline-none" style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }} />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 mb-1.5">
          <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Verification documents</p>
          <span className="text-[11px] font-medium" style={{ color: SUBTLE }}>{verifiedRequired}/{requiredDocs.length} required</span>
        </div>
        <div className="rounded-2xl bg-white overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
          {docs.map((d, i) => (
            <div key={d.id}>
              <button onClick={() => uploadDoc(d.id)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#F4F6FC" }}><FileText className="w-4 h-4" style={{ color: INK }} /></div>
                <div className="flex-1 min-w-0"><p className="text-[14.5px] font-semibold" style={{ color: INK }}>{d.label} {!d.required && <span className="text-[11px] font-normal" style={{ color: SUBTLE }}>(optional)</span>}</p></div>
                <StatusPill status={d.status} />
              </button>
              {i < docs.length - 1 && <div className="h-px ml-[64px]" style={{ backgroundColor: CARD_BORDER }} />}
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2.5 mt-4 px-1">
          <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" style={{ color: SUBTLE }} />
          <p className="text-[11.5px] leading-snug" style={{ color: SUBTLE }}>Documents are reviewed by PakMed's verification team within 48 hours and are never shared without your consent.</p>
        </div>

        <button className="w-full mt-5 h-12 rounded-xl font-bold text-[15px] text-white transition-all hover:brightness-110" style={{ backgroundColor: BRAND }}>Save Profile</button>
        </div>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   ROOT APP — connects Auth -> Home -> Profile
   ========================================================= */
export default function PakMedApp() {
  const [authed, setAuthed] = useState(false);
  const [signInFor, setSignInFor] = useState(null);   // { reason, run }
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [introSeen, setIntroSeen] = useState(false);
  // run an action now if signed in, otherwise ask to sign in and run it afterwards
  // a ref, so actions resumed after sign-in see the CURRENT state, not the one captured before
  const authedRef = useRef(authed);
  authedRef.current = authed;
  const requireAuth = (reason, run) => {
    if (authedRef.current) { run && run(); return true; }
    setSignInFor({ reason, run });
    return false;
  };
  const [history, setHistory] = useState(["home"]);
  const [username, setUsername] = useState("dr_awais_khan");
  const [threads, setThreads] = useState([]);
  const [postedJobs, setPostedJobs] = useState([]);

  const [cvDoc, setCvDoc] = useState({
    uploaded: null,
    savedInApp: false,
    publicCV: false,
    tplId: "t1",
    cv: {
      fullName: "Dr. Awais Khan",
      yearOfBirth: "1996",
      phone: "0309 6639988",
      email: "",
      city: "Karachi",
      title: "Medical Officer — Emergency Medicine",
      pmdc: "PMC-45872-K",
      about: "",
      photo: null,
      education: [{ ...EMPTY_EDU }],
      experience: [{ ...EMPTY_EXP }],
      skills: [],
      research: [{ ...EMPTY_RES }],
      achievements: [{ ...EMPTY_ACH }],
    },
  });
  const [profiles, setProfiles] = useState(JSON.parse(JSON.stringify(EMPTY_PROFILES)));
  const [editProfileType, setEditProfileType] = useState("general");
  const [feedStart, setFeedStart] = useState(0);
  const [focusPost, setFocusPost] = useState(null);
  const [searchQ, setSearchQ] = useState("");
  const [sectionQ, setSectionQ] = useState("");
  const [favJob, setFavJob] = useState(null);
  const [jobSocial, setJobSocial] = useState({});
  const jobEntry = (prev, id) => prev[id] || { liked: false, likes: 0, favourite: false, comments: [] };
  const toggleJobLike = (id) => setJobSocial((p) => {
    const e = jobEntry(p, id);
    return { ...p, [id]: { ...e, liked: !e.liked, likes: e.liked ? e.likes - 1 : e.likes + 1 } };
  });
  const [savedItems, setSavedItems] = useState({ doctor: {}, hospital: {}, market: {} });
  const isSaved = (kind, id) => !!(savedItems[kind] && savedItems[kind][id]);
  const toggleSave = (kind, item) => requireAuth("save this", () =>
    setSavedItems((prev) => {
      const bucket = { ...(prev[kind] || {}) };
      if (bucket[item.id]) delete bucket[item.id]; else bucket[item.id] = item;
      return { ...prev, [kind]: bucket };
    }));

  const saveJobGated = (id) => requireAuth("save this job", () => toggleJobFav(id));
  const toggleJobFav = (id) => setJobSocial((p) => {
    const e = jobEntry(p, id);
    return { ...p, [id]: { ...e, favourite: !e.favourite } };
  });
  const addJobComment = (id, text) => setJobSocial((p) => {
    const e = jobEntry(p, id);
    return { ...p, [id]: { ...e, comments: [...e.comments, { id: `jc-${Date.now()}`, name: "You", text, time: "now" }] } };
  });

  // candidates who have made their CV public
  const availableCandidates = [
    ...(cvDoc.publicCV && cvDoc.savedInApp ? [{
      id: "me",
      name: cvDoc.cv.fullName || "You",
      title: cvDoc.cv.title || profiles.general.jobTitle || "Healthcare professional",
      specialty: profiles.doctor.specialty || "",
      city: cvDoc.cv.city || profiles.general.city || "",
      area: profiles.general.area || "",
      exp: (profiles.doctor.postings || []).filter((x) => x.role).length ? `${(profiles.doctor.postings || []).filter((x) => x.role).length} posting(s)` : "—",
      pmdc: cvDoc.cv.pmdc || "",
      verified: false,
      about: cvDoc.cv.about || "",
      added: "just now",
      isYou: true,
    }] : []),
    ...SEED_CANDIDATES,
  ];

  const [applicants, setApplicants] = useState(SEED_APPLICANTS);
  const [applicantsJob, setApplicantsJob] = useState(null);
  const known = buildKnown(profiles, cvDoc);
  const [showIntent, setShowIntent] = useState(false);
  const [quickAsk, setQuickAsk] = useState(null);
  const [viewCV, setViewCV] = useState(null);
  const myApplications = applicants.filter((a) => a.id.startsWith("me-"));
  const hasAppliedTo = (jobId) => applicants.some((a) => a.jobId === jobId && a.id.startsWith("me-"));

  const applyToJob = (job) => {
    if (hasAppliedTo(job.id)) return;
    setApplicants((prev) => [{
      id: `me-${job.id}`,
      jobId: job.id,
      name: cvDoc.cv.fullName || profiles.general.fullName || "You",
      title: cvDoc.cv.title || profiles.general.jobTitle || "Applicant",
      city: cvDoc.cv.city || profiles.general.city || "",
      area: profiles.general.area || "",
      exp: profiles.doctor.postings && profiles.doctor.postings.filter((x) => x.role).length
        ? `${profiles.doctor.postings.filter((x) => x.role).length} posting(s)` : "—",
      pmdc: cvDoc.cv.pmdc || profiles.doctor.pmdc || "",
      verified: false,
      status: "new",
      at: "just now",
      note: cvDoc.cv.about || "",
      cvText: true,
      isMe: true,
    }, ...prev]);
    setPostedJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, applicants: (j.applicants || 0) + 1 } : j)));
  };

  const requestApply = (job) => {
    if (!authedRef.current) return requireAuth("apply for this job", () => requestApply(job));
    if (canFindJob) return applyToJob(job);
    const cv = cvDoc.cv || {};
    setQuickAsk({
      type: pctDoctor >= pctGeneral ? "doctor" : "general", label: "apply for this job", run: () => applyToJob(job),
      seed: { fullName: cv.fullName, jobTitle: cv.title, city: cv.city, phone: cv.phone, pmdc: cv.pmdc },
    });
  };

  const setApplicantStatus = (id, status) =>
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  const [reports, setReports] = useState([]);
  const [reportTarget, setReportTarget] = useState(null);
  const reportedIds = new Set(reports.map((r) => r.targetId));
  const submitReport = ({ reason, details }) => {
    setReports((prev) => [
      ...prev,
      { id: `rep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        targetId: reportTarget.id, type: reportTarget.type, title: reportTarget.title,
        subtitle: reportTarget.subtitle, reason, details, status: "pending", at: Date.now() },
    ]);
  };
  const updateProfile = (type, updater) =>
    setProfiles((prev) => ({ ...prev, [type]: typeof updater === "function" ? updater(prev[type]) : updater }));

  // drafts live in `profiles`; only the SAVED version is public and unlocks features
  const [savedProfiles, setSavedProfiles] = useState({ general: null, doctor: null, employer: null, seller: null });
  const saveProfile = (type, data) => setSavedProfiles((prev) => ({ ...prev, [type]: JSON.parse(JSON.stringify(data)) }));
  // panels edit live data directly, so they update draft and saved together
  const updateLive = (type, updater) => {
    setProfiles((prev) => {
      const next = typeof updater === "function" ? updater(prev[type]) : updater;
      setSavedProfiles((sp) => ({ ...sp, [type]: JSON.parse(JSON.stringify(next)) }));
      return { ...prev, [type]: next };
    });
  };
  const live = (t) => savedProfiles[t] || EMPTY_PROFILES[t];

  const pctGeneral  = savedProfiles.general  ? profileCompletion("general", savedProfiles.general)   : 0;
  const pctDoctor   = savedProfiles.doctor   ? profileCompletion("doctor", savedProfiles.doctor)     : 0;
  const pctEmployer = savedProfiles.employer ? profileCompletion("employer", savedProfiles.employer) : 0;
  const pctSeller   = savedProfiles.seller   ? profileCompletion("seller", savedProfiles.seller)     : 0;
  const canPostJob = pctEmployer >= GATE_THRESHOLD;
  const canFindJob = pctDoctor >= GATE_THRESHOLD || pctGeneral >= GATE_THRESHOLD;
  const canSell    = pctSeller >= GATE_THRESHOLD;

  const [seller, setSeller] = useState({
    ...EMPTY_SELLER,
    business: "Al-Noor Surgical & Diagnostics", type: "Surgical Store",
    city: "Lahore", area: "Jail Road", address: "Shop 14, Medicare Plaza",
    about: "Supplying surgical instruments and diagnostic equipment to clinics across Punjab since 2011.",
    hours: "Mon–Sat, 10 AM – 8 PM", phone: "0300 8471290", showPhone: true, created: true,
  });
  const [listings, setListings] = useState(SEED_LISTINGS);

  const tab = history[history.length - 1];
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [history.length, tab, !!signInFor, showIntent]);
  const canGoBack = history.length > 1;

  const navigate = (key) => setHistory((prev) => (prev[prev.length - 1] === key ? prev : [...prev, key]));
  const goBack = () => setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const goHome = () => setHistory(["home"]);
  const tabNav = (k) => {
    setSectionQ("");
    setFocusPost(null);
    if (k === "post") return requireAuth("offer a job", () => navigate("postjob"));
    navigate({ find: "findjob", consult: "consult", market: "market", hospital: "hospital", feeds: "updates" }[k] || "home");
  };

  const addThread = (t) => setThreads((prev) => [{ ...t }, ...prev]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const openMenu = () => setDrawerOpen(true);
  const backProps = canGoBack ? { onBack: goBack } : {};
  const navProps = { ...backProps, onMenu: openMenu };

  const handleDrawerNav = (key) => {
    if (key === "signout") {
      setAuthed(false);
      setHistory(["home"]);
      return;
    }
    if (key === "home") return goHome();
    if (key === "verification") return navigate("profileDetail");
    navigate(key);
  };

  const userInitials = (profiles.general.fullName || username || "U").replace(/^Dr\.?\s*/i, "").split(/[\s_]+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const headerNavigate = (key) => {
    if (key === "home") return goHome();
    if (key === "messages") return requireAuth("see your messages", () => navigate("messages"));
    if (key === "saved") return requireAuth("see your saved items", () => navigate("saved"));
    navigate(key);
  };
  const showChrome = !signInFor && !showIntent;

  return (
    <div className={`${signInFor ? "min-h-screen lg:h-dvh lg:max-h-dvh lg:overflow-hidden" : "min-h-screen"} flex flex-col`} style={{ background: PAGE_BG, fontFamily: FONT }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700;800&display=swap');`}</style>
      <HomeNav.Provider value={tab !== "home" && !signInFor && !showIntent ? goHome : null}>
      <AuthGate.Provider value={{ authed, require: requireAuth }}>
        {signInFor ? (
          <AuthShell
            reason={signInFor.reason}
            onHome={() => { setSignInFor(null); goHome(); }}
            onClose={() => setSignInFor(null)}
          >
              <AuthScreen
                initialMode={signInFor.mode || "signin"}
                onAuthenticated={(uname, isNew, extra) => {
                  if (uname) setUsername(uname);
                  // sign-up details feed the General profile as a draft, so nothing is typed twice
                  if (extra) {
                    if (extra.phone) setVerifiedPhone(extra.phone);
                    updateProfile("general", (g) => ({
                      ...g,
                      phone: g.phone || extra.phone || "",
                      email: g.email || extra.email || "",
                      fullName: g.fullName || (uname ? uname.replace(/_/g, " ") : g.fullName),
                    }));
                  }
                  const resume = signInFor && signInFor.run;
                  setAuthed(true);
                  authedRef.current = true;
                  setSignInFor(null);
                  setShowIntent(false);
                  if (isNew) setIntroSeen(true);
                  setHistory(["home"]);
                  if (!isNew && resume) setTimeout(resume, 60);
                }}
              />
          </AuthShell>
        ) : showIntent ? (
          <div className="flex-1 w-full max-w-md mx-auto px-4 py-8">
            <div className="bg-white rounded-2xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
              <IntentScreen
                name={profiles.general.fullName}
                onChoose={(it, cat) => {
                  setShowIntent(false);
                  if (cat) {
                    if (it.key === "find") updateProfile("doctor", (p) => ({ ...p, category: cat.label }));
                    if (it.key === "hire") updateProfile("employer", (p) => ({ ...p, category: cat.label }));
                  }
                  if (it.profile) {
                    setEditProfileType(it.profile);
                    setQuickAsk({
                      type: it.profile,
                      label: it.key === "hire" ? "start hiring" : it.key === "sell" ? "start selling" : "find jobs",
                      run: () => navigate(it.key === "hire" ? "postjob" : it.key === "sell" ? "market" : "findjob"),
                    });
                  }
                }}
              />
            </div>
          </div>
        ) : (
          <>
            {showChrome && (
              <SiteHeader
                activeTab={tab}
                onHome={goHome}
                onTabNav={tabNav}
                onNavigate={headerNavigate}
                onSearch={(q) => { setSearchQ(q || ""); navigate("search"); }}
                onMenu={openMenu}
                authed={authed}
                onSignIn={() => setSignInFor({ reason: "", run: null })}
                onSignUp={() => setSignInFor({ reason: "", run: null, mode: "signup" })}
                onOpenProfile={() => navigate("profile")}
                onOpenAccount={() => navigate("profileDetail")}
                onSignOut={() => { setAuthed(false); authedRef.current = false; setHistory(["home"]); }}
                userInitials={userInitials}
                username={username}
                userEmail={profiles.general.email}
                userPhone={profiles.general.phone || verifiedPhone}
              />
            )}
            <div
              className={`flex-1 flex flex-col w-full min-w-0 ${
                tab === "home" || tab === "findjob" || tab === "consult" || tab === "market" || tab === "hospital" || tab === "postjob"
                  ? ""
                  : tab === "feed"
                    ? "min-h-[calc(100dvh-64px)]"
                    : "max-w-6xl mx-auto w-full sm:w-[calc(100%-48px)] min-h-[calc(100dvh-68px)] bg-white sm:rounded-3xl sm:my-6 overflow-hidden page-enter"
              }`}
              style={!["home", "feed", "findjob", "consult", "market", "hospital", "postjob"].includes(tab) ? { border: `1px solid ${CARD_BORDER}`, boxShadow: "0 12px 40px -18px rgba(16,24,40,0.18)" } : undefined}
            >
              {tab === "home" && (
                <HomeScreen
                  onTabNav={tabNav}
                  onOpenCard={(i) => { setFocusPost(FEED_CARDS[i] ? FEED_CARDS[i].id : null); navigate("updates"); }}
                  authed={authed}
                  city={profiles.general.city}
                  counts={{
                    find: SEED_JOBS.length + postedJobs.filter((j) => j.status === "posted").length,
                    consult: DOCTORS.length,
                    market: SEED_MARKET_ITEMS.length + listings.filter((l) => l.status === "live").length,
                    hospital: SEED_FACILITIES.length,
                    feeds: LATEST_POSTS.length,
                  }}
                  nearJobs={(() => {
                    const all = [...postedJobs.filter((j) => j.status === "posted"), ...SEED_JOBS];
                    const c = profiles.general.city;
                    const mine = c ? all.filter((j) => j.city === c) : [];
                    return mine.length ? mine : all;
                  })()}
                  onOpenJob={(j) => { setSectionQ(j.jobTitle); navigate("findjob"); }}
                  onSearch={(q) => { setSearchQ(q); navigate("search"); }}
                  onNavigate={headerNavigate}
                  onHome={goHome}
                  onSeeAllPosts={() => { setFocusPost(null); navigate("updates"); }}
                  onGo={({ section, q }) => {
                    if (section === "postjob") return tabNav("post");
                    setFocusPost(null);
                    setSectionQ(q || "");
                    navigate(section);
                  }}
                />
              )}
              {tab === "search" && (
                <SearchResultsScreen
                  key={searchQ}
                  query={searchQ}
                  authed={authed}
                  userCity={profiles.general.city}
                  postedJobs={postedJobs}
                  listings={listings}
                  facilities={[
                    ...(canPostJob && live("employer").facilityName ? [{ id: "own", name: live("employer").facilityName, type: live("employer").facilityType || "Facility", city: live("employer").city, area: live("employer").area, services: [], hiring: postedJobs.filter((j) => j.status === "posted").length }] : []),
                    ...SEED_FACILITIES,
                  ]}
                  onSeeAll={(section, q) => { setSectionQ(q || ""); navigate(section); }}
                  {...navProps}
                />
              )}
              {tab === "hospital" && (
                <FindHospitalScreen
                  key={"h" + sectionQ}
                  initialQuery={sectionQ}
                  userCity={profiles.general.city}
                  employer={live("employer")}
                  employerUnlocked={canPostJob}
                  postedJobs={postedJobs}
                  onOpenHiring={(fac) => { setSectionQ(fac ? fac.name : ""); navigate("findjob"); }}
                  isSaved={isSaved}
                  onToggleSave={toggleSave}
                  onMessage={(f) => requireAuth("message this facility", () => addThread({ business: f.name, product: "Enquiry", text: `Hello, I found ${f.name} on PakMed and have a question.` }))}
                  {...navProps}
                />
              )}
              {tab === "feed" && (
                <VerticalFeedScreen
                  cards={FEED_CARDS}
                  startIndex={feedStart}
                  onBack={goBack}
                  onTabNav={tabNav}
                  onReport={setReportTarget}
                  reportedIds={reportedIds}
                />
              )}
              {tab === "news" && <NewsScreen {...navProps} />}
              {tab === "updates" && (
                <UpdatesScreen
                  key={"u" + (focusPost || "")}
                  focusId={focusPost}
                  onOpenCard={(i) => { setFeedStart(i); navigate("feed"); }}
                  {...navProps}
                />
              )}
              {tab === "physicianPanel" && (
                <PhysicianPanelScreen
                  profile={profiles.doctor}
                  onChange={(u) => updateLive("doctor", u)}
                  {...navProps}
                />
              )}
              {tab === "employerPanel" && (
                <EmployerPanelScreen
                  profile={profiles.employer}
                  onChange={(u) => updateLive("employer", u)}
                  postedJobs={postedJobs}
                  jobSocial={jobSocial}
                  reports={reports}
                  onOpenJob={(j) => setFavJob(j)}
                  onNewJob={() => navigate("postjob")}
                  applicants={applicants}
                  onOpenApplicants={(j) => { setApplicantsJob(j); navigate("applicants"); }}
                  candidates={availableCandidates}
                  onContactCandidate={(c) => addThread({ business: c.name, product: `${c.title} — available`, text: `Hello ${c.name}, we saw your CV on PakMed and would like to discuss an opening at ${profiles.employer.facilityName || "our facility"}.` })}
                  {...navProps}
                />
              )}
              {tab === "applicants" && applicantsJob && (
                <ApplicantsScreen
                  job={applicantsJob}
                  applicants={applicants}
                  onSetStatus={setApplicantStatus}
                  onMessage={(a) => addThread({ business: a.name, product: `${applicantsJob.jobTitle} — applicant`, text: `Hello ${a.name}, thank you for applying. We'd like to discuss your application.` })}
                  onViewCV={(a) => setViewCV(a)}
                  onReport={setReportTarget}
                  reportedIds={reportedIds}
                  {...navProps}
                />
              )}
              {tab === "moderation" && <ModerationScreen reports={reports} setReports={setReports} {...navProps} />}
              {tab === "findjob" && (
                <FindJobScreen
                  key={"j" + sectionQ}
                  initialQuery={sectionQ}
                  userCity={profiles.general.city}
                  postedJobs={postedJobs}
                  onReport={setReportTarget}
                  reportedIds={reportedIds}
                  jobSocial={jobSocial}
                  onToggleLike={toggleJobLike}
                  onToggleFav={saveJobGated}
                  onAddComment={addJobComment}
                  onContact={addThread}
                  onApply={requestApply}
                  hasApplied={hasAppliedTo}
                  {...navProps}
                />
              )}
              {tab === "consult" && (
                <ConsultDoctorScreen
                  key={"c" + sectionQ}
                  initialQuery={sectionQ}
                  userCity={profiles.general.city}
                  onReport={setReportTarget}
                  reportedIds={reportedIds}
                  isSaved={isSaved}
                  onToggleSave={toggleSave}
                  onMessage={addThread}
                  guestDefaults={{ name: profiles.general.fullName || "", phone: profiles.general.phone || "" }}
                  {...navProps}
                />
              )}
              {tab === "postjob" && (
                <PostJobScreen
                  postedJobs={postedJobs}
                  onPublish={(j) => setPostedJobs((prev) => (prev.some((x) => x.id === j.id) ? prev.map((x) => (x.id === j.id ? { ...x, ...j } : x)) : [j, ...prev]))}
                  canPost={canPostJob}
                  onNeedProfile={(cb, seed) => setQuickAsk({ type: "employer", label: "post this job", run: cb, seed })}
                  known={known}
                  {...navProps}
                />
              )}
              {tab === "market" && (
                <MarketHubScreen
                  key={"m" + sectionQ}
                  initialQuery={sectionQ}
                  onSendMessage={addThread}
                  onOpenSeller={() => requireAuth("sell on PakMed", () => navigate("seller"))}
                  onReport={setReportTarget}
                  reportedIds={reportedIds}
                  listings={listings}
                  canSell={canSell}
                  requireAuth={requireAuth}
                  isSaved={isSaved}
                  onToggleSave={toggleSave}
                  {...navProps}
                />
              )}
              {tab === "seller" && (
                <SellerPanelScreen
                  seller={seller} setSeller={setSeller}
                  listings={listings} setListings={setListings}
                  canSell={canSell}
                  onNeedProfile={(cb, seed) => setQuickAsk({ type: "seller", label: "list more items", run: cb, seed })}
                  known={known}
                  {...navProps}
                />
              )}
              {tab === "messages" && <MessagesScreen threads={threads} {...navProps} />}
              {tab === "profile" && (
                <AccountScreen
                  authed={authed}
                  onSignIn={() => setSignInFor({ reason: "see your profile", run: null })}
                  username={username}
                  general={savedProfiles.general || profiles.general}
                  doctor={savedProfiles.doctor || profiles.doctor}
                  pctGeneral={pctGeneral}
                  pctDoctor={pctDoctor}
                  cvReady={cvDoc.uploaded || cvDoc.savedInApp}
                  verifiedPhone={verifiedPhone}
                  profilesLive={["general", "doctor", "employer", "seller"].filter((k) => savedProfiles[k] && profileCompletion(k, savedProfiles[k]) >= GATE_THRESHOLD).length}
                  savedJobs={[...postedJobs, ...SEED_JOBS].filter((j) => jobSocial[j.id] && jobSocial[j.id].favourite)}
                  savedItems={savedItems}
                  applications={myApplications}
                  allJobs={[...postedJobs, ...SEED_JOBS]}
                  messagesCount={threads.length}
                  onNavigate={(k) => (k === "home" ? goHome() : navigate(k))}
                  onOpenSaved={(section, q) => { setSectionQ(q || ""); navigate(section); }}
                  onToggleJob={toggleJobFav}
                  onToggleSave={toggleSave}
                  onSignOut={() => { setAuthed(false); authedRef.current = false; setHistory(["home"]); }}
                  {...navProps}
                />
              )}
              {tab === "saved" && (
                <SavedScreen
                  savedJobs={[...postedJobs, ...SEED_JOBS].filter((j) => jobSocial[j.id] && jobSocial[j.id].favourite)}
                  savedItems={savedItems}
                  onToggleJob={toggleJobFav}
                  onToggleSave={toggleSave}
                  onOpen={(section, q) => { setSectionQ(q || ""); navigate(section); }}
                  {...navProps}
                />
              )}
              {tab === "profiles" && (
                <ProfileHubScreen
                  profiles={profiles}
                  savedProfiles={savedProfiles}
                  username={username}
                  onOpenProfile={(k) => { setEditProfileType(k); navigate("profileEdit"); }}
                  onOpenPanel={(k) => navigate(k)}
                  {...navProps}
                />
              )}
              {tab === "profileEdit" && (
                <ProfileEditorScreen
                  type={editProfileType}
                  data={profiles[editProfileType]}
                  onChange={(u) => updateProfile(editProfileType, u)}
                  saved={savedProfiles[editProfileType]}
                  onSave={(d) => saveProfile(editProfileType, d)}
                  verifiedPhone={editProfileType === "general" ? verifiedPhone : ""}
                  onPhoneChanged={(n) => {
                    setVerifiedPhone(n);
                    setSavedProfiles((sp) => sp.general ? { ...sp, general: { ...sp.general, phone: n } } : sp);
                  }}
                  known={known}
                  onBack={goBack}
                  onMenu={openMenu}
                />
              )}
              {tab === "profileDetail" && <ProfileScreen username={username} onBack={goBack} />}
              {tab === "cv" && <CVScreen onBack={goBack} cvDoc={cvDoc} setCvDoc={setCvDoc} known={known} />}
              {tab === "settings" && (
                <SimpleInfoScreen
                  title="Settings"
                  lines={[
                    "Notifications, privacy controls, connected Google account and account preferences will live here.",
                    "In this prototype these controls are not yet wired up.",
                  ]}
                  {...navProps}
                />
              )}
              {tab === "language" && (
                <SimpleInfoScreen
                  title="Language"
                  lines={[
                    "PakMed will support English and اردو at launch.",
                    "Language switching is not yet implemented in this prototype.",
                  ]}
                  {...navProps}
                />
              )}
              {tab === "help" && (
                <SimpleInfoScreen
                  title="Help & Support"
                  lines={[
                    "Questions about verification, job posts, payments or the Market can be raised here.",
                    "In the live app this will connect to PakMed support over WhatsApp and email.",
                  ]}
                  {...navProps}
                />
              )}
              {tab === "about" && (
                <SimpleInfoScreen
                  title="About PakMed"
                  lines={[
                    "PakMed connects PMDC-verified doctors with hospitals and clinics across Pakistan for permanent, locum, part-time and emergency positions.",
                    "It also offers doctor consultations and a marketplace for biomedical equipment.",
                    "This is an early prototype built for feedback — job listings, sellers and news items are sample data.",
                  ]}
                  {...navProps}
                />
              )}
            </div>
            {tab !== "home" && tab !== "feed" && (
              <SiteFooter onTabNav={tabNav} onNavigate={headerNavigate} onHome={goHome} />
            )}
            {quickAsk && (
              <QuickDetailsSheet
                type={quickAsk.type}
                profile={profiles[quickAsk.type]}
                onChange={(u) => { updateProfile(quickAsk.type, u); saveProfile(quickAsk.type, u); }}
                actionLabel={quickAsk.label}
                known={known}
                seed={quickAsk.seed || {}}
                onClose={() => setQuickAsk(null)}
                onDone={() => { const r = quickAsk.run; setQuickAsk(null); if (r) setTimeout(r, 60); }}
              />
            )}
            {viewCV && (
              <ApplicantCVSheet applicant={viewCV} cvDoc={cvDoc} onClose={() => setViewCV(null)} />
            )}
            {favJob && (
              <JobDetailSheet
                job={favJob}
                onClose={() => setFavJob(null)}
                onReport={setReportTarget}
                reported={reportedIds.has(favJob.id)}
                social={jobSocial[favJob.id]}
                onToggleLike={toggleJobLike}
                onToggleFav={saveJobGated}
                onAddComment={addJobComment}
                onContact={addThread}
                onApply={requestApply}
                hasApplied={hasAppliedTo(favJob.id)}
              />
            )}
            {reportTarget && (
              <ReportSheet
                target={reportTarget}
                onClose={() => setReportTarget(null)}
                onSubmit={submitReport}
              />
            )}
            <NavDrawer
              open={drawerOpen}
              onClose={() => setDrawerOpen(false)}
              onNavigate={handleDrawerNav}
              username={username}
              cvDoc={cvDoc}
              unreadCount={threads.length}
              pendingReports={reports.filter((r) => r.status === "pending").length}
              panels={{ doctor: pctDoctor >= GATE_THRESHOLD, employer: canPostJob, seller: canSell }}
            />
          </>
        )}
      </AuthGate.Provider>
      </HomeNav.Provider>
    </div>
  );
}
