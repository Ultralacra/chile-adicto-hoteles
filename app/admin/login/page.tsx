"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/contexts/language-context"
import Image from "next/image"

export default function AdminLoginPage() {
  const router = useRouter()
  const { language } = useLanguage()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (username === "admin" && password === "chileadicto2024") {
      // Store authentication in sessionStorage
      sessionStorage.setItem("adminAuthenticated", "true")
      router.push("/admin")
    } else {
      setError(language === "es" ? "Usuario o contraseña incorrectos" : "Incorrect username or password")
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <Image
            src="/logo-best-espanol-blanco-footer.jpg"
            alt="Chile Adicto"
            width={200}
            height={80}
            className="mx-auto mb-8"
          />
          <h2 className="text-3xl font-bold uppercase text-[var(--color-brand-black)]">
            {language === "es" ? "Acceso Administrativo" : "Admin Access"}
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                {language === "es" ? "Usuario" : "Username"}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent"
                placeholder={language === "es" ? "Ingrese su usuario" : "Enter your username"}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {language === "es" ? "Contraseña" : "Password"}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-brand-red)] focus:border-transparent"
                placeholder={language === "es" ? "Ingrese su contraseña" : "Enter your password"}
                required
              />
            </div>
          </div>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          <button
            type="submit"
            className="w-full bg-[var(--color-brand-red)] text-white py-3 px-4 rounded-lg font-bold uppercase hover:opacity-90 transition-opacity"
          >
            {language === "es" ? "Iniciar Sesión" : "Sign In"}
          </button>
        </form>

        {/* Credentials hint for development */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
          <p className="font-medium mb-1">
            {language === "es" ? "Credenciales de desarrollo:" : "Development credentials:"}
          </p>
          <p>
            Usuario / Username: <strong>admin</strong>
          </p>
          <p>
            Contraseña / Password: <strong>chileadicto2024</strong>
          </p>
        </div>
      </div>
    </div>
  )
}
