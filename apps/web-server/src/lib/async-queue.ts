export class AsyncQueue<T> implements AsyncIterable<T> {
  private readonly items: T[] = [];
  private readonly pending = new Set<(result: IteratorResult<T>) => void>();
  private closed = false;

  push(item: T): void {
    if (this.closed) return;
    const iterator = this.pending.values().next();
    if (!iterator.done) {
      this.pending.delete(iterator.value);
      iterator.value({ done: false, value: item });
      return;
    }
    this.items.push(item);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    for (const resolve of this.pending) {
      resolve({ done: true, value: undefined });
    }
    this.pending.clear();
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        if (this.items.length > 0) {
          const item = this.items.shift() as T;
          return Promise.resolve({ done: false, value: item });
        }
        if (this.closed) {
          return Promise.resolve({ done: true, value: undefined });
        }
        return new Promise<IteratorResult<T>>((resolve) => {
          this.pending.add(resolve);
        });
      },
    };
  }
}

