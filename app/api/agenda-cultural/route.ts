import { NextResponse } from "next/server";
import { z } from "zod";
import {
  agendaDateInChile,
  isActiveOnDate,
  mapAgendaFeaturedSlot,
  mapAgendaPeriod,
  rangesOverlap,
  type AgendaLanguage,
} from "@/lib/agenda-cultural";
import { getCurrentSiteId } from "@/lib/site-utils";
import { adminAuthResponse, requireSuperadmin } from "@/lib/server-auth";
import {
  getCachedServerData,
  invalidateServerDataCache,
} from "@/lib/server-read-cache";

export const runtime = "nodejs";

const AGENDA_CACHE_TTL_MS = 60 * 1000;

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional();
const optionalText = z.string().trim().max(2000).nullable().optional();

const periodSchema = z
  .object({
    id: z.number().int().positive().optional(),
    label: optionalText,
    period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    status: z.enum(["draft", "published"]).default("draft"),
    active: z.boolean().default(true),
    sort_order: z.number().int().default(0),
    title_es: optionalText,
    title_en: optionalText,
    desktop_image_url_es: optionalText,
    desktop_image_url_en: optionalText,
    mobile_image_url_es: optionalText,
    mobile_image_url_en: optionalText,
    alt_es: optionalText,
    alt_en: optionalText,
    href_es: optionalText,
    href_en: optionalText,
  })
  .refine((value) => value.period_start <= value.period_end, {
    message: "La fecha de inicio debe ser anterior o igual al término.",
    path: ["period_end"],
  });

const assignmentSchema = z
  .object({
    id: z.number().int().positive().optional(),
    post_id: z.string().uuid().nullable().optional(),
    post_slug: z.string().trim().min(1),
    banner_id: z.number().int().positive().nullable().optional(),
    start_date: dateField,
    end_date: dateField,
    sort_order: z.number().int().default(0),
    active: z.boolean().default(true),
  })
  .refine(
    (value) => !value.start_date || !value.end_date || value.start_date <= value.end_date,
    { message: "La fecha de inicio debe ser anterior o igual al término.", path: ["end_date"] },
  );

const featuredSchema = z
  .object({
    id: z.number().int().positive().optional(),
    post_id: z.string().uuid().nullable().optional(),
    post_slug: z.string().trim().min(1),
    status: z.enum(["draft", "published"]).default("draft"),
    start_date: dateField,
    end_date: dateField,
    sort_order: z.number().int().default(0),
    desktop_image_url_es: optionalText,
    desktop_image_url_en: optionalText,
    mobile_image_url_es: optionalText,
    mobile_image_url_en: optionalText,
    alt_es: optionalText,
    alt_en: optionalText,
    href_es: optionalText,
    href_en: optionalText,
  })
  .refine(
    (value) => !value.start_date || !value.end_date || value.start_date <= value.end_date,
    { message: "La fecha de inicio debe ser anterior o igual al término.", path: ["end_date"] },
  );

function envOrNull(name: string) {
  const value = process.env[name];
  return value?.trim() || null;
}

function hasServiceRole() {
  return !!envOrNull("NEXT_PUBLIC_SUPABASE_URL") && !!envOrNull("SUPABASE_SERVICE_ROLE_KEY");
}

