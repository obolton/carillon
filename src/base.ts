import type {
  Reactive,
  ComputedReactive,
  UnsubscribeCallback,
  ReactiveType,
  SubscribeCallback,
} from "./types";

type NotifyArgs<Change> = [Change] extends [void] ? [] : [change: Change];

export abstract class BaseReactive<Value, Change = void> implements Reactive<Value, Change> {
  protected readonly subscribers = new Set<SubscribeCallback<Value, Change>>();

  subscribe(callback: SubscribeCallback<Value, Change>, signal?: AbortSignal) {
    this.subscribers.add(callback);
    const unsubscriber = () => this.unsubscribe(callback);
    signal?.addEventListener("abort", unsubscriber, {
      passive: true,
      once: true,
    });
    return unsubscriber;
  }

  unsubscribe(callback: SubscribeCallback<Value, Change>) {
    return this.subscribers.delete(callback);
  }

  disconnect() {
    this.subscribers.clear();
  }

  notify(...args: NotifyArgs<Change>) {
    const change = args[0] as Change;
    for (const subscriber of this.subscribers) {
      subscriber(this, change);
    }
  }

  abstract get value(): Value;

  derive<DerivedValue>(transform: (input: Value) => DerivedValue): ComputedReactive<DerivedValue> {
    return new Computed(this, transform);
  }
}

export class Computed<Input extends Reactive<unknown, unknown>, Value> extends BaseReactive<Value> {
  private readonly input: Input;
  private readonly transform: (value: ReactiveType<Input>) => Value;
  private unsubscribeCallback?: UnsubscribeCallback;

  private cachedValue?: Value;
  private stale = true;

  constructor(input: Input, transform: (value: ReactiveType<Input>) => Value) {
    super();
    this.input = input;
    this.transform = transform;
  }

  subscribe(callback: SubscribeCallback<Value>, signal?: AbortSignal) {
    const result = super.subscribe(callback, signal);
    if (!this.unsubscribeCallback && this.subscribers.size > 0) {
      this.unsubscribeCallback = this.input.subscribe(() => this.markAsStale());
      this.stale = true;
    }
    return result;
  }

  unsubscribe(callback: SubscribeCallback<Value>) {
    const result = super.unsubscribe(callback);
    if (this.subscribers.size === 0) {
      this.disconnect();
    }
    return result;
  }

  markAsStale() {
    this.stale = true;

    if (this.subscribers.size > 0) {
      const previousValue = this.cachedValue;
      if (previousValue !== this.value) {
        this.notify();
      }
    }
  }

  get value() {
    if (!this.unsubscribeCallback || this.stale) {
      this.cachedValue = this.transform(this.input.value);
      this.stale = false;
    }
    return this.cachedValue as Value;
  }

  disconnect() {
    super.disconnect();
    this.unsubscribeCallback?.();
    this.unsubscribeCallback = undefined;
  }
}
