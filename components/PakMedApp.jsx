"use client";

import { useState, useEffect, useRef, createContext, useContext } from "react";
import {
  Bell, Home, Briefcase, Activity, Mail, User, Heart, MessageCircle, Repeat2, Bookmark, Send, X,
  Eye, EyeOff, ArrowRight, ArrowLeft, Check, MessageCircle as WhatsAppIcon,
  ChevronLeft, Camera, CheckCircle2, Clock, Upload, FileText, ShieldCheck, Pencil, Search, Stethoscope,
  Store, MessageSquareText, UserRound, MapPin, ChevronRight,
  Menu, Newspaper, Settings, HelpCircle, Info, LogOut, Globe, Shield, Flag, Building2, Star, Phone,
  Sunrise, Sunset, Moon, Pill, FlaskConical, GraduationCap, Scissors, Wrench, Plus, CalendarDays, Users, History, ChevronDown,
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

/* =========================================================
   AUTH FLOW
   ========================================================= */
function Field({ label, children, hint }) {
  return (
    <div className="mb-4">
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-[13px] font-semibold" style={{ color: INK_2 }}>{label}</label>
        {hint}
      </div>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

const AUTH_INPUT = "pm-input w-full h-12 text-[15px] rounded-xl px-4 outline-none bg-white transition-shadow";

function StepDots({ total, current }) {
  return (
    <div className="flex gap-1.5 mb-7">
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
      className="w-full h-12 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 text-white transition-all duration-200 enabled:hover:brightness-110 enabled:active:scale-[0.99] disabled:cursor-not-allowed"
      style={{ backgroundColor: BRAND, opacity: disabled ? 0.45 : 1, boxShadow: disabled ? "none" : "0 8px 20px -8px rgba(11,87,183,0.55)" }}
    >
      {children}
    </button>
  );
}

function BackLink({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="mb-5 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: SUBTLE }}>
      <ArrowLeft className="w-4 h-4" /> Back
    </button>
  );
}

function AuthTitle({ eyebrow, title, sub }) {
  return (
    <div className="mb-7">
      {eyebrow && <p className="text-[12px] font-bold uppercase tracking-[0.1em]" style={{ color: BRAND }}>{eyebrow}</p>}
      <h1 className="font-extrabold text-[28px] sm:text-[30px] leading-tight tracking-[-0.03em] mt-1.5" style={{ color: INK }}>{title}</h1>
      {sub && <p className="text-[14.5px] mt-2 leading-relaxed" style={{ color: SUBTLE }}>{sub}</p>}
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
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg flex items-center justify-center hover:bg-[#F5F7FA]">
        {show ? <EyeOff className="w-[18px] h-[18px]" style={{ color: SUBTLE }} /> : <Eye className="w-[18px] h-[18px]" style={{ color: SUBTLE }} />}
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
      className="w-full h-12 rounded-xl font-semibold text-[15px] flex items-center justify-center gap-3 bg-white transition-all duration-200 hover:bg-[#F8FAFC] hover:shadow-sm active:scale-[0.99]"
      style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}
    >
      {busy
        ? <span className="w-[18px] h-[18px] rounded-full border-2 animate-spin" style={{ borderColor: `${BRAND} transparent ${BRAND} ${BRAND}` }} />
        : <GoogleIcon />}
      {busy ? "Connecting to Google…" : label}
    </button>
  );
}

function OrDivider({ label = "or" }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px" style={{ backgroundColor: CARD_BORDER }} />
      <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: FAINT }}>{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: CARD_BORDER }} />
    </div>
  );
}

