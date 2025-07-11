import { Injectable } from '@nestjs/common';

@Injectable()
export class ReviewCacheService {
    private readonly cache = new Map<string, any>();

    set(commitId: string, data: any) {
        this.cache.set(commitId, data);
    }

    get(commitId: string): any | undefined {
        return this.cache.get(commitId);
    }

    has(commitId: string): boolean {
        return this.cache.has(commitId);
    }

    getAll(): Record<string, any> {
        return Object.fromEntries(this.cache);
    }

    clear(commitId: string): void {
        this.cache.delete(commitId);
    }
}
