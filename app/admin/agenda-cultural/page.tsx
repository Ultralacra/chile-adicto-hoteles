"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  ImageUp,
  ListPlus,
  Pencil,
  Plus,
  Save,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminApi } from "@/hooks/use-admin-api";

type Tab = "periods" | "assignments" | "featured";

const emptyPeriod = {
  label: "",
  period_start: "",
  period_end: "",
  status: "draft",
  active: true,
  sort_order: 0,
  title_es: "",
  title_en: "",
  desktop_image_url_es: "",
  desktop_image_url_en: "",
  mobile_image_url_es: "",
  mobile_image_url_en: "",
  alt_es: "",
  alt_en: "",
  href_es: "/agenda-cultural",
  href_en: "/agenda-cultural",
};

const emptyAssignment = {
  post_slug: "",
  banner_id: null as number | null,
  start_date: "",
  end_date: "",
  sort_order: 0,
  active: true,
};

const emptyFeatured = {
  post_slug: "",
  status: "published",
  start_date: "",
  end_date: "",
  sort_order: 0,
  desktop_image_url_es: "",
  desktop_image_url_en: "",
  mobile_image_url_es: "",
  mobile_image_url_en: "",
  alt_es: "",
  alt_en: "",
  href_es: "",
  href_en: "",
};

const tabMeta: Record<
  Tab,
  { label: string; description: string; icon: typeof CalendarRange }
> = {
  periods: {
    label: "Períodos",
    description: "Banners y ventanas de publicación",
    icon: CalendarRange,
  },
  assignments: {
    label: "Posts",
    description: "Eventos visibles en cada período",
    icon: ListPlus,
  },
  featured: {
    label: "Destacado",
    description: "La pieza principal de la agenda",
    icon: Sparkles,
  },
};

function normalizePayload(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value).map(([key, field]) => [
      key,
      typeof field === "string" && !field.trim() ? null : field,
    ]),
  );
}

