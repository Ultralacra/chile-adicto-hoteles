"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FileText,
  Plus,
  Settings,
  LogOut,
  Menu,
  X,
  Images as ImagesIcon,
} from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("adminAuthenticated");
    if (!auth && pathname !== "/admin/login") {
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
    }
  }, [router, pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    router.push("/admin/login");
  };

  // Don't show sidebar on login page
  if (pathname === "/admin/login" || !isAuthenticated) {
    return <div className={inter.className}>{children}</div>;
  }

  const menuItems = [
    { href: "/admin", icon: Home, label: "Inicio" },
    { href: "/admin/posts", icon: FileText, label: "Posts" },
    { href: "/admin/posts/new", icon: Plus, label: "Crear nuevo" },
    { href: "/admin/images", icon: ImagesIcon, label: "Imágenes" },
    { href: "/admin/settings", icon: Settings, label: "Configuración" },
  ];

  return (
    <div className={`${inter.className} min-h-screen bg-gray-100`}>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold">Administrador Chile Adicto</h1>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[var(--color-brand-black)] text-white transform transition-transform duration-300 z-50 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Chile Adicto</h1>
          <p className="text-sm text-gray-400 mt-1">Panel de administración</p>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-[var(--color-brand-red)] text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
