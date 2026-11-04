// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface Reactive<T = any, C = void> {
  value: T;
  subscribe(callback: SubscribeCallback<T, C>, signal?: AbortSignal): UnsubscribeCallback;
  unsubscribe(callback: SubscribeCallback<T, C>): void;
  disconnect(): void;
  derive<V>(transform: (input: T) => V, signal?: AbortSignal): ComputedReactive<V>;
}

export interface ComputedReactive<T> extends Reactive<T> {
  readonly value: T;
  markAsStale(): void;
}

export type SubscribeCallback<T, C = void> = (reactive: Reactive<T, C>, change: C) => void;
export type UnsubscribeCallback = () => boolean;

export type ReactiveType<T extends Reactive<unknown, unknown>> = T["value"];

export interface ListChange<Item> {
  readonly removed: readonly { item: Item; index: number }[];
  readonly added: readonly { item: Item; index: number }[];
  readonly moved: readonly { item: Item; from: number; index: number }[];
}

export type ReactiveList<T> = Reactive<readonly T[], ListChange<T>>;
