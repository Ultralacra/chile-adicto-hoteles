"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Images as ImagesIcon,
  Sliders,
  Tag,
  MapPin,
  CalendarDays,
  PanelTop,
} from "lucide-react";
import { SiteProvider } from "@/contexts/site-context";
import { SiteSelector } from "@/components/site-selector";
import { SiteLoadingOverlay } from "@/components/site-loading-overlay";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (pathname === "/admin/login") {
      setIsAuthenticated(false);
      setAuthChecked(true);
      return;
    }

    const auth = sessionStorage.getItem("adminAuthenticated");
    if (!auth) {
      setIsAuthenticated(false);
      setAuthChecked(true);
      router.push("/admin/login");
    } else {
      setIsAuthenticated(true);
      setAuthChecked(true);
    }
  }, [router, pathname]);

  useEffect(() => {
    // Cerrar el drawer móvil al navegar para evitar estados inconsistentes.
    setIsSidebarOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuthenticated");
    router.push("/admin/login");
  };

  // Don't show sidebar on login page
  if (pathname === "/admin/login") {
    return (
      <SiteProvider>
        <div className="font-neutra">{children}</div>
      </SiteProvider>
    );
  }

  if (!authChecked) {
    return (
      <SiteProvider>
        <div className="min-h-screen bg-[#f3f3f1]" />
      </SiteProvider>
    );
  }

  if (!isAuthenticated) {
    return (
      <SiteProvider>
        <div className="min-h-screen bg-[#f3f3f1]" />
      </SiteProvider>
    );
  }

  const navigationGroups = [
    {
      label: "Contenido",
      items: [
        { href: "/admin", icon: Home, label: "Resumen" },
        { href: "/admin/posts", icon: FileText, label: "Posts" },
        {
          href: "/admin/agenda-cultural",
          icon: CalendarDays,
          label: "Agenda cultural",
        },
      ],
    },
    {
      label: "Catálogo",
      items: [
        { href: "/admin/categories", icon: Tag, label: "Categorías" },
        { href: "/admin/communes", icon: MapPin, label: "Comunas" },
      ],
    },
    {
      label: "Recursos",
      items: [
        { href: "/admin/sliders", icon: Sliders, label: "Sliders" },
        { href: "/admin/images", icon: ImagesIcon, label: "Biblioteca" },
        { href: "/admin/settings", icon: Settings, label: "Configuración" },
      ],
    },
  ];

  return (
    <SiteProvider>
      <SiteLoadingOverlay />
      <div className="min-h-screen bg-[#f3f3f1] text-[#20211f] overflow-x-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-[60] border-b border-black/10 bg-[#f3f3f1]/95 px-4 py-3 backdrop-blur flex items-center justify-between">
          <div className="flex items-center gap-2 font-neutra-demi text-[18px] tracking-wide uppercase">
            <PanelTop className="size-5 text-[var(--color-brand-red)]" /> Chile
            Adicto
          </div>
          <button
            type="button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-none p-2 hover:bg-black/5"
            aria-label={isSidebarOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isSidebarOpen}
            aria-controls="admin-mobile-sidebar"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside
          id="admin-mobile-sidebar"
          className={`fixed top-0 left-0 h-full w-[17.5rem] bg-[#22231f] text-white transform transition-transform duration-300 z-[70] flex flex-col ${
            isSidebarOpen
              ? "translate-x-0 pointer-events-auto"
              : "-translate-x-full pointer-events-none"
          } lg:translate-x-0 lg:pointer-events-auto`}
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center bg-[var(--color-brand-red)] text-white">
                <PanelTop className="size-5" />
              </div>
              <div>
                <h1 className="font-neutra-demi text-[20px] uppercase tracking-wide">
                  Chile Adicto
                </h1>
                <p className="mt-0.5 text-xs tracking-wide text-white/50 uppercase">
                  Administración
                </p>
              </div>
            </div>
          </div>

          {/* Site Selector */}
          <div className="border-b border-white/10 px-3 py-4">
            <SiteSelector />
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-5">
            {navigationGroups.map((group) => (
              <div className="mb-6" key={group.label}>
                <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.href === "/admin"
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${isActive ? "bg-white text-[#22231f]" : "text-white/65 hover:bg-white/10 hover:text-white"}`}
                      >
                        <Icon className="size-[18px]" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-white/65 hover:bg-white/10 hover:text-white transition-colors"
            >
              <LogOut size={20} />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-[65] lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="lg:ml-[17.5rem] min-h-screen">
          <div className="hidden lg:flex h-16 items-center justify-between border-b border-black/10 bg-[#f3f3f1] px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#61625d]">
              Panel editorial
            </p>
            <p className="text-sm text-[#61625d]">
              Gestiona contenido y publicación del sitio
            </p>
          </div>
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-7 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </SiteProvider>
  );
}