export default function AdminAgendaCulturalPage() {
  const { fetchWithSite, currentSite } = useAdminApi();
  const [tab, setTab] = useState<Tab>("periods");
  const [periods, setPeriods] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [featured, setFeatured] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [periodForm, setPeriodForm] = useState<any>(emptyPeriod);
  const [assignmentForm, setAssignmentForm] = useState<any>(emptyAssignment);
  const [featuredForm, setFeaturedForm] = useState<any>(emptyFeatured);
  const [selectedPeriodId, setSelectedPeriodId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [agendaResponse, postsResponse] = await Promise.all([
        fetchWithSite("/api/agenda-cultural?all=1"),
        fetchWithSite(
          "/api/posts?categorySlug=agenda-cultural&includeExpired=1&adminSite=1",
        ),
      ]);
      const agenda = agendaResponse.ok ? await agendaResponse.json() : {};
      const postRows = postsResponse.ok ? await postsResponse.json() : [];
      setPeriods(Array.isArray(agenda.periods) ? agenda.periods : []);
      setAssignments(
        Array.isArray(agenda.assignments) ? agenda.assignments : [],
      );
      setFeatured(Array.isArray(agenda.featured) ? agenda.featured : []);
      setPosts(Array.isArray(postRows) ? postRows : []);
    } catch {
      setMessage("No se pudo cargar la configuración de Agenda Cultural.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [currentSite]);

  const save = async (entity: Tab, data: Record<string, unknown>) => {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetchWithSite("/api/agenda-cultural", {
        method: data.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity:
            entity === "periods"
              ? "period"
              : entity === "assignments"
                ? "assignment"
                : "featured",
          data: normalizePayload(data),
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result?.message || "No se pudo guardar.");
      setMessage("Cambios guardados.");
      setPeriodForm(emptyPeriod);
      setAssignmentForm(emptyAssignment);
      setFeaturedForm(emptyFeatured);
      await load();
    } catch (error) {
      setMessage(String((error as Error).message || error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (entity: Tab, id: number) => {
    if (
      !window.confirm(
        entity === "assignments"
          ? "¿Desvincular este post de Agenda Cultural? Se eliminará su programación y dejará de aparecer en los períodos relacionados."
          : "¿Eliminar este elemento? Esta acción no se puede deshacer.",
      )
    )
      return;
    const kind =
      entity === "periods"
        ? "period"
        : entity === "assignments"
          ? "assignment"
          : "featured";
    const response = await fetchWithSite(
      `/api/agenda-cultural?entity=${kind}&id=${id}`,
      { method: "DELETE" },
    );
    if (!response.ok) {
      setMessage("No se pudo eliminar el elemento.");
      return;
    }
    await load();
  };

  const selectedPeriod = periods.find(
    (period) => period.id === selectedPeriodId,
  );
  const periodAssignments = selectedPeriod
    ? assignments.filter((assignment) => {
        const periodStart = selectedPeriod.period_start || "0001-01-01";
        const periodEnd = selectedPeriod.period_end || "9999-12-31";
        const assignmentStart = assignment.start_date || "0001-01-01";
        const assignmentEnd = assignment.end_date || "9999-12-31";
        return assignmentStart <= periodEnd && periodStart <= assignmentEnd;
      })
    : [];

  const upload = async (file: File, setUrl: (url: string) => void) => {
    setSaving(true);
    try {
      const body = new FormData();
      body.append("files", file);
      const response = await fetchWithSite("/api/media/upload", {
        method: "POST",
        body,
      });
      const result = await response.json();
      const url = result?.urls?.[0];
      if (!response.ok || !url)
        throw new Error(result?.message || "No se pudo subir la imagen.");
      setUrl(url);
      setMessage("Imagen subida. Guarda el formulario para publicarla.");
    } catch (error) {
      setMessage(String((error as Error).message || error));
    } finally {
      setSaving(false);
    }
  };

  const imageField = (
    label: string,
    value: string,
    onChange: (url: string) => void,
  ) => (
    <div className="space-y-2 rounded-md border border-black/10 bg-[#fafaf8] p-3">
      <Label className="text-xs font-semibold uppercase tracking-[0.08em] text-[#555650]">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://..."
        />
        <label
          className="inline-flex shrink-0 cursor-pointer items-center justify-center border border-black/15 bg-white px-3 transition-colors hover:bg-black/5"
          title={`Subir ${label}`}
        >
          <ImageUp className="size-4" />
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file, onChange);
            }}
          />
        </label>
      </div>
      {value && (
        <img
          src={value}
          alt="Vista previa"
          className="h-20 w-full border border-black/10 bg-white object-contain"
        />
      )}
    </div>
  );

  const postTitle = (post: any) =>
    post?.es?.name || post?.en?.name || post?.slug || "Post sin nombre";

  const postImageUrl = (post: any) =>
    post?.featuredImage || post?.images?.[0] || null;

  const postPicker = (value: string, onChange: (slug: string) => void) => (
    <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto border border-black/10 bg-[#fafaf8] p-2 sm:grid-cols-2">
      {posts.map((post) => {
        const selected = post.slug === value;
        const imageUrl = postImageUrl(post);

        return (
          <button
            className={`flex min-h-16 items-center gap-3 border p-2 text-left transition-colors ${selected ? "border-[var(--color-brand-red)] bg-[#fff1f3]" : "border-black/10 bg-white hover:border-black/30 hover:bg-[#f7f7f4]"}`}
            key={post.slug}
            onClick={() => onChange(post.slug)}
            type="button"
          >
            {imageUrl ? (
              <img
                alt=""
                className="size-12 shrink-0 bg-[#ecece8] object-cover"
                src={imageUrl}
              />
            ) : (
              <div className="grid size-12 shrink-0 place-items-center bg-[#ecece8] text-[10px] font-semibold uppercase text-[#61625d]">
                Sin foto
              </div>
            )}
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                {postTitle(post)}
              </span>
              <span className="mt-0.5 block truncate text-xs text-[#61625d]">
                {post.slug}
              </span>
            </span>
          </button>
        );
      })}
      {posts.length === 0 && (
        <p className="p-3 text-sm text-[#61625d]">
          No hay posts de Agenda Cultural disponibles.
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-red)]">
            Programación editorial
          </p>
          <h1 className="flex items-center gap-2 font-neutra-demi text-3xl uppercase tracking-wide">
            <CalendarDays className="size-6 text-[var(--color-brand-red)]" />{" "}
            Agenda cultural
          </h1>
          <p className="mt-2 text-[#61625d]">
            Define los períodos, eventos y el contenido principal para{" "}
            {currentSite}.
          </p>
        </div>
        <div className="border border-black/10 bg-white px-3 py-2 text-xs text-[#61625d]">
          <span className="font-semibold text-[#20211f]">{periods.length}</span>{" "}
          períodos ·{" "}
          <span className="font-semibold text-[#20211f]">
            {assignments.length}
          </span>{" "}
          posts programados
        </div>
      </div>

      <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 sm:grid-cols-3">
        {(["periods", "assignments", "featured"] as Tab[]).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className={`flex min-h-[88px] items-start gap-3 p-4 text-left transition-colors ${tab === item ? "bg-[#22231f] text-white" : "bg-white text-[#20211f] hover:bg-[#f7f7f4]"}`}
          >
            {(() => {
              const Icon = tabMeta[item].icon;
              return (
                <Icon
                  className={`mt-0.5 size-5 ${tab === item ? "text-[#ff687d]" : "text-[var(--color-brand-red)]"}`}
                />
              );
            })()}
            <span>
              <span className="block font-neutra-demi uppercase tracking-wide">
                {tabMeta[item].label}
              </span>
              <span
                className={`mt-1 block text-xs ${tab === item ? "text-white/65" : "text-[#61625d]"}`}
              >
                {tabMeta[item].description}
              </span>
            </span>
          </button>
        ))}
      </div>

      {message && (
        <p className="flex items-center gap-2 border border-[#268477]/30 bg-[#eff8f5] px-3 py-2.5 text-sm text-[#276c61]">
          <CheckCircle2 className="size-4" />
          {message}
        </p>
      )}

      {tab === "periods" && (
        <section className="space-y-5">
          <form
            className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void save("periods", periodForm);
            }}
          >
            <div className="md:col-span-2 flex items-start justify-between border-b border-black/10 pb-4">
              <div>
                <h2 className="font-neutra-demi text-xl uppercase tracking-wide">
                  {periodForm.id ? "Editar período" : "Nuevo período"}
                </h2>
                <p className="mt-1 text-sm text-[#61625d]">
                  Un período define cuándo aparece un banner y qué eventos se
                  asocian a él.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nombre interno</Label>
              <Input
                value={periodForm.label || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, label: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={periodForm.status}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, status: event.target.value })
                }
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Inicio</Label>
              <Input
                type="date"
                required
                value={periodForm.period_start || ""}
                onChange={(event) =>
                  setPeriodForm({
                    ...periodForm,
                    period_start: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Término</Label>
              <Input
                type="date"
                required
                value={periodForm.period_end || ""}
                onChange={(event) =>
                  setPeriodForm({
                    ...periodForm,
                    period_end: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Título ES</Label>
              <Input
                value={periodForm.title_es || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, title_es: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Título EN</Label>
              <Input
                value={periodForm.title_en || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, title_en: event.target.value })
                }
              />
            </div>
            {imageField(
              "Banner desktop ES",
              periodForm.desktop_image_url_es || "",
              (url) =>
                setPeriodForm({ ...periodForm, desktop_image_url_es: url }),
            )}
            {imageField(
              "Banner desktop EN",
              periodForm.desktop_image_url_en || "",
              (url) =>
                setPeriodForm({ ...periodForm, desktop_image_url_en: url }),
            )}
            {imageField(
              "Banner móvil ES",
              periodForm.mobile_image_url_es || "",
              (url) =>
                setPeriodForm({ ...periodForm, mobile_image_url_es: url }),
            )}
            {imageField(
              "Banner móvil EN",
              periodForm.mobile_image_url_en || "",
              (url) =>
                setPeriodForm({ ...periodForm, mobile_image_url_en: url }),
            )}
            <div className="space-y-2">
              <Label>Texto alternativo ES</Label>
              <Input
                value={periodForm.alt_es || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, alt_es: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Texto alternativo EN</Label>
              <Input
                value={periodForm.alt_en || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, alt_en: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Enlace ES</Label>
              <Input
                value={periodForm.href_es || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, href_es: event.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Enlace EN</Label>
              <Input
                value={periodForm.href_en || ""}
                onChange={(event) =>
                  setPeriodForm({ ...periodForm, href_en: event.target.value })
                }
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button disabled={saving} type="submit">
                <Save className="mr-2 size-4" />
                Guardar período
              </Button>
              {periodForm.id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPeriodForm(emptyPeriod)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
          <div className="border border-black/10 bg-white">
            {loading ? (
              <p className="p-5 text-sm text-[#61625d]">Cargando...</p>
            ) : (
              periods.map((period) => (
                <div
                  key={period.id}
                  className="border-b border-black/10 last:border-b-0"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                    <button
                      type="button"
                      className="flex min-w-0 items-center gap-3 text-left"
                      onClick={() => {
                        setPeriodForm(period);
                        setSelectedPeriodId((current) =>
                          current === period.id ? null : period.id,
                        );
                      }}
                      aria-expanded={selectedPeriodId === period.id}
                    >
                      <div className="grid size-9 shrink-0 place-items-center bg-[#f3f3f1] text-[var(--color-brand-red)]">
                        <CalendarRange className="size-4" />
                      </div>
                      <span className="min-w-0">
                        <strong className="block truncate text-sm">
                          {period.label || period.title_es || "Sin nombre"}
                        </strong>
                        <span className="mt-0.5 block text-sm text-[#61625d]">
                          {period.period_start} a {period.period_end} ·{" "}
                          {
                            assignments.filter((assignment) => {
                              const assignmentStart =
                                assignment.start_date || "0001-01-01";
                              const assignmentEnd =
                                assignment.end_date || "9999-12-31";
                              return (
                                assignmentStart <=
                                  (period.period_end || "9999-12-31") &&
                                (period.period_start || "0001-01-01") <=
                                  assignmentEnd
                              );
                            }).length
                          }{" "}
                          posts relacionados
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${period.status === "published" ? "bg-[#e8f5ef] text-[#276c61]" : "bg-[#f4eee1] text-[#8d651e]"}`}
                      >
                        {period.status === "published"
                          ? "Publicado"
                          : "Borrador"}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setPeriodForm(period);
                          setSelectedPeriodId(period.id);
                        }}
                        title="Editar período"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => void remove("periods", period.id)}
                        title="Eliminar período"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                  {selectedPeriodId === period.id && (
                    <div className="border-t border-black/10 bg-[#fafaf8] px-4 py-3">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#61625d]">
                        Posts relacionados con este período
                      </p>
                      {periodAssignments.length > 0 ? (
                        <div className="space-y-2">
                          {periodAssignments.map((assignment) => {
                            const post = posts.find(
                              (item) => item.slug === assignment.post_slug,
                            );
                            return (
                              <div
                                className="flex flex-wrap items-center justify-between gap-3 border border-black/10 bg-white p-3"
                                key={assignment.id}
                              >
                                <div className="flex min-w-0 items-center gap-3">
                                  {postImageUrl(post) ? (
                                    <img
                                      src={postImageUrl(post) || undefined}
                                      alt=""
                                      className="size-14 shrink-0 bg-[#ecece8] object-cover"
                                    />
                                  ) : (
                                    <div className="grid size-14 shrink-0 place-items-center bg-[#ecece8] text-[10px] font-semibold uppercase text-[#61625d]">
                                      Sin foto
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <strong className="block truncate text-sm">
                                      {postTitle(post) || assignment.post_slug}
                                    </strong>
                                    <span className="block truncate text-xs text-[#61625d]">
                                      {assignment.post_slug} ·{" "}
                                      {assignment.start_date || "Sin inicio"} a{" "}
                                      {assignment.end_date || "Sin término"}
                                    </span>
                                  </div>
                                </div>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    void remove("assignments", assignment.id)
                                  }
                                >
                                  <Trash2 className="mr-2 size-4" />
                                  Desvincular
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-sm text-[#61625d]">
                          Este período no tiene posts relacionados.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {tab === "assignments" && (
        <section className="space-y-5">
          <form
            className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void save("assignments", assignmentForm);
            }}
          >
            <div className="md:col-span-2 border-b border-black/10 pb-4">
              <h2 className="font-neutra-demi text-xl uppercase tracking-wide">
                {assignmentForm.id ? "Editar programación" : "Programar post"}
              </h2>
              <p className="mt-1 text-sm text-[#61625d]">
                El evento aparecerá en cada período cuyo rango se cruce con
                estas fechas.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Post</Label>
              {postPicker(assignmentForm.post_slug || "", (post_slug) =>
                setAssignmentForm({ ...assignmentForm, post_slug }),
              )}
            </div>
            <div className="space-y-2">
              <Label>Visible desde</Label>
              <Input
                type="date"
                value={assignmentForm.start_date || ""}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    start_date: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Visible hasta</Label>
              <Input
                type="date"
                value={assignmentForm.end_date || ""}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    end_date: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Input
                type="number"
                value={assignmentForm.sort_order || 0}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    sort_order: Number(event.target.value),
                  })
                }
              />
            </div>
            <label className="flex items-center gap-2 pt-7">
              <input
                type="checkbox"
                checked={assignmentForm.active !== false}
                onChange={(event) =>
                  setAssignmentForm({
                    ...assignmentForm,
                    active: event.target.checked,
                  })
                }
              />{" "}
              Activo
            </label>
            <div className="flex gap-2 md:col-span-2">
              <Button disabled={saving} type="submit">
                <Plus className="mr-2 size-4" />
                Guardar programación
              </Button>
              {assignmentForm.id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAssignmentForm(emptyAssignment)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
          <div className="border border-black/10 bg-white">
            {assignments.map((assignment) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4 last:border-b-0"
                key={assignment.id}
              >
                <div>
                  <strong className="text-sm">
                    {posts.find((post) => post.slug === assignment.post_slug)
                      ?.es?.name || assignment.post_slug}
                  </strong>
                  <p className="mt-0.5 text-sm text-[#61625d]">
                    {assignment.start_date || "Sin inicio"} a{" "}
                    {assignment.end_date || "Sin término"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${assignment.active !== false ? "bg-[#e8f5ef] text-[#276c61]" : "bg-[#f3f3f1] text-[#61625d]"}`}
                  >
                    {assignment.active !== false ? "Activo" : "Pausado"}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setAssignmentForm(assignment)}
                    title="Editar programación"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void remove("assignments", assignment.id)}
                    title="Eliminar programación"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {assignments.length === 0 && (
              <p className="p-5 text-sm text-[#61625d]">
                Aún no hay posts programados.
              </p>
            )}
          </div>
        </section>
      )}

      {tab === "featured" && (
        <section className="space-y-5">
          <form
            className="grid gap-4 border border-black/10 bg-white p-5 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              void save("featured", featuredForm);
            }}
          >
            <div className="md:col-span-2 border-b border-black/10 pb-4">
              <h2 className="font-neutra-demi text-xl uppercase tracking-wide">
                {featuredForm.id
                  ? "Editar destacado"
                  : "Nuevo destacado global"}
              </h2>
              <p className="mt-1 text-sm text-[#61625d]">
                Se muestra antes de los períodos. Solo puede existir uno
                publicado por cada rango de fechas.
              </p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Post destacado</Label>
              {postPicker(featuredForm.post_slug || "", (post_slug) =>
                setFeaturedForm({ ...featuredForm, post_slug }),
              )}
            </div>
            <div className="space-y-2">
              <Label>Inicio</Label>
              <Input
                type="date"
                value={featuredForm.start_date || ""}
                onChange={(event) =>
                  setFeaturedForm({
                    ...featuredForm,
                    start_date: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Término</Label>
              <Input
                type="date"
                value={featuredForm.end_date || ""}
                onChange={(event) =>
                  setFeaturedForm({
                    ...featuredForm,
                    end_date: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={featuredForm.status}
                onChange={(event) =>
                  setFeaturedForm({
                    ...featuredForm,
                    status: event.target.value,
                  })
                }
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Input
                type="number"
                value={featuredForm.sort_order || 0}
                onChange={(event) =>
                  setFeaturedForm({
                    ...featuredForm,
                    sort_order: Number(event.target.value),
                  })
                }
              />
            </div>
            {imageField(
              "Banner desktop ES",
              featuredForm.desktop_image_url_es || "",
              (url) =>
                setFeaturedForm({ ...featuredForm, desktop_image_url_es: url }),
            )}
            {imageField(
              "Banner desktop EN",
              featuredForm.desktop_image_url_en || "",
              (url) =>
                setFeaturedForm({ ...featuredForm, desktop_image_url_en: url }),
            )}
            {imageField(
              "Banner móvil ES",
              featuredForm.mobile_image_url_es || "",
              (url) =>
                setFeaturedForm({ ...featuredForm, mobile_image_url_es: url }),
            )}
            {imageField(
              "Banner móvil EN",
              featuredForm.mobile_image_url_en || "",
              (url) =>
                setFeaturedForm({ ...featuredForm, mobile_image_url_en: url }),
            )}
            <div className="space-y-2">
              <Label>Texto alternativo ES</Label>
              <Input
                value={featuredForm.alt_es || ""}
                onChange={(event) =>
                  setFeaturedForm({
                    ...featuredForm,
                    alt_es: event.target.value,
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Texto alternativo EN</Label>
              <Input
                value={featuredForm.alt_en || ""}
                onChange={(event) =>
                  setFeaturedForm({
                    ...featuredForm,
                    alt_en: event.target.value,
                  })
                }
              />
            </div>
            <div className="flex gap-2 md:col-span-2">
              <Button disabled={saving} type="submit">
                <Save className="mr-2 size-4" />
                Guardar destacado
              </Button>
              {featuredForm.id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFeaturedForm(emptyFeatured)}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
          <div className="border border-black/10 bg-white">
            {featured.map((slot) => (
              <div
                className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 p-4 last:border-b-0"
                key={slot.id}
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-9 place-items-center bg-[#fff1f3] text-[var(--color-brand-red)]">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <strong className="text-sm">
                      {posts.find((post) => post.slug === slot.post_slug)?.es
                        ?.name || slot.post_slug}
                    </strong>
                    <p className="mt-0.5 text-sm text-[#61625d]">
                      {slot.start_date || "Sin inicio"} a{" "}
                      {slot.end_date || "Sin término"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${slot.status === "published" ? "bg-[#e8f5ef] text-[#276c61]" : "bg-[#f4eee1] text-[#8d651e]"}`}
                  >
                    {slot.status === "published" ? "Publicado" : "Borrador"}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setFeaturedForm(slot)}
                    title="Editar destacado"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => void remove("featured", slot.id)}
                    title="Eliminar destacado"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
            {featured.length === 0 && (
              <p className="p-5 text-sm text-[#61625d]">
                No hay destacado global programado.
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
