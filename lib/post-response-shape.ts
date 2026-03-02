export function ensureLegacyPostShape(post: any) {
  const websitePublic =
    post?.websitePublic ?? post?.websitepublic ?? post?.website_public ?? null;

  return {
    slug: post?.slug ?? "",
    site: post?.site ?? null,
    publicationStatus: post?.publicationStatus ?? "published",
    publishStartAt: post?.publishStartAt ?? null,
    publishEndAt: post?.publishEndAt ?? null,
    publicationEndsAt:
      post?.publicationEndsAt ?? post?.publishEndAt ?? post?.publish_end_at ?? null,
    featuredImage: post?.featuredImage ?? null,
    website: post?.website ?? null,
    websitePublic,
    websitepublic: websitePublic,
    website_public: websitePublic,
    instagram: post?.instagram ?? null,
    website_display: post?.website_display ?? null,
    instagram_display: post?.instagram_display ?? null,
    email: post?.email ?? null,
    phone: post?.phone ?? null,
    photosCredit: post?.photosCredit ?? null,
    address: post?.address ?? null,
    hours: post?.hours ?? null,
    reservationLink: post?.reservationLink ?? null,
    reservationPolicy: post?.reservationPolicy ?? null,
    interestingFact: post?.interestingFact ?? null,
    images: Array.isArray(post?.images) ? post.images : [],
    locations: Array.isArray(post?.locations) ? post.locations : [],
    es: {
      name: post?.es?.name ?? "",
      subtitle: post?.es?.subtitle ?? "",
      description: Array.isArray(post?.es?.description) ? post.es.description : [],
      infoHtml: post?.es?.infoHtml ?? null,
      infoHtmlNew: post?.es?.infoHtmlNew ?? null,
      category: post?.es?.category ?? null,
    },
    en: {
      name: post?.en?.name ?? "",
      subtitle: post?.en?.subtitle ?? "",
      description: Array.isArray(post?.en?.description) ? post.en.description : [],
      infoHtml: post?.en?.infoHtml ?? null,
      infoHtmlNew: post?.en?.infoHtmlNew ?? null,
      category: post?.en?.category ?? null,
    },
    categories: Array.isArray(post?.categories) ? post.categories : [],
    communes: Array.isArray(post?.communes) ? post.communes : [],
  };
}
