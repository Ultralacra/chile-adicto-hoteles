"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

type HomeResp = { desktop: string[]; mobile: string[] };

export default function AdminSlidersList() {
  const [home, setHome] = useState<HomeResp | null>(null);
  const [restDesktopES, setRestDesktopES] = useState<string[]>([]);
  const [restDesktopEN, setRestDesktopEN] = useState<string[]>([]);
  const [restMobile, setRestMobile] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantsPosts, setRestaurantsPosts] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [destinations, setDestinations] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    let cancelled = false;
    async function loadAll() {
      setLoading(true);
      try {
        // Home: usa API existente
        const rHome = await fetch("/api/slider-images", { cache: "no-store" });
        const jHome = rHome.ok
          ? ((await rHome.json()) as HomeResp)
          : { desktop: [], mobile: [] };
        if (!cancelled) setHome(jHome);

        // Restaurantes Desktop: manifest por idioma (si existe objeto {es,en})
        const rMan = await fetch("/imagenes-slider/manifest.json", {
          cache: "no-store",
        });
        if (rMan.ok) {
          const j = await rMan.json();
          if (Array.isArray(j)) {
            // formato array simple: lo mostramos como ES y EN iguales
            if (!cancelled) {
              setRestDesktopES(
                j.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`
                )
              );
              setRestDesktopEN(
                j.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`
                )
              );
            }
          } else if (j && typeof j === "object") {
            const es = Array.isArray(j.es) ? j.es : [];
            const en = Array.isArray(j.en) ? j.en : [];
            if (!cancelled) {
              setRestDesktopES(
                es.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`
                )
              );
              setRestDesktopEN(
                en.map((s: string) =>
                  s.startsWith("/") ? s : `/imagenes-slider/${s}`
                )
              );
            }
          }
        }

        // Restaurantes Mobile: carpeta pública listada por API (si existe)
        try {
          const rMob = await fetch("/api/restaurant-slider-mobile", {
            cache: "no-store",
          });
          if (rMob.ok) {
            const jm = await rMob.json();
            const imgs: string[] = Array.isArray(jm.images) ? jm.images : [];
            if (!cancelled) setRestMobile(imgs);
          } else {
            if (!cancelled) setRestMobile([]);
          }
        } catch {
          if (!cancelled) setRestMobile([]);
        }

        // Posts de restaurantes (para derivar href destino de cada imagen)
        try {
          const rPosts = await fetch("/api/posts?categorySlug=restaurantes", {
            cache: "no-store",
          });
          const rows = rPosts.ok ? await rPosts.json() : [];
          if (!cancelled && Array.isArray(rows)) setRestaurantsPosts(rows);
        } catch {
          if (!cancelled) setRestaurantsPosts([]);
        }

        // Destinos (overrides)
        try {
          const rDest = await fetch("/api/slider-destinations", {
            cache: "no-store",
          });
          const j = rDest.ok ? await rDest.json() : {};
          if (!cancelled) setDestinations(j || {});
        } catch {
          if (!cancelled) setDestinations({});
        }
      } catch {
        if (!cancelled) {
          setHome({ desktop: [], mobile: [] });
          setRestDesktopES([]);
          setRestDesktopEN([]);
          setRestMobile([]);
          setRestaurantsPosts([]);
          setDestinations({});
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadAll();
    return () => {
      cancelled = true;
    };
  }, []);

  const RestMobileES = restMobile.filter((u) => /-1\./i.test(u));
  const RestMobileEN = restMobile.filter((u) => /-2\./i.test(u));

  // Href destino para Home: se deriva por nombre de archivo como en /api/slider-images
  const homeHrefFor = (filenameOrUrl: string) => {
    const norm = (s: string) =>
      s
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();
    const name = norm(
      (filenameOrUrl.split("/").pop() || filenameOrUrl).replace(/\.[^.]+$/, "")
    );
    const has = (k: string) => name.includes(k);
    let key: string | null = null;
    if (has("NINOS") || has("NIÑOS")) key = "NINOS";
    if (/^(ARQ|ARQU|AQU|AQI)/.test(name) || has("ARQUITECTURA"))
      key = "ARQUITECTURA";
    else if (has("BARRIOS")) key = "BARRIOS";
    else if (has("ICONOS")) key = "ICONOS";
    else if (has("MERCADOS")) key = "MERCADOS";
    else if (has("MIRADORES")) key = "MIRADORES";
    else if (has("CULTURA") || has("MUSEOS")) key = "CULTURA";
    else if (has("PALACIOS")) key = "PALACIOS";
    else if (has("PARQUES")) key = "PARQUES";
    else if (has("FUERA") || has("FUERA-DE-STGO") || has("OUTSIDE"))
      key = "FUERA-DE-STGO";
    else if (has("RESTAURANTES") || has("RESTAURANTS")) key = "RESTAURANTES";
    else key = "ICONOS";
    const map: Record<string, string> = {
      ICONOS: "/iconos",
      NINOS: "/ninos",
      ARQUITECTURA: "/arquitectura",
      BARRIOS: "/barrios",
      MERCADOS: "/mercados",
      MIRADORES: "/miradores",
      CULTURA: "/museos",
      PALACIOS: "/palacios",
      PARQUES: "/parques",
      "FUERA-DE-STGO": "/paseos-fuera-de-santiago",
      RESTAURANTES: "/restaurantes",
    };
    return map[key] || "/";
  };

  // Keys para overrides por conjunto
  const keyHomeDesktop = "home-desktop";
  const keyHomeMobile = "home-mobile";
  const keyRestDES = "restaurants-desktop-es";
  const keyRestDEN = "restaurants-desktop-en";
  const keyRestMES = "restaurants-mobile-es";
  const keyRestMEN = "restaurants-mobile-en";

  const baseName = (u: string) => (u.split("/").pop() || u).trim();

  // Índice para encontrar slug de restaurante por nombre/slug
  const restaurantsIndex = useMemo(() => {
    const normKey = (str: string) =>
      String(str || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    return (restaurantsPosts || []).map((h) => {
      const slug = String(h.slug || "");
      const esName = String(h.es?.name || "");
      const enName = String(h.en?.name || "");
      return {
        slug,
        keys: [normKey(slug), normKey(esName), normKey(enName)].filter(Boolean),
      };
    });
  }, [restaurantsPosts]);

  function restaurantHrefFor(url: string) {
    const fname = url.split("/").pop() || url;
    const base = fname.replace(/\.[^.]+$/, "").replace(/-(1|2)$/i, "");
    const norm = (s: string) =>
      String(s || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const key = norm(base);
    let match: string | null = null;
    for (const row of restaurantsIndex) {
      if (
        row.keys.some((k: string) => k.startsWith(key) || key.startsWith(k))
      ) {
        match = row.slug;
        break;
      }
    }
    if (!match) {
      match = base
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    return `/${match}`;
  }

  const homeDesktopHrefs = (home?.desktop || []).map((u) => {
    const bn = baseName(u);
    return destinations?.[keyHomeDesktop]?.[bn] || homeHrefFor(u);
  });
  const homeMobileHrefs = (home?.mobile || []).map((u) => {
    const bn = baseName(u);
    return destinations?.[keyHomeMobile]?.[bn] || homeHrefFor(u);
  });
  const restDesktopESHrefs = restDesktopES.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestDES]?.[bn] || restaurantHrefFor(u);
  });
  const restDesktopENHrefs = restDesktopEN.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestDEN]?.[bn] || restaurantHrefFor(u);
  });
  const RestMobileESHrefs = RestMobileES.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestMES]?.[bn] || restaurantHrefFor(u);
  });
  const RestMobileENHrefs = RestMobileEN.map((u) => {
    const bn = baseName(u);
    return destinations?.[keyRestMEN]?.[bn] || restaurantHrefFor(u);
  });

  // --- Reordenar en UI ---
  const moveIn = (arr: string[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= arr.length) return arr;
    const copy = arr.slice();
    const tmp = copy[index];
    copy[index] = copy[j];
    copy[j] = tmp;
    return copy;
  };

  const moveHomeDesktop = (i: number, d: -1 | 1) => {
    if (!home) return;
    setHome({ ...home, desktop: moveIn(home.desktop, i, d) });
  };
  const moveHomeMobile = (i: number, d: -1 | 1) => {
    if (!home) return;
    setHome({ ...home, mobile: moveIn(home.mobile, i, d) });
  };
  const moveRestDES = (i: number, d: -1 | 1) =>
    setRestDesktopES((p) => moveIn(p, i, d));
  const moveRestDEN = (i: number, d: -1 | 1) =>
    setRestDesktopEN((p) => moveIn(p, i, d));
  const moveRestMES = (i: number, d: -1 | 1) =>
    setRestMobile((p) => {
      // mover solo elementos ES (-1)
      const idxs = p.map((u, idx) => ({ idx, isES: /-1\./i.test(u) }));
      const esIdxs = idxs.filter((o) => o.isES).map((o) => o.idx);
      if (i < 0 || i >= esIdxs.length) return p;
      const a = p.slice();
      const from = esIdxs[i];
      const to = esIdxs[i] + d;
      if (to < 0 || to >= p.length) return p;
      const tmp = a[from];
      a[from] = a[to];
      a[to] = tmp;
      return a;
    });
  const moveRestMEN = (i: number, d: -1 | 1) =>
    setRestMobile((p) => {
      // mover solo elementos EN (-2)
      const idxs = p.map((u, idx) => ({ idx, isEN: /-2\./i.test(u) }));
      const enIdxs = idxs.filter((o) => o.isEN).map((o) => o.idx);
      if (i < 0 || i >= enIdxs.length) return p;
      const a = p.slice();
      const from = enIdxs[i];
      const to = enIdxs[i] + d;
      if (to < 0 || to >= p.length) return p;
      const tmp = a[from];
      a[from] = a[to];
      a[to] = tmp;
      return a;
    });

  const reorder = (arr: string[], from: number, to: number) => {
    const a = arr.slice();
    const [item] = a.splice(from, 1);
    a.splice(to, 0, item);
    return a;
  };

  const onReorderHomeDesktop = (from: number, to: number) => {
    if (!home) return;
    setHome({ ...home, desktop: reorder(home.desktop, from, to) });
  };
  const onReorderHomeMobile = (from: number, to: number) => {
    if (!home) return;
    setHome({ ...home, mobile: reorder(home.mobile, from, to) });
  };
  const onReorderRestDES = (from: number, to: number) =>
    setRestDesktopES((p) => reorder(p, from, to));
  const onReorderRestDEN = (from: number, to: number) =>
    setRestDesktopEN((p) => reorder(p, from, to));
  const onReorderRestMES = (from: number, to: number) =>
    setRestMobile((p) => {
      const idxs = p.map((u, idx) => ({ idx, isES: /-1\./i.test(u) }));
      const esIdxs = idxs.filter((o) => o.isES).map((o) => o.idx);
      if (from < 0 || from >= esIdxs.length || to < 0 || to >= esIdxs.length)
        return p;
      const a = p.slice();
      const realFrom = esIdxs[from];
      const realTo = esIdxs[to];
      const [item] = a.splice(realFrom, 1);
      a.splice(realTo, 0, item);
      return a;
    });
  const onReorderRestMEN = (from: number, to: number) =>
    setRestMobile((p) => {
      const idxs = p.map((u, idx) => ({ idx, isEN: /-2\./i.test(u) }));
      const enIdxs = idxs.filter((o) => o.isEN).map((o) => o.idx);
      if (from < 0 || from >= enIdxs.length || to < 0 || to >= enIdxs.length)
        return p;
      const a = p.slice();
      const realFrom = enIdxs[from];
      const realTo = enIdxs[to];
      const [item] = a.splice(realFrom, 1);
      a.splice(realTo, 0, item);
      return a;
    });

  // Editar destinos overrides
  const setDest = (key: string, basename: string, value: string) => {
    setDestinations((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [basename]: value,
      },
    }));
  };

  // Editar URL (solo aplica a Restaurantes Desktop que usan manifest)
  const setUrlAt = (set: "es" | "en", idx: number, value: string) => {
    if (set === "es")
      setRestDesktopES((p) => p.map((u, i) => (i === idx ? value : u)));
    else setRestDesktopEN((p) => p.map((u, i) => (i === idx ? value : u)));
  };

  // --- Guardar orden ---
  const saveOrders = async () => {
    setSaving(true);
    try {
      // Home: PUT /api/slider-images
      if (home) {
        await fetch("/api/slider-images", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ desktop: home.desktop, mobile: home.mobile }),
        });
      }
      // Rest Desktop: PUT /api/imagenes-slider/manifest
      await fetch("/api/imagenes-slider/manifest", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ es: restDesktopES, en: restDesktopEN }),
      });
      // Rest Mobile: PUT /api/restaurant-slider-mobile con orden por idioma
      const esOrder = restMobile
        .filter((u) => /-1\./i.test(u))
        .map((u) => u.split("/").pop());
      const enOrder = restMobile
        .filter((u) => /-2\./i.test(u))
        .map((u) => u.split("/").pop());
      if (esOrder.length)
        await fetch("/api/restaurant-slider-mobile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: "es", order: esOrder }),
        });
      if (enOrder.length)
        await fetch("/api/restaurant-slider-mobile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lang: "en", order: enOrder }),
        });

      // Destinos overrides
      await fetch("/api/slider-destinations", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(destinations || {}),
      });

      // --- Sincronizar con Base de Datos (opcional y no bloqueante si no hay envs) ---
      try {
        const setsPayload = [
          {
            key: keyHomeDesktop,
            items: (home?.desktop || []).map((u, idx) => ({
              image_url: u,
              href: homeDesktopHrefs[idx] || null,
              position: idx,
            })),
          },
          {
            key: keyHomeMobile,
            items: (home?.mobile || []).map((u, idx) => ({
              image_url: u,
              href: homeMobileHrefs[idx] || null,
              position: idx,
            })),
          },
          {
            key: keyRestDES,
            items: restDesktopES.map((u, idx) => ({
              image_url: u,
              href: restDesktopESHrefs[idx] || null,
              position: idx,
              lang: "es",
            })),
          },
          {
            key: keyRestDEN,
            items: restDesktopEN.map((u, idx) => ({
              image_url: u,
              href: restDesktopENHrefs[idx] || null,
              position: idx,
              lang: "en",
            })),
          },
          {
            key: keyRestMES,
            items: RestMobileES.map((u, idx) => ({
              image_url: u,
              href: RestMobileESHrefs[idx] || null,
              position: idx,
              lang: "es",
            })),
          },
          {
            key: keyRestMEN,
            items: RestMobileEN.map((u, idx) => ({
              image_url: u,
              href: RestMobileENHrefs[idx] || null,
              position: idx,
              lang: "en",
            })),
          },
        ];
        await fetch("/api/sliders/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sets: setsPayload }),
        });
      } catch (e) {
        console.warn("[Admin Sliders] Sync DB saltado:", e);
      }
      alert("Orden guardado");
    } catch (e: any) {
      alert(`Error al guardar: ${String(e?.message || e)}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Sliders</h1>
      <p className="text-sm text-muted-foreground">
        Vista de todos los sliders actuales (solo lectura). Se muestran los
        orígenes existentes del proyecto.
      </p>
      <div className="flex gap-2">
        <button
          className="px-3 py-2 rounded bg-gray-900 text-white text-sm"
          onClick={saveOrders}
          disabled={saving}
        >
          {saving ? "Guardando…" : "Guardar orden"}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-gray-500 flex items-center gap-2">
          <Spinner className="size-5" /> Cargando…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Home Desktop */}
          <Card className="p-4">
            <h2 className="font-medium mb-3">Home · Desktop</h2>
            <ImagesGrid
              urls={home?.desktop || []}
              hrefs={homeDesktopHrefs}
              emptyText="Sin imágenes"
              onMove={(i, d) => moveHomeDesktop(i, d)}
              onReorder={(from, to) => onReorderHomeDesktop(from, to)}
              onChangeHref={(i, v) => {
                const u = home?.desktop?.[i];
                if (!u) return;
                setDest(keyHomeDesktop, baseName(u), v);
              }}
            />
          </Card>

          {/* Home Mobile */}
          <Card className="p-4">
            <h2 className="font-medium mb-3">Home · Móvil</h2>
            <ImagesGrid
              urls={home?.mobile || []}
              hrefs={homeMobileHrefs}
              emptyText="Sin imágenes"
              onMove={(i, d) => moveHomeMobile(i, d)}
              onReorder={(from, to) => onReorderHomeMobile(from, to)}
              onChangeHref={(i, v) => {
                const u = home?.mobile?.[i];
                if (!u) return;
                setDest(keyHomeMobile, baseName(u), v);
              }}
            />
          </Card>

          {/* Restaurantes Desktop ES */}
          <Card className="p-4">
            <h2 className="font-medium mb-3">Restaurantes · Desktop (ES)</h2>
            <ImagesGrid
              urls={restDesktopES}
              hrefs={restDesktopESHrefs}
              emptyText="Sin imágenes (manifest)"
              onMove={(i, d) => moveRestDES(i, d)}
              onReorder={(from, to) => onReorderRestDES(from, to)}
              onChangeUrl={(i, v) => setUrlAt("es", i, v)}
              onChangeHref={(i, v) =>
                setDest(keyRestDES, baseName(restDesktopES[i] || ""), v)
              }
            />
          </Card>

          {/* Restaurantes Desktop EN */}
          <Card className="p-4">
            <h2 className="font-medium mb-3">Restaurantes · Desktop (EN)</h2>
            <ImagesGrid
              urls={restDesktopEN}
              hrefs={restDesktopENHrefs}
              emptyText="Sin imágenes (manifest)"
              onMove={(i, d) => moveRestDEN(i, d)}
              onReorder={(from, to) => onReorderRestDEN(from, to)}
              onChangeUrl={(i, v) => setUrlAt("en", i, v)}
              onChangeHref={(i, v) =>
                setDest(keyRestDEN, baseName(restDesktopEN[i] || ""), v)
              }
            />
          </Card>

          {/* Restaurantes Móvil ES */}
          <Card className="p-4">
            <h2 className="font-medium mb-3">Restaurantes · Móvil (ES)</h2>
            <ImagesGrid
              urls={RestMobileES}
              hrefs={RestMobileESHrefs}
              emptyText="Sin imágenes (carpeta -1)"
              onMove={(i, d) => moveRestMES(i, d)}
              onReorder={(from, to) => onReorderRestMES(from, to)}
              onChangeHref={(i, v) =>
                setDest(keyRestMES, baseName(RestMobileES[i] || ""), v)
              }
            />
          </Card>

          {/* Restaurantes Móvil EN */}
          <Card className="p-4">
            <h2 className="font-medium mb-3">Restaurantes · Móvil (EN)</h2>
            <ImagesGrid
              urls={RestMobileEN}
              hrefs={RestMobileENHrefs}
              emptyText="Sin imágenes (carpeta -2)"
              onMove={(i, d) => moveRestMEN(i, d)}
              onReorder={(from, to) => onReorderRestMEN(from, to)}
              onChangeHref={(i, v) =>
                setDest(keyRestMEN, baseName(RestMobileEN[i] || ""), v)
              }
            />
          </Card>
        </div>
      )}
    </div>
  );
}

