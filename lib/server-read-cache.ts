type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

type CacheStore = Map<string, CacheEntry>;
type InflightStore = Map<string, Promise<unknown>>;

type GlobalWithServerCache = typeof globalThis & {
  __serverReadCache?: CacheStore;
  __serverReadInflight?: InflightStore;
};

const globalWithServerCache = globalThis as GlobalWithServerCache;

const cache = globalWithServerCache.__serverReadCache ?? new Map<string, CacheEntry>();
const inflight =
  globalWithServerCache.__serverReadInflight ??
  new Map<string, Promise<unknown>>();

globalWithServerCache.__serverReadCache = cache;
globalWithServerCache.__serverReadInflight = inflight;

function cloneValue<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
}

export async function getCachedServerData<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<T> {
  if (ttlMs <= 0) {
    return loader();
  }

  const cached = cache.get(key);
  if (cached && Date.now() < cached.expiresAt) {
    return cloneValue(cached.data as T);
  }

  const existing = inflight.get(key);
  if (existing) {
    return cloneValue((await existing) as T);
  }

  const pending = (async () => {
    try {
      const data = await loader();
      cache.set(key, {
        data: cloneValue(data),
        expiresAt: Date.now() + ttlMs,
      });
      return data;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, pending as Promise<unknown>);
  return cloneValue(await pending);
}

export function invalidateServerDataCache(keyOrPattern?: string | RegExp): void {
  if (!keyOrPattern) {
    cache.clear();
    inflight.clear();
    return;
  }

  if (typeof keyOrPattern === "string") {
    cache.delete(keyOrPattern);
    inflight.delete(keyOrPattern);
    return;
  }

  for (const key of Array.from(cache.keys())) {
    if (keyOrPattern.test(key)) {
      cache.delete(key);
    }
  }

  for (const key of Array.from(inflight.keys())) {
    if (keyOrPattern.test(key)) {
      inflight.delete(key);
    }
  }
}