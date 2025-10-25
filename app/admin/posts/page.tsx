"use client";

import data from "@/lib/data.json";
const hotelsData = data as any[];
import { Edit, Eye, Trash2, Plus, Search } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function PostsListPage() {
  const [query, setQuery] = useState("");
  const filtered = hotelsData.filter(
    (h) =>
      (h.es?.name || "").toLowerCase().includes(query.toLowerCase()) ||
      (h.slug || "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 lg:px-8 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <p className="text-gray-600 mt-1">
              {filtered.length} de {hotelsData.length} posts
            </p>
          </div>
          <Link href="/admin/posts/new">
            <Button className="bg-red-600 hover:bg-red-700 gap-2">
              <Plus size={20} />
              Crear nuevo post
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nombre o slug..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((hotel) => (
            <div
              key={hotel.slug}
              className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Image */}
              <div className="relative h-48 bg-gray-100">
                <Image
                  src={
                    hotel.images[0] || "/placeholder.svg?height=200&width=400"
                  }
                  alt={hotel.es.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {((hotel.categories as any[]) || [])
                    .slice(0, 2)
                    .map((cat: any) => (
                      <span
                        key={cat}
                        className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium text-gray-700"
                      >
                        {cat}
                      </span>
                    ))}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">
                  {hotel.es.name}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {hotel.es.subtitle}
                </p>
                <p className="text-xs text-gray-500 font-mono mb-4">
                  /{hotel.slug}
                </p>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/lugar/${hotel.slug}`}
                    target="_blank"
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 bg-transparent"
                    >
                      <Eye size={16} />
                      Ver
                    </Button>
                  </Link>
                  <Link
                    href={`/admin/posts/edit/${hotel.slug}`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      className="w-full gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Edit size={16} />
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                    onClick={() =>
                      alert("Funcionalidad de eliminar próximamente")
                    }
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No se encontraron posts</p>
          </div>
        )}
      </div>
    </div>
  );
}