function ImagesGrid({
  urls,
  hrefs,
  emptyText,
  onMove,
  onReorder,
  onChangeUrl,
  onChangeHref,
}: {
  urls: string[];
  hrefs?: string[];
  emptyText?: string;
  onMove?: (index: number, dir: -1 | 1) => void;
  onReorder?: (from: number, to: number) => void;
  onChangeUrl?: (index: number, value: string) => void;
  onChangeHref?: (index: number, value: string) => void;
}) {
  if (!urls || urls.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        {emptyText || "Sin imágenes"}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {urls.map((u, i) => (
        <div
          key={i}
          className="relative w-full pb-[56%] bg-gray-100 overflow-hidden rounded group"
          draggable={!!onReorder}
          onDragStart={(e) => {
            e.dataTransfer.setData("text/plain", String(i));
          }}
          onDragOver={(e) => {
            if (onReorder) e.preventDefault();
          }}
          onDrop={(e) => {
            if (!onReorder) return;
            e.preventDefault();
            const fromStr = e.dataTransfer.getData("text/plain");
            const from = parseInt(fromStr, 10);
            if (Number.isFinite(from)) onReorder(from, i);
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={u}
            alt={`img-${i}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {onMove ? (
            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                className="px-1.5 py-0.5 text-[11px] rounded bg-white/90 hover:bg-white shadow"
                onClick={() => onMove(i, -1)}
                title="Subir"
              >
                ↑
              </button>
              <button
                className="px-1.5 py-0.5 text-[11px] rounded bg-white/90 hover:bg-white shadow"
                onClick={() => onMove(i, +1)}
                title="Bajar"
              >
                ↓
              </button>
            </div>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] px-1 py-0.5 space-y-0.5">
            <div className="truncate">{u}</div>
            {hrefs?.[i] ? (
              <div className="truncate text-emerald-200">
                Destino: {hrefs[i]}
              </div>
            ) : null}
          </div>
          {onChangeUrl || onChangeHref ? (
            <div className="absolute inset-x-0 bottom-0 translate-y-full mt-1 text-[11px] space-y-1">
              {onChangeUrl ? (
                <div className="flex gap-1 items-center">
                  <span className="min-w-[60px] text-gray-500">Imagen:</span>
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    value={u}
                    onChange={(e) => onChangeUrl(i, e.target.value)}
                  />
                </div>
              ) : null}
              {onChangeHref ? (
                <div className="flex gap-1 items-center">
                  <span className="min-w-[60px] text-gray-500">Destino:</span>
                  <input
                    className="flex-1 border rounded px-2 py-1"
                    value={hrefs?.[i] || ""}
                    onChange={(e) => onChangeHref(i, e.target.value)}
                    placeholder="p. ej. /iconos o /mi-post"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
