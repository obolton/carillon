import { BaseReactive } from "./base";

export interface SetChange<T> {
  readonly added: readonly T[];
  readonly removed: readonly T[];
}

export class ReactiveSet<T>
  extends BaseReactive<ReadonlySet<T>, SetChange<T>>
  implements Iterable<T>
{
  private readonly items: Set<T>;

  constructor(items?: Iterable<T>) {
    super();
    this.items = new Set(items);
  }

  get value(): ReadonlySet<T> {
    return this.items;
  }

  get size(): number {
    return this.items.size;
  }

  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }

  entries() {
    return this.items.entries();
  }

  keys() {
    return this.items.keys();
  }

  values() {
    return this.items.values();
  }

  has(item: T) {
    return this.items.has(item);
  }

  add(...items: T[]) {
    const added: T[] = [];
    for (const item of items) {
      if (!this.items.has(item)) {
        this.items.add(item);
        added.push(item);
      }
    }
    if (added.length > 0) {
      this.notify({ added, removed: [] });
    }
  }

  delete(...items: T[]) {
    const removed: T[] = [];
    for (const item of items) {
      if (this.items.delete(item)) {
        removed.push(item);
      }
    }
    if (removed.length > 0) {
      this.notify({ added: [], removed });
    }
    return removed.length > 0;
  }

  toggle(item: T) {
    if (this.items.has(item)) {
      this.delete(item);
    } else {
      this.add(item);
    }
  }

  clear() {
    if (this.items.size === 0) {
      return;
    }
    const removed = Array.from(this.items);
    this.items.clear();
    this.notify({ added: [], removed });
  }

  replace(items: Iterable<T>) {
    const next = new Set(items);
    if (this.equals(next)) {
      return;
    }
    const added = next.difference(this.items);
    const removed = this.items.difference(next);
    this.items.clear();
    for (const item of next) {
      this.items.add(item);
    }
    this.notify({ added: Array.from(added), removed: Array.from(removed) });
  }

  private equals(items: ReadonlySet<T>): boolean {
    if (items.size !== this.items.size) {
      return false;
    }
    const current = this.items.values();
    for (const item of items) {
      if (current.next().value !== item) {
        return false;
      }
    }
    return true;
  }
}

export function set<T>(items?: Iterable<T>) {
  return new ReactiveSet(items);
}
