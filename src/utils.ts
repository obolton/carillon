import { BaseReactive } from "./base";
import type { Reactive } from "./types";

export function isReactive<T>(value: unknown): value is Reactive<T> {
  return value instanceof BaseReactive;
}

export function unwrap<T>(value: T): T {
  while (isReactive<T>(value)) {
    value = value.value;
  }
  return value;
}
