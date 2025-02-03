interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
}

class CacheService {
  private cache: Map<string, { value: any; expires: number }> = new Map();

  set(key: string, value: any, options: CacheOptions = {}) {
    const expires = options.ttl ? Date.now() + options.ttl : Infinity;
    this.cache.set(key, { value, expires });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    if (item.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  delete(key: string) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  // Clean expired items
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (item.expires < now) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheService = new CacheService();

// Run cleanup every minute
setInterval(() => cacheService.cleanup(), 60000);

export default cacheService; 