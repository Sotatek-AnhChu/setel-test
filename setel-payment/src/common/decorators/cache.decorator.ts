import * as LRUCache from "lru-cache";

const cache = new LRUCache({
    max: 1024,
    maxAge: 4096,
});

export type TTLFunction = (...args: any[]) => number;

/**
 * Cache function with custom key
 * @param key Cache key.
 * @param maxAge Maximum age in ms. Default is 4096.
 */
export const CacheNoArgs = ({ key, maxAge }: { key?: string; maxAge?: TTLFunction } = {}) => {
    return (target: Record<string, any>, propertyKey: string, descriptor: PropertyDescriptor) => {
        if (!key) {
            key = `${target.name || target.constructor?.name}|${propertyKey}`;
        }
        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            let result = cache.get(key);
            if (!result) {
                result = method.apply(this, args);
                maxAge ? cache.set(key, result, maxAge()) : cache.set(key, result);
            }
            return result;
        };
    };
};

/**
 * Cache function with different arguments
 * @param maxAge Maximum age in ms. Default is 4096.
 */
export const CacheArgs = (maxAge?: TTLFunction) => {
    return (target: Record<string, any>, propertyKey: string, descriptor: PropertyDescriptor) => {
        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            const key = `${target.name || target.constructor?.name}|${propertyKey}|${args
                .map((arg) => JSON.stringify(arg))
                .join("|")}`;
            let result = cache.get(key);
            if (!result) {
                result = method.apply(this, args);
                maxAge ? cache.set(key, result, maxAge()) : cache.set(key, result);
            }
            return result;
        };
    };
};
