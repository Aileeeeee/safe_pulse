"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useSignup } from "@/hooks";
import { OrgSearchInput } from "@/components/auth/OrgSearchInput";
import { cn } from "@/utils";
import type { Organisation, UserRole } from "@/types";
import { UsernameInput } from "@/components/auth/UsernameInput";

// ── Schemas ───────────────────────────────────────────────────────────────────
const step1Schema = z.object({
  first_name: z.string().min(2, "Enter your first name"),
  last_name:  z.string().min(2, "Enter your last name"),
  // Highlights the fix:
  username:   z.string()
               .min(3, "Username must be at least 3 characters")
               .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  email:      z.string().email("Enter a valid email address"),
});

const step2Schema = z.object({});

const step3Schema = z
  .object({
    password:         z.string().min(8, "Minimum 8 characters"),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: "Passwords do not match",
    path:    ["confirm_password"],
  });

type Step1 = z.infer<typeof step1Schema>;
type Step2 = z.infer<typeof step2Schema>;
type Step3 = z.infer<typeof step3Schema>;

// ── Password strength ─────────────────────────────────────────────────────────
function getStrength(pw: string) {
  let s = 0;
  if (pw.length >= 8)           s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return [
    { w: "0%",   color: "#c93535", label: "" },
    { w: "25%",  color: "#c93535", label: "Too weak" },
    { w: "55%",  color: "#e07c2a", label: "Fair" },
    { w: "80%",  color: "#c9a000", label: "Good" },
    { w: "100%", color: "#2d8a62", label: "Strong ✓" },
  ][s] ?? { w: "0%", color: "#c93535", label: "" };
}

// ── Step dots ─────────────────────────────────────────────────────────────────
function StepDots({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5 mb-5">
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={cn(
            "h-1.5 rounded-sm transition-all duration-200",
            n === current ? "w-5 bg-emerald-mid" :
            n < current   ? "w-1.5 bg-emerald-light" :
                            "w-1.5 bg-gray-200"
          )}
        />
      ))}
    </div>
  );
}

const inputCls = (err?: boolean) => cn(
  "w-full px-3.5 py-2.5 border-[1.5px] rounded-[9px] text-sm outline-none transition-all",
  "border-gray-200 focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10",
  err && "border-red-400"
);