async function supabaseRest(path: string, init?: RequestInit, mode: "anon" | "service" = "anon") {
  const base = envOrNull("NEXT_PUBLIC_SUPABASE_URL");
  const token = mode === "service" ? envOrNull("SUPABASE_SERVICE_ROLE_KEY") : envOrNull("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!base || !token) throw new Error("Supabase no está configurado para Agenda Cultural.");

  const response = await fetch(`${base}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: token,
      Authorization: `Bearer ${token}`,
      Prefer: "return=representation",
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Supabase error ${response.status}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

function adminResponseError(error: unknown) {
  const authResponse = adminAuthResponse(error);
  if (authResponse) return authResponse;
  const message = String((error as Error)?.message || error);
  const status = message === "unauthorized" ? 401 : message === "forbidden" ? 403 : 500;
  return NextResponse.json({ ok: false, error: status === 401 ? "unauthorized" : status === 403 ? "forbidden" : "internal_error", message }, { status });
}

async function loadRows(siteId: string, mode: "anon" | "service") {
  const [periods, assignments, featured] = await Promise.all([
    supabaseRest(`/agenda_banners?site=eq.${encodeURIComponent(siteId)}&select=*&order=period_start.asc,sort_order.asc`, undefined, mode),
    supabaseRest(`/agenda_assignments?site=eq.${encodeURIComponent(siteId)}&select=*&order=sort_order.asc,id.asc`, undefined, mode),
    supabaseRest(`/agenda_featured_slots?site=eq.${encodeURIComponent(siteId)}&select=*&order=sort_order.asc,id.asc`, undefined, mode),
  ]);
  return {
    periods: Array.isArray(periods) ? periods : [],
    assignments: Array.isArray(assignments) ? assignments : [],
    featured: Array.isArray(featured) ? featured : [],
  };
}

async function resolvePostId(siteId: string, postSlug: string, currentPostId?: string | null) {
  if (currentPostId) return currentPostId;
  const rows = (await supabaseRest(
    `/posts?site=eq.${encodeURIComponent(siteId)}&slug=eq.${encodeURIComponent(postSlug)}&select=id&limit=1`,
    undefined,
    "service",
  )) as Array<{ id?: string }>;
  const postId = rows?.[0]?.id;
  if (!postId) throw new Error("El post seleccionado no existe en este sitio.");
  return postId;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const siteId = await getCurrentSiteId(req);
    const language: AgendaLanguage = url.searchParams.get("lang") === "en" ? "en" : "es";
    const isAdmin = url.searchParams.has("adminSite") && url.searchParams.get("all") === "1";
    const postSlug = String(url.searchParams.get("postSlug") || "").trim();
    const periodId = Number(url.searchParams.get("periodId") || 0);
    if (isAdmin) await requireSuperadmin(req);

    const date = url.searchParams.get("date") || agendaDateInChile();
    const mode = hasServiceRole() ? "service" : "anon";
    const rows = await getCachedServerData(
      `agenda:${siteId}:${isAdmin ? "admin" : "public"}:${language}:${date}`,
      isAdmin ? 0 : AGENDA_CACHE_TTL_MS,
      () => loadRows(siteId, mode),
    );

    if (isAdmin) return NextResponse.json({ ...rows, date });

    const activeAssignments = rows.assignments.filter(
      (assignment: any) => assignment.active !== false,
    );
    const mappedPublishedPeriods = rows.periods
      .filter((period: any) => period.active !== false && period.status === "published")
      .map((period: any) => {
        const postSlugs = activeAssignments
          .filter((assignment: any) => rangesOverlap(period.period_start, period.period_end, assignment.start_date, assignment.end_date))
          .sort((left: any, right: any) => Number(left.sort_order || 0) - Number(right.sort_order || 0))
          .map((assignment: any) => String(assignment.post_slug || "").trim())
          .filter(Boolean);
        return mapAgendaPeriod(period, language, Array.from(new Set(postSlugs)));
      });
    const matchedPeriod = periodId
      ? mappedPublishedPeriods.find((period) => period.id === periodId) || null
      : postSlug
      ? mappedPublishedPeriods.find(
          (period) =>
            period.postSlugs.includes(postSlug) &&
            period.startDate <= date &&
            period.endDate >= date,
        ) ||
        mappedPublishedPeriods.find((period) => period.postSlugs.includes(postSlug)) ||
        null
      : null;
    const periods = mappedPublishedPeriods
      .filter((period: any) =>
        period.endDate >= date,
      );
    const featured = rows.featured
      .filter(
        (slot: any) =>
          slot.status === "published" &&
          (!slot.end_date || slot.end_date >= date),
      )
      .sort(
        (left: any, right: any) =>
          String(left.start_date || "9999-12-31").localeCompare(
            String(right.start_date || "9999-12-31"),
          ) || Number(left.sort_order || 0) - Number(right.sort_order || 0),
      )
      .map((slot: any) => mapAgendaFeaturedSlot(slot, language));

    return NextResponse.json({
      date,
      periods,
      matchedPeriod,
      featured,
    });
  } catch (error) {
    const authResponse = adminAuthResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ date: agendaDateInChile(), periods: [], featured: null, error: String((error as Error)?.message || error) }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    await requireSuperadmin(req);
    if (!hasServiceRole()) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurado");
    const siteId = await getCurrentSiteId(req);
    const body = await req.json();
    const entity = String(body?.entity || "");
    const schema = entity === "period" ? periodSchema : entity === "assignment" ? assignmentSchema : entity === "featured" ? featuredSchema : null;
    if (!schema) return NextResponse.json({ ok: false, error: "invalid_entity" }, { status: 400 });
    const payload = schema.parse(body?.data);
    const table = entity === "period" ? "agenda_banners" : entity === "assignment" ? "agenda_assignments" : "agenda_featured_slots";
    const postPayload = payload as z.infer<typeof assignmentSchema> | z.infer<typeof featuredSchema>;
    const withPostId =
      entity === "period"
        ? payload
        : { ...postPayload, post_id: await resolvePostId(siteId, postPayload.post_slug, postPayload.post_id) };
    const result = await supabaseRest(`/${table}`, { method: "POST", body: JSON.stringify({ ...withPostId, site: siteId }) }, "service");
    invalidateServerDataCache(new RegExp(`^agenda:${siteId}:`));
    return NextResponse.json({ ok: true, item: Array.isArray(result) ? result[0] : result }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: "validation_error", issues: error.issues }, { status: 400 });
    return adminResponseError(error);
  }
}

export async function PUT(req: Request) {
  try {
    await requireSuperadmin(req);
    if (!hasServiceRole()) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurado");
    const siteId = await getCurrentSiteId(req);
    const body = await req.json();
    const entity = String(body?.entity || "");
    const schema = entity === "period" ? periodSchema : entity === "assignment" ? assignmentSchema : entity === "featured" ? featuredSchema : null;
    if (!schema) return NextResponse.json({ ok: false, error: "invalid_entity" }, { status: 400 });
    const payload = schema.parse(body?.data);
    if (!payload.id) return NextResponse.json({ ok: false, error: "missing_id" }, { status: 400 });
    const table = entity === "period" ? "agenda_banners" : entity === "assignment" ? "agenda_assignments" : "agenda_featured_slots";
    const { id, ...update } = payload;
    const postPayload = update as z.infer<typeof assignmentSchema> | z.infer<typeof featuredSchema>;
    const withPostId =
      entity === "period"
        ? update
        : { ...postPayload, post_id: await resolvePostId(siteId, postPayload.post_slug, postPayload.post_id) };
    const result = await supabaseRest(`/${table}?id=eq.${id}&site=eq.${encodeURIComponent(siteId)}`, { method: "PATCH", body: JSON.stringify(withPostId) }, "service");
    invalidateServerDataCache(new RegExp(`^agenda:${siteId}:`));
    return NextResponse.json({ ok: true, item: Array.isArray(result) ? result[0] : result });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ ok: false, error: "validation_error", issues: error.issues }, { status: 400 });
    return adminResponseError(error);
  }
}

export async function DELETE(req: Request) {
  try {
    await requireSuperadmin(req);
    if (!hasServiceRole()) throw new Error("SUPABASE_SERVICE_ROLE_KEY no configurado");
    const siteId = await getCurrentSiteId(req);
    const url = new URL(req.url);
    const entity = url.searchParams.get("entity");
    const id = Number(url.searchParams.get("id"));
    const table = entity === "period" ? "agenda_banners" : entity === "assignment" ? "agenda_assignments" : entity === "featured" ? "agenda_featured_slots" : null;
    if (!table || !Number.isInteger(id) || id <= 0) return NextResponse.json({ ok: false, error: "invalid_request" }, { status: 400 });
    await supabaseRest(`/${table}?id=eq.${id}&site=eq.${encodeURIComponent(siteId)}`, { method: "DELETE" }, "service");
    invalidateServerDataCache(new RegExp(`^agenda:${siteId}:`));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return adminResponseError(error);
  }
}