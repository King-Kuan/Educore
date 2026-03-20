"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, changePassword } from "@educore/firebase";
import { isFirstLogin } from "@educore/firebase";
import toast from "react-hot-toast";
import { Eye, EyeOff, BookOpen, Lock, Mail, KeyRound } from "lucide-react";

const loginSchema = z.object({
  email:    z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password too short"),
});

const changeSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirm:     z.string(),
}).refine((d) => d.newPassword === d.confirm, {
  message: "Passwords do not match",
  path:    ["confirm"],
});

type LoginForm  = z.infer<typeof loginSchema>;
type ChangeForm = z.infer<typeof changeSchema>;

export default function LoginPage() {
  const router          = useRouter();
  const [showPass, setShowPass]   = useState(false);
  const [showNew,  setShowNew]    = useState(false);
  const [needsChange, setNeedsChange] = useState(false);

  const {
    register: regLogin,
    handleSubmit: handleLogin,
    formState: { errors: loginErrors, isSubmitting: loginLoading },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const {
    register: regChange,
    handleSubmit: handleChange,
    formState: { errors: changeErrors, isSubmitting: changeLoading },
  } = useForm<ChangeForm>({ resolver: zodResolver(changeSchema) });

  const onLogin = async (data: LoginForm) => {
    try {
      const user = await signIn(data.email, data.password);
      const first = await isFirstLogin(user.uid);
      if (first) {
        setNeedsChange(true);
        return;
      }
      toast.success("Welcome back!");
      router.replace("/");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("invalid-credential") || msg.includes("wrong-password")) {
        toast.error("Incorrect email or password");
      } else {
        toast.error("Sign in failed. Try again.");
      }
    }
  };

  const onChangePassword = async (data: ChangeForm) => {
    try {
      await changePassword(data.newPassword);
      toast.success("Password updated. Welcome!");
      router.replace("/");
    } catch {
      toast.error("Failed to update password");
    }
  };

  return (
    <div className="min-h-screen bg-brand-600 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 rounded-2xl mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">EduCore RW</h1>
          <p className="text-white/60 text-sm mt-1 font-mono tracking-wide">Teacher App</p>
        </div>

        {!needsChange ? (
          /* ── LOGIN FORM ── */
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <h2 className="font-semibold text-gray-800 mb-5">Sign in to your account</h2>
            <form onSubmit={handleLogin(onLogin)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regLogin("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="you@school.rw"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regLogin("password")}
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3 bg-brand-600 text-white font-semibold text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {loginLoading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-4">
              Account created by your school principal
            </p>
          </div>
        ) : (
          /* ── SET NEW PASSWORD FORM (first login) ── */
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-800 text-sm">Set your password</h2>
                <p className="text-xs text-gray-500">First login — create a permanent password</p>
              </div>
            </div>

            <form onSubmit={handleChange(onChangePassword)} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">New password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regChange("newPassword")}
                    type={showNew ? "text" : "password"}
                    placeholder="Minimum 8 characters"
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <button type="button" onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {changeErrors.newPassword && <p className="text-red-500 text-xs mt-1">{changeErrors.newPassword.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    {...regChange("confirm")}
                    type="password"
                    placeholder="Repeat your password"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
                {changeErrors.confirm && <p className="text-red-500 text-xs mt-1">{changeErrors.confirm.message}</p>}
              </div>

              <button
                type="submit"
                disabled={changeLoading}
                className="w-full py-3 bg-brand-600 text-white font-semibold text-sm rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
              >
                {changeLoading ? "Saving…" : "Set password & continue"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
