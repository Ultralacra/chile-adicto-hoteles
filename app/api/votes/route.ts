import { NextResponse } from "next/server";

export const runtime = "nodejs";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const VOTE_SUMMARY_CACHE_TTL = 15_000;
const voteSummaryCache = new Map<
  string,
  { expiresAt: number; rows: any[] }
>();

const HOTEL_SLUG_ALIASES: Record<string, string> = {
  "hotel-puerta-del-sur":
    "hotel-puerta-del-sur-el-primer-hotel-santuario-en-la-primera-ciudad-humedal-de-america-latina",
};

function canonicalHotelSlug(value: unknown): string {
  const slug = String(value || "").trim().toLowerCase();
  return HOTEL_SLUG_ALIASES[slug] || slug;
}

function getHeaders() {
  return {
    apikey: SUPABASE_SERVICE_KEY!,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

function getReadHeaders() {
  return {
    apikey: SUPABASE_SERVICE_KEY!,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "count=exact",
  };
}

// POST /api/votes - Crear un voto
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      hotel_slug,
      voter_name,
      voter_email,
      site = "chileadicto",
      category,
      hearts,
    } = body;
    const canonicalSlug = canonicalHotelSlug(hotel_slug);

    // Validaciones
    if (!canonicalSlug || !voter_name || !voter_email) {
      return NextResponse.json(
        { error: "hotel_slug, voter_name y voter_email son requeridos" },
        { status: 400 }
      );
    }

    if (!category || (hearts !== 4 && hearts !== 5)) {
      return NextResponse.json(
        { error: "category y hearts (4 o 5) son requeridos" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(voter_email)) {
      return NextResponse.json(
        { error: "Email no válido" },
        { status: 400 }
      );
    }

    // Verificar si ya votó en esta categoría + corazones
    const checkRes = await fetch(
      `${SUPABASE_URL}/rest/v1/votes?voter_email=eq.${encodeURIComponent(voter_email)}&site=eq.${site}&category=eq.${encodeURIComponent(category)}&hearts=eq.${hearts}&select=id`,
      { headers: getHeaders() }
    );

    if (!checkRes.ok) {
      throw new Error("Error al verificar voto existente");
    }

    const existing = await checkRes.json();
    if (existing.length > 0) {
      return NextResponse.json(
        { error: "Ya has votado en esta categoría", already_voted: true },
        { status: 409 }
      );
    }

    // Insertar voto
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/votes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        hotel_slug: canonicalSlug,
        voter_name: voter_name.trim(),
        voter_email: voter_email.toLowerCase().trim(),
        site,
        category,
        hearts,
      }),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      // Error de unique constraint
      if (err.includes("unique")) {
        return NextResponse.json(
          { error: "Ya has votado anteriormente", already_voted: true },
          { status: 409 }
        );
      }
      throw new Error("Error al guardar voto");
    }

    const [vote] = await insertRes.json();
    voteSummaryCache.clear();

    return NextResponse.json({ ok: true, vote }, { status: 201 });
  } catch (err: any) {
    console.error("[POST /api/votes]", err);
    return NextResponse.json(
      { error: "Error interno", message: err?.message },
      { status: 500 }
    );
  }
}

