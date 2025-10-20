"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import AdminRichText from "@/components/admin-rich-text";
import {
  ArrowLeft,
  ImageIcon,
  Globe,
  Instagram,
  LinkIcon,
  Phone,
  Tag,
  MapPin,
  Star,
  Plus,
  X,
} from "lucide-react";
import Link from "next/link";

const toSlug = (v: string) =>
  v
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default function NewPostPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"es" | "en">("es");

  // Form state
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [website, setWebsite] = useState("");
  const [instagram, setInstagram] = useState("");
  const [reservationLink, setReservationLink] = useState("");
  const [phone, setPhone] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [galleryImages, setGalleryImages] = useState<string[]>([""]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "TODOS",
  ]);

  // Spanish fields
  const [nameEs, setNameEs] = useState("");
  const [subtitleEs, setSubtitleEs] = useState("");
  const [descriptionEs, setDescriptionEs] = useState<string[]>([""]);
  const [categoryEs, setCategoryEs] = useState("");
  const [locationEs, setLocationEs] = useState("");
  const [distanceEs, setDistanceEs] = useState("");
  const [amenitiesEs, setAmenitiesEs] = useState<string[]>([""]);

  // English fields
  const [nameEn, setNameEn] = useState("");
  const [subtitleEn, setSubtitleEn] = useState("");
  const [descriptionEn, setDescriptionEn] = useState<string[]>([""]);
  const [categoryEn, setCategoryEn] = useState("");
  const [locationEn, setLocationEn] = useState("");
  const [distanceEn, setDistanceEn] = useState("");
  const [amenitiesEn, setAmenitiesEn] = useState<string[]>([""]);

  const addDescriptionField = (lang: "es" | "en") => {
    if (lang === "es") {
      setDescriptionEs([...descriptionEs, ""]);
    } else {
      setDescriptionEn([...descriptionEn, ""]);
    }
  };

  const removeDescriptionField = (lang: "es" | "en", index: number) => {
    if (lang === "es") {
      setDescriptionEs(descriptionEs.filter((_, i) => i !== index));
    } else {
      setDescriptionEn(descriptionEn.filter((_, i) => i !== index));
    }
  };

  const updateDescriptionField = (
    lang: "es" | "en",
    index: number,
    value: string
  ) => {
    if (lang === "es") {
      const newDesc = [...descriptionEs];
      newDesc[index] = value;
      setDescriptionEs(newDesc);
    } else {
      const newDesc = [...descriptionEn];
      newDesc[index] = value;
      setDescriptionEn(newDesc);
    }
  };

  const addAmenityField = (lang: "es" | "en") => {
    if (lang === "es") {
      setAmenitiesEs([...amenitiesEs, ""]);
    } else {
      setAmenitiesEn([...amenitiesEn, ""]);
    }
  };

  const removeAmenityField = (lang: "es" | "en", index: number) => {
    if (lang === "es") {
      setAmenitiesEs(amenitiesEs.filter((_, i) => i !== index));
    } else {
      setAmenitiesEn(amenitiesEn.filter((_, i) => i !== index));
    }
  };

  const updateAmenityField = (
    lang: "es" | "en",
    index: number,
    value: string
  ) => {
    if (lang === "es") {
      const newAmenities = [...amenitiesEs];
      newAmenities[index] = value;
      setAmenitiesEs(newAmenities);
    } else {
      const newAmenities = [...amenitiesEn];
      newAmenities[index] = value;
      setAmenitiesEn(newAmenities);
    }
  };

  const addGalleryImage = () => {
    setGalleryImages([...galleryImages, ""]);
  };

  const removeGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const updateGalleryImage = (index: number, value: string) => {
    const newImages = [...galleryImages];
    newImages[index] = value;
    setGalleryImages(newImages);
  };

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const allImages = [featuredImage, ...galleryImages].filter(
      (img) => img.trim() !== ""
    );

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
      phone,
      reservationLink,
      images: allImages,
      categories: selectedCategories,
    };

    console.log("New Hotel Data:", JSON.stringify(newHotel, null, 2));
    alert("Post creado! Revisa la consola para ver el JSON.");
  };

  const handleNameChange = (value: string) => {
    setNameEs(value);
    if (!slugTouched) {
      const s = toSlug(value || "");
      setSlug(s);
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
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Crear nuevo post
            </h1>
            <p className="text-gray-600 mt-1">
              Completa la información del lugar
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="text-red-600" size={20} />
              <h2 className="font-semibold text-lg">Información básica</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="slug" className="text-sm font-medium">
                  URL del post (slug) <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="hotel-nombre-ejemplo"
                  className="font-mono text-sm"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se genera automáticamente del nombre. Ejemplo: w-santiago
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Categorías <span className="text-red-600">*</span>
                </Label>
                <div className="flex flex-wrap gap-2">
                  {["TODOS", "SANTIAGO", "NORTE", "CENTRO", "SUR"].map(
                    (cat) => (
                      <label
                        key={cat}
                        className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedCategories.includes(cat)
                            ? "border-red-600 bg-red-50 text-red-700 font-medium"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat)}
                          onChange={() => toggleCategory(cat)}
                          className="sr-only"
                        />
                        {cat}
                      </label>
                    )
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Contact & Links */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="text-red-600" size={20} />
              <h2 className="font-semibold text-lg">Enlaces y contacto</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label
                  htmlFor="website"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Globe size={16} className="text-gray-400" />
                  Sitio web
                </Label>
                <Input
                  id="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div>
                <Label
                  htmlFor="instagram"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Instagram size={16} className="text-gray-400" />
                  Instagram
                </Label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@cuenta"
                />
              </div>
              <div>
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Phone size={16} className="text-gray-400" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+569xxxxxxxx"
                />
              </div>
              <div>
                <Label
                  htmlFor="reservationLink"
                  className="text-sm font-medium flex items-center gap-2"
                >
                  <Star size={16} className="text-gray-400" />
                  Link de reserva
                </Label>
                <Input
                  id="reservationLink"
                  value={reservationLink}
                  onChange={(e) => setReservationLink(e.target.value)}
                  placeholder="https://reservas.ejemplo.com"
                />
              </div>
            </div>
          </Card>

          {/* Images Section */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="text-red-600" size={20} />
              <h2 className="font-semibold text-lg">Imágenes</h2>
            </div>

            {/* Featured Image */}
            <div className="mb-6 p-4 bg-red-50 rounded-lg border-2 border-red-200">
              <Label
                htmlFor="featuredImage"
                className="text-sm font-semibold text-red-900 mb-2 block"
              >
                📌 Imagen destacada (portada){" "}
                <span className="text-red-600">*</span>
              </Label>
              <Input
                id="featuredImage"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="URL de la imagen principal"
                required
              />
              <p className="text-xs text-red-700 mt-1">
                Esta será la imagen principal que se muestra en la lista y
                portada del post
              </p>
            </div>

            {/* Gallery Images */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                🖼️ Galería de imágenes
              </Label>
              <p className="text-xs text-gray-500 mb-3">
                Imágenes adicionales que se mostrarán en la galería del post
              </p>
              <div className="space-y-2">
                {galleryImages.map((image, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={image}
                      onChange={(e) =>
                        updateGalleryImage(index, e.target.value)
                      }
                      placeholder={`URL de imagen ${index + 1}`}
                    />
                    {galleryImages.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeGalleryImage(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X size={16} />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addGalleryImage}
                  className="gap-2 bg-transparent"
                >
                  <Plus size={16} />
                  Agregar imagen a galería
                </Button>
              </div>
            </div>
          </Card>

          {/* Language Content */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Globe className="text-red-600" size={20} />
              <h2 className="font-semibold text-lg">Contenido</h2>
            </div>

            {/* Language Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                type="button"
                onClick={() => setActiveTab("es")}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === "es"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                🇨🇱 Español
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("en")}
                className={`px-6 py-3 font-medium transition-all ${
                  activeTab === "en"
                    ? "border-b-2 border-red-600 text-red-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                🇺🇸 English
              </button>
            </div>

            {activeTab === "es" ? (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="nameEs" className="text-sm font-medium">
                    Nombre del lugar <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="nameEs"
                    value={nameEs}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="W SANTIAGO"
                    className="text-lg"
                    required
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
                    placeholder="UN LUGAR PARA CONECTAR"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Descripción <span className="text-red-600">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    Puedes agregar múltiples bloques de texto con formato
                  </p>
                  {descriptionEs.map((desc, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Bloque {index + 1}
                        </span>
                        {descriptionEs.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDescriptionField("es", index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <AdminRichText
                        value={desc}
                        onChange={(html) =>
                          updateDescriptionField("es", index, html)
                        }
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDescriptionField("es")}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Agregar bloque de texto
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryEs" className="text-sm font-medium">
                      Categoría
                    </Label>
                    <Input
                      id="categoryEs"
                      value={categoryEs}
                      onChange={(e) => setCategoryEs(e.target.value)}
                      placeholder="HOTEL, ARQUITECTURA"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="locationEs"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <MapPin size={16} className="text-gray-400" />
                      Ubicación <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="locationEs"
                      value={locationEs}
                      onChange={(e) => setLocationEs(e.target.value)}
                      placeholder="SANTIAGO/BARRIO EL GOLF"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="distanceEs" className="text-sm font-medium">
                    Zona/Distancia <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="distanceEs"
                    value={distanceEs}
                    onChange={(e) => setDistanceEs(e.target.value)}
                    placeholder="EN EL CORAZÓN DE SANTIAGO"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Amenidades <span className="text-red-600">*</span>
                  </Label>
                  <div className="space-y-2">
                    {amenitiesEs.map((amenity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={amenity}
                          onChange={(e) =>
                            updateAmenityField("es", index, e.target.value)
                          }
                          placeholder={`Amenidad ${index + 1}`}
                          required
                        />
                        {amenitiesEs.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeAmenityField("es", index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAmenityField("es")}
                      className="gap-2"
                    >
                      <Plus size={16} />
                      Agregar amenidad
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <Label htmlFor="nameEn" className="text-sm font-medium">
                    Place Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="nameEn"
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="W SANTIAGO"
                    className="text-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subtitleEn" className="text-sm font-medium">
                    Subtitle <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="subtitleEn"
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    placeholder="A PLACE TO CONNECT"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Description <span className="text-red-600">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mb-3">
                    You can add multiple text blocks
                  </p>
                  {descriptionEn.map((desc, index) => (
                    <div key={index} className="mb-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600">
                          Block {index + 1}
                        </span>
                        {descriptionEn.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDescriptionField("en", index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={desc}
                        onChange={(e) =>
                          updateDescriptionField("en", index, e.target.value)
                        }
                        placeholder={`Paragraph ${index + 1}`}
                        rows={4}
                        required
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addDescriptionField("en")}
                    className="gap-2"
                  >
                    <Plus size={16} />
                    Add text block
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="categoryEn" className="text-sm font-medium">
                      Category
                    </Label>
                    <Input
                      id="categoryEn"
                      value={categoryEn}
                      onChange={(e) => setCategoryEn(e.target.value)}
                      placeholder="5-STAR HOTEL"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="locationEn"
                      className="text-sm font-medium flex items-center gap-2"
                    >
                      <MapPin size={16} className="text-gray-400" />
                      Location <span className="text-red-600">*</span>
                    </Label>
                    <Input
                      id="locationEn"
                      value={locationEn}
                      onChange={(e) => setLocationEn(e.target.value)}
                      placeholder="SANTIAGO/EL GOLF DISTRICT"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="distanceEn" className="text-sm font-medium">
                    Area/Distance <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="distanceEn"
                    value={distanceEn}
                    onChange={(e) => setDistanceEn(e.target.value)}
                    placeholder="IN THE HEART OF SANTIAGO"
                    required
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Amenities <span className="text-red-600">*</span>
                  </Label>
                  <div className="space-y-2">
                    {amenitiesEn.map((amenity, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          value={amenity}
                          onChange={(e) =>
                            updateAmenityField("en", index, e.target.value)
                          }
                          placeholder={`Amenity ${index + 1}`}
                          required
                        />
                        {amenitiesEn.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeAmenityField("en", index)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X size={16} />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAmenityField("en")}
                      className="gap-2"
                    >
                      <Plus size={16} />
                      Add amenity
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Submit Actions */}
          <div className="flex gap-4 sticky bottom-6 bg-white p-4 rounded-lg shadow-lg border">
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-red-600 hover:bg-red-700 gap-2"
            >
              <Plus size={20} />
              Crear post
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.push("/admin/posts")}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
