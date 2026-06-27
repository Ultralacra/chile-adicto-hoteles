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
};

type VoteCounts = Record<string, number>;

export default function VerVotosPage() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [counts, setCounts] = useState<VoteCounts>({});
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [filterSite, setFilterSite] = useState<string>("chileadicto");

  // Cargar votos iniciales
  const fetchVotes = async () => {
    try {
      const res = await fetch(`/api/votes?site=${filterSite}`);
      const data = await res.json();
      if (data.ok) {
        setVotes(data.votes);
        setTotal(data.total);

        // Calcular conteos por hotel
        const newCounts: VoteCounts = {};
        data.votes.forEach((v: Vote) => {
          newCounts[v.hotel_slug] = (newCounts[v.hotel_slug] || 0) + 1;
        });
        setCounts(newCounts);
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterSite]);

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
    return slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Ordenar hoteles por cantidad de votos (mayor a menor)
  const sortedHotels = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                Panel de Votos en Tiempo Real
              </h1>
              <p className="text-gray-500 mt-1">
                Última actualización: {lastUpdate.toLocaleTimeString("es-CL")}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Filtro de sitio */}
              <select
                value={filterSite}
                onChange={(e) => setFilterSite(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="chileadicto">Chile Adicto</option>
                <option value="santiagoadicto">Santiago Adicto</option>
                <option value="todos">Todos</option>
              </select>

              {/* Indicador de tiempo real */}
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-2 rounded-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium">En vivo</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estadísticas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Resumen
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-gray-600">Total de votos</span>
                  <span className="text-3xl font-bold text-blue-600">
                    {total}
                  </span>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="text-gray-600">Hoteles votados</span>
                  <span className="text-3xl font-bold text-purple-600">
                    {Object.keys(counts).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Top 10 hoteles */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Top 10 Hoteles
              </h2>
              <div className="space-y-3">
                {sortedHotels.map(([hotel, count], index) => (
                  <div
                    key={hotel}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-400 w-6">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-gray-700">
                        {formatHotelName(hotel)}
                      </span>
                    </div>
                    <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-2.5 py-0.5 rounded">
                      {count}
                    </span>
                  </div>
                ))}
                {sortedHotels.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    No hay votos aún
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Lista de votos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">
                  Votos Recientes
                </h2>
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hotel
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Votante
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {votes.map((vote) => (
                        <tr
                          key={vote.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {formatHotelName(vote.hotel_slug)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {vote.voter_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {vote.voter_email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(vote.created_at)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
