"use client"

import { hotelsData } from "@/lib/hotels-data"
import { Edit, Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function PostsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Posts</h1>
          <p className="text-gray-600 mt-1">{hotelsData.length} total hotel posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-[var(--color-brand-red)] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium"
        >
          Create New Post
        </Link>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hotelsData.map((hotel) => (
              <tr key={hotel.slug} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src={hotel.images[0] || "/placeholder.svg"}
                      alt={hotel.es.name}
                      width={80}
                      height={60}
                      className="rounded object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{hotel.es.name}</p>
                      <p className="text-sm text-gray-500">{hotel.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {hotel.categories.map((cat) => (
                      <span key={cat} className="bg-gray-100 px-2 py-1 rounded text-xs font-medium text-gray-700">
                        {cat}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/hotel/${hotel.slug}`}
                      target="_blank"
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View"
                    >
                      <Eye size={18} />
                    </Link>
                    <Link
                      href={`/admin/posts/edit/${hotel.slug}`}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </Link>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                      onClick={() => alert("Delete functionality coming soon")}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
