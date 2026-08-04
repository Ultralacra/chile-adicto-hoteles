"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/language-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === "admin" && password === "chileadicto2024") {
      // Store authentication in sessionStorage
      sessionStorage.setItem("adminAuthenticated", "true");
      router.push("/admin");
    } else {
      setError(
        language === "es"
          ? "Usuario o contraseña incorrectos"
          : "Incorrect username or password",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f1] flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <div className="mx-auto mb-8 flex justify-center">
            <img
              src="/logo-best-espanol.svg"
              alt="Chile Adicto"
              className="h-16 w-auto"
            />
          </div>
          <h2 className="font-neutra-demi text-3xl uppercase tracking-wide text-[#20211f]">
            {language === "es" ? "Acceso Administrativo" : "Admin Access"}
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {language === "es" ? "Usuario" : "Username"}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-black/10 bg-white px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent"
                placeholder={
                  language === "es"
                    ? "Ingrese su usuario"
                    : "Enter your username"
                }
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {language === "es" ? "Contraseña" : "Password"}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black/10 bg-white px-4 py-3 focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent"
                placeholder={
                  language === "es"
                    ? "Ingrese su contraseña"
                    : "Enter your password"
                }
                required
              />
            </div>
          </div>

          {error && (
            <div className="border border-[#ba1028]/20 bg-[#fff1f2] px-4 py-3 text-[#ba1028]">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-[var(--color-brand-red)] px-4 py-3 font-bold uppercase text-white transition-opacity hover:opacity-90"
          >
            {language === "es" ? "Iniciar Sesión" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
