import { BaseReactive } from "./base";
import type { Reactive, UnsubscribeCallback, ReactiveType, SubscribeCallback } from "./types";

type ReactiveInputs = Record<string, Reactive<any, unknown>>;

type CombinedValue<T extends ReactiveInputs> = {
  [K in keyof T]: ReactiveType<T[K]>;
};

export class Combined<T extends ReactiveInputs, V> extends BaseReactive<V> {
  private readonly inputs: T;
  private readonly transform: (values: CombinedValue<T>) => V;
  private unsubscribeCallbacks?: UnsubscribeCallback[];

  private cachedValue?: V;
  private stale = true;

  constructor(inputs: T, transform: (values: CombinedValue<T>) => V) {
    super();
    this.inputs = inputs;
    this.transform = transform;
  }

  subscribe(callback: SubscribeCallback<V>, signal?: AbortSignal) {
    const result = super.subscribe(callback, signal);
    if (!this.unsubscribeCallbacks && this.subscribers.size > 0) {
      this.unsubscribeCallbacks = Object.values(this.inputs).map((input) =>
        input.subscribe(() => this.markAsStale()),
      );
    }
    return result;
  }

  unsubscribe(callback: SubscribeCallback<V>) {
    const result = super.unsubscribe(callback);
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
    return result;
  }

  private markAsStale() {
    this.stale = true;

    if (this.subscribers.size > 0) {
      this.notify();
    }
  }

  get value(): V {
    if (this.stale || !this.unsubscribeCallbacks) {
      const combined = {} as CombinedValue<T>;
      for (const [key, input] of Object.entries(this.inputs)) {
        combined[key as keyof T] = input.value;
      }
      this.cachedValue = this.transform(combined);
      this.stale = false;
    }
    return this.cachedValue as V;
  }

  disconnect() {
    super.disconnect();
    this.unsubscribeCallbacks?.forEach((unsubscribe) => unsubscribe());
    this.unsubscribeCallbacks = undefined;
  }
}

const identity = <T>(value: T): T => value;

export function combine<T extends ReactiveInputs>(inputs: T): Combined<T, CombinedValue<T>>;
export function combine<T extends ReactiveInputs, V>(
  inputs: T,
  transform: (values: CombinedValue<T>) => V,
): Combined<T, V>;
export function combine<T extends ReactiveInputs>(
  inputs: T,
  transform: (values: CombinedValue<T>) => CombinedValue<T> = identity,
) {
  return new Combined(inputs, transform);
}
