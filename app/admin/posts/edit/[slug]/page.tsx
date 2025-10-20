"use client";

import arquitecturaData from "@/lib/arquitectura.json";
import { notFound, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AdminRichText from "@/components/admin-rich-text";
import { ArrowLeft, Save, Tag, Globe, Plus, X } from "lucide-react";

export default function EditPostPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const { slug } = params;
  const hotel = (arquitecturaData as any[]).find((p) => p.slug === slug);

  if (!hotel) {
    notFound();
  }

  // Local editable state (pre-filled)
  const [nameEs, setNameEs] = useState(hotel?.es?.name || "");
  const [subtitleEs, setSubtitleEs] = useState(hotel?.es?.subtitle || "");
  const [descriptionEs, setDescriptionEs] = useState<string[]>(
    hotel?.es?.description || [""]
  );
  const [categories, setCategories] = useState<string[]>(
    hotel?.categories || ["TODOS"]
  );

  const handleSave = () => {
    const updated = {
      slug: hotel.slug,
      es: { name: nameEs, subtitle: subtitleEs, description: descriptionEs },
      categories,
    };
    console.log("Updated post:", JSON.stringify(updated, null, 2));
    alert("Cambios guardados! Revisa la consola para ver el JSON actualizado.");
  };

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin/posts">
            <Button variant="outline" size="icon">
              <ArrowLeft size={20} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900">Editar post</h1>
            <p className="text-gray-600 mt-1">{hotel.es.name}</p>
          </div>
          <Button
            onClick={handleSave}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Save size={20} />
            Guardar cambios
          </Button>
        </div>

        {/* Basic Info */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Información básica</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nameEs" className="text-sm font-medium">
                Nombre del lugar <span className="text-red-600">*</span>
              </Label>
              <Input
                id="nameEs"
                value={nameEs}
                onChange={(e) => setNameEs(e.target.value)}
                className="text-lg"
              />
            </div>

            <div>
              <Label htmlFor="subtitleEs" className="text-sm font-medium">
                Subtítulo <span className="text-red-600">*</span>
              </Label>
              <Input
                id="subtitleEs"
                value={subtitleEs}
                onChange={(e) => setSubtitleEs(e.target.value)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">
                Categorías <span className="text-red-600">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {["TODOS", "SANTIAGO", "NORTE", "CENTRO", "SUR"].map((cat) => (
                  <label
                    key={cat}
                    className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                      categories.includes(cat)
                        ? "border-green-600 bg-green-50 text-green-700 font-medium"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                      className="sr-only"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="text-green-600" size={20} />
            <h2 className="font-semibold text-lg">Descripción</h2>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Puedes agregar múltiples bloques de texto con formato
            </p>
            {descriptionEs.map((d, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">
                    Bloque {i + 1}
                  </span>
                  {descriptionEs.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setDescriptionEs(
                          descriptionEs.filter((_, idx) => idx !== i)
                        );
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
                <AdminRichText
                  value={d}
                  onChange={(html) => {
                    const arr = [...descriptionEs];
                    arr[i] = html;
                    setDescriptionEs(arr);
                  }}
                />
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDescriptionEs([...descriptionEs, ""])}
              className="gap-2"
            >
              <Plus size={16} />
              Agregar bloque de texto
            </Button>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700 gap-2"
          >
            <Save size={20} />
            Guardar cambios
          </Button>
          <Button variant="outline" onClick={() => router.push("/admin/posts")}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
