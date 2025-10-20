import { hotelsData } from "@/lib/hotels-data"
import { notFound } from "next/navigation"
import Link from "next/link"

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const hotel = hotelsData.find((h) => h.slug === slug)

  if (!hotel) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-gray-600 mt-1">Editing: {hotel.es.name}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Edit functionality coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          This will allow you to edit all hotel details including bilingual content, images, and categories.
        </p>

        <div className="mt-6">
          <Link
            href="/admin/posts"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            ← Back to Posts
          </Link>
        </div>
      </div>
    </div>
  )
}
