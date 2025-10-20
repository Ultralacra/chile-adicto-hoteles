"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

export default function NewPostPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"es" | "en">("es")

  // Form state
  const [slug, setSlug] = useState("")
  const [website, setWebsite] = useState("")
  const [instagram, setInstagram] = useState("")
  const [reservationLink, setReservationLink] = useState("")
  const [images, setImages] = useState<string[]>([""])
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["TODOS"])

  // Spanish fields
  const [nameEs, setNameEs] = useState("")
  const [subtitleEs, setSubtitleEs] = useState("")
  const [descriptionEs, setDescriptionEs] = useState<string[]>([""])
  const [categoryEs, setCategoryEs] = useState("")
  const [locationEs, setLocationEs] = useState("")
  const [distanceEs, setDistanceEs] = useState("")
  const [amenitiesEs, setAmenitiesEs] = useState<string[]>([""])

  // English fields
  const [nameEn, setNameEn] = useState("")
  const [subtitleEn, setSubtitleEn] = useState("")
  const [descriptionEn, setDescriptionEn] = useState<string[]>([""])
  const [categoryEn, setCategoryEn] = useState("")
  const [locationEn, setLocationEn] = useState("")
  const [distanceEn, setDistanceEn] = useState("")
  const [amenitiesEn, setAmenitiesEn] = useState<string[]>([""])

  const addDescriptionField = (lang: "es" | "en") => {
    if (lang === "es") {
      setDescriptionEs([...descriptionEs, ""])
    } else {
      setDescriptionEn([...descriptionEn, ""])
    }
  }

  const removeDescriptionField = (lang: "es" | "en", index: number) => {
    if (lang === "es") {
      setDescriptionEs(descriptionEs.filter((_, i) => i !== index))
    } else {
      setDescriptionEn(descriptionEn.filter((_, i) => i !== index))
    }
  }

  const updateDescriptionField = (lang: "es" | "en", index: number, value: string) => {
    if (lang === "es") {
      const newDesc = [...descriptionEs]
      newDesc[index] = value
      setDescriptionEs(newDesc)
    } else {
      const newDesc = [...descriptionEn]
      newDesc[index] = value
      setDescriptionEn(newDesc)
    }
  }

  const addAmenityField = (lang: "es" | "en") => {
    if (lang === "es") {
      setAmenitiesEs([...amenitiesEs, ""])
    } else {
      setAmenitiesEn([...amenitiesEn, ""])
    }
  }

  const removeAmenityField = (lang: "es" | "en", index: number) => {
    if (lang === "es") {
      setAmenitiesEs(amenitiesEs.filter((_, i) => i !== index))
    } else {
      setAmenitiesEn(amenitiesEn.filter((_, i) => i !== index))
    }
  }

  const updateAmenityField = (lang: "es" | "en", index: number, value: string) => {
    if (lang === "es") {
      const newAmenities = [...amenitiesEs]
      newAmenities[index] = value
      setAmenitiesEs(newAmenities)
    } else {
      const newAmenities = [...amenitiesEn]
      newAmenities[index] = value
      setAmenitiesEn(newAmenities)
    }
  }

  const addImageField = () => {
    setImages([...images, ""])
  }

  const removeImageField = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const updateImageField = (index: number, value: string) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newHotel = {
      slug,
      es: {
        name: nameEs,
        subtitle: subtitleEs,
        description: descriptionEs.filter((d) => d.trim() !== ""),
        category: categoryEs,
        location: locationEs,
        distance: distanceEs,
        amenities: amenitiesEs.filter((a) => a.trim() !== ""),
      },
      en: {
        name: nameEn,
        subtitle: subtitleEn,
        description: descriptionEn.filter((d) => d.trim() !== ""),
        category: categoryEn,
        location: locationEn,
        distance: distanceEn,
        amenities: amenitiesEn.filter((a) => a.trim() !== ""),
      },
      website,
      instagram,
      reservationLink,
      images: images.filter((img) => img.trim() !== ""),
      categories: selectedCategories,
    }

    console.log("New Hotel Data:", JSON.stringify(newHotel, null, 2))
    alert("Hotel data generated! Check console for JSON output.")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl">Crear Nuevo Post</h1>
        <p className="text-muted-foreground">Complete todos los campos para crear un nuevo hotel</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Information */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Información General</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="slug">Slug (URL) *</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="hotel-nombre-ejemplo"
                required
              />
              <p className="text-muted-foreground text-sm mt-1">
                Ejemplo: w-santiago, luciano-k-hotel (sin espacios, minúsculas)
              </p>
            </div>

            <div>
              <Label htmlFor="website">Sitio Web *</Label>
              <Input
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="WWW.EJEMPLO.COM"
                required
              />
            </div>

            <div>
              <Label htmlFor="instagram">Instagram *</Label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="@NOMBREHOTEL"
                required
              />
            </div>

            <div>
              <Label htmlFor="reservationLink">Link de Reserva *</Label>
              <Input
                id="reservationLink"
                value={reservationLink}
                onChange={(e) => setReservationLink(e.target.value)}
                placeholder="https://reservas.ejemplo.com"
                required
              />
              <p className="text-muted-foreground text-sm mt-1">Este link se usará en el botón RESERVA del post</p>
            </div>
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Categorías</h2>
          <div className="flex flex-wrap gap-4">
            {["TODOS", "SANTIAGO", "NORTE", "CENTRO", "SUR"].map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </Card>

        {/* Language Tabs */}
        <Card className="p-6">
          <div className="flex gap-2 mb-6 border-b">
            <button
              type="button"
              onClick={() => setActiveTab("es")}
              className={`px-4 py-2 font-medium ${
                activeTab === "es" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500"
              }`}
            >
              🇨🇱 Español
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("en")}
              className={`px-4 py-2 font-medium ${
                activeTab === "en" ? "border-b-2 border-red-600 text-red-600" : "text-gray-500"
              }`}
            >
              🇺🇸 English
            </button>
          </div>

          {activeTab === "es" ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Contenido en Español</h3>

              <div>
                <Label htmlFor="nameEs">Nombre del Hotel *</Label>
                <Input
                  id="nameEs"
                  value={nameEs}
                  onChange={(e) => setNameEs(e.target.value)}
                  placeholder="W SANTIAGO"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitleEs">Subtítulo *</Label>
                <Input
                  id="subtitleEs"
                  value={subtitleEs}
                  onChange={(e) => setSubtitleEs(e.target.value)}
                  placeholder="UN LUGAR PARA CONECTAR"
                  required
                />
              </div>

              <div>
                <Label>Descripción (Párrafos) *</Label>
                {descriptionEs.map((desc, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={desc}
                      onChange={(e) => updateDescriptionField("es", index, e.target.value)}
                      placeholder={`Párrafo ${index + 1}`}
                      rows={3}
                      required
                    />
                    {descriptionEs.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDescriptionField("es", index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addDescriptionField("es")}>
                  + Agregar Párrafo
                </Button>
              </div>

              <div>
                <Label htmlFor="categoryEs">Categoría del Hotel *</Label>
                <Input
                  id="categoryEs"
                  value={categoryEs}
                  onChange={(e) => setCategoryEs(e.target.value)}
                  placeholder="HOTEL 5 ESTRELLAS"
                  required
                />
              </div>

              <div>
                <Label htmlFor="locationEs">Ubicación *</Label>
                <Input
                  id="locationEs"
                  value={locationEs}
                  onChange={(e) => setLocationEs(e.target.value)}
                  placeholder="UBICACIÓN: SANTIAGO/BARRIO EL GOLF"
                  required
                />
              </div>

              <div>
                <Label htmlFor="distanceEs">Distancia/Zona *</Label>
                <Input
                  id="distanceEs"
                  value={distanceEs}
                  onChange={(e) => setDistanceEs(e.target.value)}
                  placeholder="EN EL CORAZÓN DE SANTIAGO"
                  required
                />
              </div>

              <div>
                <Label>Amenidades *</Label>
                {amenitiesEs.map((amenity, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={amenity}
                      onChange={(e) => updateAmenityField("es", index, e.target.value)}
                      placeholder={`Amenidad ${index + 1}`}
                      required
                    />
                    {amenitiesEs.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAmenityField("es", index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addAmenityField("es")}>
                  + Agregar Amenidad
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">English Content</h3>

              <div>
                <Label htmlFor="nameEn">Hotel Name *</Label>
                <Input
                  id="nameEn"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="W SANTIAGO"
                  required
                />
              </div>

              <div>
                <Label htmlFor="subtitleEn">Subtitle *</Label>
                <Input
                  id="subtitleEn"
                  value={subtitleEn}
                  onChange={(e) => setSubtitleEn(e.target.value)}
                  placeholder="A PLACE TO CONNECT"
                  required
                />
              </div>

              <div>
                <Label>Description (Paragraphs) *</Label>
                {descriptionEn.map((desc, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Textarea
                      value={desc}
                      onChange={(e) => updateDescriptionField("en", index, e.target.value)}
                      placeholder={`Paragraph ${index + 1}`}
                      rows={3}
                      required
                    />
                    {descriptionEn.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeDescriptionField("en", index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addDescriptionField("en")}>
                  + Add Paragraph
                </Button>
              </div>

              <div>
                <Label htmlFor="categoryEn">Hotel Category *</Label>
                <Input
                  id="categoryEn"
                  value={categoryEn}
                  onChange={(e) => setCategoryEn(e.target.value)}
                  placeholder="5-STAR HOTEL"
                  required
                />
              </div>

              <div>
                <Label htmlFor="locationEn">Location *</Label>
                <Input
                  id="locationEn"
                  value={locationEn}
                  onChange={(e) => setLocationEn(e.target.value)}
                  placeholder="LOCATION: SANTIAGO/EL GOLF DISTRICT"
                  required
                />
              </div>

              <div>
                <Label htmlFor="distanceEn">Distance/Area *</Label>
                <Input
                  id="distanceEn"
                  value={distanceEn}
                  onChange={(e) => setDistanceEn(e.target.value)}
                  placeholder="IN THE HEART OF SANTIAGO"
                  required
                />
              </div>

              <div>
                <Label>Amenities *</Label>
                {amenitiesEn.map((amenity, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      value={amenity}
                      onChange={(e) => updateAmenityField("en", index, e.target.value)}
                      placeholder={`Amenity ${index + 1}`}
                      required
                    />
                    {amenitiesEn.length > 1 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAmenityField("en", index)}
                      >
                        ✕
                      </Button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={() => addAmenityField("en")}>
                  + Add Amenity
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Images */}
        <Card className="p-6">
          <h2 className="font-semibold text-lg mb-4">Imágenes</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">La primera imagen será la imagen destacada (portada)</p>
            {images.map((image, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={image}
                  onChange={(e) => updateImageField(index, e.target.value)}
                  placeholder={`URL de imagen ${index + 1}`}
                  required
                />
                {images.length > 1 && (
                  <Button type="button" variant="destructive" size="sm" onClick={() => removeImageField(index)}>
                    ✕
                  </Button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={addImageField}>
              + Agregar Imagen
            </Button>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" size="lg" className="bg-red-600 hover:bg-red-700">
            Generar JSON del Hotel
          </Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.push("/admin/posts")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
