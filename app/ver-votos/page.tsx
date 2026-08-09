"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";

type Vote = {
  id: number;
  hotel_slug: string;
  voter_name: string;
  voter_email: string;
  created_at: string;
  site: string;
  category: string;
  hearts: number;
};

type TopHotel = {
  hotelSlug: string;
  count: number;
};

const slugAliases: Record<string, string> = {
  leonera: "leonera-hotel",
  "hotel-puerta-del-sur":
    "hotel-puerta-del-sur-el-primer-hotel-santuario-en-la-primera-ciudad-humedal-de-america-latina",
};

const normalizeSlug = (slug: string) => slugAliases[slug] || slug;

export default function VerVotosPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [total, setTotal] = useState(0);
  const [totalHotels, setTotalHotels] = useState(0);
  const [hotels, setHotels] = useState<TopHotel[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [filterSite, setFilterSite] = useState<string>("chileadicto");
  const [exporting, setExporting] = useState(false);

  // Cargar votos iniciales
  const fetchVotes = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/votes?site=${filterSite}&page=${page}&pageSize=50`,
      );
      const data = await res.json();
      if (data.ok) {
        setVotes(data.votes);
        setTotal(data.total);
        setTotalHotels(data.totalHotels);
        setHotels(data.hotels || []);
        setTotalPages(data.totalPages);
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error("Error fetching votes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVotes();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel("votes-realtime")
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "votes",
        },
        (payload) => {
          console.log("Nuevo voto recibido:", payload);
          // Recargar todos los votos cuando haya un cambio
          fetchVotes();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterSite, page]);

  // Formatear fecha
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Formatear nombre del hotel
  const formatHotelName = (slug: string) => {
    return normalizeSlug(slug)
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const exportToExcelCsv = async () => {
    setExporting(true);
    try {
      const res = await fetch(`/api/votes?site=${filterSite}&export=csv`);
      if (!res.ok) throw new Error("No se pudo exportar los votos");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `votos-${filterSite}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f3f1] px-4 py-6 text-[#20211f] sm:px-6 lg:px-7 lg:py-8">
      <div className="mx-auto w-full max-w-[1440px] space-y-7">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
                Administración editorial
              </p>
              <h1 className="font-neutra-demi text-3xl uppercase tracking-wide text-gray-900">
                Panel de Votos en Tiempo Real
              </h1>
              <p className="mt-2 text-[#61625d]">
                Última actualización:{" "}
                {lastUpdate ? lastUpdate.toLocaleTimeString("es-CL") : "—"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro de sitio */}
              <select
                value={filterSite}
                onChange={(e) => {
                  setPage(1);
                  setFilterSite(e.target.value);
                }}
                className="h-10 rounded-none border border-black/10 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-red)]"
              >
                <option value="chileadicto">Chile Adicto</option>
                <option value="santiagoadicto">Santiago Adicto</option>
                <option value="todos">Todos</option>
              </select>

              <button
                type="button"
                onClick={exportToExcelCsv}
                disabled={exporting || loading}
                className="h-10 rounded-none border border-black/10 bg-white px-4 text-sm font-medium hover:bg-[#f7f7f4]"
                title="Descargar CSV"
              >
                {exporting ? "Exportando…" : "Exportar CSV"}
              </button>

              {/* Indicador de tiempo real */}
              <div className="flex h-10 items-center gap-2 border border-green-200 bg-green-50 px-3 text-green-700">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">En vivo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-[minmax(250px,0.8fr)_minmax(0,2.2fr)]">
          {/* Estadísticas */}
          <div>
            <div className="mb-6 border border-black/10 bg-white p-6">
              <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f] mb-4">
                Resumen
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between border border-blue-100 bg-blue-50 p-4">
                  <span className="text-gray-600">Total de votos</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {total}
                  </span>
                </div>
                <div className="flex items-center justify-between border border-purple-100 bg-purple-50 p-4">
                  <span className="text-gray-600">Hoteles votados</span>
                  <span className="text-3xl font-bold text-purple-600">
                    {totalHotels}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 10 hoteles */}
            <div className="border border-black/10 bg-white p-6">
              <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f] mb-4">
                Hoteles votados
              </h2>
              <div className="space-y-3">
                {hotels.map(({ hotelSlug, count }, index) => (
                  <div
                    key={hotelSlug}
                    className="flex items-center justify-between gap-3 border border-black/5 bg-[#f7f7f4] p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatHotelName(hotelSlug)}
                      </span>
                    </div>
                    <span className="border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-sm font-semibold text-blue-800">
                      {count}
                    </span>
                  </div>
                ))}
                {hotels.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay votos aún
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lista de votos */}
          <div>
            <div className="overflow-hidden border border-black/10 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 bg-[#fafaf8] p-5">
                <h2 className="font-neutra-demi text-xl uppercase tracking-wide text-[#20211f]">
                  Votos Recientes
                </h2>
                {!loading && votes.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-[#61625d]">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={page === 1 || loading}
                      className="border border-black/10 bg-white px-3 py-2 text-xs uppercase tracking-wide hover:bg-[#f7f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <span className="whitespace-nowrap">
                      {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={page >= totalPages || loading}
                      className="border border-black/10 bg-white px-3 py-2 text-xs uppercase tracking-wide hover:bg-[#f7f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Cargando votos...
                </div>
              ) : votes.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No hay votos registrados
                </div>
              ) : (
                <div className="w-full overflow-hidden">
                  <table className="w-full table-fixed text-xs">
                    <thead className="bg-[#f3f3f1] text-[#61625d]">
                      <tr>
                        <th className="w-[22%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                          Hotel
                        </th>
                        <th className="w-[9%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                          Cat.
                        </th>
                        <th className="w-[7%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                          ❤️
                        </th>
                        <th className="w-[17%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                          Votante
                        </th>
                        <th className="w-[24%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                          Email
                        </th>
                        <th className="w-[21%] px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wide">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {votes.map((vote) => (
                        <tr
                          key={vote.id}
                          className="border-t border-black/10 text-[#30312e] transition-colors hover:bg-[#f7f7f4]"
                        >
                          <td className="break-words px-3 py-3 align-top">
                            <span className="inline-flex max-w-full items-center border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-800">
                              {formatHotelName(vote.hotel_slug)}
                            </span>
                          </td>
                          <td className="break-words px-3 py-3 align-top text-xs text-[#61625d]">
                            {vote.category || "—"}
                          </td>
                          <td className="break-words px-3 py-3 align-top text-xs text-[#61625d]">
                            {vote.hearts ?? "—"}
                          </td>
                          <td className="break-words px-3 py-3 align-top text-sm text-[#30312e]">
                            {vote.voter_name}
                          </td>
                          <td className="break-all px-3 py-3 align-top text-sm text-[#61625d]">
                            {vote.voter_email}
                          </td>
                          <td className="break-words px-3 py-3 align-top text-sm text-[#61625d]">
                            {formatDate(vote.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {!loading && votes.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 bg-[#fafaf8] px-5 py-4 text-sm text-[#61625d]">
                  <span>
                    Página {page} de {totalPages} ·{" "}
                    {total.toLocaleString("es-CL")} votos
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.max(1, current - 1))
                      }
                      disabled={page === 1 || loading}
                      className="border border-black/10 bg-white px-3 py-2 text-xs uppercase tracking-wide hover:bg-[#f7f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((current) => Math.min(totalPages, current + 1))
                      }
                      disabled={page >= totalPages || loading}
                      className="border border-black/10 bg-white px-3 py-2 text-xs uppercase tracking-wide hover:bg-[#f7f7f4] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