function AuthModeTabs({ mode, onChange }) {
  return (
    <div className="grid grid-cols-2 p-1 rounded-xl mb-7" style={{ backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
      {[["signin", "Sign in"], ["signup", "Create account"]].map(([k, label]) => {
        const on = mode === k;
        return (
          <button key={k} type="button" onClick={() => onChange(k)}
            className="h-10 rounded-lg text-[14px] font-bold transition-all duration-200"
            style={{ backgroundColor: on ? "#fff" : "transparent", color: on ? BRAND : SUBTLE, boxShadow: on ? "0 1px 3px rgba(16,24,40,0.12)" : "none" }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

function UsernameStep({ value, onChange, onNext, onGoogle }) {
  const [status, setStatus] = useState("idle");
  const timeoutRef = useRef(null);

  useEffect(() => {
    clearTimeout(timeoutRef.current);
    if (!value) return setStatus("idle");
    if (!/^[a-zA-Z0-9_]{4,20}$/.test(value)) return setStatus("invalid");
    setStatus("checking");
    timeoutRef.current = setTimeout(() => {
      setStatus(TAKEN_USERNAMES.includes(value.toLowerCase()) ? "taken" : "available");
    }, 700);
    return () => clearTimeout(timeoutRef.current);
  }, [value]);

  return (
    <div>
      <AuthTitle eyebrow="Step 1 of 4" title="Create your account" sub="Join Pakistan's healthcare network — it's free and takes under a minute." />
      <GoogleButton label="Sign up with Google" onSuccess={onGoogle} />
      <OrDivider label="or with WhatsApp" />
      <Field label="Choose a username">
        <div className="relative">
          <input
            value={value}
            onChange={(e) => onChange(e.target.value.replace(/\s/g, ""))}
            placeholder="e.g. dr_sara_malik"
            className={`${AUTH_INPUT} pr-11`}
            style={{ color: INK, border: `1.5px solid ${status === "available" ? GREEN : status === "taken" || status === "invalid" ? RED : CARD_BORDER}` }}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {status === "checking" && <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${SUBTLE} transparent ${SUBTLE} ${SUBTLE}` }} />}
            {status === "available" && <CheckCircle2 className="w-[18px] h-[18px]" style={{ color: GREEN }} />}
            {(status === "taken" || status === "invalid") && <X className="w-[18px] h-[18px]" style={{ color: RED }} />}
          </div>
        </div>
        <p className="text-[12.5px] mt-1.5" style={{ color: status === "available" ? GREEN : status === "taken" || status === "invalid" ? RED : SUBTLE }}>
          {status === "checking" && "Checking availability…"}
          {status === "available" && "Username is available"}
          {status === "taken" && "That username is already taken"}
          {status === "invalid" && "4–20 characters: letters, numbers or underscore"}
          {status === "idle" && "This is how doctors and hospitals will find you."}
        </p>
      </Field>
      <PrimaryButton onClick={onNext} disabled={status !== "available"}>Continue <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function ContactStep({ data, onChange, onNext, onBack }) {
  const digitsOnly = data.whatsapp.replace(/\D/g, "");
  const validPhone = /^3\d{9}$/.test(digitsOnly);
  const rules = { length: data.password.length >= 8, upper: /[A-Z]/.test(data.password), number: /[0-9]/.test(data.password) };
  const pwValid = rules.length && rules.upper && rules.number;
  const matchValid = data.password && data.password === data.confirmPassword;
  const canContinue = validPhone && pwValid && matchValid;

  return (
    <div>
      <BackLink onClick={onBack} />
      <AuthTitle eyebrow="Step 2 of 4" title="WhatsApp & password" sub="We'll send a verification code to your WhatsApp number." />
      <Field label="WhatsApp number">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3.5 h-12 rounded-xl shrink-0 bg-white" style={{ border: `1.5px solid ${CARD_BORDER}` }}>
            <WhatsAppIcon className="w-4 h-4" style={{ color: GREEN }} />
            <span className="text-[15px] font-semibold" style={{ color: INK }}>+92</span>
          </div>
          <input
            value={data.whatsapp}
            onChange={(e) => onChange({ ...data, whatsapp: e.target.value.replace(/[^0-9]/g, "").slice(0, 10) })}
            placeholder="3XX XXXXXXX"
            inputMode="numeric"
            className={`${AUTH_INPUT} flex-1 min-w-0`}
            style={{ color: INK, border: `1.5px solid ${data.whatsapp && !validPhone ? RED : CARD_BORDER}` }}
          />
        </div>
        {data.whatsapp && !validPhone && <p className="text-[12.5px] mt-1.5" style={{ color: RED }}>Enter a valid Pakistani mobile number (e.g. 3001234567)</p>}
      </Field>
      <Field label="Password">
        <PasswordInput value={data.password} onChange={(v) => onChange({ ...data, password: v })} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {[["length", "8+ characters"], ["upper", "1 uppercase"], ["number", "1 number"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1 text-[12px] font-medium transition-colors" style={{ color: rules[key] ? GREEN : FAINT }}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {label}
            </span>
          ))}
        </div>
      </Field>
      <Field label="Confirm password">
        <PasswordInput value={data.confirmPassword} onChange={(v) => onChange({ ...data, confirmPassword: v })} invalid={data.confirmPassword && !matchValid} />
        {data.confirmPassword && !matchValid && <p className="text-[12.5px] mt-1.5" style={{ color: RED }}>Passwords don't match</p>}
      </Field>
      <div className="mt-6">
        <PrimaryButton onClick={onNext} disabled={!canContinue}>Send verification code <ArrowRight className="w-4 h-4" /></PrimaryButton>
      </div>
    </div>
  );
}

function OtpStep({ whatsapp, onNext, onBack }) {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(30);
  const [error, setError] = useState(false);
  const inputsRef = useRef([]);
  const CORRECT = "123456";

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
        eyebrow="Step 3 of 4"
        title="Verify your WhatsApp"
        sub={<>Enter the 6-digit code sent to <span className="font-semibold" style={{ color: INK }}>+92 {whatsapp}</span></>}
      />
      <div className="grid grid-cols-6 gap-2 mb-2" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <input
            key={i} ref={(el) => (inputsRef.current[i] = el)} value={d}
            onChange={(e) => updateDigit(i, e.target.value)} onKeyDown={(e) => handleBackspace(i, e)}
            inputMode="numeric" maxLength={1} aria-label={`Digit ${i + 1}`}
            className="pm-input w-full text-center text-[20px] font-bold rounded-xl outline-none bg-white transition-shadow"
            style={{ height: 56, color: INK, border: `1.5px solid ${error ? RED : d ? BRAND : CARD_BORDER}` }}
          />
        ))}
      </div>
      <p className="text-[12.5px] mb-5" style={{ color: error ? RED : FAINT }}>
        {error ? "Incorrect code — try 123456 for this demo" : "Demo code: 123456"}
      </p>
      <p className="text-[13.5px] mb-6" style={{ color: SUBTLE }}>
        Didn't get it?{" "}
        {timer > 0
          ? <>Resend in <span className="font-semibold" style={{ color: INK }}>{timer}s</span></>
          : <button type="button" onClick={() => setTimer(30)} className="font-bold" style={{ color: BRAND }}>Resend code</button>}
      </p>
      <PrimaryButton onClick={verify} disabled={digits.some((d) => !d)}>Verify & create account <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function EmailStep({ email, onChange, onNext, onSkip }) {
  return (
    <div>
      <AuthTitle eyebrow="Step 4 of 4 · Optional" title="Add an email" sub="Used for account recovery and receipts. You can add this later in Settings." />
      <Field label="Email address">
        <div className="relative">
          <Mail className="w-[18px] h-[18px] absolute left-4 top-1/2 -translate-y-1/2" style={{ color: FAINT }} />
          <input
            type="email" value={email} onChange={(e) => onChange(e.target.value)} placeholder="you@example.com"
            className={`${AUTH_INPUT} pl-11`}
            style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}
          />
        </div>
      </Field>
      <div className="mt-6">
        <PrimaryButton onClick={onNext}>Continue <ArrowRight className="w-4 h-4" /></PrimaryButton>
      </div>
      <button type="button" onClick={onSkip} className="w-full text-center text-[14px] font-semibold mt-3 h-11 rounded-xl hover:bg-[#F5F7FA]" style={{ color: SUBTLE }}>Skip for now</button>
    </div>
  );
}

function SignupDoneStep({ username, onFinish }) {
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
        {["Account created", "WhatsApp verified", "Profile — next step"].map((t, i) => (
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
      <Field label="Password" hint={<button type="button" className="text-[13px] font-semibold" style={{ color: BRAND }}>Forgot password?</button>}>
        <PasswordInput value={password} onChange={setPassword} />
      </Field>
      <label className="flex items-center gap-2.5 mb-6 cursor-pointer select-none">
        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-4 h-4 rounded accent-[#0B57B7]" />
        <span className="text-[13.5px]" style={{ color: INK_2 }}>Keep me signed in</span>
      </label>
      <PrimaryButton onClick={onSignIn}>Sign in <ArrowRight className="w-4 h-4" /></PrimaryButton>
    </div>
  );
}

function AuthScreen({ onAuthenticated, initialMode = "signin" }) {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState("");
  const [contact, setContact] = useState({ whatsapp: "", password: "", confirmPassword: "" });
  const [email, setEmail] = useState("");

  const switchMode = (m) => { setMode(m); setStep(0); };
  const showTabs = mode === "signin" || step === 0;

  return (
    <div>
      {showTabs && <AuthModeTabs mode={mode} onChange={switchMode} />}
      {mode === "signup" && step > 0 && step < 4 && <StepDots total={4} current={step} />}
      <div key={`${mode}-${step}`} className="auth-step">
        {mode === "signin" && (
          <SignInScreen
            onSignIn={() => onAuthenticated(username || "dr_awais_khan", false)}
            onGoogle={() => onAuthenticated("google_user", false)}
          />
        )}
        {mode === "signup" && step === 0 && (
          <UsernameStep value={username} onChange={setUsername} onNext={() => setStep(1)} onGoogle={() => onAuthenticated("google_user", true)} />
        )}
        {mode === "signup" && step === 1 && <ContactStep data={contact} onChange={setContact} onNext={() => setStep(2)} onBack={() => setStep(0)} />}
        {mode === "signup" && step === 2 && <OtpStep whatsapp={contact.whatsapp} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {mode === "signup" && step === 3 && <EmailStep email={email} onChange={setEmail} onNext={() => setStep(4)} onSkip={() => setStep(4)} />}
        {mode === "signup" && step === 4 && (
          <SignupDoneStep username={username} onFinish={() => onAuthenticated(username, true, { phone: contact.whatsapp, email })} />
        )}
      </div>
      {showTabs && (
        <p className="text-[12.5px] text-center mt-8 leading-relaxed" style={{ color: FAINT }}>
          By continuing you agree to PakMed's <a href="/terms" target="_blank" rel="noopener" className="font-semibold underline-offset-2 hover:underline" style={{ color: SUBTLE }}>Terms of Use</a> and <a href="/privacy" target="_blank" rel="noopener" className="font-semibold underline-offset-2 hover:underline" style={{ color: SUBTLE }}>Privacy Policy</a>.
        </p>
      )}
    </div>
  );
}

function AuthShell({ reason, onHome, onClose, children }) {
  return (
    <div className="flex-1 w-full grid lg:grid-cols-[1fr_1.05fr] min-h-screen bg-white" style={{ fontFamily: FONT }}>
      <aside className="relative hidden lg:flex flex-col justify-between p-10 xl:p-12 overflow-hidden" style={{ backgroundColor: BRAND_DK }}>
        <img src="/images/landing/care.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(8,66,140,0.25) 0%, rgba(8,66,140,0.75) 50%, rgba(6,38,79,0.97) 100%)" }} />
        <button type="button" onClick={onHome} className="relative flex items-center gap-2 self-start" aria-label="PakMed home">
          <span className="w-10 h-10 rounded-[12px] flex items-center justify-center bg-white">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke={BRAND} strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
          </span>
          <span className="text-[24px] font-extrabold tracking-[-0.035em] text-white">PakMed</span>
        </button>
        <div className="relative auth-panel-in">
          <h2 className="text-[36px] xl:text-[42px] font-extrabold leading-[1.08] tracking-[-0.035em] text-white max-w-md">
            Pakistan's healthcare network, in one place.
          </h2>
          <ul className="mt-6 space-y-3">
            {["Thousands of verified doctors & facilities", "Apply to jobs in one tap", "Message employers and doctors directly"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px] font-medium" style={{ color: "#DCE8F8" }}>
                <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "#7DD3A8" }} /> {t}
              </li>
            ))}
          </ul>
          <figure className="mt-8 rounded-2xl p-5 max-w-md" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.18)", backdropFilter: "blur(10px)" }}>
            <blockquote className="text-[14.5px] leading-relaxed text-white">“I found a locum emergency shift within a day. The whole process was transparent.”</blockquote>
            <figcaption className="flex items-center gap-3 mt-4">
              <img src="/images/landing/avatar-1.jpg" alt="" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <p className="text-[13.5px] font-bold text-white">Dr. Ayesha Siddiqui</p>
                <p className="text-[12px]" style={{ color: "#B8C9E3" }}>Medical Officer, Karachi</p>
              </div>
            </figcaption>
          </figure>
        </div>
        <p className="relative text-[12.5px]" style={{ color: "#9FB3D1" }}>© {new Date().getFullYear()} PakMed · Healthcare. Connected.</p>
      </aside>

      <main className="flex flex-col min-h-screen" style={{ background: `linear-gradient(180deg, ${BRAND_50} 0%, #fff 220px)` }}>
        <div className="flex items-center justify-between gap-3 px-5 sm:px-8 h-[68px] shrink-0">
          <div className="lg:hidden"><BrandMark size={30} onClick={onHome} /></div>
          <span className="hidden lg:block text-[13.5px] font-semibold" style={{ color: SUBTLE }}>
            {reason ? `Sign in to ${reason}` : "Welcome to PakMed"}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onHome} className="hidden sm:flex items-center gap-1.5 h-10 px-3.5 rounded-xl text-[13.5px] font-semibold bg-white" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
              <Home className="w-4 h-4" /> Home
            </button>
            <button type="button" onClick={onClose} className="w-10 h-10 rounded-xl flex items-center justify-center bg-white" style={{ border: `1px solid ${CARD_BORDER}` }} aria-label="Close">
              <X className="w-5 h-5" style={{ color: INK }} />
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-center px-5 sm:px-8 pt-4 pb-12 lg:items-center">
          <div className="w-full max-w-[420px]">
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
          <span className="w-8" />
          <p className="font-bold text-[15px]" style={{ color: INK }}>Share to</p>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>
        <div className="px-5 py-5">
          <p className="text-[12.5px] mb-4 truncate" style={{ color: SUBTLE }}>{card.title}</p>
          <div className="grid grid-cols-3 gap-y-5">
            {platforms.map((p) => (
              <button key={p.key} onClick={p.onClick} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: p.bg, border: p.key === "copy" ? `1px solid ${CARD_BORDER}` : "none" }}>
                  {p.icon}
                </div>
                <span className="text-[11.5px] font-medium" style={{ color: INK }}>{p.label}</span>
              </button>
            ))}
          </div>
          {copied && (
            <p className="text-center text-[12.5px] font-medium mt-4 py-2 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>
              Link copied to clipboard
            </p>
          )}
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

const SEED_MARKET_ITEMS = [
  { id: "mi1", name: "BP Apparatus (Aneroid)", category: "Diagnostics & Monitoring", condition: "New", price: "4,500", seller: "Al-Noor Surgical", city: "Lahore", area: "Jail Road", phone: "0300 8471290", showPhone: true, note: "German stock, 1-year warranty", kind: "product" },
  { id: "mi2", name: "Portable Ultrasound", category: "Imaging Equipment", condition: "Refurbished", price: "850,000", seller: "MediTech Instruments", city: "Karachi", area: "Saddar", phone: "", showPhone: false, note: "Convex + linear probes, serviced", kind: "product" },
  { id: "mi3", name: "Hydrafacial Machine", category: "Aesthetic & Dermatology", condition: "Used", price: "320,000", seller: "Glow Aesthetics", city: "Lahore", area: "DHA Phase 5", phone: "0304 7712345", showPhone: true, note: "2 years old, all handpieces included", kind: "product" },
  { id: "mi4", name: "Hospital Bed (Electric)", category: "Hospital Furniture", condition: "New", price: "185,000", seller: "Shifa Medical Supplies", city: "Islamabad", area: "Blue Area", phone: "051 2874400", showPhone: true, note: "3-function, side rails", kind: "product" },
  { id: "mi5", name: "Centrifuge", category: "Lab & Pathology", condition: "Used", price: "45,000", seller: "Faisal Medical Store", city: "Faisalabad", area: "Susan Road", phone: "0321 6639988", showPhone: true, note: "8-tube, working condition", kind: "product" },
  { id: "mi6", name: "ECG Machine (12-lead)", category: "Diagnostics & Monitoring", condition: "New", price: "125,000", seller: "Rehman BioMedical", city: "Peshawar", area: "University Road", phone: "", showPhone: false, note: "With trolley and cables", kind: "product" },
  { id: "mi7", name: "Dental Chair Unit", category: "Surgical & Theatre", condition: "Refurbished", price: "410,000", seller: "Care Diagnostics Hub", city: "Lahore", area: "Model Town", phone: "0333 4455667", showPhone: true, note: "Fully serviced, installation included", kind: "product" },
  { id: "mi8", name: "Oxygen Concentrator", category: "Hospital Furniture", condition: "New", price: "95,000", seller: "Al-Noor Surgical", city: "Multan", area: "Bosan Road", phone: "0300 8471290", showPhone: true, note: "5 LPM, imported", kind: "product" },
];

const SEED_SERVICES = [
  { id: "sv1", name: "Biomedical Equipment Repair", provider: "TechMed Services", city: "Lahore", area: "Jail Road", phone: "0300 1122334", showPhone: true, note: "Ventilators, monitors, infusion pumps. On-site visits.", rating: 4.7, jobs: 210 },
  { id: "sv2", name: "Ultrasound & Imaging Servicing", provider: "ImageCare Technical", city: "Karachi", area: "Saddar", phone: "", showPhone: false, note: "Probe repair, calibration, AMC contracts.", rating: 4.5, jobs: 132 },
  { id: "sv3", name: "Lab Analyzer Calibration", provider: "Precision Lab Services", city: "Islamabad", area: "G-9", phone: "051 4477881", showPhone: true, note: "Hematology and chemistry analyzers.", rating: 4.8, jobs: 96 },
  { id: "sv4", name: "Dental Unit Installation & Repair", provider: "DentTech Care", city: "Faisalabad", area: "Susan Road", phone: "0321 9988776", showPhone: true, note: "Chairs, compressors, autoclaves.", rating: 4.4, jobs: 74 },
  { id: "sv5", name: "Hospital Furniture Maintenance", provider: "FixIt Medical", city: "Peshawar", area: "University Road", phone: "", showPhone: false, note: "Beds, trolleys, OT tables.", rating: 4.2, jobs: 51 },
];

function MarketHubScreen({ initialQuery, onBack, onMenu, onOpenSeller, onSendMessage, onReport, reportedIds, listings, canSell, requireAuth = (r, fn) => fn(), isSaved = () => false, onToggleSave = () => {} }) {
  const [tab, setTab] = useState("buy");          // buy | sell | services
  const [text, setText] = useState(initialQuery || "");
  const [city, setCity] = useState("");
  const [cond, setCond] = useState("All");
  const [sheet, setSheet] = useState(null);
  const [msgTarget, setMsgTarget] = useState(null);
  const [msgDraft, setMsgDraft] = useState("");
  const [sentTo, setSentTo] = useState({});
  const [openItem, setOpenItem] = useState(null);
  const [shareItem, setShareItem] = useState(null);
  const [photoIdx, setPhotoIdx] = useState(0);
  const waLink = (phone, item) => {
    const d = String(phone || "").replace(/\D/g, "").replace(/^0/, "");
    const text = `Assalam o Alaikum, I saw your listing "${item.name}" on PakMed. Is it still available?\n— sent via PakMed · pakmed.app`;
    return `https://wa.me/92${d}?text=${encodeURIComponent(text)}`;
  };

  const userListings = (listings || []).filter((l) => l.status === "live").map((l) => ({
    id: l.id, name: l.name, category: l.category, condition: l.condition,
    price: l.price, priceTo: l.priceTo, seller: "Your listing", city: "", area: "", phone: "", showPhone: false,
    note: l.notes || "", kind: "product", mine: true, photos: l.photos, coverIndex: l.coverIndex,
    stock: l.stock, delivery: l.delivery, warranty: l.warranty,
  }));

  const allItems = [...userListings, ...SEED_MARKET_ITEMS];
  const t = text.trim().toLowerCase();

  const items = allItems.filter((i) =>
    (!city || (i.city || "").toLowerCase() === city.toLowerCase()) &&
    (cond === "All" || (i.condition || "").toLowerCase().includes(cond.toLowerCase())) &&
    (!t || [i.name, i.category, i.seller, i.city, i.area].filter(Boolean).some((v) => v.toLowerCase().includes(t)))
  );

  const services = SEED_SERVICES.filter((sv) =>
    (!city || sv.city.toLowerCase() === city.toLowerCase()) &&
    (!t || [sv.name, sv.provider, sv.city, sv.area].some((v) => v.toLowerCase().includes(t)))
  );

  const cityOptions = [...new Set([...CITIES, ...SEED_MARKET_ITEMS.map((i) => i.city)])].sort();

  const send = () => {
    if (!msgDraft.trim() || !msgTarget) return;
    onSendMessage({ business: msgTarget.seller || msgTarget.provider, product: msgTarget.name, text: msgDraft.trim() });
    setSentTo((p) => ({ ...p, [msgTarget.id]: true }));
    setMsgDraft(""); setMsgTarget(null);
  };

  const TabBtn = ({ k, label }) => (
    <button onClick={() => setTab(k)}
      className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
      style={{ backgroundColor: tab === k ? INK : "transparent", color: tab === k ? "white" : SUBTLE }}>
      {label}
    </button>
  );

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Healthcare Market" subtitle="Buy, sell, service and repair" onBack={onBack} onMenu={onMenu} />

      {/* Buy / Sell / Services */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex gap-1 p-1 rounded-2xl" style={{ backgroundColor: "white", border: `1px solid ${CARD_BORDER}` }}>
          <TabBtn k="buy" label="Buy" />
          <TabBtn k="sell" label="Sell" />
          <TabBtn k="services" label="Services & Repair" />
        </div>
      </div>

      {/* search + minimal filters (buy & services only) */}
      {tab !== "sell" && (
        <div className="px-3 pb-2 shrink-0">
          <div className="relative mb-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: SUBTLE }} />
            <input value={text} onChange={(e) => setText(e.target.value)}
              placeholder={tab === "buy" ? "What are you looking for?" : "Search a service or provider"}
              className="w-full text-[14.5px] rounded-xl pl-10 pr-9 py-3 outline-none"
              style={{ backgroundColor: "white", color: INK, border: `1px solid ${CARD_BORDER}` }} />
            {text && <button onClick={() => setText("")} className="absolute right-3.5 top-1/2 -translate-y-1/2"><X className="w-4 h-4" style={{ color: SUBTLE }} /></button>}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            <FilterPill label="Near me" value={city} onClick={() => setSheet("city")} onClear={() => setCity("")} />
            {tab === "buy" && CONDITION_FILTER.map((c) => (
              <button key={c} onClick={() => setCond(c)}
                className="shrink-0 px-3 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
                style={{ backgroundColor: cond === c ? INK : "white", color: cond === c ? "white" : INK, border: `1.5px solid ${cond === c ? INK : CARD_BORDER}` }}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">

        {/* ---------- BUY ---------- */}
        {tab === "buy" && (
          <>
            <p className="text-[14px] font-bold mb-2" style={{ color: INK, letterSpacing: "-0.01em" }}>
              {items.length} item{items.length !== 1 ? "s" : ""}{city ? ` near ${city}` : " nationwide"}
            </p>
            {items.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <Store className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
                <p className="text-[13.5px]" style={{ color: SUBTLE }}>Nothing matches. Try a nearby city or clear a filter.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {items.map((i) => (
                  <div key={i.id} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                    <div className="flex items-start gap-3 cursor-pointer" onClick={() => { setPhotoIdx(i.coverIndex || 0); setOpenItem(i); }}>
                      {i.photos && i.photos.length ? (
                        <img src={i.photos[i.coverIndex] || i.photos[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EFF2FA" }}>
                          <Store className="w-5 h-5" style={{ color: SUBTLE }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{ color: i.condition === "New" ? GREEN : SUBTLE, backgroundColor: i.condition === "New" ? GREEN_TINT : "#EFF2FA" }}>
                            {i.condition}
                          </span>
                          {i.mine && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ color: VIOLET, backgroundColor: VIOLET_TINT }}>Yours</span>}
                        </div>
                        <p className="text-[15px] font-semibold leading-snug" style={{ color: INK }}>{i.name}</p>
                        <p className="text-[16px] font-bold mt-0.5" style={{ color: INK }}>PKR {i.price}</p>
                        <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}>{i.seller}{i.city ? ` · ${i.area}, ${i.city}` : ""}</p>
                        {i.note && <p className="text-[12px] mt-1 leading-snug" style={{ color: "#4B4A45" }}>{i.note}</p>}
                      </div>
                    </div>
                    {!i.mine && (
                      <div className="flex items-center gap-2 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                        <button onClick={() => requireAuth("contact this seller", () => setMsgTarget(i))}
                          className="flex-1 py-2.5 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                          style={{ backgroundColor: sentTo[i.id] ? GREEN_TINT : BRAND, color: sentTo[i.id] ? GREEN : "white" }}>
                          {sentTo[i.id] ? <><Check className="w-3.5 h-3.5" /> Message sent</> : <><MessageSquareText className="w-3.5 h-3.5" /> Contact seller</>}
                        </button>
                        <SaveButton saved={isSaved("market", i.id)} onClick={() => onToggleSave("market", i)} />
                        <ReportButton reported={reportedIds && reportedIds.has(i.id)}
                          onClick={() => onReport({ id: i.id, type: "listing", title: i.name, subtitle: `${i.seller} · ${i.city}` })} />
                      </div>
                    )}
                    {i.showPhone && i.phone && <p className="text-[12px] mt-2" style={{ color: SUBTLE }}><IconText icon={Phone}>{i.phone}</IconText></p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- SELL ---------- */}
        {tab === "sell" && (
          <>
            <button onClick={onOpenSeller}
              className="w-full rounded-2xl p-4 flex items-center gap-3.5 mb-3 active:scale-[0.98] transition-transform"
              style={{ backgroundColor: INK }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFFFF22" }}>
                <Upload className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-[15px] font-semibold text-white">List something for sale</p>
                <p className="text-[12.5px] mt-0.5 text-white/70">Products, equipment or supplies — new or used</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>

            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Your listings</p>
              <span className="text-[12px]" style={{ color: SUBTLE }}>{(listings || []).length}</span>
            </div>

            {(listings || []).length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <Store className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
                <p className="text-[13.5px]" style={{ color: SUBTLE }}>You haven't listed anything yet.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {listings.map((l) => (
                  <button key={l.id} onClick={onOpenSeller} className="rounded-2xl bg-white p-3.5 text-left" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                    <div className="flex items-center gap-3">
                      {l.photos && l.photos.length ? (
                        <img src={l.photos[l.coverIndex] || l.photos[0]} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#EFF2FA" }}>
                          <Store className="w-5 h-5" style={{ color: SUBTLE }} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14.5px] font-semibold truncate" style={{ color: INK }}>{l.name}</p>
                        <p className="text-[13px] font-bold" style={{ color: INK }}>PKR {l.price}</p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ color: l.status === "live" ? GREEN : SUBTLE, backgroundColor: l.status === "live" ? GREEN_TINT : "#EFF2FA" }}>
                        {l.status === "live" ? "Live" : l.status === "sold" ? "Sold" : "Hidden"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* ---------- SERVICES & REPAIR ---------- */}
        {tab === "services" && (
          <>
            <p className="text-[14px] font-bold mb-2" style={{ color: INK, letterSpacing: "-0.01em" }}>
              {services.length} provider{services.length !== 1 ? "s" : ""}{city ? ` near ${city}` : ""}
            </p>
            {services.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <p className="text-[13.5px]" style={{ color: SUBTLE }}>No providers match. Try another city.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {services.map((sv) => (
                  <div key={sv.id} className="rounded-2xl bg-white p-3.5" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-[14px]" style={{ backgroundColor: VIOLET }}>
                        {sv.provider[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold leading-snug" style={{ color: INK }}>{sv.name}</p>
                        <p className="text-[12.5px] mt-0.5" style={{ color: VIOLET }}>{sv.provider}</p>
                        <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}><IconText icon={MapPin}>{sv.area}, {sv.city} · {sv.rating}★ ({sv.jobs} jobs)</IconText></p>
                        <p className="text-[12px] mt-1 leading-snug" style={{ color: "#4B4A45" }}>{sv.note}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2.5 pt-2.5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                      <button onClick={() => setMsgTarget(sv)}
                        className="flex-1 py-2.5 rounded-full text-[12.5px] font-semibold flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: sentTo[sv.id] ? GREEN_TINT : VIOLET, color: sentTo[sv.id] ? GREEN : "white" }}>
                        {sentTo[sv.id] ? <><Check className="w-3.5 h-3.5" /> Request sent</> : <><MessageSquareText className="w-3.5 h-3.5" /> Request service</>}
                      </button>
                      <ReportButton reported={reportedIds && reportedIds.has(sv.id)}
                        onClick={() => onReport({ id: sv.id, type: "service", title: sv.name, subtitle: sv.provider })} />
                    </div>
                    {sv.showPhone && sv.phone && <p className="text-[12px] mt-2" style={{ color: SUBTLE }}><IconText icon={Phone}>{sv.phone}</IconText></p>}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {openItem && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpenItem(null)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ height: "88%", fontFamily: FONT }}>
            <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
              <span className="w-9" />
              <span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D0D5DD" }} />
              <button onClick={() => setOpenItem(null)} className="w-9 h-9 rounded-full flex items-center justify-center" aria-label="Close">
                <X className="w-5 h-5" style={{ color: SUBTLE }} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
              {/* gallery */}
              {openItem.photos && openItem.photos.length ? (
                <>
                  <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "4 / 3", border: `1px solid ${CARD_BORDER}` }}>
                    <img src={openItem.photos[photoIdx] || openItem.photos[0]} alt="" className="w-full h-full object-cover" />
                  </div>
                  {openItem.photos.length > 1 && (
                    <div className="flex gap-1.5 mt-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                      {openItem.photos.map((src, k) => (
                        <button key={k} onClick={() => setPhotoIdx(k)} className="shrink-0 rounded-lg overflow-hidden"
                          style={{ width: 54, height: 54, border: `2px solid ${k === photoIdx ? BRAND : "transparent"}` }}>
                          <img src={src} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl flex flex-col items-center justify-center" style={{ aspectRatio: "4 / 3", backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>
                  <Store className="w-10 h-10" style={{ color: FAINT }} />
                  <p className="text-[12px] mt-2" style={{ color: FAINT }}>No photos added</p>
                </div>
              )}

              <div className="flex items-center gap-1.5 mt-3.5 flex-wrap">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{ color: openItem.condition === "New" ? GREEN : INK_2, backgroundColor: openItem.condition === "New" ? GREEN_TINT : CREAM, border: `1px solid ${CARD_BORDER}` }}>
                  {openItem.condition}
                </span>
                {openItem.category && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: INK_2, backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>{openItem.category}</span>}
                {openItem.stock && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ color: VIOLET, backgroundColor: VIOLET_TINT }}>{openItem.stock}</span>}
              </div>

              <p className="text-[20px] font-extrabold mt-2 leading-tight" style={{ color: INK, letterSpacing: "-0.025em" }}>{openItem.name}</p>
              <p className="text-[22px] font-extrabold mt-1" style={{ color: INK }}>
                PKR {openItem.price}{openItem.priceTo ? ` – ${openItem.priceTo}` : ""}
              </p>

              {(openItem.delivery && openItem.delivery.length > 0) || openItem.warranty ? (
                <div className="mt-3.5 rounded-xl" style={{ border: `1px solid ${CARD_BORDER}` }}>
                  {openItem.delivery && openItem.delivery.length > 0 && (
                    <div className="flex gap-3 px-3 py-2.5">
                      <span className="text-[12.5px] w-[34%] shrink-0" style={{ color: SUBTLE }}>Delivery</span>
                      <span className="text-[13px] font-semibold" style={{ color: INK }}>{openItem.delivery.join(", ")}</span>
                    </div>
                  )}
                  {openItem.warranty && (
                    <div className="flex gap-3 px-3 py-2.5" style={{ borderTop: openItem.delivery && openItem.delivery.length ? `1px solid ${CARD_BORDER}` : "none" }}>
                      <span className="text-[12.5px] w-[34%] shrink-0" style={{ color: SUBTLE }}>Warranty</span>
                      <span className="text-[13px] font-semibold" style={{ color: INK }}>{openItem.warranty}</span>
                    </div>
                  )}
                </div>
              ) : null}

              {openItem.note && (
                <>
                  <p className="text-[14px] font-bold mt-4 mb-1" style={{ color: INK }}>Description</p>
                  <p className="text-[13.5px] leading-relaxed" style={{ color: INK_2 }}>{openItem.note}</p>
                </>
              )}

              {/* seller block */}
              <p className="text-[14px] font-bold mt-4 mb-2" style={{ color: INK }}>Seller</p>
              <div className="rounded-xl p-3 flex items-center gap-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white font-extrabold" style={{ backgroundColor: VIOLET }}>
                  {(openItem.seller || "?")[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold truncate" style={{ color: INK }}>{openItem.seller}</p>
                  <p className="text-[12px] flex items-center gap-1 truncate" style={{ color: SUBTLE }}>
                    <MapPin className="w-3 h-3 shrink-0" /> {[openItem.area, openItem.city].filter(Boolean).join(", ") || "Location shared on contact"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: AMBER_TINT }}>
                <p className="text-[12px] leading-snug" style={{ color: AMBER }}>
                  <b>Stay safe:</b> inspect items before paying, and never send an advance payment to someone you haven't met.
                </p>
              </div>
            </div>

            {/* actions */}
            <div className="shrink-0 bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <div className="flex items-center px-2 pt-1.5">
                {[
                  { k: "save", icon: Bookmark, label: isSaved("market", openItem.id) ? "Saved" : "Save", on: isSaved("market", openItem.id),
                    fn: () => onToggleSave("market", openItem) },
                  { k: "share", icon: Repeat2, label: "Share", fn: () => requireAuth("share this listing", () => setShareItem(openItem)) },
                  ...(!openItem.mine ? [{ k: "report", icon: Flag, label: reportedIds && reportedIds.has(openItem.id) ? "Reported" : "Report",
                    on: reportedIds && reportedIds.has(openItem.id),
                    fn: () => onReport({ id: openItem.id, type: "listing", title: openItem.name, subtitle: `${openItem.seller} · ${openItem.city}` }) }] : []),
                ].map((a) => (
                  <button key={a.k} onClick={a.fn} className="flex-1 flex flex-col items-center gap-0.5 py-1.5">
                    <a.icon className="w-5 h-5" strokeWidth={2} fill={a.on ? (a.k === "report" ? RED : BRAND) : "none"} stroke={a.on ? (a.k === "report" ? RED : BRAND) : INK_2} />
                    <span className="text-[11px] font-medium" style={{ color: a.on ? (a.k === "report" ? RED : BRAND) : SUBTLE }}>{a.label}</span>
                  </button>
                ))}
              </div>
              <div className="px-4 pt-1 pb-3 flex gap-2">
                {openItem.mine ? (
                  <button onClick={() => { setOpenItem(null); onOpenSeller(); }} className="flex-1 h-12 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: BRAND }}>
                    <Pencil className="w-4 h-4" /> Edit listing
                  </button>
                ) : (
                  <>
                    {openItem.showPhone && openItem.phone && (
                      <button
                        onClick={() => requireAuth("contact this seller", () => { try { window.open(waLink(openItem.phone, openItem), "_blank"); } catch (e) {} })}
                        className="px-4 h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-1.5"
                        style={{ color: "#128C3E", border: "1.5px solid #1DA851" }}>
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="#1DA851"><path d={ICON_PATHS.whatsapp} /></svg>
                        WhatsApp
                      </button>
                    )}
                    <button
                      onClick={() => requireAuth("contact this seller", () => { setMsgTarget(openItem); setOpenItem(null); })}
                      className="flex-1 h-12 rounded-xl text-[14px] font-bold text-white flex items-center justify-center gap-2" style={{ backgroundColor: BRAND }}>
                      <MessageSquareText className="w-4 h-4" /> Message seller
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {shareItem && <ShareSheet card={{ id: shareItem.id, title: `${shareItem.name} — PKR ${shareItem.price}` }} onClose={() => setShareItem(null)} />}

      {sheet === "city" && (
        <FilterSheet title="Choose city" options={cityOptions} selected={city} onSelect={setCity} onClose={() => setSheet(null)} allowFree freeLabel="Search any city…" />
      )}

      {msgTarget && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setMsgTarget(null)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
              <span className="w-8" />
              <p className="font-bold text-[15px]" style={{ color: INK }}>Send a message</p>
              <button onClick={() => setMsgTarget(null)}><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
            </div>
            <div className="p-5">
              <p className="text-[13.5px] font-semibold" style={{ color: INK }}>{msgTarget.seller || msgTarget.provider}</p>
              <p className="text-[11.5px] mb-3" style={{ color: SUBTLE }}>Re: {msgTarget.name}</p>
              <textarea value={msgDraft} onChange={(e) => setMsgDraft(e.target.value)} rows={4}
                placeholder={`Is the ${msgTarget.name} still available? What's your best price?`}
                className="w-full text-[14px] rounded-xl px-3.5 py-3 outline-none resize-none"
                style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }} />
              <button onClick={send} disabled={!msgDraft.trim()}
                className="w-full mt-3 py-3.5 rounded-full font-semibold text-[14px] transition-opacity"
                style={{ backgroundColor: INK, color: "white", opacity: msgDraft.trim() ? 1 : 0.4 }}>
                Send message
              </button>
            </div>
          </div>
        </div>
      )}
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

        <div className="flex flex-col gap-2.5">
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
            <div className="flex flex-col gap-2.5">
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

const CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad", "Sialkot", "Gujranwala", "Bahawalpur"];

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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl">
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b" style={{ borderColor: CARD_BORDER }}>
          <span className="w-8" />
          <p className="font-bold text-[15px]" style={{ color: INK }}>Share job post</p>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>
        <div className="px-5 py-5">
          <div className="grid grid-cols-3 gap-y-5">
            {opts.map((o) => (
              <button key={o.key} onClick={o.act} className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: o.bg, border: o.key === "cp" ? `1px solid ${CARD_BORDER}` : "none" }}>
                  {o.icon}
                </div>
                <span className="text-[11.5px] font-medium" style={{ color: INK }}>{o.label}</span>
              </button>
            ))}
          </div>
          {copied && (
            <p className="text-center text-[12.5px] font-medium mt-4 py-2 rounded-full" style={{ color: GREEN, backgroundColor: GREEN_TINT }}>
              Job text copied — paste it into your post
            </p>
          )}
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

/* ---------- the funnel ---------- */
const FUNNEL_STEPS = ["Facility", "Role", "Timing", "Salary", "Requirements", "Photos", "Preview"];

function PostJobScreen({ onBack, onMenu, postedJobs, onPublish, canPost, onNeedProfile, known = {} }) {
  const [view, setView] = useState("list");   // list | funnel
  const [step, setStep] = useState(0);
  const [job, setJob] = useState({ ...EMPTY_JOB });
  const [shareOpen, setShareOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [cardNote, setCardNote] = useState("");
  const cardRef = useRef(null);
  const [q, setQ] = useState({ facility: "", city: "", title: "", shift: "", pay: "", req: "" });
  const [extra, setExtra] = useState({ facility: [], city: [], title: [], shift: [], pay: [], req: [] });
  const setQuery = (k, v) => setQ((p) => ({ ...p, [k]: v }));

  const galleryRef = useRef(null);
  const cameraRef = useRef(null);
  const [photoError, setPhotoError] = useState("");
  const MAX_PHOTOS = 6;

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    const room = MAX_PHOTOS - job.photos.length;
    if (room <= 0) { setPhotoError(`You can add up to ${MAX_PHOTOS} photos.`); return; }
    const take = files.slice(0, room);
    if (files.length > room) setPhotoError(`Only ${room} more photo${room > 1 ? "s" : ""} could be added.`);
    else setPhotoError("");

    take.forEach((f) => {
      if (!f.type.startsWith("image/")) { setPhotoError("Only image files can be added."); return; }
      if (f.size > 8 * 1024 * 1024) { setPhotoError(`"${f.name}" is over 8 MB.`); return; }
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          // downscale to keep storage small
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
  const addExtra = (k, v, apply) => {
    setExtra((p) => (p[k].some((x) => (x.label || x).toLowerCase() === v.toLowerCase()) ? p : { ...p, [k]: [...p[k], v] }));
    apply(v);
  };

  const set = (k, v) => setJob((p) => ({ ...p, [k]: v }));
  const toggleIn = (k, v) => set(k, job[k].includes(v) ? job[k].filter((x) => x !== v) : [...job[k], v]);
  const tpl = CARD_TEMPLATES.find((t) => t.id === job.templateId);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(""), 3000); };

  const stepValid = [
    job.facilityName && job.facilityTypeLabel && job.city,
    !!job.jobTitle,
    job.shifts.length > 0,
    !!job.payAmount,
    true,
    true,
    true,
  ];

  const saveJob = (status) => {
    const rec = { ...job, id: `job-${Date.now()}`, posted: "Just now", applicants: 0, status };
    onPublish(rec);
    return rec;
  };

  const startNew = () => { setJob({ ...EMPTY_JOB }); setStep(0); setView("funnel"); };

  const downloadCard = () => {
    const html = cardRef.current ? cardRef.current.innerHTML : "";
    if (!html) return;
    const w = window.open("", "_blank");
    if (!w) { setCardNote("Pop-ups are blocked. Allow pop-ups, then tap Download again."); return; }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Job Card</title>
      <style>@page{size:A5;margin:8mm}html,body{margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
      body{display:flex;align-items:center;justify-content:center}
      .wrap{width:340px}</style></head><body><div class="wrap">${html}</div></body></html>`);
    w.document.close();
    setCardNote("Print dialog opened — choose \u201cSave as PDF\u201d or your printer.");
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 400);
  };

  /* ---- big tappable option button ---- */
  const OptionCard = ({ on, onClick, icon, label, sub }) => (
    <button
      onClick={onClick}
      className="rounded-2xl p-3.5 flex items-center gap-3 text-left transition-colors active:scale-[0.97]"
      style={{ backgroundColor: on ? NAVY : "white", border: `1.5px solid ${on ? NAVY : CARD_BORDER}` }}
    >
      {icon && (
        <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: on ? "rgba(255,255,255,.18)" : BRAND_50 }}>
          <Glyph icon={icon} size={19} color={on ? "#fff" : BRAND} />
        </span>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[14.5px] font-semibold" style={{ color: on ? "white" : INK }}>{label}</p>
        {sub && <p className="text-[11.5px] mt-0.5" style={{ color: on ? "#FFFFFFAA" : SUBTLE }}>{sub}</p>}
      </div>
      {on && <Check className="w-5 h-5 shrink-0 text-white" strokeWidth={3} />}
    </button>
  );

  const inputCls = "w-full text-[15px] rounded-xl px-4 py-3 outline-none";
  const inputStyle = { backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` };
  const Q = ({ children }) => <p className="text-[16px] font-bold mb-2.5" style={{ color: INK }}>{children}</p>;

  /* ================= LIST ================= */
  if (view === "list") {
    return (
      <div className="flex flex-col h-full min-h-0">
        <ScreenHeader title="Post a Job" subtitle="Your vacancies" onBack={onBack} onMenu={onMenu} />
        <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
          {toast && (
            <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ backgroundColor: GREEN_TINT }}>
              <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GREEN }} />
              <p className="text-[12.5px]" style={{ color: GREEN }}>{toast}</p>
            </div>
          )}

          <button onClick={startNew} className="w-full rounded-2xl p-4 flex items-center gap-3.5 mb-3 active:scale-[0.98] transition-transform" style={{ backgroundColor: NAVY }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "#FFFFFF22" }}>
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[15.5px] font-semibold text-white">Post a job</p>
              <p className="text-[12.5px] mt-0.5 text-white/70">Takes about 2 minutes</p>
            </div>
            <ChevronRight className="w-5 h-5 shrink-0 text-white/60" />
          </button>

          <div className="flex items-center justify-between mt-4 mb-1.5">
            <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>Your job posts</p>
            <span className="text-[12px]" style={{ color: SUBTLE }}>{postedJobs.length}</span>
          </div>

          {postedJobs.length === 0 ? (
            <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <Briefcase className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
              <p className="text-[13.5px]" style={{ color: SUBTLE }}>Nothing posted yet. Saved and posted jobs appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {postedJobs.map((j) => {
                const t = CARD_TEMPLATES.find((x) => x.id === j.templateId) || CARD_TEMPLATES[0];
                const jt = j.jobTitle;
                return (
                  <div key={j.id} className="rounded-2xl bg-white p-3.5 flex gap-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                    <div style={{ width: 52, borderRadius: 10, overflow: "hidden", flexShrink: 0, position: "relative", height: 65 }}>
                      <div style={{ transform: "scale(0.19)", transformOrigin: "top left", width: 274, position: "absolute", top: 0, left: 0 }}>
                        <JobPostCard job={j} tpl={t} scale={1} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                          style={{ color: j.status === "posted" ? GREEN : SUBTLE, backgroundColor: j.status === "posted" ? GREEN_TINT : "#EFF2FA" }}>
                          {j.status === "posted" ? "Posted" : "Saved"}
                        </span>
                      </div>
                      <p className="text-[14.5px] font-semibold leading-snug truncate" style={{ color: INK }}>{jt}</p>
                      <p className="text-[12.5px] mt-0.5 truncate" style={{ color: SUBTLE }}>{j.facilityName} · {j.city}</p>
                      <p className="text-[13px] font-bold mt-1" style={{ color: NAVY }}>
                        PKR {j.payAmount} <span className="text-[11px] font-medium" style={{ color: SUBTLE }}>{j.payUnitLabel || ""}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ================= FUNNEL ================= */
  const isLast = step === FUNNEL_STEPS.length - 1;

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader
        title={FUNNEL_STEPS[step]}
        subtitle={`Step ${step + 1} of ${FUNNEL_STEPS.length}`}
        onBack={() => (step === 0 ? setView("list") : setStep(step - 1))}
        onMenu={onMenu}
      />

      {/* progress */}
      <div className="px-3 pb-2 shrink-0">
        <div className="flex gap-1">
          {FUNNEL_STEPS.map((_, i) => (
            <span key={i} className="h-1.5 rounded-full flex-1 transition-colors" style={{ backgroundColor: i <= step ? NAVY : "#D3D9EC" }} />
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">

        {/* ---- 0 FACILITY ---- */}
        {step === 0 && (
          <>
            <Q>What kind of place is hiring?</Q>
            <SearchPicker
              query={q.facility}
              onQuery={(v) => setQuery("facility", v)}
              placeholder="Search type or add your own…"
              options={[...FACILITY_TYPES.map((f) => ({ label: f.label, icon: f.icon })), ...extra.facility.map((l) => ({ label: l, icon: Plus }))]}
              selected={job.facilityTypeLabel || ""}
              onSelect={(v) => { set("facilityTypeLabel", v); set("facilityType", (FACILITY_TYPES.find((f) => f.label === v) || {}).key || "other"); }}
              onAddCustom={(v) => addExtra("facility", v, (val) => { set("facilityTypeLabel", val); set("facilityType", "other"); })}
            />

            <div className="mt-5">
              <Q>Name of the place</Q>
              <input value={job.facilityName} onChange={(e) => set("facilityName", e.target.value)} placeholder="e.g. Aga Care Hospital" className={inputCls} style={inputStyle} />
            </div>

            <div className="mt-5">
              <Q>City</Q>
              <SearchPicker
                query={q.city}
                onQuery={(v) => setQuery("city", v)}
                placeholder="Search city or add your own…"
                options={[...CITIES, ...extra.city]}
                selected={job.city}
                onSelect={(v) => set("city", v)}
                onAddCustom={(v) => addExtra("city", v, (val) => set("city", val))}
              />
            </div>

            <Q>Area or road <span className="text-[13px] font-normal" style={{ color: SUBTLE }}>(optional)</span></Q>
            <input value={job.area} onChange={(e) => set("area", e.target.value)} placeholder="e.g. Susan Road" className={inputCls} style={inputStyle} />
            <AutoFill hint={known.facilityArea} current={job.area} onUse={(v) => set("area", v)} />
          </>
        )}

        {/* ---- 1 ROLE ---- */}
        {step === 1 && (
          <>
            <Q>Who do you need to hire?</Q>
            <SearchPicker
              query={q.title}
              onQuery={(v) => setQuery("title", v)}
              placeholder="Search role or add your own…"
              options={[...JOB_TITLES.filter((t) => t !== "Other"), ...extra.title]}
              selected={job.jobTitle}
              onSelect={(v) => set("jobTitle", v)}
              onAddCustom={(v) => addExtra("title", v, (val) => set("jobTitle", val))}
            />
          </>
        )}

        {/* ---- 2 TIMING ---- */}
        {step === 2 && (
          <>
            <Q>Which shift? <span className="text-[13px] font-normal" style={{ color: SUBTLE }}>Choose one or more</span></Q>
            <SearchPicker
              query={q.shift}
              onQuery={(v) => setQuery("shift", v)}
              placeholder="Search shift or add your own…"
              multi
              options={[...SHIFTS.map((sh) => ({ label: sh.label, icon: sh.icon, sub: sh.sub })), ...extra.shift.map((l) => ({ label: l, icon: Clock }))]}
              selected={job.shifts}
              onSelect={(v) => toggleIn("shifts", v)}
              onAddCustom={(v) => addExtra("shift", v, (val) => toggleIn("shifts", val))}
              renderOption={(list, isOn, onSel) => (
                <div className="flex flex-col gap-2">
                  {list.map((o) => (
                    <OptionCard key={o.label} on={isOn(o.label)} onClick={() => onSel(o.label)} icon={o.icon} label={o.label} sub={o.sub} />
                  ))}
                </div>
              )}
            />
            <div className="mb-5" />
            <Q>When does it start? <span className="text-[13px] font-normal" style={{ color: SUBTLE }}>(optional)</span></Q>
            <input value={job.startDate} onChange={(e) => set("startDate", e.target.value)} placeholder="e.g. Immediately / 1 September" className={inputCls} style={inputStyle} />
          </>
        )}

        {/* ---- 3 SALARY ---- */}
        {step === 3 && (
          <>
            <Q>How much is the pay?</Q>
            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-bold" style={{ color: SUBTLE }}>PKR</span>
              <input
                value={job.payAmount}
                onChange={(e) => set("payAmount", e.target.value.replace(/[^0-9,]/g, ""))}
                placeholder="50,000"
                inputMode="numeric"
                className="w-full text-[19px] font-bold rounded-xl pl-14 pr-4 py-3.5 outline-none"
                style={inputStyle}
              />
            </div>
            <Q>Paid how often?</Q>
            <SearchPicker
              query={q.pay}
              onQuery={(v) => setQuery("pay", v)}
              placeholder="Search or add your own…"
              options={[...PAY_UNITS.map((u) => u.label), ...extra.pay]}
              selected={job.payUnitLabel || (PAY_UNITS.find((u) => u.key === job.payUnit) || {}).label || ""}
              onSelect={(v) => { set("payUnitLabel", v); set("payUnit", (PAY_UNITS.find((u) => u.label === v) || {}).key || "custom"); }}
              onAddCustom={(v) => addExtra("pay", v, (val) => { set("payUnitLabel", val); set("payUnit", "custom"); })}
            />
            <div className="mb-4" />
            <p className="text-[12.5px] leading-snug px-1" style={{ color: SUBTLE }}>
              Posts that show a salary get far more applications than ones that say "negotiable".
            </p>
          </>
        )}

        {/* ---- 4 REQUIREMENTS ---- */}
        {step === 4 && (
          <>
            <Q>Any requirements? <span className="text-[13px] font-normal" style={{ color: SUBTLE }}>(optional)</span></Q>
            <SearchPicker
              query={q.req}
              onQuery={(v) => setQuery("req", v)}
              placeholder="Search requirement or add your own…"
              multi
              options={[...COMMON_REQUIREMENTS, ...extra.req]}
              selected={job.requirements}
              onSelect={(v) => toggleIn("requirements", v)}
              onAddCustom={(v) => addExtra("req", v, (val) => toggleIn("requirements", val))}
            />
            <div className="mb-5" />

            <Q>Anything else to add?</Q>
            <textarea
              value={job.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Duties, department, or anything applicants should know"
              rows={3}
              className="w-full text-[15px] rounded-xl px-4 py-3 outline-none resize-none mb-5"
              style={inputStyle}
            />

            <Q>Who should they contact?</Q>
            <AutoFillAll
              label="Use my contact details"
              pairs={[
                { hint: known.contactPerson, current: job.contactName,   set: (v) => set("contactName", v) },
                { hint: known.facilityPhone, current: job.contactNumber, set: (v) => set("contactNumber", v) },
              ]}
            />
            <input value={job.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Name or department" className={inputCls} style={inputStyle} />
            <AutoFill hint={known.contactPerson} current={job.contactName} onUse={(v) => set("contactName", v)} />
            <input value={job.contactNumber} onChange={(e) => set("contactNumber", e.target.value)} placeholder="03XX XXXXXXX" inputMode="tel" className={inputCls + " mt-2.5"} style={inputStyle} />
            <AutoFill hint={known.facilityPhone} current={job.contactNumber} onUse={(v) => set("contactNumber", v)} />
            <button onClick={() => set("showNumber", !job.showNumber)} className="w-full flex items-center gap-3 mt-3">
              <span className="w-12 h-7 rounded-full flex items-center px-0.5 shrink-0 transition-colors"
                style={{ backgroundColor: job.showNumber ? GREEN : "#D3D9EC", justifyContent: job.showNumber ? "flex-end" : "flex-start" }}>
                <span className="w-6 h-6 rounded-full bg-white block" />
              </span>
              <span className="text-[13px] text-left flex-1" style={{ color: "#4B4A45" }}>
                Show my number on the post
              </span>
            </button>
          </>
        )}

        {/* ---- 5 PHOTOS ---- */}
        {step === 5 && (
          <>
            <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotos} />
            <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotos} />

            <Q>Add photos <span className="text-[13px] font-normal" style={{ color: SUBTLE }}>(optional)</span></Q>
            <p className="text-[13px] mb-3 leading-snug" style={{ color: SUBTLE }}>
              A picture of your facility, department or team helps your post stand out. Up to {MAX_PHOTOS} photos.
            </p>

            <div className="flex gap-2.5 mb-4">
              <button
                onClick={() => cameraRef.current?.click()}
                className="flex-1 rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform"
                style={{ backgroundColor: NAVY }}
              >
                <Camera className="w-6 h-6 text-white" />
                <span className="text-[13.5px] font-semibold text-white">Take Photo</span>
              </button>
              <button
                onClick={() => galleryRef.current?.click()}
                className="flex-1 rounded-2xl py-4 flex flex-col items-center gap-2 active:scale-[0.97] transition-transform"
                style={{ backgroundColor: "white", border: `1.5px solid ${CARD_BORDER}` }}
              >
                <Upload className="w-6 h-6" style={{ color: NAVY }} />
                <span className="text-[13.5px] font-semibold" style={{ color: INK }}>Choose from Gallery</span>
              </button>
            </div>

            {photoError && (
              <div className="rounded-xl p-3 mb-3 flex items-start gap-2" style={{ backgroundColor: "#FBEBEC" }}>
                <X className="w-4 h-4 mt-0.5 shrink-0" style={{ color: RED }} />
                <p className="text-[12.5px]" style={{ color: RED }}>{photoError}</p>
              </div>
            )}

            {job.photos.length === 0 ? (
              <div className="rounded-2xl p-8 flex flex-col items-center text-center" style={{ border: `1.5px dashed ${CARD_BORDER}`, backgroundColor: "white" }}>
                <Camera className="w-9 h-9 mb-2" style={{ color: SUBTLE }} />
                <p className="text-[13.5px] font-semibold" style={{ color: INK }}>No photos yet</p>
                <p className="text-[12px] mt-1" style={{ color: SUBTLE }}>You can skip this and post without photos.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] font-semibold" style={{ color: INK_2 }}>
                    {job.photos.length} of {MAX_PHOTOS}
                  </p>
                  <p className="text-[11.5px]" style={{ color: SUBTLE }}>Tap a photo to make it the cover</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {job.photos.map((src, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden" style={{ aspectRatio: "1 / 1", border: `2px solid ${i === job.coverIndex ? NAVY : "transparent"}` }}>
                      <button onClick={() => set("coverIndex", i)} className="w-full h-full">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                      {i === job.coverIndex && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: NAVY, color: "white" }}>
                          COVER
                        </span>
                      )}
                      <button
                        onClick={() => removePhoto(i)}
                        className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,.55)" }}
                        aria-label="Remove photo"
                      >
                        <X className="w-3 h-3 text-white" strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  {job.photos.length < MAX_PHOTOS && (
                    <button
                      onClick={() => galleryRef.current?.click()}
                      className="rounded-xl flex flex-col items-center justify-center gap-1"
                      style={{ aspectRatio: "1 / 1", border: `1.5px dashed ${CARD_BORDER}`, backgroundColor: "white" }}
                    >
                      <span className="text-[20px] font-bold" style={{ color: SUBTLE }}>+</span>
                      <span className="text-[10.5px]" style={{ color: SUBTLE }}>Add</span>
                    </button>
                  )}
                </div>
              </>
            )}

            <p className="text-[11.5px] mt-3 leading-snug px-1" style={{ color: SUBTLE }}>
              Photos are resized automatically. Avoid images showing patients or confidential records.
            </p>
          </>
        )}

        {/* ---- 6 PREVIEW ---- */}
        {step === 6 && (
          <>
            <p className="text-[14px] font-bold mb-2" style={{ color: INK, letterSpacing: "-0.01em" }}>Choose a design</p>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: "none" }}>
              {CARD_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => set("templateId", t.id)}
                  className="shrink-0 rounded-xl px-3 py-2 text-[12.5px] font-semibold transition-colors"
                  style={{
                    background: t.bordered ? "white" : t.bg,
                    color: t.bordered ? INK : t.fg,
                    border: `2px solid ${job.templateId === t.id ? NAVY : "transparent"}`,
                  }}
                >
                  {t.name}
                </button>
              ))}
            </div>

            <div ref={cardRef}><JobPostCard job={job} tpl={tpl} scale={1} /></div>

            <div className="rounded-2xl bg-white p-3.5 mt-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>What next?</p>
              <div className="rounded-xl p-2.5 mb-1.5 flex items-start gap-2" style={{ backgroundColor: GREEN_TINT }}>
                <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: GREEN }} />
                <p className="text-[11.5px] leading-snug" style={{ color: GREEN }}>
                  Saved to your job posts automatically. Choose any option below as well.
                </p>
              </div>

              <button
                onClick={() => {
                  const go = () => { saveJob("posted"); flash("Posted on PakMed and saved."); setView("list"); };
                  if (canPost) go(); else onNeedProfile(go, {
                    facilityName: job.facilityName, facilityType: job.facilityTypeLabel,
                    city: job.city, address: job.area, area: job.area,
                    contactPerson: job.contactName, phone: job.contactNumber,
                  });
                }}
                className="w-full flex items-center gap-3 py-3 active:opacity-70"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: GREEN_TINT }}>
                  <Check className="w-5 h-5" strokeWidth={3} style={{ color: GREEN }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14.5px] font-semibold" style={{ color: INK }}>Post on PakMed</p>
                  <p className="text-[11.5px]" style={{ color: SUBTLE }}>Doctors can see and apply · saves automatically</p>
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

              <button onClick={downloadCard} className="w-full flex items-center gap-3 py-3 active:opacity-70">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: NAVY_TINT }}>
                  <Upload className="w-5 h-5" style={{ color: NAVY, transform: "rotate(180deg)" }} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[14.5px] font-semibold" style={{ color: INK }}>Download</p>
                  <p className="text-[11.5px]" style={{ color: SUBTLE }}>Save the job card to your device</p>
                </div>
              </button>
            </div>

            {cardNote && (
              <p className="text-[11.5px] text-center mt-2.5 px-2 py-2 rounded-xl" style={{ color: NAVY, backgroundColor: NAVY_TINT }}>{cardNote}</p>
            )}
          </>
        )}
      </div>

      {/* funnel footer nav */}
      {!isLast && (
        <div className="px-3 pb-3 pt-2 shrink-0 flex gap-2.5">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="px-5 py-3.5 rounded-full font-semibold text-[14px] flex items-center gap-1.5" style={{ backgroundColor: "#EFF2FA", color: INK }}>
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
          <button
            onClick={() => { const n = step + 1; if (n === FUNNEL_STEPS.length - 1) saveJob("saved"); setStep(n); }}
            disabled={!stepValid[step]}
            className="flex-1 py-3.5 rounded-full font-semibold text-[14px] flex items-center justify-center gap-2 transition-opacity"
            style={{ backgroundColor: NAVY, color: "white", opacity: stepValid[step] ? 1 : 0.4 }}
          >
            {step === FUNNEL_STEPS.length - 2 ? (job.photos.length ? "See preview" : "Skip & preview") : "Next"} <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {shareOpen && (
        <JobShareSheet
          job={job}
          onClose={() => setShareOpen(false)}
          onShared={() => { saveJob("posted"); flash("Shared and saved to your job posts."); setShareOpen(false); setView("list"); }}
        />
      )}
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
function FindJobScreen({ initialQuery, userCity, onBack, onMenu, postedJobs, onReport, reportedIds, jobSocial, onToggleLike, onToggleFav, onAddComment, onContact, onApply, hasApplied }) {
  const gate = useContext(AuthGate);
  const authed = gate.authed;
  // default to the user's city — unless they arrived with a specific search
  const [city, setCity] = useState(initialQuery ? "" : (userCity || ""));
  const [title, setTitle] = useState("");
  const [text, setText] = useState(initialQuery || "");
  const [sheet, setSheet] = useState(null);
  const [openJob, setOpenJob] = useState(null);
  const [shareJob, setShareJob] = useState(null);

  const all = [...postedJobs.filter((j) => j.status === "posted"), ...SEED_JOBS];
  const cityOptions = [...new Set([...CITIES, ...all.map((j) => j.city)])].filter(Boolean).sort();
  const titleOptions = [...new Set([...JOB_TITLES.filter((t) => t !== "Other"), ...all.map((j) => j.jobTitle)])].filter(Boolean).sort();

  const t = text.trim().toLowerCase();
  const results = all.filter((j) => {
    const cityOk = !city || (j.city || "").toLowerCase() === city.toLowerCase();
    const titleOk = !title || (j.jobTitle || "").toLowerCase().includes(title.toLowerCase());
    const textOk = !t || [j.jobTitle, j.facilityName, j.city, j.area, j.facilityTypeLabel, ...(j.requirements || [])]
      .filter(Boolean).some((v) => String(v).toLowerCase().includes(t));
    return cityOk && titleOk && textOk;
  });

  // if the default city has nothing, show everything (newest first) rather than an empty screen
  const cityFellBack = city && city === userCity && results.length === 0 && !title && !t;
  const shown = cityFellBack ? all : results;
  const narrowed = city || title || t;

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Find a Job" subtitle="Filter to narrow your search" onBack={onBack} onMenu={onMenu} />

      {/* search + filters */}
      <div className="px-3 pb-2 shrink-0">
        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: SUBTLE }} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type to search jobs, hospitals, areas…"
            className="w-full text-[14.5px] rounded-xl pl-10 pr-9 py-3 outline-none"
            style={{ backgroundColor: "white", color: INK, border: `1px solid ${CARD_BORDER}` }}
          />
          {text && (
            <button onClick={() => setText("")} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Clear search">
              <X className="w-4 h-4" style={{ color: SUBTLE }} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <FilterPill label="City" value={city} onClick={() => setSheet("city")} onClear={() => setCity("")} />
          <FilterPill label="Job Title" value={title} onClick={() => setSheet("title")} onClear={() => setTitle("")} />
          {narrowed && (
            <button onClick={() => { setCity(""); setTitle(""); setText(""); }} className="shrink-0 px-3 py-2 rounded-full text-[12.5px] font-semibold" style={{ color: RED, backgroundColor: "#FBEBEC" }}>
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {!narrowed && (
          <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#EAF0F8" }}>
            <p className="text-[13.5px] font-semibold mb-1" style={{ color: NAVY }}>Start with your city</p>
            <p className="text-[12.5px] leading-snug" style={{ color: "#3A4A66" }}>
              Pick a city, then a job title, to narrow {all.length} listings down to what's near you.
            </p>
          </div>
        )}

        <p className="text-[12.5px] mb-2" style={{ color: SUBTLE }}>
          {cityFellBack
            ? <>No jobs in <b style={{ color: INK }}>{city}</b> yet — showing the newest across Pakistan</>
            : <><b style={{ color: INK }}>{shown.length} job{shown.length !== 1 ? "s" : ""}</b>{city ? ` in ${city}` : ""}{title ? ` · ${title}` : ""}{t ? ` · "${text.trim()}"` : ""}</>}
        </p>
        {!authed && (
          <div className="rounded-xl p-3 mb-2.5 flex items-center gap-2.5" style={{ backgroundColor: BRAND_50, border: "1px solid #B9D3F2" }}>
            <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
            <p className="text-[12.5px] flex-1 leading-snug" style={{ color: BRAND_DK }}>Sign in to see employers, locations and contact details, and to apply.</p>
            <button onClick={() => gate.require("see full job details", null)} className="text-[12.5px] font-bold shrink-0" style={{ color: BRAND }}>Sign in</button>
          </div>
        )}

        {shown.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <Search className="w-8 h-8 mx-auto mb-2" style={{ color: SUBTLE }} />
            <p className="text-[13.5px]" style={{ color: SUBTLE }}>No jobs match these filters. Try a nearby city or clear a filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {shown.map((j) => (
              <div
                key={j.id}
                role="button"
                tabIndex={0}
                onClick={() => gate.require("see the employer and apply", () => setOpenJob(j))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    gate.require("see the employer and apply", () => setOpenJob(j));
                  }
                }}
                className="rounded-2xl bg-white p-3 text-left active:scale-[0.99] transition-transform cursor-pointer"
                style={{ border: `1px solid ${CARD_BORDER}` }}
              >
                <div className="flex gap-3">
                  {/* postcard thumbnail exactly as the employer designed it */}
                  <div className="shrink-0 rounded-xl overflow-hidden relative" style={{ width: 72, height: 90, border: `1px solid ${CARD_BORDER}` }}>
                    {!authed ? (
                      <div className="w-full h-full flex flex-col justify-between p-2" style={{ background: `linear-gradient(160deg, ${BRAND}, ${BRAND_DK})` }}>
                        <Briefcase className="w-4 h-4 text-white/80" />
                        <div>
                          <p className="text-[8.5px] font-bold text-white leading-tight line-clamp-2">{j.jobTitle}</p>
                          <p className="text-[8px] text-white/75 mt-0.5">PKR {j.payAmount}</p>
                        </div>
                      </div>
                    ) : j.photos && j.photos.length > 0 ? (
                      <img src={j.photos[j.coverIndex] || j.photos[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div style={{ transform: "scale(0.26)", transformOrigin: "top left", width: 277, position: "absolute", top: 0, left: 0, pointerEvents: "none" }}>
                        <JobPostCard job={j} tpl={CARD_TEMPLATES.find((t) => t.id === j.templateId) || CARD_TEMPLATES[0]} scale={1} />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col">
                    <p className="text-[15.5px] font-bold leading-snug" style={{ color: INK }}>{j.jobTitle}</p>
                    <p className="text-[16px] font-bold mt-1" style={{ color: NAVY }}>
                      PKR {j.payAmount}
                      <span className="text-[11.5px] font-medium ml-1" style={{ color: SUBTLE }}>{j.payUnitLabel}</span>
                    </p>
                    {authed ? (
                      <p className="text-[12.5px] mt-1 truncate font-semibold" style={{ color: INK_2 }}>{j.facilityName}</p>
                    ) : (
                      <p className="text-[12px] mt-1 truncate flex items-center gap-1" style={{ color: SUBTLE }}>
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" /> Employer shown after sign in
                      </p>
                    )}
                    <p className="text-[11.5px] mt-0.5 truncate flex items-center gap-1" style={{ color: SUBTLE }}>
                      <MapPin className="w-3 h-3 shrink-0" /> {authed ? [j.area, j.city].filter(Boolean).join(", ") : j.city}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {(j.shifts || []).slice(0, 2).map((sh) => (
                        <span key={sh} className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded" style={{ color: INK_2, backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>{sh}</span>
                      ))}
                      {(j.requirements || []).slice(0, 2).map((rq) => (
                        <span key={rq} className="text-[10.5px] font-semibold px-1.5 py-0.5 rounded" style={{ color: INK_2, backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>{rq}</span>
                      ))}
                    </div>
                    <span className="flex-1" />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-[11px]" style={{ color: SUBTLE }}>{j.posted}</p>
                      <div className="flex items-center gap-1.5">
                        {jobSocial[j.id] && jobSocial[j.id].likes > 0 && (
                          <span className="flex items-center gap-1 text-[11px] mr-0.5" style={{ color: SUBTLE }}>
                            <Heart className="w-3.5 h-3.5" fill={jobSocial[j.id].liked ? RED : "none"} stroke={jobSocial[j.id].liked ? RED : SUBTLE} /> {jobSocial[j.id].likes}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onToggleFav(j.id); }}
                          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                          style={{
                            backgroundColor: jobSocial[j.id] && jobSocial[j.id].favourite ? NAVY_TINT : "#F1F3F9",
                            border: `1px solid ${jobSocial[j.id] && jobSocial[j.id].favourite ? NAVY + "55" : CARD_BORDER}`,
                          }}
                          aria-label={jobSocial[j.id] && jobSocial[j.id].favourite ? "Remove from favourites" : "Add to favourites"}
                        >
                          <Bookmark
                            className="w-3.5 h-3.5"
                            strokeWidth={2.2}
                            fill={jobSocial[j.id] && jobSocial[j.id].favourite ? NAVY : "none"}
                            stroke={jobSocial[j.id] && jobSocial[j.id].favourite ? NAVY : SUBTLE}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); gate.require("share this job", () => setShareJob(j)); }}
                          className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                          style={{ backgroundColor: "#F1F3F9", border: `1px solid ${CARD_BORDER}` }}
                          aria-label="Share job"
                        >
                          <Repeat2 className="w-3.5 h-3.5" strokeWidth={2.2} style={{ color: SUBTLE }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sheet === "city" && (
        <FilterSheet title="Select city" options={cityOptions} selected={city} onSelect={setCity} onClose={() => setSheet(null)} allowFree freeLabel="Search any city in Pakistan…" />
      )}
      {sheet === "title" && (
        <FilterSheet title="Select job title" options={titleOptions} selected={title} onSelect={setTitle} onClose={() => setSheet(null)} allowFree freeLabel="Search or type a role…" />
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

function JobDetailSheet({ job, onClose, onReport, reported, social, onToggleLike, onToggleFav, onAddComment, onContact, onApply, hasApplied }) {
  const gate = useContext(AuthGate);
  const [tab, setTab] = useState("details");   // details | comments
  const [draft, setDraft] = useState("");
  const [shareOpen, setShareOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [msgDraft, setMsgDraft] = useState("");
  const [sent, setSent] = useState(false);
  const [photoIdx, setPhotoIdx] = useState(0);

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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ height: "90%" }}>

        <div className="flex justify-center pt-2.5 pb-1 shrink-0"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>

        {/* tabs */}
        <div className="flex items-center px-4 pb-2 gap-2 shrink-0">
          {[["details", "Job details"], ["comments", `Comments${st.comments.length ? ` (${st.comments.length})` : ""}`]].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className="px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-colors"
              style={{ backgroundColor: tab === k ? NAVY : "#EFF2FA", color: tab === k ? "white" : INK }}>
              {label}
            </button>
          ))}
          <span className="flex-1" />
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>

        {/* ---------- DETAILS ---------- */}
        {tab === "details" && (
          <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
            {/* photo gallery or post card */}
            {photos.length > 0 ? (
              <>
                <div className="rounded-2xl overflow-hidden" style={{ aspectRatio: "4/3", border: `1px solid ${CARD_BORDER}` }}>
                  <img src={photos[photoIdx]} alt="" className="w-full h-full object-cover" />
                </div>
                {photos.length > 1 && (
                  <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
                    {photos.map((src, i) => (
                      <button key={i} onClick={() => setPhotoIdx(i)} className="shrink-0 rounded-lg overflow-hidden"
                        style={{ width: 54, height: 54, border: `2px solid ${i === photoIdx ? NAVY : "transparent"}` }}>
                        <img src={src} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <JobPostCard job={job} tpl={tpl} scale={0.92} />
              </div>
            )}

            <p className="text-[21px] font-bold leading-tight mt-3.5" style={{ color: INK }}>{job.jobTitle}</p>
            <p className="text-[13.5px] mt-1" style={{ color: SUBTLE }}>
              {job.facilityName}{job.facilityTypeLabel ? ` · ${job.facilityTypeLabel}` : ""}
            </p>

            <div className="rounded-xl p-3.5 mt-3" style={{ backgroundColor: NAVY_TINT }}>
              <p className="text-[23px] font-bold leading-none" style={{ color: NAVY }}>PKR {job.payAmount}</p>
              <p className="text-[12.5px] mt-1" style={{ color: "#3A4A66" }}>{job.payUnitLabel}</p>
            </div>

            {/* location */}
            <div className="rounded-xl p-3.5 mt-2.5" style={{ border: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Location</p>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: NAVY }} />
                <p className="text-[13.5px] leading-snug" style={{ color: "#4B4A45" }}>
                  {[job.area, job.city].filter(Boolean).join(", ")}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-col gap-1.5">
              {(job.shifts || []).length > 0 && <p className="text-[13.5px]" style={{ color: INK_2 }}><IconText icon={Clock} size={15}>{job.shifts.join(", ")}</IconText></p>}
              {job.startDate && <p className="text-[13.5px]" style={{ color: INK_2 }}><IconText icon={CalendarDays} size={15}>Starts {job.startDate}</IconText></p>}
              {job.posted && <p className="text-[13.5px]" style={{ color: INK_2 }}><IconText icon={History} size={15}>Posted {job.posted}</IconText></p>}
              {typeof job.applicants === "number" && <p className="text-[13.5px]" style={{ color: INK_2 }}><IconText icon={Users} size={15}>{job.applicants} applied</IconText></p>}
            </div>

            {(job.requirements || []).length > 0 && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Requirements</p>
                <div className="flex flex-wrap gap-1.5">
                  {job.requirements.map((r) => (
                    <span key={r} className="text-[12px] font-medium px-2.5 py-1 rounded-full" style={{ color: NAVY, backgroundColor: NAVY_TINT }}>{r}</span>
                  ))}
                </div>
              </div>
            )}

            {job.notes && (
              <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Job description</p>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "#4B4A45" }}>{job.notes}</p>
              </div>
            )}

            <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              <p className="text-[13px] font-semibold mb-1" style={{ color: INK_2 }}>Contact</p>
              <p className="text-[13.5px]" style={{ color: "#4B4A45" }}>{job.contactName || "—"}</p>
              <p className="text-[13px] mt-0.5" style={{ color: SUBTLE }}>
                {job.showNumber && job.contactNumber ? job.contactNumber : "Message through PakMed to contact"}
              </p>
            </div>

            <div className="rounded-xl p-3 mt-3" style={{ backgroundColor: AMBER_TINT }}>
              <p className="text-[12px] leading-snug" style={{ color: "#6B4B22" }}>
                <strong>Stay safe:</strong> PakMed jobs never require an upfront payment. Report any post that asks for money.
              </p>
            </div>
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
          <div className="border-t shrink-0" style={{ borderColor: CARD_BORDER }}>
            <div className="flex items-center px-2 pt-2">
              <Action icon={Heart} count={st.likes} active={st.liked} activeColor={RED} onClick={() => gate.require("like jobs", () => onToggleLike(job.id))} />
              <Action icon={MessageCircle} count={st.comments.length} onClick={() => setTab("comments")} />
              <Action icon={Bookmark} label="Save" active={st.favourite} onClick={() => onToggleFav(job.id)} />
              <Action icon={Repeat2} label="Share" onClick={() => gate.require("share this job", () => setShareOpen(true))} />
              <Action icon={Flag} label={reported ? "Reported" : "Report"} active={reported} activeColor={RED}
                onClick={() => onReport && onReport({ id: job.id, type: "job", title: job.jobTitle, subtitle: `${job.facilityName} · ${job.city}` })} />
            </div>
            <div className="px-4 pt-1.5 pb-3 flex gap-2.5">
              <button
                onClick={() => gate.require("contact the employer", () => setMsgOpen(true))}
                className="px-4 py-3.5 rounded-full font-semibold text-[13.5px] flex items-center justify-center gap-1.5 shrink-0"
                style={{ backgroundColor: "#EFF2FA", color: INK }}
              >
                <MessageSquareText className="w-4 h-4" /> Contact
              </button>
              <button
                onClick={() => { if (!hasApplied) onApply(job); }}
                disabled={hasApplied}
                className="flex-1 py-3.5 rounded-full font-semibold text-[14.5px] flex items-center justify-center gap-2"
                style={{ backgroundColor: hasApplied ? GREEN_TINT : NAVY, color: hasApplied ? GREEN : "white" }}
              >
                {hasApplied ? <><Check className="w-4 h-4" strokeWidth={3} /> Applied</> : <><FileText className="w-4 h-4" /> Apply with my CV</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {shareOpen && <JobShareSheet job={job} onClose={() => setShareOpen(false)} />}

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

function ConsultDoctorScreen({ initialQuery, userCity, onBack, onMenu, onReport, reportedIds, isSaved = () => false, onToggleSave = () => {}, onMessage = () => {}, guestDefaults = {} }) {
  const gate = useContext(AuthGate);
  const [city, setCity] = useState(initialQuery ? "" : (userCity || ""));
  const [msgDoc, setMsgDoc] = useState(null);
  const [area, setArea] = useState("");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [text, setText] = useState(initialQuery || "");
  const [sheet, setSheet] = useState(null);
  const [openDoc, setOpenDoc] = useState(null);

  const cityOptions = [...new Set([...CITIES, ...DOCTORS.map((d) => d.city)])].sort();
  const areaOptions = [...new Set(DOCTORS.filter((d) => !city || d.city === city).map((d) => d.area))].sort();
  const nameOptions = [...new Set(DOCTORS.filter((d) => (!city || d.city === city) && (!area || d.area === area)).map((d) => d.name))].sort();

  const t = text.trim().toLowerCase();
  const results = DOCTORS.filter((d) =>
    (!city || d.city === city) &&
    (!area || d.area.toLowerCase().includes(area.toLowerCase())) &&
    (!name || d.name.toLowerCase().includes(name.toLowerCase())) &&
    (!specialty || d.specialty === specialty) &&
    (!t || [d.name, d.specialty, d.qual, d.city, d.area, d.clinic].some((v) => String(v).toLowerCase().includes(t)))
  );

  const anyFilter = city || area || name || specialty || t;
  // default city with no doctors yet → show everyone rather than an empty list
  const cityFellBack = city && city === userCity && results.length === 0 && !area && !name && !specialty && !t;
  const shown = cityFellBack ? DOCTORS : results;

  return (
    <div className="flex flex-col h-full min-h-0">
      <ScreenHeader title="Find a Doctor" subtitle="Verified doctors near you" onBack={onBack} onMenu={onMenu} />

      <div className="px-3 pb-2 shrink-0">
        <div className="relative mb-2">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: SUBTLE }} />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type doctor name, speciality or area…"
            className="w-full text-[14.5px] rounded-xl pl-10 pr-9 py-3 outline-none"
            style={{ backgroundColor: "white", color: INK, border: `1px solid ${CARD_BORDER}` }}
          />
          {text && (
            <button onClick={() => setText("")} className="absolute right-3.5 top-1/2 -translate-y-1/2" aria-label="Clear search">
              <X className="w-4 h-4" style={{ color: SUBTLE }} />
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          <FilterPill label="City" value={city} onClick={() => setSheet("city")} onClear={() => { setCity(""); setArea(""); }} />
          <FilterPill label="Town / Road" value={area} onClick={() => setSheet("area")} onClear={() => setArea("")} />
          <FilterPill label="Doctor" value={name} onClick={() => setSheet("name")} onClear={() => setName("")} />
          <FilterPill label="Speciality" value={specialty} onClick={() => setSheet("specialty")} onClear={() => setSpecialty("")} />
          {anyFilter && (
            <button onClick={() => { setCity(""); setArea(""); setName(""); setSpecialty(""); setText(""); }} className="shrink-0 px-3 py-2 rounded-full text-[12.5px] font-semibold" style={{ color: RED, backgroundColor: "#FBEBEC" }}>
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
        {!anyFilter && (
          <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: "#FBEBEC" }}>
            <p className="text-[13.5px] font-semibold mb-1" style={{ color: "#B3202C" }}>Narrow it down</p>
            <p className="text-[12.5px] leading-snug" style={{ color: "#7A3339" }}>
              Choose your city, then your town or road, to find the closest doctor. You can also search by name or speciality.
            </p>
          </div>
        )}

        <p className="text-[12.5px] mb-2" style={{ color: SUBTLE }}>
          {cityFellBack
            ? <>No doctors listed in <b style={{ color: INK }}>{city}</b> yet — showing all</>
            : <><b style={{ color: INK }}>{shown.length} doctor{shown.length !== 1 ? "s" : ""}</b>{area ? ` in ${area}` : city ? ` in ${city}` : ""}{specialty ? ` · ${specialty}` : ""}{t ? ` · "${text.trim()}"` : ""}</>}
        </p>

        {shown.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center" style={{ border: `1px solid ${CARD_BORDER}` }}>
            <Stethoscope className="w-8 h-8 mx-auto mb-2" style={{ color: FAINT }} />
            <p className="text-[13.5px]" style={{ color: SUBTLE }}>No doctors match. Try clearing the area or speciality filter.</p>
          </div>
        ) : (
          <div className="-mx-3 bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}`, borderBottom: `1px solid ${CARD_BORDER}` }}>
            {shown.map((d, idx) => (
              <div key={d.id} className="px-4 py-3.5" style={{ borderTop: idx ? `1px solid ${CARD_BORDER}` : "none" }}>
                <button onClick={() => setOpenDoc(d)} className="w-full flex gap-3 text-left">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-[17px]" style={{ backgroundColor: BRAND }}>
                    {initialsOf(d.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[15px] font-bold truncate" style={{ color: INK, letterSpacing: "-0.015em" }}>{d.name}</p>
                      {d.verified && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />}
                    </div>
                    <p className="text-[12.5px] font-semibold mt-0.5" style={{ color: BRAND }}>{d.specialty}</p>
                    <p className="text-[12px] mt-0.5 truncate" style={{ color: SUBTLE }}>{d.qual}</p>
                    <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                      <span className="flex items-center gap-1 text-[12.5px] font-bold" style={{ color: INK }}>
                        <Star className="w-3.5 h-3.5" fill={STAR} stroke="none" /> {d.rating} <span className="font-medium" style={{ color: SUBTLE }}>({d.reviews})</span>
                      </span>
                      <span className="text-[12px]" style={{ color: INK_2 }}>{d.exp} experience</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <SaveButton saved={isSaved("doctor", d.id)} onClick={() => onToggleSave("doctor", d)} />
                  </div>
                </button>

                <div className="flex items-start gap-2 mt-2.5 rounded-lg px-2.5 py-2" style={{ backgroundColor: CREAM }}>
                  <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: SUBTLE }} />
                  <div className="flex-1 min-w-0 text-[12.5px]" style={{ color: INK_2 }}>
                    <b style={{ color: INK }}>{d.clinic}</b><br />{d.area}, {d.city}
                  </div>
                  <span className="text-[13.5px] font-extrabold shrink-0" style={{ color: INK }}>PKR {d.fee}</span>
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button onClick={() => setMsgDoc(d)} className="flex-1 h-10 rounded-xl text-[13px] font-bold text-white flex items-center justify-center gap-1.5" style={{ backgroundColor: BRAND }}>
                    <MessageSquareText className="w-4 h-4" /> Message
                  </button>
                  {d.showPhone && d.phone && (
                    <a href={doctorWaLink(d)} target="_blank" rel="noopener noreferrer"
                      className="flex-1 h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5"
                      style={{ color: "#128C3E", border: "1.5px solid #1DA851", backgroundColor: "#fff" }}>
                      <WhatsAppGlyph /> WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {sheet === "city" && <FilterSheet title="Select city" options={cityOptions} selected={city} onSelect={(v) => { setCity(v); setArea(""); }} onClose={() => setSheet(null)} allowFree freeLabel="Search any city…" />}
      {sheet === "area" && <FilterSheet title="Town or road" options={areaOptions} selected={area} onSelect={setArea} onClose={() => setSheet(null)} allowFree freeLabel="Type your town or road…" />}
      {sheet === "name" && <FilterSheet title="Doctor name" options={nameOptions} selected={name} onSelect={setName} onClose={() => setSheet(null)} allowFree freeLabel="Type a doctor's name…" />}
      {sheet === "specialty" && <FilterSheet title="Speciality" options={DOCTOR_SPECIALTIES} selected={specialty} onSelect={setSpecialty} onClose={() => setSheet(null)} allowFree freeLabel="Search speciality…" />}

      {openDoc && (
        <DoctorDetailSheet doctor={openDoc} onClose={() => setOpenDoc(null)} onReport={onReport} reported={reportedIds.has(openDoc.id)}
          saved={isSaved("doctor", openDoc.id)} onToggleSave={() => onToggleSave("doctor", openDoc)}
          onMessage={() => setMsgDoc(openDoc)} />
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

  const submit = () => {
    onSubmit({ reason, details: details.trim() });
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "82vh" }}>
        <div className="flex justify-center pt-2.5 pb-1"><span className="w-10 h-1 rounded-full" style={{ backgroundColor: "#D3D9EC" }} /></div>
        <div className="flex items-center justify-between px-5 pb-3 border-b shrink-0" style={{ borderColor: CARD_BORDER }}>
          <span className="w-8" />
          <p className="font-bold text-[15px]" style={{ color: INK }}>{done ? "Report sent" : "Report"}</p>
          <button onClick={onClose} aria-label="Close"><X className="w-5 h-5" style={{ color: SUBTLE }} /></button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: GREEN_TINT }}>
              <Check className="w-7 h-7" strokeWidth={3} style={{ color: GREEN }} />
            </div>
            <p className="text-[15px] font-bold" style={{ color: INK }}>Thanks for telling us</p>
            <p className="text-[13px] mt-1.5 leading-snug" style={{ color: SUBTLE }}>
              Our team will review this {REPORT_TYPE_LABEL[target.type]}. We don't share who reported it.
            </p>
            <div className="rounded-xl p-3 mt-4 text-left" style={{ backgroundColor: AMBER_TINT }}>
              <p className="text-[12.5px] font-bold mb-1" style={{ color: AMBER }}>Stay safe</p>
              <p className="text-[12.5px] leading-relaxed" style={{ color: "#6B4B22" }}>
                PakMed jobs never require an upfront payment. Never send money to secure a position or reserve an item.
              </p>
            </div>
            <button onClick={onClose} className="w-full mt-4 py-3 rounded-full font-semibold text-[14px]" style={{ backgroundColor: NAVY, color: "white" }}>
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-3">
              <div className="rounded-xl p-3 mb-3" style={{ backgroundColor: "#F4F6FC" }}>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: INK_2 }}>Reporting</p>
                <p className="text-[13.5px] font-semibold" style={{ color: INK }}>{target.title}</p>
                {target.subtitle && <p className="text-[12px] mt-0.5" style={{ color: SUBTLE }}>{target.subtitle}</p>}
              </div>

              <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Why are you reporting this?</p>
              <div className="flex flex-col gap-1.5 mb-3">
                {reasons.map((r) => (
                  <button
                    key={r}
                    onClick={() => setReason(r)}
                    className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left transition-colors"
                    style={{ backgroundColor: reason === r ? RED_TINT : "white", border: `1.5px solid ${reason === r ? RED : CARD_BORDER}` }}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${reason === r ? RED : "#C7CDDD"}` }}>
                      {reason === r && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: RED }} />}
                    </span>
                    <span className="text-[13.5px]" style={{ color: INK }}>{r}</span>
                  </button>
                ))}
              </div>

              <p className="text-[13px] font-semibold mb-1.5" style={{ color: INK_2 }}>Anything else? (optional)</p>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Add any detail that helps us check this"
                className="w-full text-[14px] rounded-xl px-3.5 py-3 outline-none resize-none"
                style={{ backgroundColor: "#F4F6FC", color: INK, border: `1px solid ${CARD_BORDER}` }}
              />

              <p className="text-[11.5px] mt-3 leading-snug" style={{ color: SUBTLE }}>
                Reports are confidential. The person you're reporting won't know who flagged it.
                False reports may affect your own account.
              </p>
            </div>

            <div className="px-4 py-3 border-t shrink-0" style={{ borderColor: CARD_BORDER }}>
              <button
                onClick={submit}
                disabled={!reason}
                className="w-full py-3.5 rounded-full font-semibold text-[14px] transition-opacity"
                style={{ backgroundColor: RED, color: "white", opacity: reason ? 1 : 0.4 }}
              >
                Submit report
              </button>
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
  { id: "f1", name: "Allied Hospital", type: "Hospital", city: "Faisalabad", area: "Jail Road", address: "Jail Road, near Govt College", phone: "041 9210080", services: ["Emergency", "OPD", "Surgery", "Radiology", "ICU"], hours: "24 hours", verified: true, hiring: 4 },
  { id: "f2", name: "Noor Diagnostic Centre", type: "Diagnostic Lab", city: "Faisalabad", area: "Susan Road", address: "Plaza 12, Susan Road", phone: "0321 6639900", services: ["Blood tests", "Ultrasound", "X-Ray"], hours: "8 am – 10 pm", verified: true, hiring: 1 },
  { id: "f3", name: "City Heart Clinic", type: "Clinic", city: "Lahore", area: "Jail Road", address: "45-B Jail Road", phone: "042 3577 1100", services: ["Cardiology", "ECG", "Echo"], hours: "Mon – Sat, 9 am – 9 pm", verified: true, hiring: 2 },
  { id: "f4", name: "Aga Care Hospital", type: "Hospital", city: "Karachi", area: "Gulshan-e-Iqbal", address: "Block 13-D, Gulshan-e-Iqbal", phone: "021 3480 2200", services: ["Emergency", "Maternity", "Paediatrics", "OPD"], hours: "24 hours", verified: true, hiring: 3 },
  { id: "f5", name: "Al-Shifa Pharmacy", type: "Pharmacy", city: "Faisalabad", area: "D Ground", address: "Shop 3, D Ground", phone: "0300 1234567", services: ["Medicines", "Home delivery"], hours: "24 hours", verified: false, hiring: 0 },
  { id: "f6", name: "Shifa Wellness", type: "Hospital", city: "Islamabad", area: "Blue Area", address: "Jinnah Avenue, Blue Area", phone: "051 2874400", services: ["OPD", "Surgery", "Physiotherapy"], hours: "8 am – 11 pm", verified: true, hiring: 1 },
  { id: "f7", name: "Bright Smile Dental", type: "Clinic", city: "Multan", area: "Bosan Road", address: "Bosan Road, near Chungi 9", phone: "", services: ["Dentistry", "Orthodontics"], hours: "Mon – Sat, 4 – 10 pm", verified: false, hiring: 0 },
];

const FACILITY_KINDS = ["All", "Hospital", "Clinic", "Diagnostic Lab", "Pharmacy"];

function FindHospitalScreen({ initialQuery, onBack, onMenu, userCity, employer, employerUnlocked, postedJobs, onOpenHiring, onMessage, isSaved = () => false, onToggleSave = () => {} }) {
  const [text, setText] = useState(initialQuery || "");
  const [city, setCity] = useState(userCity || "");
  const [kind, setKind] = useState("All");
  const [sheet, setSheet] = useState(null);
  const [open, setOpen] = useState(null);

  // the user's own facility joins the directory automatically once the Employer profile is complete
  const own = employerUnlocked && employer.facilityName ? [{
    id: "own", name: employer.facilityName, type: employer.facilityType || "Facility",
    city: employer.city, area: employer.area, address: employer.address, phone: employer.phone,
    services: (employer.services || "").split(",").map((x) => x.trim()).filter(Boolean),
    hours: "", verified: false, mine: true,
    hiring: (postedJobs || []).filter((j) => j.status === "posted").length,
    photos: employer.photos || [],
  }] : [];

  const all = [...own, ...SEED_FACILITIES];
  const t = text.trim().toLowerCase();
  let list = all.filter((f) =>
    (kind === "All" || f.type === kind) &&
    (!t || [f.name, f.type, f.area, f.city, ...(f.services || [])].filter(Boolean).some((v) => v.toLowerCase().includes(t)))
  );
  const inCity = city ? list.filter((f) => (f.city || "").toLowerCase() === city.toLowerCase()) : list;
  // fall back to everything rather than show an empty screen
  const fellBack = city && inCity.length === 0;
  list = fellBack ? list : inCity;

  const cityOptions = [...new Set([...CITIES, ...all.map((f) => f.city).filter(Boolean)])].sort();

  return (
    <div className="flex flex-col h-full min-h-0" style={{ fontFamily: FONT }}>
      <ScreenHeader title="Find a Hospital" subtitle="Hospitals, clinics, labs and pharmacies" onBack={onBack} onMenu={onMenu} />

      <div className="px-4 pb-2 shrink-0">
        <div className="flex items-center gap-2 rounded-xl pl-3 pr-2 bg-white" style={{ height: 46, border: `1px solid ${CARD_BORDER}` }}>
          <Search className="w-[18px] h-[18px] shrink-0" style={{ color: FAINT }} />
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Name, service or area"
            className="flex-1 min-w-0 bg-transparent outline-none text-[14px]" style={{ color: INK }} />
          {text && <button onClick={() => setText("")}><X className="w-4 h-4" style={{ color: FAINT }} /></button>}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pt-2.5" style={{ scrollbarWidth: "none" }}>
          <FilterPill label="City" value={city} onClick={() => setSheet("city")} onClear={() => setCity("")} />
          {FACILITY_KINDS.map((k) => (
            <button key={k} onClick={() => setKind(k)}
              className="shrink-0 px-3 py-1.5 rounded-full text-[12.5px] font-semibold"
              style={{ backgroundColor: kind === k ? BRAND_50 : "#fff", color: kind === k ? BRAND : INK_2, border: `1px solid ${kind === k ? "#B9D3F2" : CARD_BORDER}` }}>
              {k}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto pb-4">
        <p className="px-4 pt-1 pb-2 text-[12.5px]" style={{ color: SUBTLE }}>
          {fellBack
            ? <>No results in <b style={{ color: INK }}>{city}</b> yet — showing all locations</>
            : <><b style={{ color: INK }}>{list.length} {list.length === 1 ? "place" : "places"}</b>{city ? ` in ${city}` : " across Pakistan"}</>}
        </p>

        <div className="bg-white" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
          {list.map((f) => (
            <button key={f.id} onClick={() => setOpen(f)} className="w-full text-left px-4 py-3.5 flex gap-3" style={{ borderBottom: `1px solid ${CARD_BORDER}` }}>
              <div className="w-[46px] h-[46px] rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: TEAL_TINT }}>
                <Building2 className="w-5 h-5" style={{ color: TEAL }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="text-[15px] font-bold" style={{ color: INK, letterSpacing: "-0.01em" }}>{f.name}</p>
                  {f.verified
                    ? <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: GREEN }} />
                    : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: AMBER, backgroundColor: AMBER_TINT }}>Unverified</span>}
                  {f.mine && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: BRAND, backgroundColor: BRAND_50 }}>Yours</span>}
                </div>
                <p className="text-[12.5px] mt-0.5" style={{ color: TEAL }}>{f.type}</p>
                <p className="text-[12px] mt-0.5 flex items-center gap-1 truncate" style={{ color: SUBTLE }}>
                  <MapPin className="w-3 h-3 shrink-0" /> {[f.area, f.city].filter(Boolean).join(", ")}
                </p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {f.hiring > 0 && (
                    <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md" style={{ color: GREEN, backgroundColor: GREEN_TINT, border: "1px solid #C7E8D9" }}>
                      Hiring · {f.hiring} {f.hiring === 1 ? "job" : "jobs"}
                    </span>
                  )}
                  {(f.services || []).slice(0, 3).map((sv) => (
                    <span key={sv} className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ color: INK_2, backgroundColor: CREAM, border: `1px solid ${CARD_BORDER}` }}>{sv}</span>
                  ))}
                </div>
              </div>
              {!f.mine && <SaveButton saved={isSaved("hospital", f.id)} onClick={() => onToggleSave("hospital", f)} />}
            </button>
          ))}
        </div>

        <p className="px-4 pt-4 text-[11.5px] leading-snug" style={{ color: SUBTLE }}>
          Facilities appear here automatically when they complete an Employer profile.
          "Unverified" means PakMed has not yet checked their documents.
        </p>
      </div>

      {sheet === "city" && (
        <FilterSheet title="Choose city" options={cityOptions} selected={city} onSelect={setCity} onClose={() => setSheet(null)} allowFree freeLabel="Search any city…" />
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-black/45" onClick={() => setOpen(null)} />
          <div className="relative w-full max-w-[390px] bg-white rounded-t-3xl flex flex-col" style={{ maxHeight: "86vh", fontFamily: FONT }}>
            <div className="h-20 rounded-t-3xl shrink-0" style={{ background: `linear-gradient(135deg, ${TEAL}, #0A5A61)` }} />
            <div className="flex-1 min-h-0 overflow-y-auto px-4 pb-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center -mt-8 bg-white" style={{ border: `3px solid #fff`, boxShadow: "0 2px 8px rgba(16,24,40,.12)" }}>
                <Building2 className="w-7 h-7" style={{ color: TEAL }} />
              </div>
              <div className="flex items-center gap-1.5 mt-2.5">
                <p className="text-[19px] font-extrabold" style={{ color: INK, letterSpacing: "-0.025em" }}>{open.name}</p>
                {open.verified && <CheckCircle2 className="w-[18px] h-[18px]" style={{ color: GREEN }} />}
              </div>
              <p className="text-[13.5px] font-semibold" style={{ color: TEAL }}>{open.type}</p>

              <div className="mt-3.5 rounded-xl p-3" style={{ border: `1px solid ${CARD_BORDER}` }}>
                <p className="text-[13px] flex items-start gap-2" style={{ color: INK_2 }}><MapPin className="w-4 h-4 mt-0.5 shrink-0" style={{ color: SUBTLE }} />{open.address || [open.area, open.city].filter(Boolean).join(", ")}</p>
                {open.hours && <p className="text-[13px] flex items-center gap-2 mt-2" style={{ color: INK_2 }}><Clock className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />{open.hours}</p>}
                {open.phone && <p className="text-[13px] flex items-center gap-2 mt-2" style={{ color: INK_2 }}><Phone className="w-4 h-4 shrink-0" style={{ color: SUBTLE }} />{open.phone}</p>}
              </div>

              {(open.services || []).length > 0 && (
                <>
                  <p className="text-[14px] font-bold mt-4 mb-2" style={{ color: INK }}>Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {open.services.map((sv) => (
                      <span key={sv} className="text-[12.5px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: TEAL, backgroundColor: TEAL_TINT }}>{sv}</span>
                    ))}
                  </div>
                </>
              )}

              {open.hiring > 0 && (
                <button onClick={() => { setOpen(null); onOpenHiring(open); }}
                  className="w-full mt-4 rounded-xl p-3 flex items-center gap-3 text-left" style={{ backgroundColor: GREEN_TINT, border: "1px solid #C7E8D9" }}>
                  <Briefcase className="w-5 h-5 shrink-0" style={{ color: GREEN }} />
                  <div className="flex-1">
                    <p className="text-[14px] font-bold" style={{ color: GREEN }}>Currently hiring</p>
                    <p className="text-[12px]" style={{ color: "#2F6B52" }}>{open.hiring} open {open.hiring === 1 ? "position" : "positions"} — see jobs</p>
                  </div>
                  <ChevronRight className="w-4 h-4" style={{ color: GREEN }} />
                </button>
              )}
            </div>
            <div className="px-4 py-3 shrink-0 flex gap-2 items-center" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
              {!open.mine && <SaveButton saved={isSaved("hospital", open.id)} onClick={() => onToggleSave("hospital", open)} size={48} />}
              {open.phone && (
                <a href={`tel:${open.phone.replace(/\s/g, "")}`} className="px-4 h-12 rounded-xl flex items-center justify-center gap-1.5 text-[14px] font-bold"
                  style={{ color: INK, border: `1.5px solid ${CARD_BORDER}` }}>
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              <button onClick={() => { onMessage(open); setOpen(null); }} className="flex-1 h-12 rounded-xl flex items-center justify-center gap-1.5 text-[14px] font-bold text-white" style={{ backgroundColor: BRAND }}>
                <MessageSquareText className="w-4 h-4" /> Message
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
  userInitials,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [activeTab]);

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
              <button type="button" onClick={onOpenProfile} className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold text-white transition-transform hover:scale-105" style={{ backgroundColor: BRAND }} aria-label="Profile">
                {userInitials || "U"}
              </button>
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
  { src: `${LANDING_IMG}/hero-2.jpg`, alt: "Doctors discussing care at a clinic" },
  { src: `${LANDING_IMG}/care.jpg`, alt: "Healthcare professionals at work" },
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
            className="snap-start shrink-0 w-[78%] sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] xl:w-[calc((100%-64px)/5)]"
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

function UpdatePost({ card, isNew, onOpen }) {
  const gate = useContext(AuthGate);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <article className="rounded-2xl overflow-hidden bg-white" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
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

function UpdatesScreen({ onBack, onMenu, onOpenCard }) {
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
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort updates"
            className="h-9 px-2.5 rounded-lg text-[13px] font-semibold bg-white shrink-0 outline-none" style={{ color: INK_2, border: `1px solid ${CARD_BORDER}` }}>
            <option value="latest">Latest</option>
            <option value="popular">Most liked</option>
          </select>
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
          <div key={`${cat}-${sort}`} className="space-y-4 fade-list">
            {list.map((c, i) => (
              <UpdatePost
                key={c.id}
                card={c}
                isNew={sort === "latest" && i === 0 && postAgeHours(c.time) < 24}
                onOpen={() => onOpenCard(FEED_CARDS.indexOf(c))}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HomeScreen({ onTabNav, onOpenCard, authed, city, counts = {}, nearJobs = [], onOpenJob, onSearch, onNavigate, onHome, onSeeAllPosts }) {
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
    { value: `${countFor("find") || 0}+`, label: "Open jobs" },
    { value: `${countFor("consult") || 0}+`, label: "Verified doctors" },
    { value: `${CITIES.length}`, label: "Cities covered" },
    { value: `${countFor("market") || 0}+`, label: "Equipment listings" },
  ];

  return (
    <div ref={rootRef} className="w-full min-w-0" style={{ fontFamily: FONT }}>
      {/* Hero */}
      <section
        className="relative overflow-hidden"
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

            <div className="flex flex-col sm:flex-row gap-2 max-w-xl mb-6 p-2 rounded-2xl bg-white" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: "0 12px 32px -12px rgba(16,24,40,0.18)" }}>
              <button type="button" onClick={() => onSearch && onSearch("")} className="flex-1 min-w-0 flex items-center gap-3 h-12 px-3 text-left rounded-xl">
                <Search className="w-5 h-5 shrink-0" style={{ color: FAINT }} />
                <span className="text-[15px] truncate" style={{ color: FAINT }}>Search jobs, doctors, hospitals…</span>
              </button>
              <div className="flex gap-2">
                <span className="flex items-center gap-1.5 h-12 px-3 rounded-xl text-[14px] font-semibold flex-1 sm:flex-none" style={{ color: INK_2, backgroundColor: CREAM }}>
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: BRAND }} />
                  <span className="truncate">{city || "Pakistan"}</span>
                </span>
                <button type="button" onClick={() => onSearch && onSearch("")} className="h-12 px-5 rounded-xl text-[15px] font-bold text-white shrink-0" style={{ backgroundColor: BRAND }}>
                  Search
                </button>
              </div>
            </div>

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
        <div data-reveal className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden" style={{ backgroundColor: CARD_BORDER, border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}>
          {stats.map((s) => (
            <div key={s.label} className="px-4 py-5 sm:py-6 text-center bg-white">
              <p className="text-[26px] sm:text-[32px] font-extrabold tracking-[-0.03em]" style={{ color: BRAND }}>{s.value}</p>
              <p className="text-[13px] sm:text-[14px] font-semibold mt-0.5" style={{ color: SUBTLE }}>{s.label}</p>
            </div>
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
              {nearJobs.slice(0, 6).map((j, i) => (
                <div key={j.id} data-reveal style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <button
                  type="button"
                  onClick={() => onOpenJob && onOpenJob(j)}
                  className="w-full h-full flex gap-3 p-4 sm:p-5 text-left rounded-2xl bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW }}
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-[16px] font-extrabold" style={{ backgroundColor: BRAND_50, color: BRAND }}>
                    {authed ? (j.facilityName || "?")[0] : <Briefcase className="w-5 h-5" />}
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
              ))}
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
          <SectionHeading center eyebrow="Testimonials" title="Loved by doctors, hospitals and patients" />
          <div className="grid md:grid-cols-3 gap-4 sm:gap-5">
            {TESTIMONIALS.map((t, i) => (
              <figure key={t.name} data-reveal className="rounded-2xl p-6 bg-white flex flex-col" style={{ border: `1px solid ${CARD_BORDER}`, boxShadow: SOFT_SHADOW, transitionDelay: `${i * 100}ms` }}>
                <div className="flex gap-0.5 mb-3">
                  {[0, 1, 2, 3, 4].map((i) => <Star key={i} className="w-4 h-4" style={{ color: STAR }} fill={STAR} />)}
                </div>
                <blockquote className="text-[15px] leading-relaxed flex-1" style={{ color: INK_2 }}>“{t.text}”</blockquote>
                <figcaption className="flex items-center gap-3 mt-5 pt-5" style={{ borderTop: `1px solid ${CARD_BORDER}` }}>
                  <img src={`${LANDING_IMG}/${t.img}.jpg`} alt={t.name} loading="lazy" decoding="async" className="w-11 h-11 rounded-full object-cover shrink-0" style={{ border: `2px solid ${BRAND_50}` }} />
                  <div className="min-w-0">
                    <p className="text-[14px] font-bold truncate" style={{ color: INK }}>{t.name}</p>
                    <p className="text-[12.5px] truncate" style={{ color: SUBTLE }}>{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
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
      <div className="px-5 pt-6 pb-4 flex items-center gap-3" style={{ backgroundColor: CREAM }}>
        <button onClick={onBack} className="w-9 h-9 rounded-full flex items-center justify-center bg-white" style={{ border: `1px solid ${CARD_BORDER}` }}>
          <ChevronLeft className="w-5 h-5" style={{ color: INK }} />
        </button>
        <p className="font-bold text-[17px]" style={{ color: INK }}>Profile & Verification</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-6">
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

        <p className="text-[14px] font-bold mt-4 mb-1.5" style={{ color: INK, letterSpacing: "-0.01em" }}>Registration details</p>
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

        <button className="w-full mt-5 py-3.5 rounded-full font-semibold text-[14px]" style={{ backgroundColor: INK, color: "white" }}>Save Profile</button>
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
  const canGoBack = history.length > 1;

  const navigate = (key) => setHistory((prev) => (prev[prev.length - 1] === key ? prev : [...prev, key]));
  const goBack = () => setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  const goHome = () => setHistory(["home"]);
  const tabNav = (k) => {
    setSectionQ("");
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
    <div className="min-h-screen flex flex-col" style={{ background: PAGE_BG, fontFamily: FONT }}>
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
                  if (extra && extra.phone) {
                    setVerifiedPhone(extra.phone);
                    updateProfile("general", (g) => ({ ...g, phone: g.phone || extra.phone, email: g.email || extra.email || "" }));
                  }
                  const resume = signInFor && signInFor.run;
                  setAuthed(true);
                  authedRef.current = true;
                  setSignInFor(null);
                  if (isNew && !introSeen) { setShowIntent(true); setIntroSeen(true); }
                  else if (resume) setTimeout(resume, 60);
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
                userInitials={userInitials}
              />
            )}
            <div
              className={`flex-1 flex flex-col w-full min-w-0 ${
                tab === "home"
                  ? ""
                  : tab === "feed"
                    ? "min-h-[calc(100dvh-64px)]"
                    : "max-w-3xl mx-auto w-full min-h-[calc(100dvh-68px)] bg-white sm:rounded-3xl sm:my-8 overflow-hidden page-enter"
              }`}
              style={tab !== "home" && tab !== "feed" ? { border: `1px solid ${CARD_BORDER}`, boxShadow: "0 12px 40px -18px rgba(16,24,40,0.18)" } : undefined}
            >
              {tab === "home" && (
                <HomeScreen
                  onTabNav={tabNav}
                  onOpenCard={(i) => { setFeedStart(i); navigate("feed"); }}
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
                  onSeeAllPosts={() => navigate("updates")}
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
                  onOpenHiring={() => navigate("findjob")}
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
                  onPublish={(j) => setPostedJobs((prev) => [j, ...prev])}
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
                <ProfileChooserScreen
                  onProfiles={() => requireAuth("set up your profile", () => navigate("profiles"))}
                  onCV={() => navigate("cv")}
                  profilesNote={(() => {
                    const liveCount = ["general", "doctor", "employer", "seller"].filter((k) => savedProfiles[k] && profileCompletion(k, savedProfiles[k]) >= GATE_THRESHOLD).length;
                    return liveCount ? `${liveCount} profile${liveCount > 1 ? "s" : ""} live` : "No profile live yet";
                  })()}
                  cvNote={cvDoc.uploaded || cvDoc.savedInApp ? "CV ready" : "No CV yet"}
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
