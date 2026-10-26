export type OptimizeImageOptions = {
  maxDimension?: number;
  quality?: number;
  maxBytes?: number;
};

const SUPPORTED_INPUT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const DEFAULT_MAX_DIMENSION = 2400;
const DEFAULT_QUALITY = 0.85;
const DEFAULT_MAX_BYTES = 3.5 * 1024 * 1024;

export function isSupportedImageFile(file: File): boolean {
  return SUPPORTED_INPUT_TYPES.has(String(file?.type || "").toLowerCase());
}

function replaceExtensionWithWebp(name: string): string {
  const clean = String(name || "imagen").trim() || "imagen";
  const withoutExt = clean.replace(/\.[^.]+$/, "");
  return `${withoutExt}.webp`;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality);
  });
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const context = canvas.getContext("2d");
  return { canvas, context };
}

async function loadSource(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        cleanup: () => bitmap.close(),
      };
    } catch {
      // Fallback a <img> más abajo.
    }
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = objectUrl;
    });
    return {
      source: image,
      width: image.naturalWidth || image.width,
      height: image.naturalHeight || image.height,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

/**
 * Redimensiona y convierte una imagen a WebP antes de subirla.
 * Si no se puede optimizar, devuelve el archivo original.
 */
export async function optimizeImageForUpload(
  file: File,
  options: OptimizeImageOptions = {},
): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Formato no soportado. Usa JPG, PNG, WebP o AVIF.");
  }
  if (typeof document === "undefined" || typeof window === "undefined") {
    return file;
  }

  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;
  const initialQuality = options.quality ?? DEFAULT_QUALITY;
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;

  let loaded: Awaited<ReturnType<typeof loadSource>>
  try {
    loaded = await loadSource(file);
  } catch {
    // El navegador no pudo decodificarla; se sube el original.
    return file;
  }

  try {
    const { source, width, height } = loaded;
    if (!width || !height) return file;

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    let targetWidth = Math.max(1, Math.round(width * scale));
    let targetHeight = Math.max(1, Math.round(height * scale));

    let { canvas, context } = createCanvas(targetWidth, targetHeight);
    if (!context) return file;
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(source, 0, 0, targetWidth, targetHeight);

    let quality = initialQuality;
    let blob = await canvasToBlob(canvas, "image/webp", quality);
    let attempts = 0;

    while (blob && blob.size > maxBytes && attempts < 6) {
      attempts += 1;
      quality = Math.max(0.5, quality - 0.08);
      if (attempts % 2 === 0) {
        targetWidth = Math.max(1, Math.round(targetWidth * 0.85));
        targetHeight = Math.max(1, Math.round(targetHeight * 0.85));
        const resized = createCanvas(targetWidth, targetHeight);
        if (!resized.context) break;
        resized.context.imageSmoothingEnabled = true;
        resized.context.imageSmoothingQuality = "high";
        resized.context.drawImage(
          canvas,
          0,
          0,
          targetWidth,
          targetHeight,
        );
        canvas = resized.canvas;
        context = resized.context;
      }
      blob = await canvasToBlob(canvas, "image/webp", quality);
    }

    if (!blob) return file;
    if (blob.size >= file.size) return file;

    return new File([blob], replaceExtensionWithWebp(file.name), {
      type: "image/webp",
      lastModified: Date.now(),
    });
  } finally {
    loaded.cleanup();
  }
}
