import { BaseReactive } from "./base";

export class ReactiveValue<Value> extends BaseReactive<Value> {
  private cachedValue: Value;

  constructor(value: Value) {
    super();
    this.cachedValue = value;
  }

  get value() {
    return this.cachedValue;
  }

  set value(value: Value) {
    if (value === this.cachedValue) {
      return;
    }
    this.cachedValue = value;
    this.notify();
  }
}

export function reactive<Value>(initialValue: Value) {
  return new ReactiveValue(initialValue);
}
