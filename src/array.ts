import { ReactiveValue } from "./value";

export class ReactiveArray<T> extends ReactiveValue<T[]> implements Iterable<T> {
  get length(): number {
    return this.value.length;
  }

  [Symbol.iterator]() {
    return this.value[Symbol.iterator]();
  }

  entries() {
    return this.value.entries();
  }

  keys() {
    return this.value.keys();
  }

  values() {
    return this.value.values();
  }

  find(...args: Parameters<typeof this.value.find>) {
    return this.value.find(...args);
  }

  findIndex(...args: Parameters<typeof this.value.findIndex>) {
    return this.value.findIndex(...args);
  }

  push(...args: Parameters<typeof this.value.push>) {
    const result = this.value.push(...args);
    this.notify();
    return result;
  }

  splice(...args: Parameters<typeof this.value.splice>) {
    const result = this.value.splice(...args);
    this.notify();
    return result;
  }

  /**
   * Removes all items from the array.
   */
  clear() {
    this.value = [];
  }

  /**
   * Replaces all items in the array.
   */
  replace(items: T[]) {
    this.value = items;
  }

  /**
   * Filters the array in place, keeping only items that match the predicate.
   */
  filter(predicate: (item: T, index: number, array: T[]) => boolean) {
    this.value = this.value.filter(predicate);
  }
}

export function array<T>(initialValue: T[]) {
  return new ReactiveArray(initialValue);
}