// GET /api/votes - Listar votos paginados o devolver un resumen por hotel
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const site = url.searchParams.get("site") || "chileadicto";
    const hotel = url.searchParams.get("hotel");
    const groupBy = url.searchParams.get("group"); // "hotel" para contar por hotel
    const exportCsv = url.searchParams.get("export") === "csv";
    const requestedPage = Number.parseInt(url.searchParams.get("page") || "1", 10);
    const requestedPageSize = Number.parseInt(
      url.searchParams.get("pageSize") || "50",
      10,
    );
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
    const pageSize = Number.isFinite(requestedPageSize)
      ? Math.min(100, Math.max(10, requestedPageSize))
      : 50;

    const siteFilter = site === "todos" ? "" : `&site=eq.${encodeURIComponent(site)}`;
    const hotelFilter = hotel
      ? `&hotel_slug=eq.${encodeURIComponent(canonicalHotelSlug(hotel))}`
      : "";

    async function fetchAllPages(baseQuery: string, select: string) {
      const summaryPageSize = 1000;
      const cacheKey = `${baseQuery}|${select}`;
      const cached = voteSummaryCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) return cached.rows;

      const countRes = await fetch(
        `${SUPABASE_URL}/rest/v1/votes${baseQuery}&select=${select}&limit=1&offset=0`,
        { headers: getReadHeaders() },
      );
      if (!countRes.ok) throw new Error("Error al obtener datos");
      const firstPage = await countRes.json();
      const contentRange = countRes.headers.get("content-range") || "";
      const total = Number.parseInt(contentRange.split("/")[1] || "", 10);

      if (!Number.isFinite(total) || total <= summaryPageSize) {
        voteSummaryCache.set(cacheKey, {
          expiresAt: Date.now() + VOTE_SUMMARY_CACHE_TTL,
          rows: firstPage,
        });
        return firstPage;
      }

      const offsets = Array.from(
        { length: Math.ceil(total / summaryPageSize) },
        (_, index) => index * summaryPageSize,
      );
      const pages = await Promise.all(
        offsets.map(async (offset) => {
          if (offset === 0) return firstPage;
          const res = await fetch(
            `${SUPABASE_URL}/rest/v1/votes${baseQuery}&select=${select}&limit=${summaryPageSize}&offset=${offset}`,
            { headers: getReadHeaders() },
          );
          if (!res.ok) throw new Error("Error al obtener datos");
          return res.json();
        }),
      );
      const rows = pages.flat();
      voteSummaryCache.set(cacheKey, {
        expiresAt: Date.now() + VOTE_SUMMARY_CACHE_TTL,
        rows,
      });
      return rows;
    }

    const baseQuery = `?${siteFilter.slice(1)}${hotelFilter}`;

    // El resumen se calcula en el servidor para no transferir todos los votos al navegador.
    const summaryRows = await fetchAllPages(baseQuery, "hotel_slug");
    const counts: Record<string, number> = {};
    for (const vote of summaryRows) {
      const slug = canonicalHotelSlug(vote.hotel_slug);
      counts[slug] = (counts[slug] || 0) + 1;
    }
    const hotels = Object.entries(counts)
      .sort(([, first], [, second]) => second - first)
      .map(([hotelSlug, count]) => ({ hotelSlug, count }));
    const topHotels = hotels.slice(0, 10);

    if (groupBy === "hotel") {
      return NextResponse.json({
        ok: true,
        counts,
        total: summaryRows.length,
      });
    }

    if (exportCsv) {
      const csvRows = await fetchAllPages(
        `${baseQuery}&order=created_at.desc`,
        "hotel_slug,voter_name,voter_email,created_at,site,category,hearts",
      );
      const csvCell = (value: unknown) => {
        const text = String(value ?? "");
        return /[\r\n;\"]/.test(text)
          ? `"${text.replace(/\"/g, '""')}"`
          : text;
      };
      const lines = [
        [
          "hotel_slug",
          "hotel_nombre",
          "categoria",
          "hearts",
          "votante",
          "email",
          "fecha",
          "site",
        ].join(";"),
        ...csvRows.map((vote: any) =>
          [
            csvCell(vote.hotel_slug),
            csvCell(String(vote.hotel_slug || "").split("-").join(" ")),
            csvCell(vote.category),
            csvCell(vote.hearts),
            csvCell(vote.voter_name),
            csvCell(vote.voter_email),
            csvCell(vote.created_at),
            csvCell(vote.site),
          ].join(";"),
        ),
      ];
      return new NextResponse(`\uFEFF${lines.join("\r\n")}`, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="votos-${site}.csv"`,
        },
      });
    }

    const offset = (page - 1) * pageSize;
    const pageQuery = `${baseQuery}&order=created_at.desc&limit=${pageSize}&offset=${offset}`;
    const pageRes = await fetch(`${SUPABASE_URL}/rest/v1/votes${pageQuery}`, {
      headers: getReadHeaders(),
    });
    if (!pageRes.ok) throw new Error("Error al obtener datos");
    const votes = await pageRes.json();
    const contentRange = pageRes.headers.get("content-range") || "";
    const totalFromHeader = Number.parseInt(contentRange.split("/")[1] || "", 10);
    const total = Number.isFinite(totalFromHeader) ? totalFromHeader : summaryRows.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      ok: true,
      votes,
      total,
      page,
      pageSize,
      totalPages,
      totalHotels: Object.keys(counts).length,
      hotels,
      topHotels,
    });
  } catch (err: any) {
    console.error("[GET /api/votes]", err);
    return NextResponse.json(
      { error: "Error interno", message: err?.message },
      { status: 500 }
    );
  }
}
