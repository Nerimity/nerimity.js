export class Collection<K, V> extends Map<K, V> {
  limit?: number;

  constructor(opts?: { limit?: number }) {
    super();
    this.limit = opts?.limit;
  }

  set(key: K, value: V): this {
    if (super.has(key)) {
      super.delete(key);
    }

    const result = super.set(key, value);

    if (this.limit && this.size > this.limit) {
      const lruKey = this.keys().next().value;

      if (lruKey) {
        super.delete(lruKey);
      }
    }

    return result;
  }

  get(key: K): V | undefined {
    const value = super.get(key);

    if (value && this.limit) {
      super.delete(key);
      super.set(key, value);
    }

    return value;
  }
}
