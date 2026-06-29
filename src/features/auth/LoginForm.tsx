"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useLogin } from "@/hooks";
import { cn } from "@/utils";

const schema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});
type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const [showPass, setShowPass] = useState(false);
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      await login.mutateAsync(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Invalid username or password.");
    }
  }

  return (
    <div>
      {/* Tab row */}
      <div className="flex gap-0 bg-bg rounded-[10px] p-[3px] w-fit mb-8">
        <span className="px-6 py-2 rounded-[8px] bg-white text-sm font-medium shadow-sm text-gray-900">
          Sign in
        </span>
        <Link
          href="/signup"
          className="px-6 py-2 rounded-[8px] text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          Sign up
        </Link>
      </div>

      <h1 className="text-[21px] font-semibold text-gray-900 tracking-tight mb-1">
        Welcome back
      </h1>
      <p className="text-[13.5px] text-gray-500 mb-7 leading-relaxed">
        Sign in to your SAFEPULSE dashboard.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Username or Email */}
        <div className="mb-3.5">
          <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
            Username or Email Address
          </label>
          <input
            {...register("username")}
            type="text"
            autoComplete="username"
            placeholder="Enter your username or email"
            className={cn(
              "w-full px-3.5 py-2.5 border-[1.5px] rounded-[9px] text-sm outline-none transition-all",
              "border-gray-200 focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10",
              errors.username && "border-red-400"
            )}
          />
          {errors.username && (
            <p className="text-[12px] text-red-500 mt-1">
              {errors.username.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block text-[12.5px] font-medium text-gray-800 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              {...register("password")}
              type={showPass ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              className={cn(
                "w-full px-3.5 py-2.5 pr-10 border-[1.5px] rounded-[9px] text-sm outline-none transition-all",
                "border-gray-200 focus:border-emerald-mid focus:ring-2 focus:ring-emerald-mid/10",
                errors.password && "border-red-400"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Toggle password visibility"
            >
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[12px] text-red-500 mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember + forgot */}
        <div className="flex items-center justify-between mb-5">
          <label className="flex items-center gap-2 text-[13px] text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              className="w-3.5 h-3.5 accent-emerald-mid cursor-pointer"
            />
            Keep me signed in
          </label>
          <span className="text-[13px] text-emerald-mid font-medium hover:underline cursor-pointer">
            Forgot password?
          </span>
        </div>

        <button
          type="submit"
          disabled={login.isPending}
          className="w-full py-3 bg-sidebar text-white text-sm font-medium rounded-[10px] hover:bg-emerald-sp transition-colors disabled:opacity-60"
        >
          {login.isPending ? "Signing in…" : "Sign in to dashboard"}
        </button>
      </form>

      <p className="text-center text-[13px] text-gray-500 mt-5">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-emerald-mid font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
