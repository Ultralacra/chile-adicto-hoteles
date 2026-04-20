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
    categoryFeaturedImages:
      post?.categoryFeaturedImages &&
      typeof post.categoryFeaturedImages === "object" &&
      !Array.isArray(post.categoryFeaturedImages)
        ? post.categoryFeaturedImages
        : {},
    communes: Array.isArray(post?.communes) ? post.communes : [],
  };
}

function isMissingScalar(value: any) {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

function pickScalar(primary: any, fallback: any) {
  return isMissingScalar(primary) ? fallback : primary;
}

function pickArray(primary: any, fallback: any) {
  const a = Array.isArray(primary) ? primary : [];
  const b = Array.isArray(fallback) ? fallback : [];
  return a.length > 0 ? a : b;
}

export function mergeLegacyPostMissingValues(primaryPost: any, fallbackPost: any) {
  const primary = ensureLegacyPostShape(primaryPost);
  const fallback = ensureLegacyPostShape(fallbackPost);

  return ensureLegacyPostShape({
    ...primary,
    featuredImage: pickScalar(primary.featuredImage, fallback.featuredImage),
    website: pickScalar(primary.website, fallback.website),
    websitePublic: pickScalar(primary.websitePublic, fallback.websitePublic),
    instagram: pickScalar(primary.instagram, fallback.instagram),
    website_display: pickScalar(primary.website_display, fallback.website_display),
    instagram_display: pickScalar(primary.instagram_display, fallback.instagram_display),
    email: pickScalar(primary.email, fallback.email),
    phone: pickScalar(primary.phone, fallback.phone),
    photosCredit: pickScalar(primary.photosCredit, fallback.photosCredit),
    address: pickScalar(primary.address, fallback.address),
    hours: pickScalar(primary.hours, fallback.hours),
    reservationLink: pickScalar(primary.reservationLink, fallback.reservationLink),
    reservationPolicy: pickScalar(primary.reservationPolicy, fallback.reservationPolicy),
    interestingFact: pickScalar(primary.interestingFact, fallback.interestingFact),
    images: pickArray(primary.images, fallback.images),
    locations: pickArray(primary.locations, fallback.locations),
    categories: pickArray(primary.categories, fallback.categories),
    categoryFeaturedImages:
      primary.categoryFeaturedImages && Object.keys(primary.categoryFeaturedImages).length > 0
        ? primary.categoryFeaturedImages
        : fallback.categoryFeaturedImages || {},
    communes: pickArray(primary.communes, fallback.communes),
    es: {
      ...primary.es,
      name: pickScalar(primary.es?.name, fallback.es?.name),
      subtitle: pickScalar(primary.es?.subtitle, fallback.es?.subtitle),
      description: pickArray(primary.es?.description, fallback.es?.description),
      infoHtml: pickScalar(primary.es?.infoHtml, fallback.es?.infoHtml),
      infoHtmlNew: pickScalar(primary.es?.infoHtmlNew, fallback.es?.infoHtmlNew),
      category: pickScalar(primary.es?.category, fallback.es?.category),
    },
    en: {
      ...primary.en,
      name: pickScalar(primary.en?.name, fallback.en?.name),
      subtitle: pickScalar(primary.en?.subtitle, fallback.en?.subtitle),
      description: pickArray(primary.en?.description, fallback.en?.description),
      infoHtml: pickScalar(primary.en?.infoHtml, fallback.en?.infoHtml),
      infoHtmlNew: pickScalar(primary.en?.infoHtmlNew, fallback.en?.infoHtmlNew),
      category: pickScalar(primary.en?.category, fallback.en?.category),
    },
  });
}
