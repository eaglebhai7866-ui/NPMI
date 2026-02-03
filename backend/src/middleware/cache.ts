/**
 * Simple in-memory cache middleware for route responses
 */

interface CacheEntry {
  data: any;
  timestamp: number;
}

class RouteCache {
  private cache: Map<string, CacheEntry>;
  private maxAge: number; // milliseconds
  private maxSize: number;

  constructor(maxAge: number = 5 * 60 * 1000, maxSize: number = 100) {
    this.cache = new Map();
    this.maxAge = maxAge; // Default: 5 minutes
    this.maxSize = maxSize; // Default: 100 entries
  }

  /**
   * Generate cache key from route parameters
   */
  private generateKey(
    start: [number, number],
    end: [number, number],
    mode: string,
    alternatives: boolean
  ): string {
    // Round coordinates to 4 decimal places (~11m precision)
    const startRounded = start.map(c => c.toFixed(4)).join(',');
    const endRounded = end.map(c => c.toFixed(4)).join(',');
    return `${startRounded}|${endRounded}|${mode}|${alternatives}`;
  }

  /**
   * Get cached route if available and not expired
   */
  get(
    start: [number, number],
    end: [number, number],
    mode: string,
    alternatives: boolean
  ): any | null {
    const key = this.generateKey(start, end, mode, alternatives);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const age = Date.now() - entry.timestamp;
    if (age > this.maxAge) {
      // Expired - remove from cache
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Store route in cache
   */
  set(
    start: [number, number],
    end: [number, number],
    mode: string,
    alternatives: boolean,
    data: any
  ): void {
    // If cache is full, remove oldest entry
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    const key = this.generateKey(start, end, mode, alternatives);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached routes
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; maxAge: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      maxAge: this.maxAge,
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }
}

// Create singleton instance
export const routeCache = new RouteCache();

// Run cleanup every minute
setInterval(() => {
  routeCache.cleanup();
}, 60 * 1000);