// ── Component ─────────────────────────────────────────────────────────────────
export function SignupForm() {
  const [step,            setStep]        = useState<1 | 2 | 3 | "done">(1);
  const [formData,    setFormData]    = useState<Partial<Step1 & Step2>>({});
  const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);
  const [orgError,    setOrgError]    = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [pw,          setPw]          = useState("");
  const [username, setUsername] = useState("");

  const signup = useSignup();

  const f1 = useForm<Step1>({ resolver: zodResolver(step1Schema) });
  const f2 = useForm<Step2>({ resolver: zodResolver(step2Schema) });
  const f3 = useForm<Step3>({ resolver: zodResolver(step3Schema) });

  // ── Step handlers ───────────────────────────────────────────────────────────
  async function submitStep1(data: Step1) {
    if (!username) {
      toast.error("Please enter or select a username");
      return;
    }
    setFormData((p) => ({ ...p, ...data, username }));
    setStep(2);
  }

  function submitStep2(data: Step2) {
    if (!selectedOrg) {
      setOrgError("Please select your organisation from the list");
      return;
    }
    setOrgError("");
    setFormData((p) => ({ ...p, ...data }));
    setStep(3);
  }

  const [createdUsername, setCreatedUsername] = useState("");

  async function submitStep3(data: Step3) {
    if (!selectedOrg) { setStep(2); return; }

    const payload = {
      first_name:      formData.first_name!,
      last_name:       formData.last_name!,
      username:        formData.username!,
      email:           formData.email!,
      password:        data.password,
      organisation_id: selectedOrg.id,
      role:            "FIELD_STAFF" as UserRole, // Sets a standard backup option for Django
    };

    try {
      const response = await signup.mutateAsync(payload);
      setCreatedUsername(response.user.username);
      setStep("done");
    } catch (err: unknown) {
      const e = err as {
        details?: Record<string, string[]>;
        message?: string;
      };
      if (e.details) {
        const [field, messages] = Object.entries(e.details)[0];
        toast.error(`${field}: ${messages[0]}`);
      } else {
        toast.error(e.message ?? "Could not create account. Please try again.");
      }
    }
  }

  const strength = getStrength(pw);

  return (
    <div>
      {/* Tab row */}
      <div className="flex gap-0 bg-bg rounded-[10px] p-[3px] w-fit mb-7">
        <Link
          href="/login"
          className="px-6 py-2 rounded-[8px] text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign in
        </Link>
        <span className="px-6 py-2 rounded-[8px] bg-white text-sm font-medium shadow-sm text-gray-900">
          Sign up
        </span>
      </div>

      {/* ── Step 1 — Personal details ─────────────────────────────────────── */}
      {step === 1 && (
        <form onSubmit={f1.handleSubmit(submitStep1)} noValidate>
          <StepDots current={1} />
          <h1 className="text-[21px] font-semibold text-gray-900 tracking-tight mb-1">
            Create account
          </h1>
          <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
            Step 1 of 3 — Your personal details
          </p>

          {/* First + Last name side by side */}
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            <div>
              <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
                First name
              </label>
              <input
                {...f1.register("first_name")}
                placeholder="Adaeze"
                autoComplete="given-name"
                className={inputCls(!!f1.formState.errors.first_name)}
              />
              {f1.formState.errors.first_name && (
                <p className="text-[12px] text-red-500 mt-1">
                  {f1.formState.errors.first_name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
                Last name
              </label>
              <input
                {...f1.register("last_name")}
                placeholder="Okafor"
                autoComplete="family-name"
                className={inputCls(!!f1.formState.errors.last_name)}
              />
              {f1.formState.errors.last_name && (
                <p className="text-[12px] text-red-500 mt-1">
                  {f1.formState.errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          {/* After first name + last name grid, before email */}
          <div className="mb-3.5">
            <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
              Username
            </label>
            <UsernameInput
              firstName={f1.watch("first_name") ?? ""}
              lastName={f1.watch("last_name")  ?? ""}
              value={username}
              onChange={setUsername}
            />
            <p className="text-[11.5px] text-gray-400 mt-1.5">
              This is what you will use to sign in
            </p>
          </div>

          <div className="mb-5">
            <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
              Email address
            </label>
            <input
              {...f1.register("email")}
              type="email"
              autoComplete="email"
              placeholder="you@organisation.ng"
              className={inputCls(!!f1.formState.errors.email)}
            />
            {f1.formState.errors.email && (
              <p className="text-[12px] text-red-500 mt-1">
                {f1.formState.errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sidebar text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors"
          >
            Continue
          </button>
          <p className="text-center text-[13px] text-gray-500 mt-4">
            Already have an account?{" "}
            <Link href="/login" className="text-emerald-mid font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      )}

      {/* ── Step 2 — Organisation ───────────────────────────────────────── */}
      {step === 2 && (
        <form onSubmit={f2.handleSubmit(submitStep2)} noValidate>
          <StepDots current={2} />
          <h1 className="text-[21px] font-semibold text-gray-900 tracking-tight mb-1">
            Your organisation
          </h1>
          <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
            Step 2 of 3 — Find your organisation
          </p>

          {/* Organisation search */}
          <div className="mb-5">
            <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
              Organisation name
            </label>
            <OrgSearchInput
              onSelect={(org) => {
                setSelectedOrg(org);
                setOrgError("");
              }}
              error={orgError}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sidebar text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors mb-2.5"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-3 border-[1.5px] border-gray-200 text-sm text-gray-500 font-medium rounded-[10px] hover:border-emerald-mid hover:text-emerald-mid transition-all"
          >
            ← Back
          </button>
        </form>
      )}

      {/* ── Step 3 — Password ─────────────────────────────────────────────── */}
      {step === 3 && (
        <form onSubmit={f3.handleSubmit(submitStep3)} noValidate>
          <StepDots current={3} />
          <h1 className="text-[21px] font-semibold text-gray-900 tracking-tight mb-1">
            Secure your account
          </h1>
          <p className="text-[13.5px] text-gray-500 mb-6 leading-relaxed">
            Step 3 of 3 — Create a strong password
          </p>

          <div className="mb-3.5">
            <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                {...f3.register("password")}
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                onChange={(e) => {
                  setPw(e.target.value);
                  f3.setValue("password", e.target.value);
                }}
                className={inputCls(!!f3.formState.errors.password) + " pr-10"}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Toggle password"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {/* Strength bar */}
            <div className="h-[3px] rounded-sm bg-gray-100 mt-2 overflow-hidden">
              <div
                className="h-full rounded-sm transition-all duration-300"
                style={{ width: strength.w, background: strength.color }}
              />
            </div>
            <p className="text-[11.5px] mt-1" style={{ color: strength.color }}>
              {strength.label}
            </p>
            {f3.formState.errors.password && (
              <p className="text-[12px] text-red-500 mt-1">
                {f3.formState.errors.password.message}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
              Confirm password
            </label>
            <input
              {...f3.register("confirm_password")}
              type="password"
              autoComplete="new-password"
              placeholder="Repeat your password"
              className={inputCls(!!f3.formState.errors.confirm_password)}
            />
            {f3.formState.errors.confirm_password && (
              <p className="text-[12px] text-red-500 mt-1">
                {f3.formState.errors.confirm_password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={signup.isPending}
            className="w-full py-3 bg-sidebar text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors mb-2.5 disabled:opacity-60"
          >
            {signup.isPending ? "Creating account…" : "Create account"}
          </button>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full py-3 border-[1.5px] border-gray-200 text-sm text-gray-500 font-medium rounded-[10px] hover:border-emerald-mid hover:text-emerald-mid transition-all"
          >
            ← Back
          </button>
        </form>
      )}

      {/* ── Done ─────────────────────────────────────────────────────────── */}
      {step === "done" && (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-emerald-light flex items-center justify-center mx-auto mb-4">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
              stroke="#1c6e4e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>

          <h1 className="text-[21px] font-semibold text-gray-900 mb-2">
            Account created!
          </h1>
          <p className="text-[13.5px] text-gray-500 mb-5 leading-relaxed">
            Welcome to SAFEPULSE,{" "}
            <strong className="text-gray-800">{formData.first_name}</strong>.
          </p>

          {/* Username box */}
          <div className="bg-emerald-pale border border-emerald-light rounded-xl p-4 mb-5 text-left">
            <p className="text-[11.5px] font-semibold text-gray-400 uppercase tracking-wide mb-1">
              Your login username
            </p>
            <p className="text-[18px] font-bold text-emerald-sp font-mono tracking-wide">
              {createdUsername}
            </p>
            <p className="text-[12px] text-gray-400 mt-1.5">
              Use this username to sign in. Save it somewhere safe.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5 text-left">
            <p className="text-[12.5px] text-amber-700 font-medium flex items-center gap-2">
              <span>⚠️</span> Please write this down or screenshot it before leaving this page.
            </p>
          </div>

          <p className="text-[13px] text-gray-400 mb-5">
            Organisation:{" "}
            <strong className="text-gray-600">{selectedOrg?.name}</strong>
          </p>

          <Link
            href="/login"
            className="block w-full py-3 bg-sidebar text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors text-center"
          >
            Go to sign in →
          </Link>
        </div>
      )}
    </div>
  );
}
